import dns from 'node:dns/promises';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export type VerificationStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'OFFLINE'
  | 'BROKEN'
  | 'NEEDS REVIEW';

interface VerifyStreamRequest {
  url: string;
  stationName?: string;
  stationCity?: string;
}

interface VerifyStreamResult {
  ok: boolean;
  url: string;
  finalUrl: string;
  httpStatus: number;
  contentType: string;
  icyName: string | null;
  streamFormat: string;
  bytesRead: number;
  latencyMs: number;
  verificationStatus: VerificationStatus;
  error: string | null;
  notes: string;
  checkedAt: string;
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true; // Multicast & reserved
  return false;
}

function isPrivateIp(address: string): boolean {
  const lower = address.toLowerCase();
  if (net.isIPv4(lower)) {
    return isPrivateIPv4(lower);
  }
  if (net.isIPv6(lower)) {
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('::ffff:')) {
      return isPrivateIPv4(lower.slice(7));
    }
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true; // ULA
    if (lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) {
      return true; // Link-local
    }
    if (lower.startsWith('ff')) return true; // Multicast
    return false;
  }
  return true;
}

async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    throw new Error('Invalid stream URL syntax');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Only HTTP/HTTPS stream URLs are permitted');
  }
  if (parsed.username || parsed.password) {
    throw new Error('URLs with embedded credentials are not allowed');
  }

  const host = parsed.hostname.toLowerCase();
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost')
  ) {
    throw new Error('Local or internal hostnames are blocked');
  }

  if (net.isIP(host)) {
    if (isPrivateIp(host)) {
      throw new Error('Private or loopback IP addresses are blocked');
    }
    return parsed;
  }

  const lookups = await dns.lookup(host, { all: true });
  if (!lookups.length) {
    throw new Error('Hostname could not be resolved');
  }
  for (const entry of lookups) {
    if (isPrivateIp(entry.address)) {
      throw new Error('Resolved IP address belongs to a restricted network range');
    }
  }
  return parsed;
}

function detectStreamFormat(url: string, contentType: string, textSample: string): string {
  const ct = contentType.toLowerCase();
  const u = url.toLowerCase();
  if (
    ct.includes('mpegurl') ||
    u.includes('.m3u8') ||
    textSample.trimStart().startsWith('#EXTM3U')
  ) {
    return 'HLS';
  }
  if (ct.includes('audio/aac') || ct.includes('aacp') || u.endsWith('.aac')) {
    return 'AAC';
  }
  if (ct.includes('audio/mpeg') || ct.includes('audio/mp3') || u.includes('.mp3')) {
    return 'MP3';
  }
  if (ct.includes('ogg') || ct.includes('opus')) {
    return ct.includes('opus') ? 'OPUS' : 'OGG';
  }
  if (ct.includes('audio/') || ct.includes('application/ogg')) {
    return 'Audio Stream';
  }
  return 'Unknown';
}

function isSuspiciousIcyMismatch(icyName: string | null, stationName?: string): boolean {
  if (!icyName || !stationName) return false;
  const normalizedIcy = icyName.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const stopWords = new Set(['fm', 'am', 'radio', 'station', 'nigeria', 'live', 'stream', 'the', 'and', 'abuja', 'lagos']);
  const tokens = stationName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !stopWords.has(w));

  if (tokens.length === 0) return false;
  // Generic Shoutcast/Icecast/broadcaster defaults are not mismatches on their own
  if (
    normalizedIcy.includes('my radio') ||
    normalizedIcy.includes('no name') ||
    normalizedIcy.includes('online radio') ||
    normalizedIcy.includes('freeshoutcast') ||
    normalizedIcy.includes('this is my server name') ||
    normalizedIcy.includes('radionigeria') ||
    normalizedIcy.includes('radioboss') ||
    normalizedIcy.includes('db91 tx') ||
    normalizedIcy.includes('solutionx') ||
    normalizedIcy.includes('icecast') ||
    normalizedIcy.includes('azuracast') ||
    /^\d+$/.test(normalizedIcy.trim()) ||
    normalizedIcy.trim().length < 3
  ) {
    return false;
  }
  const hasTokenMatch = tokens.some((tok) => normalizedIcy.includes(tok));
  return !hasTokenMatch;
}

