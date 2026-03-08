/**
 * Browser verification script - runs in Playwright context
 * Tests multiple modified supplement pages for rendering errors
 *
 * Tests: no undefined/null in links, no JS errors on load,
 * citation data loads successfully, links are well-formed
 */

// Supplement IDs that were modified during the audit
const MODIFIED_IDS = [
    13, 14, 15, 16, 17, 22, 25, 26, 28, 30,
    31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 47, 48, 49, 50, 51,
    52, 53, 54, 55, 56, 57, 62, 64, 65, 66,
    67, 69, 73, 74, 75, 76, 77, 78, 79, 80,
    81, 82, 83, 84, 85, 86, 87, 88, 89, 90,
    91, 92, 5
];

async function testSupplement(id) {
    return new Promise((resolve) => {
        const result = { id, status: 'ok', errors: [] };

        try {
            app.showSupplementDetails(id);

            // Give it time to load
            setTimeout(() => {
                const modal = document.querySelector('.fixed.inset-0.modal-overlay');
                if (!modal) {
                    result.status = 'no_modal';
                    result.errors.push('Modal did not open');
                    resolve(result);
                    return;
                }

                // Check for broken links
                const allLinks = modal.querySelectorAll('a');
                allLinks.forEach(link => {
                    if (link.href.includes('undefined') || link.href.includes('null')) {
                        result.errors.push(`Broken link: ${link.href}`);
                    }
                    if (link.href.includes('pubmed') && !/\/\d+$/.test(link.href)) {
                        result.errors.push(`Invalid PMID link: ${link.href}`);
                    }
                });

                // Check for JS errors in text rendering
                const text = modal.textContent;
                if (text.includes('undefined') && !text.includes('undefined benefit')) {
                    // Check for "undefined" rendering artifacts (not natural word usage)
                    const matches = text.match(/(?:^|\s)undefined(?:\s|$)/g);
                    if (matches && matches.length > 0) {
                        result.errors.push(`"undefined" text found ${matches.length} times`);
                    }
                }
                if (text.includes('[object Object]')) {
                    result.errors.push('"[object Object]" rendering error');
                }
                if (text.includes('NaN')) {
                    result.errors.push('"NaN" rendering error');
                }

                // Count links
                result.pmidLinks = modal.querySelectorAll('a[href*="pubmed"]').length;
                result.doiLinks = modal.querySelectorAll('a[href*="doi.org"]').length;
                result.totalLinks = allLinks.length;

                // Get supplement name
                const h2 = modal.querySelector('h2');
                result.name = h2 ? h2.textContent.trim() : 'Unknown';

                if (result.errors.length > 0) result.status = 'errors';

                // Close modal
                modal.remove();

                resolve(result);
            }, 500);
        } catch (e) {
            result.status = 'exception';
            result.errors.push(e.message);
            resolve(result);
        }
    });
}

// This will be run via page.evaluate
async function runAllTests() {
    const results = [];
    const ids = MODIFIED_IDS;

    for (let i = 0; i < ids.length; i++) {
        const result = await testSupplement(ids[i]);
        results.push(result);
        // Small delay between tests
        await new Promise(r => setTimeout(r, 200));
    }

    const passed = results.filter(r => r.status === 'ok').length;
    const failed = results.filter(r => r.status === 'errors').length;
    const noModal = results.filter(r => r.status === 'no_modal').length;
    const exceptions = results.filter(r => r.status === 'exception').length;

    return {
        summary: { total: ids.length, passed, failed, noModal, exceptions },
        failures: results.filter(r => r.status !== 'ok'),
        allResults: results.map(r => ({
            id: r.id,
            name: r.name,
            status: r.status,
            pmidLinks: r.pmidLinks,
            doiLinks: r.doiLinks,
            errors: r.errors
        }))
    };
}
