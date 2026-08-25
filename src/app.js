/* ==========================================================================
   Souk-AlBalat Master App Engine
   Full Multi-Vendor Platform + 7-Module WordPress-Style Super Admin Dashboard
   With 3-Image Cloud Upload, Stock Decrement, Secret Order Management & AI Writer
   ========================================================================== */

import { APP_CONFIG, DEFAULT_CATEGORIES, PRODUCT_CONDITIONS } from './config/constants.js';
import { ProductsService } from './services/products.service.js';
import { OrdersService } from './services/orders.service.js';
import { StorageService } from './services/storage.service.js';
import { PosterService } from './services/poster.service.js';
import { AIService } from './services/ai.service.js';
import { AuthService } from './services/auth.service.js';
import { SecurityService } from './services/security.service.js';

class SoukApp {
  constructor() {
    this.appEl = document.getElementById('app');
    this.cart = JSON.parse(localStorage.getItem('souk_cart') || '[]');
    this.currentTheme = localStorage.getItem('souk_theme') || 'light';
    this.activeCategory = 'all';
    this.activeCondition = 'all';
    this.searchQuery = '';
    this.selectedProductId = null;
    this.currentRoute = window.location.pathname;
    this.adminActiveTab = 'stats';

    // Load dynamic site settings
    this.siteSettings = JSON.parse(localStorage.getItem('souk_site_settings') || JSON.stringify({
      heroTitle: "سوق البالات | بضائع أمازون، أوبن بوكس، وطرود DHL بأفضل الأسعار",
      heroSubtitle: "تصفح القطع النادرة والاصلية والتجارية من منتجات البالة الامازون وال DHL والمرتجعات الاخرى",
      marqueeText: "🚚 شحن وتوصيل لكافة محافظات العراق (5,000 د.ع فقط) | ⚡ ضمان فحص 100% لبضائع الأوتلت والبالات الأوروبية",
      disclaimerText: APP_CONFIG.DEFAULT_DISCLAIMER,
      deliveryFee: APP_CONFIG.FIXED_DELIVERY_FEE,
      supportPhone: "07707188166"
    }));

    // Dynamic Categories
    this.categories = JSON.parse(localStorage.getItem('souk_custom_categories') || JSON.stringify(DEFAULT_CATEGORIES));

    this.initTheme();
    this.initRouter();
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('souk_theme', this.currentTheme);
    this.render();
  }

  initRouter() {
    window.addEventListener('popstate', () => {
      this.handlePath(window.location.pathname);
    });
    this.handlePath(window.location.pathname);
  }

  handlePath(path) {
    this.currentRoute = path;
    const urlParams = new URLSearchParams(window.location.search);
    const managePid = urlParams.get('pid');

    if (path.startsWith('/m-manage-order') || managePid) {
      this.selectedProductId = null;
      this.renderMerchantOrderActionModal(managePid);
    } else if (path.startsWith('/p/')) {
      this.selectedProductId = path.replace('/p/', '');
      this.render();
    } else {
      this.selectedProductId = null;
      this.render();
    }
  }

