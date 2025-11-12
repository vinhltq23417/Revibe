// js/main.js

// Chỉ có MỘT sự kiện DOMContentLoaded cho toàn bộ file
document.addEventListener('DOMContentLoaded', function() {

  console.log('ReVibe JS Initialized');

  /* =================================== */
  /* ===== BIẾN TOÀN CỤC & HÀM CHUNG ===== */
  /* =================================== */
  const mainContentContainer = document.getElementById('main-content');
  const siteHeader = document.querySelector('.site-header');

  if (!mainContentContainer || !siteHeader) {
    console.error('Core elements (Header or Main Content) not found. Site may not function.');
    return;
  }
  
  // Hàm format tiền tệ
  function formatCurrency(amount) {
    if (!amount && amount !== 0) return "";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  // Hàm hiển thị lỗi cho form
  function showError(inputElement, message) {
    const formGroup = inputElement.closest('.form-group');
    if (!formGroup) return;
    const errorMessageElement = formGroup.querySelector('.form-error-message');
    formGroup.classList.add('has-error');
    if (errorMessageElement) errorMessageElement.textContent = message;
  }

  // Hàm xóa tất cả lỗi
  function clearErrors() {
    document.querySelectorAll('.form-group.has-error').forEach(formGroup => {
      formGroup.classList.remove('has-error');
      const errorElement = formGroup.querySelector('.form-error-message');
      if (errorElement) errorElement.textContent = '';
    });
  }
  function closeAllMenus() {
    const megaMenu = document.querySelector('#mega-menu-content');
    if (megaMenu) {
      megaMenu.classList.remove('is-open');
    }
    document.querySelectorAll('.nav-menu .dropdown-container.is-open').forEach(dropdown => {
      dropdown.classList.remove('is-open');
    });
  }

  /* =================================== */
  /* ===== CHỨC NĂNG 1C: GLOBAL SEARCH ===== */
  /* =================================== */
  const searchForm = document.querySelector('.search-form'); 
  const searchInput = document.getElementById('search-input');
  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault(); 
      const query = searchInput.value.trim();
      if (query) {
        searchInput.value = '';
        closeAllMenus(); 
        const searchUrl = `_search_results.html?q=${encodeURIComponent(query)}`;
        const historyUrl = `search_results.html?q=${encodeURIComponent(query)}`;
        loadPage(searchUrl);
        history.pushState(null, '', historyUrl);
      }
    });
  }

  /* =================================== */
  /* ===== CHỨC NĂNG 1: MEGA MENU ====== */
  /* =================================== */
  const categoryButton = document.querySelector('.all-categories-button');
  const megaMenu = document.querySelector('#mega-menu-content');
  if (categoryButton && megaMenu) {
    function setMegaMenuPosition() {
      const headerHeight = siteHeader.offsetHeight;
      megaMenu.style.top = headerHeight + 'px';
    }
    setMegaMenuPosition();
    window.addEventListener('resize', setMegaMenuPosition);
    categoryButton.addEventListener('click', function(event) {
      event.stopPropagation();
      const wasOpen = megaMenu.classList.contains('is-open');
      closeAllMenus();
      if (!wasOpen) {
        megaMenu.classList.toggle('is-open');
      }
    });
  }

  /* ======================================= */
  /* ===== CHỨC NĂNG 1B: NAV DROPDOWNS ===== */
  /* ======================================= */
  const simpleDropdowns = document.querySelectorAll('.nav-menu .dropdown-container');
  simpleDropdowns.forEach(dropdown => {
    const triggerLink = dropdown.querySelector('.nav-menu__link.has-dropdown');
    if (triggerLink) {
      triggerLink.addEventListener('click', function(event) {
        event.stopPropagation();
        const wasOpen = dropdown.classList.contains('is-open');
        closeAllMenus();
        if (!wasOpen) {
          dropdown.classList.add('is-open');
        }
      });
    }
  });

  /* =================================== */
  /* ===== CHỨC NĂNG 2: AUTH STATE ===== */
  /* =================================== */
  function checkLoginState() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') || localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      document.body.classList.add('user-is-logged-in');
    } else {
      document.body.classList.remove('user-is-logged-in');
    }
  }
  checkLoginState();

  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(event) {
      event.preventDefault(); 
      localStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('isLoggedIn');
      localStorage.removeItem('currentUserId'); // Xóa ID user khi logout
      sessionStorage.removeItem('currentUserId');
      checkLoginState();
      loadPage('_index.html');
      history.pushState(null, '', 'index.html');
    });
  }

  /* =================================== */
  /* ===== CHỨC NĂNG 3: AJAX ROUTER ===== */
  /* =================================== */
  function loadPage(url) {
    mainContentContainer.innerHTML = '<h3 style="text-align: center; padding: 50px; color: var(--primary);">Loading...</h3>';
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          mainContentContainer.innerHTML = xhr.responseText;
          attachDynamicListeners(); 
        } else {
          mainContentContainer.innerHTML = `<h3 style="text-align: center; padding: 50px; color: var(--danger);">Error: Page '${url}' not found.</h3>`;
        }
      }
    };
    xhr.open("GET", url, true);
    xhr.send();
  }

  function handleLinkClick(event) {
    const link = event.currentTarget; 
    event.preventDefault(); 
    let href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http')) return;
    let partialUrl = '';
    let pageName = href.split('?')[0].split('.')[0];
    if (pageName.includes('/')) {
        pageName = pageName.split('/').pop();
    }
    if (pageName === 'index' || pageName === '') {
        partialUrl = '_index.html'; 
    } else {
        partialUrl = '_' + pageName + '.html';
    }
    
    // Thêm query string (nếu có) vào partialUrl
    const queryString = href.split('?')[1];
    if (queryString) {
        partialUrl += '?' + queryString;
    }

    loadPage(partialUrl);
    history.pushState(null, '', href);
    document.querySelectorAll('.nav-menu__link.active').forEach(activeLink => {
      activeLink.classList.remove('active');
    });
    const parentLink = link.closest('.nav-menu__item')?.querySelector('.nav-menu__link');
    if(parentLink) {
        parentLink.classList.add('active');
    }
  }

  function attachGlobalLinks() {
      document.querySelectorAll('.ajax-link').forEach(link => {
        link.removeEventListener('click', handleLinkClick);
        link.addEventListener('click', handleLinkClick);
      });
  }
  attachGlobalLinks();

  // Tải trang ban đầu (dựa trên URL)
  let initialPath = window.location.pathname.split('/').pop();
  let initialQuery = window.location.search;
  if (initialPath === '' || initialPath === 'index.html') {
    loadPage('_index.html');
  } else {
    loadPage('_' + initialPath.split('.')[0] + '.html' + initialQuery);
  }
  
  window.onpopstate = function() {
    let path = window.location.pathname.split('/').pop();
    let query = window.location.search;
    if (path === '' || path === 'index.html') {
      loadPage('_index.html');
    } else if (path) {
      loadPage('_' + path.split('.')[0] + '.html' + query);
    }
  };

  /* ================================================= */
  /* ===== CHỨC NĂNG 4: GẮN SỰ KIỆN ĐỘNG (DYNAMIC) ===== */
  /* ================================================= */
  function attachDynamicListeners() {
    attachGlobalLinks(); 
    const newArrivalsGrid = document.getElementById('new-arrivals-grid');
    if (newArrivalsGrid) initializeHomePage();
    const productGridContainer = document.getElementById('product-grid-container');
    if (productGridContainer) initializeShopPage();
    const pdpLayout = document.querySelector('.pdp-layout');
    if (pdpLayout) initializePDP();
    
    // SỬA LỖI: Trang giỏ hàng phải tìm ID "cart-page-new" từ HTML mới
    const cartPage = document.getElementById('cart-page-new'); 
    if (cartPage) initializeCartPage();
    
    // (Bỏ qua productOrderPage vì nó đã cũ)
    const checkoutLayout = document.querySelector('.checkout-layout');
    if (checkoutLayout) initializeCheckoutPage();
    const qrCodeImage = document.getElementById('qrCodeImage');
    if (qrCodeImage) initializeQRPaymentPage();
    const successSection = document.querySelector('.success-section');
    if (successSection) initializeQRSuccessPage();
    const profileDashboard = document.querySelector('.profile-dashboard');
    if (profileDashboard) initializeProfilePage();
    const orderDetailColumn = document.getElementById('order-info-column');
    if (orderDetailColumn) initializeOrderDetailPage();
    const reviewForm = document.querySelector('.review-form-container');
    if (reviewForm) initializeReviewPage();
    const artisanGrid = document.getElementById('artisan-grid-container');
    if (artisanGrid) initializeArtisansPage();
    const artisanDetail = document.getElementById('artisan-detail-page');
    if (artisanDetail) initializeArtisanDetailPage();
    const blogGridContainer = document.getElementById('blog-grid-container');
    if (blogGridContainer) initializeBlogPage(blogGridContainer);
    const postHeader = document.querySelector('.post-header');
    if (postHeader) initializeBlogDetailPage();
    const contactForm = document.getElementById('contactForm');
    if (contactForm) initializeContactPage(contactForm);
    const policyContent = document.getElementById('policyContent');
    if (policyContent) initializePolicyPage();
    const aboutPage = document.getElementById('about-us-content');
    if (aboutPage) console.log("Trang About Us đã được tải.");
    const searchPage = document.getElementById('search-results-page');
    if (searchPage) initializeSearchResultsPage();
    const loginForm = document.getElementById('login-form-button');
    if (loginForm) initializeAuthForms();
    const updatePassBtn = document.getElementById('update-password-button');
    if (updatePassBtn) initializeChangePasswordPage();
    
  }


  /* =================================== */
  /* ===== KHU VỰC DỊCH VỤ (SERVICE) ===== */
  /* =================================== */

  const MOCK_CARTS_KEY = 'revibe_mock_carts';

  const CartService = {
      init: async function() {
          if (localStorage.getItem(MOCK_CARTS_KEY)) {
              return;
          }
          try {
              const response = await fetch('../data/carts.json');
              const cartsData = await response.json();
              localStorage.setItem(MOCK_CARTS_KEY, JSON.stringify(cartsData));
              console.log("CartService initialized with carts.json");
          } catch (e) {
              console.error("Không thể tải carts.json:", e);
              localStorage.setItem(MOCK_CARTS_KEY, JSON.stringify({}));
          }
      },
      getMockCarts: function() {
          const data = localStorage.getItem(MOCK_CARTS_KEY);
          return data ? JSON.parse(data) : {};
      },
      saveMockCarts: function(carts) {
          localStorage.setItem(MOCK_CARTS_KEY, JSON.stringify(carts));
          try {
              updateCartDisplay(); 
          } catch (e) { /* Bỏ qua */ }
      },
      getCart: function(userId) {
          // SỬA LỖI CHECKOUT: Ưu tiên đọc giỏ hàng tạm thời
          const cartForCheckout = localStorage.getItem('cart_for_checkout');
          if (cartForCheckout) {
              localStorage.removeItem('cart_for_checkout'); 
              return JSON.parse(cartForCheckout);
          }
          // Nếu không, đọc giỏ hàng thật
          const carts = this.getMockCarts();
          if (carts[userId] && carts[userId].cartItems) {
              return carts[userId].cartItems;
          }
          return [];
      },
      addToCart: function(userId, product, quantity = 1) {
          const carts = this.getMockCarts();
          if (!carts[userId]) {
              carts[userId] = { cartItems: [] };
          }
          const cart = carts[userId].cartItems;
          const existingItem = cart.find(item => item.productId === product.id);
          if (existingItem) {
              existingItem.quantity += quantity;
          } else {
              cart.push({
                  productId: product.id,
                  quantity: quantity,
                  productName: product.name,
                  imagePath: product.imageUrl,
                  originalPrice: product.price.original,
                  sellPrice: product.price.discounted || product.price.original
              });
          }
          this.saveMockCarts(carts);
          alert('Sản phẩm đã được thêm vào giỏ hàng!');
      },
      updateQuantity: function(userId, productId, newQuantity) {
          const carts = this.getMockCarts();
          if (!carts[userId]) return;
          const cart = carts[userId].cartItems;
          const itemIndex = cart.findIndex(item => item.productId === productId);
          if (itemIndex > -1) {
              if (newQuantity <= 0) {
                  cart.splice(itemIndex, 1);
              } else {
                  cart[itemIndex].quantity = newQuantity;
              }
              this.saveMockCarts(carts);
          }
      },
      removeFromCart: function(userId, productId) {
          const carts = this.getMockCarts();
          if (!carts[userId]) return;
          carts[userId].cartItems = carts[userId].cartItems.filter(item => item.productId !== productId);
          this.saveMockCarts(carts);
      },
      clearCart: function(userId) {
          const carts = this.getMockCarts();
          if (carts[userId]) {
              carts[userId].cartItems = [];
              this.saveMockCarts(carts);
          }
          updateCartDisplay(); // Cập nhật header
      },
      getTotalItems: function(userId) {
          const cart = this.getCart(userId);
          return cart.reduce((total, item) => total + item.quantity, 0);
      },
      // Hàm getTotals (dùng cho checkout)
      getTotals: function(cart, allProductsMap) {
          let subtotal = 0;
          let totalItems = 0;
          cart.forEach(item => {
              const product = allProductsMap.get(item.id || item.productId); // Hỗ trợ cả 2 cấu trúc
              if (product) {
                  const price = product.price.discounted || product.price.original;
                  subtotal += price * item.quantity;
                  totalItems += item.quantity;
              }
          });
          return { subtotal, totalItems };
      },
      getCurrentUserId: function() {
          return localStorage.getItem('currentUserId') || sessionStorage.getItem('currentUserId') || "u1"; // Giả lập 'u1'
      }
  };

  function updateCartDisplay() {
      try {
          const userId = CartService.getCurrentUserId();
          const totalItems = CartService.getTotalItems(userId);
          const countElement = document.getElementById('cart-header-count');
          if (countElement) {
              countElement.textContent = totalItems;
              countElement.style.display = totalItems > 0 ? 'flex' : 'none';
          }
      } catch(e) {
          console.warn("Không thể cập nhật icon giỏ hàng header.", e);
      }
  }
  const MOCK_ORDERS_KEY = 'revibe_mock_orders';

