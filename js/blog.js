(function(){
  const DATA_URL = '../data/blog.json';
  const EXTRA_KEY = 'revibe_blog_extra';
  const DELETED_KEY = 'revibe_blog_deleted';

  function readExtras(){ try{ return JSON.parse(localStorage.getItem(EXTRA_KEY)||'[]'); }catch(e){ return []; } }
  function writeExtras(arr){ try{ localStorage.setItem(EXTRA_KEY, JSON.stringify(arr)); }catch(e){} }
  function readDeleted(){ try{ return JSON.parse(localStorage.getItem(DELETED_KEY)||'[]'); }catch(e){ return []; } }
  function writeDeleted(ids){ try{ localStorage.setItem(DELETED_KEY, JSON.stringify(ids)); }catch(e){} }

  function newId(){ return 'bp-' + Math.random().toString(36).slice(2, 10); }

  async function loadBase(){
    const res = await fetch(DATA_URL);
    const json = await res.json();
    return json.posts || [];
  }

  function merge(base){
    const deleted = new Set(readDeleted());
    const byId = new Map();
    base.forEach(p => { if (!deleted.has(p.id)) byId.set(p.id, {...p}); });
    readExtras().forEach(p => { if (!deleted.has(p.id)) byId.set(p.id, {...byId.get(p.id), ...p}); });
    return Array.from(byId.values()).sort((a,b)=> new Date(b.createdAt||0) - new Date(a.createdAt||0));
  }

  function cardHtml(p){
    const img = p.image || 'https://picsum.photos/seed/blog/800/520';
    const title = p.title || 'Untitled';
    return `
      <div class="blog-card">
        <img src="${img}" alt="${title}" />
        <p>${title}</p>
        <div class="actions">
          <button class="btn-edit" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn-delete" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `;
  }

  async function renderList(){
    const grid = document.getElementById('blogGrid');
    if (!grid) return;
    const base = await loadBase();
    const posts = merge(base);
    grid.innerHTML = posts.map(cardHtml).join('');
    grid.querySelectorAll('[data-action="edit"]').forEach(btn => btn.addEventListener('click', ()=>{
      location.href = `EditArticle.html?id=${encodeURIComponent(btn.getAttribute('data-id'))}`;
    }));
    grid.querySelectorAll('[data-action="delete"]').forEach(btn => btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-id');
      if (!confirm('Do you want to delete this article?')) return;
      writeExtras(readExtras().filter(p=>p.id!==id));
      const set = new Set(readDeleted()); set.add(id); writeDeleted(Array.from(set));
      renderList();
    }));
  }

  function wire(){
    const newBtn = document.getElementById('newArticleBtn');
    if (newBtn) newBtn.addEventListener('click', ()=> location.href = 'NewArticle.html');
  }

  document.addEventListener('DOMContentLoaded', ()=>{ renderList(); wire(); });
})();


