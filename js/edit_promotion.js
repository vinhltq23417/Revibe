(function(){
  const DATA_URL = '../data/promotions.json';
  const EXTRA_KEY = 'revibe_promotions_extra';
  function q(k){ try{ return new URLSearchParams(location.search).get(k)||''; }catch(e){ return ''; } }
  function readExtras(){ try { return JSON.parse(localStorage.getItem(EXTRA_KEY)||'[]'); } catch(e){ return []; } }
  function writeExtras(arr){ try { localStorage.setItem(EXTRA_KEY, JSON.stringify(arr)); } catch(e){} }

  let current; let code;

  function setRadio(name, value){
    const el = document.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
    if (el) el.checked = true;
  }
  function getRadio(name){ return document.querySelector(`input[name="${name}"]:checked`)?.value || ''; }

  async function load(){
    code = q('code');
    const res = await fetch(DATA_URL); const json = await res.json();
    const base = (json.promotions||[]).find(p => p.code === code);
    const extra = readExtras().find(p => p.code === code);
    current = { ...base, ...extra };
    if (!current) return;
    document.getElementById('epName').value = current.name || '';
    setRadio('type', current.type || 'Discount %');
    document.getElementById('epDiscount').value = current.discountValue || '';
    document.getElementById('epMin').value = current.minOrder || '';
    document.getElementById('epMax').value = current.maxDiscount || '';
    setRadio('eligible', current.eligible || 'All customers');
    if (current.startDate) document.getElementById('epStart').value = current.startDate.slice(0,10);
    if (current.endDate) document.getElementById('epEnd').value = current.endDate.slice(0,10);
    document.getElementById('epLimit').value = current.limitPerUser || '';
    document.getElementById('epUsage').value = current.usage || '';
  }

  function save(){
    const updated = {
      code,
      name: document.getElementById('epName').value || '',
      type: getRadio('type') || 'Discount %',
      discountValue: document.getElementById('epDiscount').value || '',
      minOrder: document.getElementById('epMin').value || '',
      maxDiscount: document.getElementById('epMax').value || '',
      eligible: getRadio('eligible') || 'All customers',
      startDate: document.getElementById('epStart').value || '',
      endDate: document.getElementById('epEnd').value || '',
      limitPerUser: document.getElementById('epLimit').value || '',
      usage: document.getElementById('epUsage').value || '',
      status: current.status || 'Upcoming'
    };
    const extras = readExtras();
    const idx = extras.findIndex(p => p.code === code);
    if (idx >= 0) extras[idx] = { ...extras[idx], ...updated };
    else extras.push(updated);
    writeExtras(extras);
    location.href = 'PromotionManagement.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    document.getElementById('epBack').addEventListener('click', ()=> history.back());
    document.getElementById('epCancel').addEventListener('click', ()=> history.back());
    document.getElementById('epSave').addEventListener('click', save);
  });
})();





