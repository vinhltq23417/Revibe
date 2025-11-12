// Global variables
let providers = JSON.parse(localStorage.getItem('providers')) || [];
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeLoginStatus();
    initializeProviders();
    
    // Show About me as default
    showPage('about-me');

    // Prefetch RSS in background so it is ready when user opens the tab
    try {
        setTimeout(() => {
            if (typeof loadRSSFeed === 'function') {
                loadRSSFeed(0);
            }
        }, 0);
    } catch (e) {
        // ignore prefetch errors
    }
});

// Navigation handling
function initializeNavigation() {
    const menuLinks = document.querySelectorAll('[data-page]');
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page === 'logout') {
                handleLogout();
            } else {
                showPage(page);
            }
        });
    });
}

function showPage(page) {
    // Hide all page contents
    const allContents = document.querySelectorAll('.page-content');
    allContents.forEach(content => {
        content.style.display = 'none';
    });

    // Show selected page
    switch(page) {
        case 'about-me':
            document.getElementById('about-me-content').style.display = 'block';
            break;
        case 'weather-api':
            document.getElementById('weather-api-content').style.display = 'block';
            loadWeatherData();
            break;
        case 'rss':
            document.getElementById('rss-content').style.display = 'block';
            loadRSSFeed();
            break;
        case 'products':
            document.getElementById('products-content').style.display = 'block';
            loadProducts();
            break;
        case 'providers':
            document.getElementById('providers-content').style.display = 'block';
            displayProviders();
            break;
        case 'login':
            document.getElementById('login-content').style.display = 'block';
            break;
        default:
            document.getElementById('about-me-content').style.display = 'block';
    }
}

// About me - default page (already in HTML)

// Province/City ID mapping for thanhnien.vn weather API
const provinceIds = {
    'An Giang': '2347719',
    'Bình Dương': '20070078',
    'Bình Phước': '20070086',
    'Bình Thuận': '2347731',
    'Bình Định': '2347730',
    'Bạc Liêu': '20070081',
    'Bắc Giang': '20070087',
    'Bắc Kạn': '20070084',
    'Bắc Ninh': '20070088',
    'Bến Tre': '2347703',
    'Cao Bằng': '2347704',
    'Cà Mau': '20070082',
    'Cần Thơ': '2347732',
    'Điện Biên': '28301718',
    'Đà Nẵng': '20070085',
    'Đà Lạt': '1252375',
    'Đắk Lắk': '2347720',
    'Đắk Nông': '28301719',
    'Đồng Nai': '2347721',
    'Đồng Tháp': '2347722',
    'Gia Lai': '2347733',
    'Hà Nội': '2347727',
    'Hồ Chí Minh': '2347728',
    'Hà Giang': '2347734',
    'Hà Nam': '2347741',
    'Hà Tĩnh': '2347736',
    'Hòa Bình': '2347737',
    'Hưng Yên': '20070079',
    'Hải Dương': '20070080',
    'Hải Phòng': '2347707',
    'Hậu Giang': '28301720',
    'Khánh Hòa': '2347738',
    'Kiên Giang': '2347723',
    'Kon Tum': '20070076',
    'Lai Châu': '2347708',
    'Long An': '2347710',
    'Lào Cai': '2347740',
    'Lâm Đồng': '2347709',
    'Lạng Sơn': '2347718',
    'Nam Định': '20070089',
    'Nghệ An': '2347742',
    'Ninh Bình': '2347743',
    'Ninh Thuận': '2347744',
    'Phú Thọ': '20070091',
    'Phú Yên': '2347745',
    'Quảng Bình': '2347746',
    'Quảng Nam': '2347711',
    'Quảng Ngãi': '20070077',
    'Quảng Ninh': '2347712',
    'Quảng Trị': '2347747',
    'Sóc Trăng': '2347748',
    'Sơn La': '2347713',
    'Thanh Hóa': '2347715',
    'Thái Bình': '2347716',
    'Thái Nguyên': '20070083',
    'Thừa Thiên Huế': '2347749',
    'Tiền Giang': '2347717',
    'Trà Vinh': '2347750',
    'Tuyên Quang': '2347751',
    'Tây Ninh': '2347714',
    'Vĩnh Long': '2347752',
    'Vĩnh Phúc': '20070090',
    'Vũng Tàu': '2347729',
    'Yên Bái': '2347753'
};

