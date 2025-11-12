(function(){
  const DATA_URL = '../data/promotions.json';
  const EXTRA_KEY = 'revibe_promotions_extra';
  const DELETED_KEY = 'revibe_promotions_deleted';

  function readExtras(){
    try { return JSON.parse(localStorage.getItem(EXTRA_KEY) || '[]'); } catch(e){ return []; }
  }
  function writeExtras(arr){ try { localStorage.setItem(EXTRA_KEY, JSON.stringify(arr)); } catch(e){} }
  function readDeleted(){ try { return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]'); } catch(e){ return []; } }
  function writeDeleted(arr){ try { localStorage.setItem(DELETED_KEY, JSON.stringify(arr)); } catch(e){} }

  function classForStatus(status){
    const s = (status||'').toLowerCase();
    if (s === 'active') return 'active';
    if (s === 'upcoming') return 'upcoming';
    if (s === 'expired') return 'expired';
    return '';
  }

  function render(promotions){
    const body = document.getElementById('promoBody');
    if (!body) return;
    body.innerHTML = promotions.map(p => `
      <tr>
        <td>${p.code}</td>
        <td>${p.name}</td>
        <td>${p.type}</td>
        <td>${p.discountValue}</td>
        <td>${new Date(p.startDate).toLocaleDateString('en-GB')}</td>
        <td>${new Date(p.endDate).toLocaleDateString('en-GB')}</td>
        <td><span class="status ${classForStatus(p.status)}">${p.status}</span></td>
        <td>${p.usage || ''}</td>
        <td>
          <button class="btn-edit" data-code="${p.code}">Edit</button>
          <button class="btn-delete" data-code="${p.code}">Delete</button>
        </td>
      </tr>
    `).join('');

    // wire actions
    body.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        location.href = `EditPromotion.html?code=${encodeURIComponent(code)}`;
      });
    });
    body.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.getAttribute('data-code');
        const ok = confirm('Do you want to delete this promotion?');
        if (!ok) return;
        const deleted = new Set(readDeleted());
        deleted.add(code);
        writeDeleted(Array.from(deleted));
        // also remove from extras if exists
        const extras = readExtras().filter(p => p.code !== code);
        writeExtras(extras);
        // remove from in-memory list and re-render immediately
        all = all.filter(p => p.code !== code);
        apply();
      });
    });
  }

  let all = [];
  function apply(){
    const filter = document.getElementById('promoFilter');
    const sortOrder = document.getElementById('sortOrder');
    const statusVal = (filter && filter.value) || 'all';
    const sortVal = (sortOrder && sortOrder.value) || 'latest';

    // Filter by status
    let list = statusVal === 'all' ? [...all] : all.filter(p => (p.status||'').toLowerCase() === statusVal.toLowerCase());

    // Sort by start date
    list.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      return sortVal === 'latest' ? dateB - dateA : dateA - dateB;
    });

    render(list);
  }

  document.addEventListener('DOMContentLoaded', async function(){
    try {
      const res = await fetch(DATA_URL);
      const json = await res.json();
      const deleted = new Set(readDeleted());
      all = ((json.promotions || []).concat(readExtras())).filter(p => !deleted.has(p.code));
      
      const filter = document.getElementById('promoFilter');
      const sortOrder = document.getElementById('sortOrder');
      const newBtn = document.getElementById('newPromotionBtn');
      
      if (newBtn) newBtn.addEventListener('click', () => {
        location.href = 'NewPromotion.html';
      });
      if (filter) filter.addEventListener('change', apply);
      if (sortOrder) sortOrder.addEventListener('change', apply);
      
      apply();
    } catch(e){
      console.error('Failed to load promotions', e);
    }
  });
})();