const OrderService = {
    /**
     * Tải orders.json vào localStorage (chỉ 1 lần)
     */
    init: async function() {
        if (localStorage.getItem(MOCK_ORDERS_KEY)) {
            return; // Đã có
        }
        try {
            const response = await fetch('../data/orders.json');
            const ordersData = await response.json();
            localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(ordersData.orders || []));
            console.log("OrderService initialized with orders.json");
        } catch (e) {
            console.error("Không thể tải orders.json:", e);
            localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify([]));
        }
    },

    /**
     * Lấy TẤT CẢ đơn hàng từ mock
     */
    getOrders: function() {
        const data = localStorage.getItem(MOCK_ORDERS_KEY);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Thêm một đơn hàng mới vào mock
     */
    createOrder: function(orderData) {
        const allOrders = this.getOrders();
        allOrders.push(orderData);
        localStorage.setItem(MOCK_ORDERS_KEY, JSON.stringify(allOrders));
    }
};

  // Khởi tạo CartService (tải carts.json vào mock)
  CartService.init().then(() => {
    updateCartDisplay(); // Cập nhật header ngay khi tải xong
  });


  /* ================================================= */
  /* ===== CÁC HÀM KHỞI TẠO RIÊNG CHO TỪNG TRANG ===== */
  /* ================================================= */

  function initializePDP() {
    console.log("Initializing PDP (v2 - With Reviews)...");
    
    // Biến để lưu trữ sản phẩm hiện tại
    let currentProduct = null; 

    /**
     * HÀM CON: Tải dữ liệu chính
     */
    async function loadProductDetails() {
        try {
            const params = new URLSearchParams(window.location.search);
            const productId = params.get('id');
            if (!productId) {
                throw new Error('Không tìm thấy ID sản phẩm trong URL');
            }
            
            // === SỬA ĐỔI: Tải 3 file dữ liệu song song ===
            const [productsRes, reviewsRes, usersRes] = await Promise.all([
                fetch('../data/products.json'),
                fetch('../data/reviews.json'), // Tải base reviews
                fetch('../data/users.json')    // Tải users để lấy tên
            ]);

            if (!productsRes.ok) throw new Error('Cannot fetch products.json');
            
            const productsData = await productsRes.json();
            // (Cho phép reviews.json hoặc users.json 404)
            const baseReviews = reviewsRes.ok ? (await reviewsRes.json()).reviews || [] : [];
            const usersData = usersRes.ok ? await usersRes.json() : [];
            
            const products = productsData.products || productsData;
            const product = products.find(p => p.id === productId); 
            if (!product) throw new Error(`Sản phẩm với ID ${productId} không tồn tại.`);

            currentProduct = product; // Lưu sản phẩm hiện tại
            
            // === ĐIỀN THÔNG TIN SẢN PHẨM (Code cũ của bạn) ===
            document.getElementById('pd-breadcrumb-category').textContent = product.category;
            document.getElementById('pd-breadcrumb-name').textContent = product.name;
            document.title = product.name;
            document.getElementById('pd-main-image').src = product.imageUrl;
            document.getElementById('pd-artisan-name').textContent = "By " + product.artisanName;
            document.getElementById('pd-score').textContent = "Score: " + product.sustainability_score + "/10";
            document.getElementById('pd-product-name').textContent = product.name;
            document.getElementById('pd-description').textContent = product.description;
            if (product.price.discounted) {
                document.getElementById('pd-price-discounted').textContent = formatCurrency(product.price.discounted);
                document.getElementById('pd-price-original').textContent = formatCurrency(product.price.original);
            } else {
                document.getElementById('pd-price-discounted').textContent = formatCurrency(product.price.original);
                document.getElementById('pd-price-original').textContent = ''; 
            }
            
            // === CODE MỚI: TẢI VÀ RENDER REVIEWS ===
            
            // 1. Tạo Map users để tra cứu tên
            const usersMap = new Map();
            (usersData.users || usersData).forEach(u => usersMap.set(u.id, u));

            // 2. Lấy reviews MỚI từ localStorage (do hàm initializeReviewPage lưu)
            const newReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            
            // 3. Kết hợp base reviews (reviews.json) và new reviews (localStorage)
            const allReviewsMap = new Map();
            baseReviews.forEach(r => allReviewsMap.set(r.reviewId, r));
            newReviews.forEach(r => allReviewsMap.set(r.reviewId, r)); // Ghi đè nếu ID trùng
            
            // 4. Lọc reviews cho sản phẩm này
            const productReviews = [];
            allReviewsMap.forEach(review => {
                if (review.productId === productId) {
                    productReviews.push(review);
                }
            });

            // 5. Cập nhật số lượng review trên tab
            document.getElementById('pd-review-count').textContent = productReviews.length;

            // 6. Gọi hàm render
            renderReviews(productReviews, usersMap);

        } catch (error) {
            console.error('Lỗi khi tải chi tiết sản phẩm:', error);
            const container = document.querySelector('.product-info');
            if(container) container.innerHTML = `<h3 style="color: var(--danger);">Lỗi: ${error.message}</h3><p>Vui lòng thử lại sau.</p>`;
        }
    }
    
    /**
     * HÀM CON MỚI: Render danh sách đánh giá
     */
    function renderReviews(reviews, usersMap) {
        const container = document.getElementById('product-reviews-container');
        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 20px; color: #777;">Sản phẩm này chưa có đánh giá. Hãy là người đầu tiên!</p>';
            return;
        }
        
        // Sắp xếp: Mới nhất lên đầu
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = reviews.map(review => {
            const user = usersMap.get(review.customerId);
            const userName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous';
            const userAvatar = '../assets/images/placeholder/avatar_placeholder.png'; // Ảnh placeholder
            
            let starsHTML = '';
            for(let i = 1; i <= 5; i++) {
                starsHTML += `<span class="star ${i <= review.rating ? 'active' : ''}">★</span>`;
            }

            return `
                <div class="review-item">
                    <div class="review-author">
                        <img src="${userAvatar}" alt="${userName}" class="review-author-avatar">
                        <span class="review-author-name">${userName}</span>
                    </div>
                    <div class="review-content">
                        <div class="review-stars">${starsHTML}</div>
                        <p class="review-text">${review.content}</p>
                        <div class="review-media">
                            ${review.image ? `<img src="${review.image}" class="review-media-image">` : ''}
                            ${review.video ? `<video src="${review.video}" class="review-media-video" controls></video>` : ''}
                        </div>
                        <span class="review-date">${new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * HÀM CON: Gắn sự kiện (Giữ nguyên)
     */
    function setupPDPEvents() {
        // Gắn sự kiện chuyển tab (Code này đã khớp với HTML của bạn)
        const tabButtons = document.querySelectorAll('.tab-nav__button');
        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('is-active'));
            button.classList.add('is-active');
            // Tìm .tab-content-wrapper (dựa trên HTML của bạn)
            const wrapper = button.closest('.pdp-tabs-section').querySelector('.tab-content-wrapper');
            if (wrapper) {
              wrapper.querySelectorAll('.tab-content').forEach(content => content.classList.remove('is-active'));
              const targetContent = document.getElementById(button.dataset.target);
              if (targetContent) targetContent.classList.add('is-active');
            }
          });
        });
        
        // Gắn sự kiện cho nút tăng/giảm số lượng
        const qtyInput = document.getElementById('quantity-input');
        const qtyIncrease = document.getElementById('qty-increase');
        const qtyDecrease = document.getElementById('qty-decrease');
        if (qtyInput && qtyIncrease && qtyDecrease) {
            qtyIncrease.addEventListener('click', () => { qtyInput.value = parseInt(qtyInput.value, 10) + 1; });
            qtyDecrease.addEventListener('click', () => {
                const currentVal = parseInt(qtyInput.value, 10);
                if (currentVal > 1) { qtyInput.value = currentVal - 1; }
            });
        }
        
        // Gắn sự kiện cho nút "Add to Cart"
        const addToCartBtn = document.getElementById('add-to-cart-btn');
        if (addToCartBtn && qtyInput) {
            addToCartBtn.addEventListener('click', () => {
                const quantity = parseInt(qtyInput.value, 10);
                if (quantity > 0 && currentProduct) { 
                    const userId = CartService.getCurrentUserId();
                    CartService.addToCart(userId, currentProduct, quantity); 
                } else {
                    alert('Số lượng không hợp lệ hoặc sản phẩm chưa được tải.');
                }
            });
        }
        
        // (Bạn có thể thêm sự kiện cho nút "Buy Now" ở đây nếu muốn)
    }

    // Chạy các hàm
    loadProductDetails();
    setupPDPEvents();
}
  
  function initializeAuthForms() {
      const loginButton = document.getElementById('login-form-button');
      if (loginButton) {
        loginButton.addEventListener('click', function() {
            const emailValue = document.getElementById('email').value.trim();
            const passwordValue = document.getElementById('password').value;
            const shouldRemember = document.getElementById('remember-me').checked;
            fetch('../data/users.json') 
              .then(response => response.json())
              .then(users => {
                  const foundUser = users.find(user => user.email === emailValue && user.password === passwordValue);
                  if (foundUser) {
                      const storage = shouldRemember ? localStorage : sessionStorage;
                      if (foundUser.role === 'admin') {
                          alert('Đăng nhập Admin thành công!');
                          localStorage.setItem('adminLoggedIn', 'true');
                          localStorage.setItem('adminName', foundUser.firstName); 
                          window.location.href = 'admin.html';
                      } else {
                          alert('Đăng nhập thành công! Chào mừng, ' + foundUser.firstName);
                          storage.setItem('isLoggedIn', 'true');
                          storage.setItem('currentUserId', foundUser.id);
                          checkLoginState(); 
                          loadPage('_index.html'); 
                          history.pushState(null, '', 'index.html');
                      }
                  } else {
                      showError(document.getElementById('password'), 'Email hoặc mật khẩu không hợp lệ.');
                  }
              })
              .catch(error => console.error('Lỗi khi tải users.json:', error));
        });
      }
      document.querySelectorAll('.password-toggle-btn').forEach(button => {
          button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
              input.type = 'text';
            } else {
              input.type = 'password';
            }
          });
      });
  }

  function initializeShopPage() {
      console.log("Initializing Shop Page...");
      const productGrid = document.getElementById('product-grid-container');
      if (!productGrid) return; 
      const categoryTitle = document.getElementById('category-title');
      const breadcrumbCategory = document.getElementById('breadcrumb-category');
      const sortSelect = document.getElementById('sort-by');
      const categoryFilterList = document.getElementById('category-filter-list');
      const clearFiltersBtn = document.getElementById('clear-all-filters-btn');
      const paginationContainer = document.getElementById('pagination-container');
      let allProducts = []; 
      let allCategories = [];
      let currentPage = 1;
      const productsPerPage = 9; 
      async function loadAndDisplayProducts() {
          try {
              if (allProducts.length === 0) {
                  productGrid.innerHTML = '<div class="loading-spinner" style="margin: 80px auto;"></div>';
                  const response = await fetch('../data/products.json');
                  if (!response.ok) throw new Error('Cannot fetch products.json');
                  const productsData = await response.json();
                  allProducts = productsData.products || productsData; 
                  const categories = [...new Set(allProducts.map(p => p.category))];
                  allCategories = categories.filter(c => c); 
                  renderCategoryFilter(); 
                  const params = new URLSearchParams(window.location.search);
                  const urlCategory = params.get('category');
                  if (urlCategory) {
                      const catRadio = document.querySelector(`input[name="category-filter"][value="${urlCategory}"]`);
                      if (catRadio) catRadio.checked = true;
                  }
              }
              const currentCategoryValue = document.querySelector('input[name="category-filter"]:checked').value;
              if (currentCategoryValue && currentCategoryValue !== 'all') {
                  const prettyCategoryName = currentCategoryValue.charAt(0).toUpperCase() + currentCategoryValue.slice(1);
                  categoryTitle.textContent = prettyCategoryName;
                  breadcrumbCategory.textContent = prettyCategoryName;
              } else {
                  categoryTitle.textContent = "All Products";
                  breadcrumbCategory.textContent = "All Products";
              }
              let filteredProducts = applyFilters();
              const sortValue = sortSelect.value;
              filteredProducts = applySort(filteredProducts, sortValue);
              renderProductGrid(filteredProducts);
              renderPagination(filteredProducts.length);
          } catch (e) {
              console.error("Lỗi khi tải trang Shop:", e);
              productGrid.innerHTML = `<p class="error-message">Không thể tải sản phẩm. Lỗi: ${e.message}</p>`;
          }
      }
      function renderProductGrid(products) {
          const startIndex = (currentPage - 1) * productsPerPage;
          const endIndex = startIndex + productsPerPage;
          const productsForPage = products.slice(startIndex, endIndex);
          if (productsForPage.length === 0) {
              productGrid.innerHTML = '<p style="text-align: center; padding: 30px;">Không tìm thấy sản phẩm nào phù hợp.</p>';
              return;
          }
          productGrid.innerHTML = productsForPage.map(product => {
              const price = product.price.discounted ? 
                  `<span class="price--discounted">${formatCurrency(product.price.discounted)}</span> <span class="price--original">${formatCurrency(product.price.original)}</span>` :
                  `<span class="price--discounted">${formatCurrency(product.price.original)}</span>`;
              return `
                  <div class="product-card">
                      <a href="product_detail.html?id=${product.id}" class="product-card__image-link ajax-link">
                          <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image">
                      </a>
                      <div class="product-card__info">
                          <span class="product-card__artisan">${product.artisanName}</span>
                          <span class="product-card__score">Score: ${product.sustainability_score}/10</span>
                          <h3 class="product-card__title">
                              <a href="product_detail.html?id=${product.id}" class="ajax-link">${product.name}</a>
                          </h3>
                          <div class="product-card__price">${price}</div>
                          <button class="product-card__button" data-product-id="${product.id}">Add to Cart</button>
                      </div>
                  </div>
              `;
          }).join('');
          attachGlobalLinks(); 
          productGrid.querySelectorAll('.product-card__button').forEach(button => {
              button.addEventListener('click', (e) => {
                  const id = e.currentTarget.dataset.productId;
                  const userId = CartService.getCurrentUserId();
                  const productObject = allProducts.find(p => p.id === id); 
                  if (productObject) {
                      CartService.addToCart(userId, productObject, 1);
                  } else {
                      alert('Lỗi: Không tìm thấy sản phẩm.');
                  }
              });
          });
      }
      function renderCategoryFilter() {
          categoryFilterList.innerHTML = '<li><input type="radio" id="cat-all" name="category-filter" value="all" checked><label for="cat-all">All Categories</label></li>';
          allCategories.forEach(cat => {
              const prettyName = cat.charAt(0).toUpperCase() + cat.slice(1);
              categoryFilterList.innerHTML += `
                  <li>
                      <input type="radio" id="cat-${cat}" name="category-filter" value="${cat}">
                      <label for="cat-${cat}">${prettyName}</label>
                  </li>
              `;
          });
          document.querySelectorAll('input[name="category-filter"]').forEach(radio => {
              radio.addEventListener('change', () => {
                  currentPage = 1;
                  history.pushState(null, '', 'products.html');
                  loadAndDisplayProducts();
              });
          });
      }
      function applyFilters() {
          const priceValue = document.querySelector('input[name="price-filter"]:checked').value;
          const categoryValue = document.querySelector('input[name="category-filter"]:checked').value;
          const scoreValue = document.querySelector('input[name="score-filter"]:checked').value;
          return allProducts.filter(product => {
              const price = product.price.discounted || product.price.original;
              let priceMatch = true;
              if (priceValue !== 'all') {
                  if (priceValue === '500000') {
                      priceMatch = price >= 500000;
                  } else {
                      const [min, max] = priceValue.split('-').map(Number);
                      priceMatch = price >= min && price <= max;
                  }
              }
              let categoryMatch = (categoryValue === 'all') ? true : (product.category === categoryValue);
              let scoreMatch = (scoreValue === 'all') ? true : (product.sustainability_score >= Number(scoreValue));
              return priceMatch && categoryMatch && scoreMatch;
          });
      }
      function applySort(products, sortValue) {
          const sorted = [...products];
          switch (sortValue) {
              case 'price-asc':
                  sorted.sort((a, b) => (a.price.discounted || a.price.original) - (b.price.discounted || b.price.original));
                  break;
              case 'price-desc':
                  sorted.sort((a, b) => (b.price.discounted || b.price.original) - (a.price.discounted || a.price.original));
                  break;
              case 'name-asc':
                  sorted.sort((a, b) => a.name.localeCompare(b.name));
                  break;
          }
          return sorted;
      }
      function renderPagination(totalProducts) {
          const totalPages = Math.ceil(totalProducts / productsPerPage);
          paginationContainer.innerHTML = ''; 
          if (totalPages <= 1) return; 
          const prevBtn = document.createElement('a');
          prevBtn.href = "#"; prevBtn.className = "pagination-link"; prevBtn.innerHTML = "←";
          if (currentPage === 1) prevBtn.classList.add('disabled');
          prevBtn.addEventListener('click', (e) => { e.preventDefault(); if (currentPage > 1) { currentPage--; loadAndDisplayProducts(); } });
          paginationContainer.appendChild(prevBtn);
          for (let i = 1; i <= totalPages; i++) {
              const pageBtn = document.createElement('a');
              pageBtn.href = "#"; pageBtn.className = "pagination-link"; pageBtn.textContent = i;
              if (i === currentPage) pageBtn.classList.add('is-active');
              pageBtn.addEventListener('click', (e) => { e.preventDefault(); currentPage = i; loadAndDisplayProducts(); });
              paginationContainer.appendChild(pageBtn);
          }
          const nextBtn = document.createElement('a');
          nextBtn.href = "#"; nextBtn.className = "pagination-link"; nextBtn.innerHTML = "→";
          if (currentPage === totalPages) nextBtn.classList.add('disabled');
          nextBtn.addEventListener('click', (e) => { e.preventDefault(); if (currentPage < totalPages) { currentPage++; loadAndDisplayProducts(); } });
          paginationContainer.appendChild(nextBtn);
      }
      function attachShopEvents() {
          sortSelect.addEventListener('change', () => { currentPage = 1; loadAndDisplayProducts(); });
          document.querySelectorAll('input[name="price-filter"]').forEach(radio => radio.addEventListener('change', () => { currentPage = 1; loadAndDisplayProducts(); }));
          document.querySelectorAll('input[name="score-filter"]').forEach(radio => radio.addEventListener('change', () => { currentPage = 1; loadAndDisplayProducts(); }));
          clearFiltersBtn.addEventListener('click', () => {
              document.getElementById('price-all').checked = true;
              document.getElementById('cat-all').checked = true;
              document.getElementById('score-all').checked = true;
              sortSelect.value = 'featured';
              history.pushState(null, '', 'products.html');
              currentPage = 1;
              loadAndDisplayProducts();
          });
      }
      loadAndDisplayProducts();
      attachShopEvents();
  }

  // DÁN ĐÈ HÀM NÀY LÊN HÀM initializeCartPage CŨ

async function initializeCartPage() {
    console.log("Initializing Cart Page (v4.1 - Fix Navigation)...");

    // === 1. LẤY DOM ELEMENTS (Giữ nguyên) ===
    const listContainer = document.getElementById('cart-items-list-container');
    const summaryBox = document.getElementById('cart-summary-box');
    const layoutContainer = document.getElementById('cart-layout');
    const emptyContainer = document.getElementById('cart-empty-container');
    const summaryItemCount = document.getElementById('cart-summary-item-count');
    const summaryTotalPrice = document.getElementById('cart-summary-total-price');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');

    if (!listContainer || !summaryBox || !layoutContainer || !emptyContainer) {
        console.error("HTML của trang giỏ hàng bị thiếu element!");
        return;
    }

    // === 2. BIẾN TRẠNG THÁI (Giữ nguyên) ===
    let currentUserId = CartService.getCurrentUserId();
    let currentCart = [];
    let selectedItemIds = new Set();

    // === 3. CÁC HÀM CON (loadAndRenderCart, renderEmptyCart, renderCartItems, calculateCartTotals) ===
    // (Toàn bộ các hàm này giữ nguyên, không cần thay đổi)
    async function loadAndRenderCart() {
        listContainer.innerHTML = '<div class="loading-spinner" style="margin: 50px auto;"></div>';
        await CartService.init(); 
        currentCart = CartService.getCart(currentUserId);
        if (currentCart.length === 0) {
            renderEmptyCart();
            return;
        }
        renderCartItems();
        attachEventListeners();
    }
    function renderEmptyCart() {
        layoutContainer.style.display = 'none';
        emptyContainer.style.display = 'block';
    }
    function renderCartItems() {
        layoutContainer.style.display = 'grid';
        emptyContainer.style.display = 'none';
        listContainer.innerHTML = '';
        let allSelectedOnLoad = (currentCart.length > 0); // Giả định chọn tất cả ban đầu
        currentCart.forEach(item => {
            const displayPrice = item.sellPrice || item.originalPrice;
            const itemTotalPrice = displayPrice * item.quantity;
            selectedItemIds.add(item.productId); // Tự động chọn tất cả
            const itemHtml = `
                <div class="cart-item" data-product-id="${item.productId}">
                    <div class="custom-checkbox checked" data-id="${item.productId}"></div>
                    <div class="cart-item__product-info">
                        <img src="${item.imagePath}" alt="${item.productName}" class="cart-item__product-image">
                        <span class="cart-item__product-name">${item.productName}</span>
                    </div>
                    <div class="cart-item__price">
                        ${(item.sellPrice && item.sellPrice < item.originalPrice) ? `<span class="price--original">${formatCurrency(item.originalPrice)}</span>` : ''}
                        <span class="price--discounted">${formatCurrency(displayPrice)}</span>
                    </div>
                    <div class="quantity-control">
                        <button class="qty-decrease" data-id="${item.productId}">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="qty-input" data-id="${item.productId}" />
                        <button class="qty-increase" data-id="${item.productId}">+</button>
                    </div>
                    <div class="cart-item__total-price">${formatCurrency(itemTotalPrice)}</div>
                    <button class="cart-item__remove-btn" data-id="${item.productId}">&#128465;</button>
                </div>
            `;
            listContainer.innerHTML += itemHtml;
        });
        selectAllCheckbox.classList.toggle('checked', allSelectedOnLoad);
        calculateCartTotals();
    }
    function calculateCartTotals() {
        let totalItems = 0;
        let totalAmount = 0;
        currentCart.forEach(item => {
            if (selectedItemIds.has(item.productId)) {
                const price = item.sellPrice || item.originalPrice;
                totalItems += item.quantity;
                totalAmount += price * item.quantity;
            }
        });
        summaryItemCount.textContent = totalItems.toString();
        summaryTotalPrice.textContent = formatCurrency(totalAmount);
    }
    
    // === 4. HÀM GẮN SỰ KIỆN (ĐÃ SỬA LỖI NÚT CHECKOUT) ===
    function attachEventListeners() {
        // (Sự kiện click cho list, change cho input, và selectAllCheckbox giữ nguyên)
        listContainer.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.dataset.id;
            if (!id) return;
            if (target.classList.contains('custom-checkbox')) {
                target.classList.toggle('checked');
                if (target.classList.contains('checked')) { selectedItemIds.add(id); }
                else { selectedItemIds.delete(id); }
                updateSelectAllCheckbox();
                calculateCartTotals();
            }
            const input = listContainer.querySelector(`.qty-input[data-id="${id}"]`);
            if (!input) return;
            let quantity = parseInt(input.value);
            if (target.classList.contains('qty-decrease')) {
                quantity = Math.max(1, quantity - 1);
                CartService.updateQuantity(currentUserId, id, quantity);
                loadAndRenderCart();
            } else if (target.classList.contains('qty-increase')) {
                quantity = quantity + 1;
                CartService.updateQuantity(currentUserId, id, quantity);
                loadAndRenderCart();
            }
            if (target.classList.contains('cart-item__remove-btn')) {
                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                    CartService.removeFromCart(currentUserId, id);
                    selectedItemIds.delete(id);
                    loadAndRenderCart();
                }
            }
        });
        listContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('qty-input')) {
                const id = e.target.dataset.id;
                let quantity = parseInt(e.target.value, 10);
                if (isNaN(quantity) || quantity < 1) { quantity = 1; }
                CartService.updateQuantity(currentUserId, id, quantity);
                loadAndRenderCart();
            }
        });
        selectAllCheckbox.addEventListener('click', () => {
            const isChecked = selectAllCheckbox.classList.toggle('checked');
            document.querySelectorAll('.cart-item .custom-checkbox').forEach(cb => {
                cb.classList.toggle('checked', isChecked);
                const id = cb.dataset.id;
                if (isChecked) { selectedItemIds.add(id); }
                else { selectedItemIds.delete(id); }
            });
            calculateCartTotals();
        });

        // === SỬA LỖI Ở ĐÂY ===
        // Gắn sự kiện cho nút Checkout
        const checkoutBtn = document.getElementById('cart-checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', (e) => {
                // Luôn gọi preventDefault() trước tiên vì nó là thẻ <a>
                e.preventDefault(); 
                
                if (selectedItemIds.size === 0) {
                    alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán.');
                    return; // Dừng lại, không làm gì cả
                }
                
                // Nếu hợp lệ:
                const itemsToCheckout = currentCart.filter(item => selectedItemIds.has(item.productId));
                localStorage.setItem('cart_for_checkout', JSON.stringify(itemsToCheckout));
                
                // TỰ GỌI ROUTER
                loadPage('_check_out.html');
                history.pushState(null, '', 'check_out.html');
            });
        }
    } // <-- Hết hàm attachEventListeners
    
    function updateSelectAllCheckbox() {
        const allCheckboxes = document.querySelectorAll('.cart-item .custom-checkbox');
        const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(cb => cb.classList.contains('checked'));
        selectAllCheckbox.classList.toggle('checked', allChecked);
    }

    // === 5. KHỞI CHẠY (Giữ nguyên) ===
    loadAndRenderCart();
}

  function initializeBlogPage(gridContainer) {
    console.log("Initializing Blog Page...");
    let allPosts = [];
    function createBlogCardHTML(post) {
      return `
        <article class="story-card" data-category="${post.category}">
          <a href="journal_detail.html?id=${post.id}" class="story-card__image-link ajax-link">
            <img class="story-card__image" src="${post.imageUrl}" alt="${post.title}">
          </a>
          <div class="story-card__content">
            <span class="story-card__tag">${post.category}</span>
            <h4 class="story-card__title">
              <a href="journal_detail.html?id=${post.id}" class="ajax-link">${post.title}</a>
            </h4>
            <p class="story-card__text">${post.snippet}</p>
            <a href="journal_detail.html?id=${post.id}" class="story-card__read-more ajax-link">Read More →</a>
          </div>
        </article>
      `;
    }
    function renderPosts(postsToRender) {
      gridContainer.innerHTML = '';
      if (postsToRender.length === 0) {
        gridContainer.innerHTML = '<p class="no-posts-message">No posts found for this category.</p>';
        return;
      }
      let finalHTML = '';
      postsToRender.forEach(post => {
        finalHTML += createBlogCardHTML(post);
      });
      gridContainer.innerHTML = finalHTML;
      attachGlobalLinks();
    }
    function applyFilter(filterValue) {
      if (filterValue === 'all') {
        renderPosts(allPosts);
      } else {
        const filteredPosts = allPosts.filter(post => post.category.toUpperCase() === filterValue);
        renderPosts(filteredPosts);
      }
    }
    async function initializeBlog() {
      try {
        const response = await fetch('../data/blogs.json');
        if (!response.ok) throw new Error('Cannot fetch blogs.json');
        allPosts = await response.json();
        renderPosts(allPosts);
        const filterButtons = document.querySelectorAll('.filter-pill');
        filterButtons.forEach(button => {
          button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('is-active'));
            this.classList.add('is-active');
            const filterValue = this.getAttribute('data-filter');
            applyFilter(filterValue);
          });
        });
      } catch (error) {
        console.error('Failed to initialize blog:', error);
        gridContainer.innerHTML = '<p class="error-message">Could not load blog posts.</p>';
      }
    }
    initializeBlog();
  }

  async function initializeBlogDetailPage() {
    console.log("Initializing Blog Detail Page...");
    try {
      // SỬA LỖI: Lấy ID từ query string
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('id');
      if (!postId) {
        throw new Error('Không tìm thấy Post ID trên URL (vd: ?id=b1)');
      }
      const response = await fetch('../data/blogs.json');
      if (!response.ok) throw new Error('Không thể tải file blogs.json');
      const posts = await response.json();
      const post = posts.find(p => p.id === postId);
      if (!post) {
        throw new Error(`Không tìm thấy bài viết với ID: ${postId}`);
      }
      document.getElementById('post-breadcrumb-title').textContent = post.title;
      document.getElementById('post-category').textContent = post.category.toUpperCase();
      document.getElementById('post-title').textContent = post.title;
      document.getElementById('post-author-name').textContent = `By ${post.authorName}`;
      document.getElementById('post-image').src = post.imageUrl;
      document.getElementById('post-image').alt = post.title;
      const contentBody = document.getElementById('post-content-body');
      contentBody.innerHTML = `
        <p><strong>${post.snippet}</strong></p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
        <h4>What We Found</h4>
        <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
      `;
      const relatedGrid = document.getElementById('related-posts-grid');
      if (relatedGrid) {
        const relatedPosts = posts.filter(p => p.id !== postId).slice(0, 3);
        let relatedHTML = '';
        relatedPosts.forEach(relatedPost => {
          relatedHTML += `
            <article class="story-card">
              <a href="journal_detail.html?id=${relatedPost.id}" class="story-card__image-link ajax-link">
                <img class="story-card__image" src="${relatedPost.imageUrl}" alt="${relatedPost.title}">
              </a>
              <div class="story-card__content">
                <span class="story-card__tag">${relatedPost.category.toUpperCase()}</span>
                <h4 class="story-card__title">
                  <a href="journal_detail.html?id=${relatedPost.id}" class="ajax-link">${relatedPost.title}</a>
                </h4>
                <p class="story-card__text">${relatedPost.snippet.substring(0, 50)}...</p>
                <a href="journal_detail.html?id=${relatedPost.id}" class="story-card__read-more ajax-link">Read More →</a>
              </div>
            </article>
          `;
        });
        relatedGrid.innerHTML = relatedHTML;
        attachGlobalLinks();
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết bài viết:', error);
      const contentBody = document.getElementById('post-content-body');
      if (contentBody) contentBody.innerHTML = `<p class="error-message">Could not load this post.</p>`;
    }
  }

  function initializeContactPage(contactForm) {
      console.log("Initializing Contact Page...");
      if (contactForm.dataset.listenerAttached) return;
      contactForm.dataset.listenerAttached = 'true';
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (!submitButton) return; 
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        setTimeout(() => {
          alert('Message Sent! Thank you for contacting us.');
          contactForm.reset();
          submitButton.textContent = 'Send Message';
          submitButton.disabled = false;
        }, 1000);
      });
  }

  // TRONG main.js
// HÃY XÓA HÀM initializePolicyPage CŨ VÀ THAY BẰNG HÀM NÀY:

function initializePolicyPage() {
  // Chỉ chạy nếu chúng ta đang ở trang policy
  const policyContent = document.getElementById('policyContent');
  if (!policyContent) {
    return; // Thoát nếu không phải trang policy
  }
  
  console.log("Initializing Policy Page (v2)..."); // Thêm log

  // Dữ liệu nội dung (Data)
  const policies = {
    information: {
      title: "INFORMATION PRIVACY POLICY",
      content: `
        <div class="policy-section">
          <p class="policy-text">
            <strong>We, REVIBE Company Limited ("REVIBE" or "We")</strong>, wish to provide members and all users accessing
            our e-commerce site Revibe.vn (hereinafter referred to as <strong>"Member"</strong> in this Personal Information Privacy
            Policy) with the most comfortable and best experience when accessing and using the services on our e-commerce
            site Revibe.vn (<strong>"Website"</strong>).
          </p>
          <p class="policy-text">
            This Personal Information Privacy Policy informs members of the regulations regarding the collection, use, and 
            security of Personal Data, which are governed by Vietnamese law applicable to members when using the Website.
          </p>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">1. Purpose and Scope of Collection</h3>
          <p class="policy-text">
            <strong>a. In the process of providing services, We will/may collect personal data about members in the following cases:</strong>
          </p>
          <ol class="policy-roman-list">
            <li>When the member registers/accesses and/or uses our Website;</li>
            <li>When the member submits any form, including registration forms or other forms related to any of our products and services, whether online or through other stated formats;</li>
            <li>When the member enters into any agreement or provides other documents or information related to the interaction between the member and Us, or when the member uses our products and services;</li>
            <li>When the member interacts with Us, such as through phone calls (which may be recorded), correspondence, fax, in-person meetings, social media platforms, and email;</li>
            <li>When the member uses our electronic services, or interacts with us via the platform or Website or our services. This includes interaction through cookie files that We may deploy when the member interacts with the platforms or Website;</li>
            <li>When the member conducts transactions through our Services;</li>
            <li>When the member provides feedback or submits complaints to Us;</li>
            <li>When the member submits their Personal Data to Us for any reason;</li>
            <li>We may collect Personal Data from other legal sources and in compliance with the law.</li>
          </ol>
          <p class="policy-text">
            <strong>b. Personal Data that the Website may collect includes:</strong>
          </p>
          <ul class="policy-list">
            <li>Full name;</li>
            <li>Gender;</li>
            <li>Date of birth;</li>
            <li>Billing address;</li>
            <li>Bank account and payment information for orders on the Website;</li>
            <li>Phone number;</li>
            <li>Email address;</li>
            <li>Information sent by or related to the device(s) used to access our Services or Website; and</li>
            <li>Any other information about the member when the member logs in to use our Services or Platform, and when the member uses our Services or Platform, as well as information on how the member uses our Services or Platform, and aggregated data on the content the member uses.</li>
          </ul>
          <p class="policy-text">
            <strong>c. The collection of this information is intended to serve the transactions and activities of the member related to the Website.</strong> The member is solely responsible for the security and storage of all service usage activities under their registered name, password, and email inbox. Furthermore, the member is responsible for promptly notifying REVIBE of any unauthorized use, abuse, security violations, or third-party retention of their registered name and password so that appropriate action can be taken.
          </p>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">2. Scope of Information Usage</h3>
          <p class="policy-text"><strong>The Website uses the provided member information to:</strong></p>
          <ul class="policy-list">
            <li>Provide services to the member;</li>
            <li>Send notifications regarding communication activities between the member and the Website;</li>
            <li>Prevent activities that destroy the member's user account or activities that impersonate the member;</li>
            <li>Contact and resolve issues with the member in special cases;</li>
            <li>Verify and contact relevant parties regarding transactions on the Website; and</li>
            <li>Prevent activities that destroy the member's user account or activities that impersonate the member.</li>
          </ul>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">3. Data Storage Period</h3>
          <p class="policy-text">
            <strong>The member's Personal Data will be stored until a request for cancellation is made or the member logs in and performs the cancellation.</strong> In all other cases, the member's personal data will be stored securely on REVIBE's server.
          </p>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">4. Individuals or Organizations That May Have Access to Personal Information</h3>
          <p class="policy-text"><strong>Recipients who may access the customer/member's personal information fall into one of the following cases:</strong></p>
          <div class="policy-subsection">
            <p class="policy-text">
              <strong>In case of a legal request, REVIBE is responsible for cooperating in providing the member's personal information</strong> when requested by judicial authorities, including: The procuracy, the court, and the police investigation agency related to any violation of law by the member, and such disclosure is reasonably necessary to comply with legal procedures. Additionally, no one has the right to infringe upon the member's personal information.
            </p>
          </div>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">5. Address of the Unit That Collects and Manages Personal Information</h3>
          <div class="policy-subsection">
            <p class="policy-text">
              <strong>Unit Name: REVIBE Company Limited</strong> (Established and operating under Enterprise Registration Certificate No. 0316713818 issued by the Department of Planning and Investment of Ho Chi Minh City for the first time on 09/10/2025.)<br>
              <strong>Trụ sở chính:</strong> G-12A17, Tầng 12, Khu phức hợp The Manor Officetel, Số 89 đường Nguyễn Hữu Cảnh, Phường 22, Quận Bình Thạnh, Thành phố Hồ Chí Minh<br>
              <strong>Email:</strong> revibe@revibe.vn
            </p>
          </div>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">6. Means and Tools for Users to Access and Edit Their Personal Data</h3>
          <p class="policy-text">
            <strong>Members have the right to check, update, modify, or cancel their personal information</strong> by logging into their account and editing their personal information.
          </p>
          <p class="policy-text">
            <strong>Members have the right to request a password retrieval</strong> if they forget their password by sending an email to revibe@revibe.vn. The REVIBE site administrator will guide the member through the steps to retrieve their account. Please note that the site administrator cannot interfere with the member's password.
          </p>
          <p class="policy-text">
            <strong>Members have the right to request the cancellation or revocation of personal information</strong> by clicking the "Request Account Deletion" button on the "My Account" page. The REVIBE site administrator will contact you to verify and process your request within 24 working hours.
          </p>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">7. Commitment to Member Personal Information Security</h3>
          <p class="policy-text">
            <strong>The personal information of members on Revibe.vn is committed to absolute security</strong> according to this Personal Information Privacy Policy. The collection and use of information shall only be conducted with the consent of the member, except for cases where otherwise prescribed by law.
          </p>
          <div class="policy-subsection">
            <p class="policy-text">
              <strong>We do not use, transfer, provide, or disclose any member's personal information to any third party without the member's consent.</strong><br>
              <strong>In the event that a server storing data is attacked by a hacker</strong> leading to the loss of member data, Revibe.vn will be responsible for notifying the relevant authorities for investigation and timely informing the affected member.<br>
              <strong>All online transaction information of the member</strong>, including digital invoices and accounting documents, is kept absolutely confidential in the central secure data area of REVIBE.
            </p>
          </div>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">8. Changes to the Personal Information Privacy Policy</h3>
          <p class="policy-text">
            <strong>From time to time, We may modify this Personal Information Privacy Policy</strong> according to our business needs without prior notice to the member. We may inform the member of these changes by sending an email or by posting the changes on this Website, if necessary. Any changes will be effective immediately upon posting the revised Personal Information Privacy Policy on this Website.
          </p>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">9. Effectiveness</h3>
          <p class="policy-text">
            <strong>This Personal Information Privacy Policy is effective from November 01, 2025.</strong>
          </p>
        </div>
      `
    },
    payment: {
      title: "PAYMENT SECURITY POLICY", 
      content: `
        <div class="policy-section">
          <p class="policy-text">
            <strong>Payment Security Policy content will be loaded here...</strong>
          </p>
        </div>
      `
    },
    complaint: {
      title: "COMPLAINT RESOLUTION POLICY",
      content: `
        <div class="policy-section">
          <p class="policy-text">
            <strong>This Policy is an integral part of the Regulations for the Revibe.vn E-commerce Platform</strong> and sets out the
            process and mandatory requirements for the Revibe.vn Site Administration Board to receive and handle complaints.
            We are committed to fostering transparency and trust in all transactions involving our sustainable products.
          </p>
          <p class="policy-text">
            <strong>This Policy applies to:</strong>
          </p>
          <ul class="policy-list">
            <li>Complaints regarding product or service quality not matching the description;</li>
            <li>Delivery issues;</li>
            <li>Payment issues;</li>
            <li>Other issues related to the Buyer (collectively referred to as "Members") on the Revibe.vn e-commerce exchange.</li>
          </ul>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">1. Complaint Submission Method and Deadline</h3>
          <h4 class="step-title">1.1. Complaint Deadline</h4>
          <p class="policy-text">
            <strong>For complaints concerning product quality, payment, and delivery,</strong> Members must submit their complaint
            immediately within <strong>03 working days</strong> from the date of receiving the goods or completing the payment. For other
            general feedback, Members are welcome to submit their suggestions at any time to help the Revibe Site improve
            and identify any questionable behavior or potential violations.
          </p>
          <h4 class="step-title">1.2. Complaint Submission Methods</h4>
          <p class="policy-text"><strong>Members can submit a complaint using one of the following methods:</strong></p>
          <ul class="policy-list">
            <li>Send an electronic mail (email) to: cskh@revibe.vn.</li>
            <li>Call the designated Hotline at: 0376215924.</li>
            <li>Send a direct complaint (via in-person submission or certified mail) to the following address:<br>
                Unit Name: REVIBE.<br>
                Address: 123 Vo Van Tan, District 3, Ho Chi Minh City</li>
          </ul>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">2. Complaint and Dispute Resolution Procedure</h3>
          <p class="policy-text">
            <strong>The process for addressing all complaints is structured into three clear steps</strong> to ensure fairness and efficiency:
          </p>
          <div class="complaint-step">
            <h4 class="step-title">Step 1: Complaint Reception and Verification</h4>
            <p class="policy-text">
              <strong>The Customer Service Department of REVIBE will receive all Member complaints</strong> submitted through the methods
              listed above. To facilitate a thorough investigation, REVIBE will request that the Buyer provide specific
              information and evidence related to the transaction and product. This information is essential for verification,
              clarifying the case, and determining the appropriate course of action.
            </p>
          </div>
          <div class="complaint-step">
            <h4 class="step-title">Step 2: Policy-Based Response</h4>
            <p class="policy-text">
              <strong>Based on the evidence gathered and verified,</strong> the Customer Service Department will prepare a formal response
              grounded in the published policies of REVIBE. This response will be delivered to the Member via email or phone call.
            </p>
          </div>
          <div class="complaint-step">
            <h4 class="step-title">Step 3: Implementation of Resolution</h4>
            <p class="policy-text">
              <strong>The final response and resolution outcome will be transferred to the relevant departments</strong> within REVIBE for
              implementation. This step is necessary in specific cases that require support from other teams to settle the
              Member's rights, such as when:
            </p>
            <ul class="policy-list">
              <li>Goods must be received back/exchanged/returned to the Member.</li>
              <li>A refund must be issued to the Member.</li>
              <li>Other related assistance is required.</li>
            </ul>
          </div>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">3. Complaint Processing Timeframe</h3>
          <p class="policy-text">
            <strong>We strive to resolve all complaints as quickly as possible.</strong> The maximum time for providing an initial response
            is <strong>15 working days</strong> from the date the complaint is officially received.
          </p>
          <p class="policy-text">
            <strong>It is the Member's responsibility to provide all requested information</strong> within the time requested by REVIBE. 
            If the Member fails to provide sufficient information to resolve the complaint within this period, REVIBE will 
            consider the Member to have withdrawn their complaint, and the case will be closed at the end of the 15 working 
            day period without fault on REVIBE's part. Should the complaint case require submission to a competent State 
            authority for legal resolution, the processing time will align with that authority's required timeframe.
          </p>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">4. Principles for Mediation and Final Resolution</h3>
          <h4 class="step-title">4.1. Accountability and Direct Resolution</h4>
          <p class="policy-text">
            <strong>The complaint resolution process focuses on direct accountability and immediate correction</strong> of any service
            failure. If the issue remains unresolved after following the three initial steps (Reception, Response, and
            Implementation), REVIBE is committed to immediate and direct resolution.
          </p>
          <div class="policy-subsection">
            <p class="policy-text">
              <strong>REVIBE's Responsibility:</strong> We will actively listen to and receive information from the customer (requiring the
              customer to accurately provide all information, both tangible and intangible, regarding the alleged damage) to
              proceed with reviewing, clarifying, and analyzing the cause of the fault. We will then propose a compensation
              level and conclude the dispute as satisfactorily as possible.<br><br>
              <strong>The Buyer's Responsibility:</strong> The Buyer must provide complete and accurate information and evidence related to 
              the transaction and product, as requested by REVIBE, to facilitate verification, clarification, and appropriate resolution.
            </p>
          </div>
          <h4 class="step-title">4.2. Resolution Outcomes and Returns/Exchanges</h4>
          <p class="policy-text">
            <strong>If the fault is definitively proven to be with REVIBE, we will take immediate corrective measures:</strong>
          </p>
          <ul class="policy-list">
            <li><strong>Mandatory Compensation/Exchange:</strong> REVIBE will be required to fully compensate the Buyer for all costs incurred or to exchange the product or service for one that correctly matches the quality advertised on the Revibe Site.</li>
            <li><strong>Internal Review and Improvement:</strong> Any internal failure leading to the fault will be subject to strict review to ensure compliance with our sustainability commitments and prevent recurrence. If the problem is due to a repeated failure within REVIBE's operations, we will take appropriate internal corrective action.</li>
            <li><strong>Legal Action:</strong> If all commercial negotiation efforts fail to resolve the conflict, the Buyer may refer the case to a competent State authority for resolution to ensure their legitimate legal interests are protected.</li>
          </ul>
        </div>
        <div class="policy-section">
          <h3 class="policy-section-title">5. Effectiveness</h3>
          <p class="policy-text">
            <strong>This Complaint and Resolution Policy is effective from November 1, 2025.</strong>
          </p>
        </div>
      `
    },
    faq : {
      title: `FREQUENTLY ASKED QUESTIONS (FAQ)`,
      content: `
        <div class="policy-section">
          <p class="policy-text">
            <strong>Welcome to Revibe's Frequently Asked Questions section!</strong><br><br>
            We've gathered the most common inquiries about our handcrafted and recycled product collections, sustainable business model, and policies to help you enjoy a seamless shopping experience.
          </p>
        </div>
        <div class="faq-category">
          <h3 class="faq-category-title">1. ABOUT REVIBE</h3>
          <div class="faq-item">
            <div class="faq-question">Q1. What is Revibe?</div>
            <div class="faq-answer">
              Revibe is a sustainable e-commerce platform based in Ho Chi Minh City, connecting eco-conscious customers with
              beautifully handcrafted and recycled products. Our collections combine traditional craftsmanship with modern
              design, creating items that breathe new life into forgotten materials.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q2. Where is Revibe located?</div>
            <div class="faq-answer">
              Our main office is located at 123 Vo Van Tan, District 3, Ho Chi Minh City, Vietnam.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q3. Does Revibe collaborate directly with artisans?</div>
            <div class="faq-answer">
              We source products from local artisans and small workshops, but all final packaging, branding, and sales
              processes are fully managed by Revibe to ensure consistent quality and sustainability standards.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q4. How does Revibe promote sustainable living?</div>
            <div class="faq-answer">
              Every product sold on Revibe contributes to waste reduction by reusing, recycling, or upcycling materials. We
              also minimize packaging waste and prioritize biodegradable materials in shipping.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q5. Are all Revibe products handmade?</div>
            <div class="faq-answer">
              Yes. Every product available on our website is handcrafted with care, often incorporating recycled or
              locally sourced natural materials.
            </div>
          </div>
        </div>
        <div class="faq-category">
          <h3 class="faq-category-title">2. PRODUCTS & MATERIALS</h3>
          <div class="faq-item">
            <div class="faq-question">Q6. What materials are commonly used?</div>
            <div class="faq-answer">
              Our products feature a mix of sustainable materials such as recycled textiles, bamboo, coconut shells,
              reused glass, paper fiber, and natural dyes.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q7. Do you produce items in bulk?</div>
            <div class="faq-answer">
              No. We value craftsmanship and sustainability over mass production. Each item is limited in quantity to
              maintain authenticity and reduce waste.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q8. Can I request custom-made items?</div>
            <div class="faq-answer">
              While we do not currently offer personalized orders, we're planning to introduce limited seasonal
              collections that allow for customization based on customer feedback.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q9. Are your products eco-certified?</div>
            <div class="faq-answer">
              Most of our materials are sourced from verified eco-suppliers. We are in the process of obtaining
              international sustainability certifications for select collections.
            </div>
          </div>
        </div>
        <div class="faq-category">
          <h3 class="faq-category-title">3. ORDERING & PAYMENT</h3>
          <div class="faq-item">
            <div class="faq-question">Q10. How do I place an order on Revibe.vn?</div>
            <div class="faq-answer">
              Simply browse our collections, add items to your cart, and proceed to checkout. You can make payment securely
              via bank transfer, credit/debit card, or digital wallet.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q11. Which currencies do you accept?</div>
            <div class="faq-answer">
              We currently accept payments in Vietnamese Dong (VND). International support for USD payments will be added soon.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q12. Is my payment information safe?</div>
            <div class="faq-answer">
              Absolutely. All payment data is encrypted and processed through certified secure gateways. Your privacy is
              protected under our Personal Information Privacy Policy.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q13. Can I modify my order after placing it?</div>
            <div class="faq-answer">
              Yes, but only within 24 hours after your order is confirmed. Please contact our Customer Service team at
              cskh@revibe.vn or 0376215924 for assistance.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q14. What should I do if payment fails?</div>
            <div class="faq-answer">
              Please double-check your internet connection and payment details. If the issue persists, reach out to our
              support team for manual verification.
            </div>
          </div>
        </div>
        <div class="faq-category">
          <h3 class="faq-category-title">4. SHIPPING & DELIVERY</h3>
          <div class="faq-item">
            <div class="faq-question">Q15. Which areas do you deliver to?</div>
            <div class="faq-answer">
              We deliver nationwide across Vietnam. International shipping will be available starting in early 2026.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q16. How long does delivery take?</div>
            <div class="faq-answer">
              Standard shipping takes 3–5 business days within major cities and 5–10 days for other regions.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q17. How much is the shipping fee?</div>
            <div class="faq-answer">
              Shipping costs depend on your location and order size. The exact fee will appear at checkout before
              confirmation.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q18. What should I do if my order arrives damaged?</div>
            <div class="faq-answer">
              Please take a clear photo of the item and packaging, then email it to cskh@revibe.vn within 3 working days for
              verification and replacement per our Complaint Resolution Policy.
            </div>
          </div>
        </div>
        <div class="faq-category">
          <h3 class="faq-category-title">5. RETURNS, REFUNDS & EXCHANGES</h3>
          <div class="faq-item">
            <div class="faq-question">Q19. Can I return or exchange an item?</div>
            <div class="faq-answer">
              Yes, under specific conditions. You can request a return or exchange within 3 working days of receiving the
              product if it's defective or doesn't match the description.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q20. Who covers the shipping cost for returns?</div>
            <div class="faq-answer">
              If the issue is caused by Revibe (e.g., incorrect item, damaged product), we will cover the return shipping
              fee. Otherwise, the buyer bears the cost.
            </div>
          </div>
          <div class="faq-item">
            <div class="faq-question">Q21. When will I receive my refund?</div>
            <div class="faq-answer">
              Refunds are typically processed within 7–10 business days after we receive and inspect the returned product.
            </div>
          </div>
        </div>
      `
    }
  };

  // DOM elements
  const policyNavItems = document.querySelectorAll('.policy-nav-item');
  
  // (Đã xóa logic 'termsPolicyLink' vì nó không có trên trang này)

  // Load policy content
  function loadPolicy(policyKey) {
    const policy = policies[policyKey];
    if (policy) {
      policyContent.innerHTML = `
        <h2 class="auth-form__title" style="text-align: left; font-size: 34px;">${policy.title}</h2>
        <div class="policy-content-body">
            ${policy.content}
        </div>
      `;
      
      // Update active nav item
      policyNavItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.policy === policyKey) {
          item.classList.add('active');
        }
      });
      
      // SỬA LỖI 2: Gắn lại router cho các link AJAX
      attachGlobalLinks(); 
    }
  }

  // Event listeners
  policyNavItems.forEach(item => {
    item.addEventListener('click', () => {
      loadPolicy(item.dataset.policy);
    });
  });

  // Load default policy based on active nav item
  const activeNavItem = document.querySelector('.policy-nav-item.active');
  if (activeNavItem) {
    loadPolicy(activeNavItem.dataset.policy);
  }
}

  function initializeProfilePage() {
    const profileDashboard = document.querySelector('.profile-dashboard');
    if (!profileDashboard) { return; }
    console.log("Khởi tạo Trang Profile (phiên bản Tab)...");
    
    // Biến state của component
    let allUsersData = [];
    let currentUser = null; 
    const navLinks = profileDashboard.querySelectorAll('.profile-nav__link');
    const contentTabs = profileDashboard.querySelectorAll('.tab-content');
    const formCardContainer = profileDashboard.querySelector('#tab-personal-info .profile-form-card');
    const originalFormHTML = formCardContainer ? formCardContainer.innerHTML : "";

    // === CÁC HÀM CỦA TAB 1: PERSONAL INFO ===
    
    // SỬA LỖI 1: Bổ sung sự kiện cho 'changePassBtn'
    function attachPersonalInfoListeners() {
      const saveProfileBtn = document.getElementById('save-profile-button');
      const changePassBtn = document.getElementById('change-password-trigger');
      if (saveProfileBtn) saveProfileBtn.addEventListener('click', handleSaveProfile);
      if (changePassBtn) changePassBtn.addEventListener('click', renderChangePasswordForm); // <-- DÒNG BỊ THIẾU
    }
    
    function handleSaveProfile(event) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      const btn = event.currentTarget;
      const firstName = document.getElementById('first-name').value.trim();
      const lastName = document.getElementById('last-name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      clearErrors();
      if (!firstName) { showError(document.getElementById('first-name'), 'First name is required.'); return; }
      if (!lastName) { showError(document.getElementById('last-name'), 'Last name is required.'); return; }
      btn.textContent = 'Saving...'; btn.disabled = true;
      setTimeout(() => {
        alert('Profile saved successfully!');
        btn.textContent = 'Save Changes'; btn.disabled = false;
      }, 1000);
    }
    
    // SỬA LỖI 2: Bổ sung HTML cho form đổi mật khẩu
    function renderChangePasswordForm() {
      formCardContainer.innerHTML = `
        <h1 class="auth-form__title" style="text-align: left;">Change Password</h1>
        <form class="auth-form" onsubmit="return false;">
            <div class="form-group">
                <label for="current-password" class="form-group__label">Current Password</label>
                <input type="password" id="current-password" class="form-group__input">
                <div class="form-error-message"></div>
            </div>
            <div class="form-group">
                <label for="new-password" class="form-group__label">New Password</label>
                <input type="password" id="new-password" class="form-group__input">
                <div class="form-error-message"></div>
            </div>
            <div class="form-group">
                <label for="confirm-password" class="form-group__label">Confirm New Password</label>
                <input type="password" id="confirm-password" class="form-group__input">
                <div class="form-error-message"></div>
            </div>
            <div class="form-actions">
                <button type="button" id="save-password-btn" class="auth-form__button">Save New Password</button>
                <button type="button" id="cancel-password-btn" class="auth-form__button button--outlined">Cancel</button>
            </div>
        </form>
      `;
      // Gắn sự kiện cho các nút MỚI
      document.getElementById('save-password-btn').addEventListener('click', handleSavePassword);
      document.getElementById('cancel-password-btn').addEventListener('click', restoreOriginalForm);
    }
    
    function handleSavePassword() {
      /* (Code của bạn đã đúng, giữ nguyên) */
      clearErrors();
      const currentPass = document.getElementById('current-password').value;
      const newPass = document.getElementById('new-password').value;
      const confirmPass = document.getElementById('confirm-password').value;
      if (!currentPass) { showError(document.getElementById('current-password'), 'Please fill in all fields.'); return; }
      if (!newPass) { showError(document.getElementById('new-password'), 'Please fill in all fields.'); return; }
      if (!confirmPass) { showError(document.getElementById('confirm-password'), 'Please fill in all fields.'); return; }
      if (newPass !== confirmPass) { showError(document.getElementById('confirm-password'), 'New passwords do not match.'); return; }
      
      const saveBtn = document.getElementById('save-password-btn');
      saveBtn.textContent = 'Saving...'; saveBtn.disabled = true;
      
      // (Trong app thật, bạn sẽ kiểm tra currentPass với server/currentUser)
      
      setTimeout(() => {
          alert('Password changed successfully!');
          restoreOriginalForm();
      }, 1000);
    }
    function restoreOriginalForm() {
      formCardContainer.innerHTML = originalFormHTML;
      attachPersonalInfoListeners(); 
    }

    // === CÁC HÀM CỦA TAB 3: ORDER HISTORY ===
    async function loadOrderHistoryData(tabContainer) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      console.log("Đang tải dữ liệu Order History...");
      const ordersContainer = tabContainer.querySelector('#ordersContainer');
      const statusTabs = tabContainer.querySelector('#orders-status-tabs');
      const paginationPages = tabContainer.querySelector('#paginationPages');
      const prevPageBtn = tabContainer.querySelector('#prevPage');
      const nextPageBtn = tabContainer.querySelector('#nextPage');
      if (!ordersContainer || !statusTabs) { console.error("HTML của tab 'tab-order-history' bị thiếu."); return; }
      let allUserOrders = [];
      let allProducts = {};
      let currentPage = 1;
      let currentStatusFilter = 'all';
      const ORDERS_PER_PAGE = 5;
      const customerId = CartService.getCurrentUserId() || "u1"; 
      function renderOrdersTable(ordersToRender) {
          ordersContainer.innerHTML = '';
          if (ordersToRender.length === 0) { ordersContainer.innerHTML = '<p style="text-align: center; padding: 30px;">Bạn không có đơn hàng nào.</p>'; return; }
          let html = '';
          ordersToRender.forEach(order => {
            const productsHtml = (order.products || []).map(item => {
              const product = allProducts[item.productId];
              const name = product ? product.name : `ID: ${item.productId}`;
              return `<li class="order-product-item"><span>${name} (x${item.quantity})</span></li>`;
            }).join('');
            const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
            const date = new Date(order.date);
            const dateStr = `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;
            html += `
              <div class="order-card">
                <div class="order-card-cell order-id" data-label="Order ID">${order.orderId}</div>
                <div class="order-card-cell order-products" data-label="Product"><ul class="order-product-list">${productsHtml}</ul></div>
                <div class="order-card-cell" data-label="Order Date">${dateStr}</div>
                <div class="order-card-cell order-status" data-label="Status" data-status="${statusText}">${statusText}</div>
                <div class="order-card-cell order-total" data-label="Total">${formatCurrency(order.total)}</div>
                <div class="order-card-cell" data-label="Action">
                  <a href="order_detail.html?orderId=${order.orderId}" class="order-action-btn ajax-link">View Details</a>
                </div>
              </div>`;
          });
          ordersContainer.innerHTML = html;
          attachGlobalLinks();
      }
      function renderPagination(totalItems, itemsPerPage) {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationPages.innerHTML = '';
        if (totalPages <= 1) { prevPageBtn.style.display = 'none'; nextPageBtn.style.display = 'none'; return; }
        prevPageBtn.style.display = 'block'; nextPageBtn.style.display = 'block';
        for (let i = 1; i <= totalPages; i++) {
          const pageBtn = document.createElement('button');
          pageBtn.className = `pagination-page-btn ${i === currentPage ? 'active' : ''}`;
          pageBtn.textContent = i; pageBtn.dataset.page = i;
          pageBtn.addEventListener('click', () => renderPage(i));
          paginationPages.appendChild(pageBtn);
        }
        prevPageBtn.disabled = (currentPage === 1);
        nextPageBtn.disabled = (currentPage === totalPages);
      }
      function renderPage(page) {
        if (page) currentPage = page;
        let filteredOrders = allUserOrders;
        if (currentStatusFilter !== 'all') { filteredOrders = allUserOrders.filter(order => order.status === currentStatusFilter); }
        const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
        const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ORDERS_PER_PAGE);
        renderOrdersTable(paginatedOrders);
        renderPagination(filteredOrders.length, ORDERS_PER_PAGE);
      }
      ordersContainer.innerHTML = '<div class="loading-spinner" style="margin: 50px auto;"></div>';
      try {
          const productsRes = await fetch('../data/products.json');
          const productsData = await productsRes.json();
          (productsData.products || productsData).forEach(p => { allProducts[p.id] = p; });
          await OrderService.init();
          const allOrders = OrderService.getOrders();
          allUserOrders = allOrders.filter(o => o.customerId === customerId);
          allUserOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
          statusTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.tab-btn');
            if (!tab) return;
            statusTabs.querySelector('.tab-btn.active').classList.remove('active');
            tab.classList.add('active');
            currentStatusFilter = tab.dataset.status;
            renderPage(1); 
          });
          prevPageBtn.addEventListener('click', () => { if (currentPage > 1) renderPage(currentPage - 1); });
          nextPageBtn.addEventListener('click', () => renderPage(currentPage + 1));
          renderPage(1);
      } catch (error) {
          console.error("Lỗi khi tải lịch sử đơn hàng:", error);
          ordersContainer.innerHTML = '<p class="error-message">Đã xảy ra lỗi khi tải dữ liệu.</p>';
      }
    }
    
    // === CÁC HÀM CỦA TAB 2: ADDRESS BOOK ===
    async function loadAddressBookData(tabContainer) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      console.log("Đang tải dữ liệu Address Book (v2)...");
      const listContainer = tabContainer.querySelector('#address-list-container');
      const formContainer = tabContainer.querySelector('#address-form-container');
      const addBtn = tabContainer.querySelector('#add-new-address-btn');
      if (!listContainer || !formContainer || !addBtn) { console.error("HTML của tab-address-book bị thiếu!"); return; }
      addBtn.addEventListener('click', () => { renderAddressForm(formContainer, null); });
      listContainer.innerHTML = '<div class="loading-spinner" style="margin: 50px auto;"></div>';
      try {
          if (allUsersData.length === 0) {
              const response = await fetch('../data/users.json');
              allUsersData = await response.json();
          }
          const customerId = CartService.getCurrentUserId() || "u1"; 
          currentUser = allUsersData.find(u => u.id === customerId);
          if (!currentUser || !currentUser.addresses) { listContainer.innerHTML = '<p>Không tìm thấy địa chỉ nào.</p>'; return; }
          renderAddressCards(listContainer, currentUser.addresses, currentUser.defaultAddressId);
          listContainer.addEventListener('click', (e) => {
              const target = e.target.closest('.address-action-link[data-id]');
              if (!target) return;
              e.preventDefault();
              const addressId = target.dataset.id;
              if (target.matches('.link--danger')) { handleDeleteAddress(addressId, listContainer); }
              else if (target.matches('.link--set-default')) { handleSetDefault(addressId, listContainer); }
              else { renderAddressForm(formContainer, addressId); }
          });
      } catch (error) {
          console.error("Lỗi khi tải Address Book:", error);
          listContainer.innerHTML = '<p class="error-message">Đã xảy ra lỗi khi tải dữ liệu.</p>';
      }
    }
    function renderAddressCards(container, addresses, defaultId) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      if (addresses.length === 0) { container.innerHTML = '<p style="text-align:center; padding: 30px;">Bạn chưa có địa chỉ nào.</p>'; return; }
      addresses.sort((a, b) => {
          if (a.id === defaultId) return -1;
          if (b.id === defaultId) return 1;
          return 0;
      });
      let html = '';
      addresses.forEach(addr => {
          const isDefault = (addr.id === defaultId);
          html += `
              <div class="address-card ${isDefault ? 'address-card--default' : ''}">
                  <div class="address-card__header">
                      <span class="address-card__name">${addr.fullName}</span>
                      ${isDefault ? '<span class="address-card__badge">Default</span>' : ''}
                  </div>
                  <p class="address-card__text">${addr.phone}</p>
                  <p class="address-card__text">${addr.street}</p>
                  <p class="address-card__text">${addr.city}</p>
                  <div class="address-card__actions">
                      <a href="#" class="address-action-link link--danger" data-id="${addr.id}">Delete</a>
                      <a href="#" class="address-action-link" data-id="${addr.id}">Edit</a>
                      <a href="#" class="address-action-link link--set-default ${isDefault ? 'link--disabled' : ''}" data-id="${addr.id}">
                          ${isDefault ? 'Default' : 'Set as Default'}
                      </a>
                  </div>
              </div>`;
      });
      container.innerHTML = html;
    }
    function renderAddressForm(formContainer, addressId) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      let address = { id: null, fullName: '', phone: '', street: '', city: '' };
      let title = 'Add New Address';
      if (addressId) {
          address = currentUser.addresses.find(a => a.id === addressId);
          title = 'Edit Address';
      }
      formContainer.style.display = 'block';
      formContainer.innerHTML = `
          <div class="profile-form-card" style="background: #fdfdfd; border: 1px solid #eee;">
              <h1 class="auth-form__title" style="text-align: left;">${title}</h1>
              <form class="auth-form" id="address-form-dynamic" onsubmit="return false;">
                  <div class="form-group"><label for="addr-fullName" class="form-group__label">Full Name</label><input type="text" id="addr-fullName" class="form-group__input" value="${address.fullName}"></div>
                  <div class="form-group"><label for="addr-phone" class="form-group__label">Phone</label><input type="tel" id="addr-phone" class="form-group__input" value="${address.phone}"></div>
                  <div class="form-group"><label for="addr-street" class="form-group__label">Street Address</label><input type="text" id="addr-street" class="form-group__input" value="${address.street}"></div>
                  <div class="form-group"><label for="addr-city" class="form-group__label">City</label><input type="text" id="addr-city" class="form-group__input" value="${address.city}"></div>
                  <div class="form-actions">
                      <button type="button" id="save-address-btn" class="auth-form__button">Save Address</button>
                      <button type="button" id="cancel-address-btn" class="auth-form__button button--outlined">Cancel</button>
                  </div>
              </form>
          </div>
      `;
      document.getElementById('save-address-btn').addEventListener('click', () => { handleSaveAddress(formContainer, addressId); });
      document.getElementById('cancel-address-btn').addEventListener('click', () => {
          formContainer.innerHTML = '';
          formContainer.style.display = 'none';
      });
    }
    function handleSaveAddress(formContainer, addressId) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      const newAddressData = {
          fullName: document.getElementById('addr-fullName').value,
          phone: document.getElementById('addr-phone').value,
          street: document.getElementById('addr-street').value,
          city: document.getElementById('addr-city').value,
      };
      if (addressId) {
          const address = currentUser.addresses.find(a => a.id === addressId);
          Object.assign(address, newAddressData);
      } else {
          newAddressData.id = 'ad' + Date.now();
          currentUser.addresses.push(newAddressData);
      }
      const listContainer = document.getElementById('address-list-container');
      renderAddressCards(listContainer, currentUser.addresses, currentUser.defaultAddressId);
      formContainer.innerHTML = '';
      formContainer.style.display = 'none';
      alert('Đã lưu địa chỉ! (Lưu ý: Thay đổi này sẽ mất khi tải lại trang.)');
    }
    function handleDeleteAddress(addressId, listContainer) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      if (!confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) { return; }
      currentUser.addresses = currentUser.addresses.filter(a => a.id !== addressId);
      renderAddressCards(listContainer, currentUser.addresses, currentUser.defaultAddressId);
      alert('Đã xóa địa chỉ! (Lưu ý: Thay đổi này sẽ mất khi tải lại trang.)');
    }
    function handleSetDefault(addressId, listContainer) {
      /* (Code của bạn đã đúng, giữ nguyên) */
      currentUser.defaultAddressId = addressId;
      renderAddressCards(listContainer, currentUser.addresses, currentUser.defaultAddressId);
      alert('Đã đặt làm mặc định! (Lưu ý: Thay đổi này sẽ mất khi tải lại trang.)');
    }

    // === LOGIC CHUYỂN TAB (KHỞI CHẠY) ===
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault(); // <-- DÒNG NÀY RẤT QUAN TRỌNG
        const targetId = link.dataset.target;
        navLinks.forEach(l => l.classList.remove('is-active'));
        contentTabs.forEach(t => t.style.display = 'none');
        link.classList.add('is-active');
        const activeTab = document.getElementById(targetId);
        if (activeTab) {
          activeTab.style.display = 'block';
          if (targetId === 'tab-order-history' && !activeTab.dataset.loaded) {
              loadOrderHistoryData(activeTab);
              activeTab.dataset.loaded = 'true';
          } else if (targetId === 'tab-address-book' && !activeTab.dataset.loaded) {
              loadAddressBookData(activeTab);
              activeTab.dataset.loaded = 'true';
          }
        }
      });
    });
    // Gắn sự kiện cho các nút của tab 1
    if (formCardContainer) {
      attachPersonalInfoListeners();
    }
    // Tự động click tab 1
    const defaultActiveLink = profileDashboard.querySelector('.profile-nav__link.is-active');
    if (defaultActiveLink) {
      defaultActiveLink.click();
    }
}

  function initializeChangePasswordPage() {
    console.log("Initializing Change Password Page...");

    // === 1. LẤY CÁC DOM ELEMENT ===
    const currentPassEl = document.getElementById('profile-current-pass');
    const newPassEl = document.getElementById('new-password');
    const confirmPassEl = document.getElementById('confirm-password');
    const updateBtn = document.getElementById('update-password-button');
    const toggleBtns = document.querySelectorAll('.password-toggle-btn');

    // Lấy các element cho quy tắc mật khẩu
    const rules = {
        length: document.getElementById('rule-length'),
        uppercase: document.getElementById('rule-uppercase'),
        lowercase: document.getElementById('rule-lowercase'),
        number: document.getElementById('rule-number')
    };

    // === 2. GẮN SỰ KIỆN ===

    // Gắn sự kiện cho nút "Change Password"
    updateBtn.addEventListener('click', handleUpdatePassword);

    // Gắn sự kiện cho các nút "Show/Hide" mật khẩu
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const input = button.previousElementSibling;
            const img = button.querySelector('img');
            
            if (input.type === 'password') {
                input.type = 'text';
                img.src = '../assets/icons/eye.svg'; // (Bạn cần có icon 'eye.svg')
                img.alt = 'Hide password';
            } else {
                input.type = 'password';
                img.src = '../assets/icons/eye-off.svg';
                img.alt = 'Show password';
            }
        });
    });

    // Gắn sự kiện gõ phím cho ô "New Password"
    newPassEl.addEventListener('input', () => {
        validatePasswordRules(newPassEl.value, rules);
    });

    // === 3. CÁC HÀM CON (HELPER) ===

    /**
     * Kiểm tra các quy tắc mật khẩu và cập nhật UI
     */
    function validatePasswordRules(password, ruleElements) {
        const hasLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        ruleElements.length.classList.toggle('valid', hasLength);
        ruleElements.uppercase.classList.toggle('valid', hasUpper);
        ruleElements.lowercase.classList.toggle('valid', hasLower);
        ruleElements.number.classList.toggle('valid', hasNumber);
        
        return hasLength && hasUpper && hasLower && hasNumber;
    }

    /**
     * Xử lý chính khi nhấn nút "Change Password"
     */
    async function handleUpdatePassword() {
        clearErrors(); 
        
        const currentPass = currentPassEl.value;
        const newPass = newPassEl.value;
        const confirmPass = confirmPassEl.value;
        
        if (!currentPass) { showError(currentPassEl, 'Please enter your current password.'); return; }
        if (!newPass) { showError(newPassEl, 'Please enter a new password.'); return; }
        if (newPass !== confirmPass) {
            showError(confirmPassEl, 'New passwords do not match.');
            return;
        }
        const rulesMet = validatePasswordRules(newPass, rules);
        if (!rulesMet) {
            showError(newPassEl, 'New password does not meet all the rules.');
            return;
        }
        
        updateBtn.textContent = "Checking...";
        updateBtn.disabled = true;

        try {
            const userId = CartService.getCurrentUserId();
            if (!userId) {
                alert('Error: Not logged in.');
                loadPage('_auth.html');
                history.pushState(null, '', 'auth.html');
                return;
            }

            const response = await fetch('../data/users.json');
            const users = await response.json();
            const currentUser = users.find(u => u.id === userId);

            if (!currentUser) {
                 alert('Error: Could not find user data.');
                 return;
            }
            
            if (currentUser.password !== currentPass) {
                showError(currentPassEl, 'Current password is not correct.');
                updateBtn.textContent = "Change Password";
                updateBtn.disabled = false;
                return;
            }
            
            // THÀNH CÔNG!
            alert('Password updated successfully!');
            
            // Chuyển về trang profile
            loadPage('_profile.html');
            history.pushState(null, '', 'profile.html');
            
        } catch (err) {
            console.error('Failed to update password:', err);
            showError(confirmPassEl.closest('form').querySelector('.form-error-message'), 'An error occurred. Please try again.');
            updateBtn.textContent = "Change Password";
            updateBtn.disabled = false;
        }
    }
  }

  async function initializeOrderDetailPage() {
    console.log("Initializing Order Detail Page (v3 - Đã sửa lỗi, đọc từ OrderService)...");
    
    try {
        // 1. Lấy Order ID từ URL
        const params = new URLSearchParams(window.location.search);
        const orderId = params.get('orderId');
        if (!orderId) { throw new Error('Không tìm thấy Order ID trên URL'); }
        
        // Cập nhật link breadcrumb "Order History"
        document.getElementById('order-id-breadcrumb').textContent = orderId;
        const breadcrumb = document.getElementById('breadcrumb-order-history');
        if(breadcrumb) {
            breadcrumb.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage('_profile.html');
                history.pushState(null, '', 'profile.html');
                // Chờ router tải xong trang profile, sau đó tự click vào tab Order History
                setTimeout(() => {
                    document.querySelector('.profile-nav__link[data-target="tab-order-history"]')?.click();
                }, 100);
            });
        }

        // 2. Tải dữ liệu (Products và Users vẫn fetch, nhưng Orders lấy từ Service)
        await OrderService.init(); // Đảm bảo OrderService đã tải
        
        const [productsRes, usersRes] = await Promise.all([
            fetch('../data/products.json'),
            fetch('../data/users.json')
        ]);

        if (!productsRes.ok || !usersRes.ok) { throw new Error('Không thể tải file JSON (products hoặc users)'); }
        
        // === SỬA LỖI CHÍNH: LẤY ORDER TỪ SERVICE ===
        // Lấy TẤT CẢ đơn hàng (cũ + mới) từ localStorage
        const allOrders = OrderService.getOrders(); 
        const order = allOrders.find(o => o.orderId === orderId);
        // ==========================================

        if (!order) { throw new Error(`Không tìm thấy đơn hàng với ID: ${orderId} trong OrderService.`); }

        const productsData = await productsRes.json();
        const usersData = await usersRes.json();
        
        const productsMap = new Map();
        (productsData.products || productsData).forEach(p => { productsMap.set(p.id, p); });
        
        const customer = (usersData.users || usersData).find(u => u.id === order.customerId);

        // 3. Điền thông tin vào DOM
        document.getElementById('orderId').textContent = order.orderId;
        document.getElementById('orderStatus').textContent = order.status;
        document.getElementById('deliveryStatus').textContent = order.status;

        if (customer) {
            document.getElementById('customerName').textContent = `${customer.firstName} ${customer.lastName}`;
            document.getElementById('customerPhone').textContent = customer.phone;
            const defaultAddr = customer.addresses.find(a => a.id === customer.defaultAddressId) || customer.addresses[0];
            if(defaultAddr) { document.getElementById('customerAddress').textContent = `${defaultAddr.street}, ${defaultAddr.city}`; }
            else { document.getElementById('customerAddress').textContent = "Chưa có địa chỉ"; }
        } else {
            document.getElementById('customerName').textContent = "Không tìm thấy User";
            document.getElementById('customerPhone').textContent = "N/A";
            document.getElementById('customerAddress').textContent = "N/A";
        }

        document.getElementById('courierService').textContent = order.shippingMethod || 'N/A';
        document.getElementById('trackingCode').textContent = order.trackingCode || `TRK-${order.orderId}`;
        document.getElementById('paymentMethod').textContent = order.paymentMethod || 'N/A';
        document.getElementById('orderPlaced').textContent = new Date(order.date).toLocaleString('vi-VN');
        
        // (Giả lập các ngày khác dựa trên ngày đặt hàng)
        const orderDate = new Date(order.date);
        document.getElementById('paymentConfirmed').textContent = (order.status !== 'Cancelled') ? new Date(orderDate.getTime() + 120000).toLocaleString('vi-VN') : '-';
        document.getElementById('shipperPickup').textContent = (order.status === 'Shipped' || order.status === 'Delivered') ? new Date(orderDate.getTime() + 86400000).toLocaleString('vi-VN') : '-';
        document.getElementById('deliveredDate').textContent = (order.status === 'Delivered') ? new Date(orderDate.getTime() + 3*86400000).toLocaleString('vi-VN') : '-';

        // 4. Render sản phẩm
        const itemsContainer = document.getElementById('orderItemsContainer');
        itemsContainer.innerHTML = (order.products || []).map(item => {
            const product = productsMap.get(item.productId);
            if (!product) return `<p>Sản phẩm không tồn tại (ID: ${item.productId})</p>`;
            // Lấy giá TẠI THỜI ĐIỂM MUA HÀNG (đã lưu trong order.products)
            const price = item.price || product.price.discounted || product.price.original; 
            return `
            <div class="summary-item" style="display: flex; gap: 12px; margin-bottom: 12px; align-items: center;">
                <img src="${product.imageUrl}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                <p style="font-weight: 500; margin: 0;">${product.name}</p>
                <p style="font-size: 14px; color: #595959; margin: 0;">Số lượng: ${item.quantity}</p>
                </div>
                <p style="font-weight: 500; margin: 0;">${formatCurrency(price * item.quantity)}</p>
            </div>
            `;
        }).join('');

        // 5. Render tổng tiền
        document.getElementById('subtotal').textContent = formatCurrency(order.subtotal);
        document.getElementById('shippingFee').textContent = formatCurrency(order.shippingFee);
        document.getElementById('shippingDiscount').textContent = formatCurrency(0);
        document.getElementById('voucherDiscount').textContent = formatCurrency(order.totalDiscount || 0);
        document.getElementById('totalAmount').textContent = formatCurrency(order.total);

        // 6. Gắn sự kiện nút Review
        const reviewBtn = document.getElementById('reviewButton');
        if (reviewBtn) {
            reviewBtn.addEventListener('click', () => {
                loadPage(`_review_page.html?orderId=${orderId}`);
                history.pushState(null, '', `review_page.html?orderId=${orderId}`);
            });
        }
    } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
        document.getElementById('order-info-column').innerHTML = `<p class="error-message">Không thể tải chi tiết đơn hàng. Lỗi: ${error.message}</p>`;
    }
}

  function initializeReviewPage() {
    console.log("Initializing Review Page (v2 - Fixed OrderService)...");

    // Bọc tất cả các biến vào trong hàm để tránh xung đột
    let allOrders = [], allProducts = [], allReviews = [], reviewData = {}, currentProductKey = '';
    let currentOrder = null;
    const CURRENT_CUSTOMER_ID = CartService.getCurrentUserId() || "u1"; // Lấy ID user thật

    // Hàm helper để tạo file JSON nếu chưa có (dùng cho review)
    async function fetchOrCreateJSON(url, defaultData = []) {
        try {
            const res = await fetch(url);
            if (res.ok) {
                return await res.json();
            } else if (res.status === 404) {
                console.warn(`File ${url} không tìm thấy. Tạo dữ liệu giả lập.`);
                return defaultData;
            }
            throw new Error(`Status: ${res.status}`);
        } catch (e) {
            console.error(`Lỗi khi fetch ${url}:`, e);
            return defaultData; // Trả về mảng rỗng nếu lỗi
        }
    }

    async function loadData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const orderId = urlParams.get('orderId');
            
            if (!orderId) {
                alert('Không tìm thấy ID đơn hàng. Đang quay về trang cá nhân...');
                loadPage('_profile.html');
                history.pushState(null, '', 'profile.html');
                return;
            }
            
            // Cập nhật link breadcrumb
            const detailLink = document.getElementById('breadcrumb-order-detail');
            if (detailLink) {
                detailLink.href = `order_detail.html?orderId=${orderId}`;
                // Gắn lại sự kiện ajax-link cho nó
                detailLink.removeEventListener('click', handleLinkClick);
                detailLink.addEventListener('click', handleLinkClick);
            }

            // === SỬA LỖI CHÍNH: Tải orders từ OrderService ===
            await OrderService.init(); // Đảm bảo service đã tải
            allOrders = OrderService.getOrders();
            // ==========================================
            
            // Tải products và reviews (base)
            const [productsData, reviewsData] = await Promise.all([
                fetchOrCreateJSON('../data/products.json', { products: [] }),
                fetchOrCreateJSON('../data/reviews.json', [])
            ]);
            
            allProducts = productsData.products || productsData;
            allReviews = reviewsData.reviews || reviewsData;
            
            // Tìm đơn hàng cụ thể
            const order = allOrders.find(o => o.orderId === orderId);
            if (!order) {
                alert('Không tìm thấy đơn hàng (từ OrderService). Đang quay về trang cá nhân...');
                loadPage('_profile.html');
                history.pushState(null, '', 'profile.html');
                return;
            }
            
            currentOrder = order;
            renderProducts();

        } catch (e) { 
            console.error('Lỗi khi tải dữ liệu trang Review:', e);
            alert('Lỗi tải dữ liệu. Đang quay về trang cá nhân...');
            loadPage('_profile.html');
            history.pushState(null, '', 'profile.html');
        }
    }

    function renderProducts() {
        if (!currentOrder) { console.error('Không có dữ liệu đơn hàng'); return; }
        
        const list = document.querySelector('.product-list');
        list.innerHTML = '';
        let first = true;
        
        currentOrder.products.forEach((orderProd, j) => {
            const productDetail = allProducts.find(p => p.id === orderProd.productId);
            if (!productDetail) return;
            
            const key = `${currentOrder.orderId}-${j}`;
            const item = document.createElement('div');
            item.className = 'product-item';
            item.dataset.product = key;
            item.dataset.orderId = currentOrder.orderId;
            item.dataset.productId = orderProd.productId;
            item.innerHTML = `
                <img src="${productDetail.imageUrl}" class="product-img" alt="${productDetail.name}" />
                <div class="product-info">
                    <p>${productDetail.name}</p> <span>Quantity: ${orderProd.quantity}</span>
                </div>
            `;
            if (first) { 
                item.classList.add('active'); 
                currentProductKey = key; 
                first = false; 
            }
            list.appendChild(item);
        });
        
        if (currentOrder.products.length === 0) {
            list.innerHTML = '<p>Không tìm thấy sản phẩm trong đơn hàng.</p>';
        } else {
            addProductListeners();
            loadReview(currentProductKey);
        }
    }

    function createStars(container, group) {
        container.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.innerHTML = '★';
            star.className = 'star';
            star.dataset.value = i;
            star.onclick = () => {
                const val = i;
                container.querySelectorAll('.star').forEach((s, idx) => s.classList.toggle('active', idx < val));
                if (!reviewData[currentProductKey]) reviewData[currentProductKey] = { ratings: {} };
                if (!reviewData[currentProductKey].ratings) reviewData[currentProductKey].ratings = {};
                reviewData[currentProductKey].ratings[group] = val;
            };
            container.appendChild(star);
        }
    }

    function loadReview(key) {
        if (!reviewData[key]) {
            reviewData[key] = { ratings: {}, text: '', imageUpload: null, videoUpload: null };
        }
        const d = reviewData[key];
        
        document.querySelectorAll('.stars').forEach(g => {
            const val = d.ratings[g.dataset.group] || 0;
            g.querySelectorAll('.star').forEach((s, idx) => s.classList.toggle('active', idx < val));
        });
        
        document.querySelector('.review-textarea').value = d.text || '';
        
        const imageBox = document.getElementById('imageUpload');
        const imagePreview = imageBox.querySelector('img.upload-preview');
        if (d.imageUpload) {
            imagePreview.src = d.imageUpload;
            imagePreview.style.display = 'block';
            imageBox.classList.add('filled');
        } else {
            imagePreview.src = '';
            imagePreview.style.display = 'none';
            imageBox.classList.remove('filled');
        }
        
        const videoBox = document.getElementById('videoUpload');
        const videoPreview = videoBox.querySelector('video.upload-preview');
        if (d.videoUpload) {
            videoPreview.src = d.videoUpload;
            videoPreview.style.display = 'block';
            videoBox.classList.add('filled');
        } else {
            videoPreview.src = '';
            videoPreview.style.display = 'none';
            videoBox.classList.remove('filled');
        }
    }

    function addProductListeners() {
        document.querySelectorAll('.product-item').forEach(item => {
            item.onclick = () => {
                document.querySelectorAll('.product-item').forEach(p => p.classList.remove('active'));
                item.classList.add('active');
                currentProductKey = item.dataset.product;
                loadReview(currentProductKey);
            };
        });
    }

    function setupUploadHandlers() {
        const imageBox = document.getElementById('imageUpload');
        const imageInput = imageBox.querySelector('input[type="file"]');
        const imagePreview = imageBox.querySelector('img.upload-preview');
        
        imageBox.onclick = () => imageInput.click();
        imageInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                imagePreview.src = url;
                imagePreview.style.display = 'block';
                imageBox.classList.add('filled');
                if (!reviewData[currentProductKey]) reviewData[currentProductKey] = { ratings: {}, text: '', imageUpload: null, videoUpload: null };
                reviewData[currentProductKey].imageUpload = url;
            } else if (file) {
                alert('Vui lòng chọn một file hình ảnh.');
            }
        };
        
        const videoBox = document.getElementById('videoUpload');
        const videoInput = videoBox.querySelector('input[type="file"]');
        const videoPreview = videoBox.querySelector('video.upload-preview');
        
        videoBox.onclick = () => videoInput.click();
        videoInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('video/')) {
                const url = URL.createObjectURL(file);
                videoPreview.src = url;
                videoPreview.style.display = 'block';
                videoBox.classList.add('filled');
                if (!reviewData[currentProductKey]) reviewData[currentProductKey] = { ratings: {}, text: '', imageUpload: null, videoUpload: null };
                reviewData[currentProductKey].videoUpload = url;
            } else if (file) {
                alert('Vui lòng chọn một file video.');
            }
        };
    }

    const reviewTextArea = document.querySelector('.review-textarea');
    if(reviewTextArea) {
        reviewTextArea.oninput = e => {
            if (!reviewData[currentProductKey]) reviewData[currentProductKey] = { ratings: {}, text: '', imageUpload: null, videoUpload: null };
            reviewData[currentProductKey].text = e.target.value;
        };
    }

    const submitBtn = document.querySelector('.submit-btn');
    if(submitBtn) {
        submitBtn.onclick = async e => {
            e.preventDefault();
            
            const item = document.querySelector('.product-item.active');
            if (!item) {
                alert('Vui lòng chọn một sản phẩm để đánh giá.');
                return;
            }
            
            const [orderId, productIndex] = currentProductKey.split('-');
            const order = currentOrder || allOrders.find(o => o.orderId === orderId);
            if (!order) { alert('Không tìm thấy đơn hàng.'); return; }
            
            const orderProduct = order.products[parseInt(productIndex)];
            if (!orderProduct) { alert('Không tìm thấy sản phẩm trong đơn hàng.'); return; }
            
            const productDetail = allProducts.find(p => p.id === orderProduct.productId);
            if (!productDetail) { alert('Không tìm thấy chi tiết sản phẩm.'); return; }
            
            // Lấy review đã lưu từ localStorage (nếu có)
            const savedReviews = JSON.parse(localStorage.getItem('reviews') || '[]');
            
            const review = {
                reviewId: "r" + (allReviews.length + savedReviews.length + 1) + Date.now(), // ID duy nhất
                orderId: orderId,
                customerId: CURRENT_CUSTOMER_ID,
                productId: orderProduct.productId,
                productName: productDetail.name,
                rating: reviewData[currentProductKey].ratings.productRate || 0,
                image: reviewData[currentProductKey].imageUpload || null,
                video: reviewData[currentProductKey].videoUpload || null,
                content: reviewData[currentProductKey].text || '',
                createdAt: new Date().toISOString()
            };
            
            savedReviews.push(review);
            
            try {
                // Giả lập lưu vào localStorage (để PDP có thể đọc)
                localStorage.setItem('reviews', JSON.stringify(savedReviews));
                console.log('Review đã lưu (giả lập):', review);
                alert("Đánh giá của bạn đã được gửi thành công!");
                
                // Quay về trang Chi tiết đơn hàng
                loadPage(`_order_detail.html?orderId=${currentOrder.orderId}`);
                history.pushState(null, '', `order_detail.html?orderId=${currentOrder.orderId}`);
                
            } catch (error) {
                console.error('Lỗi khi lưu review:', error);
                alert("Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.");
            }
        };
    }

    // Khởi tạo
    document.querySelectorAll('.stars').forEach(g => createStars(g, g.dataset.group));
    setupUploadHandlers();
    loadData();
  }
