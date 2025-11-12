(function(){
  const PRODUCTS_URL = '../data/products_admin.json';
  const ORDERS_URL = '../data/orders_admin.json';

  const STATUS_ORDER = ['Pending', 'Shipping', 'Received', 'Cancelled'];

  function formatCurrency(n){
    return (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ';
  }

  async function loadJSON(url){
    const res = await fetch(url);
    return await res.json();
  }

  function pickRandom(arr, count){
    const a = [...arr];
    const out = [];
    while (a.length && out.length < count){
      out.push(a.splice(Math.floor(Math.random()*a.length), 1)[0]);
    }
    return out;
  }

  function buildOrderFromProducts(products){
    const chosen = pickRandom(products, Math.min(3, products.length));
    const items = chosen.map(p => {
      const sellPrice = p.price || 0;
      const originalPrice = Math.round(sellPrice * 1.1);
      const quantity = Math.ceil(Math.random()*2);
      return {
        productId: p.id,
        productName: p.name,
        imagePath: p.image,
        originalPrice,
        sellPrice,
        quantity
      };
    });
    const subtotal = items.reduce((s,i)=> s + i.sellPrice * i.quantity, 0);
    const shippingFee = 35000;
    const totalDiscount = 0;
    const total = subtotal + shippingFee - totalDiscount;
    return {
      orderId: Math.floor(1000 + Math.random()*9000).toString(),
      customerId: 'C' + Math.floor(1000 + Math.random()*9000),
      date: new Date().toISOString(),
      products: items,
      subtotal, shippingFee, totalDiscount, total,
      status: STATUS_ORDER[Math.floor(Math.random()*STATUS_ORDER.length)]
    };
  }

  function renderOrders(orders){
    const listEl = document.querySelector('.order-list');
    if (!listEl) return;
    listEl.innerHTML = orders.map(o => {
      const first = o.products[0];
      const more = Math.max(0, (o.products?.length||0) - 1);
      const date = new Date(o.date);
      const dateStr = `${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
      const statusClass = (o.status||'').toLowerCase();
      return `
        <div class="order-item">
          <div class="order-id">R${o.orderId}</div>
          <img src="${first?.imagePath || first?.image || ''}" alt="" class="order-img" />
          <div class="order-info">
            <p><strong>${first?.productName || first?.name || ''}</strong></p>
            <p>(${more} more items)</p>
          </div>
          <div class="order-date">${dateStr}</div>
          <div class="status ${statusClass}">${o.status}</div>
          <div class="total">${formatCurrency(o.total)}</div>
          <button class="btn-view" data-order-id="${o.orderId}">View detail</button>
        </div>
      `;
    }).join('');

    // Wire detail buttons
    listEl.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-order-id');
        location.href = `OrderDetails.html?id=${encodeURIComponent(id)}`;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', async function(){
    try {
      const [productsData, ordersData] = await Promise.all([
        loadJSON(PRODUCTS_URL),
        loadJSON(ORDERS_URL).catch(()=> [])
      ]);
      const products = productsData.products || [];
      let orders = Array.isArray(ordersData) ? ordersData : (ordersData.orders||ordersData||[]);
      if (!orders.length) {
        // generate a few demo orders
        orders = Array.from({length: 5}).map(()=> buildOrderFromProducts(products));
      }

      const statusFilter = document.getElementById('statusFilter');
      const sortOrder = document.getElementById('sortOrder');

      const applyFilter = () => {
        const statusVal = (statusFilter && statusFilter.value) || 'all';
        const sortVal = (sortOrder && sortOrder.value) || 'latest';

        // Filter by status
        let filtered = statusVal === 'all' ? [...orders] : orders.filter(o => (o.status||'').toLowerCase() === statusVal.toLowerCase());

        // Sort by date
        filtered.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortVal === 'latest' ? dateB - dateA : dateA - dateB;
        });

        renderOrders(filtered);
      };

      if (statusFilter) statusFilter.addEventListener('change', applyFilter);
      if (sortOrder) sortOrder.addEventListener('change', applyFilter);
      
      applyFilter();
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  });
})();