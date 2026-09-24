/* STS portfolio demo: fictional data, no server writes or live device access. */
(() => {
    'use strict';
    const root = new URL('../', document.currentScript.src).href;
    const key = 'sts-portfolio-v1:' + new URL(root).pathname + ':';
    const scoped = storage => ({ getItem: k => storage.getItem(key + k), setItem: (k, v) => storage.setItem(key + k, String(v)), removeItem: k => storage.removeItem(key + k) });
    const session = scoped(sessionStorage), local = scoped(localStorage);
    const today = () => new Date().toISOString().slice(0, 10);
    const stamp = () => new Date().toISOString().replace('T', ' ').slice(0, 19);
    const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const names = ['Alex Morgan', 'Jordan Lee', 'Casey Rivera', 'Taylor Brooks'];
    const viewNames = ['total_equipment_return', 'total_ewaste', 'total_room_check', 'Total_printer_check', 'bulk_delivery_view', 'toner_delivery_view', 'other_delivery_view', 'individual_delivery_view'];
    function seed() {
        const views = Object.fromEntries(viewNames.map(v => [v, []]));
        for (let i = 1; i <= 65; i++) views.total_equipment_return.push({ id: i, Date: today(), Asset_Tag: String(800000 + i), Delivered_By: names[i % 4], Staff_Member_Assigned: names[(i + 1) % 4], Additional_Information: ['Laptop and charger returned', 'Monitor returned after upgrade', 'Docking station tested'][i % 3] });
        for (let i = 1; i <= 8; i++) {
            views.total_ewaste.push({ id: 100 + i, Date: today(), Campus: i % 2 ? 'Harborside' : 'Down-City', Bin: i % 2 ? '1' : '2', Asset_Tag: String(900000 + i), Device: 'Laptop', Model: 'DemoBook 14', Serial_Number: 'DEMO-SERIAL-' + i, SSD_Serial: 'DEMO-SSD-' + i });
            views.total_room_check.push({ id: 200 + i, Date: today(), Building: i % 2 ? 'CSI' : 'XVA', Room: String(100 + i), Checked_By: names[i % 4], Notes: 'Display, audio and workstation checked' });
            views.Total_printer_check.push({ id: 400 + i, Date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), IP_Address: '192.0.2.' + (i <= 4 ? 10 + i : 16 + i), Install_Location: 'Demo Room ' + (100 + i), Checked_By: names[i % 4], Model_Number: 'Demo Laser 400', Black_Cartridge: '76%', Tray_2: 'Full' });
            for (const type of ['bulk', 'toner', 'other', 'individual']) views[type + '_delivery_view'].push({ id: 300 + i, Date: today(), Tracking_Number: 'DEMO-PACKAGE-' + i, Delivery_Company: 'Sample Courier', Type: type, Description: type === 'toner' ? 'Black toner cartridge' : 'Classroom equipment', Received_By: names[i % 4] });
        }
        return { version: 1, next: 1000, views, announcements: [{ id: 1, subject: 'Welcome to the STS demo', text: 'Explore the forms, dashboards and printer checks. All records are fictional; changes stay in this browser tab.', time_created: stamp(), likes: 7, dislikes: 0 }, { id: 2, subject: 'Classroom readiness', text: 'Check display connections and audio before the next teaching session.', time_created: stamp(), likes: 4, dislikes: 0 }], work: [{ id: 501, ticket: 'DEMO-1042', name: 'Jordan Lee', description: 'Replaced a classroom display cable and verified audio.', difficulty: 2, time: stamp(), status: 'pending' }, { id: 502, ticket: 'DEMO-1043', name: 'Casey Rivera', description: 'Prepared six demo laptops for a lab refresh.', difficulty: 4, time: stamp(), status: 'pending' }], users: names.map((name, i) => ({ name, campus: i % 2 ? 'Harborside' : 'Downcity', active: '1', staff: false })), bins: { harborside: { number: '1', date: today() }, downcity: { number: '2', date: today() } }, semester: new Date(new Date().getFullYear(), 11, 15).toISOString().slice(0, 10), checks: [], reviews: [], lastScan: stamp() };
    }
    let state = seed();
    try { const saved = JSON.parse(session.getItem('state')); if (saved?.version === 1 && viewNames.every(v => Array.isArray(saved.views?.[v])) && ['announcements', 'work', 'users', 'checks', 'reviews'].every(v => Array.isArray(saved[v])) && Number.isSafeInteger(saved.next)) state = saved; } catch { }
    const save = () => { try { session.setItem('state', JSON.stringify(state)); } catch { alert('Demo storage is full. Reset the demo to continue saving changes.'); } };
    session.setItem('userName', 'Alex Morgan'); session.setItem('isLoggedIn', 'true'); session.setItem('is_staff', location.pathname.endsWith('/admin.html') ? 'true' : 'false'); session.setItem('campus', 'Downcity');
    const response = (value, status = 200) => new Response(typeof value === 'string' ? value : JSON.stringify(value), { status, headers: { 'Content-Type': typeof value === 'string' ? 'text/plain' : 'application/json' } });
    const ok = () => response({ success: true, message: 'Saved in this demo tab.' });
    const campus = v => String(v || 'Downcity').toLowerCase().replace(/[^a-z]/g, '') === 'harborside' ? 'harborside' : 'downcity';
    const printers = c => Array.from({ length: 4 }, (_, i) => ({ IP_Address: '192.0.2.' + (campus(c) === 'harborside' ? 21 + i : 11 + i), install_location: (campus(c) === 'harborside' ? 'Harborside' : 'Downcity') + ' Demo Room ' + (101 + i), model: i % 2 ? 'Demo Color Laser' : 'Demo Mono Laser' }));
    const tree = ip => ({ RootNode: ip, Status: 'Online', Children: [{ Text: 'Demo Laser 400' }, { Text: 'Black Cartridge: 76%' }, { Text: 'Cyan Cartridge: 35%' }, { Text: 'Magenta Cartridge: 58%' }, { Text: 'Yellow Cartridge: 12%' }, { Text: 'Black Drum: 83%' }, { Text: 'Maintenance Kit: 90%' }, { Text: 'Tray 2: Full' }, { Text: 'Tray 3: Low' }] });
    function fields(body) {
        let entries = [];
        if (body instanceof FormData || body instanceof URLSearchParams) entries = [...body.entries()];
        else if (typeof body === 'string') { try { entries = Object.entries(JSON.parse(body)); } catch { entries = [...new URLSearchParams(body).entries()]; } }
        return Object.fromEntries(entries.filter(([k, v]) => !['__proto__', 'prototype', 'constructor'].includes(k) && typeof v === 'string' && !/password|csrf/i.test(k)).map(([k, v]) => [k, v.slice(0, 2000)]));
    }
    function record(endpoint, f) {
        const id = state.next++, date = today(); let view, row;
        if (endpoint === 'FWSubmit.php') { state.work.unshift({ id, ticket: f.Ticket_Number || 'DEMO-TASK', name: 'Alex Morgan', description: f.Work_Description || 'Demo task', difficulty: Math.max(1, Math.min(5, Number(f.range) || 1)), time: stamp(), status: 'pending' }); save(); return; }
        if (endpoint === 'EqSubmit.php') { view = 'total_equipment_return'; row = { Asset_Tag: f.asset_tag, Delivered_By: f.deliverer, Staff_Member_Assigned: f.Staff_Member_Assigned, Additional_Information: f.additional_info }; }
        if (endpoint === 'EwSubmit.php') { view = 'total_ewaste'; row = { Campus: f.Campus, Bin: f.Bin_Num || state.bins[campus(f.Campus)].number, Asset_Tag: f['Asset-Tag'], Device: f['Device-Type'], Model: f['Model-Number'], Serial_Number: f.Serial_Number, SSD_Serial: f.SSD_Serial }; }
        if (endpoint === 'RcSubmit.php') { view = 'total_room_check'; row = { Building: f['Building-dropdown'], Room: f['Room-Number'], Checked_By: 'Alex Morgan', Notes: f.room_notes, Checks: Object.keys(f).filter(k => !['date_checked', 'Building-dropdown', 'Room-Number', 'room_notes', 'usersName', 'form_open_time'].includes(k)).join(', ') }; }
        if (endpoint === 'DiSubmit.php') { const type = String(f['type-of-delivery'] || 'other').toLowerCase(); view = ['bulk', 'toner', 'individual', 'other'].includes(type) ? type + '_delivery_view' : 'other_delivery_view'; row = { Tracking_Number: f['tracking-number'], Delivery_Company: f.delivery_company, Type: type, Description: f.contents || f['item-description'] || f['toner-id'] || 'Delivery', Received_By: 'Alex Morgan', ...f }; }
        if (endpoint === 'review.php') { state.reviews.push({ id, Date: date, ...f }); save(); return; }
        if (!view) throw new Error('Unknown demo submission');
        state.views[view].unshift({ id, Date: date, ...row }); save();
    }
    async function request(input, options = {}) {
        const url = new URL(String(input), location.href), endpoint = url.pathname.split('/').pop(), q = url.searchParams, f = fields(options.body), action = q.get('action');
        if (url.origin !== new URL(root).origin) throw new Error('External requests are disabled in this demo.');
        if (endpoint === 'sidebar.html' || /^(intro|setup|FrontEnd|api|faq|GitDoc|GitGPG)\.(md|MD)$/.test(endpoint)) {
            const target = endpoint === 'sidebar.html' ? new URL('partials/sidebar.html', root) : new URL('Docs/' + endpoint, root);
            return fetch(target, { credentials: 'omit' });
        }
        if (/^(FWSubmit|EqSubmit|EwSubmit|RcSubmit|DiSubmit|review)\.php$/.test(endpoint)) { record(endpoint, f); return ok(); }
        if (endpoint === 'csrf_token.php') return response({ token: 'static-demo-no-authentication' });
        if (endpoint === 'TicketGraph.php') return response({ labels: Array.from({ length: 7 }, (_, i) => new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { weekday: 'short' })), datasets: [{ label: 'Work recorded', data: [8, 12, 9, 15, 11, 6, state.work.length + 4], borderColor: '#36a2eb', backgroundColor: 'rgba(54,162,235,.2)', tension: .3 }] });
        if (endpoint === 'percentDone.php') return response({ labels: ['Checked', 'Not Checked'], values: [state.checks.length, Math.max(0, 8 - state.checks.length)] });
        if (endpoint === 'roomChart.php') return response({ labels: ['Checked', 'Not Checked'], values: [state.views.total_room_check.length, Math.max(0, 30 - state.views.total_room_check.length)] });
        if (endpoint === 'expand.php') { const rows = state.views[q.get('view')]; return rows ? response({ success: true, columns: [...new Set(rows.flatMap(Object.keys))], data: rows }) : response({ success: false, error: 'Unknown view' }, 400); }
        if (endpoint === 'search-assets.php') { const term = (q.get('q') || '').toLowerCase(); return response(Object.entries(state.views).flatMap(([table, rows]) => rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(term))).map(r => ({ id: r.id, table, asset: r.Asset_Tag || r.Tracking_Number || r.Room || r.IP_Address, description: r.Additional_Information || r.Description || r.Notes || r.Model || 'Demo record', tag: table, date: r.Date }))).slice(0, 30)); }
        if (endpoint === 'admin.php') return response(state.work.filter(w => w.status === 'pending'));
        if (endpoint === 'update_status.php') { const w = state.work.find(w => w.id === Number(f.id)); if (!w || !['approved', 'denied'].includes(f.status)) return response({ success: false }, 400); w.status = f.status; save(); return ok(); }
        if (endpoint === 'AcView.php') return response({ success: true, data: state.announcements });
        if (endpoint === 'AcSubmit.php') { state.announcements.unshift({ id: state.next++, subject: f.announcementSubject || 'Demo announcement', text: f.announcementText || '', time_created: stamp(), likes: 0, dislikes: 0 }); save(); return ok(); }
        if (endpoint === 'AcDelete.php') { state.announcements = state.announcements.filter(a => a.text !== f.text || a.time_created !== f.time); save(); return ok(); }
        if (endpoint === 'AcInteraction.php') { const a = state.announcements.find(a => a.text === f.text); if (a) a[f.action === 'thumbsUp' ? 'likes' : 'dislikes']++; save(); return ok(); }
        if (endpoint === 'getExistingUsers.php') return response('<option value="" disabled selected>Select User</option>' + state.users.map(u => `<option value="${esc(u.name)}" data-campus="${esc(u.staff ? 'Staff' : u.campus)}" data-active="${esc(u.active)}">${esc(u.name)}</option>`).join(''));
        if (endpoint === 'usersForm.php') {
            if (f.submitType === 'resetPassword') return response({ success: true, tempPassword: 'DEMO-ONLY (no real account)' });
            const name = f.usersName || f.existingUsers; if (!name) return response({ success: false, message: 'Enter a demo name' }, 400);
            let u = state.users.find(u => u.name === name); if (!u) { u = { name }; state.users.push(u); } Object.assign(u, { campus: f.campusRadio || 'Downcity', active: f.activeRadio === '1' ? '1' : '0', staff: f.accountRadio === 'Staff' }); save(); return ok();
        }
        if (endpoint === 'semDateSubmit.php') { if (action === 'submit') { state.semester = f.endOfSemester; save(); } return response({ errormessage: state.semester }); }
        if (endpoint === 'Ewaste_bin.php') {
            const bin = state.bins[campus(f.bin_campus || f.campus || f.Campus)];
            if (action === 'submit') { bin.number = f.bin_num || bin.number; bin.date = f.bin_start || today(); save(); }
            if (action === 'select') return response([bin.number, '3', '4', '5'].filter((v, i, a) => a.indexOf(v) === i).map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join(''));
            return response({ bin_num: bin.number, errormessage: bin.date });
        }
        if (endpoint === 'printBins.php') return response(state.views.total_ewaste.map(r => ({ campus: r.Campus, bin: r.Bin, asset: r.Asset_Tag, device: r.Device, model: r.Model, tag: r.Serial_Number })));
        if (endpoint === 'roomsChecked.php') return response({ rooms: state.views.total_room_check.filter(r => r.Building === q.get('building')).map(r => esc(r.Room)).join(', ') || 'No rooms checked yet' });
        if (endpoint === 'get_pxe_dashboard.php') return response(['In Progress', 'Complete', 'Failed', 'In Progress', 'Complete', 'Complete'].map((status, i) => ({ PCNAME: 'DEMO-LAB-' + String(i + 1).padStart(2, '0'), STATUS: status, IS_STUCK: i === 3, START_TIME: today() + ' 09:00:00', END_TIME: status === 'Complete' ? today() + ' 09:24:00' : null, DURATION_MINUTES: status === 'Complete' ? 24 + i : 38 })));
        if (url.pathname.includes('/demo-labs/')) {
            if (endpoint === 'groups') return response((url.pathname.includes('1101') ? [{ id: 101, name: 'Demo Computing Lab' }, { id: 102, name: 'Demo Design Lab' }] : [{ id: 103, name: 'Demo Library Lab' }]));
            return response({ results: [1, 2, 3].map(i => ({ name: 'DEMO-PC-' + i, ip_addresses: ['192.0.2.' + (50 + i)], mac_addresses: ['02:00:00:00:00:0' + i], operating_systems: [{ name: 'Windows', version: '11' }], host_name: 'demo-workstation-' + i, manufacturer: 'Demo Hardware', model: 'Demo Desktop', form_factor: 'Desktop', remote_access_address: 'Not connected in demo', client_version: 'Demo', allow_student_routing: false })) });
        }
        if (endpoint === 'printer-api.php') {
            const ip = q.get('ip'), all = [...printers('Downcity'), ...printers('Harborside')];
            if (action === 'get_printers') { const p = printers(q.get('campus')); return response({ success: true, count: p.length, printers: p }); }
            if (['check_single_printer', 'get_printer_status'].includes(action)) { if (!all.some(p => p.IP_Address === ip)) return response({ error: 'Use one of the fictional printer addresses shown on this page.' }, 400); return response({ success: true, printer: tree(ip), data: { printer: tree(ip) }, timestamp: stamp() }); }
            if (action === 'get_current_day_checks') return response({ checks: state.checks, count: state.checks.length });
            if (action === 'get_active_students') return response({ students: state.users.filter(u => u.active === '1') });
            if (action === 'get_last_scan') return response({ timestamp: state.lastScan, time_ago: 'Demo: ' + state.lastScan });
            if (action === 'submit_check') { if (!all.some(p => p.IP_Address === f.IP_Address)) return response({ error: 'Unknown demo printer' }, 400); state.checks = state.checks.filter(c => c.IP_Address !== f.IP_Address); state.checks.push({ ...f, Check_Date: stamp() }); state.views.Total_printer_check.unshift({ id: state.next++, Date: today(), ...f }); save(); return response({ success: true, id: state.next - 1 }); }
        }
        if (endpoint === 'demo-full-scan' || endpoint === 'timestamp.php') { state.lastScan = stamp(); save(); return ok(); }
        if (endpoint === 'DMPSFetch.php') { return response('Demo AV controller: online; display on; input HDMI 1; volume 45%. No device was contacted.'); }
        throw new Error('No static demo handler for ' + endpoint);
    }
    function init() {
        // Preserve native form validation and the original custom submit handlers.
        document.addEventListener('submit', async event => {
            if (event.defaultPrevented) return;
            const form = event.target, url = new URL(form.action || location.href), endpoint = url.pathname.split('/').pop();
            if (/^(EqSubmit|DiSubmit|FWSubmit|review)\.php$/.test(endpoint)) {
                event.preventDefault(); try { const r = await request(url, { method: 'POST', body: new FormData(form) }); if (r.ok) location.href = new URL(endpoint === 'review.php' ? 'INDEX-HTML/thankyou.html' : 'INDEX-HTML/main.html', root); else alert('Demo submission failed.'); } catch (e) { alert(e.message); }
            } else { event.preventDefault(); }
        });
        const dropdown = document.querySelector('#dropdown');
        if (dropdown) {
            const style = document.createElement('style');
            style.textContent = `
                #dropdown .demo-mode { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:12px 15px; color:var(--text-color, #333); cursor:pointer; }
                #dropdown .demo-mode input { display:block; position:absolute; opacity:0; width:1px; height:1px; }
                #dropdown .demo-mode-track { position:relative; width:44px; height:24px; flex-shrink:0; border-radius:20px; background:#64748b; }
                #dropdown .demo-mode-track::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:white; transition:transform .15s; }
                #dropdown .demo-mode input:checked + .demo-mode-track { background:#4c6af5; }
                #dropdown .demo-mode input:checked + .demo-mode-track::after { transform:translateX(20px); }
                #dropdown .demo-mode input:focus-visible + .demo-mode-track { outline:2px solid #4c6af5; outline-offset:3px; }
                #dropdown .demo-reset { display:block; width:calc(100% - 30px); margin:8px 15px 12px; padding:10px 12px; border:0; border-radius:3px; background:#b42318; color:#fff; font:inherit; text-align:center; cursor:pointer; }
                #dropdown .demo-reset:hover { background:#912018; }
                #dropdown .demo-reset:focus-visible { outline:2px solid #b42318; outline-offset:3px; }
            `;
            document.head.append(style);
            const label = document.createElement('div');
            if (location.pathname.endsWith('/admin.html')) session.setItem('demoRole', 'admin');
            else if (location.pathname.endsWith('/main.html')) session.setItem('demoRole', 'worker');
            const mode = document.createElement('label');
            mode.className = 'demo-mode';
            const worker = document.createElement('span'); worker.textContent = 'Worker';
            const toggle = document.createElement('input');
            toggle.type = 'checkbox'; toggle.id = 'demoRoleToggle';
            toggle.setAttribute('role', 'switch'); toggle.setAttribute('aria-label', 'Admin demo');
            toggle.checked = session.getItem('demoRole') === 'admin';
            const track = document.createElement('span'); track.className = 'demo-mode-track'; track.setAttribute('aria-hidden', 'true');
            const admin = document.createElement('span'); admin.textContent = 'Admin';
            mode.append(worker, toggle, track, admin);
            toggle.addEventListener('change', () => {
                session.setItem('demoRole', toggle.checked ? 'admin' : 'worker');
                location.href = new URL(toggle.checked ? 'INDEX-HTML/admin.html' : 'INDEX-HTML/main.html', root);
            });
            dropdown.append(mode);
            const reset = document.createElement('button');
            reset.type = 'button'; reset.className = 'demo-reset'; reset.textContent = 'Reset demo data';
            reset.addEventListener('click', () => { session.removeItem('state'); location.reload(); });
            dropdown.append(reset);
        }
        // Search-result links open their matching table on arrival.
        if (location.pathname.endsWith('/Raw-Data.html')) setTimeout(() => { const view = new URLSearchParams(location.search).get('view'); if (viewNames.includes(view)) document.querySelector('[data-view="' + view + '"]')?.click(); }, 0);
        if (location.pathname.endsWith('/testDashboard.html')) document.getElementById('announcementForm')?.addEventListener('submit', () => { let p = document.getElementById('demo-av-result'); if (!p) { p = document.createElement('p'); p.id = 'demo-av-result'; document.body.append(p); } p.textContent = 'Demo controller: online · Display on · HDMI 1 · Volume 45%. No real device is contacted.'; });
    }
    window.STSDemo = { root, request, session, local, escape: esc, reset: () => { session.removeItem('state'); location.reload(); } };
    document.addEventListener('DOMContentLoaded', init);
})();
