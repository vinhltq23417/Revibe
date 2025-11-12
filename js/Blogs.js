// File: js/blog.js

// Chờ cho toàn bộ HTML được tải xong rồi mới chạy JS
document.addEventListener('DOMContentLoaded', () => {

  const gridContainer = document.getElementById('blog-grid-container');

  // === HÀM TẠO HTML CHO 1 BÀI VIẾT ===
  // (type sẽ là 'featured' hoặc 'standard')
  function createBlogCardHTML(post, type) {
    
    // Thêm class --featured hoặc --standard
    const cardClass = `blog-card blog-card--${type}`; 

    return `
      <div class="${cardClass}">
        <a href="blog-detail.html?id=${post.id}" class="blog-card__image-container">
          <img src="${post.imageUrl}" alt="${post.title}" class="blog-card__image">
        </a>
        <div class="blog-card__content">
          <p class="blog-card__category">${post.category}</p>
          <h3 class="blog-card__title">
            <a href="blog-detail.html?id=${post.id}">${post.title}</a>
          </h3>
          <p class="blog-card__snippet">${post.snippet}</p>
          <div class="blog-card__author">
            <img class="blog-card__author-avatar" src="${post.authorAvatarUrl}" alt="${post.authorName}">
            <span class="blog-card__author-name">${post.authorName}</span>
          </div>
        </div>
      </div>
    `;
  }

  // === HÀM KHỞI TẠO (CHẠY ĐẦU TIÊN) ===
  async function initializeBlog() {
    try {
      // 1. Tải dữ liệu
      const response = await fetch('../data/blogs.json');
      if (!response.ok) throw new Error('Cannot fetch blogs.json');
      const posts = await response.json();

      if (posts.length === 0) {
        gridContainer.innerHTML = '<p>No blog posts found.</p>';
        return;
      }

      // 2. Tách bài Nổi bật và bài Tiêu chuẩn
      const featuredPost = posts[0]; // Lấy bài đầu tiên
      const standardPosts = posts.slice(1); // Lấy tất cả bài còn lại

      let finalHTML = '';

      // 3. Tạo HTML cho bài Nổi bật
      finalHTML += createBlogCardHTML(featuredPost, 'featured');

      // 4. Tạo HTML cho các bài Tiêu chuẩn
      standardPosts.forEach(post => {
        finalHTML += createBlogCardHTML(post, 'standard');
      });

      // 5. Đổ toàn bộ HTML vào grid
      gridContainer.innerHTML = finalHTML;

      // (Bạn có thể thêm logic cho nút 'Load More' ở đây)
      // Hiện tại, nút 'Load More' chỉ để hiển thị, chưa có chức năng.
      
    } catch (error) {
      console.error('Failed to initialize blog:', error);
      gridContainer.innerHTML = '<p class="error-message">Could not load blog posts.</p>';
    }
  }

  // === CHẠY HÀM KHỞI TẠO ===
  initializeBlog();
});