// Both applications use the Scheduler's single sidebar partial.
(function () {
    const partialUrl = new URL('../../scheduler/partials/sidebar.html', document.currentScript.src);
    async function loadSidebar() {
        const placeholder = document.getElementById('sidebar-placeholder');
        if (!placeholder) return;
        try {
            const response = await fetch(partialUrl, { credentials: 'omit' });
            if (!response.ok) throw new Error('Sidebar request failed: ' + response.status);
            const template = document.createElement('template');
            template.innerHTML = await response.text();
            template.content.querySelectorAll('a[href]').forEach(a => { a.href = new URL(a.getAttribute('href'), partialUrl).href; });
            template.content.querySelectorAll('img[src]').forEach(img => { img.src = new URL(img.getAttribute('src'), partialUrl).href; });
            placeholder.replaceWith(template.content);
            document.dispatchEvent(new Event('sidebar:ready'));
        } catch (error) { console.error('Failed to load shared sidebar:', error); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadSidebar);
    else loadSidebar();
})();
