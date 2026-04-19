// Pure training crawlers — serve stub content
const AI_TRAINING_PATTERNS = [
  'GPTBot',
  'ClaudeBot',
  'Claude-Web',
  'CCBot',
  'anthropic-ai',
  'Google-Extended',
  'Bytespider',
  'Diffbot',
  'Applebot-Extended',
  'Amazonbot',
  'FacebookBot',
  'meta-externalagent',
  'cohere-ai',
  'Scrapy',
  'DataForSeoBot',
];

const AI_TRAINING_REGEX = new RegExp(
  AI_TRAINING_PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

// AI search/retrieval agents — allow through so they can cite us
const AI_SEARCH_REGEX = /PerplexityBot|ChatGPT-User|YouBot/i;

const HEADLESS_REGEX = /HeadlessChrome|PhantomJS|Selenium|puppeteer|playwright|webdriver/i;

// Same-origin enforcement for high-value data endpoints.
// /data/ contains the raw supplement dataset (the scrape target). Direct
// hits with no referrer or a foreign referrer are not the legitimate
// browsing pattern and get rejected here. Site-internal fetches send
// either Referer: https://supplementdb.info/... or Sec-Fetch-Site: same-origin.
const PROTECTED_DATA_PREFIX = '/data/';
const ALLOWED_DATA_ORIGIN = 'supplementdb.info';

export const config = {
  matcher: ['/((?!api|_next|assets|favicon|robots.txt|sitemap.xml).*)'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';
  const pathname = new URL(request.url).pathname;

  // Allow AI search agents through (they cite and link back to us)
  if (AI_SEARCH_REGEX.test(ua)) {
    return undefined;
  }

  if (AI_TRAINING_REGEX.test(ua)) {
    return new Response(
      '<html><body><h1>Access Restricted</h1></body></html>',
      {
        status: 403,
        headers: {
          'Content-Type': 'text/html',
          'X-Robots-Tag': 'noindex, nofollow, noai, noimageai',
        },
      }
    );
  }

  // Protect raw data endpoints: require same-origin referrer or fetch metadata.
  // Search engines do not (and should not) crawl /data/ — robots.txt disallows
  // it — so blocking direct/foreign access here is safe for SEO.
  if (pathname.startsWith(PROTECTED_DATA_PREFIX)) {
    const referer = request.headers.get('referer') || '';
    const secFetchSite = request.headers.get('sec-fetch-site') || '';
    const sameOriginByReferer = referer.includes(`//${ALLOWED_DATA_ORIGIN}/`) || referer.includes(`//www.${ALLOWED_DATA_ORIGIN}/`);
    const sameOriginByFetchMeta = secFetchSite === 'same-origin' || secFetchSite === 'same-site';
    if (!sameOriginByReferer && !sameOriginByFetchMeta) {
      return new Response(
        '<html><body><h1>Forbidden</h1></body></html>',
        {
          status: 403,
          headers: {
            'Content-Type': 'text/html',
            'X-Robots-Tag': 'noindex, nofollow',
          },
        }
      );
    }
  }

  if (HEADLESS_REGEX.test(ua)) {
    return new Response(
      '<html><body><h1>Access Restricted</h1></body></html>',
      {
        status: 403,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }

  // NOTE: A previous Accept-Language gate lived here. It returned a 503
  // to anything without an Accept-Language header that wasn't on a small
  // bot allow-list. In practice it 5xx'd Google's URL Inspection tool
  // (UA: "Google-InspectionTool/1.0", which does NOT contain "Googlebot")
  // and caused every "Request indexing" attempt to be rejected with
  // "Server error (5xx)". The signal value of the check was low — any
  // bot that wants to bypass it sends `Accept-Language: en-US` — while
  // the cost was directly blocking Google from validating our pages.
  // Removed 2026-04-19. Real anti-bot enforcement remains via the AI
  // training UA filter, the headless filter, and the same-origin gate
  // on /data/.

  return undefined;
}
