(function(){
  const EXTRA_KEY = 'revibe_promotions_extra';
  function readExtras(){ try { return JSON.parse(localStorage.getItem(EXTRA_KEY)||'[]'); } catch(e){ return []; } }
  function writeExtras(arr){ try { localStorage.setItem(EXTRA_KEY, JSON.stringify(arr)); } catch(e){} }
  function genCode(name){
    const base = (name || 'NEW').replace(/[^A-Za-z0-9]/g,'').toUpperCase();
    return (base.slice(0,5) || 'PROMO') + '-' + Math.random().toString(36).slice(2,6).toUpperCase();
  }

  document.addEventListener('DOMContentLoaded', function(){
    const back = document.getElementById('npBack');
    const cancel = document.getElementById('pmCancel');
    const create = document.getElementById('pmCreate');
    if (back) back.addEventListener('click', ()=> history.back());
    if (cancel) cancel.addEventListener('click', ()=> {
      ['pmName','pmDiscount','pmMin','pmMax','pmStart','pmEnd','pmLimit'].forEach(id=>{
        const el = document.getElementById(id); if (el) el.value='';
      });
    });
    if (create) create.addEventListener('click', ()=>{
      const name = (document.getElementById('pmName').value || '').trim();
      if (!name){ alert('Please enter promotion name'); return; }
      const type = (document.querySelector('input[name="type"]:checked')?.value) || 'Discount %';
      const discountValue = (document.getElementById('pmDiscount').value || '').trim();
      const startDate = (document.getElementById('pmStart').value || '').trim();
      const endDate = (document.getElementById('pmEnd').value || '').trim();
      const rawUsage = (document.getElementById('pmUsage').value || '').trim();
      const usage = rawUsage ? (rawUsage.includes('/') ? rawUsage : `0/${rawUsage}`) : '0/0';
      const promo = {
        code: genCode(name),
        name,
        type,
        discountValue,
        startDate,
        endDate,
        status: 'Upcoming',
        usage
      };
      const extras = readExtras();
      extras.push(promo);
      writeExtras(extras);
      location.href = 'PromotionManagement.html';
    });
  });
})();


