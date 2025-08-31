# 📋 Phase 3: Systematic Migration Plan

*Created: 2025-08-24 23:59:00*

## 🎯 Migration Strategy

**Approach**: Incremental batches with validation after each  
**Safety**: No deletions, only moves with complete tracking  
**Validation**: Functionality testing after each critical batch  

## 📊 Migration Batches

### Batch 1: CRITICAL - Documentation (LOW RISK) - 7 files
**Priority**: Start with safest files  
**Risk Level**: 🟢 LOW  
**Validation**: File accessibility check  

| File | Source | Destination | Notes |
|------|--------|-------------|-------|
| `CITATION_TRACKING.md` | `/` | `docs/development/` | Development doc |
| `CLAUDE.md` | `/` | `docs/development/` | Development doc |
| `COMPREHENSIVE_TEST_REPORT.md` | `/` | `docs/development/` | Test report |
| `COMPREHENSIVE_VERIFICATION_REPORT.md` | `/` | `docs/development/` | Verification report |
| `ENHANCED_CITATIONS_FINAL_VALIDATION_REPORT.md` | `/` | `docs/development/` | Validation report |
| `IMPLEMENTATION_SUMMARY.md` | `/` | `docs/development/` | Implementation guide |
| `PHASE-2A-EXPANSION-CONTEXT.md` | `/` | `docs/development/` | Phase context |

### Batch 2: Reports & Screenshots (LOW RISK) - 20 files
**Priority**: Archive artifacts safely  
**Risk Level**: 🟢 LOW  
**Validation**: File accessibility check  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `*.png` (screenshots) | `/` | `reports/screenshots/` | 20 files |

### Batch 3: JSON Reports (LOW RISK) - 15 files
**Priority**: Archive validation reports  
**Risk Level**: 🟢 LOW  
**Validation**: JSON validity check  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `*-report.json` | `/` | `reports/validation/` | 8 files |
| `*-verification-*.json` | `/` | `reports/validation/` | 7 files |

### Batch 4: HTML Test Files (LOW RISK) - 5 files
**Priority**: Archive test artifacts  
**Risk Level**: 🟢 LOW  
**Validation**: File accessibility check  

| File | Source | Destination | Notes |
|------|--------|-------------|-------|
| `test_enhanced_citations.html` | `/` | `reports/validation/` | Test artifact |
| `test_functionality.html` | `/` | `reports/validation/` | Test artifact |
| `test_phase2a_validation.html` | `/` | `reports/validation/` | Test artifact |
| `debug-page-content.html` | `/` | `reports/validation/` | Debug artifact |
| `comprehensive_test_report.html` | `/` | `reports/validation/` | Test report |

### Batch 5: Analysis Scripts (MEDIUM RISK) - 8 files
**Priority**: Organize analysis tools  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File | Source | Destination | Notes |
|------|--------|-------------|-------|
| `analyze-citation-formats.js` | `/` | `tools/analysis/` | Citation analysis |
| `analyze-enhanced-status.js` | `/` | `tools/analysis/` | Status analysis |
| `analyze-enhancement-gaps.js` | `/` | `tools/analysis/` | Gap analysis |
| `analyze-missing-enhanced.js` | `/` | `tools/analysis/` | Missing analysis |
| `audit-undefined-citations.js` | `/` | `tools/analysis/` | Citation audit |
| `check-all-supplements-systematic.js` | `/` | `tools/analysis/` | Systematic check |
| `identify-missing-supplements.js` | `/` | `tools/analysis/` | Missing identification |
| `quick-enhanced-citation-check.js` | `/` | `tools/analysis/` | Quick check |

### Batch 6: Validation Scripts (MEDIUM RISK) - 15 files
**Priority**: Organize validation tools  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `validate-*.js` | `/` | `tools/validation/` | 8 files |
| `verify-*.js` | `/` | `tools/validation/` | 7 files |

### Batch 7: Debug Scripts Part 1 (MEDIUM RISK) - 15 files
**Priority**: Organize debug tools  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `debug-*.js` | `/` | `tools/debug/` | 15 files |

### Batch 8: Test Scripts Part 1 (MEDIUM RISK) - 15 files
**Priority**: Organize test tools  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `test-*.js` (first 15) | `/` | `tools/debug/` | 15 files |

