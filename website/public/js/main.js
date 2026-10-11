// GTAMP website client JS
(function () {
  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(q => q.addEventListener('click', () => q.parentElement.classList.toggle('open')));

  // Live server list on /servers
  const listEl = document.getElementById('server-list');
  if (listEl) {
    const search = document.getElementById('srv-search');
    const tagSel = document.getElementById('srv-tag');
    let all = [];
    async function refresh() {
      try {
        const r = await fetch('/api/servers/live');
        const d = await r.json();
        all = d.servers || [];
        // populate tag dropdown
        if (tagSel) {
          const tags = new Set(); all.forEach(s => (s.tags||[]).forEach(t => tags.add(t)));
          const cur = tagSel.value;
          tagSel.innerHTML = '<option value="">All tags</option>' + [...tags].map(t => `<option value="${t}">${t}</option>`).join('');
          tagSel.value = cur;
        }
        render();
      } catch (e) { if (listEl) listEl.innerHTML = '<div class="muted">Could not load servers.</div>'; }
    }
    function render() {
      const q = (search && search.value || '').toLowerCase();
      const t = tagSel ? tagSel.value : '';
      const rows = all.filter(s => {
        const name = (s.name||'').toLowerCase() + ' ' + (s.mode||'').toLowerCase() + ' ' + (s.tags||[]).join(' ').toLowerCase();
        if (q && !name.includes(q)) return false;
        if (t && !(s.tags||[]).includes(t)) return false;
        return true;
      });
      if (!rows.length) { listEl.innerHTML = '<div class="muted">No servers match.</div>'; return; }
      listEl.innerHTML = rows.map(s => `
        <div class="server-row" onclick="location='/servers/${s.id}'">
          <div class="server-icon">${(s.name||'S')[0]}</div>
          <div class="server-info">
            <div class="name"><span class="live-dot"></span>${escapeHtml(s.name)}</div>
            <div class="desc">${escapeHtml(s.desc||'')}</div>
          </div>
          <div class="server-meta">
            <div class="players">${s.players}/${s.maxPlayers} players</div>
            <div class="tags">${(s.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
          </div>
        </div>`).join('');
    }
    if (search) search.addEventListener('input', render);
    if (tagSel) tagSel.addEventListener('change', render);
    refresh();
    setInterval(refresh, 5000);
  }

  function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  window.escapeHtml = escapeHtml;
})();

// upvote + tags (from server detail page)
async function upvote(id) {
  try {
    const r = await fetch('/api/servers/' + id + '/upvote', { method: 'POST' });
    const d = await r.json();
    if (d.error === 'already') toast('Already upvoted');
    else if (d.error === 'login') location = '/login';
    else { toast('Upvoted! ⭐'); location.reload(); }
  } catch (e) { toast('Error'); }
}
async function saveTags(id) {
  const inp = document.getElementById('tag-input');
  const tags = inp.value.split(',').map(t => t.trim()).filter(Boolean);
  try {
    await fetch('/api/servers/' + id + '/tags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tags }) });
    toast('Tags saved'); location.reload();
  } catch (e) { toast('Error'); }
}
function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2500);
}
