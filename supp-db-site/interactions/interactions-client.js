(function(){
    var INDEX = window.__INTERACTION_INDEX__ || [];
    var CATEGORIES = window.__INTERACTION_CATEGORIES__ || [];
    var CAT_BY_SLUG = {};
    CATEGORIES.forEach(function(c){ CAT_BY_SLUG[c.slug] = c; });

    var input = document.getElementById('interaction-search');
    var resultsEl = document.getElementById('interaction-results');
    var detailEl = document.getElementById('interaction-detail');
    if (!input || !resultsEl || !detailEl) return;

    function sevLabel(sev){
        if (sev === 'avoid') return 'Avoid';
        if (sev === 'caution') return 'Caution';
        if (sev === 'monitor') return 'Monitor';
        if (sev === 'safe') return 'No Interaction';
        return 'Review';
    }

    function clear(el){ while (el.firstChild) el.removeChild(el.firstChild); }

    function mkEl(tag, cls, txt){
        var el = document.createElement(tag);
        if (cls) el.className = cls;
        if (txt != null) el.textContent = txt;
        return el;
    }

    function renderResults(q){
        clear(resultsEl);
        if (!q) return;
        var needle = q.toLowerCase();
        var matches = INDEX.filter(function(s){ return s.name.toLowerCase().indexOf(needle) !== -1; }).slice(0, 12);
        if (matches.length === 0) {
            resultsEl.appendChild(mkEl('div', 'empty-state', 'No supplement matches "' + q + '".'));
            return;
        }
        matches.forEach(function(s){
            var row = mkEl('div', 'interactions-result-row');
            row.setAttribute('role', 'option');
            row.setAttribute('tabindex', '0');
            var left = mkEl('div');
            left.appendChild(mkEl('span', 'supp-name', s.name));
            left.appendChild(mkEl('span', 'supp-meta', ' \u2014 ' + (s.category || 'Supplement')));
            row.appendChild(left);
            var flagged = s.interactions.filter(function(i){ return i.severity !== 'safe'; }).length;
            row.appendChild(mkEl('span', 'supp-meta', flagged + ' interaction' + (flagged === 1 ? '' : 's')));
            row.addEventListener('click', function(){ showDetail(s); });
            row.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showDetail(s); } });
            resultsEl.appendChild(row);
        });
    }

    function renderInteractionItem(i, suppName){
        var catSlug = i.categorySlug;
        var cat = catSlug ? CAT_BY_SLUG[catSlug] : null;
        var heading, advice, link = null;
        if (i.severity === 'safe') {
            heading = 'No significant drug interactions reported';
            advice = 'Based on published safety summaries, ' + suppName + ' has no flagged drug class interactions. Always review specific product labels and consult your prescriber before combining with any medication.';
        } else if (cat) {
            heading = cat.name;
            advice = cat.description + ' ' + cat.clinicalAdvice;
            var a = document.createElement('a');
            a.className = 'drill-link';
            a.href = cat.slug + '.html';
            a.textContent = 'See all supplements flagged for ' + (cat.shortName || cat.name) + ' \u2192';
            link = a;
        } else {
            heading = 'Other / general';
            advice = 'Clinical significance unclear \u2014 consult your prescriber if you take this type of medication.';
        }

        var item = mkEl('div', 'interaction-item sev-' + i.severity);
        var topRow = mkEl('div');
        topRow.appendChild(mkEl('span', 'badge sev-' + i.severity, sevLabel(i.severity)));
        topRow.appendChild(mkEl('span', 'category', heading));
        item.appendChild(topRow);
        item.appendChild(mkEl('div', 'raw-text', 'Raw: "' + i.rawText + '"'));
        item.appendChild(mkEl('div', 'advice-text', advice));
        if (link) item.appendChild(link);
        return item;
    }

    function showDetail(s){
        clear(resultsEl);
        input.value = s.name;
        clear(detailEl);
        var panel = mkEl('div', 'interactions-panel');
        var h = mkEl('h3');
        var icon = document.createElement('i');
        icon.className = 'fas fa-vial mr-2';
        icon.style.color = '#60a5fa';
        h.appendChild(icon);
        h.appendChild(document.createTextNode(s.name + ' \u2014 drug interactions'));
        panel.appendChild(h);

        var p = mkEl('p', 'text-gray-400 text-sm mb-4');
        p.appendChild(document.createTextNode('Read the full monograph: '));
        var monoLink = document.createElement('a');
        monoLink.className = 'text-blue-400 underline';
        monoLink.href = '../supplements/' + s.slug + '.html';
        monoLink.textContent = s.name + ' evidence review';
        p.appendChild(monoLink);
        panel.appendChild(p);

        s.interactions.forEach(function(i){ panel.appendChild(renderInteractionItem(i, s.name)); });
        detailEl.appendChild(panel);
        detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        try {
            if (typeof window.posthog !== 'undefined' && window.posthog.capture) {
                window.posthog.capture('interaction_check', {
                    supplement: s.name,
                    slug: s.slug,
                    flagged_count: s.interactions.filter(function(i){ return i.severity !== 'safe'; }).length
                });
            }
        } catch (e) { /* non-blocking */ }
    }

    var debounceTimer = null;
    input.addEventListener('input', function(){
        clearTimeout(debounceTimer);
        var q = input.value.trim();
        debounceTimer = setTimeout(function(){ renderResults(q); }, 120);
    });
    input.addEventListener('focus', function(){ if (input.value.trim()) renderResults(input.value.trim()); });

    var m = window.location.search.match(/[?&]q=([^&]+)/);
    if (m) {
        var pre = decodeURIComponent(m[1]).replace(/\+/g, ' ');
        input.value = pre;
        renderResults(pre);
    }
})();