"""
Cross-reference ALL citation data against PubMed metadata.
Reads PubMed API response files and our citation_audit.json,
then compares title, DOI, year, journal, and first author.
Outputs a comprehensive mismatch report.

Usage: python supp-db-site/tools/validate_citations.py
"""

import json
import os
import re
import glob
from difflib import SequenceMatcher

TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(TOOLS_DIR)
PUBMED_DIR = r"C:\Users\Mind0\.claude\projects\C--Users-Mind0-Downloads-git-claudecodewebui-claude-code-templates\22f671a4-8bc6-4f41-8d06-8322822aff19\tool-results"

def normalize_title(title):
    """Normalize title for comparison - lowercase, remove punctuation, extra spaces"""
    if not title:
        return ""
    t = title.lower().strip()
    t = t.rstrip('.')
    # Remove HTML entities
    t = re.sub(r'&#x[a-f0-9]+;', '', t)
    t = re.sub(r'&[a-z]+;', '', t)
    # Remove special chars
    t = re.sub(r'[^\w\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def normalize_doi(doi):
    """Normalize DOI for comparison"""
    if not doi:
        return ""
    d = doi.lower().strip()
    # Remove URL prefix
    d = re.sub(r'^https?://doi\.org/', '', d)
    return d

def extract_year(pub_date):
    """Extract year from PubMed publication_date object"""
    if isinstance(pub_date, dict):
        return int(pub_date.get('year', 0))
    return 0

def normalize_journal(journal_str):
    """Normalize journal name for comparison"""
    if not journal_str:
        return ""
    j = journal_str.lower().strip()
    # Remove common suffixes
    j = re.sub(r'\s*\(.*?\)\s*$', '', j)
    j = j.rstrip('.')
    return j

def normalize_author(author_str):
    """Normalize author name for comparison"""
    if not author_str:
        return ""
    a = author_str.lower().strip()
    # Remove suffixes like Jr, Sr, etc
    a = re.sub(r',?\s*(jr|sr|iii|ii|iv)\.?\s*$', '', a, flags=re.I)
    # Get just the last name
    parts = re.split(r'[,\s]+', a)
    if parts:
        return parts[0]
    return a

def similarity(a, b):
    """Calculate string similarity ratio"""
    return SequenceMatcher(None, a, b).ratio()

def load_pubmed_results():
    """Load all PubMed API response files and build PMID->article lookup"""
    articles = {}

    # Find all relevant files
    patterns = [
        os.path.join(PUBMED_DIR, "toolu_*.txt"),
        os.path.join(PUBMED_DIR, "mcp-bcb55b0f-*.txt"),
    ]

    files_found = []
    for pattern in patterns:
        files_found.extend(glob.glob(pattern))

    print(f"Found {len(files_found)} PubMed result files")

    for filepath in files_found:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()

            # Try to parse as JSON
            data = json.loads(content)

            if 'articles' in data:
                for article in data['articles']:
                    pmid = article.get('identifiers', {}).get('pmid')
                    if pmid:
                        articles[pmid] = article
        except (json.JSONDecodeError, KeyError) as e:
            # Some files might not be PubMed results
            continue
        except Exception as e:
            print(f"  Error reading {os.path.basename(filepath)}: {e}")

    print(f"Loaded {len(articles)} unique PubMed articles")
    return articles

def load_our_citations():
    """Load our citation audit data"""
    audit_path = os.path.join(TOOLS_DIR, 'citation_audit.json')
    with open(audit_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def compare_citations(our_data, pubmed_articles):
    """Compare our citation data against PubMed and generate mismatch report"""

    report = {
        'totalCitations': 0,
        'validatedAgainstPubmed': 0,
        'pmidsNotFoundInPubmed': [],
        'titleMismatches': [],
        'doiMismatches': [],
        'yearMismatches': [],
        'journalMismatches': [],
        'authorMismatches': [],
        'duplicatePmidsWithinSupplement': [],
        'perfectMatches': 0,
        'bySupplementSummary': []
    }

    for supplement in our_data['supplements']:
        supp_name = supplement['supplementName']
        supp_file = supplement['file']
        supp_issues = []
        pmids_in_supp = {}

        for citation in supplement['citations']:
            report['totalCitations'] += 1
            pmid = citation.get('pmid')

            if not pmid:
                continue

            # Track duplicates within supplement
            if pmid in pmids_in_supp:
                pmids_in_supp[pmid].append(citation.get('title', 'Unknown'))
            else:
                pmids_in_supp[pmid] = [citation.get('title', 'Unknown')]

            # Look up in PubMed
            pubmed = pubmed_articles.get(pmid)
            if not pubmed:
                report['pmidsNotFoundInPubmed'].append({
                    'pmid': pmid,
                    'supplement': supp_name,
                    'file': supp_file,
                    'ourTitle': citation.get('title')
                })
                continue

            report['validatedAgainstPubmed'] += 1
            is_perfect = True

            # Compare TITLE
            our_title = normalize_title(citation.get('title', ''))
            pubmed_title = normalize_title(pubmed.get('title', ''))
            title_sim = similarity(our_title, pubmed_title)

            if title_sim < 0.85:
                is_perfect = False
                mismatch = {
                    'pmid': pmid,
                    'supplement': supp_name,
                    'file': supp_file,
                    'ourTitle': citation.get('title'),
                    'pubmedTitle': pubmed.get('title'),
                    'similarity': round(title_sim, 3)
                }
                report['titleMismatches'].append(mismatch)
                supp_issues.append(f"TITLE MISMATCH (PMID {pmid}, sim={title_sim:.2f})")

            # Compare DOI
            our_doi = normalize_doi(citation.get('doi', ''))
            pubmed_doi = normalize_doi(pubmed.get('identifiers', {}).get('doi', '') or pubmed.get('doi', ''))

            if our_doi and pubmed_doi and our_doi != pubmed_doi:
                is_perfect = False
                mismatch = {
                    'pmid': pmid,
                    'supplement': supp_name,
                    'file': supp_file,
                    'ourDoi': citation.get('doi'),
                    'pubmedDoi': pubmed.get('identifiers', {}).get('doi', '') or pubmed.get('doi', '')
                }
                report['doiMismatches'].append(mismatch)
                supp_issues.append(f"DOI MISMATCH (PMID {pmid})")

            # Compare YEAR
            our_year = citation.get('year')
            pubmed_year = extract_year(pubmed.get('publication_date', {}))

            if our_year and pubmed_year and our_year != pubmed_year:
                is_perfect = False
                mismatch = {
                    'pmid': pmid,
                    'supplement': supp_name,
                    'file': supp_file,
                    'ourYear': our_year,
                    'pubmedYear': pubmed_year
                }
                report['yearMismatches'].append(mismatch)
                supp_issues.append(f"YEAR MISMATCH (PMID {pmid}: ours={our_year}, actual={pubmed_year})")

            # Compare JOURNAL (fuzzy)
            our_journal = normalize_journal(citation.get('journal', ''))
            pubmed_journal_title = pubmed.get('journal', {}).get('title', '')
            pubmed_journal_abbrev = pubmed.get('journal', {}).get('iso_abbreviation', '')

            if our_journal:
                j_sim_full = similarity(our_journal, normalize_journal(pubmed_journal_title))
                j_sim_abbrev = similarity(our_journal, normalize_journal(pubmed_journal_abbrev))
                j_sim = max(j_sim_full, j_sim_abbrev)

                if j_sim < 0.5:
                    is_perfect = False
                    mismatch = {
                        'pmid': pmid,
                        'supplement': supp_name,
                        'file': supp_file,
                        'ourJournal': citation.get('journal'),
                        'pubmedJournal': pubmed_journal_title,
                        'pubmedJournalAbbrev': pubmed_journal_abbrev,
                        'similarity': round(j_sim, 3)
                    }
                    report['journalMismatches'].append(mismatch)
                    supp_issues.append(f"JOURNAL MISMATCH (PMID {pmid})")

            # Compare FIRST AUTHOR
            our_author = normalize_author(citation.get('firstAuthor', ''))
            pubmed_authors = pubmed.get('authors', [])
            if pubmed_authors and our_author:
                pubmed_first = normalize_author(pubmed_authors[0].get('last_name', ''))
                a_sim = similarity(our_author, pubmed_first)

                if a_sim < 0.7:
                    is_perfect = False
                    mismatch = {
                        'pmid': pmid,
                        'supplement': supp_name,
                        'file': supp_file,
                        'ourFirstAuthor': citation.get('firstAuthor'),
                        'pubmedFirstAuthor': f"{pubmed_authors[0].get('last_name', '')}, {pubmed_authors[0].get('fore_name', '')}",
                        'similarity': round(a_sim, 3)
                    }
                    report['authorMismatches'].append(mismatch)
                    supp_issues.append(f"AUTHOR MISMATCH (PMID {pmid})")

            if is_perfect:
                report['perfectMatches'] += 1

        # Check for duplicate PMIDs within this supplement
        for pmid, titles in pmids_in_supp.items():
            if len(titles) > 1:
                report['duplicatePmidsWithinSupplement'].append({
                    'pmid': pmid,
                    'supplement': supp_name,
                    'file': supp_file,
                    'count': len(titles),
                    'titles': titles
                })

        report['bySupplementSummary'].append({
            'supplement': supp_name,
            'file': supp_file,
            'totalCitations': len(supplement['citations']),
            'issues': supp_issues
        })

    return report

def print_report(report):
    """Print formatted mismatch report"""
    print("\n" + "=" * 80)
    print("CITATION VALIDATION REPORT")
    print("=" * 80)

    print(f"\nTotal citations scanned: {report['totalCitations']}")
    print(f"Validated against PubMed: {report['validatedAgainstPubmed']}")
    print(f"Perfect matches: {report['perfectMatches']}")
    print(f"PMIDs not found in PubMed: {len(report['pmidsNotFoundInPubmed'])}")

    print(f"\n--- MISMATCHES FOUND ---")
    print(f"Title mismatches: {len(report['titleMismatches'])}")
    print(f"DOI mismatches: {len(report['doiMismatches'])}")
    print(f"Year mismatches: {len(report['yearMismatches'])}")
    print(f"Journal mismatches: {len(report['journalMismatches'])}")
    print(f"Author mismatches: {len(report['authorMismatches'])}")
    print(f"Duplicate PMIDs within supplement: {len(report['duplicatePmidsWithinSupplement'])}")

    if report['pmidsNotFoundInPubmed']:
        print(f"\n{'=' * 60}")
        print("PMIDs NOT FOUND IN PUBMED:")
        print('=' * 60)
        for item in report['pmidsNotFoundInPubmed']:
            print(f"  PMID: {item['pmid']}")
            print(f"  Supplement: {item['supplement']}")
            print(f"  File: {item['file']}")
            print(f"  Our Title: {item.get('ourTitle', 'N/A')}")
            print()

    if report['titleMismatches']:
        print(f"\n{'=' * 60}")
        print("TITLE MISMATCHES:")
        print('=' * 60)
        for item in report['titleMismatches']:
            print(f"  PMID: {item['pmid']} (similarity: {item['similarity']})")
            print(f"  Supplement: {item['supplement']}")
            print(f"  File: {item['file']}")
            print(f"  OUR TITLE: {item['ourTitle']}")
            print(f"  PUBMED TITLE: {item['pubmedTitle']}")
            print()

    if report['doiMismatches']:
        print(f"\n{'=' * 60}")
        print("DOI MISMATCHES:")
        print('=' * 60)
        for item in report['doiMismatches']:
            print(f"  PMID: {item['pmid']}")
            print(f"  Supplement: {item['supplement']}")
            print(f"  File: {item['file']}")
            print(f"  OUR DOI: {item['ourDoi']}")
            print(f"  PUBMED DOI: {item['pubmedDoi']}")
            print()

    if report['yearMismatches']:
        print(f"\n{'=' * 60}")
        print("YEAR MISMATCHES:")
        print('=' * 60)
        for item in report['yearMismatches']:
            print(f"  PMID: {item['pmid']}")
            print(f"  Supplement: {item['supplement']}")
            print(f"  Ours: {item['ourYear']} | PubMed: {item['pubmedYear']}")
            print()

    if report['journalMismatches']:
        print(f"\n{'=' * 60}")
        print("JOURNAL MISMATCHES:")
        print('=' * 60)
        for item in report['journalMismatches']:
            print(f"  PMID: {item['pmid']}")
            print(f"  Supplement: {item['supplement']}")
            print(f"  OUR JOURNAL: {item['ourJournal']}")
            print(f"  PUBMED JOURNAL: {item['pubmedJournal']}")
            print()

    if report['authorMismatches']:
        print(f"\n{'=' * 60}")
        print("FIRST AUTHOR MISMATCHES:")
        print('=' * 60)
        for item in report['authorMismatches']:
            print(f"  PMID: {item['pmid']}")
            print(f"  Supplement: {item['supplement']}")
            print(f"  OUR AUTHOR: {item['ourFirstAuthor']}")
            print(f"  PUBMED AUTHOR: {item['pubmedFirstAuthor']}")
            print()

    if report['duplicatePmidsWithinSupplement']:
        print(f"\n{'=' * 60}")
        print("DUPLICATE PMIDs WITHIN SAME SUPPLEMENT:")
        print('=' * 60)
        for item in report['duplicatePmidsWithinSupplement']:
            print(f"  PMID: {item['pmid']} (appears {item['count']}x)")
            print(f"  Supplement: {item['supplement']}")
            print(f"  File: {item['file']}")
            print()

    # Summary per supplement with issues
    supps_with_issues = [s for s in report['bySupplementSummary'] if s['issues']]
    if supps_with_issues:
        print(f"\n{'=' * 60}")
        print(f"SUPPLEMENTS WITH ISSUES ({len(supps_with_issues)}):")
        print('=' * 60)
        for s in supps_with_issues:
            print(f"\n  {s['supplement']} ({s['file']}):")
            for issue in s['issues']:
                print(f"    - {issue}")

if __name__ == '__main__':
    import sys
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

    print("Loading PubMed validation results...")
    pubmed_articles = load_pubmed_results()

    print("Loading our citation data...")
    our_data = load_our_citations()

    print("Cross-referencing citations...")
    report = compare_citations(our_data, pubmed_articles)

    # Save full report as JSON
    report_path = os.path.join(TOOLS_DIR, 'validation_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    print(f"\nFull report saved to: {report_path}")

    # Print human-readable report
    print_report(report)
