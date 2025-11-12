// File: js/product-detail.js

// Hàm helper để format tiền tệ (bạn có thể tùy chỉnh)
function formatCurrency(amount) {
  // Nếu không có số, trả về chuỗi rỗng
  if (!amount) {
    return "";
  }
  // Dùng API của trình duyệt để format (VND)
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND' 
  }).format(amount);
}

// Hàm chạy logic chính
async function loadProductDetails() {
  try {
    // === 1. LẤY ID SẢN PHẨM TỪ URL ===
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id'); // Lấy ?id=p1 -> 'p1'

    if (!productId) {
      console.error('Không tìm thấy Product ID trên URL');
      document.getElementById('product-name').textContent = 'Product not found.';
      return;
    }

    // === 2. TẢI DỮ LIỆU TỪ JSON ===
    const response = await fetch('../data/products.json'); // Đường dẫn tới file JSON
    if (!response.ok) {
      throw new Error('Không thể tải file products.json');
    }
    const products = await response.json();

    // Tìm sản phẩm trong mảng
    const product = products.find(p => p.id === productId);

    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
    }

    // === 3. ĐỔ DỮ LIỆU VÀO HTML ===
    // Dùng document.getElementById để tìm và gán
    
    // Breadcrumbs
    document.getElementById('breadcrumb-category').textContent = product.category;
    document.getElementById('breadcrumb-current').textContent = product.name;
    document.title = product.name; // Cập nhật tiêu đề tab

    // Hình ảnh
    const mainImage = document.getElementById('product-main-image');
    mainImage.src = product.imageUrl;
    mainImage.alt = product.name;

    // Tên
    document.getElementById('product-name').textContent = product.name;

    // Giá
    const priceOriginalEl = document.getElementById('product-price-original');
    const priceDiscountedEl = document.getElementById('product-price-discounted');
    
    if (product.price.discounted) {
      // Nếu có giảm giá
      priceDiscountedEl.textContent = formatCurrency(product.price.discounted);
      priceOriginalEl.textContent = formatCurrency(product.price.original);
      priceOriginalEl.classList.add('on-sale'); // Thêm class để gạch ngang
    } else {
      // Nếu không giảm giá
      priceOriginalEl.textContent = formatCurrency(product.price.original);
      priceDiscountedEl.textContent = ''; // Ẩn giá giảm
    }

    // Điểm số
    document.getElementById('product-score-value').textContent = product.sustainability_score;

    // Mô tả
    document.getElementById('product-description').textContent = product.description;

    // Hành trình Tái sinh (Rebirth Journey)
    document.getElementById('journey-material').textContent = product.rebirth_journey.material;
    document.getElementById('journey-process').textContent = product.rebirth_journey.process;
    document.getElementById('journey-impact').textContent = product.rebirth_journey.impact;

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
    document.getElementById('product-name').textContent = 'Error loading product.';
  }
}

// Hàm để gắn các sự kiện click
function setupEventListeners() {
  // Nút tăng/giảm số lượng
  const quantityInput = document.getElementById('quantity-input');
  const decreaseBtn = document.getElementById('quantity-decrease');
  const increaseBtn = document.getElementById('quantity-increase');

  if (decreaseBtn && increaseBtn && quantityInput) {
    decreaseBtn.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value, 10);
      if (currentValue > 1) { // Không cho giảm xuống dưới 1
        quantityInput.value = currentValue - 1;
      }
    });

    increaseBtn.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value, 10);
      quantityInput.value = currentValue + 1;
    });
  }

  // Nút Add to Cart
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const quantity = parseInt(quantityInput.value, 10);
      const params = new URLSearchParams(window.location.search);
      const productId = params.get('id');
      
      alert(`Đã thêm ${quantity} sản phẩm (ID: ${productId}) vào giỏ!`);
      // (Đây là nơi bạn sẽ gọi logic giỏ hàng thật sự,
      // có thể lưu vào localStorage)
    });
  }

  // Sự kiện cho Accordion
  const accordionHeaders = document.querySelectorAll('.accordion-item__header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      // Lấy thẻ .accordion-item cha
      const accordionItem = header.parentElement;
      // Chuyển đổi (toggle) class 'is-open'
      accordionItem.classList.toggle('is-open');
    });
  });
}

// === CHẠY SAU KHI HTML ĐÃ TẢI XONG ===
// Chờ cho toàn bộ HTML được tải xong rồi mới chạy JS
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails(); // Tải dữ liệu và hiển thị
  setupEventListeners(); // Gắn các nút bấm
});