async function initializeCheckoutPage() {
    console.log("Initializing Checkout Page (v4 - With Vouchers)...");

    // 1. Lấy các DOM element
    const customerNameEl = document.getElementById('customerName');
    const customerPhoneEl = document.getElementById('customerPhone');
    const customerAddressEl = document.getElementById('customerAddress');
    const shippingOptionsEl = document.getElementById('shippingOptions');
    const paymentOptionsEl = document.getElementById('paymentOptions');
    const cartItemsPreviewEl = document.getElementById('cartItemsPreview');
    const subtotalEl = document.getElementById('subtotal');
    const shippingFeeEl = document.getElementById('shippingFee');
    const totalAmountEl = document.getElementById('totalAmount');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const voucherCodeEl = document.getElementById('voucherCode');
    const applyVoucherBtn = document.getElementById('applyVoucherBtn');
    const shippingDiscountEl = document.getElementById('shippingDiscount');
    const orderDiscountEl = document.getElementById('orderDiscount');
    const totalDiscountEl = document.getElementById('totalDiscount');

    // 2. Dữ liệu (Giả lập)
    const shippingMethods = [
        { id: 'fast', name: 'Giao Hàng Nhanh', price: 30000, image: '../assets/images/ship2.png', description: 'Trong 2-3 ngày làm việc' },
        { id: 'std', name: 'Giao Hàng Tiêu Chuẩn', price: 15000, image: '../assets/images/ship3.png', description: 'Trong 4-5 ngày làm việc' }
    ];
    const paymentMethods = [
        { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', image: '../assets/images/pay4.png', description: 'Trả tiền mặt khi nhận hàng', type: 'cod' },
        { id: 'qr', name: 'Thanh toán bằng mã QR', image: '../assets/images/QRCode.jpg', description: 'Quét mã bằng app ngân hàng', type: 'ewallet' },
        { id: 'momo', name: 'Ví điện tử Momo', image: '../assets/images/pay2.png', description: 'Thanh toán qua ví Momo', type: 'ewallet' }
    ];

    // 3. Biến trạng thái
    let currentCart = [];
    let allProductsMap = new Map();
    let currentCustomer = null;
    let currentSubtotal = 0; 
    let selectedShippingMethod = shippingMethods[0]; 
    let selectedPaymentMethod = paymentMethods[0]; 
    let allVouchers = [];
    let appliedOrderVoucher = null;
    let appliedShippingVoucher = null;

    // (Hàm này dùng để đọc "tối đa 50k" từ file voucher)
    function getMaxDiscount(description) {
        const matchK = description.match(/tối đa (\d+)k/i);
        if (matchK && matchK[1]) return parseInt(matchK[1], 10) * 1000;
        const matchFull = description.match(/tối đa (\d+)/i);
        if (matchFull && matchFull[1]) return parseInt(matchFull[1], 10);
        return 0;
    }

    /**
     * Tải tất cả dữ liệu cần thiết (User, Cart, Products, Vouchers)
     */
    async function loadData() {
        try {
            const userId = CartService.getCurrentUserId();
            
            // SỬA LỖI: Gọi getCart(userId) sẽ tự động lấy 'cart_for_checkout'
            const cart = CartService.getCart(userId); 
            currentCart = cart; 

            if (!userId || cart.length === 0) {
                alert("Bạn chưa chọn sản phẩm nào để thanh toán.");
                loadPage('_cart.html');
                history.pushState(null, '', 'cart.html');
                return;
            }

            // Tải song song 4 file
            const [usersRes, productsRes, vouchersRes] = await Promise.all([
                fetch('../data/users.json'),
                fetch('../data/products.json'),
                fetch('../data/vouchers.json')
            ]);
            const allUsers = await usersRes.json();
            const allProductsData = await productsRes.json();
            const allProducts = allProductsData.products || allProductsData;
            const vouchersData = await vouchersRes.json();

            currentCustomer = allUsers.find(u => u.id === userId);
            allVouchers = vouchersData.vouchers || vouchersData;
            
            // TẠO MAP TỪ products.json (quan trọng)
            allProducts.forEach(p => allProductsMap.set(p.id, p));

            // Bắt đầu render
            renderCustomerInfo();
            renderShippingOptions();
            renderPaymentOptions();
            renderCartPreview();
            calculateTotals(); // Tính toán

        } catch (e) {
            console.error("Lỗi khi tải dữ liệu checkout:", e);
        }
    }

    /** Điền thông tin khách hàng */
    function renderCustomerInfo() {
        if (currentCustomer) {
            customerNameEl.textContent = `${currentCustomer.firstName} ${currentCustomer.lastName}`;
            customerPhoneEl.textContent = currentCustomer.phone;
            if (currentCustomer.addresses && currentCustomer.addresses.length > 0) {
                const defaultAddr = currentCustomer.addresses.find(a => a.id === currentCustomer.defaultAddressId) || currentCustomer.addresses[0];
                customerAddressEl.textContent = `${defaultAddr.street}, ${defaultAddr.city}`;
            } else {
                customerAddressEl.textContent = "Chưa có địa chỉ";
            }
        }
    }

    /** Render các lựa chọn vận chuyển */
    function renderShippingOptions() {
        shippingOptionsEl.innerHTML = shippingMethods.map(method => `
            <div class="shipping-option ${selectedShippingMethod.id === method.id ? 'active' : ''}" data-shipping-id="${method.id}">
                <div class="shipping-radio ${selectedShippingMethod.id === method.id ? 'active' : ''}"></div>
                <img src="${method.image}" alt="${method.name}" class="shipping-icon">
                <div class="shipping-details">
                    <div class="shipping-name">${method.name}</div>
                    <div class="shipping-description">${method.description}</div>
                </div>
                <div class="shipping-price">${formatCurrency(method.price)}</div>
            </div>
        `).join('');

        // Gắn lại sự kiện
        shippingOptionsEl.querySelectorAll('.shipping-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedShippingMethod = shippingMethods.find(m => m.id === option.dataset.shippingId);
                renderShippingOptions(); // Render lại để cập nhật 'active' class
                calculateTotals(); // Tính lại tổng tiền
            });
        });
    }
    
    /** Render các lựa chọn thanh toán */
    function renderPaymentOptions() {
        paymentOptionsEl.innerHTML = paymentMethods.map(method => `
            <div class="payment-option ${selectedPaymentMethod.id === method.id ? 'active' : ''}" data-payment-id="${method.id}">
                <div class="payment-radio ${selectedPaymentMethod.id === method.id ? 'active' : ''}"></div>
                <img src="${method.image}" alt="${method.name}" class="payment-icon">
                <div class="payment-details">
                    <div class="payment-name">${method.name}</div>
                    <div class="payment-description">${method.description}</div>
                </div>
            </div>
        `).join('');
        paymentOptionsEl.querySelectorAll('.payment-option').forEach(option => {
            option.addEventListener('click', () => {
                selectedPaymentMethod = paymentMethods.find(m => m.id === option.dataset.paymentId);
                renderPaymentOptions(); 
            });
        });
    }

    /** Render tóm tắt giỏ hàng */
    function renderCartPreview() {
        cartItemsPreviewEl.innerHTML = ''; 
        currentCart.forEach(item => {
            // Dùng data từ item (vì nó đã đầy đủ)
            const price = (item.sellPrice || item.originalPrice);
            cartItemsPreviewEl.innerHTML += `
                <div class="cart-preview-item" style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center;">
                    <img src="${item.imagePath}" alt="${item.productName}" class="cart-preview-image" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                    <div class="cart-preview-details" style="flex: 1;">
                        <div class="cart-preview-name" style="font-weight: 500;">${item.productName}</div>
                        <div class="cart-preview-quantity" style="font-size: 14px; color: #555;">Số lượng: ${item.quantity}</div>
                    </div>
                    <div class="cart-preview-price" style="font-weight: 500;">${formatCurrency(price * item.quantity)}</div>
                </div>
            `;
        });
    }

    /** XỬ LÝ ÁP DỤNG VOUCHER */
    function handleApplyVoucher() {
        const code = voucherCodeEl.value.trim().toUpperCase();
        if (!code) { alert('Vui lòng nhập mã voucher.'); return; }
        const voucher = allVouchers.find(v => v.code === code);
        if (!voucher) { alert('Mã voucher không hợp lệ.'); return; }
        if (!voucher.active) { alert('Mã voucher này đã hết hạn.'); return; }
        if (currentSubtotal < voucher.minOrder) {
            alert(`Voucher này chỉ áp dụng cho đơn hàng từ ${formatCurrency(voucher.minOrder)}.`);
            return;
        }
        if (voucher.type === 'shipping') {
            appliedShippingVoucher = voucher;
            alert(`Đã áp dụng voucher giảm phí ship!`);
        } else if (voucher.type === 'order_percent' || voucher.type === 'order_flat') {
            appliedOrderVoucher = voucher;
            alert(`Đã áp dụng voucher giảm giá đơn hàng!`);
        }
        voucherCodeEl.value = '';
        calculateTotals();
    }

    /** TÍNH TOÁN TỔNG TIỀN */
    function calculateTotals() {
        // SỬA LỖI: Phải dùng getTotals mới (cần cart VÀ map)
        const { subtotal } = CartService.getTotals(currentCart, allProductsMap); 
        currentSubtotal = subtotal;
        
        const baseShippingFee = selectedShippingMethod.price;
        let orderDiscountAmount = 0;
        let shippingDiscountAmount = 0;

        if (appliedOrderVoucher) {
            if (appliedOrderVoucher.type === 'order_flat') {
                orderDiscountAmount = appliedOrderVoucher.discount;
            } else if (appliedOrderVoucher.type === 'order_percent') {
                let discount = (currentSubtotal * appliedOrderVoucher.discount) / 100;
                const maxDiscount = getMaxDiscount(appliedOrderVoucher.description);
                if (maxDiscount > 0) { discount = Math.min(discount, maxDiscount); }
                orderDiscountAmount = discount;
            }
        }
        if (appliedShippingVoucher) {
            shippingDiscountAmount = Math.min(baseShippingFee, appliedShippingVoucher.discount);
        }

        const finalShippingFee = baseShippingFee - shippingDiscountAmount;
        const totalDiscountAmount = orderDiscountAmount + shippingDiscountAmount;
        const finalTotal = currentSubtotal + finalShippingFee - orderDiscountAmount;

        subtotalEl.textContent = formatCurrency(currentSubtotal);
        shippingFeeEl.textContent = formatCurrency(finalShippingFee);
        shippingDiscountEl.textContent = formatCurrency(shippingDiscountAmount);
        orderDiscountEl.textContent = formatCurrency(orderDiscountAmount);
        totalDiscountEl.textContent = formatCurrency(totalDiscountAmount);
        totalAmountEl.textContent = formatCurrency(finalTotal);
    }

    /** Gắn sự kiện cho các nút */
    function setupEventListeners() {
        
        // Nút Áp dụng Voucher
        applyVoucherBtn.addEventListener('click', handleApplyVoucher);
        voucherCodeEl.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleApplyVoucher();
        });

        // === NÚT ĐẶT HÀNG (ĐÃ SỬA ĐỂ LƯU VÀO ORDER HISTORY) ===
        placeOrderBtn.addEventListener('click', async () => {
            const total = totalAmountEl.textContent;
            const orderId = "RV" + Date.now(); 
            const userId = CartService.getCurrentUserId();

            // 1. Tạo đối tượng Order mới
            const newOrder = {
                orderId: orderId,
                customerId: userId,
                date: new Date().toISOString(),
                products: currentCart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.sellPrice || item.originalPrice
                })),
                subtotal: currentSubtotal,
                shippingFee: selectedShippingMethod.price,
                totalDiscount: (appliedOrderVoucher ? (appliedOrderVoucher.discount) : 0) + (appliedShippingVoucher ? (appliedShippingVoucher.discount) : 0),
                total: parseFloat(total.replace(/[^0-9,-]+/g,"")),
                status: (selectedPaymentMethod.type === 'cod') ? "Processing" : "Pending", // Giả định
                shippingMethod: selectedShippingMethod.name,
                paymentMethod: selectedPaymentMethod.name
            };

            // 2. Lưu đơn hàng mới vào mock (SỬ DỤNG OrderService)
            await OrderService.init(); // Đảm bảo service đã tải
            OrderService.createOrder(newOrder);
            
            // 3. Xử lý logic thanh toán
            const pendingOrder = { id: orderId, total: total, paymentMethod: selectedPaymentMethod.name };
            localStorage.setItem('pendingOrder', JSON.stringify(pendingOrder));
            
            if (selectedPaymentMethod.type === 'ewallet') {
                loadPage('_qr_payment.html');
                history.pushState(null, '', 'qr_payment.html');
            } else {
                alert('Đặt hàng (COD) thành công!');
                CartService.clearCart(userId); // Xóa giỏ hàng của user
                loadPage('_profile.html');
                history.pushState(null, '', 'profile.html');
                setTimeout(() => {
                    const orderTab = document.querySelector('.profile-nav__link[data-target="tab-order-history"]');
                    if (orderTab) orderTab.click();
                }, 100);
            }
        });
    }

    // Chạy các hàm
    loadData();
    setupEventListeners();
}

  async function initializeSearchResultsPage() {
    console.log("Initializing Search Results Page (v3 - With Tabs)...");
    const pageContainer = document.getElementById('search-results-page');
    const queryDisplay = document.getElementById('search-query-display');
    const productContainer = document.getElementById('search-results-products');
    const blogContainer = document.getElementById('search-results-blogs');
    const artisanContainer = document.getElementById('search-results-artisans');
    if (!pageContainer || !queryDisplay || !productContainer) { console.error("HTML của trang Search Results bị thiếu."); return; }
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (!query) { pageContainer.innerHTML = '<h3 style="text-align:center;">Please enter a search term.</h3>'; return; }
    const queryLower = query.toLowerCase();
    queryDisplay.textContent = query;
    document.title = `Search for '${query}'`;
    productContainer.innerHTML = '<div class="loading-spinner" style="margin: 30px auto;"></div>';
    blogContainer.innerHTML = '<div class="loading-spinner" style="margin: 30px auto;"></div>';
    artisanContainer.innerHTML = '<div class="loading-spinner" style="margin: 30px auto;"></div>';
    try {
      const [productsRes, blogsRes, artisansRes] = await Promise.all([
        fetch('../data/products.json'),
        fetch('../data/blogs.json'),
        fetch('../data/artisans.json')
      ]);
      const productsData = await productsRes.json();
      const allProducts = productsData.products || productsData;
      const productResults = allProducts.filter(p => 
        p.name.toLowerCase().includes(queryLower) || 
        p.description.toLowerCase().includes(queryLower) ||
        p.category.toLowerCase().includes(queryLower)
      );
      renderProductResults(productContainer, productResults, allProducts); // Sửa: truyền allProducts
      const allBlogs = await blogsRes.json();
      const blogResults = allBlogs.filter(b => 
        b.title.toLowerCase().includes(queryLower) || 
        b.snippet.toLowerCase().includes(queryLower)
      );
      renderBlogResults(blogContainer, blogResults);
      const allArtisans = await artisansRes.json();
      const artisanResults = allArtisans.filter(a => 
        a.name.toLowerCase().includes(queryLower) || 
        a.story.toLowerCase().includes(queryLower) || 
        a.location.toLowerCase().includes(queryLower)
      );
      renderArtisanResults(artisanContainer, artisanResults);
      attachGlobalLinks();
      const tabLinks = document.querySelectorAll('.search-tab-link');
      const tabContents = document.querySelectorAll('#search-results-page .tab-content');
      tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.dataset.target;
          tabLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
          tabContents.forEach(tab => {
            if (tab.id === targetId) { tab.style.display = 'block'; }
            else { tab.style.display = 'none'; }
          });
        });
      });
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu tìm kiếm:", error);
      pageContainer.innerHTML = `<h3 class="error-message" style="text-align:center;">Error loading search results.</h3>`;
    }
  }

  // SỬA LỖI: renderProductResults cần 'allProducts' để tìm product object
  function renderProductResults(container, results, allProducts) {
    if (results.length === 0) {
      container.innerHTML = '<p style="text-align:center;">No products found.</p>';
      return;
    }
    container.innerHTML = results.map(product => {
        const price = product.price.discounted ? 
            `<span class="price--discounted">${formatCurrency(product.price.discounted)}</span> <span class="price--original">${formatCurrency(product.price.original)}</span>` :
            `<span class="price--discounted">${formatCurrency(product.price.original)}</span>`;
        return `
            <div class="product-card">
                <a href="product_detail.html?id=${product.id}" class="product-card__image-link ajax-link">
                    <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image">
                </a>
                <div class="product-card__info">
                    <span class="product-card__artisan">${product.artisanName}</span>
                    <span class="product-card__score">Score: ${product.sustainability_score}/10</span>
                    <h3 class="product-card__title">
                        <a href="product_detail.html?id=${product.id}" class="ajax-link">${product.name}</a>
                    </h3>
                    <div class="product-card__price">${price}</div>
                    <button class="product-card__button" data-product-id="${product.id}">Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
    container.querySelectorAll('.product-card__button').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.productId;
            const userId = CartService.getCurrentUserId();
            // SỬA LỖI: Tìm product object từ 'allProducts'
            const productObject = allProducts.find(p => p.id === id); 
            if (productObject) {
                CartService.addToCart(userId, productObject, 1);
            } else {
                alert('Lỗi: Không tìm thấy sản phẩm.');
            }
        });
    });
  }

  function renderBlogResults(container, results) {
    if (results.length === 0) { container.innerHTML = '<p style="text-align:center;">No blog posts found.</p>'; return; }
    container.innerHTML = results.map(post => {
      const detailHref = `journal_detail.html?id=${post.id}`;
      return `
        <article class="story-card">
          <a href="${detailHref}" class="story-card__image-link ajax-link">
            <img class="story-card__image" src="${post.imageUrl}" alt="${post.title}">
          </a>
          <div class="story-card__content">
            <span class="story-card__tag">${post.category}</span>
            <h4 class="story-card__title">
              <a href="${detailHref}" class="ajax-link">${post.title}</a>
            </h4>
            <a href="${detailHref}" class="story-card__read-more ajax-link">Read More →</a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderArtisanResults(container, results) {
    if (results.length === 0) {
      container.innerHTML = '<p style="text-align:center;">No artisans found.</p>';
      return;
    }
  
    // Tái sử dụng code render từ trang Artisans (bản gallery)
    container.innerHTML = results.map(artisan => {
      const detailUrl = `artisan_detail.html?id=${artisan.id}`;
      // Cắt ngắn "story" (thay vì "specialty" cũ)
      const snippet = artisan.story.length > 100 ? artisan.story.substring(0, 100) + '...' : artisan.story;
      
      // === SỬA LỖI: Dùng cấu trúc card gallery mới ===
      return `
          <div class="artisan-card">
            
            <a href="${detailUrl}" class="artisan-card__image-link ajax-link">
              <img src="${artisan.heroImageUrl}" alt="Cover image for ${artisan.name}" class="artisan-card__image"> 
            </a>

            <div class="artisan-card__content">
              <span class="artisan-card__location">${artisan.location}</span>
              <h3 class="artisan-card__name">
                <a href="${detailUrl}" class="ajax-link">${artisan.name}</a>
              </h3>
              <p class="artisan-card__story">${snippet}</p>
              <a href="${detailUrl}" class="artisan-card__link ajax-link">
                Learn More
              </a>
            </div>

          </div>
      `;
      // === KẾT THÚC CẤU TRÚC MỚI ===
    }).join('');
  }

  function initializeQRPaymentPage() {
    console.log("Initializing QR Payment Page...");
    const orderData = JSON.parse(localStorage.getItem('pendingOrder'));
    if (orderData) {
        document.getElementById('orderIdDisplay').textContent = orderData.id;
        document.getElementById('totalAmountDisplay').textContent = orderData.total;
        document.getElementById('paymentMethodDisplay').textContent = orderData.paymentMethod;
        document.getElementById('invoiceNumberDisplay').textContent = "INV-" + orderData.id;
    } else {
        alert("Lỗi: Không tìm thấy thông tin đơn hàng. Quay về trang chủ.");
        loadPage('_index.html');
        history.pushState(null, '', 'index.html');
        return;
    }
    document.getElementById('paymentCompletedBtn').addEventListener('click', () => {
        const userId = CartService.getCurrentUserId();
        CartService.clearCart(userId); // Sửa: clear cart của user
        localStorage.setItem('paymentSuccessData', JSON.stringify(orderData));
        localStorage.removeItem('pendingOrder');
        loadPage('_qr_payment_success.html');
        history.pushState(null, '', 'qr_payment_success.html');
    });
  }

  function initializeQRSuccessPage() {
    console.log("Initializing QR Success Page...");
    const successData = JSON.parse(localStorage.getItem('paymentSuccessData'));
    if (successData) {
        document.getElementById('successOrderId').textContent = successData.id;
        document.getElementById('successTotalAmount').textContent = successData.total;
        document.getElementById('successPaymentMethod').textContent = successData.paymentMethod;
        document.getElementById('successInvoiceNumber').textContent = "INV-" + successData.id;
        localStorage.removeItem('paymentSuccessData');
    }
    document.getElementById('doneBtn').addEventListener('click', () => {
        loadPage('_profile.html');
        history.pushState(null, '', 'profile.html');
        setTimeout(() => {
            const orderHistoryTab = document.querySelector('.profile-nav__link[data-target="tab-order-history"]');
            if (orderHistoryTab) {
                orderHistoryTab.click();
            }
        }, 100);
    });
  }

  async function initializeArtisansPage() {
      console.log("Initializing Artisans Page (v2 - Gallery)...");
      const gridContainer = document.getElementById('artisan-grid-container');
      if (!gridContainer) { console.warn("Không tìm thấy #artisan-grid-container."); return; }
      try {
          const response = await fetch('../data/artisans.json');
          if (!response.ok) { throw new Error('Không thể tải artisans.json'); }
          const artisans = await response.json();
          if (!artisans || artisans.length === 0) { gridContainer.innerHTML = '<p style="text-align:center;">Không tìm thấy nghệ nhân nào.</p>'; return; }
          let html = '';
          artisans.forEach(artisan => {
              const snippet = artisan.story.length > 120 ? artisan.story.substring(0, 120) + '...' : artisan.story;
              html += `
                  <div class="artisan-card">
                    <a href="artisan_detail.html?id=${artisan.id}" class="artisan-card__image-link ajax-link">
                      <img src="${artisan.heroImageUrl}" alt="Cover image for ${artisan.name}" class="artisan-card__image"> 
                    </a>
                    <div class="artisan-card__content">
                      <span class="artisan-card__location">${artisan.location}</span>
                      <h3 class="artisan-card__name">
                        <a href="artisan_detail.html?id=${artisan.id}" class="ajax-link">${artisan.name}</a>
                      </h3>
                      <p class="artisan-card__story">${snippet}</p>
                      <a href="artisan_detail.html?id=${artisan.id}" class="artisan-card__link ajax-link">
                        Learn More
                      </a>
                    </div>
                  </div>
              `;
          });
          gridContainer.innerHTML = html;
          attachGlobalLinks();
      } catch (error) {
          console.error('Lỗi khi tải trang artisans:', error);
          gridContainer.innerHTML = '<p class="error-message" style="text-align:center; color: red;">Không thể tải danh sách nghệ nhân.</p>';
      }
  }

  async function initializeArtisanDetailPage() {
    console.log("Initializing Artisan Detail Page...");
    try {
        const params = new URLSearchParams(window.location.search);
        const artisanId = params.get('id');
        if (!artisanId) { throw new Error('Không tìm thấy ID nghệ nhân trong URL'); }
        const [artisansRes, productsRes] = await Promise.all([
            fetch('../data/artisans.json'),
            fetch('../data/products.json')
        ]);
        if (!artisansRes.ok) throw new Error('Không thể tải artisans.json');
        if (!productsRes.ok) throw new Error('Không thể tải products.json');
        const artisans = await artisansRes.json();
        const productsData = await productsRes.json();
        const allProducts = productsData.products || productsData;
        const artisan = artisans.find(a => a.id === artisanId);
        if (!artisan) { throw new Error(`Không tìm thấy nghệ nhân với ID: ${artisanId}`); }
        
        // SỬA LỖI: Đọc đúng tên trường từ artisans.json
        document.title = artisan.name;
        document.getElementById('artisan-breadcrumb-name').textContent = artisan.name;
        document.getElementById('artisan-cover-image').src = artisan.heroImageUrl; // Sửa: cover_image_url -> heroImageUrl
        document.getElementById('artisan-profile-image').src = artisan.avatarUrl; // Sửa: profile_image_url -> avatarUrl
        document.getElementById('artisan-name').textContent = artisan.name;
        document.getElementById('artisan-specialty').textContent = artisan.location; // Sửa: specialty -> location
        document.getElementById('artisan-story-full').textContent = artisan.story; // Sửa: story_snippet -> story
        
        // SỬA LỖI: Lọc sản phẩm theo TÊN nghệ nhân (vì products.json không có artisanId)
        const artisanProducts = allProducts.filter(p => p.artisanName === artisan.name);
        const productGrid = document.getElementById('artisan-product-grid');
        
        if (artisanProducts.length > 0) {
            let productHtml = '';
            artisanProducts.forEach(product => {
                let priceHTML = product.price.discounted
                    ? `<span class="price--discounted">${formatCurrency(product.price.discounted)}</span><span class="price--original">${formatCurrency(product.price.original)}</span>`
                    : `<span class="price--discounted">${formatCurrency(product.price.original)}</span>`;
                const detailHref = `product_detail.html?id=${product.id}`; 
                productHtml += `
                    <div class="product-card">
                      <a href="${detailHref}" class="ajax-link product-card__image-container">
                        <img class="product-card__image" src="${product.imageUrl}" alt="${product.name}">
                      </a>
                      <div class="product-card__info">
                        <h4 class="product-card__title">
                          <a href="${detailHref}" class="ajax-link">${product.name}</a>
                        </h4>
                        <div class="product-card__price">${priceHTML}</div>
                        <button class="product-card__button" data-product-id="${product.id}">Add to Cart</button>
                      </div>
                    </div>`;
            });
            productGrid.innerHTML = productHtml;
            attachGlobalLinks();
            
            // SỬA LỖI: Gắn listener "Add to Cart" cho các sản phẩm
            productGrid.querySelectorAll('.product-card__button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.productId;
                    const userId = CartService.getCurrentUserId();
                    const productObject = allProducts.find(p => p.id === id); 
                    if (productObject) {
                        CartService.addToCart(userId, productObject, 1);
                    } else {
                        alert('Lỗi: Không tìm thấy sản phẩm.');
                    }
                });
            });
        } else {
            productGrid.innerHTML = '<p style="text-align:center;">Không tìm thấy sản phẩm nào từ nghệ nhân này.</p>';
        }
    } catch (error) {
        console.error('Lỗi khi tải chi tiết nghệ nhân:', error);
        document.getElementById('artisan-detail-page').innerHTML = `<h3 class="error-message" style="padding: 50px; text-align: center;">Lỗi: ${error.message}</h3>`;
    }
  }

  async function initializeHomePage() {
      console.log("Initializing Home Page...");
      const newArrivalsGrid = document.getElementById('new-arrivals-grid');
      const storyGrid = document.getElementById('story-grid');
      if (!newArrivalsGrid || !storyGrid) return;
      let allProducts = [];
      async function loadHomepageData() {
          try {
              const [productRes, blogRes] = await Promise.all([
                  fetch('../data/products.json'),
                  fetch('../data/blogs.json')
              ]);
              if (!productRes.ok || !blogRes.ok) throw new Error('Không thể tải data trang chủ');
              const productsData = await productRes.json();
              const blogsData = await blogRes.json();
              allProducts = productsData.products || productsData;
              const allBlogs = blogsData;
              renderNewArrivals(allProducts.slice(0, 4));
              renderStories(allBlogs.slice(0, 3));
              attachGlobalLinks();
          } catch (e) {
              console.error(e);
              newArrivalsGrid.innerHTML = '<p class="error-message">Không thể tải sản phẩm.</p>';
              storyGrid.innerHTML = '<p class="error-message">Không thể tải bài viết.</p>';
          }
      }
      function renderNewArrivals(products) {
          newArrivalsGrid.innerHTML = '';
          products.forEach(product => {
              const price = product.price.discounted ? 
                  `<span class="price--discounted">${formatCurrency(product.price.discounted)}</span> <span class="price--original">${formatCurrency(product.price.original)}</span>` :
                  `<span class="price--discounted">${formatCurrency(product.price.original)}</span>`;
              newArrivalsGrid.innerHTML += `
                  <div class="product-card">
                      <a href="product_detail.html?id=${product.id}" class="product-card__image-link ajax-link">
                          <img src="${product.imageUrl}" alt="${product.name}" class="product-card__image">
                      </a>
                      <div class="product-card__info">
                          <span class="product-card__artisan">${product.artisanName}</span>
                          <h3 class="product-card__title">
                              <a href="product_detail.html?id=${product.id}" class="ajax-link">${product.name}</a>
                          </h3>
                          <div class="product-card__price">${price}</div>
                          <button class="product-card__button" data-product-id="${product.id}">Add to Cart</button>
                      </div>
                  </div>
              `;
          });
          newArrivalsGrid.querySelectorAll('.product-card__button').forEach(button => {
              button.addEventListener('click', (e) => {
                  const id = e.currentTarget.dataset.productId;
                  const userId = CartService.getCurrentUserId();
                  const productObject = allProducts.find(p => p.id === id); 
                  if (productObject) {
                      CartService.addToCart(userId, productObject, 1);
                  } else {
                      alert('Lỗi: Không tìm thấy sản phẩm.');
                  }
              });
          });
      }
      function renderStories(posts) {
          storyGrid.innerHTML = '';
          posts.forEach(post => {
              storyGrid.innerHTML += `
                  <div class="story-card">
                      <img src="${post.imageUrl}" alt="${post.title}" class="story-card__image">
                      <div class="story-card__content">
                          <p class="story-card__tag">${post.category}</p>
                          <h3 class="story-card__title">${post.title}</h3>
                          <p class="story-card__text">${post.snippet}</p>
                          <a href="journal_detail.html?id=${post.id}" class="story-card__button ajax-link">Read More</a>
                      </div>
                  </div>
              `;
          });
      }
      loadHomepageData();
  }

}); // <-- **Kết thúc MỘT DOMContentLoaded duy nhất**