// Weather API - Load from thanhnien.vn using AJAX with API calls
function loadWeatherData() {
    const container = document.getElementById('weather-container');
    
    // Get all provinces from provinceIds mapping
    const allProvinces = Object.keys(provinceIds).map(city => ({ city }));
    const weatherDataMap = new Map(); // Use Map to track unique cities and prevent duplicates
    let completed = 0;
    const total = allProvinces.length;
    
    // Initialize table with header
    function initializeWeatherTable() {
        container.innerHTML = `
            <div style="margin-bottom: 15px;">
                <strong>Đang tải dữ liệu thời tiết từ thanhnien.vn... (0/${total})</strong>
            </div>
            <table class="weather-table">
                <thead>
                    <tr>
                        <th>STT</th>
                        <th>Thành phố/Tỉnh</th>
                        <th>Nhiệt độ</th>
                    </tr>
                </thead>
                <tbody id="weather-table-body">
                </tbody>
            </table>
        `;
    }
    
    // Update table with current data (call this whenever new data arrives)
    function updateWeatherTable() {
        const tbody = document.getElementById('weather-table-body');
        if (!tbody) return; // Table not initialized yet
        
        // Remove duplicates using Map - keep only latest entry for each city
        const uniqueData = Array.from(weatherDataMap.values());
        
        // Sort data by city name
        const sortedData = uniqueData.sort((a, b) => a.city.localeCompare(b.city));
        
        tbody.innerHTML = '';
        
        sortedData.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                <td>${escapeHtml(item.city)}</td>
                <td style="text-align: center; font-weight: bold; color: #007bff;">${escapeHtml(item.temperature)}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Update progress text
        const progressText = container.querySelector('div strong');
        if (progressText) {
            progressText.textContent = `Đang tải dữ liệu thời tiết từ thanhnien.vn... (${completed}/${total}) - Đã tải: ${sortedData.length} tỉnh/thành phố`;
        }
    }
    
    // Initialize table
    initializeWeatherTable();

    // Function to fetch weather for a single province with retry logic
    function fetchWeatherForProvince(province, retryCount = 0) {
        const provinceId = provinceIds[province.city] || null;
        
        if (!provinceId) {
            // If no ID found, skip this province
            completed++;
            updateWeatherTable();
            return;
        }

        // Use the correct API endpoint
        const apiUrl = `https://eth2.cnnd.vn/ajax/weatherinfo/${provinceId}.htm`;
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl);
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', proxyUrl, true);
        xhr.setRequestHeader('Accept', 'application/json');
        
        let isCompleted = false; // Flag to ensure we only count once
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && !isCompleted) {
                // Handle 429 Too Many Requests - retry indefinitely until success
                if (xhr.status === 429) {
                    // Get retry-after header value, default to 10 seconds if not available
                    const retryAfterHeader = xhr.getResponseHeader('retry-after');
                    let retryDelay = 10000; // Default 10 seconds
                    
                    if (retryAfterHeader) {
                        retryDelay = parseInt(retryAfterHeader) * 1000; // Convert to milliseconds
                    } else {
                        // Use exponential backoff: 10s, 20s, 30s, etc. (max 60s)
                        retryDelay = Math.min(10000 + (retryCount * 10000), 60000);
                    }
                    
                    console.log(`Rate limited for ${province.city}, retrying after ${retryDelay/1000}s (attempt ${retryCount + 1})`);
                    
                    setTimeout(() => {
                        fetchWeatherForProvince(province, retryCount + 1);
                    }, retryDelay);
                    return; // Don't mark as completed yet, will retry until success
                }
                
                if (xhr.status === 200) {
                    isCompleted = true; // Mark as completed only on success
                    completed++;
                    
                    try {
                        const response = JSON.parse(xhr.responseText);
                        
                        // Parse response structure
                        if (response.Success && response.Data && response.Data.data && response.Data.data.datainfo) {
                            const weatherInfo = response.Data.data.datainfo;
                            const temperature = weatherInfo.temperature || weatherInfo.high;
                            const location = weatherInfo.location || province.city;
                            
                            if (temperature) {
                                // Use Map to store data - automatically overwrites if city already exists
                                weatherDataMap.set(location, {
                                    city: location,
                                    temperature: temperature + '°C'
                                });
                                // Update table immediately with new data
                                updateWeatherTable();
                            }
                        }
                    } catch (error) {
                        console.error(`Error parsing weather for ${province.city}:`, error);
                    }
                } else {
                    // For other errors, retry with exponential backoff (max 5 retries for non-429 errors)
                    if (retryCount < 5) {
                        const retryDelay = Math.min(5000 + (retryCount * 5000), 30000); // 5s, 10s, 15s, 20s, 25s
                        console.log(`Error ${xhr.status} for ${province.city}, retrying after ${retryDelay/1000}s (attempt ${retryCount + 1}/5)`);
                        
                        setTimeout(() => {
                            fetchWeatherForProvince(province, retryCount + 1);
                        }, retryDelay);
                        return;
                    }
                    
                    // Only mark as completed after max retries for non-429 errors
                    isCompleted = true;
                    completed++;
                    console.error(`Failed to load weather for ${province.city} after 5 retries (status: ${xhr.status})`);
                }

                // Update progress
                updateWeatherTable();
            }
        };
        
        xhr.onerror = function() {
            if (!isCompleted) {
                // Retry on network error with exponential backoff (max 10 retries)
                if (retryCount < 10) {
                    const retryDelay = Math.min(3000 + (retryCount * 3000), 30000); // 3s, 6s, 9s, ... max 30s
                    console.log(`Network error for ${province.city}, retrying after ${retryDelay/1000}s (attempt ${retryCount + 1}/10)`);
                    
                    setTimeout(() => {
                        fetchWeatherForProvince(province, retryCount + 1);
                    }, retryDelay);
                    return; // Don't mark as completed yet, will retry
                }
                
                isCompleted = true; // Mark as completed after max retries
                completed++;
                console.error(`Network error loading weather for ${province.city} after ${retryCount} retries`);
                
                // Update progress
                updateWeatherTable();
            }
        };
        
        xhr.send();
    }

    // Fetch weather for all provinces (with delay to avoid overwhelming the server)
    // Fetch all provinces with 1000ms (1 second) delay between requests to avoid rate limiting
    allProvinces.forEach((province, index) => {
        setTimeout(() => {
            fetchWeatherForProvince(province);
        }, index * 1000); // 1000ms (1 second) delay between each request to avoid rate limiting
    });
}

