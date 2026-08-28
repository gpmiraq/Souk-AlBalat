/* ==========================================================================
   Souk-AlBalat Master App Engine
   Full Multi-Vendor Platform + 7-Module WordPress-Style Super Admin Dashboard
   Official Social Media SVGs | Direct Cloud CDN Storage | Deep Generative AI
   ========================================================================== */

import { APP_CONFIG, DEFAULT_CATEGORIES, PRODUCT_CONDITIONS, SOCIAL_ICONS } from './config/constants.js';
import { ProductsService } from './services/products.service.js';
import { CategoriesService } from './services/categories.service.js';
import { OrdersService, IRAQI_GOVERNORATES, isValidIraqiPhone } from './services/orders.service.js';
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

    // Dynamic Categories with live Firebase Sync
    this.categories = CategoriesService.getCategories();

    this.initTheme();
    this.initRouter();

    // Live Cloud Sync from Google Firebase Firestore
    Promise.all([
      ProductsService.syncFromCloud(),
      CategoriesService.syncFromCloud()
    ]).then(([products, cats]) => {
      this.categories = cats;
      this.render();
    });

    window.addEventListener('focus', () => {
      ProductsService.syncFromCloud().then(() => this.render());
    });
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
    const managePids = urlParams.get('pids') || urlParams.get('pid');

    if (path.startsWith('/m-manage-order') || managePids) {
      this.selectedProductId = null;
      this.selectedSellerId = null;
      this.renderMerchantOrderActionModal(managePids);
    } else if (path.startsWith('/seller/')) {
      this.selectedProductId = null;
      this.selectedSellerId = path.replace('/seller/', '');
      this.render();
    } else if (path.startsWith('/p/')) {
      this.selectedProductId = path.replace('/p/', '');
      this.selectedSellerId = null;
      this.render();
    } else {
      this.selectedProductId = null;
      this.selectedSellerId = null;
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
    } else if (this.selectedSellerId) {
      this.renderSellerStorePage(this.selectedSellerId);
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
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="btn-hamburger-menu" id="btn-toggle-mobile-drawer" title="القائمة والأقسام">
                <span>☰</span>
                <span>الأقسام</span>
              </button>
              <div class="header-brand" style="cursor:pointer;" id="nav-brand-logo">
                <div class="brand-logo-badge">
                  <span>⚡</span>
                  <span>سوق البالات</span>
                </div>
                <span class="brand-tagline">AMAZON & DHL OUTLET IQ</span>
              </div>
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

        <!-- Categories Horizontal Navigation -->
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

      <!-- Mobile Drawer Sidebar & Backdrop -->
      <div class="mobile-drawer-backdrop" id="mobile-drawer-backdrop"></div>
      <div class="mobile-drawer-sidebar" id="mobile-drawer-sidebar">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
          <div style="font-weight: 900; font-size: 1.05rem; display: flex; align-items: center; gap: 6px;">
            <span>📁</span>
            <span>أقسام وتصنيفات المتجر</span>
          </div>
          <button class="btn-icon" id="btn-close-mobile-drawer" style="font-size: 1.1rem; width: 32px; height: 32px; border-radius: 50%;">✕</button>
        </div>

        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px;">التصنيفات:</h4>
          ${activeCategories.map(c => `
            <div class="filter-list-item ${this.activeCategory === c.id ? 'active' : ''}" data-cat="${c.id}" style="padding: 10px 8px; margin-bottom: 4px;">
              <span>${c.name}</span>
              <span class="filter-count-badge">${products.filter(p => c.id === 'all' || p.category === c.id).length}</span>
            </div>
          `).join('')}
        </div>

        <div>
          <h4 style="font-size: 0.85rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 8px;">حالة الفحص:</h4>
          <div class="filter-list-item ${this.activeCondition === 'all' ? 'active' : ''}" data-cond="all" style="padding: 10px 8px; margin-bottom: 4px;">الكل</div>
          <div class="filter-list-item ${this.activeCondition === 'new' ? 'active' : ''}" data-cond="new" style="padding: 10px 8px; margin-bottom: 4px;">✨ جديد غير مفتوح (NEW)</div>
          <div class="filter-list-item ${this.activeCondition === 'open_box' ? 'active' : ''}" data-cond="open_box" style="padding: 10px 8px; margin-bottom: 4px;">📦 أوبن بوكس (Open Box)</div>
          <div class="filter-list-item ${this.activeCondition === 'used' ? 'active' : ''}" data-cond="used" style="padding: 10px 8px; margin-bottom: 4px;">🔍 مستخدم فحص</div>
          <div class="filter-list-item ${this.activeCondition === 'scrap' ? 'active' : ''}" data-cond="scrap" style="padding: 10px 8px; margin-bottom: 4px;">🔧 عاطل - أدوات (SCRAP)</div>
        </div>
      </div>

      <!-- Disclaimer Strip -->
      <div class="disclaimer-banner">
        ⚠️ ${this.siteSettings.disclaimerText}
      </div>

      <main class="container">
        <!-- Hero Section -->
        <section class="hero-section" style="margin-bottom: 20px;">
          <div class="hero-banner">
            <span class="hero-badge-tag">✨ أول منصة لبضائع أمازون والبالة في العراق 🇮🇶</span>
            <h1 class="hero-title">${this.siteSettings.heroTitle}</h1>
            <p class="hero-subtitle">${this.siteSettings.heroSubtitle}</p>
          </div>
        </section>

        <!-- Product Conditions 4 Main Cards (Placed at the TOP) -->
        <section style="margin-bottom: 24px;">
          <h3 style="font-weight: 900; font-size: 1.15rem; margin-bottom: 14px; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span>📖</span>
            <span>دليل وتصنيف حالات القطع في سوق البالات:</span>
          </h3>
          <div class="feature-filters-row">
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
          </div>
        </section>

        <!-- Marketplace Main Layout (Products Front & Center) -->
        <div class="main-marketplace-layout">
          <!-- Sidebar Filters (Desktop Only) -->
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

      <!-- Floating Green WhatsApp Button (Icon Only) -->
      <div class="floating-whatsapp-btn" id="btn-floating-support" title="خدمة العملاء والدعم الفني">
        ${SOCIAL_ICONS.WHATSAPP}
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

          <!-- Quick Share Link Button -->
          <button class="product-share-btn-mini" onclick="event.stopPropagation(); window.app.copyProductShareLink('${p.id}')" title="مشاركة ونسخ رابط المنتج">
            🔗 مشاركة
          </button>

          <!-- Poster Generator Button -->
          <button class="product-poster-btn-mini" onclick="event.stopPropagation(); window.app.openPosterModal('${p.id}')" title="توليد بوستر ستوري">
            📷 بوستر
          </button>
        </div>

        <div class="product-card-body">
          <div class="product-merchant-link" style="cursor: pointer; display: flex; align-items: center; gap: 4px;" onclick="event.stopPropagation(); window.app.navigate('/seller/${p.merchantId || 'm-alwareth'}')">
            <span>🏪 ${p.merchantName || 'أبو وارث أمازون'}</span>
            ${SOCIAL_ICONS.VERIFIED_BADGE}
            ${Number(p.quantity) > 1 ? `<span style="color: #10b981; font-weight: 800;">(متوفر: ${p.quantity} قطع)</span>` : ''}
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
              <button class="btn btn-secondary" disabled>❌ مباعة بالكامل</button>
            ` : isReserved ? `
              <button class="btn btn-secondary" style="background: #fffbeb; color: #b45309; border: 1.5px solid #fde68a; font-weight: 800;" onclick="event.stopPropagation(); window.app.openReservedProductInquiryModal('${p.id}')">
                ⏳ قيد الحجز (استفسر من البائع)
              </button>
              <button class="btn btn-secondary" onclick="window.app.navigate('/p/${p.id}')">تفاصيل القطعة</button>
            ` : `
              <button class="btn btn-primary" onclick="window.app.addToCart('${p.id}')">🛒 أضف للسلة</button>
              <button class="btn btn-secondary" onclick="window.app.navigate('/p/${p.id}')">تفاصيل القطعة</button>
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
      this.searchQuery = document.getElementById('search-keyword-input')?.value || '';
      this.render();
    });

    document.getElementById('search-keyword-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.searchQuery = e.target.value;
        this.render();
      }
    });

    // Mobile Drawer Toggle
    const drawer = document.getElementById('mobile-drawer-sidebar');
    const backdrop = document.getElementById('mobile-drawer-backdrop');

    const openDrawer = () => {
      drawer?.classList.add('active');
      backdrop?.classList.add('active');
    };

    const closeDrawer = () => {
      drawer?.classList.remove('active');
      backdrop?.classList.remove('active');
    };

    document.getElementById('btn-toggle-mobile-drawer')?.addEventListener('click', openDrawer);
    document.getElementById('btn-close-mobile-drawer')?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);

    document.querySelectorAll('.category-pill, .filter-list-item[data-cat]').forEach(el => {
      el.addEventListener('click', () => {
        this.activeCategory = el.dataset.cat;
        closeDrawer();
        this.render();
      });
    });

    document.querySelectorAll('.feature-card[data-cond], .filter-list-item[data-cond]').forEach(el => {
      el.addEventListener('click', () => {
        this.activeCondition = el.dataset.cond;
        closeDrawer();
        this.render();
      });
    });

    document.getElementById('btn-floating-support')?.addEventListener('click', () => {
      this.openSupportInquiryModal();
    });
  }

  /* ==========================================================================
     Dedicated Seller Store Page (/seller/:id)
     ========================================================================== */
  async renderSellerStorePage(sellerId) {
    if (ProductsService.getProducts().length === 0) {
      await ProductsService.syncFromCloud();
    }

    const merchant = AuthService.getMerchantById(sellerId) || {
      id: 'm-alwareth',
      slug: 'alwareth',
      name: 'أبو وارث أمازون',
      phone: '07707188166',
      bio: 'الوكيل الحصري لبضائع أمازون والبالات وطرود DHL في العراق. فحص وتجربة وضمان حقيقي.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      socials: {
        facebook: 'https://www.facebook.com/gpm90',
        tiktok: 'https://www.tiktok.com/@alwareth_amazon',
        whatsapp: 'https://api.whatsapp.com/send?phone=9647707188166'
      }
    };

    const sellerProducts = ProductsService.getProducts().filter(p => p.merchantId === sellerId || p.merchantName?.includes('أبو وارث') || !p.merchantId);

    this.appEl.innerHTML = `
      <!-- Top Announcement Marquee -->
      <div class="top-announcement-bar">
        <div class="container">
          <div class="marquee-content">
            <span class="marquee-item">${this.siteSettings.marqueeText}</span>
          </div>
        </div>
      </div>

      <!-- Prominent Header -->
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
              <button class="btn btn-secondary" onclick="window.app.toggleTheme()" title="تبديل المظهر">
                ${this.currentTheme === 'dark' ? '☀️' : '🌙'}
              </button>
              <button class="btn btn-primary cart-btn-indicator" id="btn-open-cart">
                <span>🛒 السلة</span>
                ${this.cart.length > 0 ? `<span class="cart-badge-count">${this.cart.length}</span>` : ''}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="container" style="padding: 24px 0 60px;">
        <!-- Breadcrumb -->
        <nav class="breadcrumb-nav" style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-size: 0.88rem;">
          <span class="breadcrumb-item" onclick="window.app.navigate('/')" style="cursor:pointer; color: var(--text-secondary);">الرئيسية</span>
          <span>/</span>
          <span class="breadcrumb-item active" style="font-weight: 800; color: var(--brand-primary); display: inline-flex; align-items: center; gap: 4px;">
            متجر ${merchant.name} ${SOCIAL_ICONS.VERIFIED_BADGE}
          </span>
        </nav>

        <!-- Seller Store Banner Card (Avatar Centered Above Name) -->
        <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98)); border: 1.5px solid var(--border-strong); padding: 30px 20px; border-radius: var(--radius-lg); margin-bottom: 28px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 14px; box-shadow: var(--card-shadow);">
          <!-- Circular Avatar Directly Above Name -->
          <img src="${merchant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'}" style="width: 88px; height: 88px; border-radius: 50%; object-fit: cover; border: 3.5px solid #f59e0b; box-shadow: 0 4px 20px rgba(245,158,11,0.4);" alt="${merchant.name}">
          
          <div>
            <div style="font-size: 1.5rem; font-weight: 900; color: #ffffff; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;">
              <span>🏪 ${merchant.name}</span>
              ${SOCIAL_ICONS.VERIFIED_BADGE}
              <span class="badge" style="background: #fef08a; color: #854d0e; font-size: 0.8rem; font-weight: 800;">👑 مدير ومؤسس الموقع</span>
            </div>
            ${merchant.bio ? `<p style="color: #cbd5e1; max-width: 600px; margin: 8px auto 0; font-size: 0.92rem; line-height: 1.6;">${merchant.bio}</p>` : ''}
            <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 8px; display: flex; gap: 14px; justify-content: center; align-items: center; flex-wrap: wrap;">
              <span>📞 واتساب: <strong style="color:#ffffff;">${merchant.phone}</strong></span>
              <span>•</span>
              <span>📦 المعروض: <strong style="color:#ffffff;">${sellerProducts.length} قطعة</strong></span>
              ${merchant.slug ? `<span>•</span><span style="direction: ltr; font-family: var(--font-numbers); color: #f59e0b; font-weight: 700;">souk-al-balat.vercel.app/seller/${merchant.slug}</span>` : ''}
            </div>
          </div>

          <!-- Social Links & Store Poster Generator -->
          <div style="display: flex; gap: 10px; align-items: center; justify-content: center; flex-wrap: wrap; margin-top: 6px;">
            <button class="btn btn-secondary" id="btn-generate-seller-poster" style="padding: 9px 16px; font-size: 0.88rem; font-weight: 800; color: #d97706; border-color: #f59e0b; background: rgba(245, 158, 11, 0.12);">
              📷 توليد بوستر المتجر 📱
            </button>
            <a href="${merchant.socials?.facebook || 'https://www.facebook.com/gpm90'}" target="_blank" class="btn btn-secondary" style="padding: 8px 14px; font-size: 0.85rem; font-weight: 700; color: #1877f2;">
              ${SOCIAL_ICONS.FACEBOOK} فيسبوك
            </a>
            <a href="${merchant.socials?.tiktok || 'https://www.tiktok.com/@alwareth_amazon'}" target="_blank" class="btn btn-secondary" style="padding: 8px 14px; font-size: 0.85rem; font-weight: 700;">
              ${SOCIAL_ICONS.TIKTOK} تيك توك
            </a>
            <a href="https://api.whatsapp.com/send?phone=964${(merchant.phone || '07707188166').replace(/[^0-9]/g,'').slice(-10)}" target="_blank" class="btn btn-whatsapp" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 800;">
              ${SOCIAL_ICONS.WHATSAPP} محادثة واتساب
            </a>
          </div>
        </div>

        <div class="products-header-bar">
          <span class="products-count-label">بضائع التاجر المعروضة (${sellerProducts.length} قطعة)</span>
        </div>

        ${sellerProducts.length === 0 ? `
          <div style="background: var(--bg-surface); border: 1px solid var(--border-strong); border-radius: var(--radius-lg); padding: 50px 20px; text-align: center;">
            <h3>لا توجد بضائع معروضة حالياً لهذا التاجر</h3>
          </div>
        ` : `
          <div class="products-grid">
            ${sellerProducts.map(p => this.renderProductCard(p)).join('')}
          </div>
        `}
      </main>

      <!-- Floating WhatsApp Button -->
      <div class="floating-whatsapp-btn" id="btn-floating-support" title="خدمة العملاء">${SOCIAL_ICONS.WHATSAPP}</div>
    `;

    document.getElementById('btn-open-cart')?.addEventListener('click', () => this.openCartModal());
    document.getElementById('btn-generate-seller-poster')?.addEventListener('click', () => {
      this.openStorePosterModal(merchant, sellerProducts);
    });
    document.getElementById('btn-floating-support')?.addEventListener('click', () => this.openSupportInquiryModal());
  }

  /* ==========================================================================
     Reserved Product Customer Inquiry Modal
     ========================================================================== */
  openReservedProductInquiryModal(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 480px; text-align: center;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <span>⏳</span>
            <span>تنبيه: القطعة قيد الحجز حالياً</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body" style="padding: 20px;">
          <div style="font-size: 3rem; margin-bottom: 8px;">⏳🛍️</div>
          <h3 style="font-size: 1.15rem; font-weight: 900; color: var(--text-primary); margin-bottom: 8px;">
            هذه القطعة تم حجزها مؤقتاً لزبون آخر!
          </h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.7; margin-bottom: 16px;">
            مرحباً بك! هذه القطعة تم طلب حجزها قبل قليل وهي قيد تأكيد الدفع أو الفحص. في حال عدم إتمام الشراء، قد تصبح متوفرة مرة أخرى. يمكنك الاستفسار المباشر من التاجر عبر الواتساب لمعرفة حالة توفرها الآن.
          </p>

          <!-- Product Mini Card -->
          <div style="background: var(--bg-surface-subtle); border: 1.5px solid var(--border-strong); border-radius: var(--radius-md); padding: 12px; display: flex; gap: 12px; align-items: center; text-align: right; margin-bottom: 20px;">
            <img src="${product.image}" style="width: 56px; height: 56px; border-radius: 8px; object-fit: cover;" alt="${product.title}">
            <div style="flex: 1;">
              <h4 style="font-size: 0.9rem; font-weight: 800; color: var(--text-primary); line-height: 1.3;">${product.title}</h4>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; font-size: 0.82rem;">
                <span style="font-weight: 900; color: #dc2626;">${Number(product.price).toLocaleString()} د.ع</span>
                <span style="color: var(--text-secondary);">🏪 ${product.merchantName || 'أبو وارث أمازون'}</span>
              </div>
            </div>
          </div>

          <button class="btn btn-whatsapp" id="btn-inquire-reserved-wa" style="width: 100%; padding: 14px; font-size: 1.02rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${SOCIAL_ICONS.WHATSAPP}
            <span>مراسلة التاجر للاستفسار عن توفر القطعة 💬</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-inquire-reserved-wa')?.addEventListener('click', () => {
      modalOverlay.remove();
      const cleanPhone = (product.merchantPhone || '07707188166').replace(/[^0-9]/g, '');
      const origin = window.location.origin;
      let msg = `السلام عليكم ورحمة الله،\n`;
      msg += `بخصوص المنتج: *${product.title}*\n`;
      msg += `رابط المنتج: ${origin}/p/${product.id}\n`;
      msg += `السعر: ${Number(product.price).toLocaleString()} د.ع\n\n`;
      msg += `هل ما زال المنتج متوفراً لديكم أم تم تأكيد بيعه للزبون السابق؟`;

      const waPhone = cleanPhone.startsWith('0') ? '964' + cleanPhone.slice(1) : (cleanPhone.startsWith('964') ? cleanPhone : '964' + cleanPhone);
      window.open(`https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(msg)}`, '_blank');
    });
  }

  /* ==========================================================================
     Inquiry Modal for Floating Support WhatsApp Button
     ========================================================================== */
  openSupportInquiryModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 440px; text-align: center;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <span>💬</span>
            <span>خدمة العملاء والاستفسارات</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>
        <div class="modal-body" style="padding: 24px 20px;">
          <div style="font-size: 3.2rem; margin-bottom: 12px;">🏪👋</div>
          <h3 style="font-size: 1.18rem; font-weight: 900; color: var(--text-primary); margin-bottom: 8px;">أهلاً بك في منصة سوق البالات</h3>
          <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.75; margin-bottom: 20px;">
            فريق خدمة العملاء وإدارة المنصة متواجد لمساعدتكم والإجابة عن كافة استفساراتكم عبر الواتساب.
          </p>
          <button class="btn btn-whatsapp" style="width: 100%; padding: 14px; font-size: 1.05rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;" id="btn-confirm-support-wa">
            ${SOCIAL_ICONS.WHATSAPP}
            <span>بدء المحادثة عبر واتساب الآن</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelector('#btn-confirm-support-wa')?.addEventListener('click', () => {
      modalOverlay.remove();
      const phone = (this.siteSettings.supportPhone || '07707188166').replace(/[^0-9]/g, '');
      const waPhone = phone.startsWith('0') ? '964' + phone.slice(1) : (phone.startsWith('964') ? phone : '964' + phone);
      const text = encodeURIComponent('السلام عليكم إدارة سوق البالات، أحتاج استفسار ومساعدة بخصوص الموقع.');
      window.open(`https://api.whatsapp.com/send?phone=${waPhone}&text=${text}`, '_blank');
    });
  }

  /* ==========================================================================
     2. Dedicated Full-Page Product View (/p/:id) with Official Brand Icons & Gallery
     ========================================================================== */
  async renderProductPage(productId) {
    let product = ProductsService.getProductById(productId);
    if (!product) {
      await ProductsService.syncFromCloud();
      product = ProductsService.getProductById(productId);
    }

    if (!product || product.status === 'deleted') {
      this.renderProduct404Page();
      return;
    }

    const imagesList = product.images?.length > 0 ? product.images : [product.image];
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
        <nav class="breadcrumb-nav" style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-size: 0.88rem; flex-wrap: wrap;">
          <span class="breadcrumb-item" onclick="window.app.navigate('/')" style="cursor:pointer; color: var(--text-secondary);">الرئيسية</span>
          <span>/</span>
          <span class="breadcrumb-item" onclick="window.app.activeCategory='${product.category}'; window.app.navigate('/')" style="cursor:pointer; color: var(--text-secondary);">${product.category}</span>
          <span>/</span>
          <span class="breadcrumb-item" onclick="window.app.navigate('/seller/${product.merchantId || 'alwareth'}')" style="cursor:pointer; color: var(--brand-primary); font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">
            ${product.merchantName || 'أبو وارث أمازون'} ${SOCIAL_ICONS.VERIFIED_BADGE}
          </span>
          <span>/</span>
          <span class="breadcrumb-item active" style="font-weight: 800; color: var(--text-primary);">${product.title}</span>
        </nav>

        <div class="product-page-main-layout">
          <!-- 1. Right Column: Media Gallery -->
          <div class="product-gallery-view">
            <div class="main-gallery-image-box" style="position: relative;">
              <img src="${imagesList[0]}" id="main-gallery-view-img" alt="${product.title}">
              
              <!-- Quick Copy Link & Fullscreen Action Badges -->
              <div class="gallery-action-overlay">
                <button class="btn-gallery-action" onclick="window.app.copyProductShareLink('${product.id}')" title="نسخ رابط المنتج">🔗</button>
                <button class="btn-gallery-action" onclick="window.app.openPosterModal('${product.id}')" title="توليد بوستر ستوري">📱</button>
              </div>
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

          <!-- 2. Middle Column: Product Details & Official Brand Social Icons -->
          <div class="product-middle-info">
            <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; background: var(--bg-surface-subtle); padding: 10px 14px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;" onclick="window.app.navigate('/seller/${product.merchantId || 'alwareth'}')">
                <span style="font-weight: 900; color: var(--text-primary); font-size: 0.95rem;">🏪 ${product.merchantName || 'أبو وارث أمازون'}</span>
                ${SOCIAL_ICONS.VERIFIED_BADGE}
                <span class="badge" style="background: #fef08a; color: #854d0e; font-weight: 800;">👑 مدير الموقع</span>
              </div>

              <!-- Official Vector Brand Logos for Social Media -->
              <div style="display: flex; align-items: center; gap: 12px;">
                <a href="https://www.facebook.com/gpm90" target="_blank" title="صفحة الفيسبوك الرسمية" style="display: flex; align-items: center; text-decoration: none; padding: 4px; border-radius: 6px; background: rgba(24, 119, 242, 0.08);">
                  ${SOCIAL_ICONS.FACEBOOK}
                </a>
                <a href="https://www.tiktok.com/@alwareth_amazon" target="_blank" title="حساب تيك توك الرسمي" style="display: flex; align-items: center; text-decoration: none; padding: 4px; border-radius: 6px; background: rgba(0, 0, 0, 0.06);">
                  ${SOCIAL_ICONS.TIKTOK}
                </a>
                <a href="https://api.whatsapp.com/send?phone=9647707188166" target="_blank" title="محادثة واتساب مباشرة" style="display: flex; align-items: center; text-decoration: none; padding: 4px; border-radius: 6px; background: rgba(37, 211, 102, 0.08);">
                  ${SOCIAL_ICONS.WHATSAPP}
                </a>
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
              <span>توصيل سريع لكافة محافظات العراق (أجور التوصيل: ${product.freeDelivery ? 'مجاني 🎁' : '5,000 د.ع فقط'})</span>
            </div>

            <!-- 1. Merchant Manual Description (if provided) -->
            ${product.description ? `
              <div style="background: var(--bg-surface-subtle); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 14px;">
                <h4 style="font-weight: 900; margin-bottom: 8px; color: var(--text-primary); font-size: 1rem;">📝 تفاصيل وملاحظات التاجر:</h4>
                <p style="color: var(--text-secondary); line-height: 1.8; font-size: 0.95rem; white-space: pre-line;">${product.description}</p>
              </div>
            ` : ''}

            <!-- 2. AI Generated Details Box with 4 lines and permanent footer notice -->
            ${product.aiDetails ? `
              <div style="background: var(--bg-surface-subtle); padding: 18px; border-radius: var(--radius-md); border: 1.5px solid var(--border-strong); margin-bottom: 14px;">
                <h4 style="font-weight: 900; margin-bottom: 10px; color: var(--text-primary); font-size: 1.05rem; display: flex; align-items: center; gap: 6px;">
                  <span>🤖 تفاصيل ومواصفات الذكاء الاصطناعي:</span>
                </h4>
                <div style="color: var(--text-primary); line-height: 2; font-size: 0.95rem; white-space: pre-line; font-weight: 500;">${product.aiDetails}</div>
                <div style="font-size: 0.8rem; color: var(--text-tertiary); margin-top: 12px; border-top: 1px dashed var(--border-subtle); padding-top: 8px;">
                  ملاحظة: هذه معلومات مستخرجة عبر محرك الذكاء الاصطناعي بناءً على أسعار السوق التقديرية... يرجى التأكد المباشر من البائع.
                </div>
              </div>
            ` : ''}

            <!-- Buy Box Action Buttons -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
              ${product.status === 'sold' ? `
                <button class="btn btn-secondary" style="width: 100%; padding: 14px; font-size: 1.05rem;" disabled>❌ هذه القطعة مباعة بالكامل</button>
              ` : (product.status === 'reserved' || Number(product.quantity) === 0) ? `
                <div style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: var(--radius-md); padding: 10px 14px; color: #92400e; font-weight: 800; font-size: 0.88rem; text-align: center;">
                  ⏳ هذه القطعة قيد الحجز مؤقتاً لزبون آخر
                </div>
                <button class="btn btn-whatsapp" style="width: 100%; padding: 12px; font-size: 1rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.app.openReservedProductInquiryModal('${product.id}')">
                  ${SOCIAL_ICONS.WHATSAPP}
                  <span>💬 استفسار عن توفر القطعة عبر واتساب</span>
                </button>
              ` : `
                <button class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1.05rem; font-weight: 900;" onclick="window.app.addToCart('${product.id}')">
                  🛒 أضف إلى السلة
                </button>

                <button class="btn btn-whatsapp" style="width: 100%; padding: 12px; font-size: 1rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px;" onclick="window.app.openWhatsAppDirectOrder('${product.id}')">
                  ${SOCIAL_ICONS.WHATSAPP}
                  <span>اشترِ الآن عبر واتساب</span>
                </button>
              `}

              <button class="btn btn-secondary" style="width: 100%; padding: 10px; font-weight: 800;" onclick="window.app.openPosterModal('${product.id}')">
                📷 بطاقة بوستر تسويقي 📱
              </button>
            </div>

            <!-- Trust Icons -->
            <div style="display: flex; justify-content: space-around; gap: 12px; padding: 14px 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); margin-top: 10px; flex-wrap: wrap; border: 1px solid var(--border-subtle); font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>🛡️</span>
                <span>فحص وضمان الجودة 100%</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span>🚚</span>
                <span>توصيل لكافة محافظات العراق</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
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

  copyProductShareLink(productId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://souk-al-balat.vercel.app';
    const link = `${origin}/p/${productId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    if (navigator.share) {
      navigator.share({
        title: 'سوق البالات | بضائع أمازون والبالة',
        text: 'شاهد هذا المنتج المميز على سوق البالات',
        url: link
      }).catch(() => {});
    }
    this.showToast('تم نسخ ومشاركة رابط المنتج بنجاح! 🔗', 'success');
  }

  openWhatsAppDirectOrder(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    // Decrement stock in catalog
    ProductsService.decrementStock(productId, 1);

    const cleanPhone = (product.merchantPhone || '07707188166').replace(/[^0-9]/g, '');
    const origin = window.location.origin;
    const itemPrice = Number(product.price) || 0;
    const deliveryFee = APP_CONFIG.FIXED_DELIVERY_FEE;
    const grandTotal = itemPrice + deliveryFee;

    let msg = `⚡ *طلب حجز بضاعة جديد من سوق البالات*\n\n`;
    msg += `رقم المنتج : 1\n`;
    msg += `اسم المنتج : ${product.title}\n`;
    msg += `رابط المنتج : ${origin}/p/${product.id}\n`;
    msg += `السعر : ${itemPrice.toLocaleString()} د.ع\n\n`;

    msg += `──────────────────────\n`;
    msg += `التوصيل : ${deliveryFee.toLocaleString()} د.ع لكافة محافظات العراق\n`;
    msg += `*السعر الكلي : ${grandTotal.toLocaleString()} د.ع*\n\n`;
    msg += `⚠️ *ملاحظة :* يجب فحص المنتج امام المندوب ولا يتحمل البائع مسؤولية سعر التوصيل في حال مغادرة المندوب.\n\n`;

    msg += `──────────────────────\n`;
    msg += `🔐 *كود تأكيد البائع:* ${origin}/m-manage-order?pid=${product.id}`;

    const waPhone = cleanPhone.startsWith('0') ? '964' + cleanPhone.slice(1) : (cleanPhone.startsWith('964') ? cleanPhone : '964' + cleanPhone);
    window.open(`https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(msg)}`, '_blank');
    this.render();
  }

  /* ==========================================================================
     404 / Unavailable Product Page with 5-Second Countdown Auto-Redirect
     ========================================================================== */
  renderProduct404Page() {
    let secondsLeft = 5;
    if (this.redirectTimer) clearInterval(this.redirectTimer);

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
              <button class="btn btn-primary" onclick="window.app.navigate('/')">⬅️ العودة للمتجر</button>
            </div>
          </div>
        </div>
      </header>

      <main class="container" style="padding: 60px 20px; text-align: center; max-width: 600px; margin: 0 auto;">
        <div style="background: var(--bg-surface); border: 2px solid var(--border-strong); border-radius: var(--radius-lg); padding: 40px 24px; box-shadow: var(--card-shadow);">
          <div style="font-size: 4rem; margin-bottom: 16px;">📦🔍</div>
          <h1 style="font-size: 1.5rem; font-weight: 900; color: #dc2626; margin-bottom: 10px;">404 - المنتج غير متوفر أو تم بيعه</h1>
          <p style="color: var(--text-secondary); font-size: 1rem; line-height: 1.7; margin-bottom: 20px;">
            عذراً، هذه القطعة لم تعد متوفرة حالياً في المخزون أو تم حذفها/بيعها مسبقاً. يمكنك تصفح باقي البضائع والقطع المميزة في المتجر.
          </p>

          <div style="background: var(--bg-surface-subtle); padding: 12px; border-radius: var(--radius-md); font-weight: 800; color: var(--text-primary); margin-bottom: 24px; border: 1.5px dashed var(--border-strong);">
            ⏳ سيتم تحويلك تلقائياً إلى الصفحة الرئيسية خلال <span id="redirect-countdown-number" style="color: #dc2626; font-size: 1.3rem;">5</span> ثوانٍ...
          </div>

          <button class="btn btn-primary" style="padding: 12px 24px; font-size: 1rem; font-weight: 900;" onclick="window.app.navigate('/')">
            العودة إلى الصفحة الرئيسية الآن ⚡
          </button>
        </div>
      </main>
    `;

    this.redirectTimer = setInterval(() => {
      secondsLeft -= 1;
      const el = document.getElementById('redirect-countdown-number');
      if (el) el.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(this.redirectTimer);
        this.navigate('/');
      }
    }, 1000);
  }

  /* ==========================================================================
     3. Secret Merchant Quick-Action Modal (/m-manage-order?pids=...)
     ========================================================================== */
  renderMerchantOrderActionModal(productIds) {
    const ids = Array.isArray(productIds) ? productIds : String(productIds || '').split(',').map(s => s.trim()).filter(Boolean);
    const merchant = AuthService.getCurrentMerchant();

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
          this.renderMerchantOrderActionModal(ids);
        } else {
          this.showToast(res.message, 'error');
        }
      });
      return;
    }

    const products = ids.map(id => ProductsService.getProductById(id)).filter(Boolean);

    if (products.length === 0) {
      this.showToast('المنتجات المطلوبة غير موجودة', 'error');
      this.navigate('/v-space-k90');
      return;
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <span>⚙️</span>
            <span>إدارة طلبية الواتساب (${products.length} منتجات)</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove(); window.app.navigate('/v-space-k90')">✕</div>
        </div>

        <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 14px;">
            حدد الإجراء المطلوب لكل منتج في الطلبية (تأكيد البيع أو إعادة الإتاحة للبيع كمتوفر):
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
            ${products.map(p => `
              <div style="background: var(--bg-surface-subtle); border: 1.5px solid var(--border-strong); border-radius: var(--radius-md); padding: 12px; display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; gap: 10px; align-items: center;">
                  <img src="${p.image}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover;">
                  <div style="flex: 1;">
                    <h4 style="font-weight: 800; font-size: 0.9rem; line-height: 1.3;">${p.title}</h4>
                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
                      السعر: <strong style="color: #dc2626;">${Number(p.price).toLocaleString()} د.ع</strong> |
                      الحالة: <span class="badge ${p.status === 'available' ? 'badge-new' : p.status === 'reserved' ? 'badge-used' : 'badge-scrap'}" id="badge-status-${p.id}">${p.status === 'available' ? 'متوفر 🟢' : p.status === 'reserved' ? 'قيد الحجز ⏳' : 'تم البيع 🔴'}</span>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                  <button class="btn btn-danger btn-item-mark-sold" data-id="${p.id}" style="font-size: 0.78rem; padding: 6px 12px; font-weight: 800;">
                    🔴 تم البيع
                  </button>
                  <button class="btn btn-primary btn-item-reactivate" data-id="${p.id}" style="font-size: 0.78rem; padding: 6px 12px; font-weight: 800;">
                    🟢 إعادة تفعيل (متوفر)
                  </button>
                  <button class="btn btn-secondary btn-item-keep-reserved" data-id="${p.id}" style="font-size: 0.78rem; padding: 6px 12px; font-weight: 800;">
                    ⏳ إبقاء محجوز
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 10px; border-top: 1px solid var(--border-subtle); padding-top: 14px; justify-content: space-between; flex-wrap: wrap;">
            <button class="btn btn-danger" id="btn-bulk-mark-sold" style="font-weight: 800; font-size: 0.85rem;">
              🔴 تم بيع كافة المنتجات
            </button>
            <button class="btn btn-primary" id="btn-bulk-reactivate" style="font-weight: 800; font-size: 0.85rem;">
              🟢 إعادة تفعيل الكل كمتوفر
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove(); window.app.navigate('/v-space-k90')">الذهاب للوحة التحكم الكاملة</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    modalOverlay.querySelectorAll('.btn-item-mark-sold').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        ProductsService.updateProductStatus(id, 'sold', 0);
        const badge = document.getElementById(`badge-status-${id}`);
        if (badge) {
          badge.textContent = 'تم البيع 🔴';
          badge.className = 'badge badge-scrap';
        }
        this.showToast('تم تحديث حالة المنتج إلى (تم البيع)!', 'success');
      });
    });

    modalOverlay.querySelectorAll('.btn-item-reactivate').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        ProductsService.updateProductStatus(id, 'available', 1);
        const badge = document.getElementById(`badge-status-${id}`);
        if (badge) {
          badge.textContent = 'متوفر 🟢';
          badge.className = 'badge badge-new';
        }
        this.showToast('تمت إعادة تفعيل المنتج وعرضه بالمتجر!', 'success');
      });
    });

    modalOverlay.querySelectorAll('.btn-item-keep-reserved').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        ProductsService.updateProductStatus(id, 'reserved');
        const badge = document.getElementById(`badge-status-${id}`);
        if (badge) {
          badge.textContent = 'قيد الحجز ⏳';
          badge.className = 'badge badge-used';
        }
        this.showToast('المنتج الآن قيد الحجز المؤقت', 'info');
      });
    });

    modalOverlay.querySelector('#btn-bulk-mark-sold')?.addEventListener('click', () => {
      products.forEach(p => ProductsService.updateProductStatus(p.id, 'sold', 0));
      modalOverlay.remove();
      this.navigate('/v-space-k90');
      this.showToast('تم تأكيد بيع كافة منتجات الطلبية بنجاح!', 'success');
    });

    modalOverlay.querySelector('#btn-bulk-reactivate')?.addEventListener('click', () => {
      products.forEach(p => ProductsService.updateProductStatus(p.id, 'available', 1));
      modalOverlay.remove();
      this.navigate('/v-space-k90');
      this.showToast('تمت إعادة تفعيل كافة المنتجات وعرضها بالمتجر!', 'success');
    });
  }

  /* ==========================================================================
     4. Poster Modal (Ultra-HD QR Code, Multi-Theme & Fixed Badges)
     ========================================================================== */
  async openPosterModal(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    let selectedFormat = 'vertical';
    let selectedTheme = 'dark_gold';
    const qrDataUrl = await PosterService.generateProductQRCode(productId);

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    
    const updatePreviewHTML = () => {
      const isVertical = selectedFormat === 'vertical';
      return `
        <div class="${isVertical ? 'flyer-preview-vertical' : 'flyer-preview-horizontal'} flyer-theme-${selectedTheme}" id="flyer-render-target">
          <div class="flyer-image-col" style="position: relative; overflow: hidden; border-radius: 14px;">
            <img src="${product.image}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover; display:block;">
            <span class="badge badge-new" style="position: absolute; top: 12px; right: 12px; z-index: 5; font-size: 0.82rem; padding: 5px 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
              ${PRODUCT_CONDITIONS[product.condition?.toUpperCase()]?.label || product.conditionLabel || 'أوبن بوكس'}
            </span>
          </div>

          <div class="flyer-info-col">
            <div class="flyer-brand-header">
              <span>⚡ ${APP_CONFIG.STORE_NAME_SHORT}</span>
              <span style="font-size: 0.75rem; color: #38bdf8; display: flex; align-items: center;">| ${product.merchantName || 'أبو وارث'} ${SOCIAL_ICONS.VERIFIED_BADGE}</span>
            </div>

            <h2 class="flyer-product-title">${product.title}</h2>
            <div style="font-size: 0.85rem; color: #d1d5db;">الموديل / الكود: #${product.id}</div>

            <div class="flyer-price-container">
              <span class="flyer-price-label">السعر:</span>
              <span class="flyer-price-value">${Number(product.price).toLocaleString()} ${APP_CONFIG.CURRENCY}</span>
            </div>

            <div class="flyer-qr-footer" style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <div>
                <div style="font-size: 0.85rem; font-weight: 700; color: #f59e0b;">امسح الكود بكاميرا الموبايل للتسوق</div>
                <div style="font-size: 0.75rem; color: #94a3b8;">souk-al-balat.vercel.app</div>
              </div>
              <div class="flyer-qr-box" style="background:#ffffff; padding:4px; border-radius:10px; display:flex; align-items:center; justify-content:center; width:80px; height:80px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border:2px solid #f59e0b;">
                ${qrDataUrl ? `<img src="${qrDataUrl}" style="width:72px; height:72px; object-fit:contain; display:block;" alt="QR Code">` : '📱'}
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
          <!-- Theme Selector Bar -->
          <div style="margin-bottom: 12px; text-align: center;">
            <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px;">🎨 اختر مظهر وألوان البوستر:</div>
            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-poster-theme-pill active" data-theme="dark_gold" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 800;">🌙 داكن ذهبي</button>
              <button class="btn btn-secondary btn-poster-theme-pill" data-theme="light_modern" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 800;">☀️ فاتح مودرن</button>
              <button class="btn btn-secondary btn-poster-theme-pill" data-theme="neon_cyber" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 800;">⚡ نيون أزرق</button>
              <button class="btn btn-secondary btn-poster-theme-pill" data-theme="royal_purple" style="font-size: 0.75rem; padding: 4px 10px; font-weight: 800;">💎 ملكي بنفسجي</button>
            </div>
          </div>

          <div id="dynamic-poster-preview-box">
            ${updatePreviewHTML()}
          </div>

          <p style="font-size: 0.78rem; color: var(--text-tertiary); text-align: center; margin-top: 10px; margin-bottom: 0;">
            * اضغط على زر التدوير 🔄 لقلب شكل البوستر بين (العمودي للستوري 📱) و (الأفقي للمنشورات 🖥️).
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-toggle-poster-format" style="width: 100%; font-weight: 800;">
            🔄 📱 قلب الشكل (${selectedFormat === 'vertical' ? 'عمودي ستوري' : 'أفقي عريض'})
          </button>

          <div class="poster-footer-row-actions">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
            <button class="btn btn-primary" id="btn-download-poster-action" style="font-weight: 800;">
              💾 حفظ / مشاركة البوستر
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

    modalOverlay.querySelectorAll('.btn-poster-theme-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        modalOverlay.querySelectorAll('.btn-poster-theme-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTheme = btn.dataset.theme;
        previewBox.innerHTML = updatePreviewHTML();
      });
    });

    const downloadBtn = modalOverlay.querySelector('#btn-download-poster-action');
    downloadBtn?.addEventListener('click', async () => {
      downloadBtn.disabled = true;
      downloadBtn.innerHTML = '⏳ جاري المعالجة...';
      try {
        await PosterService.exportFlyerAsImage(product, selectedFormat, selectedTheme);
        this.showToast(`تم تجهيز وحفظ البوستر (${selectedFormat === 'vertical' ? 'العمودي 📱' : 'الأفقي 🖥️'}) بنجاح!`, 'success');
      } catch (err) {
        this.showToast('حدث خطأ أثناء إنشاء البوستر، يرجى المحاولة ثانية', 'error');
      } finally {
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '💾 حفظ / مشاركة البوستر';
      }
    });
  }

  /* ==========================================================================
     Merchant Store Poster Modal (Horizontal & Vertical, 4 Themes, Avatar Above Name)
     ========================================================================== */
  async openStorePosterModal(merchant, sellerProducts = []) {
    if (!merchant) merchant = AuthService.getCurrentMerchant() || AuthService.getMerchantById('m-alwareth');
    if (!sellerProducts || sellerProducts.length === 0) {
      sellerProducts = ProductsService.getProducts().filter(p => p.merchantId === merchant.id || p.merchantName?.includes(merchant.name));
    }

    const qrDataUrl = await PosterService.generateStoreQRCode(merchant.slug || merchant.id);

    let selectedFormat = 'vertical';
    let selectedTheme = 'dark_gold';

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';

    const updateStorePreviewHTML = () => {
      const isVert = selectedFormat === 'vertical';
      return `
        <div style="background: ${selectedTheme === 'dark_gold' ? 'linear-gradient(135deg, #0f172a, #020617)' : selectedTheme === 'light_modern' ? 'linear-gradient(135deg, #ffffff, #f1f5f9)' : selectedTheme === 'neon_cyber' ? 'linear-gradient(135deg, #090d16, #020617)' : 'linear-gradient(135deg, #1e112a, #0d0517)'}; color: ${selectedTheme === 'light_modern' ? '#0f172a' : '#ffffff'}; border: 2px solid ${selectedTheme === 'dark_gold' ? '#f59e0b' : selectedTheme === 'light_modern' ? '#2563eb' : selectedTheme === 'neon_cyber' ? '#06b6d4' : '#c084fc'}; border-radius: var(--radius-lg); padding: 18px 14px; text-align: center; box-shadow: var(--card-shadow);">
          ${isVert ? `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
              <div style="font-size: 0.8rem; font-weight: 800; color: ${selectedTheme === 'dark_gold' ? '#f59e0b' : selectedTheme === 'light_modern' ? '#2563eb' : selectedTheme === 'neon_cyber' ? '#22d3ee' : '#e879f9'}; background: rgba(255,255,255,0.08); padding: 3px 12px; border-radius: 20px;">
                ⚡ ${APP_CONFIG.STORE_NAME_SHORT} | المتجر الرسمي
              </div>

              <!-- Avatar directly above name -->
              ${merchant.avatar ? `
                <img src="${merchant.avatar}" style="width: 76px; height: 76px; border-radius: 50%; object-fit: cover; border: 3px solid ${selectedTheme === 'dark_gold' ? '#f59e0b' : selectedTheme === 'light_modern' ? '#2563eb' : selectedTheme === 'neon_cyber' ? '#06b6d4' : '#c084fc'}; box-shadow: 0 4px 14px rgba(0,0,0,0.3);" alt="${merchant.name}">
              ` : ''}

              <div>
                <h3 style="font-size: 1.15rem; font-weight: 900; color: ${selectedTheme === 'light_modern' ? '#0f172a' : '#ffffff'}; margin-bottom: 2px;">
                  🏪 ${merchant.name} ✓
                </h3>
                <div style="font-size: 0.78rem; color: #f59e0b; font-weight: 800;">
                  👑 مدير ومؤسس الموقع | حساب معتمد وموثوق
                </div>
                <div style="font-size: 0.72rem; color: ${selectedTheme === 'light_modern' ? '#64748b' : '#94a3b8'}; margin-top: 2px;">
                  📞 واتساب: ${merchant.phone} | 📦 معروض: ${sellerProducts.length} قطعة
                </div>
              </div>

              <!-- Real Ultra-HD QR Code with White Rounded Background -->
              <div style="background: #ffffff; padding: 6px; border-radius: 12px; border: 2px solid ${selectedTheme === 'dark_gold' ? '#f59e0b' : selectedTheme === 'light_modern' ? '#2563eb' : selectedTheme === 'neon_cyber' ? '#06b6d4' : '#c084fc'}; box-shadow: 0 6px 18px rgba(0,0,0,0.3); margin-top: 4px;">
                ${qrDataUrl ? `<img src="${qrDataUrl}" style="width: 110px; height: 110px; object-fit: contain; display: block;" alt="Store QR Code">` : '📱'}
              </div>

              <div style="font-size: 0.78rem; font-weight: 800; color: ${selectedTheme === 'light_modern' ? '#0f172a' : '#f8fafc'};">
                📷 امسح الكود بكاميرا الموبايل لزيارة متجري
              </div>
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 14px; align-items: center; text-align: right;">
              <div style="text-align: center;">
                <div style="background: #ffffff; padding: 4px; border-radius: 10px; display: inline-block; border: 2px solid ${selectedTheme === 'dark_gold' ? '#f59e0b' : selectedTheme === 'light_modern' ? '#2563eb' : selectedTheme === 'neon_cyber' ? '#06b6d4' : '#c084fc'};">
                  ${qrDataUrl ? `<img src="${qrDataUrl}" style="width: 80px; height: 80px; object-fit: contain; display: block;" alt="Store QR Code">` : '📱'}
                </div>
                <div style="font-size: 0.68rem; font-weight: 700; color: ${selectedTheme === 'light_modern' ? '#475569' : '#cbd5e1'}; margin-top: 4px;">امسح للزيارة 📷</div>
              </div>

              <div>
                ${merchant.avatar ? `
                  <img src="${merchant.avatar}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid ${selectedTheme === 'dark_gold' ? '#f59e0b' : '#2563eb'}; margin-bottom: 4px;" alt="${merchant.name}">
                ` : ''}
                <div style="font-size: 1rem; font-weight: 900; color: ${selectedTheme === 'light_modern' ? '#0f172a' : '#ffffff'};">
                  🏪 ${merchant.name} ✓
                </div>
                <div style="font-size: 0.72rem; color: #f59e0b; font-weight: 800;">
                  👑 مدير ومؤسس الموقع
                </div>
                <div style="font-size: 0.7rem; color: ${selectedTheme === 'light_modern' ? '#64748b' : '#94a3b8'};">
                  📞 واتساب: ${merchant.phone}
                </div>
              </div>
            </div>
          `}
        </div>
      `;
    };

    modalOverlay.innerHTML = `
      <div class="modal-container marketing-poster-modal" style="max-width: 650px;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <span>📷</span>
            <span>توليد بوستر تسويقي للمتجر (${merchant.name})</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <!-- Theme Selector Bar -->
          <div style="margin-bottom: 14px; text-align: center;">
            <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-secondary); margin-bottom: 6px;">🎨 اختر مظهر وألوان البوستر:</div>
            <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-store-theme-pill active" data-theme="dark_gold" style="font-size: 0.78rem; padding: 5px 12px; font-weight: 800;">🌙 داكن ذهبي</button>
              <button class="btn btn-secondary btn-store-theme-pill" data-theme="light_modern" style="font-size: 0.78rem; padding: 5px 12px; font-weight: 800;">☀️ فاتح مودرن</button>
              <button class="btn btn-secondary btn-store-theme-pill" data-theme="neon_cyber" style="font-size: 0.78rem; padding: 5px 12px; font-weight: 800;">⚡ نيون أزرق</button>
              <button class="btn btn-secondary btn-store-theme-pill" data-theme="royal_purple" style="font-size: 0.78rem; padding: 5px 12px; font-weight: 800;">💎 ملكي بنفسجي</button>
            </div>
          </div>

          <div id="store-poster-preview-box">
            ${updateStorePreviewHTML()}
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <button class="btn btn-secondary" id="btn-toggle-store-poster-format" style="font-weight: 800;">
            🔄 📱 قلب الشكل (${selectedFormat === 'vertical' ? 'عمودي ستوري' : 'أفقي عريض'})
          </button>

          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
            <button class="btn btn-primary" id="btn-download-store-poster-act" style="font-weight: 800;">
              📷 تحميل بوستر المتجر كصورة PNG
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const toggleBtn = modalOverlay.querySelector('#btn-toggle-store-poster-format');
    const previewBox = modalOverlay.querySelector('#store-poster-preview-box');

    toggleBtn.addEventListener('click', () => {
      selectedFormat = selectedFormat === 'vertical' ? 'horizontal' : 'vertical';
      toggleBtn.innerHTML = `🔄 📱 قلب الشكل (${selectedFormat === 'vertical' ? 'عمودي ستوري' : 'أفقي عريض'})`;
      previewBox.innerHTML = updateStorePreviewHTML();
    });

    modalOverlay.querySelectorAll('.btn-store-theme-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        modalOverlay.querySelectorAll('.btn-store-theme-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedTheme = btn.dataset.theme;
        previewBox.innerHTML = updateStorePreviewHTML();
      });
    });

    modalOverlay.querySelector('#btn-download-store-poster-act')?.addEventListener('click', async () => {
      await PosterService.exportMerchantStorePosterAsImage(merchant, sellerProducts, selectedFormat, selectedTheme);
      this.showToast(`تم تحميل بوستر المتجر (${selectedFormat === 'vertical' ? 'العمودي 📱' : 'الأفقي 🖥️'}) بنجاح!`, 'success');
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

  /* ==========================================================================
     Cart & Checkout Modal with Strict Iraqi Phone & 18 Governorates
     ========================================================================== */
  openCartModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';

    const renderCartBody = () => {
      if (this.cart.length === 0) {
        return `
          <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">🛒</div>
            <h3 style="font-size: 1.25rem; font-weight: 900; margin-bottom: 8px;">سلة التسوق فارغة حالياً</h3>
            <p style="color: var(--text-secondary); font-size: 0.92rem; margin-bottom: 20px;">تصفح بضائع الأوتلت والبالات واختر القطع التي ترغب بشرائها.</p>
            <button class="btn btn-primary" onclick="this.closest('.modal-overlay').remove(); window.app.navigate('/')">تصفح البضائع الآن ⚡</button>
          </div>
        `;
      }

      const itemsTotal = this.cart.reduce((sum, item) => sum + Number(item.price), 0);
      const deliveryFee = APP_CONFIG.FIXED_DELIVERY_FEE;
      const grandTotal = itemsTotal + deliveryFee;

      return `
        <!-- Cart Items List -->
        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
          ${this.cart.map((item, index) => `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px; background: var(--bg-surface-subtle); padding: 8px 12px; border-radius: var(--radius-sm);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${item.image}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 6px;" alt="${item.title}">
                <div>
                  <h4 style="font-size: 0.85rem; font-weight: 800; color: var(--text-primary); line-height: 1.3; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.title}</h4>
                  <div style="font-size: 0.82rem; font-weight: 900; color: #dc2626;">${Number(item.price).toLocaleString()} د.ع</div>
                </div>
              </div>
              <button class="btn-icon btn-remove-cart-item" data-index="${index}" style="color: #ef4444; font-size: 1.1rem; cursor: pointer;" title="إزالة من السلة">🗑️</button>
            </div>
          `).join('')}
        </div>

        <!-- Cost Breakdown -->
        <div style="background: var(--bg-surface-subtle); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
            <span style="color: var(--text-secondary);">مجموع البضائع:</span>
            <span style="font-weight: 800;">${itemsTotal.toLocaleString()} د.ع</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
            <span style="color: var(--text-secondary);">أجور التوصيل (كافة المحافظات):</span>
            <span style="font-weight: 800; color: #10b981;">${deliveryFee.toLocaleString()} د.ع</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: 900; border-top: 1px dashed var(--border-strong); padding-top: 6px; margin-top: 4px; color: var(--brand-primary);">
            <span>المبلغ الإجمالي الكلي:</span>
            <span>${grandTotal.toLocaleString()} د.ع</span>
          </div>
        </div>

        <!-- Customer Checkout Form -->
        <form id="cart-checkout-form" onsubmit="return false;">
          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; margin-bottom: 4px; display: block;">الاسم الكامل للزبون *</label>
            <input type="text" class="form-input" id="cart-cust-name" placeholder="أدخل اسمك الكريم..." required style="width: 100%; padding: 8px 12px; font-size: 0.88rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-primary);">
          </div>

          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; margin-bottom: 4px; display: block;">رقم الهاتف (يبدأ بـ 077 أو 078 أو 075 أو 079) *</label>
            <input type="tel" class="form-input" id="cart-cust-phone" placeholder="مثال: 07701234567" required style="width: 100%; padding: 8px 12px; font-size: 0.88rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-primary); direction: ltr; text-align: right;">
          </div>

          <div class="form-group" style="margin-bottom: 10px;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; margin-bottom: 4px; display: block;">المحافظة *</label>
            <select class="form-input" id="cart-cust-province" required style="width: 100%; padding: 8px 12px; font-size: 0.88rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-primary);">
              <option value="">-- اختر المحافظة من القائمة (18 محافظة) --</option>
              ${IRAQI_GOVERNORATES.map(gov => `<option value="${gov}">📍 ${gov}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-weight: 800; font-size: 0.82rem; margin-bottom: 4px; display: block;">تفاصيل العنوان وأقرب نقطة دالة *</label>
            <textarea class="form-input" id="cart-cust-address" rows="2" placeholder="المنطقة، اسم الشارع / المحلة، أقرب نقطة دالة لتوصيل الطلب..." required style="width: 100%; padding: 8px 12px; font-size: 0.88rem; border-radius: var(--radius-sm); border: 1.5px solid var(--border-strong); background: var(--bg-surface); color: var(--text-primary);"></textarea>
          </div>

          <button class="btn btn-whatsapp" id="btn-submit-cart-order" style="width: 100%; padding: 12px; font-size: 1rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px;">
            ${SOCIAL_ICONS.WHATSAPP}
            <span>تأكيد وإرسال الطلب عبر واتساب 🚀</span>
          </button>
        </form>
      `;
    };

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 480px;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <span>🛒</span>
            <span>سلة المشتريات وتأكيد الطلب (${this.cart.length} قطع)</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>
        <div class="modal-body" id="cart-modal-body-content">
          ${renderCartBody()}
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const attachCartEvents = () => {
      modalOverlay.querySelectorAll('.btn-remove-cart-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = Number(btn.dataset.index);
          this.cart.splice(idx, 1);
          localStorage.setItem('souk_cart', JSON.stringify(this.cart));
          this.render();
          const content = document.getElementById('cart-modal-body-content');
          if (content) {
            content.innerHTML = renderCartBody();
            attachCartEvents();
          }
        });
      });

      modalOverlay.querySelector('#btn-submit-cart-order')?.addEventListener('click', () => {
        const name = document.getElementById('cart-cust-name')?.value.trim();
        const phone = document.getElementById('cart-cust-phone')?.value.trim();
        const province = document.getElementById('cart-cust-province')?.value;
        const address = document.getElementById('cart-cust-address')?.value.trim();

        if (!name) {
          this.showToast('يرجى إدخال الاسم الكامل!', 'error');
          return;
        }

        if (!isValidIraqiPhone(phone)) {
          this.showToast('يرجى إدخال رقم هاتف عراقي صحيح يبدأ بـ (077 / 078 / 075 / 079) مكون من 11 رقماً!', 'error');
          return;
        }

        if (!province) {
          this.showToast('يرجى اختيار المحافظة من القائمة المنسدلة!', 'error');
          return;
        }

        if (!address) {
          this.showToast('يرجى كتابة تفاصيل العنوان وأقرب نقطة دالة!', 'error');
          return;
        }

        const orders = OrdersService.processOrderAndGenerateWhatsApp(this.cart, {
          name,
          phone,
          province,
          address
        });

        // Clear cart
        this.cart = [];
        localStorage.setItem('souk_cart', JSON.stringify(this.cart));
        modalOverlay.remove();
        this.render();

        if (orders.length > 0) {
          window.open(orders[0].waUrl, '_blank');
          this.showToast('تم تجهيز وإرسال الطلب عبر واتساب بنجاح! 🎉', 'success');
        }
      });
    };

    attachCartEvents();
  }

  /* ==========================================================================
     Merchant Media Gallery Modal (Browse, Upload to Firebase, Delete, Prevent Duplicates)
     ========================================================================== */
  openMerchantGalleryModal(slotIndex, productTitle, onSelect) {
    const merchant = AuthService.getCurrentMerchant();
    const merchantName = merchant?.name || 'أبو وارث أمازون';

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';

    const renderGalleryBody = () => {
      const currentGallery = StorageService.getMerchantGallery();
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h3 style="font-weight: 900; font-size: 1.15rem; margin-bottom: 4px;">📁 مجلد صور التاجر: ${merchantName}</h3>
            <p style="font-size: 0.82rem; color: var(--text-secondary);">اختر صورة مرفوعة مسبقاً لمنع التكرار، أو ارفع صورة جديدة مباشرة للسحابة.</p>
          </div>
          <button class="btn btn-primary" id="btn-upload-new-to-gallery" style="font-size: 0.85rem;">
            📤 رفع صورة جديدة من الجهاز
          </button>
          <input type="file" id="gallery-file-input" accept="image/*" style="display: none;">
        </div>

        <div id="gallery-upload-status" style="margin-bottom: 10px; display: none; padding: 10px; border-radius: 8px; background: rgba(59, 130, 246, 0.1); color: #3b82f6; font-weight: 700;">
          ⏳ جاري المعالجة والرفع لمجلد التاجر في Firebase...
        </div>

        ${currentGallery.length === 0 ? `
          <div style="text-align: center; padding: 40px 20px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 2px dashed var(--border-subtle);">
            <div style="font-size: 2.5rem; margin-bottom: 10px;">🖼️</div>
            <p style="font-weight: 800; color: var(--text-primary);">لا توجد صور محفوظة في مجلدك حالياً</p>
            <p style="font-size: 0.85rem; color: var(--text-secondary);">اضغط على زر (رفع صورة جديدة) أعلاه لإضافة صور إلى مجلدك السحابي.</p>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; max-height: 380px; overflow-y: auto; padding: 4px;">
            ${currentGallery.map((img) => `
              <div style="position: relative; border-radius: 10px; overflow: hidden; border: 2px solid var(--border-subtle); background: #000;">
                <img src="${img.url}" style="width: 100%; height: 120px; object-fit: cover; display: block;">
                <div style="padding: 6px; background: var(--bg-surface-elevated); display: flex; justify-content: space-between; align-items: center;">
                  <button class="btn btn-secondary btn-select-gallery-img" data-url="${img.url}" style="font-size: 0.72rem; padding: 4px 8px; font-weight: 800;">
                    اختيار
                  </button>
                  <button class="btn btn-danger btn-delete-gallery-img" data-url="${img.url}" style="font-size: 0.72rem; padding: 4px 8px;" title="حذف الصورة">
                    🗑️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      `;
    };

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 600px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🖼️</span>
            <span>معرض وسائط التاجر (${merchantName})</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>
        <div class="modal-body" id="gallery-modal-body-wrapper">
          ${renderGalleryBody()}
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const bindGalleryEvents = () => {
      const fileInput = modalOverlay.querySelector('#gallery-file-input');
      const uploadBtn = modalOverlay.querySelector('#btn-upload-new-to-gallery');
      const statusBox = modalOverlay.querySelector('#gallery-upload-status');

      uploadBtn?.addEventListener('click', () => fileInput?.click());

      fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (statusBox) statusBox.style.display = 'block';
          try {
            const url = await StorageService.processAndUploadImage(file, merchantName, productTitle || 'product', slotIndex);
            modalOverlay.remove();
            onSelect(url);
          } catch (err) {
            if (statusBox) statusBox.style.display = 'none';
            this.showToast(err.message, 'error');
          }
        }
      });

      modalOverlay.querySelectorAll('.btn-select-gallery-img').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.dataset.url;
          modalOverlay.remove();
          onSelect(url);
        });
      });

      modalOverlay.querySelectorAll('.btn-delete-gallery-img').forEach(btn => {
        btn.addEventListener('click', () => {
          const url = btn.dataset.url;
          if (confirm('هل أنت متأكد من رغبتك بحذف هذه الصورة من معرض التاجر؟')) {
            StorageService.deleteImageFromGallery(url);
            modalOverlay.querySelector('#gallery-modal-body-wrapper').innerHTML = renderGalleryBody();
            bindGalleryEvents();
            this.showToast('تم حذف الصورة من المعرض', 'info');
          }
        });
      });
    };

    bindGalleryEvents();
  }

  /* ==========================================================================
     In-App Category Search, Selection & Creation Modal
     ========================================================================== */
  openCategoryPickerModal(currentCat, onSelect) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';

    let isCreatingNew = false;

    const renderPickerBody = (searchQuery = '') => {
      const filtered = this.categories
        .filter(c => c.id !== 'all')
        .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return `
        <!-- Top Search Box -->
        <div style="margin-bottom: 14px;">
          <input type="text" id="picker-cat-search" class="form-input" placeholder="🔍 اكتب هنا للبحث السريع في الأقسام..." value="${searchQuery}">
        </div>

        <!-- Add New Category Toggle Banner -->
        <div style="margin-bottom: 14px; padding: 10px 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px dashed var(--border-strong); display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">لم تجد القسم المناسب لقطعتك؟</span>
          <button type="button" class="btn btn-secondary" id="btn-toggle-add-custom-cat" style="font-size: 0.78rem; padding: 5px 10px; font-weight: 800; color: var(--brand-primary);">
            ➕ إضافة قسم جديد
          </button>
        </div>

        <!-- In-App Custom Category Creator Box -->
        <div id="new-cat-inline-creator" style="display: ${isCreatingNew ? 'block' : 'none'}; background: var(--bg-surface-subtle); padding: 14px; border-radius: var(--radius-md); border: 1.5px solid var(--brand-primary); margin-bottom: 14px;">
          <label class="form-label" style="font-size: 0.85rem;">اسم القسم الجديد المطلوب:</label>
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input type="text" class="form-input" id="custom-cat-input-name" placeholder="مثال: ساعات ذكية، أجهزة كهربائية...">
            <button type="button" class="btn btn-primary" id="btn-confirm-save-custom-cat" style="white-space: nowrap;">
              حفظ واختيار
            </button>
          </div>
        </div>

        <!-- Categories Grid -->
        <div style="max-height: 280px; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 10px; padding: 2px;">
          ${filtered.length === 0 ? `
            <div style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-secondary); font-size: 0.9rem;">
              لا يوجد قسم بهذا الاسم. اضغط على (➕ إضافة قسم جديد) بالأعلى لإضافته فوراً.
            </div>
          ` : filtered.map(c => `
            <div class="category-pick-card ${c.name === currentCat ? 'active' : ''}" data-cat-name="${c.name}" data-cat-icon="${c.icon || '📦'}" style="cursor: pointer; padding: 12px 10px; border-radius: 10px; border: 1.5px solid ${c.name === currentCat ? 'var(--brand-primary)' : 'var(--border-subtle)'}; background: ${c.name === currentCat ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-surface-subtle)'}; text-align: center; transition: all 0.2s ease;">
              <div style="font-size: 1.6rem; margin-bottom: 4px;">${c.icon || '📦'}</div>
              <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-primary);">${c.name}</div>
            </div>
          `).join('')}
        </div>
      `;
    };

    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 520px;">
        <div class="modal-header">
          <div class="modal-title">
            <span>🗂️</span>
            <span>اختيار أو إضافة قسم البضاعة</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>
        <div class="modal-body" id="cat-picker-modal-body">
          ${renderPickerBody()}
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const bindEvents = () => {
      const searchInput = modalOverlay.querySelector('#picker-cat-search');
      searchInput?.addEventListener('input', (e) => {
        const val = e.target.value;
        modalOverlay.querySelector('#cat-picker-modal-body').innerHTML = renderPickerBody(val);
        const newSearch = modalOverlay.querySelector('#picker-cat-search');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(val.length, val.length);
        }
        bindEvents();
      });

      modalOverlay.querySelector('#btn-toggle-add-custom-cat')?.addEventListener('click', () => {
        isCreatingNew = !isCreatingNew;
        const box = modalOverlay.querySelector('#new-cat-inline-creator');
        if (box) box.style.display = isCreatingNew ? 'block' : 'none';
        if (isCreatingNew) modalOverlay.querySelector('#custom-cat-input-name')?.focus();
      });

      modalOverlay.querySelector('#btn-confirm-save-custom-cat')?.addEventListener('click', () => {
        const newName = modalOverlay.querySelector('#custom-cat-input-name')?.value.trim();
        if (newName) {
          const newCatObj = { id: 'cat_' + Date.now(), name: newName, icon: '📦' };
          this.categories.push(newCatObj);
          localStorage.setItem('souk_categories', JSON.stringify(this.categories));
          modalOverlay.remove();
          onSelect(newName, '📦');
        }
      });

      modalOverlay.querySelectorAll('.category-pick-card').forEach(card => {
        card.addEventListener('click', () => {
          const catName = card.dataset.catName;
          const catIcon = card.dataset.catIcon;
          modalOverlay.remove();
          onSelect(catName, catIcon);
        });
      });
    };

    bindEvents();
  }

  /* ==========================================================================
     Merchant Public Store Modal (Profile, Verified Badge, Socials, Inventory)
     ========================================================================== */
  openMerchantStoreModal(merchantId) {
    const merchant = AuthService.getMerchantById(merchantId) || {
      name: 'أبو وارث أمازون',
      phone: '07707188166',
      socials: { facebook: 'https://www.facebook.com/gpm90', tiktok: 'https://www.tiktok.com/@alwareth_amazon', whatsapp: 'https://api.whatsapp.com/send?phone=9647707188166' }
    };

    const merchantProducts = ProductsService.getProducts().filter(p => p.merchantId === merchantId || p.merchantName?.includes('أبو وارث') || !p.merchantId);

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 860px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 6px;">
            <span>🏪</span>
            <span>متجر ${merchant.name}</span>
            ${SOCIAL_ICONS.VERIFIED_BADGE}
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <!-- Merchant Hero Card -->
          <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95)); border: 1px solid var(--border-strong); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; box-shadow: var(--card-shadow);">
            <div style="display: flex; align-items: center; gap: 14px;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: #f59e0b; color: #000; font-size: 2rem; display: flex; align-items: center; justify-content: center; font-weight: 900; border: 3px solid #fff;">
                👑
              </div>
              <div>
                <div style="font-size: 1.3rem; font-weight: 900; color: #ffffff; display: flex; align-items: center; gap: 6px;">
                  <span>${merchant.name}</span>
                  ${SOCIAL_ICONS.VERIFIED_BADGE}
                  <span class="badge" style="background: #fef08a; color: #854d0e; font-size: 0.72rem; font-weight: 800;">موثق رسمي</span>
                </div>
                <div style="color: #94a3b8; font-size: 0.85rem; margin-top: 4px;">📞 واتساب: ${merchant.phone || '07707188166'} | 📦 إجمالي البضائع: ${merchantProducts.length} قطعة</div>
              </div>
            </div>

            <!-- Social Links -->
            <div style="display: flex; align-items: center; gap: 10px;">
              <a href="${merchant.socials?.facebook || 'https://www.facebook.com/gpm90'}" target="_blank" class="btn btn-secondary" style="font-size: 0.85rem; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                ${SOCIAL_ICONS.FACEBOOK}
                <span>فيسبوك</span>
              </a>
              <a href="${merchant.socials?.tiktok || 'https://www.tiktok.com/@alwareth_amazon'}" target="_blank" class="btn btn-secondary" style="font-size: 0.85rem; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                ${SOCIAL_ICONS.TIKTOK}
                <span>تيك توك</span>
              </a>
              <a href="${merchant.socials?.whatsapp || 'https://api.whatsapp.com/send?phone=9647707188166'}" target="_blank" class="btn btn-whatsapp" style="font-size: 0.85rem; padding: 6px 12px; display: flex; align-items: center; gap: 6px;">
                ${SOCIAL_ICONS.WHATSAPP}
                <span>محادثة واتساب</span>
              </a>
            </div>
          </div>

          <h3 style="font-size: 1.15rem; font-weight: 900; margin-bottom: 14px;">بضائع ومنشورات التاجر (${merchantProducts.length}):</h3>

          <div class="products-grid">
            ${merchantProducts.length === 0 ? `
              <p style="text-align: center; grid-column: 1/-1; padding: 30px; color: var(--text-secondary);">لا توجد بضائع منشورة حالياً لهذا التاجر.</p>
            ` : merchantProducts.map(p => this.renderProductCard(p)).join('')}
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
     5. Merchant Isolated Portal (/v-space-k90) with Active & Archive Tabs
     ========================================================================== */
  renderMerchantPortal() {
    const merchant = AuthService.getCurrentMerchant();
    if (!merchant) {
      this.renderMerchantLogin();
      return;
    }

    if (!this.merchantActiveTab) {
      this.merchantActiveTab = 'active'; // 'active' or 'deleted'
    }

    const myActiveProducts = ProductsService.getProducts().filter(p => p.merchantId === merchant.id);
    const myDeletedProducts = ProductsService.getDeletedProducts(merchant.id);

    this.appEl.innerHTML = `
      <div class="merchant-portal-view">
        <div class="container">
          <div class="merchant-top-header">
            <div class="merchant-profile-card">
              <div class="merchant-avatar-circle">
                <img src="${merchant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <h2 style="font-size: 1.25rem; font-weight: 900;">${merchant.name}</h2>
                  ${SOCIAL_ICONS.VERIFIED_BADGE}
                  <span class="badge" style="background: #fef08a; color: #854d0e;">👑 مدير ومؤسس الموقع</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 6px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                  <span>هاتف الواتساب: <strong>${merchant.phone}</strong></span>
                  <span>|</span>
                  <a href="${merchant.socials?.facebook || 'https://www.facebook.com/gpm90'}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; color: #1877f2; font-weight: 700; text-decoration: none;">
                    ${SOCIAL_ICONS.FACEBOOK} فيسبوك
                  </a>
                  <span>|</span>
                  <a href="${merchant.socials?.tiktok || 'https://www.tiktok.com/@alwareth_amazon'}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; color: #000; font-weight: 700; text-decoration: none;">
                    ${SOCIAL_ICONS.TIKTOK} تيك توك
                  </a>
                </div>
              </div>
            </div>

            <div class="merchant-header-actions" style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button class="btn btn-primary" id="btn-merchant-add-product">
                ➕ نشر بضاعة جديدة
              </button>
              <button class="btn btn-secondary" id="btn-merchant-settings">
                ⚙️ إعدادات الحساب
              </button>
              <button class="btn btn-secondary" id="btn-merchant-logout">
                🚪 خروج
              </button>
            </div>
          </div>

          <div class="merchant-stats-grid">
            <div class="merchant-stat-card">
              <span class="stat-label">📦 البضائع النشطة</span>
              <span class="stat-value">${myActiveProducts.filter(p => p.status === 'available').length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">⏳ قيد الحجز</span>
              <span class="stat-value">${myActiveProducts.filter(p => p.status === 'reserved').length}</span>
            </div>
            <div class="merchant-stat-card">
              <span class="stat-label">🗑️ المحذوفات</span>
              <span class="stat-value" style="color: #ef4444;">${myDeletedProducts.length}</span>
            </div>
          </div>

          <!-- Merchant Tabs Selector -->
          <div class="merchant-tabs-wrapper">
            <button class="btn ${this.merchantActiveTab === 'active' ? 'btn-primary' : 'btn-secondary'}" id="tab-merchant-active" style="font-weight: 800;">
              📦 البضائع النشطة المعروضة (${myActiveProducts.length})
            </button>
            <button class="btn ${this.merchantActiveTab === 'deleted' ? 'btn-danger' : 'btn-secondary'}" id="tab-merchant-deleted" style="font-weight: 800;">
              🗑️ سلة المحذوفات والأرشيف (${myDeletedProducts.length})
            </button>
          </div>

          <!-- 1. Desktop Data Table View (Visible on screens > 768px) -->
          <div class="admin-table-container merchant-desktop-table">
            ${this.merchantActiveTab === 'active' ? `
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>عنوان المنتج</th>
                    <th>السعر</th>
                    <th>الكمية</th>
                    <th>الحالة</th>
                    <th>الخصم</th>
                    <th>إجراءات وتعديل</th>
                  </tr>
                </thead>
                <tbody>
                  ${myActiveProducts.length === 0 ? `
                    <tr><td colspan="7" style="text-align: center; padding: 40px; font-weight: 700; color: var(--text-secondary);">
                      لا توجد بضائع نشطة حالياً. اضغط على زر <strong>"➕ نشر بضاعة جديدة"</strong> أعلاه لنشر أول منتج!
                    </td></tr>
                  ` : myActiveProducts.map(p => `
                    <tr>
                      <td><img src="${p.image}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;"></td>
                      <td style="font-weight: 800; max-width: 240px;">${p.title}</td>
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
                          ${p.discountPercent > 0 ? `خصم ${p.discountPercent}%` : 'خصم / توصيل'}
                        </button>
                      </td>
                      <td>
                        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; font-weight: 800;" onclick="window.app.copyProductShareLink('${p.id}')" title="نسخ ومشاركة رابط المنتج">🔗 مشاركة</button>
                          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem; font-weight: 800;" onclick="window.app.openEditProductModal('${p.id}')">✏️ تعديل</button>
                          <button class="btn btn-secondary" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.openPosterModal('${p.id}')">📷 بوستر</button>
                          <button class="btn btn-danger" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.app.softDeleteMerchantProduct('${p.id}')" title="نقل للمحذوفات">🗑️ حذف</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <table class="admin-data-table">
                <thead>
                  <tr>
                    <th>الصورة</th>
                    <th>عنوان المنتج المحذوف</th>
                    <th>السعر</th>
                    <th>تاريخ الحذف</th>
                    <th>خيارات الاستعادة</th>
                  </tr>
                </thead>
                <tbody>
                  ${myDeletedProducts.length === 0 ? `
                    <tr><td colspan="5" style="text-align: center; padding: 40px; font-weight: 700; color: var(--text-secondary);">
                      سلة المحذوفات فارغة حالياً. لا توجد أي بضائع محذوفة.
                    </td></tr>
                  ` : myDeletedProducts.map(p => `
                    <tr>
                      <td><img src="${p.image}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover; opacity: 0.6;"></td>
                      <td style="font-weight: 800; max-width: 280px; color: var(--text-secondary); text-decoration: line-through;">${p.title}</td>
                      <td style="font-family: var(--font-numbers); font-weight: 800;">${Number(p.price).toLocaleString()} د.ع</td>
                      <td style="font-size: 0.8rem; color: var(--text-tertiary);">${p.deletedAt ? new Date(p.deletedAt).toLocaleDateString('ar-IQ') : 'مؤرشف'}</td>
                      <td>
                        <div style="display: flex; gap: 8px;">
                          <button class="btn btn-primary" style="padding: 4px 10px; font-size: 0.75rem; font-weight: 800;" onclick="window.app.restoreMerchantProduct('${p.id}')">♻️ استعادة للمتجر</button>
                          <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.75rem;" onclick="window.app.hardDeleteMerchantProduct('${p.id}')">❌ حذف نهائي</button>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}
          </div>

          <!-- 2. Mobile Responsive Card Grid View (Visible on smartphones <= 768px) -->
          <div class="merchant-mobile-grid">
            ${this.merchantActiveTab === 'active' ? (
              myActiveProducts.length === 0 ? `
                <div class="merchant-product-card" style="text-align: center; padding: 36px 16px;">
                  <div style="font-size: 2.5rem; margin-bottom: 8px;">📦</div>
                  <h3 style="font-size: 1.1rem; font-weight: 900; margin-bottom: 6px;">لا توجد بضائع نشطة حالياً</h3>
                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">ابدأ الآن بنشر أول منتج في متجرك بكل سهولة وسرعة!</p>
                  <button class="btn btn-primary" onclick="window.app.openAddProductModal()" style="width: 100%; padding: 12px; font-size: 1rem;">
                    ➕ نشر بضاعة جديدة الآن 🚀
                  </button>
                </div>
              ` : myActiveProducts.map(p => `
                <div class="merchant-product-card">
                  <div class="mpc-top-row">
                    <img src="${p.image}" class="mpc-thumb" alt="${p.title}">
                    <div class="mpc-info">
                      <div class="mpc-title">${p.title}</div>
                      <div class="mpc-meta-row">
                        <span class="mpc-price">${Number(p.price).toLocaleString()} د.ع</span>
                        <span class="badge ${p.condition === 'new' ? 'badge-new' : p.condition === 'used' ? 'badge-used' : 'badge-scrap'} mpc-badge">
                          ${p.conditionLabel || p.condition}
                        </span>
                        <span class="badge" style="background: rgba(16, 185, 129, 0.12); color: #10b981; font-weight: 800; font-size: 0.72rem;">
                          📦 ${p.quantity || 1} قطعة
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="mpc-controls-row">
                    <div style="display: flex; flex-direction: column; gap: 3px;">
                      <span style="font-size: 0.7rem; color: var(--text-tertiary); font-weight: 700;">حالة العرض:</span>
                      <select class="mpc-status-select" onchange="window.app.changeProductStatus('${p.id}', this.value)">
                        <option value="available" ${p.status === 'available' ? 'selected' : ''}>متوفر 🟢</option>
                        <option value="reserved" ${p.status === 'reserved' ? 'selected' : ''}>قيد الحجز ⏳</option>
                        <option value="sold" ${p.status === 'sold' ? 'selected' : ''}>تم البيع 🔴</option>
                      </select>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 3px;">
                      <span style="font-size: 0.7rem; color: var(--text-tertiary); font-weight: 700;">الخصم والتوصيل:</span>
                      <button class="btn btn-secondary mpc-discount-btn" onclick="window.app.openDiscountModal('${p.id}')">
                        ${p.discountPercent > 0 ? `🏷️ خصم ${p.discountPercent}%` : '🎁 خصم / توصيل'}
                      </button>
                    </div>
                  </div>

                  <div class="mpc-actions-toolbar" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
                    <button class="btn btn-secondary" style="padding: 7px 4px; font-size: 0.75rem; font-weight: 800;" onclick="window.app.copyProductShareLink('${p.id}')">🔗 مشاركة</button>
                    <button class="btn btn-secondary" style="padding: 7px 4px; font-size: 0.75rem;" onclick="window.app.openEditProductModal('${p.id}')">✏️ تعديل</button>
                    <button class="btn btn-secondary" style="padding: 7px 4px; font-size: 0.75rem;" onclick="window.app.openPosterModal('${p.id}')">📷 بوستر</button>
                    <button class="btn btn-danger" style="padding: 7px 4px; font-size: 0.75rem;" onclick="window.app.softDeleteMerchantProduct('${p.id}')" title="نقل للمحذوفات">🗑️ حذف</button>
                  </div>
                </div>
              `).join('')
            ) : (
              myDeletedProducts.length === 0 ? `
                <div class="merchant-product-card" style="text-align: center; padding: 36px 16px;">
                  <div style="font-size: 2.2rem; margin-bottom: 8px;">🎉</div>
                  <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: 6px;">سلة المحذوفات فارغة</h3>
                  <p style="font-size: 0.85rem; color: var(--text-secondary);">لا توجد أي بضائع محذوفة أو مؤرشفة حالياً.</p>
                </div>
              ` : myDeletedProducts.map(p => `
                <div class="merchant-product-card is-deleted">
                  <div class="mpc-top-row">
                    <img src="${p.image}" class="mpc-thumb" style="opacity: 0.6;" alt="${p.title}">
                    <div class="mpc-info">
                      <div class="mpc-title" style="text-decoration: line-through; color: var(--text-secondary);">${p.title}</div>
                      <div class="mpc-meta-row">
                        <span class="mpc-price" style="color: var(--text-tertiary);">${Number(p.price).toLocaleString()} د.ع</span>
                        <span class="badge badge-scrap mpc-badge">🗑️ محذوف</span>
                        <span style="font-size: 0.72rem; color: var(--text-tertiary);">📅 ${p.deletedAt ? new Date(p.deletedAt).toLocaleDateString('ar-IQ') : 'مؤرشف'}</span>
                      </div>
                    </div>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 4px;">
                    <button class="btn btn-primary" style="font-size: 0.82rem; padding: 8px;" onclick="window.app.restoreMerchantProduct('${p.id}')">♻️ استعادة للمتجر</button>
                    <button class="btn btn-danger" style="font-size: 0.82rem; padding: 8px;" onclick="window.app.hardDeleteMerchantProduct('${p.id}')">❌ حذف نهائي</button>
                  </div>
                </div>
              `).join('')
            )}
          </div>
        </div>
      </div>
    `;

    document.getElementById('tab-merchant-active')?.addEventListener('click', () => {
      this.merchantActiveTab = 'active';
      this.renderMerchantPortal();
    });

    document.getElementById('tab-merchant-deleted')?.addEventListener('click', () => {
      this.merchantActiveTab = 'deleted';
      this.renderMerchantPortal();
    });

    document.getElementById('btn-merchant-add-product')?.addEventListener('click', () => this.openAddProductModal());
    document.getElementById('btn-merchant-settings')?.addEventListener('click', () => this.openMerchantSettingsModal(merchant));
    document.getElementById('btn-merchant-logout')?.addEventListener('click', () => {
      AuthService.logoutMerchant();
      this.render();
    });
  }

  softDeleteMerchantProduct(productId) {
    if (confirm('هل ترغب بنقل هذا المنشور إلى سلة المحذوفات؟ (يمكنك استعادته في أي وقت)')) {
      ProductsService.softDeleteProduct(productId);
      this.render();
      this.showToast('تم نقل المنشور إلى سلة المحذوفات بنجاح 🗑️', 'info');
    }
  }

  restoreMerchantProduct(productId) {
    ProductsService.restoreProduct(productId);
    this.render();
    this.showToast('تمت استعادة المنشور وتفعيله في المتجر بنجاح! ♻️', 'success');
  }

  hardDeleteMerchantProduct(productId) {
    if (confirm('تحذير: هل أنت متأكد من رغبتك بحذف هذا المنشور نهائياً من السيرفر؟ لن يمكن التراجع بعد ذلك.')) {
      ProductsService.hardDeleteProduct(productId);
      this.render();
      this.showToast('تم حذف المنشور نهائياً', 'info');
    }
  }

  /* ==========================================================================
     Edit Product Modal
     ========================================================================== */
  openEditProductModal(productId) {
    const product = ProductsService.getProductById(productId);
    if (!product) return;

    let uploadedImagesList = product.images && product.images.length > 0 ? [...product.images] : [product.image];
    while (uploadedImagesList.length < 3) uploadedImagesList.push(null);

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <span>✏️</span>
            <span>تعديل بيانات المنشور (#${product.id})</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <!-- 3 Photo Slots -->
          <div class="form-group">
            <label class="form-label" style="font-weight: 800;">📸 صور المنتج (اختر صورة واحدة على الأقل):</label>
            <div class="image-upload-slots-grid">
              ${[1, 2, 3].map(slot => `
                <div class="image-upload-dropzone" id="edit-upload-slot-${slot}" style="padding: 10px; cursor: pointer; text-align: center; border: 2px dashed var(--border-strong); border-radius: 8px; background: var(--bg-surface-subtle);">
                  <div id="edit-preview-slot-${slot}" style="width: 100%; height: 85px; margin-bottom: 6px; ${uploadedImagesList[slot-1] ? 'display:block;' : 'display:none;'}">
                    ${uploadedImagesList[slot-1] ? `<img src="${uploadedImagesList[slot-1]}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">` : ''}
                  </div>
                  <span id="edit-slot-label-${slot}" style="font-size: 0.72rem; font-weight: 800; color: var(--text-secondary);">
                    ${uploadedImagesList[slot-1] ? `✅ الصورة ${slot}` : `📷 اختيار صورة ${slot}`}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">عنوان وموديل المنتج بدقة *</label>
            <input type="text" class="form-input" id="edit-prod-title" value="${product.title}">
          </div>

          <div class="modal-form-grid-3">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">السعر (د.ع) *</label>
              <input type="number" class="form-input" id="edit-prod-price" value="${product.price}">
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">الكمية المتوفرة *</label>
              <input type="number" class="form-input" id="edit-prod-qty" value="${product.quantity || 1}" min="0">
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">حالة القطعة *</label>
              <select class="form-select" id="edit-prod-condition">
                <option value="new" ${product.condition === 'new' ? 'selected' : ''}>✨ جديد غير مفتوح (NEW)</option>
                <option value="open_box" ${product.condition === 'open_box' ? 'selected' : ''}>📦 أوبن بوكس (Open Box)</option>
                <option value="used" ${product.condition === 'used' ? 'selected' : ''}>🔍 مستخدم (Used)</option>
                <option value="scrap" ${product.condition === 'scrap' ? 'selected' : ''}>🔧 عاطل - أدوات (SCRAP)</option>
              </select>
            </div>
          </div>

          <!-- Category Selection -->
          <div class="form-group">
            <label class="form-label">القسم / التصنيف *</label>
            <div class="form-input" id="edit-category-trigger" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-subtle); border: 1.5px solid var(--border-strong);">
              <span style="font-weight: 800; display: flex; align-items: center; gap: 8px;">
                <span id="edit-cat-icon">📦</span>
                <span id="edit-cat-name">${product.category || 'إلكترونيات'}</span>
              </span>
              <span class="btn btn-secondary" style="font-size: 0.75rem; padding: 3px 8px; pointer-events: none;">🔍 بحث / اختيار قسم</span>
            </div>
            <input type="hidden" id="edit-prod-cat" value="${product.category || 'إلكترونيات'}">
          </div>

          <!-- Merchant Manual Notes -->
          <div class="form-group">
            <label class="form-label">وصف وتفاصيل المنتج (ملاحظات التاجر اليدوية):</label>
            <textarea class="form-textarea" id="edit-prod-desc" rows="3">${product.description || ''}</textarea>
          </div>

          <!-- AI Details Box -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
            <label class="form-label" style="margin-bottom: 0;">تفاصيل ومواصفات مولدة بالذكاء الاصطناعي:</label>
            <button type="button" class="btn btn-secondary" id="btn-edit-generate-ai-desc" style="font-size: 0.78rem; padding: 6px 12px; font-weight: 800; color: #d97706; border-color: #f59e0b; background: rgba(245, 158, 11, 0.08);">
              ✨ توليد التفاصيل بالذكاء الاصطناعي 🤖
            </button>
          </div>

          <div class="form-group">
            <textarea class="form-textarea" id="edit-prod-ai-details" rows="5">${product.aiDetails || ''}</textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-edit-product">💾 حفظ التعديلات</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Edit Category Trigger
    modalOverlay.querySelector('#edit-category-trigger')?.addEventListener('click', () => {
      const currentVal = document.getElementById('edit-prod-cat')?.value || 'إلكترونيات';
      this.openCategoryPickerModal(currentVal, (chosenName, chosenIcon) => {
        document.getElementById('edit-prod-cat').value = chosenName;
        const iconEl = modalOverlay.querySelector('#edit-cat-icon');
        const nameEl = modalOverlay.querySelector('#edit-cat-name');
        if (iconEl) iconEl.textContent = chosenIcon || '📦';
        if (nameEl) nameEl.textContent = chosenName;
      });
    });

    // 3 upload slots for edit modal
    [1, 2, 3].forEach(slot => {
      const dropZone = modalOverlay.querySelector(`#edit-upload-slot-${slot}`);
      const previewBox = modalOverlay.querySelector(`#edit-preview-slot-${slot}`);
      const slotLabel = modalOverlay.querySelector(`#edit-slot-label-${slot}`);

      dropZone.addEventListener('click', () => {
        const prodTitle = document.getElementById('edit-prod-title')?.value.trim() || 'product';
        this.openMerchantGalleryModal(slot, prodTitle, (selectedUrl) => {
          uploadedImagesList[slot - 1] = selectedUrl;
          slotLabel.innerHTML = `✅ تم اختيار الصورة ${slot}`;
          previewBox.style.display = 'block';
          previewBox.innerHTML = `<img src="${selectedUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">`;
          this.showToast(`تم تحديث الصورة ${slot} بنجاح!`, 'success');
        });
      });
    });

    // AI Re-generator Button
    modalOverlay.querySelector('#btn-edit-generate-ai-desc')?.addEventListener('click', async () => {
      const title = document.getElementById('edit-prod-title').value.trim();
      const cat = document.getElementById('edit-prod-cat').value;
      const cond = document.getElementById('edit-prod-condition').value;

      if (!title) {
        this.showToast('يرجى كتابة عنوان وموديل المنتج أولاً!', 'error');
        return;
      }

      const btn = modalOverlay.querySelector('#btn-edit-generate-ai-desc');
      btn.innerHTML = `⏳ جاري استخراج المواصفات...`;
      btn.disabled = true;

      try {
        const aiDesc = await AIService.generateProductDescription(title, cat, cond);
        document.getElementById('edit-prod-ai-details').value = aiDesc;
        btn.innerHTML = `✅ تم توليد المواصفات بنجاح`;
        btn.disabled = true;
        this.showToast(`تم استخراج مواصفات (${title}) بنجاح!`, 'success');
      } catch (err) {
        btn.innerHTML = `✨ إعادة توليد التفاصيل بالذكاء الاصطناعي 🤖`;
        btn.disabled = false;
        this.showToast(err.message, 'error');
      }
    });

    // Save Edit
    modalOverlay.querySelector('#btn-save-edit-product')?.addEventListener('click', () => {
      const title = document.getElementById('edit-prod-title').value.trim();
      const price = Number(document.getElementById('edit-prod-price').value);
      const quantity = Number(document.getElementById('edit-prod-qty').value);
      const condition = document.getElementById('edit-prod-condition').value;
      const category = document.getElementById('edit-prod-cat').value;
      const description = document.getElementById('edit-prod-desc').value.trim();
      const aiDetails = document.getElementById('edit-prod-ai-details').value.trim();

      const validImages = uploadedImagesList.filter(Boolean);

      if (!title || !price) {
        this.showToast('يرجى إدخال العنوان والسعر', 'error');
        return;
      }

      if (validImages.length === 0) {
        this.showToast('يرجى اختيار صورة واحدة على الأقل للمنتج', 'error');
        return;
      }

      ProductsService.updateProduct(product.id, {
        title,
        price,
        quantity,
        condition,
        conditionLabel: PRODUCT_CONDITIONS[condition.toUpperCase()]?.label || condition,
        category,
        description,
        aiDetails,
        images: validImages,
        image: validImages[0]
      });

      modalOverlay.remove();
      this.render();
      this.showToast('تم حفظ وتحديث بيانات المنشور بنجاح! 💾', 'success');
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
     6. Add Product Modal (3-Images Cloud Upload + Deep Generative AI Copywriter)
     ========================================================================== */
  openAddProductModal() {
    const merchant = AuthService.getCurrentMerchant();
    const uploadedImagesList = [];

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title">
            <span>➕</span>
            <span>نشر بضاعة جديدة (رفع 3 صور + ذكاء اصطناعي)</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <!-- 3-Image Upload Slots -->
          <label class="form-label" style="font-weight: 800;">📸 صور المنتج (ارفع حتى 3 صور مع ختم المنصة السحابي):</label>
          <div class="image-upload-slots-grid">
            ${[1, 2, 3].map(slot => `
              <div class="image-upload-zone" id="upload-slot-${slot}" style="padding: 12px 6px; text-align: center; cursor: pointer; position: relative; margin-bottom: 0;">
                <div id="slot-icon-${slot}" style="font-size: 1.5rem; margin-bottom: 2px;">📷</div>
                <div id="slot-label-${slot}" style="font-size: 0.72rem; font-weight: 800;">صورة ${slot} ${slot === 1 ? '(الرئيسية *)' : '(إضافية)'}</div>
                <input type="file" id="file-slot-input-${slot}" accept="image/*" style="display: none;">
                <div id="preview-slot-${slot}" style="display: none; aspect-ratio: 1/1; width: 100%; margin-top: 4px; border-radius: 6px; overflow: hidden; border: 2px solid var(--brand-primary);"></div>
              </div>
            `).join('')}
          </div>

          <div class="form-group">
            <label class="form-label">عنوان وموديل المنتج بدقة *</label>
            <input type="text" class="form-input" id="new-prod-title" placeholder="مثال: سماعة لوجيتك أصلية G432 محيطية 7.1 احترافية">
          </div>

          <div class="modal-form-grid-3">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">السعر (د.ع) *</label>
              <input type="number" class="form-input" id="new-prod-price" placeholder="45000">
            </div>

            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">الكمية المتوفرة *</label>
              <input type="number" class="form-input" id="new-prod-qty" value="1" min="1">
            </div>

            <!-- Exact 4 Condition Choices -->
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">حالة القطعة *</label>
              <select class="form-select" id="new-prod-condition">
                <option value="new">✨ جديد غير مفتوح (NEW)</option>
                <option value="open_box" selected>📦 أوبن بوكس (Open Box)</option>
                <option value="used">🔍 مستخدم (Used)</option>
                <option value="scrap">🔧 عاطل - أدوات (SCRAP)</option>
              </select>
            </div>
          </div>

          <!-- Category with In-App Search & Inline Creator Trigger -->
          <div class="form-group">
            <label class="form-label">القسم / التصنيف *</label>
            <div class="form-input" id="selected-category-trigger" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-subtle); border: 1.5px solid var(--border-strong);">
              <span style="font-weight: 800; display: flex; align-items: center; gap: 8px;">
                <span id="selected-cat-icon">📦</span>
                <span id="selected-cat-name">إلكترونيات</span>
              </span>
              <span class="btn btn-secondary" style="font-size: 0.75rem; padding: 3px 8px; pointer-events: none;">🔍 بحث / اختيار قسم</span>
            </div>
            <input type="hidden" id="new-prod-cat" value="إلكترونيات">
          </div>

          <!-- Merchant Manual Notes -->
          <div class="form-group">
            <label class="form-label">وصف وتفاصيل المنتج (ملاحظات التاجر اليدوية):</label>
            <textarea class="form-textarea" id="new-prod-desc" rows="3" placeholder="اكتب أي ملاحظات أو تفاصيل يدوية خاصة بالقطعة هنا..."></textarea>
          </div>

          <!-- AI Generator Section -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; flex-wrap: wrap; gap: 6px;">
            <label class="form-label" style="margin-bottom: 0;">تفاصيل ومواصفات مولدة بالذكاء الاصطناعي:</label>
            <button type="button" class="btn btn-secondary" id="btn-generate-ai-desc" style="font-size: 0.78rem; padding: 6px 12px; font-weight: 800; color: #d97706; border-color: #f59e0b; background: rgba(245, 158, 11, 0.08);">
              ✨ توليد تفاصيل بالذكاء الاصطناعي 🤖
            </button>
          </div>

          <div class="form-group">
            <textarea class="form-textarea" id="new-prod-ai-details" rows="5" placeholder="اضغط زر (توليد تفاصيل بالذكاء الاصطناعي) أعلاه لتوليد الاسم والمواصفات والأسعار التقديرية تلقائياً..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-new-product">نشر المنتج الآن 🚀</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // In-App Category Picker Trigger
    modalOverlay.querySelector('#selected-category-trigger')?.addEventListener('click', () => {
      const currentVal = document.getElementById('new-prod-cat')?.value || 'إلكترونيات';
      this.openCategoryPickerModal(currentVal, (chosenName, chosenIcon) => {
        document.getElementById('new-prod-cat').value = chosenName;
        const iconEl = modalOverlay.querySelector('#selected-cat-icon');
        const nameEl = modalOverlay.querySelector('#selected-cat-name');
        if (iconEl) iconEl.textContent = chosenIcon || '📦';
        if (nameEl) nameEl.textContent = chosenName;
        this.showToast(`تم اختيار قسم (${chosenName}) بنجاح!`, 'success');
      });
    });

    // Setup 3 upload slots connected to Merchant Cloud Gallery
    [1, 2, 3].forEach(slot => {
      const dropZone = modalOverlay.querySelector(`#upload-slot-${slot}`);
      const previewBox = modalOverlay.querySelector(`#preview-slot-${slot}`);
      const slotLabel = modalOverlay.querySelector(`#slot-label-${slot}`);

      dropZone.addEventListener('click', () => {
        const prodTitle = document.getElementById('new-prod-title')?.value.trim() || 'product';
        this.openMerchantGalleryModal(slot, prodTitle, (selectedUrl) => {
          uploadedImagesList[slot - 1] = selectedUrl;
          slotLabel.innerHTML = `✅ تم اختيار الصورة`;
          previewBox.style.display = 'block';
          previewBox.innerHTML = `
            <img src="${selectedUrl}" style="width:100%; height:100%; object-fit:cover;">
            <div style="font-size: 0.65rem; color: #10b981; font-weight: 800; padding: 2px 4px; background: rgba(15, 23, 42, 0.85); color: #fff; text-align: center; border-top: 1px solid var(--border-subtle);">Google Firebase ☁️</div>
          `;
          this.showToast(`تم تعيين الصورة ${slot} بنجاح!`, 'success');
        });
      });
    });

    // Deep Generative AI Copywriter Button (Locked to 1 click per product)
    const aiBtn = modalOverlay.querySelector('#btn-generate-ai-desc');
    const titleInput = document.getElementById('new-prod-title');

    // Re-enable if title changes
    titleInput?.addEventListener('input', () => {
      if (aiBtn && aiBtn.disabled) {
        aiBtn.disabled = false;
        aiBtn.innerHTML = `✨ توليد تفاصيل بالذكاء الاصطناعي 🤖`;
      }
    });

    aiBtn?.addEventListener('click', async () => {
      const title = document.getElementById('new-prod-title').value.trim();
      const cat = document.getElementById('new-prod-cat').value;
      const cond = document.getElementById('new-prod-condition').value;

      if (!title) {
        this.showToast('يرجى كتابة عنوان وموديل المنتج أولاً!', 'error');
        document.getElementById('new-prod-title').focus();
        return;
      }

      aiBtn.innerHTML = `⏳ جاري استخراج المواصفات...`;
      aiBtn.disabled = true;

      try {
        const aiDesc = await AIService.generateProductDescription(title, cat, cond);
        document.getElementById('new-prod-ai-details').value = aiDesc;

        aiBtn.innerHTML = `✅ تم توليد المواصفات بنجاح`;
        aiBtn.disabled = true;
        this.showToast(`تم استخراج مواصفات (${title}) بنجاح!`, 'success');
      } catch (err) {
        aiBtn.innerHTML = `✨ توليد تفاصيل بالذكاء الاصطناعي 🤖`;
        aiBtn.disabled = false;
        this.showToast(err.message, 'error');
      }
    });

    modalOverlay.querySelector('#btn-save-new-product')?.addEventListener('click', () => {
      const title = document.getElementById('new-prod-title').value.trim();
      const price = Number(document.getElementById('new-prod-price').value);
      const quantity = Number(document.getElementById('new-prod-qty').value) || 1;
      const condition = document.getElementById('new-prod-condition').value;
      const category = document.getElementById('new-prod-cat').value;
      const description = document.getElementById('new-prod-desc').value.trim();
      const aiDetails = document.getElementById('new-prod-ai-details').value.trim();
      const aiEnabled = true;

      if (!title || !price) {
        this.showToast('يرجى إدخال العنوان والسعر', 'error');
        return;
      }

      const validImages = uploadedImagesList.filter(Boolean);
      if (validImages.length === 0) {
        this.showToast('يرجى اختيار صورة واحدة على الأقل للمنتج', 'error');
        return;
      }

      const primaryImage = validImages[0];

      ProductsService.addProduct({
        title,
        price,
        quantity,
        condition,
        conditionLabel: PRODUCT_CONDITIONS[condition.toUpperCase()]?.label || condition,
        category,
        description: description || '',
        aiDetails: aiDetails || '',
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

  /* ==========================================================================
     Merchant Profile & Custom Store Settings Modal
     ========================================================================== */
  openMerchantSettingsModal(merchant) {
    if (!merchant) merchant = AuthService.getCurrentMerchant();
    if (!merchant) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay active';
    modalOverlay.innerHTML = `
      <div class="modal-container" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <div class="modal-title" style="display: flex; align-items: center; gap: 8px;">
            <span>⚙️</span>
            <span>إعدادات المتجر والبروفايل الشخصي</span>
          </div>
          <div class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</div>
        </div>

        <div class="modal-body">
          <!-- Profile Avatar Preview & Upload -->
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding: 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1.5px solid var(--border-strong);">
            <img src="${merchant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'}" id="setting-avatar-preview" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 2px solid var(--brand-primary);">
            <div style="flex: 1;">
              <label class="form-label" style="margin-bottom: 4px;">صورة اللوجو / البروفايل</label>
              <input type="text" class="form-input" id="setting-m-avatar" value="${merchant.avatar || ''}" placeholder="رابط صورة اللوجو (أو اختر من المعرض)">
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <button type="button" class="btn btn-secondary" id="btn-pick-avatar-gallery" style="font-size: 0.75rem; padding: 4px 10px;">
                  🖼️ اختيار من المعرض السحابي
                </button>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label class="form-label">اسم التاجر / المتجر *</label>
              <input type="text" class="form-input" id="setting-m-name" value="${merchant.name || ''}" placeholder="مثال: أبو وارث أمازون">
            </div>

            <div class="form-group">
              <label class="form-label">رقم هاتف الواتساب *</label>
              <input type="tel" class="form-input" id="setting-m-phone" value="${merchant.phone || ''}" placeholder="077XXXXXXXX">
            </div>
          </div>

          <!-- Custom Domain / Store Slug -->
          <div class="form-group">
            <label class="form-label">رابط ودومين صفحة المتجر المخصصة (/seller/...) *</label>
            <div style="display: flex; align-items: center; gap: 6px; direction: ltr;">
              <span style="font-size: 0.85rem; color: var(--text-tertiary); font-weight: 700; white-space: nowrap;">souk-al-balat.vercel.app/seller/</span>
              <input type="text" class="form-input" id="setting-m-slug" value="${merchant.slug || merchant.id || 'alwareth'}" placeholder="alwareth" style="direction: ltr; font-weight: 800; font-family: var(--font-numbers);">
            </div>
            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px;">
              يمكنك كتابة معرفك الخاص مثل (alwareth أو store1) لمشاركته مع زبائنك لفتح متجرك المباشر.
            </div>
          </div>

          <!-- Store Bio / Description -->
          <div class="form-group">
            <label class="form-label">نبذة عن المتجر وبضائعك:</label>
            <textarea class="form-textarea" id="setting-m-bio" rows="2" placeholder="اكتب نبذة تعريفية لزبائنك...">${merchant.bio || ''}</textarea>
          </div>

          <!-- Social Links -->
          <div style="margin-top: 10px;">
            <label class="form-label">روابط التواصل الاجتماعي الرسمية:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="url" class="form-input" id="setting-m-fb" value="${merchant.socials?.facebook || ''}" placeholder="رابط الفيسبوك">
              <input type="url" class="form-input" id="setting-m-tiktok" value="${merchant.socials?.tiktok || ''}" placeholder="رابط تيك توك">
            </div>
          </div>

          <!-- Change Passcode -->
          <div style="margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--border-subtle);">
            <label class="form-label">تغيير رمز الدخول السري (اتركه فارغاً إذا لم ترغب بتغييره):</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <input type="password" class="form-input" id="setting-m-old-pass" placeholder="الرمز القديم">
              <input type="password" class="form-input" id="setting-m-new-pass" placeholder="الرمز الجديد">
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display: flex; justify-content: space-between;">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">إلغاء</button>
          <button class="btn btn-primary" id="btn-save-merchant-settings-act" style="font-weight: 800; padding: 10px 24px;">
            💾 حفظ إعدادات المتجر
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    // Pick avatar from gallery
    modalOverlay.querySelector('#btn-pick-avatar-gallery')?.addEventListener('click', () => {
      this.openMerchantGalleryModal(1, 'avatar', (selectedUrl) => {
        document.getElementById('setting-m-avatar').value = selectedUrl;
        document.getElementById('setting-avatar-preview').src = selectedUrl;
      });
    });

    modalOverlay.querySelector('#setting-m-avatar')?.addEventListener('input', (e) => {
      document.getElementById('setting-avatar-preview').src = e.target.value;
    });

    modalOverlay.querySelector('#btn-save-merchant-settings-act')?.addEventListener('click', async () => {
      const name = document.getElementById('setting-m-name').value.trim();
      const phone = document.getElementById('setting-m-phone').value.trim();
      const slug = document.getElementById('setting-m-slug').value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      const avatar = document.getElementById('setting-m-avatar').value.trim();
      const bio = document.getElementById('setting-m-bio').value.trim();
      const fb = document.getElementById('setting-m-fb').value.trim();
      const tiktok = document.getElementById('setting-m-tiktok').value.trim();
      const oldPass = document.getElementById('setting-m-old-pass').value.trim();
      const newPass = document.getElementById('setting-m-new-pass').value.trim();

      if (!name || !phone) {
        this.showToast('يرجى كتابة الاسم ورقم الهاتف!', 'error');
        return;
      }

      if (newPass) {
        if (!oldPass) {
          this.showToast('يرجى إدخال الرمز القديم لتأكيد تغييره!', 'error');
          return;
        }
        const passRes = await AuthService.changeMerchantPasscode(merchant.id, oldPass, newPass);
        if (!passRes.success) {
          this.showToast(passRes.message, 'error');
          return;
        }
      }

      const updateData = {
        name,
        phone,
        slug: slug || merchant.id,
        avatar: avatar || merchant.avatar,
        bio,
        socials: {
          facebook: fb,
          tiktok: tiktok,
          whatsapp: `https://api.whatsapp.com/send?phone=964${phone.replace(/[^0-9]/g,'').slice(-10)}`
        }
      };

      const res = await AuthService.updateMerchant(merchant.id, updateData);
      if (res.success) {
        modalOverlay.remove();
        this.render();
        this.showToast('تم حفظ وتحديث إعدادات المتجر والبروفايل بنجاح! 💾', 'success');
      } else {
        this.showToast(res.message, 'error');
      }
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

            <div class="admin-nav-item" onclick="window.app.navigate('/')" style="margin-top: 10px; border-top: 1px solid #1e293b;">
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
            <div class="modal-form-grid-2">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">أجور التوصيل الثابتة (د.ع)</label>
                <input type="number" class="form-input" id="cfg-delivery-fee" value="${this.siteSettings.deliveryFee}">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">هاتف واتساب إدارة الموقع</label>
                <input type="text" class="form-input" id="cfg-support-phone" value="${this.siteSettings.supportPhone}">
              </div>
            </div>
            <button class="btn btn-primary" id="btn-save-general-settings" style="margin-top: 10px;">💾 حفظ الإعدادات</button>
          </div>

          <!-- Google Gemini AI Engine Secure Key Card -->
          <div class="admin-card-section" style="border: 2px solid #f59e0b; background: rgba(245, 158, 11, 0.03);">
            <div class="admin-card-section-header">
              <div class="admin-card-section-title" style="color: #d97706;">🤖 إعداد وتفعيل مفتاح Google Gemini AI الرسمي للمنصة</div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px; line-height: 1.6;">
              أدخل مفتاح Google Gemini API الجديد الخاص بك من حسابك في <a href="https://aistudio.google.com/app/apikey" target="_blank" style="color: #3b82f6; font-weight: 800; text-decoration: underline;">Google AI Studio ↗</a>. يتم حفظ المفتاح هنا بأمان تام في لوحة الإدارة ولن ينكشف في أي ملفات عامة، مما يجعله متوافقاً 100% مع قوانين Google ولا يتم حظره أبداً.
            </p>
            <div class="form-group">
              <label class="form-label">مفتاح Google Gemini API Key</label>
              <div style="display: flex; gap: 8px;">
                <input type="password" class="form-input" id="cfg-gemini-key" placeholder="AIzaSy..." value="${localStorage.getItem('souk_gemini_api_key') || ''}">
                <button type="button" class="btn btn-secondary" onclick="const f = document.getElementById('cfg-gemini-key'); f.type = f.type === 'password' ? 'text' : 'password';">👁️</button>
              </div>
            </div>
            <button class="btn btn-primary" id="btn-save-gemini-key" style="margin-top: 10px; background: #d97706; border-color: #d97706;">
              💾 حفظ وتفعيل مفتاح الذكاء الاصطناعي لجميع التجار
            </button>
          </div>

          <!-- Master Admin Key Change Card -->
          <div class="admin-card-section" style="border: 2px solid var(--brand-primary);">
            <div class="admin-card-section-header">
              <div class="admin-card-section-title">🔐 تغيير رمز الأمان السيادي للموقع (Master Admin Key)</div>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 14px;">
              تغيير الرمز السري الذي يمكنك من خلاله تسجيل الدخول إلى لوحة إدارة الموقع السيادية. يتم تشفير الرمز فوراً بخوارزمية SHA-256 المشفرة.
            </p>
            <div class="modal-form-grid-2">
              <div class="form-group" style="margin-bottom: 0;">
                <label class="form-label">رمز الأمان الحالي *</label>
                <input type="password" class="form-input" id="adm-cur-key" placeholder="••••••••" autocomplete="new-password">
              </div>
              <div class="form-group" style="margin-bottom: 0;">
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

          <div class="admin-table-container merchant-desktop-table">
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

          <!-- Mobile Cards for Merchants -->
          <div class="merchant-mobile-grid">
            ${merchants.map(m => `
              <div class="merchant-product-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h3 style="font-size: 1.05rem; font-weight: 900; margin-bottom: 2px;">${m.name}</h3>
                    <div style="font-size: 0.8rem; color: var(--text-tertiary);">${m.roleLabel || 'تاجر معتمد'} | 📞 ${m.phone}</div>
                  </div>
                  <span class="badge ${m.status === 'active' ? 'badge-new' : 'badge-scrap'}">
                    ${m.status === 'active' ? 'نشط 🟢' : 'محظور 🔴'}
                  </span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface-subtle); padding: 8px 12px; border-radius: var(--radius-sm);">
                  <span style="font-size: 0.8rem; font-weight: 800;">📦 البضائع: ${allProducts.filter(p => p.merchantId === m.id).length} قطعة</span>
                  <span style="font-size: 0.75rem; color: #10b981; font-weight: 700;">🔒 كود محمي</span>
                </div>

                <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 8px;">
                  <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 8px;" onclick="window.app.openEditMerchantModal('${m.id}')">✏️ تعديل / تعيين رمز</button>
                  ${m.status === 'active' ? `
                    <button class="btn btn-danger" style="font-size: 0.8rem; padding: 8px;" onclick="window.app.promptBanMerchant('${m.id}')">🚫 حظر</button>
                  ` : `
                    <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 8px;" onclick="window.app.unbanMerchant('${m.id}')">✅ تفعيل</button>
                  `}
                </div>
              </div>
            `).join('')}
          </div>
        `;

      case 'products':
        return `
          <div class="admin-header-title">
            <h1>📦 الرقابة الشاملة على كافة المنتجات والبضائع</h1>
          </div>

          <div class="admin-table-container merchant-desktop-table">
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

          <!-- Mobile Cards for Admin Products -->
          <div class="merchant-mobile-grid">
            ${allProducts.length === 0 ? `
              <div class="merchant-product-card" style="text-align:center; padding: 30px;">لا توجد أي بضائع منشورة حالياً.</div>
            ` : allProducts.map(p => `
              <div class="merchant-product-card">
                <div class="mpc-top-row">
                  <img src="${p.image}" class="mpc-thumb" alt="${p.title}">
                  <div class="mpc-info">
                    <div class="mpc-title">${p.title}</div>
                    <div class="mpc-meta-row">
                      <span class="mpc-price">${Number(p.price).toLocaleString()} د.ع</span>
                      <span class="badge ${p.status === 'available' ? 'badge-new' : p.status === 'reserved' ? 'badge-used' : 'badge-scrap'}">
                        ${p.status === 'available' ? 'متوفر 🟢' : p.status === 'reserved' ? 'محجوز ⏳' : 'تم البيع 🔴'}
                      </span>
                    </div>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: var(--text-secondary); background: var(--bg-surface-subtle); padding: 6px 10px; border-radius: var(--radius-sm);">
                  <span>التاجر: <strong>${p.merchantName}</strong></span>
                  <span>المخزون: <strong>${p.quantity || 1} قطعة</strong></span>
                </div>
                <button class="btn btn-danger" style="width: 100%; padding: 8px; font-size: 0.82rem;" onclick="window.app.adminDeleteProduct('${p.id}')">
                  🗑️ حذف البضاعة نهائياً
                </button>
              </div>
            `).join('')}
          </div>
        `;

      case 'categories':
        return `
          <div class="admin-header-title">
            <h1>🗂️ إدارة وتعديل أقسام وتصنيفات المتجر</h1>
            <button class="btn btn-primary" id="btn-admin-add-cat">➕ إضافة قسم جديد</button>
          </div>

          <div class="admin-table-container merchant-desktop-table">
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

          <!-- Mobile Cards for Categories -->
          <div class="merchant-mobile-grid">
            ${this.categories.map(c => `
              <div class="merchant-product-card">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.6rem;">${c.icon}</span>
                    <div>
                      <h4 style="font-weight: 800; font-size: 1rem;">${c.name}</h4>
                      <code style="font-size: 0.75rem; color: var(--text-tertiary);">${c.id}</code>
                    </div>
                  </div>
                  <span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #d97706; font-weight: 800;">
                    ${allProducts.filter(p => c.id === 'all' || p.category === c.id).length} قطعة
                  </span>
                </div>
                ${c.id !== 'all' ? `
                  <button class="btn btn-danger" style="width: 100%; padding: 6px; font-size: 0.8rem; margin-top: 4px;" onclick="window.app.deleteCategory('${c.id}')">
                    🗑️ حذف القسم
                  </button>
                ` : ''}
              </div>
            `).join('')}
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

    document.getElementById('btn-save-gemini-key')?.addEventListener('click', () => {
      const keyVal = document.getElementById('cfg-gemini-key')?.value.trim() || '';
      localStorage.setItem('souk_gemini_api_key', keyVal);
      this.showToast('تم حفظ وتفعيل مفتاح Google Gemini API لجميع التجار بنجاح! 🚀', 'success');
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
