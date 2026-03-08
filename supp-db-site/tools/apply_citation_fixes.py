"""
Apply ALL confirmed citation fixes to enhanced citation JS files.
This script applies:
1. PMID replacements (wrong PMID → correct PMID)
2. DOI-only fixes (PMID correct, DOI wrong)
3. Title updates to match PubMed records
4. Removal of wrong PMIDs that have no correct replacement
5. Deduplication of duplicate PMIDs within supplements

Usage: python supp-db-site/tools/apply_citation_fixes.py
"""

import os
import re
import sys
import json
import shutil
from datetime import datetime

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

TOOLS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(TOOLS_DIR)
CITATIONS_DIR = os.path.join(PROJECT_DIR, 'data', 'enhanced_citations')
BACKUP_DIR = os.path.join(TOOLS_DIR, 'pre_fix_backup')

# =============================================================================
# FIX DEFINITIONS
# =============================================================================

# 1. PMID REPLACEMENTS: {wrong_pmid: {correct_pmid, correct_doi, correct_title, file}}
PMID_REPLACEMENTS = {
    # Creatine fixes
    "35907529": {
        "correct_pmid": "35986981",
        "correct_doi": "10.1016/j.clnu.2022.07.035",
        "correct_title": "Influence of age, sex, and type of exercise on the efficacy of creatine supplementation on lean body mass: A systematic review and meta-analysis of randomized clinical trials",
        "file": "5_creatine_enhanced.js"
    },
    "41433021": {
        "correct_pmid": "39042054",
        "correct_doi": "10.1080/15502783.2024.2386451",
        "correct_title": "Creatine supplementation protocols: dose-response meta-analysis",
        "file": "5_creatine_enhanced.js"
    },
    # Ginkgo fixes
    "26026565": {
        "correct_pmid": "26268459",
        "correct_doi": "10.1186/s12906-015-0719-z",
        "correct_title": "Effect of Ginkgo biloba extract on experimental cardiac remodeling",
        "file": "14_enhanced.js"
    },
    "25687549": {
        "correct_pmid": "25681539",
        "correct_doi": "10.1016/j.intimp.2015.02.001",
        "correct_title": "Ginkgolide A reduces inflammatory response in high-glucose-stimulated human umbilical vein endothelial cells through STAT3-mediated pathway",
        "file": "14_enhanced.js"
    },
    "35299988": {
        "correct_pmid": "35265150",
        "correct_doi": "10.1155/2022/8288818",
        "correct_title": "Ginkgo biloba: A Treasure of Functional Phytochemicals with Multimedicinal Applications",
        "file": "14_enhanced.js"
    },
    "38929084": {
        "correct_pmid": "38929090",
        "correct_doi": "10.3390/antiox13060651",
        "correct_title": "Ginkgo biloba: A Leaf of Hope in the Fight against Alzheimer's Dementia: Clinical Trial Systematic Review",
        "file": "14_enhanced.js"
    },
    "39705029": {
        "correct_pmid": "21573082",
        "correct_doi": "10.1080/15622975.2011.595823",
        "correct_title": "Alleviating neuropsychiatric symptoms in dementia: the effects of Ginkgo biloba extract EGb 761",
        "file": "14_enhanced.js"
    },
    "32267590": {
        "correct_pmid": "32097990",
        "correct_doi": "10.1002/ptr.6646",
        "correct_title": "The effects of Ginkgo biloba on metabolic syndrome: A review",
        "file": "14_enhanced.js"
    },
    "38629803": {
        "correct_pmid": "39189506",
        "correct_doi": "10.1002/bmc.5980",
        "correct_title": "Identification and quantification of the antioxidants in Ginkgo biloba leaf",
        "file": "14_enhanced.js"
    },
    # Alpha-GPC fix
    "22033170": {
        "correct_pmid": "21414376",
        "correct_doi": "10.1177/1091581811420465",
        "correct_title": "Safety assessment of AGPC as a food ingredient",
        "file": "16_enhanced.js"
    },
    # Folate fix
    "30570133": {
        "correct_pmid": "28752910",
        "correct_doi": "10.1002/14651858.CD007807.pub3",
        "correct_title": "Antioxidants for female subfertility",
        "file": "23_folate_enhanced.js"
    },
}

