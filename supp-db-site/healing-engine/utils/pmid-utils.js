'use strict';

function isValidPmid(pmid) {
  if (pmid === null || pmid === undefined || pmid === '') return false;
  const str = String(pmid).trim();
  return /^\d{1,10}$/.test(str);
}

function normalizePmid(pmid) {
  if (pmid === null || pmid === undefined) return '';
  let str = String(pmid).trim();
  str = str.replace(/^pmid:\s*/i, '');
  return str.trim();
}

function pmidToUrl(pmid) {
  const normalized = normalizePmid(pmid);
  return normalized ? `https://pubmed.ncbi.nlm.nih.gov/${normalized}/` : '';
}

module.exports = { isValidPmid, normalizePmid, pmidToUrl };
