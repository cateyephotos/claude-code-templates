'use strict';

const DOI_REGEX = /^10\.\d{4,9}\/[^\s]+$/;

function isValidDoi(doi) {
  if (!doi || typeof doi !== 'string') return false;
  return DOI_REGEX.test(doi.trim());
}

function normalizeDoi(doi) {
  if (!doi || typeof doi !== 'string') return '';
  let d = doi.trim();
  d = d.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  d = d.replace(/^doi:\s*/i, '');
  return d.trim();
}

function doiToUrl(doi) {
  const normalized = normalizeDoi(doi);
  return normalized ? `https://doi.org/${normalized}` : '';
}

function extractDoiFromCitation(citationStr) {
  if (!citationStr || typeof citationStr !== 'string') return null;
  const match = citationStr.match(/10\.\d{4,9}\/[^\s,;)}\]]+/);
  return match ? match[0] : null;
}

module.exports = { isValidDoi, normalizeDoi, doiToUrl, extractDoiFromCitation };
