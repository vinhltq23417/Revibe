// File: js/product-list.js

// Chờ cho toàn bộ HTML được tải xong rồi mới chạy JS
document.addEventListener('DOMContentLoaded', () => {

  let allProducts = []; // Biến lưu trữ TOÀN BỘ sản phẩm từ JSON
  let currentFilters = { // Biến lưu trữ trạng thái filter hiện tại
    category: [],
    score: 'all'
  };
  let currentSort = 'featured'; // Biến lưu trữ trạng thái sort

  // === CÁC ELEMENT CHÍNH ===
  const gridContainer = document.getElementById('product-grid-container');
  const categoryFilterList = document.getElementById('category-filter-list');
  const scoreFilterList = document.getElementById('score-filter-list');
  const sortSelect = document.getElementById('sort-by');
  const categoryTitle = document.getElementById('category-title');

  // === HÀM HELPER FORMAT TIỀN TỆ ===
  function formatCurrency(amount) {
    if (!amount) return "";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

// File: js/product-list.js

// === HÀM RENDER CÁC SẢN PHẨM RA GRID (ĐÃ CẬP NHẬT) ===
function renderProducts(productsToRender) {
  // 1. Xóa sạch grid cũ
  gridContainer.innerHTML = '';

  // 2. Kiểm tra nếu không có sản phẩm
  if (productsToRender.length === 0) {
    gridContainer.innerHTML = '<p class="no-products-message">No products found matching your criteria.</p>';
    return;
  }

  // 3. Lặp qua mảng sản phẩm và tạo HTML
  productsToRender.forEach(product => {
    // Xác định giá
    let priceHTML = '';
    if (product.price.discounted) {
      priceHTML = `
        <span class="price--discounted">${formatCurrency(product.price.discounted)}</span>
        <span class="price--original on-sale">${formatCurrency(product.price.original)}</span>
      `;
    } else {
      priceHTML = `
        <span class="price--original">${formatCurrency(product.price.original)}</span>
      `;
    }

    // Cấu trúc HTML của Product Card
    const productCardHTML = `
      <div class="product-card">
        <a href="product-detail.html?id=${product.id}" class="product-card__image-container">
          <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image">
          
          <div class="product-card__sustainability-badge">
            <img src="assets/icons/leaf.svg" alt="Leaf Icon">
            <span>${product.sustainability_score}</span>
          </div>
          </a>
        <span class="product-card__artisan-name">${product.artisanName}</span>
        <h3 class="product-card__title">
          <a href="product-detail.html?id=${product.id}">${product.name}</a>
        </h3>
        <div class="product-card__price">
          ${priceHTML}
        </div>
      </div>
    `;

    // 4. Đưa HTML mới vào grid
    gridContainer.innerHTML += productCardHTML;
  });
}

  // === HÀM TẠO CÁC LỰA CHỌN FILTER (TỰ ĐỘNG) ===
  function renderFilters(products) {
    // 1. Lấy tất cả danh mục con (subCategory) duy nhất
    const allSubCategories = products.map(p => p.subCategory);
    const uniqueSubCategories = [...new Set(allSubCategories)]; // Dùng Set để lọc trùng

    // 2. Đổ vào HTML
    categoryFilterList.innerHTML = ''; // Xóa sạch
    uniqueSubCategories.forEach((subCategory, index) => {
      const categoryHTML = `
        <li>
          <input type="checkbox" id="cat-${index}" class="category-filter-input" value="${subCategory}">
          <label for="cat-${index}">${subCategory}</label>
        </li>
      `;
      categoryFilterList.innerHTML += categoryHTML;
    });

    // 3. Gắn sự kiện "change" cho các checkbox vừa tạo
    document.querySelectorAll('.category-filter-input').forEach(input => {
      input.addEventListener('change', applyFiltersAndSort);
    });
  }

  // === HÀM LỌC VÀ SẮP XẾP CHÍNH ===
  // (Hàm này được gọi mỗi khi có thay đổi filter hoặc sort)
  function applyFiltersAndSort() {
    // 1. Lấy giá trị filter mới
    currentFilters.category = Array.from(document.querySelectorAll('.category-filter-input:checked')).map(cb => cb.value);
    currentFilters.score = document.querySelector('input[name="score-filter"]:checked').value;
    
    // 2. Lấy giá trị sort mới
    currentSort = sortSelect.value;
    
    // 3. Bắt đầu lọc
    let filteredProducts = [...allProducts]; // Luôn bắt đầu từ danh sách đầy đủ

    // Lọc theo Category
    if (currentFilters.category.length > 0) {
      filteredProducts = filteredProducts.filter(product => 
        currentFilters.category.includes(product.subCategory)
      );
    }
    
    // Lọc theo Điểm số
    if (currentFilters.score !== 'all') {
      const minScore = parseFloat(currentFilters.score);
      filteredProducts = filteredProducts.filter(product => 
        product.sustainability_score >= minScore
      );
    }

    // 4. Sắp xếp
    switch (currentSort) {
      case 'price-asc':
        filteredProducts.sort((a, b) => (a.price.discounted || a.price.original) - (b.price.discounted || b.price.original));
        break;
      case 'price-desc':
        filteredProducts.sort((a, b) => (b.price.discounted || b.price.original) - (a.price.discounted || a.price.original));
        break;
      case 'name-asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      // case 'featured': (để mặc định)
    }

    // 5. Render lại danh sách sản phẩm
    renderProducts(filteredProducts);
  }

  // === HÀM KHỞI TẠO (CHẠY ĐẦU TIÊN) ===
  async function initializeShop() {
    try {
      // 1. Lấy dữ liệu
      const response = await fetch('../data/products.json');
      if (!response.ok) throw new Error('Cannot fetch products.json');
      allProducts = await response.json();

      // 2. Lấy category từ URL (ví dụ: product-list.html?category=Sustainable%20Fashion)
      const params = new URLSearchParams(window.location.search);
      const category = params.get('category');
      
      let productsToDisplay = allProducts;

      if (category) {
        // Nếu có category trên URL, lọc sản phẩm trước
        categoryTitle.textContent = category; // Cập nhật tiêu đề
        document.title = `${category} - ReVibe`; // Cập nhật title tab
        productsToDisplay = allProducts.filter(p => p.category === category);
      } else {
        categoryTitle.textContent = "All Products";
        document.title = 'All Products - ReVibe';
      }

      // 3. Render lần đầu
      renderFilters(productsToDisplay); // Tạo filter dựa trên sản phẩm đã lọc
      renderProducts(productsToDisplay); // Hiển thị sản phẩm
      
      // 4. Gắn các sự kiện khác
      // Sự kiện cho Accordion
      document.querySelectorAll('.accordion-item__header').forEach(header => {
        header.addEventListener('click', () => {
          header.parentElement.classList.toggle('is-open');
        });
      });

      // Sự kiện cho Radio buttons (Điểm số)
      document.querySelectorAll('input[name="score-filter"]').forEach(radio => {
        radio.addEventListener('change', applyFiltersAndSort);
      });
      
      // Sự kiện cho Sort
      sortSelect.addEventListener('change', applyFiltersAndSort);

    } catch (error) {
      console.error('Failed to initialize shop:', error);
      gridContainer.innerHTML = '<p class="error-message">Could not load products. Please try again later.</p>';
    }
  }

  // === CHẠY HÀM KHỞI TẠO ===
  initializeShop();

});