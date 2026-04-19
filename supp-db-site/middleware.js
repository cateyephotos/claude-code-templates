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

const STATIC_EXT_REGEX = /\.(js|css|png|jpg|svg|ico|woff2|json)$/i;

// Search engines + link unfurlers + feed readers that legitimately fetch
// pages without an Accept-Language header. Without this whitelist, the
// language-gate below 200-stubs them and breaks rich previews on
// Twitter/X, Slack, LinkedIn, Discord, Facebook — killing social CTR.
const SEARCH_ENGINE_REGEX = /Googlebot|bingbot|Slurp|DuckDuckBot|Applebot|YandexBot|Baiduspider|MJ12bot|AhrefsBot|SemrushBot|facebookexternalhit|Twitterbot|LinkedInBot|Slackbot|Discordbot|TelegramBot|WhatsApp|SkypeUriPreview|Pinterest|redditbot|EmbedlyBot|Mastodon|feedfetcher-google/i;

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

  if (!STATIC_EXT_REGEX.test(pathname)) {
    const acceptLanguage = request.headers.get('accept-language');
    if (!acceptLanguage && !SEARCH_ENGINE_REGEX.test(ua)) {
      return new Response(
        '<html><body><h1>Service Unavailable</h1></body></html>',
        {
          status: 503,
          headers: {
            'Content-Type': 'text/html',
            'Retry-After': '3600',
            'X-Robots-Tag': 'noindex',
          },
        }
      );
    }
  }

  return undefined;
}