function extractWeatherFromRSS(items) {
    const weatherData = [];
    items.forEach((item, index) => {
        const title = item.querySelector('title')?.textContent || '';
        const description = item.querySelector('description')?.textContent || '';
        
        // Try to extract city and temperature from description
        const tempMatch = description.match(/(\d+)\s*°C/);
        const cityMatch = title.match(/([A-Za-zÀ-ỹ\s]+)/);
        
        if (tempMatch && cityMatch) {
            weatherData.push({
                city: cityMatch[1].trim(),
                temperature: tempMatch[1] + '°C'
            });
        }
    });
    
    return weatherData;
}

function displayWeatherTable(data) {
    const container = document.getElementById('weather-container');
    
    // Sort data by city name
    const sortedData = [...data].sort((a, b) => a.city.localeCompare(b.city));
    
    let html = '<div style="margin-bottom: 15px;"><strong>Tổng số: ' + sortedData.length + ' tỉnh/thành phố</strong></div>';
    html += '<table class="weather-table">';
    html += '<thead><tr><th>STT</th><th>Thành phố/Tỉnh</th><th>Nhiệt độ</th></tr></thead>';
    html += '<tbody>';
    
    sortedData.forEach((item, index) => {
        html += `<tr>
            <td style="text-align: center; font-weight: bold;">${index + 1}</td>
            <td>${escapeHtml(item.city)}</td>
            <td style="text-align: center; font-weight: bold; color: #007bff;">${escapeHtml(item.temperature)}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Helper function to decode HTML entities (fix Vietnamese characters)
function decodeHtmlEntities(text) {
    if (!text) return '';
    
    // Create a temporary textarea element to decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    let decoded = textarea.value;
    
    // Additional manual replacements for common Vietnamese entities
    const entityMap = {
        '&igrave;': 'ì', '&Igrave;': 'Ì',
        '&ocirc;': 'ô', '&Ocirc;': 'Ô',
        '&aacute;': 'á', '&Aacute;': 'Á',
        '&ecirc;': 'ê', '&Ecirc;': 'Ê',
        '&atilde;': 'ã', '&Atilde;': 'Ã',
        '&uacute;': 'ú', '&Uacute;': 'Ú',
        '&iacute;': 'í', '&Iacute;': 'Í',
        '&agrave;': 'à', '&Agrave;': 'À',
        '&eacute;': 'é', '&Eacute;': 'É',
        '&acirc;': 'â', '&Acirc;': 'Â',
        '&otilde;': 'õ', '&Otilde;': 'Õ',
        '&ugrave;': 'ù', '&Ugrave;': 'Ù',
        '&yacute;': 'ý', '&Yacute;': 'Ý',
        '&ograve;': 'ò', '&Ograve;': 'Ò',
        '&oacute;': 'ó', '&Oacute;': 'Ó',
        '&uuml;': 'ü', '&Uuml;': 'Ü',
        '&ccedil;': 'ç', '&Ccedil;': 'Ç',
        '&hellip;': '...',
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'"
    };
    
    // Replace HTML entities manually
    Object.keys(entityMap).forEach(entity => {
        decoded = decoded.replace(new RegExp(entity, 'g'), entityMap[entity]);
    });
    
    return decoded;
}

// RSS Feed - Load from thanhnien.vn RSS Education using AJAX with CORS proxy and retry logic
function loadRSSFeed(retryCount = 0) {
    const container = document.getElementById('rss-container');
    container.innerHTML = '<p style="text-align:center; color:#666;">Đang tải RSS feed từ thanhnien.vn...</p>';

    const rssUrl = 'https://thanhnien.vn/rss/giao-duc.rss';
    const proxyUrl = 'https://api.allorigins.win/get?url=' + encodeURIComponent(rssUrl);

    fetch(proxyUrl)
        .then(response => {
            if (!response.ok) {
                if (response.status === 429) throw new Error('429');
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const xmlText = data.contents;
            const parser = new DOMParser();
            const xml = parser.parseFromString(xmlText, 'text/xml');

            const parseError = xml.querySelector('parsererror');
            if (parseError) throw new Error('XML parsing error');

            const items = xml.querySelectorAll('item');
            if (items.length === 0) throw new Error('Không có tin nào');

            let html = '';
            let count = 0;

            items.forEach(item => {
                if (count >= 15) return;

                let title = item.querySelector('title')?.textContent || 'Không có tiêu đề';
                const link = item.querySelector('link')?.textContent || '#';
                let description = item.querySelector('description')?.textContent || '';
                const pubDate = item.querySelector('pubDate')?.textContent || '';

                description = description
                    .replace(/<!\[CDATA\[/g, '')
                    .replace(/\]\]>/g, '')
                    .replace(/<[^>]*>/g, '')
                    .trim();

                title = decodeHtmlEntities(title);
                description = decodeHtmlEntities(description);

                const formattedDate = formatRSSDate(pubDate);

                html += `
                <div class="rss-item" style="border-bottom:1px solid #eee; padding:15px 0;">
                    <h3 style="margin:0 0 8px; font-size:1.2em;">
                        <a href="${link}" target="_blank" style="color:#007bff; text-decoration:none;">
                            ${escapeHtml(title)}
                        </a>
                    </h3>
                    <p style="margin:0 0 8px; color:#555; font-size:0.9em;">
                        <strong>Ngày đăng:</strong> ${formattedDate}
                    </p>
                    <p style="margin:0 0 10px; color:#333; line-height:1.5;">
                        ${escapeHtml(description.length > 250 ? description.substring(0, 250) + '...' : description)}
                    </p>
                    <a href="${link}" target="_blank" style="color:#667eea; font-weight:bold; text-decoration:none; font-size:0.9em;">
                        Đọc thêm →
                    </a>
                </div>`;
                count++;
            });

            container.innerHTML = html;
        })
        .catch(error => {
            console.warn('RSS Error:', error.message);

            if (error.message === '429' || retryCount < 5) {
                const delay = error.message === '429' 
                    ? Math.min(10000 + (retryCount * 10000), 60000)
                    : Math.min(5000 + (retryCount * 5000), 30000);

                container.innerHTML = `<p style="color:#d33; text-align:center;">
                    Đang thử lại sau ${delay/1000}s... (lần ${retryCount + 1})
                </p>`;

                setTimeout(() => loadRSSFeed(retryCount + 1), delay);
                return;
            }

            container.innerHTML = `
            <div style="text-align:center; color:#c33; padding:20px; background:#fee; border-radius:8px;">
                <strong>Không thể tải RSS feed</strong><br>
                <small>Vui lòng kiểm tra kết nối hoặc thử lại sau.</small>
            </div>`;
        });
}

// Helper function to format RSS date
function formatRSSDate(dateString) {
    if (!dateString) return '';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} phút trước`;
        } else if (hours < 24) {
            return `${hours} giờ trước`;
        } else {
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    } catch (e) {
        return dateString;
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Products - Load from XML using AJAX
function loadProducts() {
    const container = document.getElementById('products-container');
    const categoryFilter = document.getElementById('category-filter');
    
    container.innerHTML = '<p>Đang tải sản phẩm...</p>';

    // Try to load from local file first, then fallback to online URL
    function loadProductsFromURL(url, isFallback) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    // Status 0 can occur when loading local files
                    try {
                        // Remove invalid SCRIPT tags before parsing
                        let xmlText = xhr.responseText;
                        xmlText = xmlText.replace(/<SCRIPT[^>]*\/>/gi, '');
                        xmlText = xmlText.replace(/<SCRIPT[^>]*>.*?<\/SCRIPT>/gi, '');
                        
                        const parser = new DOMParser();
                        const xml = parser.parseFromString(xmlText, 'text/xml');
                        
                        // Check for parsing errors
                        const parseError = xml.querySelector('parsererror');
                        if (parseError) {
                            throw new Error('XML parsing error: ' + parseError.textContent);
                        }
                        
                        const products = xml.querySelectorAll('product');
                        
                        if (products.length === 0) {
                            throw new Error('Không tìm thấy sản phẩm nào trong XML');
                        }
                        
                        const productList = [];
                        const categories = new Set();
                        
                        products.forEach(product => {
                            const id = product.querySelector('id')?.textContent || '';
                            const name = product.querySelector('name')?.textContent || '';
                            const detail = product.querySelector('detail')?.textContent || '';
                            const image = product.querySelector('image')?.textContent || '';
                            // Get category from catename attribute
                            const category = product.getAttribute('catename') || '';
                            
                            productList.push({ id, name, detail, image, category });
                            if (category) categories.add(category);
                        });
                        
                        if (productList.length === 0) {
                            throw new Error('Không thể đọc dữ liệu sản phẩm');
                        }
                        
                        // Populate category filter
                        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
                        categories.forEach(category => {
                            const option = document.createElement('option');
                            option.value = category;
                            option.textContent = category;
                            categoryFilter.appendChild(option);
                        });
                        
                        // Store products globally
                        window.productsList = productList;
                        
                        // Display products
                        displayProducts(productList);
                        
                        // Add filter event listener (only once)
                        categoryFilter.onchange = function() {
                            const selectedCategory = this.value;
                            if (selectedCategory === 'all') {
                                displayProducts(productList);
                            } else {
                                const filtered = productList.filter(p => p.category === selectedCategory);
                                displayProducts(filtered);
                            }
                        };
                    } catch (error) {
                        console.error('Error parsing products XML:', error);
                        // If loading local file failed and not fallback, try online URL
                        if (!isFallback) {
                            console.log('Trying fallback URL...');
                            loadProductsFromURL('https://tranduythanh.com/datasets/CA02_products.xml', true);
                        } else {
                            container.innerHTML = '<p class="error">Không thể parse dữ liệu sản phẩm: ' + error.message + '</p>';
                        }
                    }
                } else {
                    // If loading local file failed and not fallback, try online URL
                    if (!isFallback) {
                        console.log('Local file failed, trying fallback URL...');
                        loadProductsFromURL('https://tranduythanh.com/datasets/CA02_products.xml', true);
                    } else {
                        console.error('Error loading products:', xhr.status);
                        container.innerHTML = '<p class="error">Không thể tải dữ liệu sản phẩm. Status: ' + xhr.status + '</p><p class="error">Vui lòng chạy website qua web server (ví dụ: Live Server) để tránh lỗi CORS.</p>';
                    }
                }
            }
        };
        
        xhr.onerror = function() {
            // If loading local file failed and not fallback, try online URL
            if (!isFallback) {
                console.log('Network error, trying fallback URL...');
                loadProductsFromURL('https://tranduythanh.com/datasets/CA02_products.xml', true);
            } else {
                console.error('Network error loading products');
                container.innerHTML = '<p class="error">Không thể tải dữ liệu sản phẩm (Lỗi mạng).</p><p class="error">Vui lòng kiểm tra kết nối internet hoặc chạy website qua web server (ví dụ: Live Server).</p>';
            }
        };
        
        xhr.send();
    }
    
    // Start loading from local file
    loadProductsFromURL('products.xml', false);
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    
    if (products.length === 0) {
        container.innerHTML = '<p>Không có sản phẩm nào.</p>';
        return;
    }
    
    let html = '<table class="products-table">';
    html += '<thead><tr><th>ID</th><th>Hình ảnh</th><th>Tên sản phẩm</th><th>Mô tả</th><th>Danh mục</th></tr></thead>';
    html += '<tbody>';
    
    products.forEach(product => {
        const detailShort = product.detail.length > 100 
            ? product.detail.substring(0, 100) + '...' 
            : product.detail;
        html += `<tr>
            <td>${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" style="max-width: 100px; height: auto;" onerror="this.src='https://via.placeholder.com/100'"></td>
            <td>${product.name}</td>
            <td>${detailShort}</td>
            <td>${product.category}</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Providers - Form and Table
function initializeProviders() {
    const form = document.getElementById('provider-form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addProvider();
    });
}

function addProvider() {
    const id = document.getElementById('provider-id').value;
    const name = document.getElementById('provider-name').value;
    const phone = document.getElementById('provider-phone').value;
    const email = document.getElementById('provider-email').value;
    
    // Check if ID already exists
    if (providers.find(p => p.id === id)) {
        alert('ID đã tồn tại. Vui lòng nhập ID khác.');
        return;
    }
    
    const provider = { id, name, phone, email };
    providers.push(provider);
    
    // Save to local storage
    localStorage.setItem('providers', JSON.stringify(providers));
    
    // Clear form
    document.getElementById('provider-form').reset();
    
    // Display updated list
    displayProviders();
    
    alert('Đã thêm nhà cung cấp thành công!');
}

function displayProviders() {
    const tbody = document.getElementById('providers-tbody');
    
    if (providers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Chưa có nhà cung cấp nào</td></tr>';
        return;
    }
    
    let html = '';
    providers.forEach(provider => {
        html += `<tr>
            <td>${provider.id}</td>
            <td>${provider.name}</td>
            <td>${provider.phone}</td>
            <td>${provider.email}</td>
            <td>
                <button class="btn-remove" onclick="removeProvider('${provider.id}')">Xóa</button>
            </td>
        </tr>`;
    });
    
    tbody.innerHTML = html;
}

function removeProvider(id) {
    if (confirm('Bạn có chắc chắn muốn xóa nhà cung cấp này?')) {
        providers = providers.filter(p => p.id !== id);
        localStorage.setItem('providers', JSON.stringify(providers));
        displayProviders();
        alert('Đã xóa nhà cung cấp thành công!');
    }
}

// Login/Logout - Local Storage
function initializeLoginStatus() {
    updateLoginUI();
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
}

function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('login-message');
    
    // Simple login check (in real app, this would check against a server)
    if (username && password) {
        // Simulate successful login
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        messageEl.textContent = 'Đăng nhập thành công!';
        messageEl.className = 'success';
        
        // Redirect to home after 1 second
        setTimeout(() => {
            showPage('about-me');
            updateLoginUI();
        }, 1000);
    } else {
        messageEl.textContent = 'Vui lòng nhập đầy đủ thông tin!';
        messageEl.className = 'error';
    }
}

function handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        isLoggedIn = false;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        updateLoginUI();
        showPage('about-me');
    }
}

function updateLoginUI() {
    const loginLink = document.getElementById('login-logout-link');
    
    if (isLoggedIn) {
        loginLink.textContent = 'Logout';
        loginLink.setAttribute('data-page', 'logout');
    } else {
        loginLink.textContent = 'Login';
        loginLink.setAttribute('data-page', 'login');
    }
}