  navigate(path) {
    window.history.pushState({}, '', path);
    this.handlePath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getActiveCategories() {
    const products = ProductsService.getProducts();
    const productCategoryIds = new Set(products.map(p => p.category));
    return this.categories.filter(cat => cat.id === 'all' || productCategoryIds.has(cat.id));
  }

  render() {
    if (this.currentRoute.startsWith(APP_CONFIG.ROUTES.MERCHANT_PORTAL)) {
      this.renderMerchantPortal();
    } else if (this.currentRoute.startsWith(APP_CONFIG.ROUTES.SUPER_ADMIN)) {
      this.renderAdminPortal();
    } else if (this.selectedProductId) {
      this.renderProductPage(this.selectedProductId);
    } else {
      this.renderCustomerHome();
    }
  }

  /* ==========================================================================
     1. Customer Home & Storefront (100% Official & Clean Public Interface)
     ========================================================================== */
  renderCustomerHome() {
    const products = ProductsService.getProducts();
    const activeCategories = this.getActiveCategories();

    const filteredProducts = products.filter(p => {
      const matchCat = this.activeCategory === 'all' || p.category === this.activeCategory;
      const matchCondition = this.activeCondition === 'all' || p.condition === this.activeCondition;
      const matchSearch = !this.searchQuery || p.title.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchCondition && matchSearch;
    });

    this.appEl.innerHTML = `
      <!-- Top Announcement Marquee -->
      <div class="top-announcement-bar">
        <div class="container">
          <div class="marquee-content">
            <span class="marquee-item">${this.siteSettings.marqueeText}</span>
          </div>
        </div>
      </div>

      <!-- Main Header -->
      <header class="site-header">
        <div class="container">
          <div class="header-main">
            <!-- Brand -->
            <div class="header-brand" style="cursor:pointer;" id="nav-brand-logo">
              <div class="brand-logo-badge">
                <span>⚡</span>
                <span>سوق البالات</span>
              </div>
              <span class="brand-tagline">AMAZON & DHL OUTLET IQ</span>
            </div>

            <!-- Search Bar -->
            <div class="header-search-box">
              <select class="search-category-select" id="search-cat-dropdown">
                ${activeCategories.map(c => `<option value="${c.id}" ${this.activeCategory === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              <input type="text" class="search-input" id="search-keyword-input" placeholder="ابحث عن موديل، ماركة، أو كود..." value="${this.searchQuery}">
              <button class="search-submit-btn" id="btn-search-trigger">🔍 بحث</button>
            </div>

            <!-- Actions -->
            <div class="header-actions">
              <button class="btn-icon" id="btn-theme-toggle" title="تبديل المظهر">
                ${this.currentTheme === 'dark' ? '☀️' : '🌙'}
              </button>

              <button class="btn btn-primary cart-btn-indicator" id="btn-open-cart">
                <span>🛒 السلة</span>
                ${this.cart.length > 0 ? `<span class="cart-badge-count">${this.cart.length}</span>` : ''}
              </button>
            </div>
          </div>
        </div>

        <!-- Categories Navigation -->
        <nav class="categories-navbar">
          <div class="container">
            <div class="categories-list">
              ${activeCategories.map(cat => `
                <button class="category-pill ${this.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
                  ${cat.icon} ${cat.name}
                </button>
              `).join('')}
            </div>
          </div>
        </nav>
      </header>

      <!-- Disclaimer Strip -->
      <div class="disclaimer-banner">
        ⚠️ ${this.siteSettings.disclaimerText}
      </div>

      <main class="container">
        <!-- Hero Section -->
        <section class="hero-section">
          <div class="hero-banner">
            <span class="hero-badge-tag">✨ أول منصة لبضائع أمازون والبالة في العراق 🇮🇶</span>
            <h1 class="hero-title">${this.siteSettings.heroTitle}</h1>
            <p class="hero-subtitle">${this.siteSettings.heroSubtitle}</p>
          </div>
        </section>

        <!-- Product Conditions 4 Main Cards -->
        <section class="feature-filters-row">
          <div class="feature-card ${this.activeCondition === 'new' ? 'active' : ''}" data-cond="new" style="${this.activeCondition === 'new' ? 'border-color: var(--brand-primary); background: var(--bg-surface-subtle);' : ''}">
            <div class="feature-card-icon">✨</div>
            <div class="feature-card-info">
              <h4>جديد غير مفتوح (NEW)</h4>
              <p>بضائع جديدة كلياً بالكرتون ولم تفتح</p>
            </div>
          </div>

          <div class="feature-card ${this.activeCondition === 'open_box' ? 'active' : ''}" data-cond="open_box" style="${this.activeCondition === 'open_box' ? 'border-color: var(--brand-primary); background: var(--bg-surface-subtle);' : ''}">
            <div class="feature-card-icon">📦</div>
            <div class="feature-card-info">
              <h4>أوبن بوكس (Open Box)</h4>
              <p>جديد بالكرتون لكن مفتوح لغرض الفحص</p>
            </div>
          </div>

          <div class="feature-card ${this.activeCondition === 'used' ? 'active' : ''}" data-cond="used" style="${this.activeCondition === 'used' ? 'border-color: var(--brand-primary); background: var(--bg-surface-subtle);' : ''}">
            <div class="feature-card-icon">🔍</div>
            <div class="feature-card-info">
              <h4>مستخدم (Used)</h4>
              <p>بضائع مستخدمة خاضعة للفحص والتجربة</p>
            </div>
          </div>

          <div class="feature-card ${this.activeCondition === 'scrap' ? 'active' : ''}" data-cond="scrap" style="${this.activeCondition === 'scrap' ? 'border-color: var(--brand-primary); background: var(--bg-surface-subtle);' : ''}">
            <div class="feature-card-icon">🔧</div>
            <div class="feature-card-info">
              <h4>عاطل - أدوات (SCRAP)</h4>
              <p>بضاعة عاطلة تباع كأدوات وقطع غيار للمصلحين</p>
            </div>
          </div>
        </section>

        <!-- Marketplace Main Layout -->
        <div class="main-marketplace-layout">
          <!-- Sidebar Filters -->
          <aside class="marketplace-sidebar">
            <div class="filter-section">
              <div class="filter-title">
                <span>📁 الأقسام المتاحة</span>
              </div>
              <div>
                ${activeCategories.map(c => `
                  <div class="filter-list-item ${this.activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}">
                    <span>${c.name}</span>
                    <span class="filter-count-badge">${products.filter(p => c.id === 'all' || p.category === c.id).length}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="filter-section">
              <div class="filter-title">
                <span>🏷️ حالة القطعة</span>
              </div>
              <div>
                <div class="filter-list-item ${this.activeCondition === 'all' ? 'active' : ''}" data-cond="all">الكل</div>
                <div class="filter-list-item ${this.activeCondition === 'new' ? 'active' : ''}" data-cond="new">✨ جديد غير مفتوح (NEW)</div>
                <div class="filter-list-item ${this.activeCondition === 'open_box' ? 'active' : ''}" data-cond="open_box">📦 أوبن بوكس (Open Box)</div>
                <div class="filter-list-item ${this.activeCondition === 'used' ? 'active' : ''}" data-cond="used">🔍 مستخدم فحص</div>
                <div class="filter-list-item ${this.activeCondition === 'scrap' ? 'active' : ''}" data-cond="scrap">🔧 عاطل - أدوات (SCRAP)</div>
              </div>
            </div>
          </aside>

          <!-- Products Grid Area -->
          <section>
            <div class="products-header-bar">
              <span class="products-count-label">البضائع المعروضة (${filteredProducts.length} قطعة)</span>
              <select class="sort-select-dropdown" id="sort-products-select">
                <option value="latest">الأحدث وصولاً</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
              </select>
            </div>

            ${filteredProducts.length === 0 ? `
              <div style="background: var(--bg-surface); border: 1px solid var(--border-strong); border-radius: var(--radius-lg); padding: 60px 20px; text-align: center; margin: 20px 0;">
                <div style="font-size: 3.5rem; margin-bottom: 12px;">📦🔍</div>
                <h3 style="font-size: 1.25rem; font-weight: 900; color: var(--text-primary); margin-bottom: 8px;">لا توجد بضائع معروضة حالياً</h3>
                <p style="color: var(--text-secondary); max-width: 450px; margin: 0 auto; font-size: 0.95rem;">يتم فحص وتجهيز وجبات جديدة من بضائع الأوتلت والبالات الأوروبية لإضافتها قريباً.</p>
              </div>
            ` : `
              <div class="products-grid">
                ${filteredProducts.map(p => this.renderProductCard(p)).join('')}
              </div>
            `}
          </section>
        </div>
      </main>

      <!-- Floating Support Bubble -->
      <div class="floating-support-bubble" id="btn-floating-support">
        <div class="bubble-icon">💬</div>
        <div class="bubble-text">مراسلة الإدارة</div>
      </div>
    `;

    this.attachCustomerEvents();
  }

  renderProductCard(p) {
    const isSold = p.status === 'sold';
    const isReserved = p.status === 'reserved' || (Number(p.quantity) === 0);

    return `
      <div class="product-card" data-product-id="${p.id}">
        <div class="product-image-box" style="cursor:pointer;" onclick="window.app.navigate('/p/${p.id}')">
          <img src="${p.image}" alt="${p.title}" loading="lazy">
          
          <span class="badge product-condition-tag ${p.condition === 'new' || p.condition === 'open_box' ? 'badge-new' : p.condition === 'used' ? 'badge-used' : 'badge-scrap'}">
            ${PRODUCT_CONDITIONS[p.condition?.toUpperCase()]?.label || p.conditionLabel || 'ممتاز'}
          </span>

          ${p.discountPercent > 0 ? `<span class="badge badge-discount product-discount-tag">وفر ${p.discountPercent}%</span>` : ''}

          <button class="product-poster-btn-mini" onclick="event.stopPropagation(); window.app.openPosterModal('${p.id}')">
            📷 بوستر 📱
          </button>
        </div>

        <div class="product-card-body">
          <div class="product-merchant-link">
            🏪 ${p.merchantName} ${Number(p.quantity) > 1 ? `<span style="color: #10b981; font-weight: 800;">(متوفر: ${p.quantity} قطع)</span>` : ''}
          </div>

          <h3 class="product-card-title" style="cursor:pointer;" onclick="window.app.navigate('/p/${p.id}')">
            ${p.title}
          </h3>

          <div class="product-card-pricing">
            <span class="price-current">${Number(p.price).toLocaleString()}</span>
            <span class="price-currency">${APP_CONFIG.CURRENCY}</span>
            ${p.oldPrice ? `<span class="price-old">${Number(p.oldPrice).toLocaleString()}</span>` : ''}
          </div>

          <div class="product-card-actions">
            ${isSold ? `
              <button class="btn btn-secondary" style="grid-column: span 2;" disabled>❌ مباعة بالكامل</button>
            ` : isReserved ? `
              <button class="btn btn-secondary" style="grid-column: span 2;" disabled>⏳ قيد الحجز</button>
            ` : `
              <button class="btn btn-primary" onclick="window.app.addToCart('${p.id}')">🛒 أضف للسلة</button>
              <button class="btn btn-secondary" onclick="window.app.navigate('/p/${p.id}')">تفاصيل</button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  attachCustomerEvents() {
    document.getElementById('btn-theme-toggle')?.addEventListener('click', () => this.toggleTheme());

    document.getElementById('nav-brand-logo')?.addEventListener('click', () => {
      this.activeCategory = 'all';
      this.activeCondition = 'all';
      this.searchQuery = '';
      this.navigate('/');
    });

    document.getElementById('btn-open-cart')?.addEventListener('click', () => {
      this.openCartModal();
    });

    document.getElementById('btn-search-trigger')?.addEventListener('click', () => {
      this.searchQuery = document.getElementById('search-keyword-input').value;
      this.render();
    });

    document.querySelectorAll('.category-pill, .filter-list-item[data-cat]').forEach(el => {
      el.addEventListener('click', () => {
        this.activeCategory = el.dataset.cat;
        this.render();
      });
    });

    document.querySelectorAll('.feature-card[data-cond], .filter-list-item[data-cond]').forEach(el => {
      el.addEventListener('click', () => {
        this.activeCondition = el.dataset.cond;
        this.render();
      });
    });

    document.getElementById('btn-floating-support')?.addEventListener('click', () => {
      const cleanAdminPhone = (this.siteSettings.supportPhone || '07707188166').replace(/[^0-9]/g, '');
      window.open(`https://api.whatsapp.com/send?phone=964${cleanAdminPhone.startsWith('0') ? cleanAdminPhone.slice(1) : cleanAdminPhone}&text=${encodeURIComponent('السلام عليكم إدارة سوق البالات، أحتاج مساعدة بخصوص المتجر.')}`, '_blank');
    });
  }

  /* ==========================================================================
     2. Dedicated Full-Page Product View (/p/:id) with Interactive 3-Image Gallery
     ========================================================================== */
  async renderProductPage(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) {
      this.navigate('/');
      return;
    }

    const imagesList = product.images?.length > 0 ? product.images : [product.image];
    const insights = product.aiEnabled ? await AIService.generateProductInsights(product.title, product.price) : null;
    const relatedFromSeller = ProductsService.getProducts().filter(p => p.merchantId === product.merchantId && p.id !== product.id).slice(0, 4);
    const relatedFromCategory = ProductsService.getProducts().filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    this.appEl.innerHTML = `
      <!-- Top Announcement Marquee -->
      <div class="top-announcement-bar">
        <div class="container">
          <div class="marquee-content">
            <span class="marquee-item">${this.siteSettings.marqueeText}</span>
          </div>
        </div>
      </div>

      <!-- Header -->
      <header class="site-header">
        <div class="container">
          <div class="header-main">
            <div class="header-brand" style="cursor:pointer;" onclick="window.app.navigate('/')">
              <div class="brand-logo-badge">
                <span>⚡</span>
                <span>سوق البالات</span>
              </div>
              <span class="brand-tagline">AMAZON & DHL OUTLET IQ</span>
            </div>

            <div class="header-actions">
              <button class="btn btn-secondary" onclick="window.app.navigate('/')">⬅️ العودة للرئيسية</button>
              <button class="btn btn-primary cart-btn-indicator" id="btn-open-cart">
                <span>🛒 السلة</span>
                ${this.cart.length > 0 ? `<span class="cart-badge-count">${this.cart.length}</span>` : ''}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="container product-page-wrapper">
        <!-- Breadcrumb Bar -->
        <div class="breadcrumb-bar">
          <a href="#" onclick="event.preventDefault(); window.app.navigate('/')">الرئيسية</a>
          <span>/</span>
          <a href="#" onclick="event.preventDefault(); window.app.activeCategory='${product.category}'; window.app.navigate('/')">${product.category}</a>
          <span>/</span>
          <span>${product.merchantName}</span>
          <span>/</span>
          <span style="color: var(--text-primary); font-weight: 800;">${product.title}</span>
        </div>

        <!-- 3-Column Layout Grid -->
        <div class="product-details-alrayan-grid">
          
          <!-- 1. Right Column: Image Gallery (Up to 3 Photos with Interactive Thumbnails) -->
          <div class="product-gallery-container">
            <div class="gallery-floating-actions">
              <button class="btn-icon" title="مشاركة" onclick="navigator.clipboard.writeText(window.location.href); window.app.showToast('تم نسخ رابط المنتج بنجاح!', 'success');">🔗</button>
              <button class="btn-icon" title="تقديم بلاغ للإدارة" onclick="window.app.openReportModal('${product.id}')">🚩</button>
            </div>

            <div class="gallery-main-img-box">
              <img id="main-gallery-view-img" src="${imagesList[0]}" alt="${product.title}">
            </div>

            ${imagesList.length > 1 ? `
              <div style="display: flex; gap: 8px; margin-top: 10px; justify-content: center;">
                ${imagesList.map((imgUrl, i) => `
                  <div class="gallery-thumb-item ${i === 0 ? 'active' : ''}" style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden; border: 2px solid ${i === 0 ? 'var(--brand-primary)' : 'var(--border-subtle)'}; cursor: pointer;" onclick="document.getElementById('main-gallery-view-img').src='${imgUrl}'; document.querySelectorAll('.gallery-thumb-item').forEach(el => el.style.borderColor='var(--border-subtle)'); this.style.borderColor='var(--brand-primary)';">
                    <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>

          <!-- 2. Middle Column: Product Details & Socials -->
          <div class="product-middle-info">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: var(--bg-surface-subtle); padding: 8px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-weight: 900; color: var(--text-primary);">🏪 ${product.merchantName}</span>
                <span class="badge" style="background: #fef08a; color: #854d0e;">👑 مدير الموقع</span>
              </div>

              <!-- Social Links -->
              <div style="display: flex; align-items: center; gap: 10px;">
                <a href="https://www.facebook.com/gpm90" target="_blank" title="صفحة الفيسبوك" style="font-size: 1.1rem; text-decoration: none;">📘</a>
                <a href="https://www.tiktok.com/@alwareth_amazon" target="_blank" title="حساب تيك توك" style="font-size: 1.1rem; text-decoration: none;">🎵</a>
                <a href="https://api.whatsapp.com/send?phone=9647707188166" target="_blank" title="محادثة واتساب" style="font-size: 1.1rem; text-decoration: none;">💬</a>
              </div>
            </div>

            <h1 class="product-hero-title">${product.title}</h1>

            <div class="product-rating-row">
              <span>⭐⭐⭐⭐⭐</span>
              <span style="color: var(--text-secondary); font-size: 0.85rem;">5 (10 مراجعات معتمدة)</span>
              <span class="badge ${product.condition === 'new' || product.condition === 'open_box' ? 'badge-new' : product.condition === 'used' ? 'badge-used' : 'badge-scrap'}" style="margin-right: auto;">
                ${PRODUCT_CONDITIONS[product.condition?.toUpperCase()]?.label || product.conditionLabel || 'ممتاز'}
              </span>
            </div>

            <!-- Price Highlight -->
            <div class="product-pricing-card-alrayan">
              <div class="price-row">
                <span style="font-size: 1.2rem; font-weight: 800; color: var(--text-secondary);">السعر:</span>
                <span class="big-price">${Number(product.price).toLocaleString()}</span>
                <span style="font-size: 1.1rem; font-weight: 900; color: #dc2626;">${APP_CONFIG.CURRENCY}</span>
                ${product.oldPrice ? `<span class="strike-price">${Number(product.oldPrice).toLocaleString()} د.ع</span>` : ''}
                ${product.discountPercent > 0 ? `<span class="badge badge-discount">وفر ${product.discountPercent}%</span>` : ''}
              </div>
            </div>

            <!-- Delivery Trust Badge -->
            <div class="product-shipping-trust-pill">
              <span>🚚</span>
              <span>توصيل سريع لكافة محافظات العراق (أجور الشحن: ${product.freeDelivery ? 'مجاني 🎁' : '5,000 د.ع فقط'})</span>
            </div>

            <!-- Description Box -->
            <div style="background: var(--bg-surface-subtle); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-weight: 900; margin-bottom: 6px; color: var(--text-primary);">تفاصيل ومواصفات القطعة:</h4>
              <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem; white-space: pre-line;">${product.description}</p>
            </div>

            <!-- AI Market Insights Card (Shown if Enabled by Merchant) -->
            ${insights ? `
              <div class="ai-insights-box">
                <div class="ai-header-tag">
                  <span>🤖 تقييم الذكاء الاصطناعي للمنتج:</span>
                </div>
                <div class="ai-data-row">
                  <strong>التوفر في العراق:</strong>
                  <span>${insights.availabilityInIraq}</span>
                </div>
                <div class="ai-data-row">
                  <strong>السعر التقديري في العراق:</strong>
                  <span style="font-weight: 900; color: #dc2626;">${insights.estimatedPriceLocal}</span>
                </div>
                <div class="ai-data-row">
                  <strong>السعر التقديري عالمياً:</strong>
                  <span>${insights.estimatedPriceGlobal}</span>
                </div>
                <div class="ai-disclaimer">${insights.disclaimer}</div>
              </div>
            ` : ''}
          </div>

          <!-- 3. Left Column: Sticky Buy Box Card -->
          <div class="product-sticky-buybox">
            <div class="buybox-badge-header">
              ⚡ متاح بالمخزون: ${Number(product.quantity) || 1} قطع فقط
            </div>

            <div style="font-size: 1.6rem; font-weight: 900; color: #dc2626; font-family: var(--font-numbers);">
              <span style="font-size: 1rem; color: var(--text-secondary);">السعر: </span>${Number(product.price).toLocaleString()} <span style="font-size: 0.9rem; color: var(--text-secondary);">${APP_CONFIG.CURRENCY}</span>
            </div>

            <button class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.05rem;" onclick="window.app.addToCart('${product.id}')">
              🛒 أضف إلى السلة
            </button>

            <button class="btn btn-whatsapp" style="width: 100%; padding: 12px;" onclick="window.app.openWhatsAppDirectOrder('${product.id}')">
              📲 اشترِ الآن عبر واتساب
            </button>

            <button class="btn btn-secondary" style="width: 100%;" onclick="window.app.openPosterModal('${product.id}')">
              📷 حفظ بوستر تسويقي 📱
            </button>

            <!-- Trust Icons -->
            <div class="buybox-trust-list">
              <div class="trust-item">
                <span>🛡️</span>
                <span>فحص وضمان الجودة 100%</span>
              </div>
              <div class="trust-item">
                <span>🚚</span>
                <span>توصيل مباشر لباب منزلك</span>
              </div>
              <div class="trust-item">
                <span>🔒</span>
                <span>دائماً موثوقة ومضمونة</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Suggestions placed at the very BOTTOM -->
        <section style="margin-top: 50px; padding-top: 30px; border-top: 2px solid var(--border-strong);">
          ${relatedFromSeller.length > 0 ? `
            <div style="margin-bottom: 40px;">
              <h2 style="font-size: 1.35rem; font-weight: 900; margin-bottom: 16px;">بضائع أخرى من نفس التاجر (${product.merchantName}):</h2>
              <div class="products-grid">
                ${relatedFromSeller.map(p => this.renderProductCard(p)).join('')}
              </div>
            </div>
          ` : ''}

          ${relatedFromCategory.length > 0 ? `
            <div>
              <h2 style="font-size: 1.35rem; font-weight: 900; margin-bottom: 16px;">بضائع مشابهة من كل الموقع:</h2>
              <div class="products-grid">
                ${relatedFromCategory.map(p => this.renderProductCard(p)).join('')}
              </div>
            </div>
          ` : ''}
        </section>
      </main>
    `;

    document.getElementById('btn-open-cart')?.addEventListener('click', () => this.openCartModal());
  }

  openWhatsAppDirectOrder(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    // Decrement stock in catalog
    ProductsService.decrementStock(productId, 1);

    const cleanPhone = (product.merchantPhone || '07707188166').replace(/[^0-9]/g, '');
    const origin = window.location.origin;

    let msg = `السلام عليكم ورحمة الله،\nأود حجز هذا المنتج مباشرة:\n*${product.title}*\nالسعر: ${Number(product.price).toLocaleString()} د.ع\nرابط المنتج: ${origin}/p/${product.id}\n\n`;
    msg += `──────────────────────\n`;
    msg += `👑 *خيارات التاجر (إدارة حالة المنتج):*\n`;
    msg += `👉 ${origin}/m-manage-order?pid=${product.id}`;

    window.open(`https://api.whatsapp.com/send?phone=964${cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone}&text=${encodeURIComponent(msg)}`, '_blank');
    this.render();
  }

  /* ==========================================================================
     3. Secret Merchant Quick-Action Modal (/m-manage-order?pid=...)
     ========================================================================== */
  renderMerchantOrderActionModal(productId) {
    const merchant = AuthService.getCurrentMerchant();
    const product = ProductsService.getProductById(productId);

    if (!merchant) {
      // Prompt merchant login first
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'modal-overlay active';
      modalOverlay.innerHTML = `
        <div class="modal-container" style="max-width: 440px;">
          <div class="modal-header">
            <div class="modal-title">
              <span>💼</span>
              <span>تسجيل دخول التاجر لإدارة البضاعة</span>
            </div>
            <div class="modal-close" onclick="window.app.navigate('/')">✕</div>
          </div>
          <div class="modal-body">
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
              وصلتك رسالة حجز على الواتساب؟ يرجى تسجيل الدخول للتحكم بحالة البضاعة وتأكيد البيع أو إعادة تفعيلها.
            </p>
            <div class="form-group">
              <label class="form-label">رقم الهاتف المعتمد</label>
              <input type="tel" class="form-input" id="quick-m-phone" placeholder="07XXXXXXXXX" autocomplete="off">
            </div>
            <div class="form-group">
              <label class="form-label">كود الدخول السري</label>
              <input type="password" class="form-input" id="quick-m-passcode" placeholder="••••" autocomplete="new-password">
            </div>
            <button class="btn btn-primary" style="width: 100%;" id="btn-do-quick-login">
              تسجيل الدخول والتحكم بالمنتج
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modalOverlay);

      modalOverlay.querySelector('#btn-do-quick-login')?.addEventListener('click', async () => {
        const phone = document.getElementById('quick-m-phone').value.trim();
        const code = document.getElementById('quick-m-passcode').value.trim();
        const res = await AuthService.loginMerchant(phone, code);
        if (res.success) {
          modalOverlay.remove();
          this.renderMerchantOrderActionModal(productId);
        } else {
          this.showToast(res.message, 'error');
        }
      });
      return;
    }

    if (!product) {
      this.showToast('المنتج المطلوب غير موجود', 'error');
      this.navigate('/v-space-k90');
      return;
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 520px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>⚙️</span>
            <span>إدارة حالة البضاعة والمخزون</span>
          </div>
          <div class="modal-close" onclick="window.app.navigate('/v-space-k90')">✕</div>
        </div>

        <div class="modal-body">
          <div style="display: flex; gap: 12px; align-items: center; background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px;">
            <img src="${product.image}" style="width: 64px; height: 64px; border-radius: 8px; object-fit: cover;">
            <div>
              <h4 style="font-weight: 800; font-size: 0.95rem;">${product.title}</h4>
              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">
                السعر: <strong>${Number(product.price).toLocaleString()} د.ع</strong> | الحالة الحالية: <span class="badge ${product.status === 'available' ? 'badge-new' : product.status === 'reserved' ? 'badge-used' : 'badge-scrap'}">${product.status === 'available' ? 'متوفر 🟢' : product.status === 'reserved' ? 'قيد الحجز ⏳' : 'تم البيع 🔴'}</span>
              </div>
            </div>
          </div>

          <h4 style="font-weight: 800; margin-bottom: 10px;">اختر الإجراء المناسب بعد محادثة الزبون:</h4>

          <div style="display: flex; flex-direction: column; gap: 10px;">
            <button class="btn btn-primary" style="justify-content: flex-start; padding: 12px;" id="act-reactivate-prod">
              🟢 إعادة تفعيل المنتج وإتاحته للبيع (متوفر بالموقع)
            </button>

            <button class="btn btn-danger" style="justify-content: flex-start; padding: 12px;" id="act-mark-sold-prod">
              🔴 تأكيد البيع النهائي (إخفاء من المتجر وخصم من المخزون)
            </button>

            <button class="btn btn-secondary" style="justify-content: flex-start; padding: 12px;" id="act-keep-reserved-prod">
              ⏳ إبقاء المنتج قيد الحجز (مؤقتاً لحين استلام العربون)
            </button>
          </div>

          <div style="margin-top: 20px; border-top: 1px solid var(--border-subtle); padding-top: 14px;">
            <label class="form-label">📦 تعديل الكمية المتوفرة في المخزون</label>
            <div style="display: flex; gap: 8px;">
              <input type="number" class="form-input" id="act-stock-qty" value="${product.quantity || 1}" min="0">
              <button class="btn btn-secondary" id="btn-save-stock-qty" style="flex-shrink: 0;">تحديث الكمية</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="window.app.navigate('/v-space-k90')">الذهاب للوحة التحكم</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#act-reactivate-prod')?.addEventListener('click', () => {
      ProductsService.updateProductStatus(productId, 'available', Math.max(1, Number(product.quantity) || 1));
      modalOverlay.remove();
      this.navigate('/v-space-k90');
      this.showToast('تمت إعادة تفعيل المنتج وإتاحته للبيع بنجاح!', 'success');
    });

    modalOverlay.querySelector('#act-mark-sold-prod')?.addEventListener('click', () => {
      ProductsService.updateProductStatus(productId, 'sold', 0);
      modalOverlay.remove();
      this.navigate('/v-space-k90');
      this.showToast('تم تثبيت بيع المنتج بنجاح!', 'info');
    });

    modalOverlay.querySelector('#act-keep-reserved-prod')?.addEventListener('click', () => {
      ProductsService.updateProductStatus(productId, 'reserved');
      modalOverlay.remove();
      this.navigate('/v-space-k90');
      this.showToast('المنتج الآن قيد الحجز المؤقت', 'info');
    });

    modalOverlay.querySelector('#btn-save-stock-qty')?.addEventListener('click', () => {
      const qty = Number(document.getElementById('act-stock-qty').value);
      ProductsService.updateProductStatus(productId, qty > 0 ? 'available' : 'reserved', qty);
      modalOverlay.remove();
      this.navigate('/v-space-k90');
      this.showToast(`تم تحديث كمية المخزون إلى: ${qty}`, 'success');
    });
  }

  /* ==========================================================================
     4. Poster Modal (Live Preview Morphing)
     ========================================================================== */
  openPosterModal(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    let selectedFormat = 'vertical';

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    
    const updatePreviewHTML = () => {
      const isVertical = selectedFormat === 'vertical';
      return `
        <div class="${isVertical ? 'flyer-preview-vertical' : 'flyer-preview-horizontal'}" id="flyer-render-target">
          <div class="flyer-image-col">
            <img src="${product.image}" alt="${product.title}">
            <span class="badge badge-new" style="position: absolute; top: 10px; right: 10px;">${PRODUCT_CONDITIONS[product.condition?.toUpperCase()]?.label || product.conditionLabel || 'أوبن بوكس'}</span>
          </div>

          <div class="flyer-info-col">
            <div class="flyer-brand-header">
              <span>⚡ ${APP_CONFIG.STORE_NAME_SHORT}</span>
              <span style="font-size: 0.75rem; color: #94a3b8;">| ${product.merchantName}</span>
            </div>

            <h2 class="flyer-product-title">${product.title}</h2>
            <div style="font-size: 0.85rem; color: #d1d5db;">الموديل / الكود: #${product.id}</div>

            <div class="flyer-price-container">
              <span class="flyer-price-label">السعر:</span>
              <span class="flyer-price-value">${Number(product.price).toLocaleString()} ${APP_CONFIG.CURRENCY}</span>
            </div>

            <div class="flyer-qr-footer">
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #f59e0b;">امسح الكود للتسوق المباشر</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">souk-al-balat.vercel.app</div>
              </div>
              <div class="flyer-qr-box">
                <div style="font-size: 1.8rem;">📱</div>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    modalOverlay.innerHTML = `
      <div class="modal-container marketing-poster-modal">
        <div class="modal-header">
          <div class="modal-title">
            <span>✨</span>
            <span>بطاقة / هوية تسويقية جاهزة للمشاركة</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <div id="dynamic-poster-preview-box">
            ${updatePreviewHTML()}
          </div>

          <p style="font-size: 0.82rem; color: var(--text-tertiary); text-align: center; margin-top: 14px;">
            * اضغط على زر التدوير 🔄 بالأسفل لقلب شكل البوستر بين (العمودي للستوري 📱) و (الأفقي للمنشورات 🖥️).
          </p>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <button class="btn btn-secondary" id="btn-toggle-poster-format" style="font-weight: 800;">
            🔄 📱 قلب الشكل (${selectedFormat === 'vertical' ? 'عمودي ستوري' : 'أفقي عريض'})
          </button>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
            <button class="btn btn-primary" id="btn-download-poster-action">
              📷 تحميل البوستر كصورة PNG
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const toggleBtn = modalOverlay.querySelector('#btn-toggle-poster-format');
    const previewBox = modalOverlay.querySelector('#dynamic-poster-preview-box');

    toggleBtn.addEventListener('click', () => {
      selectedFormat = selectedFormat === 'vertical' ? 'horizontal' : 'vertical';
      toggleBtn.innerHTML = `🔄 📱 قلب الشكل (${selectedFormat === 'vertical' ? 'عمودي ستوري' : 'أفقي عريض'})`;
      previewBox.innerHTML = updatePreviewHTML();
    });

    modalOverlay.querySelector('#btn-download-poster-action')?.addEventListener('click', async () => {
      await PosterService.exportFlyerAsImage(product, selectedFormat);
      this.showToast(`تم تحميل البوستر (${selectedFormat === 'vertical' ? 'العمودي 📱' : 'الأفقي 🖥️'}) بنجاح!`, 'success');
    });
  }

  addToCart(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    if (this.cart.some(item => item.id === productId)) {
      this.showToast('المنتج موجود بالفعل في سلتك!', 'info');
      return;
    }

    this.cart.push(product);
    localStorage.setItem('souk_cart', JSON.stringify(this.cart));
    this.render();

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 440px; text-align: center;">
        <div class="modal-body" style="padding: 30px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🎉</div>
          <h3 style="font-weight: 900; margin-bottom: 8px;">تمت إضافة المنتج للسلة بنجاح!</h3>
          <p style="color: var(--text-secondary); margin-bottom: 20px;">${product.title}</p>

          <div style="display: flex; gap: 10px; justify-content: center;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إكمال التسوق 🛍️</button>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); window.app.openCartModal()">الانتقال للسلة 🛒</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  openCartModal() {
    const savedCustomer = AuthService.getCustomerProfile() || { name: '', phone: '', address: '', notes: '' };

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 680px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🛒</span>
            <span>سلة المشتريات وتأكيد الحجز (${this.cart.length} منتجات)</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          ${this.cart.length === 0 ? `
            <div style="text-align: center; padding: 40px 20px;">
              <div style="font-size: 3rem; margin-bottom: 10px;">🛍️</div>
              <h4 style="font-weight: 800;">سلة المشتريات فارغة حالياً</h4>
              <p style="color: var(--text-secondary); margin-bottom: 16px;">تصفح البضائع المتوفرة وأضف ما يعجبك للحجز الفوري.</p>
              <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove()">تصفح المعرض</button>
            </div>
          ` : `
            <div style="background: rgba(245, 158, 11, 0.12); border: 1px dashed var(--brand-primary); padding: 12px 16px; border-radius: var(--radius-md); margin-bottom: 16px; font-size: 0.88rem; font-weight: 700;">
              ✨ <strong>ملاحظة مفيدة:</strong> بياناتك المدخلة بالأسفل ستُحفظ تلقائياً في جهازك لملئها بسرعة في طلباتك القادمة.
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
              ${this.cart.map((item, idx) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-md);">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="${item.image}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;">
                    <div>
                      <div style="font-weight: 800; font-size: 0.9rem;">${item.title}</div>
                      <div style="font-size: 0.75rem; color: var(--text-secondary);">التاجر: ${item.merchantName}</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="font-weight: 900; font-family: var(--font-numbers);">${Number(item.price).toLocaleString()} د.ع</div>
                    <button style="color: #ef4444; font-size: 1.1rem;" onclick="window.app.removeFromCart(${idx}); this.closest('.modal-overlay').remove(); window.app.openCartModal();">🗑️</button>
                  </div>
                </div>
              `).join('')}
            </div>

            <h4 style="font-weight: 800; margin-bottom: 10px;">معلومات التوصيل والزبون:</h4>
            <div class="form-group">
              <label class="form-label">الاسم الثلاثي *</label>
              <input type="text" class="form-input" id="cust-name" placeholder="أدخل اسمك الكامل" value="${savedCustomer.name}">
            </div>

            <div class="form-group">
              <label class="form-label">رقم هاتف الواتساب المعتمد *</label>
              <input type="tel" class="form-input" id="cust-phone" placeholder="07XXXXXXXXX" value="${savedCustomer.phone}">
            </div>

            <div class="form-group">
              <label class="form-label">المحافظة والعنوان بالتفصيل *</label>
              <input type="text" class="form-input" id="cust-address" placeholder="بغداد - المنصور - شارع 14 رمضان..." value="${savedCustomer.address}">
            </div>

            <div class="form-group">
              <label class="form-label">ملاحظات إضافية على الطلب</label>
              <input type="text" class="form-input" id="cust-notes" placeholder="وقت التسليم المفضل، نقطة دالة..." value="${savedCustomer.notes}">
            </div>

            <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-strong); padding: 14px; border-radius: var(--radius-md); margin-top: 14px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
                <span>المجموع الفرعي للبضائع:</span>
                <span style="font-weight: 800;">${this.cart.reduce((sum, item) => sum + Number(item.price), 0).toLocaleString()} د.ع</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.9rem;">
                <span>أجور التوصيل الثابتة:</span>
                <span style="font-weight: 800; color: var(--brand-primary);">${Number(this.siteSettings.deliveryFee).toLocaleString()} د.ع</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 1.2rem; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
                <span>الإجمالي التقديري:</span>
                <span style="color: var(--brand-primary);">${(this.cart.reduce((sum, item) => sum + Number(item.price), 0) + Number(this.siteSettings.deliveryFee)).toLocaleString()} د.ع</span>
              </div>
            </div>
          `}
        </div>

        ${this.cart.length > 0 ? `
          <div class="modal-footer">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">متابعة التسوق</button>
            <button class="btn btn-whatsapp" id="btn-submit-whatsapp-order">
              📲 إرسال وتأكيد الحجز عبر الواتساب
            </button>
          </div>
        ` : ''}
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-submit-whatsapp-order')?.addEventListener('click', () => {
      const name = document.getElementById('cust-name').value.trim();
      const phone = document.getElementById('cust-phone').value.trim();
      const address = document.getElementById('cust-address').value.trim();
      const notes = document.getElementById('cust-notes').value.trim();

      if (!name || !phone || !address) {
        this.showToast('يرجى ملء الاسم ورقم الهاتف والعنوان للمتابعة', 'error');
        return;
      }

      AuthService.saveCustomerProfile({ name, phone, address, notes });
      const orders = OrdersService.processOrderAndGenerateWhatsApp(this.cart, { name, phone, address, notes });

      orders.forEach(order => {
        window.open(order.waUrl, '_blank');
      });

      this.cart = [];
      localStorage.setItem('souk_cart', JSON.stringify(this.cart));
      modalOverlay.remove();
      this.render();
      this.showToast('تم إرسال فاتورة الحجز للتاجر عبر الواتساب بنجاح!', 'success');
    });
  }

  removeFromCart(index) {
    this.cart.splice(index, 1);
    localStorage.setItem('souk_cart', JSON.stringify(this.cart));
    this.render();
  }

  /* ==========================================================================
     5. Merchant Isolated Portal (/v-space-k90)
     ========================================================================== */
  renderMerchantPortal() {
    const merchant = AuthService.getCurrentMerchant();
    if (!merchant) {
      this.renderMerchantLogin();
      return;
    }

    const myProducts = ProductsService.getProducts().filter(p => p.merchantId === merchant.id);

    this.appEl.innerHTML = `
      <div class="merchant-portal-view">
        <div class="container">
          <div class="merchant-top-header">
            <div class="merchant-profile-card">
              <div class="merchant-avatar-circle">
                <img src="${merchant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <h2 style="font-size: 1.25rem; font-weight: 900;">${merchant.name}</h2>
                  <span class="badge" style="background: #fef08a; color: #854d0e;">👑 مدير الموقع</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; display: flex; gap: 10px; align-items: center;">
                  <span>هاتف الواتساب: ${merchant.phone}</span>
                  <span>|</span>
                  <a href="${merchant.socials?.facebook || 'https://www.facebook.com/gpm90'}" target="_blank" style="color: var(--brand-primary); font-weight: 700; text-decoration: none;">فيسبوك 📘</a>
                  <span>|</span>
                  <a href="${merchant.socials?.tiktok || 'https://www.tiktok.com/@alwareth_amazon'}" target="_blank" style="color: var(--brand-primary); font-weight: 700; text-decoration: none;">تيك توك 🎵</a>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-secondary" id="btn-merchant-settings">
                ⚙️ إعدادات الحساب وكلمة المرور
              </button>
              <button class="btn btn-primary" id="btn-merchant-add-product">
                ➕ نشر بضاعة جديدة
              </button>
              <button class="btn btn-secondary" id="btn-merchant-logout">
                🚪 خروج
              </button>
            </div>
          </div>

          <div class="merchant-stats-grid">
            <div class="merchant-stat-card">
              <span class="stat-label">📦 البضائع المعروضة</span>
              <span class="stat-value">${myProducts.filter(p => p.status === 'available').length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">⏳ طلبات قيد الحجز</span>
              <span class="stat-value">${myProducts.filter(p => p.status === 'reserved').length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">✅ بضائع تم بيعها</span>
              <span class="stat-value">${myProducts.filter(p => p.status === 'sold').length}</span>
            </div>
          </div>

          <div class="admin-table-container">
            <div style="padding: 16px 20px; font-weight: 800; font-size: 1.1rem; border-bottom: 1px solid var(--border-subtle);">
              إدارة بضائع متجرك المعروضة
            </div>

            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>عنوان المنتج</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                  <th>الحالة</th>
                  <th>الخصم والتوصيل</th>
                  <th>إجراءات سريعة</th>
                </tr>
              </thead>
              <tbody>
                ${myProducts.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; padding: 40px; font-weight: 700; color: var(--text-secondary);">
                    المتجر فارغ حالياً. اضغط على زر <strong>"➕ نشر بضاعة جديدة"</strong> أعلاه لبدء إضافة أولى بضائعك!
                  </td></tr>
                ` : myProducts.map(p => `
                  <tr>
                    <td><img src="${p.image}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;"></td>
                    <td style="font-weight: 800; max-width: 260px;">${p.title}</td>
                    <td style="font-family: var(--font-numbers); font-weight: 800;">${Number(p.price).toLocaleString()} د.ع</td>
                    <td style="font-weight: 800; color: #10b981;">${p.quantity || 1} قطعة</td>
                    <td>
                      <select class="form-select" style="padding: 4px 8px; font-size: 0.8rem;" onchange="window.app.changeProductStatus('${p.id}', this.value)">
                        <option value="available" ${p.status === 'available' ? 'selected' : ''}>متوفر 🟢</option>
                        <option value="reserved" ${p.status === 'reserved' ? 'selected' : ''}>قيد الحجز ⏳</option>
                        <option value="sold" ${p.status === 'sold' ? 'selected' : ''}>تم البيع 🔴</option>
                      </select>
                    </td>
                    <td>
                      <button class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem;" onclick="window.app.openDiscountModal('${p.id}')">
                        ${p.discountPercent > 0 ? `خصم ${p.discountPercent}%` : 'تفعيل خصم / توصيل مجاني'}
                      </button>
                    </td>
                    <td>
                      <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.openPosterModal('${p.id}')">📷 بوستر</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-merchant-add-product')?.addEventListener('click', () => this.openAddProductModal());
    document.getElementById('btn-merchant-settings')?.addEventListener('click', () => this.openMerchantSettingsModal(merchant));
    document.getElementById('btn-merchant-logout')?.addEventListener('click', () => {
      AuthService.logoutMerchant();
      this.render();
    });
  }

  openMerchantSettingsModal(merchant) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 520px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>⚙️</span>
            <span>إعدادات الحساب وتغيير كود الدخول</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم التاجر / المتجر *</label>
            <input type="text" class="form-input" id="m-set-name" value="${merchant.name}">
          </div>

          <div class="form-group">
            <label class="form-label">رقم هاتف الواتساب المعتمد *</label>
            <input type="tel" class="form-input" id="m-set-phone" value="${merchant.phone}">
          </div>

          <div class="form-group">
            <label class="form-label">رابط صفحة الفيسبوك</label>
            <input type="url" class="form-input" id="m-set-fb" value="${merchant.socials?.facebook || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">رابط حساب التيك توك</label>
            <input type="url" class="form-input" id="m-set-tt" value="${merchant.socials?.tiktok || ''}">
          </div>

          <div style="border-top: 1px solid var(--border-subtle); margin: 18px 0; padding-top: 14px;">
            <h4 style="font-weight: 800; margin-bottom: 10px; color: var(--brand-primary);">🔐 تغيير كود الدخول السري (مشفر ومحمي):</h4>
            
            <div class="form-group">
              <label class="form-label">كود الدخول الجديد (اتركه فارغاً إذا لم ترغب بالتغيير)</label>
              <input type="password" class="form-input" id="m-set-new-pass" placeholder="••••••••" autocomplete="new-password">
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-merchant-profile-act">💾 حفظ التعديلات</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-save-merchant-profile-act')?.addEventListener('click', async () => {
      const name = document.getElementById('m-set-name').value.trim();
      const phone = document.getElementById('m-set-phone').value.trim();
      const fb = document.getElementById('m-set-fb').value.trim();
      const tt = document.getElementById('m-set-tt').value.trim();
      const newPass = document.getElementById('m-set-new-pass').value.trim();

      if (!name || !phone) {
        this.showToast('يرجى ملء الاسم ورقم الهاتف', 'error');
        return;
      }

      const updatePayload = {
        name,
        phone,
        socials: { facebook: fb, tiktok: tt, whatsapp: `https://api.whatsapp.com/send?phone=964${phone.replace(/[^0-9]/g,'')}` }
      };

      if (newPass) {
        updatePayload.rawPasscode = newPass;
      }

      await AuthService.updateMerchant(merchant.id, updatePayload);
      modalOverlay.remove();
      this.render();
      this.showToast('تم حفظ وتشفير بيانات حساب التاجر بنجاح!', 'success');
    });
  }

  renderMerchantLogin() {
    this.appEl.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-app); padding: 20px;">
        <div class="modal-container" style="max-width: 440px; box-shadow: var(--card-shadow-hover);">
          <div class="modal-header">
            <div class="modal-title">
              <span>💼</span>
              <span>بوابة دخول التاجر</span>
            </div>
            <div class="modal-close" onclick="window.app.navigate('/')">✕</div>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">رقم الهاتف المعتمد</label>
              <input type="tel" class="form-input" id="m-login-phone" placeholder="07XXXXXXXXX" autocomplete="off">
            </div>

            <div class="form-group">
              <label class="form-label">كود الدخول السري</label>
              <input type="password" class="form-input" id="m-login-passcode" placeholder="••••" autocomplete="new-password">
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" id="btn-do-merchant-login">
              تسجيل الدخول للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-do-merchant-login')?.addEventListener('click', async () => {
      const phone = document.getElementById('m-login-phone').value.trim();
      const code = document.getElementById('m-login-passcode').value.trim();

      if (!phone || !code) {
        this.showToast('يرجى إدخال رقم الهاتف وكود الدخول', 'error');
        return;
      }

      const result = await AuthService.loginMerchant(phone, code);
      if (!result.success) {
        if (result.isBanned) {
          alert(`🚫 تم تجميد حسابك كتاجر!\nسبب الحظر: ${result.banReason}\nيرجى التواصل مع إدارة الموقع عبر الواتساب لحل النزاع.`);
        } else {
          this.showToast(result.message, 'error');
        }
        return;
      }

      this.render();
      this.showToast('مرحباً بك في لوحة تحكم متجرك!', 'success');
    });
  }