async function verifySingleStream(
  rawUrl: string,
  stationName?: string,
  stationCity?: string,
): Promise<VerifyStreamResult> {
  const startedAt = Date.now();
  const checkedAt = new Date().toISOString();

  if (!rawUrl || !rawUrl.trim()) {
    return {
      ok: false,
      url: rawUrl,
      finalUrl: rawUrl,
      httpStatus: 0,
      contentType: '',
      icyName: null,
      streamFormat: 'Offline',
      bytesRead: 0,
      latencyMs: 0,
      verificationStatus: 'OFFLINE',
      error: 'No stream URL configured',
      notes: 'Station has no active stream URL.',
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timeoutMs = 12500;
  let timer: ReturnType<typeof setTimeout> | null = null;

  // Follow redirects safely outside inner loop so each hop gets its own AbortController
  const executeWithRedirects = async (): Promise<VerifyStreamResult> => {
    let target = rawUrl;
    for (let attempt = 0; attempt < 5; attempt++) {
      const hopController = new AbortController();
      const hopParsed = await assertSafePublicUrl(target);
      try {
        const res = await fetch(hopParsed.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: AbortSignal.any([controller.signal, hopController.signal]),
          headers: {
            'User-Agent': BROWSER_UA,
            Accept: 'audio/mpeg, audio/aac, application/vnd.apple.mpegurl, audio/*;q=0.9, */*;q=0.8',
            'Icy-MetaData': '1',
          },
        });

        if (res.status >= 300 && res.status < 400) {
          const loc = res.headers.get('location');
          try {
            hopController.abort();
          } catch {
            // ignore
          }
          if (!loc) {
            return {
              ok: false,
              url: rawUrl,
              finalUrl: hopParsed.toString(),
              httpStatus: res.status,
              contentType: '',
              icyName: null,
              streamFormat: 'Unknown',
              bytesRead: 0,
              latencyMs: Date.now() - startedAt,
              verificationStatus: 'BROKEN',
              error: `HTTP ${res.status} redirect with missing Location header`,
              notes: 'Broken redirect chain',
              checkedAt,
            };
          }
          target = new URL(loc, hopParsed).toString();
          continue;
        }

        const httpStatus = res.status;
        const contentType = res.headers.get('content-type') || '';
        const icyName = res.headers.get('icy-name');
        const finalUrl = hopParsed.toString();

        if (httpStatus >= 400) {
          try {
            hopController.abort();
          } catch {
            // ignore
          }
          return {
            ok: false,
            url: rawUrl,
            finalUrl,
            httpStatus,
            contentType,
            icyName,
            streamFormat: 'Unknown',
            bytesRead: 0,
            latencyMs: Date.now() - startedAt,
            verificationStatus: httpStatus === 404 || httpStatus === 410 ? 'BROKEN' : 'OFFLINE',
            error: `Streaming server returned HTTP ${httpStatus}`,
            notes: `HTTP ${httpStatus} on ${hopParsed.hostname}`,
            checkedAt,
          };
        }

        let bytesRead = 0;
        const chunks: Uint8Array[] = [];
        const reader = res.body?.getReader();
        if (reader) {
          while (bytesRead < 8192) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value && value.byteLength > 0) {
              chunks.push(value);
              bytesRead += value.byteLength;
            }
            if (
              bytesRead >= 2048 &&
              !contentType.toLowerCase().includes('mpegurl') &&
              !finalUrl.toLowerCase().includes('.m3u8')
            ) {
              break;
            }
          }
          try {
            hopController.abort();
          } catch {
            // ignore abort on active audio stream
          }
        }

        const combined = Buffer.concat(chunks.map((c) => Buffer.from(c)));
        const textSample = combined.slice(0, 1024).toString('utf8');
        const trimmedLower = textSample.trimStart().toLowerCase();

        if (
          contentType.toLowerCase().includes('text/html') ||
          trimmedLower.startsWith('<!doctype') ||
          trimmedLower.startsWith('<html')
        ) {
          return {
            ok: false,
            url: rawUrl,
            finalUrl,
            httpStatus,
            contentType,
            icyName,
            streamFormat: 'HTML Webpage',
            bytesRead,
            latencyMs: Date.now() - startedAt,
            verificationStatus: 'BROKEN',
            error: 'Endpoint returned an HTML webpage rather than audio',
            notes: `HTML response from ${hopParsed.hostname}`,
            checkedAt,
          };
        }

        const streamFormat = detectStreamFormat(finalUrl, contentType, textSample);

        if (streamFormat === 'HLS') {
          const hasM3u = textSample.includes('#EXTM3U');
          const hasSeg =
            textSample.includes('#EXT-X-') ||
            textSample.includes('.ts') ||
            textSample.includes('.aac') ||
            textSample.includes('.m3u8');
          return {
            ok: hasM3u && hasSeg,
            url: rawUrl,
            finalUrl,
            httpStatus,
            contentType,
            icyName,
            streamFormat: 'HLS',
            bytesRead,
            latencyMs: Date.now() - startedAt,
            verificationStatus: hasM3u && hasSeg ? 'VERIFIED' : 'BROKEN',
            error: hasM3u && hasSeg ? null : 'HLS playlist invalid or missing segments',
            notes:
              hasM3u && hasSeg
                ? `HLS manifest verified (${bytesRead} bytes in ${Date.now() - startedAt}ms)`
                : 'HLS playlist failed validation',
            checkedAt,
          };
        }

        if (bytesRead < 512) {
          return {
            ok: false,
            url: rawUrl,
            finalUrl,
            httpStatus,
            contentType,
            icyName,
            streamFormat,
            bytesRead,
            latencyMs: Date.now() - startedAt,
            verificationStatus: 'OFFLINE',
            error: `Stream produced insufficient audio data (${bytesRead} bytes)`,
            notes: 'Connection opened but no audio stream payload arrived',
            checkedAt,
          };
        }

        const suspicious = isSuspiciousIcyMismatch(icyName, stationName);
        return {
          ok: true,
          url: rawUrl,
          finalUrl,
          httpStatus,
          contentType,
          icyName,
          streamFormat,
          bytesRead,
          latencyMs: Date.now() - startedAt,
          verificationStatus: suspicious ? 'NEEDS REVIEW' : 'VERIFIED',
          error: suspicious
            ? `Stream header ("${icyName}") differs from expected station "${stationName}"`
            : null,
          notes: `${streamFormat} verified (${bytesRead} bytes, ${Date.now() - startedAt}ms${icyName ? `, icy: "${icyName}"` : ''}${stationCity ? `, ${stationCity}` : ''})`,
          checkedAt,
        };
      } catch (err) {
        try {
          hopController.abort();
        } catch {
          // ignore
        }
        throw err;
      }
    }

    return {
      ok: false,
      url: rawUrl,
      finalUrl: target,
      httpStatus: 0,
      contentType: '',
      icyName: null,
      streamFormat: 'Unknown',
      bytesRead: 0,
      latencyMs: Date.now() - startedAt,
      verificationStatus: 'BROKEN',
      error: 'Too many HTTP redirects',
      notes: 'Exceeded maximum redirect limit (5)',
      checkedAt,
    };
  };

  const timeoutPromise = new Promise<VerifyStreamResult>((resolve) => {
    timer = setTimeout(() => {
      try {
        controller.abort();
      } catch {
        // ignore
      }
      resolve({
        ok: false,
        url: rawUrl,
        finalUrl: rawUrl,
        httpStatus: 0,
        contentType: '',
        icyName: null,
        streamFormat: 'Unknown',
        bytesRead: 0,
        latencyMs: Date.now() - startedAt,
        verificationStatus: 'OFFLINE',
        error: 'Connection timed out after 12.5s',
        notes: 'Server timed out or dropped packets',
        checkedAt,
      });
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([executeWithRedirects(), timeoutPromise]);
    if (timer) clearTimeout(timer);
    return result;
  } catch (err) {
    if (timer) clearTimeout(timer);
    const msg = err instanceof Error ? err.message : 'Stream verification failed';
    const isValidationFailure =
      msg.includes('blocked') ||
      msg.includes('restricted') ||
      msg.includes('Invalid stream URL') ||
      msg.includes('permitted') ||
      msg.includes('credentials');
    return {
      ok: false,
      url: rawUrl,
      finalUrl: rawUrl,
      httpStatus: 0,
      contentType: '',
      icyName: null,
      streamFormat: 'Unknown',
      bytesRead: 0,
      latencyMs: Date.now() - startedAt,
      verificationStatus: isValidationFailure ? 'BROKEN' : 'OFFLINE',
      error: msg,
      notes: msg,
      checkedAt,
    };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/verify-stream', async (req: Request, res: Response) => {
    const body = req.body as Partial<VerifyStreamRequest> | undefined;
    if (!body || typeof body.url !== 'string') {
      res.status(400).json({ error: 'Missing required "url" string' });
      return;
    }

    const result = await verifySingleStream(
      body.url,
      typeof body.stationName === 'string' ? body.stationName.slice(0, 120) : undefined,
      typeof body.stationCity === 'string' ? body.stationCity.slice(0, 80) : undefined,
    );
    res.json(result);
  });

  app.post('/api/verify-batch', async (req: Request, res: Response) => {
    const items = Array.isArray(req.body?.items) ? req.body.items : null;
    if (!items || items.length === 0 || items.length > 15) {
      res.status(400).json({ error: 'Provide an "items" array with 1 to 15 stations' });
      return;
    }

    const results: Array<{ id: string; result: VerifyStreamResult }> = [];
    for (const item of items) {
      const id = typeof item?.id === 'string' ? item.id.slice(0, 80) : '';
      const url = typeof item?.url === 'string' ? item.url : '';
      const stationName = typeof item?.stationName === 'string' ? item.stationName.slice(0, 120) : undefined;
      const stationCity = typeof item?.stationCity === 'string' ? item.stationCity.slice(0, 80) : undefined;

      const result = await verifySingleStream(url, stationName, stationCity);
      results.push({ id, result });

      // Respectful spacing for Zeno.FM rate limits
      if (url.toLowerCase().includes('zeno.fm')) {
        await new Promise((r) => setTimeout(r, 380));
      }
    }

    res.json({ results });
  });

  // Safe SSRF-protected audio stream proxy for HTTP-only or CORS/redirect-sensitive broadcasters
  app.get('/api/stream-proxy', async (req: Request, res: Response) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    if (!rawUrl || rawUrl.length > 1000) {
      res.status(400).json({ error: 'Invalid stream url parameter' });
      return;
    }

    const upstreamController = new AbortController();
    let clientClosed = false;
    let connectTimer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      try {
        upstreamController.abort();
      } catch {
        // ignore
      }
    }, 15000);

    const clearConnectTimer = () => {
      if (connectTimer) {
        clearTimeout(connectTimer);
        connectTimer = null;
      }
    };

    req.on('close', () => {
      clientClosed = true;
      clearConnectTimer();
      try {
        upstreamController.abort();
      } catch {
        // ignore
      }
    });

    try {
      let currentTarget = rawUrl;
      let upstream: globalThis.Response | null = null;
      let finalParsed: URL | null = null;

      for (let hop = 0; hop < 5; hop++) {
        const parsed = await assertSafePublicUrl(currentTarget);
        finalParsed = parsed;
        const attempt = await fetch(parsed.toString(), {
          method: 'GET',
          redirect: 'manual',
          signal: upstreamController.signal,
          headers: {
            'User-Agent': BROWSER_UA,
            Accept: 'audio/mpeg, audio/aac, audio/*;q=0.9, */*;q=0.8',
          },
        });

        if (attempt.status >= 300 && attempt.status < 400) {
          const loc = attempt.headers.get('location');
          try {
            await attempt.body?.cancel();
          } catch {
            // ignore
          }
          if (!loc) {
            clearConnectTimer();
            res.status(502).json({ error: 'Broken upstream redirect' });
            return;
          }
          currentTarget = new URL(loc, parsed).toString();
          continue;
        }
        upstream = attempt;
        break;
      }

      clearConnectTimer();

      if (!upstream || upstream.status >= 400 || !upstream.body) {
        res.status(502).json({ error: 'Upstream audio stream unavailable' });
        return;
      }

      let ct = (upstream.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      if (ct.includes('text/html')) {
        try {
          upstreamController.abort();
        } catch {
          // ignore
        }
        res.status(502).json({ error: 'Upstream returned HTML instead of audio' });
        return;
      }

      if (!ct || ct === 'application/octet-stream') {
        const lowerPath = (finalParsed?.pathname || rawUrl).toLowerCase();
        if (lowerPath.endsWith('.aac')) ct = 'audio/aac';
        else if (lowerPath.endsWith('.ogg') || lowerPath.endsWith('.opus')) ct = 'audio/ogg';
        else ct = 'audio/mpeg';
      } else if (ct === 'audio/aacp') {
        ct = 'audio/aac';
      }

      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'no-store, no-transform');
      res.setHeader('Accept-Ranges', 'none');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Content-Type-Options', 'nosniff');

      const reader = upstream.body.getReader();
      while (!clientClosed) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) {
          if (!res.write(Buffer.from(value))) {
            await new Promise<void>((resolve) => res.once('drain', resolve));
          }
        }
      }
      if (!res.writableEnded) res.end();
    } catch {
      clearConnectTimer();
      if (!clientClosed && !res.headersSent) {
        res.status(502).json({ error: 'Unable to proxy audio stream' });
      } else if (!res.writableEnded) {
        res.end();
      }
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Naija Radio server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
