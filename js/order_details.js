(function(){
  const ORDERS_URL = '../data/orders_admin.json';
  function q(k){ try{ return new URLSearchParams(location.search).get(k)||''; }catch(e){ return ''; } }
  function fmt(n){ return (n||0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ'; }
  function fmtDate(iso){ if(!iso) return ''; const d=new Date(iso); return d.toLocaleString('en-GB', { hour12:false }); }

  async function load(){
    const res = await fetch(ORDERS_URL); const arr = await res.json();
    const id = q('id');
    const order = (arr || []).find(o => (o.orderId+'') === (id+''));
    if (!order) return;

    // Left blocks
    const orderInfo = document.getElementById('orderInfo');
    orderInfo.innerHTML = `
      <div>Order ID:</div><div>R${order.orderId}</div>
      <div>Status:</div><div>${order.status}</div>
      <div></div><div style=\"color:#777;font-size:12px\">${order.shipping?.deliveredAt ? `(Delivered on ${new Date(order.shipping.deliveredAt).toDateString()}, at ${new Date(order.shipping.deliveredAt).toLocaleTimeString('en-GB',{hour12:false})})` : ''}</div>
    `;

    const customerInfo = document.getElementById('customerInfo');
    customerInfo.innerHTML = `
      <div>Customer name:</div><div>${order.customer?.name || ''}</div>
      <div>Phone:</div><div>${order.customer?.phone || ''}</div>
      <div>Shipping address:</div><div>${order.customer?.address || ''}</div>
    `;

    const shippingInfo = document.getElementById('shippingInfo');
    shippingInfo.innerHTML = `
      <div>Courier service:</div><div>${order.shipping?.courier || ''}</div>
      <div>Tracking code:</div><div>${order.shipping?.trackingCode || ''}</div>
      <div>Delivery status:</div><div>${order.shipping?.deliveryStatus || ''}</div>
      <div></div><div style="color:#777;font-size:12px">${order.shipping?.deliveredAt ? `(Completed on ${fmtDate(order.shipping.deliveredAt)})` : ''}</div>
    `;

    const paymentInfo = document.getElementById('paymentInfo');
    paymentInfo.innerHTML = `
      <div>Payment method:</div><div>${order.payment?.method || ''}</div>
      <div>Order placed:</div><div>${fmtDate(order.payment?.orderPlaced)}</div>
      <div>Payment confirmed:</div><div>${fmtDate(order.payment?.paymentConfirmed)}</div>
      <div>Shipper pickup:</div><div>${fmtDate(order.payment?.shipperPickup)}</div>
      <div>Delivered:</div><div>${fmtDate(order.payment?.delivered)}</div>
    `;

    // Items
    const items = document.getElementById('items');
    items.innerHTML = (order.products||[]).map(p => `
      <div class="item">
        <img src="${p.imagePath || ''}" alt="${p.productName || ''}" />
        <div>
          <div style="font-weight:600">${p.productName}</div>
          <div style="color:#666;font-size:13px">Quantity: ${p.quantity}</div>
        </div>
        <div class="price-line">
          <div class="strike">${fmt(p.originalPrice)}</div>
          <div>${fmt(p.sellPrice)}</div>
        </div>
      </div>
    `).join('');

    // Summary
    document.getElementById('subtotal').textContent = fmt(order.subtotal);
    document.getElementById('shipFee').textContent = fmt(order.shippingFee);
    document.getElementById('shipDiscount').textContent = `- ${fmt(order.shippingDiscount||0)}`;
    document.getElementById('grandTotal').textContent = fmt(order.total);

    document.getElementById('backBtn').addEventListener('click', () => history.back());
  }

  document.addEventListener('DOMContentLoaded', load);
})();


