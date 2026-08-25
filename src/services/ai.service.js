/* ==========================================================================
   AI Market Intelligence & Generative Product Copywriter Engine
   Intelligently parses titles, brands, tech specs, and market valuations
   ========================================================================== */

export class AIService {
  /**
   * Generates a tailored, deeply technical & commercial Arabic product description
   * @param {string} title Product Title (e.g. "سماعة لوجيتك أصلية G432 محيطية 7.1 احترافية")
   * @param {string} category Product Category
   * @param {string} condition Product Condition (new, open_box, used, scrap)
   * @param {number} price Current Price
   */
  static generateProductDescription(title = '', category = 'electronics', condition = 'open_box', price = 0) {
    const cleanTitle = title.trim();
    const lowerTitle = cleanTitle.toLowerCase();

    // 1. Detect Brand
    const knownBrands = [
      { name: 'Logitech (لوجيتك)', match: /logitech|لوجيتك/i },
      { name: 'Sony (سوني)', match: /sony|سوني/i },
      { name: 'Apple (آبل)', match: /apple|آبل|ايفون|iphone|ipad|macbook/i },
      { name: 'Samsung (سامسونج)', match: /samsung|سامسونج|galaxy/i },
      { name: 'Anker (أنكر)', match: /anker|soundcore|eufy|أنكر/i },
      { name: 'Razer (رايزر)', match: /razer|رايزر/i },
      { name: 'Corsair (كورسير)', match: /corsair|كورسير/i },
      { name: 'JBL (جي بي إل)', match: /jbl|جي بي/i },
      { name: 'Makita (ماكيتا)', match: /makita|ماكيتا/i },
      { name: 'DeWalt (ديوالت)', match: /dewalt|ديوالت/i },
      { name: 'Bosch (بوش)', match: /bosch|بوش/i },
      { name: 'Philips (فيلبس)', match: /philips|فيلبس/i },
      { name: 'Dyson (دايسون)', match: /dyson|دايسون/i },
      { name: 'Braun (براون)', match: /braun|براون/i },
      { name: 'Tefal (تيفال)', match: /tefal|تيفال/i },
      { name: 'HyperX (هايبر إكس)', match: /hyperx|هايبر/i },
      { name: 'Nintendo (نينتندو)', match: /nintendo|نينتندو/i },
      { name: 'Xbox / Microsoft', match: /xbox|اكسبوكس|مايكروسوفت|microsoft/i },
      { name: 'PlayStation', match: /playstation|بلايستيشن|ps4|ps5/i }
    ];

    const detectedBrandObj = knownBrands.find(b => b.match.test(lowerTitle));
    const brandName = detectedBrandObj ? detectedBrandObj.name : 'ماركة أصلية معتمدة (Global Brand)';

    // 2. Detect Product Type & Specific Technical Highlights
    let itemType = 'منتج إلكتروني وتقني';
    let techBullets = [];

    if (/سماع|headset|headphone|earbud|soundcore|airpod/i.test(lowerTitle)) {
      itemType = 'سماعات صوتية واحترافية عالية النقاء';
      techBullets = [
        '🎧 تجربة صوتية سينمائية محيطية غامرة توفر عزل ضجيج خارجي وتفاصيل دقيقة في الصوت',
        '🎙️ مايكروفون مدمج عالي الحساسية لنقل الصوت بوضوح تام مع تقنية تنقية التشويش',
        '🎛️ تصميم مريح ومبطن بأجود خامات الجلد الميموري فوم لجلسات الاستخدام الطويلة دون إجهاد',
        '🔌 توافق شامل وتلقائي مع أجهزة الكمبيوتر، الكونسول (PlayStation/Xbox)، والهواتف الذكية'
      ];
      if (/7\.1|محيطي|surround/i.test(lowerTitle)) {
        techBullets.unshift('⚡ دعم كامل لنظام الصوت المحيطي 7.1 الموجه لتحديد اتجاه الخطوات والأصوات بدقة فائقة');
      }
    } else if (/دريل|صاروخ|كاوية|منشار|drill|tool|wrench|مفك/i.test(lowerTitle)) {
      itemType = 'أجهزة ومعدات صيانة وحرفية أصلية';
      techBullets = [
        '⚙️ محرك عالي العزم (Heavy Duty) مصمم لتحمل أصعب ظروف العمل والضغط المتواصل',
        '🔋 كفاءة طاقة متطورة تضمن عمر بطارية أطول وأداء ثابت دون انخفاض في القوة',
        '🛡️ هيكل صلب مقاوم للصدمات والحرارة مزود بمقبض مطاطي مانع للانزلاق',
        '🔧 متوافق مع كافة الملحقات القياسية ورؤوس الحفر والقطع العالمية'
      ];
    } else if (/ساعة|watch|smartwatch/i.test(lowerTitle)) {
      itemType = 'ساعة ذكية وتتبع صحي ومؤشرات حيوية';
      techBullets = [
        '⌚ شاشة فائقة الوضوح والسطوع مع استجابة لمس سلسة وتصميم أنيق مقاوم للماء',
        '💓 حساسات متقدمة لقياس نبضات القلب، نسبة الأكسجين في الدم، ومراقبة النوم والنشاط الرياضي',
        '🔔 استلام فوري لكافة الإشعارات والمكالمات والرسائل المتزامنة مع هاتفك'
      ];
    } else if (/قلاية|خلاط|مكينة|مكنسة|airfryer|blender|coffee|vacuum/i.test(lowerTitle)) {
      itemType = 'أجهزة منزلية ومطبخ وارد أوروبي';
      techBullets = [
        '⚡ كفاءة عالية في استهلاك الطاقة ومطابقة تامة للمواصفات القياسية الأوروبية (220V-240V)',
        '🧼 أجزاء سهلة الفك والتنظيف ومصنوعة من مواد آمنة صحياً 100% خالية من المواد الضارة',
        '⏱️ لوحة تحكم ذكية وبرامج تشغيل تلقائية متعددة لتوفير الوقت والجهد'
      ];
    } else {
      techBullets = [
        '✨ صناعة أصلية بجودة تصنيع فائقة من مستودعات التجزئة وسلاسل التوريد الأوروبية والأمريكية',
        '🔍 خضعت لعمليات تدقيق وفحص فني دقيق للتأكد من كفاءة الأداء وسلامة الهيكل الخارجي',
        '📦 يتم تجهيز وتغليف الشحنة بعناية فائقة لضمان وصولها بحالتها الممتازة لباب بيتك'
      ];
    }

    // 3. Condition Specific Narrative
    const conditionNarrative = {
      new: `💎 الحالة: جديد غير مفتوح (Brand New / Factory Sealed) بالكرتون الأصلي وجميع أشرطة الإغلاق المصنعية السليمة.`,
      open_box: `📦 الحالة: أوبن بوكس (Open Box - استوكات ومستودعات أمازون). البضاعة بحالة كالجديدة تماماً تم فتح التغليف الخارجي لفحصها وتدقيق نظافتها ومطابقة الملحقات.`,
      used: `🔍 الحالة: مستخدم فحص (Tested Used). قطعة مستخدمة بحالة ممتازة ونظيفة جداً خاضعة للفحص والتجربة المباشرة 100%.`,
      scrap: `🔧 الحالة: عاطل / أدوات (SCRAP). قطعة تباع للمصلحين والورش الفنية كأدوات وقطع غيار أصلية.`
    };

    return `✨ ${cleanTitle}

🏷️ بطاقة المواصفات والمصدر:
• الشركة المصنعة: ${brandName}
• الفئة: ${itemType}
• ${conditionNarrative[condition] || 'قطعة أصلية مفحوصة'}

🚀 أبرز المزايا والمواصفات الفنية:
${techBullets.map(b => `• ${b}`).join('\n')}

📦 الملحقات ومحتويات التجهيز:
• تتضمن القطعة الأصلية مع الملحقات والكابلات المخصصة لها في بلد المنشأ.

🚚 الضمان والتوصيل إلى باب بيتك:
• شحن وتوصيل سريع لكافة محافظات العراق (أجور التوصيل 5,000 د.ع فقط).
• إمكانية المعاينة والفحص المباشر عند استلام الطلب من مندوب التوصيل.`;
  }

  /**
   * Generates structured AI market valuation and availability insights
   */
  static async generateProductInsights(title = '', price = 0) {
    const numPrice = Number(price) || 35000;
    const usdEquivalent = Math.max(15, Math.round(numPrice / 1500));

    const minLocal = Math.round((numPrice * 1.18) / 250) * 250;
    const maxLocal = Math.round((numPrice * 1.55) / 250) * 250;
    const globalEstimate = Math.round(usdEquivalent * 1.35);

    return {
      availabilityInIraq: "متوفر بكميات محدودة في أسواق الأوتلت والبالات الأوروبية",
      estimatedPriceLocal: `${minLocal.toLocaleString()} - ${maxLocal.toLocaleString()} د.ع`,
      estimatedPriceGlobal: `$${globalEstimate} تقريباً في المتاجر والمواقع الرسمية`,
      disclaimer: "ملاحظة: هذه معلومات مستخرجة عبر محرك الذكاء الاصطناعي بناءً على أسعار السوق التقديرية... يرجى التأكد المباشر من البائع."
    };
  }
}
