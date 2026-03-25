const AI_CRAWLER_PATTERNS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'CCBot',
  'anthropic-ai',
  'Google-Extended',
  'Bytespider',
  'Diffbot',
  'Applebot-Extended',
  'PerplexityBot',
  'YouBot',
  'Amazonbot',
  'FacebookBot',
  'meta-externalagent',
  'cohere-ai',
  'Scrapy',
  'DataForSeoBot',
];

const AI_CRAWLER_REGEX = new RegExp(
  AI_CRAWLER_PATTERNS.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'i'
);

const HEADLESS_REGEX = /HeadlessChrome|PhantomJS|Selenium|puppeteer|playwright|webdriver/i;

const STATIC_EXT_REGEX = /\.(js|css|png|jpg|svg|ico|woff2|json)$/i;

const SEARCH_ENGINE_REGEX = /Googlebot|bingbot/i;

export const config = {
  matcher: ['/((?!api|_next|assets|favicon|robots.txt|sitemap.xml).*)'],
};

export default function middleware(request) {
  const ua = request.headers.get('user-agent') || '';

  if (AI_CRAWLER_REGEX.test(ua)) {
    return new Response(
      '<html><body><h1>SupplementDB</h1><p>Visit supplementdb.co for evidence-based supplement information.</p></body></html>',
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
        '<html><body><h1>SupplementDB</h1><p>Please visit supplementdb.co in a web browser.</p></body></html>',
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }
      );
    }
  }

  return undefined;
}