  /* ==========================================================================
     6. Add Product Modal (3-Images Cloud Upload + AI Auto Description)
     ========================================================================== */
  openAddProductModal() {
    const merchant = AuthService.getCurrentMerchant();
    const uploadedImagesList = [];
    let isAIActive = false;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 680px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>➕</span>
            <span>نشر بضاعة جديدة (رفع 3 صور + تخزين سحابي + ذكاء اصطناعي)</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <!-- 3-Image Upload Slots -->
          <label class="form-label" style="font-weight: 800;">📸 صور المنتج (ارفع حتى 3 صور مع ختم المنصة السحابي):</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;">
            ${[1, 2, 3].map(slot => `
              <div class="image-upload-zone" id="upload-slot-${slot}" style="padding: 14px 8px; text-align: center; cursor: pointer;">
                <div style="font-size: 1.6rem; margin-bottom: 4px;">📷</div>
                <div style="font-size: 0.75rem; font-weight: 800;">صورة ${slot} ${slot === 1 ? '(الرئيسية *)' : '(إضافية)'}</div>
                <input type="file" id="file-slot-input-${slot}" accept="image/*" style="display: none;">
                <div id="preview-slot-${slot}" style="display: none; aspect-ratio: 1/1; width: 100%; margin-top: 6px; border-radius: 6px; overflow: hidden;"></div>
              </div>
            `).join('')}
          </div>

          <div class="form-group">
            <label class="form-label">عنوان وموديل المنتج *</label>
            <input type="text" class="form-input" id="new-prod-title" placeholder="مثال: سماعات رأس لاسلكية Sony WH-1000XM4 عزل ضوضاء">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">السعر (د.ع) *</label>
              <input type="number" class="form-input" id="new-prod-price" placeholder="45000">
            </div>

            <div class="form-group">
              <label class="form-label">الكمية المتوفرة بالمخزون *</label>
              <input type="number" class="form-input" id="new-prod-qty" value="1" min="1">
            </div>

            <!-- Exact 4 Condition Choices -->
            <div class="form-group">
              <label class="form-label">حالة القطعة *</label>
              <select class="form-select" id="new-prod-condition">
                <option value="new">✨ جديد غير مفتوح (NEW)</option>
                <option value="open_box" selected>📦 أوبن بوكس (Open Box)</option>
                <option value="used">🔍 مستخدم (Used)</option>
                <option value="scrap">🔧 عاطل - أدوات (SCRAP)</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">القسم / التصنيف *</label>
            <select class="form-select" id="new-prod-cat">
              ${this.categories.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>

          <!-- AI Generator Action Button -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <label class="form-label" style="margin-bottom: 0;">وصف وتفاصيل المنتج:</label>
            <button type="button" class="btn btn-secondary" id="btn-generate-ai-desc" style="font-size: 0.78rem; padding: 4px 10px; font-weight: 800; color: #d97706; border-color: #f59e0b;">
              ✨ توليد شرح وتقييم بالذكاء الاصطناعي 🤖
            </button>
          </div>

          <div class="form-group">
            <textarea class="form-textarea" id="new-prod-desc" rows="5" placeholder="المواصفات، الملحقات، النظافة... أو اضغط الزر أعلاه للتوليد بالذكاء الاصطناعي"></textarea>
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
            <input type="checkbox" id="toggle-ai-insights" style="width: 18px; height: 18px;">
            <label for="toggle-ai-insights" style="font-weight: 700; font-size: 0.85rem;">🤖 إظهار بطاقة تقييم وتخمين السعر بالذكاء الاصطناعي للزبائن داخل صفحة المنتج</label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-new-product">نشر المنتج الآن 🚀</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Setup 3 upload slots
    [1, 2, 3].forEach(slot => {
      const dropZone = modalOverlay.querySelector(`#upload-slot-${slot}`);
      const fileInput = modalOverlay.querySelector(`#file-slot-input-${slot}`);
      const previewBox = modalOverlay.querySelector(`#preview-slot-${slot}`);

      dropZone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          dropZone.style.opacity = '0.5';
          const cloudUrl = await StorageService.processAndUploadImage(file, `slot_${slot}_${Date.now()}`);
          uploadedImagesList[slot - 1] = cloudUrl;
          dropZone.style.opacity = '1';
          previewBox.style.display = 'block';
          previewBox.innerHTML = `<img src="${cloudUrl}" style="width:100%; height:100%; object-fit:cover;">`;
        }
      });
    });

    // AI Description Generator Button
    modalOverlay.querySelector('#btn-generate-ai-desc')?.addEventListener('click', () => {
      const title = document.getElementById('new-prod-title').value.trim() || 'منتج بالة أمازون أصلي';
      const cat = document.getElementById('new-prod-cat').value;
      const cond = document.getElementById('new-prod-condition').value;

      const aiDesc = AIService.generateProductDescription(title, cat, cond);
      document.getElementById('new-prod-desc').value = aiDesc;
      document.getElementById('toggle-ai-insights').checked = true;
      isAIActive = true;
      this.showToast('تم توليد الشرح والمواصفات بالذكاء الاصطناعي بنجاح!', 'success');
    });

    modalOverlay.querySelector('#btn-save-new-product')?.addEventListener('click', () => {
      const title = document.getElementById('new-prod-title').value.trim();
      const price = Number(document.getElementById('new-prod-price').value);
      const quantity = Number(document.getElementById('new-prod-qty').value) || 1;
      const condition = document.getElementById('new-prod-condition').value;
      const category = document.getElementById('new-prod-cat').value;
      const description = document.getElementById('new-prod-desc').value.trim();
      const aiEnabled = document.getElementById('toggle-ai-insights').checked;

      if (!title || !price) {
        this.showToast('يرجى إدخال العنوان والسعر', 'error');
        return;
      }

      const validImages = uploadedImagesList.filter(Boolean);
      const primaryImage = validImages[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

      ProductsService.addProduct({
        title,
        price,
        quantity,
        condition,
        conditionLabel: PRODUCT_CONDITIONS[condition.toUpperCase()]?.label || condition,
        category,
        description: description || title,
        merchantId: merchant?.id || 'm-alwareth',
        merchantName: merchant?.name || 'أبو وارث أمازون',
        merchantPhone: merchant?.phone || '07707188166',
        image: primaryImage,
        images: validImages.length > 0 ? validImages : [primaryImage],
        aiEnabled: aiEnabled
      });

      modalOverlay.remove();
      this.render();
      this.showToast('تم حفظ ونشر المنتج مع الصور السحابية بنجاح!', 'success');
    });
  }

  changeProductStatus(productId, status) {
    ProductsService.updateProductStatus(productId, status);
    this.showToast(`تم تحديث حالة المنتج إلى: ${status === 'available' ? 'متوفر' : status === 'reserved' ? 'قيد الحجز' : 'تم البيع'}`, 'info');
  }

  openDiscountModal(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 440px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🏷️</span>
            <span>إعداد الخصم والتوصيل</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
            تطبيق عرض ترويجي على: <strong>${product.title}</strong>
          </p>

          <div class="form-group">
            <label class="form-label">نسبة الخصم المئوية (%)</label>
            <input type="number" class="form-input" id="discount-pct-val" min="0" max="90" value="${product.discountPercent || 0}">
          </div>

          <div style="display: flex; align-items: center; gap: 8px; margin-top: 12px;">
            <input type="checkbox" id="free-shipping-toggle" ${product.freeDelivery ? 'checked' : ''} style="width: 18px; height: 18px;">
            <label for="free-shipping-toggle" style="font-weight: 700; font-size: 0.9rem;">تفعيل التوصيل المجاني لهذا المنتج 🎁</label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-discount-act">حفظ التغييرات</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-save-discount-act')?.addEventListener('click', () => {
      const pct = Number(document.getElementById('discount-pct-val').value);
      const isFree = document.getElementById('free-shipping-toggle').checked;

      ProductsService.updateProductDiscount(productId, pct, isFree);
      modalOverlay.remove();
      this.render();
      this.showToast('تم تحديث إعدادات الخصم والتوصيل!', 'success');
    });
  }

  /* ==========================================================================
     7. Full 7-Module WordPress-Style Super Admin Dashboard (/hub-mgr-secure-x90)
     ========================================================================== */
  renderAdminPortal() {
    if (!AuthService.isAdminAuthenticated()) {
      this.renderAdminLogin();
      return;
    }

    const merchants = AuthService.getMerchants();
    const disputes = JSON.parse(localStorage.getItem('souk_disputes') || '[]');
    const allProducts = ProductsService.getProducts();

    this.appEl.innerHTML = `
      <div class="admin-layout-wrapper">
        <!-- Enterprise Admin Sidebar with 7 Modules -->
        <aside class="admin-sidebar">
          <div class="admin-brand-header">
            <span style="font-size: 1.5rem;">👑</span>
            <div>
              <h2>إدارة سوق البالات</h2>
              <span class="admin-brand-badge">SUPER ADMIN v3.0</span>
            </div>
          </div>

          <div class="admin-nav-list">
            <div class="admin-nav-item ${this.adminActiveTab === 'stats' ? 'active' : ''}" data-tab="stats">
              <span class="admin-nav-icon">📊</span>
              <span>1. الإحصائيات والإعدادات</span>
            </div>
            <div class="admin-nav-item ${this.adminActiveTab === 'merchants' ? 'active' : ''}" data-tab="merchants">
              <span class="admin-nav-icon">👥</span>
              <span>2. إدارة وحظر التجار</span>
            </div>
            <div class="admin-nav-item ${this.adminActiveTab === 'products' ? 'active' : ''}" data-tab="products">
              <span class="admin-nav-icon">📦</span>
              <span>3. الرقابة على المنتجات</span>
            </div>
            <div class="admin-nav-item ${this.adminActiveTab === 'categories' ? 'active' : ''}" data-tab="categories">
              <span class="admin-nav-icon">🗂️</span>
              <span>4. التصنيفات والأقسام</span>
            </div>
            <div class="admin-nav-item ${this.adminActiveTab === 'disputes' ? 'active' : ''}" data-tab="disputes">
              <span class="admin-nav-icon">📩</span>
              <span>5. مركز البلاغات (${disputes.filter(d => d.status === 'pending').length})</span>
            </div>
            <div class="admin-nav-item ${this.adminActiveTab === 'reviews' ? 'active' : ''}" data-tab="reviews">
              <span class="admin-nav-icon">⭐</span>
              <span>6. التقييمات والجودة</span>
            </div>
            <div class="admin-nav-item ${this.adminActiveTab === 'appearance' ? 'active' : ''}" data-tab="appearance">
              <span class="admin-nav-icon">🎨</span>
              <span>7. تخصيص مظهر الموقع</span>
            </div>

            <div class="admin-nav-item" onclick="window.app.navigate('/')" style="margin-top: 20px; border-top: 1px solid #1e293b;">
              <span class="admin-nav-icon">🛍️</span>
              <span>معاينة المتجر كزبون</span>
            </div>
            <div class="admin-nav-item" id="btn-admin-logout" style="color: #ef4444;">
              <span class="admin-nav-icon">🚪</span>
              <span>تسجيل الخروج</span>
            </div>
          </div>
        </aside>

        <!-- Admin Workspace Body -->
        <main class="admin-content-area">
          ${this.renderAdminTabContent(merchants, allProducts, disputes)}
        </main>
      </div>
    `;

    document.querySelectorAll('.admin-nav-item[data-tab]').forEach(el => {
      el.addEventListener('click', () => {
        this.adminActiveTab = el.dataset.tab;
        this.render();
      });
    });

    document.getElementById('btn-admin-logout')?.addEventListener('click', () => {
      AuthService.logoutAdmin();
      this.render();
    });

    this.attachAdminActionEvents();
  }

  renderAdminTabContent(merchants, allProducts, disputes) {
    switch (this.adminActiveTab) {
      case 'stats':
        return `
          <div class="admin-header-title">
            <h1>📊 الإحصائيات والإعدادات العامة للمنصة</h1>
          </div>

          <div class="merchant-stats-grid">
            <div class="merchant-stat-card">
              <span class="stat-label">🏪 إجمالي التجار المعتمدين</span>
              <span class="stat-value">${merchants.length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">📦 إجمالي البضائع بالمتجر</span>
              <span class="stat-value">${allProducts.length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">🚩 بلاغات الزبائن المعلقة</span>
              <span class="stat-value" style="color: #ef4444;">${disputes.filter(d => d.status === 'pending').length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">🚚 أجور التوصيل الحالية</span>
              <span class="stat-value" style="color: var(--brand-primary);">${Number(this.siteSettings.deliveryFee).toLocaleString()} د.ع</span>
            </div>
          </div>

          <div class="admin-card-section">
            <div class="admin-card-section-header">
              <div class="admin-card-section-title">⚙️ الإعدادات العامة السريعة</div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">أجور التوصيل الثابتة (د.ع)</label>
                <input type="number" class="form-input" id="cfg-delivery-fee" value="${this.siteSettings.deliveryFee}">
              </div>
              <div class="form-group">
                <label class="form-label">هاتف واتساب إدارة الموقع</label>
                <input type="text" class="form-input" id="cfg-support-phone" value="${this.siteSettings.supportPhone}">
              </div>
            </div>
            <button class="btn btn-primary" id="btn-save-general-settings" style="margin-top: 10px;">💾 حفظ الإعدادات</button>
          </div>

          <!-- Master Admin Key Change Card -->
          <div class="admin-card-section" style="border: 2px solid var(--brand-primary);">
            <div class="admin-card-section-header">
              <div class="admin-card-section-title">🔐 تغيير رمز الأمان السيادي للموقع (Master Admin Key)</div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
              تغيير الرمز السري الذي يمكنك من خلاله تسجيل الدخول إلى لوحة إدارة الموقع السيادية. يتم تشفير الرمز فوراً بخوارزمية SHA-256 المشفرة.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                <label class="form-label">رمز الأمان الحالي *</label>
                <input type="password" class="form-input" id="adm-cur-key" placeholder="••••••••" autocomplete="new-password">
              </div>
              <div class="form-group">
                <label class="form-label">رمز الأمان الجديد المطلوب *</label>
                <input type="password" class="form-input" id="adm-new-key" placeholder="••••••••" autocomplete="new-password">
              </div>
            </div>
            <button class="btn btn-primary" id="btn-change-master-key-act" style="margin-top: 10px;">🔐 تحديث رمز الإدارة السيادي</button>
          </div>
        `;

      case 'merchants':
        return `
          <div class="admin-header-title">
            <h1>👥 إدارة وحظر وتعديل بيانات التجار</h1>
            <button class="btn btn-primary" id="btn-admin-add-merchant">➕ إضافة تاجر جديد</button>
          </div>

          <div class="admin-table-container">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>التاجر</th>
                  <th>الهاتف</th>
                  <th>الأمان والرمز السري</th>
                  <th>الحالة</th>
                  <th>عدد البضائع</th>
                  <th>إجراءات التعديل والحظر</th>
                </tr>
              </thead>
              <tbody>
                ${merchants.map(m => `
                  <tr>
                    <td>
                      <div style="font-weight: 800; font-size: 0.95rem;">${m.name}</div>
                      <div style="font-size: 0.75rem; color: var(--text-tertiary);">${m.roleLabel || 'تاجر معتمد'}</div>
                    </td>
                    <td>${m.phone}</td>
                    <td>
                      <span style="font-size: 0.8rem; color: #10b981; font-weight: 700;">🔒 مشفر (SHA-256)</span>
                    </td>
                    <td>
                      <span class="badge ${m.status === 'active' ? 'badge-new' : 'badge-scrap'}">
                        ${m.status === 'active' ? 'نشط 🟢' : 'محظور 🔴'}
                      </span>
                    </td>
                    <td style="font-weight: 800;">${allProducts.filter(p => p.merchantId === m.id).length} قطعة</td>
                    <td>
                      <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.openEditMerchantModal('${m.id}')">✏️ تعديل / تعيين رمز</button>
                        ${m.status === 'active' ? `
                          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.promptBanMerchant('${m.id}')">🚫 حظر</button>
                        ` : `
                          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.unbanMerchant('${m.id}')">✅ تفعيل</button>
                        `}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

      case 'products':
        return `
          <div class="admin-header-title">
            <h1>📦 الرقابة الشاملة على كافة المنتجات والبضائع</h1>
          </div>

          <div class="admin-table-container">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>الصورة</th>
                  <th>العنوان والكود</th>
                  <th>التاجر</th>
                  <th>السعر</th>
                  <th>الكمية</th>
                  <th>الحالة</th>
                  <th>الإجراءات الرقابية</th>
                </tr>
              </thead>
              <tbody>
                ${allProducts.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; padding: 30px;">لا توجد أي بضائع منشورة حالياً في المنصة.</td></tr>
                ` : allProducts.map(p => `
                  <tr>
                    <td><img src="${p.image}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;"></td>
                    <td style="font-weight: 800; max-width: 250px;">
                      <div>${p.title}</div>
                      <div style="font-size: 0.72rem; color: var(--text-tertiary);">#${p.id}</div>
                    </td>
                    <td>${p.merchantName}</td>
                    <td style="font-weight: 800; font-family: var(--font-numbers);">${Number(p.price).toLocaleString()} د.ع</td>
                    <td style="font-weight: 800; color: #10b981;">${p.quantity || 1} قطعة</td>
                    <td>
                      <span class="badge ${p.status === 'available' ? 'badge-new' : p.status === 'reserved' ? 'badge-used' : 'badge-scrap'}">
                        ${p.status === 'available' ? 'متوفر 🟢' : p.status === 'reserved' ? 'محجوز ⏳' : 'تم البيع 🔴'}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.adminDeleteProduct('${p.id}')">🗑️ حذف البضاعة</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

      case 'categories':
        return `
          <div class="admin-header-title">
            <h1>🗂️ إدارة وتعديل أقسام وتصنيفات المتجر</h1>
            <button class="btn btn-primary" id="btn-admin-add-cat">➕ إضافة قسم جديد</button>
          </div>

          <div class="admin-table-container">
            <table class="admin-data-table">
              <thead>
                <tr>
                  <th>الأيقونة</th>
                  <th>اسم القسم</th>
                  <th>المعرف البرمجي (Slug)</th>
                  <th>عدد المنتجات الحالية</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                ${this.categories.map(c => `
                  <tr>
                    <td style="font-size: 1.4rem;">${c.icon}</td>
                    <td style="font-weight: 800;">${c.name}</td>
                    <td><code>${c.id}</code></td>
                    <td style="font-weight: 800;">${allProducts.filter(p => c.id === 'all' || p.category === c.id).length} قطعة</td>
                    <td>
                      ${c.id !== 'all' ? `
                        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.deleteCategory('${c.id}')">حذف</button>
                      ` : '<span style="color: var(--text-tertiary); font-size: 0.75rem;">(القسم الافتراضي الشامل)</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `;

      case 'disputes':
        return `
          <div class="admin-header-title">
            <h1>📩 مركز البلاغات وشكاوى الزبائن وتوثيق الصور</h1>
          </div>

          <div>
            ${disputes.length === 0 ? `
              <div class="admin-card-section" style="text-align: center; color: var(--text-secondary); padding: 40px;">
                🎉 لا توجد أي شكاوى أو بلاغات حالياً. كل العمليات تسير بانتظام!
              </div>
            ` : disputes.map(d => `
              <div class="dispute-ticket-card ${d.status === 'resolved' ? 'resolved' : ''}">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="font-weight: 900; font-size: 1rem; color: #dc2626;">🚩 بلاغ على: ${d.productTitle}</span>
                    <span class="badge ${d.status === 'pending' ? 'badge-scrap' : 'badge-new'}">${d.status === 'pending' ? 'قيد المتابعة ⏳' : 'تمت المعالجة ✅'}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 10px;">
                    التاجر المعني: <strong>${d.merchantName}</strong> (${d.merchantPhone}) | التاريخ: ${new Date(d.date).toLocaleString('ar-IQ')}
                  </div>
                  <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); font-size: 0.9rem; line-height: 1.6; margin-bottom: 10px;">
                    <strong>سبب الشكوى:</strong> ${d.reason}
                  </div>

                  ${d.proofImage ? `
                    <div style="margin-top: 8px;">
                      <strong>صورة الإثبات المرفقة:</strong><br>
                      <img src="${d.proofImage}" style="max-width: 140px; border-radius: 6px; border: 1px solid var(--border-strong); margin-top: 4px; cursor: pointer;" onclick="window.open('${d.proofImage}', '_blank')">
                    </div>
                  ` : ''}
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                  <button class="btn btn-whatsapp" style="font-size: 0.8rem;" onclick="window.open('https://api.whatsapp.com/send?phone=964${(d.merchantPhone||'').replace(/[^0-9]/g,'')}&text=${encodeURIComponent('السلام عليكم تاجرنا العزيز، تم استلام شكوى رسمية بخصوص المنتج ('+d.productTitle+') نرجو التوضيح فوراً.')}', '_blank')">
                    📲 مراسلة التاجر واتساب
                  </button>
                  ${d.status === 'pending' ? `
                    <button class="btn btn-danger" style="font-size: 0.8rem;" onclick="window.app.resolveDispute('${d.id}')">
                      ✅ إغلاق ومعالجة الشكوى
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;

      case 'reviews':
        return `
          <div class="admin-header-title">
            <h1>⭐ التقييمات ومراقبة جودة الخدمة</h1>
          </div>

          <div class="admin-card-section">
            <div class="admin-card-section-header">
              <div class="admin-card-section-title">⭐ مؤشرات رضا الزبائن</div>
            </div>
            <p style="color: var(--text-secondary); line-height: 1.7;">
              نظام التقييمات يمنح التجار الملتزمين أوسمة التميز، ويقوم برصد تقييمات الزبائن وتوثيق مصداقية بضائع الأوبن بوكس والبالات.
            </p>
          </div>
        `;

      case 'appearance':
        return `
          <div class="admin-header-title">
            <h1>🎨 تخصيص مظهر الموقع والإعلانات وشريط الأخبار</h1>
          </div>

          <div class="admin-card-section">
            <div class="form-group">
              <label class="form-label">نص شريط الإعلانات المتحرك العلوي (Top Marquee)</label>
              <input type="text" class="form-input" id="cfg-marquee" value="${this.siteSettings.marqueeText}">
            </div>

            <div class="form-group">
              <label class="form-label">عنوان البانر الرئيسي (Hero Title)</label>
              <input type="text" class="form-input" id="cfg-hero-title" value="${this.siteSettings.heroTitle}">
            </div>

            <div class="form-group">
              <label class="form-label">الوصف الإعلاني تحت العنوان (Hero Subtitle)</label>
              <textarea class="form-textarea" id="cfg-hero-sub">${this.siteSettings.heroSubtitle}</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">نص شريط التنبيه وإخلاء المسؤولية</label>
              <input type="text" class="form-input" id="cfg-disclaimer" value="${this.siteSettings.disclaimerText}">
            </div>

            <button class="btn btn-primary" id="btn-save-appearance-cfg" style="margin-top: 10px;">💾 حفظ ونشر التغييرات على المتجر فوراً</button>
          </div>
        `;

      default:
        return '';
    }
  }

  attachAdminActionEvents() {
    document.getElementById('btn-save-general-settings')?.addEventListener('click', () => {
      this.siteSettings.deliveryFee = Number(document.getElementById('cfg-delivery-fee').value);
      this.siteSettings.supportPhone = document.getElementById('cfg-support-phone').value.trim();
      localStorage.setItem('souk_site_settings', JSON.stringify(this.siteSettings));
      this.showToast('تم حفظ الإعدادات العامة بنجاح!', 'success');
    });

    document.getElementById('btn-change-master-key-act')?.addEventListener('click', async () => {
      const curKey = document.getElementById('adm-cur-key').value.trim();
      const newKey = document.getElementById('adm-new-key').value.trim();

      if (!curKey || !newKey) {
        this.showToast('يرجى إدخال الرمز الحالي والجديد', 'error');
        return;
      }

      const res = await AuthService.changeAdminMasterKey(curKey, newKey);
      if (res.success) {
        this.showToast(res.message, 'success');
        document.getElementById('adm-cur-key').value = '';
        document.getElementById('adm-new-key').value = '';
      } else {
        this.showToast(res.message, 'error');
      }
    });

    document.getElementById('btn-save-appearance-cfg')?.addEventListener('click', () => {
      this.siteSettings.marqueeText = document.getElementById('cfg-marquee').value.trim();
      this.siteSettings.heroTitle = document.getElementById('cfg-hero-title').value.trim();
      this.siteSettings.heroSubtitle = document.getElementById('cfg-hero-sub').value.trim();
      this.siteSettings.disclaimerText = document.getElementById('cfg-disclaimer').value.trim();
      localStorage.setItem('souk_site_settings', JSON.stringify(this.siteSettings));
      this.showToast('تم تحديث مظهر ونصوص المتجر بنجاح!', 'success');
    });

    document.getElementById('btn-admin-add-merchant')?.addEventListener('click', () => this.openAddMerchantModal());
    document.getElementById('btn-admin-add-cat')?.addEventListener('click', () => this.openAddCategoryModal());
  }

  openEditMerchantModal(merchantId) {
    const merchants = AuthService.getMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    if (!merchant) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 500px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>✏️</span>
            <span>تعديل بيانات التاجر وتعيين رمز جديد</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم التاجر / المتجر *</label>
            <input type="text" class="form-input" id="edit-m-name" value="${merchant.name}">
          </div>

          <div class="form-group">
            <label class="form-label">رقم الهاتف *</label>
            <input type="tel" class="form-input" id="edit-m-phone" value="${merchant.phone}">
          </div>

          <div class="form-group">
            <label class="form-label">تعيين كود دخول سري جديد (مشفر) *</label>
            <input type="password" class="form-input" id="edit-m-pass" placeholder="اتركه فارغاً إذا لم ترغب بتغيير الرمز" autocomplete="new-password">
          </div>

          <div class="form-group">
            <label class="form-label">صفحة الفيسبوك</label>
            <input type="url" class="form-input" id="edit-m-fb" value="${merchant.socials?.facebook || ''}">
          </div>

          <div class="form-group">
            <label class="form-label">حساب التيك توك</label>
            <input type="url" class="form-input" id="edit-m-tt" value="${merchant.socials?.tiktok || ''}">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-edited-merchant">حفظ التغييرات</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-save-edited-merchant')?.addEventListener('click', async () => {
      const name = document.getElementById('edit-m-name').value.trim();
      const phone = document.getElementById('edit-m-phone').value.trim();
      const passcode = document.getElementById('edit-m-pass').value.trim();
      const fb = document.getElementById('edit-m-fb').value.trim();
      const tt = document.getElementById('edit-m-tt').value.trim();

      if (!name || !phone) {
        this.showToast('يرجى ملء الاسم والهاتف', 'error');
        return;
      }

      const updateData = {
        name,
        phone,
        socials: { facebook: fb, tiktok: tt, whatsapp: `https://api.whatsapp.com/send?phone=964${phone.replace(/[^0-9]/g,'')}` }
      };

      if (passcode) {
        updateData.rawPasscode = passcode;
      }

      await AuthService.updateMerchant(merchantId, updateData);

      modalOverlay.remove();
      this.render();
      this.showToast('تم تحديث وتشفير بيانات التاجر بنجاح!', 'success');
    });
  }

  renderAdminLogin() {
    this.appEl.innerHTML = `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; padding: 20px;">
        <div class="modal-container" style="max-width: 420px; background: #1e293b; border-color: #334155;">
          <div class="modal-header" style="border-color: #334155;">
            <div class="modal-title" style="color: #f59e0b;">
              <span>👑</span>
              <span>دخول الإدارة السيادية للموقع</span>
            </div>
            <div class="modal-close" onclick="window.app.navigate('/')">✕</div>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" style="color: #f8fafc;">رمز الأمان الرئيسي (Master Admin Key)</label>
              <input type="password" class="form-input" id="admin-secret-key-input" placeholder="••••••••••••" autocomplete="new-password">
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" id="btn-do-admin-auth">
              التحقق والدخول للوحة التحكم
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-do-admin-auth')?.addEventListener('click', async () => {
      const key = document.getElementById('admin-secret-key-input').value.trim();
      if (!key) {
        this.showToast('يرجى إدخال رمز الأمان', 'error');
        return;
      }

      const isValid = await AuthService.loginAdmin(key);
      if (isValid) {
        this.render();
        this.showToast('تم التحقق بنجاح. أهلاً بك مدير الموقع!', 'success');
      } else {
        this.showToast('رمز الأمان غير صحيح', 'error');
      }
    });
  }

  promptBanMerchant(merchantId) {
    const reason = prompt('يرجى كتابة سبب الحظر الإلزامي الذي سيظهر للتاجر عند محاولة الدخول:');
    if (!reason) return;

    const merchants = AuthService.getMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    if (merchant) {
      merchant.status = 'banned';
      merchant.banReason = reason;
      localStorage.setItem('souk_merchants_v7', JSON.stringify(merchants));
      this.render();
      this.showToast(`تم حظر التاجر (${merchant.name}) بنجاح!`, 'info');
    }
  }

  unbanMerchant(merchantId) {
    const merchants = AuthService.getMerchants();
    const merchant = merchants.find(m => m.id === merchantId);
    if (merchant) {
      merchant.status = 'active';
      merchant.banReason = '';
      localStorage.setItem('souk_merchants_v7', JSON.stringify(merchants));
      this.render();
      this.showToast(`تم رفع الحظر عن التاجر (${merchant.name})!`, 'success');
    }
  }

  openAddMerchantModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 480px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>➕</span>
            <span>تسجيل تاجر جديد في المنصة</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">اسم التاجر / المتجر *</label>
            <input type="text" class="form-input" id="adm-m-name" placeholder="مثال: معرض الكرادة للبالات" autocomplete="off">
          </div>

          <div class="form-group">
            <label class="form-label">رقم الهاتف لاستلام الطلبات *</label>
            <input type="tel" class="form-input" id="adm-m-phone" placeholder="07XXXXXXXXX" autocomplete="off">
          </div>

          <div class="form-group">
            <label class="form-label">كود الدخول السري الممنوح للتاجر *</label>
            <input type="password" class="form-input" id="adm-m-passcode" placeholder="••••" autocomplete="new-password">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-adm-save-merchant">إضافة التاجر</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-adm-save-merchant')?.addEventListener('click', async () => {
      const name = document.getElementById('adm-m-name').value.trim();
      const phone = document.getElementById('adm-m-phone').value.trim();
      const passcode = document.getElementById('adm-m-passcode').value.trim();

      if (!name || !phone || !passcode) {
        this.showToast('يرجى ملء جميع الحقول', 'error');
        return;
      }

      const passcodeHash = await SecurityService.hashString(passcode);
      const merchants = AuthService.getMerchants();
      merchants.push({
        id: `m-${Date.now()}`,
        name,
        phone,
        passcodeHash,
        status: 'active',
        banReason: '',
        role: 'merchant',
        roleLabel: 'تاجر معتمد',
        socials: { tiktok: '', facebook: '', whatsapp: `https://api.whatsapp.com/send?phone=964${phone.replace(/[^0-9]/g,'')}` }
      });
      localStorage.setItem('souk_merchants_v7', JSON.stringify(merchants));

      modalOverlay.remove();
      this.render();
      this.showToast('تمت إضافة وتشفير حساب التاجر بنجاح!', 'success');
    });
  }

  openAddCategoryModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 440px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>➕</span>
            <span>إضافة قسم / تصنيف جديد</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">رمز الأيقونة (إيموجي) *</label>
            <input type="text" class="form-input" id="adm-cat-icon" placeholder="مثال: 🎮" value="📦">
          </div>

          <div class="form-group">
            <label class="form-label">اسم القسم بالعربي *</label>
            <input type="text" class="form-input" id="adm-cat-name" placeholder="مثال: ألعاب وفيديو جيم">
          </div>

          <div class="form-group">
            <label class="form-label">المعرف البرمجي (Slug بالإنجليزية) *</label>
            <input type="text" class="form-input" id="adm-cat-slug" placeholder="gaming">
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-adm-save-cat">حفظ القسم</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-adm-save-cat')?.addEventListener('click', () => {
      const icon = document.getElementById('adm-cat-icon').value.trim() || '📦';
      const name = document.getElementById('adm-cat-name').value.trim();
      const id = document.getElementById('adm-cat-slug').value.trim().toLowerCase();

      if (!name || !id) {
        this.showToast('يرجى كتابة الاسم والمعرف البرمجي', 'error');
        return;
      }

      this.categories.push({ id, name, icon });
      localStorage.setItem('souk_custom_categories', JSON.stringify(this.categories));

      modalOverlay.remove();
      this.render();
      this.showToast('تمت إضافة التصنيف الجديد بنجاح!', 'success');
    });
  }

  deleteCategory(catId) {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القسم؟')) {
      this.categories = this.categories.filter(c => c.id !== catId);
      localStorage.setItem('souk_custom_categories', JSON.stringify(this.categories));
      this.render();
      this.showToast('تم حذف القسم بنجاح', 'info');
    }
  }

  adminDeleteProduct(productId) {
    if (confirm('هل أنت متأكد من حذف هذه البضاعة نهائياً من المنصة؟')) {
      ProductsService.deleteProduct(productId);
      this.render();
      this.showToast('تم حذف المنتج نهائياً من المنصة', 'info');
    }
  }

  resolveDispute(disputeId) {
    let disputes = JSON.parse(localStorage.getItem('souk_disputes') || '[]');
    const d = disputes.find(item => item.id === disputeId);
    if (d) {
      d.status = 'resolved';
      localStorage.setItem('souk_disputes', JSON.stringify(disputes));
      this.render();
      this.showToast('تمت معالجة الشكوى وإغلاق التذكرة بنجاح', 'success');
    }
  }

  showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
}

// Initialize Application
window.app = new SoukApp();
