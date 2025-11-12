(function(){
  const DATA_URL = '../data/products_admin.json';
  const STORAGE_KEY = 'revibe_products_extra';
  const DELETED_KEY = 'revibe_products_deleted';

  let baseProducts = [];
  let categories = [];
  let currentCategory = '';

function getQueryParam(key){
  try { return new URLSearchParams(location.search).get(key) || ''; } catch(e){ return ''; }
}

  function readExtras(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
  }

  function writeExtras(extras){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(extras)); } catch(e){}
  }

  function readDeleted(){
    try { return JSON.parse(localStorage.getItem(DELETED_KEY) || '[]'); } catch(e){ return []; }
  }

  function writeDeleted(ids){
    try { localStorage.setItem(DELETED_KEY, JSON.stringify(ids)); } catch(e){}
  }

  async function loadData(){
    const res = await fetch(DATA_URL);
    const json = await res.json();
    categories = json.categories || [];
    baseProducts = json.products || [];
  }

  function getAllProducts(){
    const extras = readExtras();
    const deleted = new Set(readDeleted());
    const byId = new Map();
    baseProducts.forEach(p => { if (!deleted.has(p.id)) byId.set(p.id, {...p}); });
    extras.forEach(p => { if (!deleted.has(p.id)) byId.set(p.id, {...byId.get(p.id), ...p}); });
    return Array.from(byId.values());
  }

  function renderCategories(){
    const select = document.getElementById('categorySelect');
    if (!select) return;
    select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join('');
    const fromQuery = getQueryParam('cat');
    currentCategory = fromQuery || currentCategory || categories[0] || '';
    select.value = currentCategory;
    select.addEventListener('change', () => {
      currentCategory = select.value;
      renderGrid();
    });
  }

  function renderGrid(){
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const isAll = (currentCategory || '').toLowerCase() === 'all products';
    const list = getAllProducts().filter(p => isAll || !currentCategory || p.category === currentCategory);
    grid.innerHTML = list.map(p => cardHtml(p)).join('');
    grid.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.getAttribute('data-id')));
    });
    grid.querySelectorAll('[data-action="edit"]').forEach(btn => {
      btn.addEventListener('click', () => editProduct(btn.getAttribute('data-id')));
    });
  }

  function cardHtml(p){
    const img = p.image || 'https://picsum.photos/seed/placeholder/600/400';
    const name = p.name || 'Product Name';
    return `
      <div class="product-card">
        <img src="${img}" alt="${name}" />
        <p>${name}</p>
        <div class="actions">
          <button class="btn-edit" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn-delete" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `;
  }

  function newId(){
    return 'u-' + Math.random().toString(36).slice(2, 10);
  }

  function openNewProductModal(){
    const cat = (currentCategory && currentCategory.toLowerCase() !== 'all products') ? currentCategory : '';
    location.href = `NewProduct.html${cat ? `?cat=${encodeURIComponent(cat)}` : ''}`;
  }

  function closeModal(){
    const modal = document.getElementById('productModal');
    if (modal) modal.style.display = 'none';
  }

  function handleFormSubmit(e){
    e.preventDefault();
    const name = (document.getElementById('modalName').value || '').trim();
    const image = (document.getElementById('modalImage').value || '').trim();
    const category = document.getElementById('modalCategory').value;
    if (!name){ alert('Please enter product name'); return; }
    const extras = readExtras();
    extras.push({ id: newId(), name, image, category });
    writeExtras(extras);
    currentCategory = category;
    const catSelect = document.getElementById('categorySelect');
    if (catSelect) catSelect.value = category;
    closeModal();
    renderGrid();
  }

  function deleteProduct(id){
    if (!id) return;
    const ok = confirm('Do you want to delete this product?');
    if (!ok) return;
    // Remove from user overrides if present
    const extras = readExtras().filter(p => p.id !== id);
    writeExtras(extras);
    // Track deletion (affects both base and user-added)
    const deleted = new Set(readDeleted());
    deleted.add(id);
    writeDeleted(Array.from(deleted));
    renderGrid();
  }

  function editProduct(id){
    const target = getAllProducts().find(p => p.id === id);
    if (!target) return;
    const cat = target.category || currentCategory || '';
    location.href = `EditProduct.html?id=${encodeURIComponent(id)}${cat ? `&cat=${encodeURIComponent(cat)}` : ''}`;
  }

  function wirePage(){
    const btn = document.getElementById('newProductBtn');
    if (btn) btn.addEventListener('click', openNewProductModal);
  }

  document.addEventListener('DOMContentLoaded', async function(){
    await loadData();
    renderCategories();
    renderGrid();
    wirePage();
  });
})();


