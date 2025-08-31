const { chromium } = require('playwright');
const fs = require('fs');

class EnhancedCitationAuditor {
    constructor() {
        this.results = {
            totalSupplements: 0,
            enhancedSupplements: [],
            issuesByType: {
                undefined: [],
                unknown: [],
                missingData: [],
                renderingErrors: []
            },
            tabResults: {
                mechanisms: [],
                benefits: [],
                safety: []
            },
            summary: {}
        };
    }

    async runCompleteAudit() {
        console.log('🚀 Starting Comprehensive Enhanced Citation Audit...');
        
        const browser = await chromium.launch({ headless: false });
        const context = await browser.newContext();
        const page = await context.newPage();
        
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
            await page.waitForTimeout(3000);
            
            // Phase 1: Discover all enhanced supplements
            const enhancedSupplements = await this.discoverEnhancedSupplements(page);
            console.log(`📊 Found ${enhancedSupplements.length} enhanced supplements to audit`);
            
            this.results.totalSupplements = enhancedSupplements.length;
            this.results.enhancedSupplements = enhancedSupplements;
            
            // Phase 2: Audit each supplement
            for (let i = 0; i < enhancedSupplements.length; i++) {
                const supplement = enhancedSupplements[i];
                console.log(`\n🔍 [${i + 1}/${enhancedSupplements.length}] Auditing: ${supplement.name} (ID: ${supplement.id})`);
                
                const auditResult = await this.auditSupplement(page, supplement);
                this.processAuditResult(supplement, auditResult);
                
                // Brief pause between supplements
                await page.waitForTimeout(500);
            }
            
            // Phase 3: Generate comprehensive report
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Audit error:', error.message);
        } finally {
            await browser.close();
        }
    }

    async discoverEnhancedSupplements(page) {
        return await page.evaluate(() => {
            const supplements = window.app.supplements.filter(s => s.enhancedCitations?.isEnhanced);
            return supplements.map(s => ({
                id: s.id,
                name: s.name,
                category: s.category,
                evidenceTier: s.evidenceTier
            }));
        });
    }

    async auditSupplement(page, supplement) {
        const result = {
            id: supplement.id,
            name: supplement.name,
            modalOpened: false,
            tabs: {
                mechanisms: { exists: false, cardCount: 0, issues: [] },
                benefits: { exists: false, cardCount: 0, issues: [] },
                safety: { exists: false, cardCount: 0, issues: [] }
            },
            overallIssues: []
        };

        try {
            // Open the supplement modal
            const modalResult = await page.evaluate(async (id) => {
                try {
                    await window.app.showSupplementDetails(id);
                    return { success: true };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            }, supplement.id);

            if (!modalResult.success) {
                result.overallIssues.push(`Failed to open modal: ${modalResult.error}`);
                return result;
            }

            result.modalOpened = true;
            await page.waitForTimeout(1000);

            // Audit each tab
            const tabs = ['mechanisms', 'benefits', 'safety'];
            for (const tabName of tabs) {
                result.tabs[tabName] = await this.auditTab(page, tabName, supplement.id);
            }

        } catch (error) {
            result.overallIssues.push(`Audit error: ${error.message}`);
        }

        return result;
    }

    async auditTab(page, tabName, supplementId) {
        const tabResult = {
            exists: false,
            cardCount: 0,
            issues: [],
            cards: []
        };

        try {
            // Click on the tab
            const tabDisplayName = this.getTabDisplayName(tabName);
            const tab = await page.locator('.citation-tab-btn').filter({ hasText: tabDisplayName }).first();
            const tabExists = await tab.count() > 0;

            if (!tabExists) {
                tabResult.issues.push(`${tabDisplayName} tab not found`);
                return tabResult;
            }

            await tab.click();
            await page.waitForTimeout(500);

            // Check tab content
            const tabContentId = `#${tabName}-${supplementId}`;
            const tabContent = await page.locator(tabContentId).first();
            const contentExists = await tabContent.count() > 0;

            if (!contentExists) {
                tabResult.issues.push(`${tabDisplayName} tab content not found`);
                return tabResult;
            }

            tabResult.exists = true;

            // Count and analyze citation cards
            const citationCards = await tabContent.locator('.enhanced-citation-card');
            const cardCount = await citationCards.count();
            tabResult.cardCount = cardCount;

            if (cardCount === 0) {
                tabResult.issues.push(`No citation cards found in ${tabDisplayName} tab`);
                return tabResult;
            }

            // Analyze each card
            for (let i = 0; i < cardCount; i++) {
                const cardAnalysis = await this.analyzeCard(page, citationCards.nth(i), i + 1, tabDisplayName);
                tabResult.cards.push(cardAnalysis);
                
                // Collect issues
                if (cardAnalysis.issues.length > 0) {
                    tabResult.issues.push(...cardAnalysis.issues.map(issue => `Card ${i + 1}: ${issue}`));
                }
            }

        } catch (error) {
            tabResult.issues.push(`Tab analysis error: ${error.message}`);
        }

        return tabResult;
    }

    async analyzeCard(page, cardLocator, cardNumber, tabName) {
        const cardAnalysis = {
            cardNumber,
            tabName,
            text: '',
            html: '',
            issues: [],
            hasUndefined: false,
            hasUnknown: false,
            hasEmptyFields: false
        };

        try {
            // Get card text and HTML
            cardAnalysis.text = await cardLocator.textContent();
            cardAnalysis.html = await cardLocator.innerHTML();

            // Check for common issues
            const text = cardAnalysis.text.toLowerCase();
            const html = cardAnalysis.html.toLowerCase();

            // Check for "undefined"
            if (text.includes('undefined') || html.includes('undefined')) {
                cardAnalysis.hasUndefined = true;
                cardAnalysis.issues.push('Contains "undefined" values');
            }

            // Check for "unknown"
            if (text.includes('unknown') || html.includes('unknown')) {
                cardAnalysis.hasUnknown = true;
                cardAnalysis.issues.push('Contains "unknown" values');
            }

            // Check for empty or missing critical fields
            const criticalPatterns = [
                /\(\s*\)/,  // Empty parentheses
                /:\s*$/,    // Colon with nothing after
                /authors:\s*$/i,
                /year:\s*$/i,
                /journal:\s*$/i
            ];

            for (const pattern of criticalPatterns) {
                if (pattern.test(text)) {
                    cardAnalysis.hasEmptyFields = true;
                    cardAnalysis.issues.push('Has empty critical fields');
                    break;
                }
            }

            // Check for specific problematic patterns
            if (text.includes('() -')) {
                cardAnalysis.issues.push('Missing author/year information');
            }

            if (text.includes('level 4') && text.includes('unknown')) {
                cardAnalysis.issues.push('Defaulted to Level 4 with unknown data');
            }

        } catch (error) {
            cardAnalysis.issues.push(`Card analysis error: ${error.message}`);
        }

        return cardAnalysis;
    }

    getTabDisplayName(tabName) {
        const displayNames = {
            'mechanisms': 'Mechanisms',
            'benefits': 'Benefits',
            'safety': 'Safety'
        };
        return displayNames[tabName] || tabName;
    }

    processAuditResult(supplement, auditResult) {
        // Categorize issues by type
        for (const [tabName, tabData] of Object.entries(auditResult.tabs)) {
            this.results.tabResults[tabName].push({
                supplement: supplement.name,
                id: supplement.id,
                ...tabData
            });

            // Process card issues
            for (const card of tabData.cards || []) {
                if (card.hasUndefined) {
                    this.results.issuesByType.undefined.push({
                        supplement: supplement.name,
                        id: supplement.id,
                        tab: tabName,
                        card: card.cardNumber,
                        issues: card.issues
                    });
                }

                if (card.hasUnknown) {
                    this.results.issuesByType.unknown.push({
                        supplement: supplement.name,
                        id: supplement.id,
                        tab: tabName,
                        card: card.cardNumber,
                        issues: card.issues
                    });
                }

                if (card.hasEmptyFields) {
                    this.results.issuesByType.missingData.push({
                        supplement: supplement.name,
                        id: supplement.id,
                        tab: tabName,
                        card: card.cardNumber,
                        issues: card.issues
                    });
                }
            }
        }

        // Process overall issues
        if (auditResult.overallIssues.length > 0) {
            this.results.issuesByType.renderingErrors.push({
                supplement: supplement.name,
                id: supplement.id,
                issues: auditResult.overallIssues
            });
        }
    }

    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 ENHANCED CITATION AUDIT REPORT');
        console.log('='.repeat(80));

        // Summary statistics
        const totalIssues = Object.values(this.results.issuesByType).reduce((sum, issues) => sum + issues.length, 0);
        const supplementsWithIssues = new Set();
        
        Object.values(this.results.issuesByType).forEach(issues => {
            issues.forEach(issue => supplementsWithIssues.add(issue.id));
        });

        console.log(`\n📈 SUMMARY:`);
        console.log(`   Total Enhanced Supplements: ${this.results.totalSupplements}`);
        console.log(`   Supplements with Issues: ${supplementsWithIssues.size}`);
        console.log(`   Supplements Working Perfectly: ${this.results.totalSupplements - supplementsWithIssues.size}`);
        console.log(`   Total Issues Found: ${totalIssues}`);

        // Issue breakdown
        console.log(`\n🔍 ISSUE BREAKDOWN:`);
        console.log(`   "Undefined" Issues: ${this.results.issuesByType.undefined.length}`);
        console.log(`   "Unknown" Issues: ${this.results.issuesByType.unknown.length}`);
        console.log(`   Missing Data Issues: ${this.results.issuesByType.missingData.length}`);
        console.log(`   Rendering Errors: ${this.results.issuesByType.renderingErrors.length}`);

        // Detailed issue reports
        this.reportIssuesByType('UNDEFINED VALUES', this.results.issuesByType.undefined);
        this.reportIssuesByType('UNKNOWN VALUES', this.results.issuesByType.unknown);
        this.reportIssuesByType('MISSING DATA', this.results.issuesByType.missingData);
        this.reportIssuesByType('RENDERING ERRORS', this.results.issuesByType.renderingErrors);

        // Save detailed report to file
        this.saveReportToFile();

        console.log('\n✅ Audit complete! Detailed report saved to enhanced-citation-audit-report.json');
    }

    reportIssuesByType(title, issues) {
        if (issues.length === 0) {
            console.log(`\n✅ ${title}: None found`);
            return;
        }

        console.log(`\n❌ ${title} (${issues.length} issues):`);
        issues.forEach((issue, index) => {
            console.log(`   ${index + 1}. ${issue.supplement} (ID: ${issue.id})`);
            if (issue.tab) console.log(`      Tab: ${issue.tab}, Card: ${issue.card || 'N/A'}`);
            issue.issues.forEach(desc => console.log(`      - ${desc}`));
        });
    }

    saveReportToFile() {
        const reportData = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSupplements: this.results.totalSupplements,
                supplementsWithIssues: new Set(Object.values(this.results.issuesByType).flat().map(i => i.id)).size,
                totalIssues: Object.values(this.results.issuesByType).reduce((sum, issues) => sum + issues.length, 0)
            },
            enhancedSupplements: this.results.enhancedSupplements,
            issuesByType: this.results.issuesByType,
            tabResults: this.results.tabResults
        };

        fs.writeFileSync('enhanced-citation-audit-report.json', JSON.stringify(reportData, null, 2));
    }
}

// Run the audit
(async () => {
    const auditor = new EnhancedCitationAuditor();
    await auditor.runCompleteAudit();
})();