### Batch 9: Test Scripts Part 2 (MEDIUM RISK) - 15 files
**Priority**: Continue test organization  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `test-*.js` (remaining) | `/` | `tools/debug/` | 15 files |

### Batch 10: Comprehensive & Final Scripts (MEDIUM RISK) - 10 files
**Priority**: Organize comprehensive tools  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `comprehensive-*.js` | `/` | `tools/debug/` | 5 files |
| `final-*.js` | `/` | `tools/debug/` | 5 files |

### Batch 11: Utility Scripts (MEDIUM RISK) - 7 files
**Priority**: Organize utility tools  
**Risk Level**: 🟡 MEDIUM  
**Validation**: Script execution test  

| File | Source | Destination | Notes |
|------|--------|-------------|-------|
| `generate-enhanced-template.js` | `/` | `tools/analysis/` | Template generator |
| `convert-simple-to-complex-format.js` | `/` | `tools/analysis/` | Format converter |
| `network-debug.js` | `/` | `tools/debug/` | Network debugging |
| `playwright-debug-investigation.js` | `/` | `tools/debug/` | Playwright debug |
| `take-screenshot.js` | `/` | `tools/debug/` | Screenshot utility |
| `phase-2b-doi-verification.js` | `/` | `tools/validation/` | DOI verification |
| `wait-for-citations-test.js` | `/` | `tools/validation/` | Citation waiting |

### Batch 12: DEPRECATED - Fix Scripts (LOW RISK) - 6 files
**Priority**: Archive one-time fixes  
**Risk Level**: 🟢 LOW  
**Validation**: File accessibility check  

| File Pattern | Source | Destination | Count |
|--------------|--------|-------------|-------|
| `fix-*.js` | `/` | `deprecated/2025-01-25/debug-files/` | 6 files |

## 🛡️ Safety Protocols

### Before Each Batch:
1. Create incremental backup
2. Document current state
3. Test rollback procedure
4. Identify dependencies

### During Each Batch:
1. Move files one by one
2. Update movement log immediately
3. Check for broken references
4. Validate file accessibility

### After Each Batch:
1. Test functionality (if applicable)
2. Verify file integrity
3. Update documentation
4. Confirm rollback capability

## 📋 Validation Procedures

### Low Risk Batches (1-4, 12):
- File accessibility check
- Archive integrity verification
- Documentation link validation

### Medium Risk Batches (5-11):
- Script execution test
- Dependency check
- Tool functionality validation

### Critical Dependencies:
- No production files moved in Phase 3
- All moved files are development/archive only
- No import path updates required yet

## 🎯 Success Criteria

Each batch is considered successful when:
- ✅ All files moved to correct destinations
- ✅ Movement log updated
- ✅ Validation tests pass
- ✅ Rollback capability confirmed
- ✅ No functionality broken

## 📊 Progress Tracking

```
Batch 1:  Documentation        [░░░░░░░░░░] 0%
Batch 2:  Screenshots          [░░░░░░░░░░] 0%
Batch 3:  JSON Reports         [░░░░░░░░░░] 0%
Batch 4:  HTML Files           [░░░░░░░░░░] 0%
Batch 5:  Analysis Scripts     [░░░░░░░░░░] 0%
Batch 6:  Validation Scripts   [░░░░░░░░░░] 0%
Batch 7:  Debug Scripts 1      [░░░░░░░░░░] 0%
Batch 8:  Test Scripts 1       [░░░░░░░░░░] 0%
Batch 9:  Test Scripts 2       [░░░░░░░░░░] 0%
Batch 10: Comprehensive        [░░░░░░░░░░] 0%
Batch 11: Utility Scripts      [░░░░░░░░░░] 0%
Batch 12: Deprecated Fixes     [░░░░░░░░░░] 0%
```

**Overall Progress**: 0% (0/12 batches completed)

## 🚀 Ready to Execute

Phase 3 is ready to begin with systematic, safe file migration. Each batch is designed to minimize risk while making steady progress toward a clean, organized project structure.

**Next Step**: Execute Batch 1 - Documentation files (safest start)