# 2. DOI-ONLY FIXES: {pmid: {wrong_doi_pattern, correct_doi, file}}
DOI_FIXES = {
    "18412997": {
        "wrong_doi": "10.1017/S0029665108007027",
        "correct_doi": "10.1017/S0029665108007076",
        "correct_title": "Homocysteine, B-vitamins and CVD",
        "file": "23_folate_enhanced.js"
    },
    "16672082": {
        "wrong_doi": "10.1017/S0029665106002424",
        "correct_doi": "10.1079/pns2006495",
        "correct_title": "Genetic variation in genes of folate metabolism and neural-tube defect risk",
        "file": "23_folate_enhanced.js"
    },
}

# 3. PMID TO REMOVE (wrong PMID, no correct replacement found)
PMIDS_TO_REMOVE = {
    "26900013": {
        "file": "5_creatine_enhanced.js",
        "reason": "PubMed PMID 26900013 is about glutamate neurotoxicity/ATF3 (unrelated to creatine). DOI 10.1007/s40279-016-0507-y returns 404. Correct PMID not found in PubMed."
    }
}

# 4. TITLE UPDATES (PMID correct, but title needs alignment with PubMed)
TITLE_UPDATES = {
    "27876835": {
        "correct_title": "Folic acid supplementation improves cognitive function by reducing the levels of peripheral inflammatory cytokines in elderly Chinese subjects with MCI",
        "file": "23_folate_enhanced.js"
    },
    "34432056": {
        "correct_title": "B vitamins and prevention of cognitive decline and incident dementia: a systematic review and meta-analysis",
        "file": "23_folate_enhanced.js"
    },
    "34794190": {
        "correct_title": "Systematic Review and Meta-Analysis of L-Methylfolate Augmentation in Depressive Disorders",
        "file": "23_folate_enhanced.js"
    },
    "31213101": {
        "correct_title": "Impact of quercetin on systemic levels of inflammation: a meta-analysis of randomised controlled human trials",
        "file": "20_enhanced.js"
    },
    "30986309": {
        "correct_title": "Dietary Ingredients as an Alternative Approach for Mitigating Chronic Musculoskeletal Pain: Evidence-Based Recommendations for Practice and Research in the Military",
        "file": "29_enhanced.js"
    },
    "40507030": {
        "correct_title": "Using the Rise and Fall of Oxidative Stress and Inflammation Post-Exercise to Evaluate the Effect of Methylsulfonylmethane Supplementation on Immune Response mRNA",
        "file": "29_enhanced.js"
    },
    "38138558": {
        "correct_title": "Investigation of Drug-Interaction Potential for Arthritis Dietary Supplements: Chondroitin Sulfate, Glucosamine, and Methylsulfonylmethane",
        "file": "29_enhanced.js"
    },
}


def backup_file(filepath):
    """Create backup of file before modifying"""
    os.makedirs(BACKUP_DIR, exist_ok=True)
    basename = os.path.basename(filepath)
    backup_path = os.path.join(BACKUP_DIR, basename)
    shutil.copy2(filepath, backup_path)
    return backup_path


def apply_pmid_replacement(content, wrong_pmid, fix_info):
    """Replace a wrong PMID with the correct one, preserving all context"""
    correct_pmid = fix_info["correct_pmid"]
    changes = []

    # Replace PMID value (handles both quoted and unquoted formats)
    # Pattern: pmid: "35907529" or pmid: 35907529
    old_count = content.count(wrong_pmid)

    # Replace in pmid field specifically
    patterns = [
        (f'pmid: "{wrong_pmid}"', f'pmid: "{correct_pmid}"'),
        (f'pmid:"{wrong_pmid}"', f'pmid:"{correct_pmid}"'),
        (f"pmid: {wrong_pmid}", f"pmid: {correct_pmid}"),
        (f'"pmid": "{wrong_pmid}"', f'"pmid": "{correct_pmid}"'),
        (f'"pmid":{wrong_pmid}', f'"pmid":{correct_pmid}'),
    ]

    for old, new in patterns:
        if old in content:
            content = content.replace(old, new)
            changes.append(f"  PMID {wrong_pmid} → {correct_pmid}")
            break

    return content, changes


def apply_doi_fix(content, pmid, fix_info):
    """Fix a wrong DOI for a citation with a correct PMID"""
    wrong_doi = fix_info["wrong_doi"]
    correct_doi = fix_info["correct_doi"]
    changes = []

    if wrong_doi in content:
        content = content.replace(wrong_doi, correct_doi)
        changes.append(f"  DOI for PMID {pmid}: {wrong_doi} → {correct_doi}")

    return content, changes


