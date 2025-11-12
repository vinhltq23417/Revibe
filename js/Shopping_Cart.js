// File: js/shopping-cart.js

// === KHAI BÁO BIẾN TOÀN CỤC ===
const CART_STORAGE_KEY = 'revibeCart'; // Key để lưu trong localStorage
const SHIPPING_FEE = 25000; // Phí ship (ví dụ: 25.000₫)

// === LẤY CÁC ELEMENT TRÊN TRANG ===
const cartItemsContainer = document.getElementById('cart-items-container');
const summarySubtotalEl = document.getElementById('summary-subtotal');
const summaryShippingEl = document.getElementById('summary-shipping');
const summaryTotalEl = document.getElementById('summary-total');

// === HÀM HELPER ===
function formatCurrency(amount) {
  if (!amount) return "0₫";
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Lấy giỏ hàng từ localStorage
function getCartFromStorage() {
  const cartJson = localStorage.getItem(CART_STORAGE_KEY);
  // Nếu không có gì, trả về mảng rỗng
  return cartJson ? JSON.parse(cartJson) : []; 
}

// Lưu giỏ hàng vào localStorage
function saveCartToStorage(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// === HÀM RENDER (VẼ) CHÍNH ===

// 1. Hàm Render các sản phẩm trong giỏ hàng (Cột trái)
function renderCartItems(mergedCart) {
  // Xóa sạch nội dung cũ
  cartItemsContainer.innerHTML = '';

  // Nếu giỏ hàng trống
  if (mergedCart.length === 0) {
    cartItemsContainer.innerHTML = '<p class="cart-empty-message">Your cart is currently empty.</p>';
    return;
  }

  // Lặp qua mảng giỏ hàng đã merge và tạo HTML
  mergedCart.forEach(item => {
    const itemPrice = item.price.discounted || item.price.original;
    const itemTotal = itemPrice * item.quantity;

    const cartItemHTML = `
      <div class="cart-item">
        <div class="cart-item__product-cell">
          <img src="${item.imageUrl}" alt="${item.name}" class="cart-item__image">
          <div class="cart-item__details">
            <span class="cart-item__name">${item.name}</span>
            <button class="cart-item__remove-btn" data-id="${item.id}">Remove</button>
          </div>
        </div>
        <div class="cart-item__quantity-cell" data-label="Quantity">
          <div class="quantity-selector">
            <button class="quantity-selector__btn quantity-change" data-id="${item.id}" data-change="-1">-</button>
            <input type="number" class="quantity-selector__input" value="${item.quantity}" min="1" readonly>
            <button class="quantity-selector__btn quantity-change" data-id="${item.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="cart-item__price-cell" data-label="Price">
          ${formatCurrency(itemPrice)}
        </div>
        <div class="cart-item__total-cell" data-label="Total">
          ${formatCurrency(itemTotal)}
        </div>
      </div>
    `;
    cartItemsContainer.innerHTML += cartItemHTML;
  });
}

// 2. Hàm Render Tóm tắt Đơn hàng (Cột phải)
function renderSummary(mergedCart) {
  // Tính toán
  let subtotal = 0;
  mergedCart.forEach(item => {
    const itemPrice = item.price.discounted || item.price.original;
    subtotal += itemPrice * item.quantity;
  });

  const total = subtotal + SHIPPING_FEE;

  // Hiển thị
  summarySubtotalEl.textContent = formatCurrency(subtotal);
  summaryShippingEl.textContent = formatCurrency(SHIPPING_FEE);
  summaryTotalEl.textContent = formatCurrency(total);
}

// === HÀM XỬ LÝ SỰ KIỆN ===

// Hàm xử lý khi thay đổi số lượng hoặc xóa
function handleCartChange(event) {
  const target = event.target;
  
  // 1. Xử lý nút Xóa (Remove)
  if (target.classList.contains('cart-item__remove-btn')) {
    const productId = target.dataset.id;
    // Lấy giỏ hàng -> lọc -> lưu lại
    let cart = getCartFromStorage();
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage(cart);
    // Tải lại toàn bộ trang
    loadAndRenderCart(); 
  }

  // 2. Xử lý nút Tăng/Giảm (+/-)
  if (target.classList.contains('quantity-change')) {
    const productId = target.dataset.id;
    const change = parseInt(target.dataset.change, 10);
    
    let cart = getCartFromStorage();
    const itemInCart = cart.find(item => item.id === productId);

    if (itemInCart) {
      if (change === -1 && itemInCart.quantity === 1) {
        // Nếu giảm từ 1 xuống 0 -> Xóa sản phẩm
        if (confirm('Do you want to remove this item from the cart?')) {
          cart = cart.filter(item => item.id !== productId);
        }
      } else {
        // Tăng/giảm bình thường
        itemInCart.quantity += change;
      }
      
      saveCartToStorage(cart);
      // Tải lại toàn bộ trang
      loadAndRenderCart();
    }
  }
}

// === HÀM CHÍNH (KHỞI TẠO) ===
async function loadAndRenderCart() {
  try {
    // 1. Lấy giỏ hàng từ localStorage
    const cart = getCartFromStorage();

    // 2. Tải file products.json
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error('Cannot fetch products.json');
    const allProducts = await response.json();

    // 3. Merge (Kết hợp) hai nguồn dữ liệu
    const mergedCart = cart.map(cartItem => {
      // Tìm sản phẩm tương ứng trong products.json
      const productDetails = allProducts.find(p => p.id === cartItem.id);
      return {
        ...productDetails, // Lấy tất cả thông tin (tên, ảnh, giá...)
        quantity: cartItem.quantity // Lấy số lượng từ giỏ hàng
      };
    });

    // 4. Render ra HTML
    renderCartItems(mergedCart);
    renderSummary(mergedCart);

  } catch (error) {
    console.error('Failed to load cart:', error);
    cartItemsContainer.innerHTML = '<p class="error-message">Could not load cart.</p>';
  }
}

// === CHẠY KHI TẢI TRANG ===
document.addEventListener('DOMContentLoaded', () => {
  // Tải và vẽ giỏ hàng
  loadAndRenderCart();
  
  // Gắn bộ lắng nghe sự kiện (event listener) cho toàn bộ container
  // (Đây là kỹ thuật Event Delegation - hiệu quả hơn)
  cartItemsContainer.addEventListener('click', handleCartChange);
});