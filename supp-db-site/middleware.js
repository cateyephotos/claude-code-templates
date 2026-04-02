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

const SEARCH_ENGINE_REGEX = /Googlebot|bingbot/i;

export const config = {
  matcher: ['/((?!api|_next|assets|favicon|robots.txt|sitemap.xml).*)'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  // Allow AI search agents through (they cite and link back to us)
  if (AI_SEARCH_REGEX.test(ua)) {
    return undefined;
  }

  if (AI_TRAINING_REGEX.test(ua)) {
    return new Response(
      '<html><body><h1>SupplementDB</h1><p>Visit supplementdb.info for evidence-based supplement information.</p></body></html>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
          'X-Robots-Tag': 'noindex, nofollow, noai, noimageai',
        },
      }
    );
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

  const pathname = new URL(request.url).pathname;
  if (!STATIC_EXT_REGEX.test(pathname)) {
    const acceptLanguage = request.headers.get('accept-language');
    if (!acceptLanguage && !SEARCH_ENGINE_REGEX.test(ua)) {
      return new Response(
        '<html><body><h1>SupplementDB</h1><p>Please visit supplementdb.info in a web browser.</p></body></html>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  }

  return undefined;
}