def apply_title_update(content, pmid, correct_title):
    """Update title for a citation identified by PMID"""
    changes = []

    # Strategy: Find the title line that is near (within ~20 lines) of the PMID line
    # and replace it. This works for both JS object and JSON formats.
    lines = content.split('\n')
    pmid_line_indices = []

    # Find all lines containing this PMID
    for i, line in enumerate(lines):
        if re.search(r'["\']?pmid["\']?\s*:\s*["\']?' + re.escape(pmid) + r'["\']?', line):
            pmid_line_indices.append(i)

    for pmid_idx in pmid_line_indices:
        # Search nearby lines (up to 20 before and after) for the title field
        search_start = max(0, pmid_idx - 20)
        search_end = min(len(lines), pmid_idx + 20)

        for i in range(search_start, search_end):
            title_match = re.match(r'^(\s*"?title"?\s*:\s*")(.+?)(",?\s*)$', lines[i])
            if title_match:
                old_title = title_match.group(2)
                # Normalize for comparison (strip trailing periods, lowercase)
                old_norm = old_title.lower().strip().rstrip('.')
                new_norm = correct_title.lower().strip().rstrip('.')
                if old_norm != new_norm:
                    lines[i] = title_match.group(1) + correct_title + title_match.group(3)
                    changes.append(f"  Title for PMID {pmid}: updated to match PubMed")
                break

    content = '\n'.join(lines)
    return content, changes


def remove_pmid_citation(content, pmid, reason):
    """Comment out or remove a citation with a wrong PMID"""
    changes = []

    # Find the evidence block containing this PMID
    # We'll add a comment marking it as invalid rather than removing it
    # This preserves the structure while flagging the issue

    # Look for the block - match from opening { to closing }
    block_pattern = re.compile(
        r'(\s*\{[^{}]*?(?:pmid["\s:]+["\s]*' + re.escape(pmid) + r')[^{}]*?\}\s*,?)',
        re.DOTALL
    )

    match = block_pattern.search(content)
    if match:
        old_block = match.group(0)
        # Add a comment before the block marking it as invalid
        commented_block = old_block.replace(
            f'pmid: "{pmid}"',
            f'pmid: null, // REMOVED: PMID {pmid} was incorrect - {reason}'
        ).replace(
            f"pmid: {pmid}",
            f'pmid: null, // REMOVED: PMID {pmid} was incorrect - {reason}'
        )
        content = content.replace(old_block, commented_block)
        changes.append(f"  REMOVED PMID {pmid}: {reason}")

    return content, changes


def deduplicate_pmids(content, filename):
    """Find and remove duplicate citations with the same PMID within a file"""
    changes = []

    # Find all PMIDs in the file
    pmid_matches = list(re.finditer(r'pmid\s*:\s*["\']?(\d+)["\']?', content))
    pmid_positions = {}

    for match in pmid_matches:
        pmid = match.group(1)
        if pmid not in pmid_positions:
            pmid_positions[pmid] = []
        pmid_positions[pmid].append(match.start())

    # Find duplicates
    duplicates = {k: v for k, v in pmid_positions.items() if len(v) > 1}

    if duplicates:
        for pmid, positions in duplicates.items():
            changes.append(f"  DUPLICATE: PMID {pmid} appears {len(positions)}x in {filename}")

    return content, changes


def process_file(filename, all_fixes_for_file):
    """Apply all fixes for a single file"""
    filepath = os.path.join(CITATIONS_DIR, filename)

    if not os.path.exists(filepath):
        print(f"  WARNING: File not found: {filename}")
        return []

    # Read original
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    all_changes = []

    # Apply PMID replacements
    for wrong_pmid, fix_info in all_fixes_for_file.get('pmid_replacements', {}).items():
        content, changes = apply_pmid_replacement(content, wrong_pmid, fix_info)
        all_changes.extend(changes)

    # Apply DOI fixes
    for pmid, fix_info in all_fixes_for_file.get('doi_fixes', {}).items():
        content, changes = apply_doi_fix(content, pmid, fix_info)
        all_changes.extend(changes)

    # Apply title updates
    for pmid, title_info in all_fixes_for_file.get('title_updates', {}).items():
        content, changes = apply_title_update(content, pmid, title_info['correct_title'])
        all_changes.extend(changes)

    # Apply PMID removals
    for pmid, removal_info in all_fixes_for_file.get('pmid_removals', {}).items():
        content, changes = remove_pmid_citation(content, pmid, removal_info['reason'])
        all_changes.extend(changes)

    # Check for duplicates (report only, don't auto-fix)
    _, dup_changes = deduplicate_pmids(content, filename)
    all_changes.extend(dup_changes)

    # Write if changed
    if content != original_content:
        # Backup first
        backup_path = backup_file(filepath)
        print(f"  Backed up to: {os.path.basename(backup_path)}")

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  ✓ File updated: {filename}")
    else:
        print(f"  No changes needed for: {filename}")

    return all_changes


