# 🔙 Rollback Procedures & Recovery Guide

*Established: 2025-01-25*

## 🎯 Purpose

This guide provides step-by-step procedures to rollback any changes made during the technical debt cleanup process. All procedures are designed to restore functionality quickly and safely.

## 🚨 Emergency Rollback (Critical Issues)

### When to Use:
- Production functionality is broken
- Critical files are missing or corrupted
- System is completely non-functional
- Data integrity is compromised

### Immediate Steps:
1. **STOP** all cleanup operations immediately
2. **DO NOT** make any additional changes
3. **DOCUMENT** the issue briefly
4. **EXECUTE** emergency rollback procedure

### Emergency Rollback Procedure:
```bash
# 1. Navigate to project root
cd /path/to/supp-db-site

# 2. Stop any running servers
# Kill any running processes on port 3000

# 3. Restore from pre-cleanup backup
rm -rf * .[^.]*  # Remove all current files (BE CAREFUL!)
cp -r archive/pre-cleanup-backup-YYYYMMDD-HHMMSS/* .

# 4. Verify restoration
ls -la  # Check files are restored
python -m http.server 3000  # Test functionality

# 5. Document the rollback
echo "Emergency rollback executed at $(date)" >> rollback.log
```

### Post-Emergency Actions:
1. Test all critical functionality
2. Document the issue that caused rollback
3. Notify team of rollback completion
4. Schedule post-mortem analysis
5. Plan revised cleanup approach

## 🔄 Selective Rollback (Specific Files)

### When to Use:
- Specific functionality is broken
- Certain files are causing issues
- Import paths are incorrect
- Partial functionality loss

### Selective Rollback Procedure:

#### Step 1: Identify Affected Files
```bash
# Check movement log for specific files
grep "filename.js" deprecated/MOVEMENT_LOG.md
```

#### Step 2: Restore Specific Files
```bash
# Restore individual files from backup
cp archive/pre-cleanup-backup-YYYYMMDD-HHMMSS/path/to/file.js ./original/path/

# Example:
cp archive/pre-cleanup-backup-20250125-143000/debug-test.js ./
```

#### Step 3: Update References
```bash
# Find and update any import statements that were changed
grep -r "import.*filename" .
# Manually update import paths back to original locations
```

#### Step 4: Test Functionality
```bash
# Test the specific functionality that was broken
node test-specific-feature.js
```

#### Step 5: Document Rollback
```markdown
## Selective Rollback - [Date/Time]
**Files Restored:**
- filename.js: restored to original location
- other-file.js: restored to original location

**Reason:** [Brief description of issue]
**Resolution:** [How the rollback fixed the issue]
**Status:** Completed and verified
```

## 📁 Batch Rollback (Phase Reversal)

### When to Use:
- Entire phase needs to be undone
- Multiple files are causing issues
- Systematic problems with a movement batch
- Need to restart a phase

### Phase Rollback Procedures:

#### Phase 3 Rollback (Undo File Movements):
```bash
# 1. Document current state
echo "Starting Phase 3 rollback at $(date)" >> rollback.log

# 2. Restore moved production files
cp archive/pre-cleanup-backup-YYYYMMDD-HHMMSS/index.html ./
cp archive/pre-cleanup-backup-YYYYMMDD-HHMMSS/js/* ./js/
cp archive/pre-cleanup-backup-YYYYMMDD-HHMMSS/data/* ./data/

# 3. Remove new folder structure (if desired)
rm -rf src/ tools/ reports/

# 4. Restore original file locations
# [Specific commands based on movement log]

# 5. Test functionality
python -m http.server 3000
```

#### Phase 2 Rollback (Undo Categorization):
```bash
# 1. Remove categorization files
rm docs/CURRENT_FILE_INVENTORY.md
rm docs/file-categorization.json

# 2. Restore original documentation
cp archive/pre-cleanup-backup-YYYYMMDD-HHMMSS/docs/* ./docs/

# 3. Reset to Phase 1 state
```

#### Phase 1 Rollback (Complete Reset):
```bash
# 1. Remove all cleanup artifacts
rm -rf deprecated/ archive/pre-cleanup-backup-*/
rm docs/TECHNICAL_DEBT_CLEANUP_PLAN.md
rm docs/CLEANUP_PROCESS_PHASES.md

# 2. Restore original state completely
cp -r archive/original-state-backup/* .
```

## 🔍 Rollback Verification

### Functionality Checklist:
```markdown
## Post-Rollback Verification

### Core Functionality:
- [ ] Website loads at http://localhost:3000
- [ ] Supplement cards display correctly
- [ ] Modal dialogs open and close
- [ ] Enhanced citations render properly
- [ ] Search functionality works
- [ ] No console errors

### File Integrity:
- [ ] All production files present
- [ ] Import paths working correctly
- [ ] Data files accessible
- [ ] Documentation readable

### Development Tools:
- [ ] Test scripts executable
- [ ] Debug tools functional
- [ ] Validation scripts working
- [ ] Build process operational
```

### Verification Commands:
```bash
# Test web interface
python -m http.server 3000 &
sleep 5
curl http://localhost:3000  # Should return HTML

# Test JavaScript functionality
node -e "require('./js/app.modernized.js'); console.log('JS loads successfully');"

# Test data files
node -e "require('./data/supplements.js'); console.log('Data loads successfully');"

# Kill test server
pkill -f "python -m http.server"
```

## 📋 Rollback Decision Matrix

| Issue Severity | Scope | Recommended Action | Timeline |
|---------------|-------|-------------------|----------|
| Critical | System-wide | Emergency Rollback | Immediate |
| High | Multiple features | Batch Rollback | Within 1 hour |
| Medium | Single feature | Selective Rollback | Within 4 hours |
| Low | Minor issues | Fix in place | Next maintenance |

## 📝 Rollback Documentation Template

```markdown
## Rollback Report - [Date/Time]

### Issue Description:
[Detailed description of what went wrong]

### Rollback Type:
[Emergency/Selective/Batch/Phase]

### Files Affected:
- file1.js
- file2.js
- etc.

### Rollback Steps Taken:
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Verification Results:
- [ ] Functionality restored
- [ ] No data loss
- [ ] All tests passing
- [ ] Documentation updated

### Root Cause Analysis:
[What caused the issue requiring rollback]

### Prevention Measures:
[How to prevent this issue in future]

### Next Steps:
[What to do next - retry, revise plan, etc.]
```

## 🛡️ Prevention Best Practices

### Before Making Changes:
1. Always create incremental backups
2. Test rollback procedures on copies
3. Document all dependencies
4. Plan rollback strategy before starting

### During Changes:
1. Make small, incremental changes
2. Test after each change
3. Document changes immediately
4. Keep rollback procedures ready

### After Changes:
1. Thoroughly test functionality
2. Document successful changes
3. Update rollback procedures
4. Plan next steps carefully

## 📞 Escalation Procedures

### If Rollback Fails:
1. **STOP** all operations
2. **DOCUMENT** the rollback failure
3. **CONTACT** technical lead immediately
4. **PRESERVE** current state for analysis
5. **IMPLEMENT** manual recovery if needed

### Emergency Contacts:
- **Primary**: [Technical Lead]
- **Secondary**: [Project Manager]
- **Escalation**: [Technical Director]

---

**Remember**: When in doubt, rollback. It's always better to restore functionality first and analyze issues later. All rollback procedures are designed to be safe and reversible.
