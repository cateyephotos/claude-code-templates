/**
 * share-bar.js — Privacy-respecting social sharing for SupplementDB
 * Zero third-party dependencies. Uses native Web Share API where available.
 * Tracks shares via PostHog (if loaded).
 */
(function () {
  'use strict';

  var PRODUCTION_BASE = 'https://supplementdb.co';

  function getPageURL() {
    // Use canonical URL if available, else current location
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) return canonical.href;
    // In production use the real domain; in dev use current location
    if (window.location.hostname === 'supplementdb.co') return window.location.href;
    return window.location.href;
  }

  function getPageTitle() {
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) return ogTitle.content;
    return document.title;
  }

  function trackShare(platform) {
    if (typeof posthog !== 'undefined' && posthog.capture) {
      posthog.capture('share_clicked', {
        platform: platform,
        page_url: getPageURL(),
        page_title: getPageTitle()
      });
    }
  }

  function shareTwitter() {
    var url = getPageURL();
    var text = getPageTitle();
    var shareURL = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(text);
    window.open(shareURL, '_blank', 'width=600,height=400,noopener');
    trackShare('twitter');
  }

  function shareLinkedIn() {
    var url = getPageURL();
    var shareURL = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    window.open(shareURL, '_blank', 'width=600,height=600,noopener');
    trackShare('linkedin');
  }

  function shareFacebook() {
    var url = getPageURL();
    var shareURL = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
    window.open(shareURL, '_blank', 'width=600,height=400,noopener');
    trackShare('facebook');
  }

  function copyLink(btn) {
    var url = getPageURL();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        showCopied(btn);
        trackShare('copy_link');
      });
    } else {
      // Fallback for older browsers
      var textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopied(btn);
      trackShare('copy_link');
    }
  }

  function showCopied(btn) {
    var originalHTML = btn.innerHTML;
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(function () {
      btn.classList.remove('copied');
      btn.innerHTML = originalHTML;
    }, 2000);
  }

  // Bind event listeners after DOM is ready
  function init() {
    var buttons = document.querySelectorAll('.share-btn');
    buttons.forEach(function (btn) {
      var platform = btn.getAttribute('data-share');
      if (!platform) return;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        switch (platform) {
          case 'twitter': shareTwitter(); break;
          case 'linkedin': shareLinkedIn(); break;
          case 'facebook': shareFacebook(); break;
          case 'copy': copyLink(btn); break;
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