def organize_fixes_by_file():
    """Organize all fix definitions by target file"""
    files = {}

    # PMID replacements
    for wrong_pmid, fix_info in PMID_REPLACEMENTS.items():
        fname = fix_info['file']
        if fname not in files:
            files[fname] = {'pmid_replacements': {}, 'doi_fixes': {}, 'title_updates': {}, 'pmid_removals': {}}
        files[fname]['pmid_replacements'][wrong_pmid] = fix_info

    # DOI fixes
    for pmid, fix_info in DOI_FIXES.items():
        fname = fix_info['file']
        if fname not in files:
            files[fname] = {'pmid_replacements': {}, 'doi_fixes': {}, 'title_updates': {}, 'pmid_removals': {}}
        files[fname]['doi_fixes'][pmid] = fix_info

    # Title updates
    for pmid, title_info in TITLE_UPDATES.items():
        fname = title_info['file']
        if fname not in files:
            files[fname] = {'pmid_replacements': {}, 'doi_fixes': {}, 'title_updates': {}, 'pmid_removals': {}}
        files[fname]['title_updates'][pmid] = title_info

    # PMID removals
    for pmid, removal_info in PMIDS_TO_REMOVE.items():
        fname = removal_info['file']
        if fname not in files:
            files[fname] = {'pmid_replacements': {}, 'doi_fixes': {}, 'title_updates': {}, 'pmid_removals': {}}
        files[fname]['pmid_removals'][pmid] = removal_info

    return files


def main():
    print("=" * 80)
    print("CITATION FIX SCRIPT")
    print(f"Run at: {datetime.now().isoformat()}")
    print("=" * 80)

    # Verify citations dir exists
    if not os.path.isdir(CITATIONS_DIR):
        print(f"ERROR: Citations directory not found: {CITATIONS_DIR}")
        sys.exit(1)

    # Organize fixes by file
    fixes_by_file = organize_fixes_by_file()

    print(f"\nFiles to process: {len(fixes_by_file)}")
    print(f"Total PMID replacements: {len(PMID_REPLACEMENTS)}")
    print(f"Total DOI fixes: {len(DOI_FIXES)}")
    print(f"Total title updates: {len(TITLE_UPDATES)}")
    print(f"Total PMID removals: {len(PMIDS_TO_REMOVE)}")

    # Process each file
    total_changes = []
    for filename in sorted(fixes_by_file.keys()):
        print(f"\n--- Processing: {filename} ---")
        fixes = fixes_by_file[filename]
        changes = process_file(filename, fixes)
        total_changes.extend(changes)

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total changes applied: {len([c for c in total_changes if 'DUPLICATE' not in c])}")
    print(f"Duplicate PMIDs flagged: {len([c for c in total_changes if 'DUPLICATE' in c])}")
    print()
    for change in total_changes:
        print(change)

    # Save fix log
    log_path = os.path.join(TOOLS_DIR, 'fix_log.json')
    log = {
        'timestamp': datetime.now().isoformat(),
        'changes': total_changes,
        'pmid_replacements': {k: v['correct_pmid'] for k, v in PMID_REPLACEMENTS.items()},
        'doi_fixes': {k: {'from': v['wrong_doi'], 'to': v['correct_doi']} for k, v in DOI_FIXES.items()},
        'title_updates': list(TITLE_UPDATES.keys()),
        'pmid_removals': list(PMIDS_TO_REMOVE.keys()),
    }
    with open(log_path, 'w', encoding='utf-8') as f:
        json.dump(log, f, indent=2, ensure_ascii=False)
    print(f"\nFix log saved to: {log_path}")


if __name__ == '__main__':
    main()
