import { OfferItem, ProjectItem, ServiceItem, SiteContent, TestimonialItem } from '../types';

export const PROTEC_LOGO_URL = '/assets/protec-logo.png';
export const PROTEC_LOGO_DARK_URL = '/assets/protec-logo-dark.png';
export const PROTEC_MARK_URL = '/assets/protec-mark.png';
export const PROTEC_MARK_DARK_URL = '/assets/protec-mark-dark.png';

export const GENERATED_IMAGES = {
  hero: '/src/assets/images/hero_protec_landscape_1795348344206.jpg',
  plantProtection: '/src/assets/images/service_plant_protection_1795348345527.jpg',
  irrigation: '/src/assets/images/service_irrigation_network_1795348344380.jpg',
  beforeArid: '/src/assets/images/project_before_arid_1795348344409.jpg',
  afterLush: '/src/assets/images/project_after_lush_1795348344098.jpg',
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  heroTitleAr: 'هندسة اللاندسكيب ووقاية النبات بمعايير علمية مستدامة',
  heroTitleEn: 'Scientific Plant Protection & Architectural Landscaping',
  heroSubtitleAr:
    'في بروتيك (Protec) ندمج علم أمراض النبات ومكافحة الآفات المتكاملة مع تصميم وتنفيذ الحدائق وشبكات الري الذكية، لنمنحك مساحات خضراء محمية ومزدهرة على مدار العام.',
  heroSubtitleEn:
    'At Protec, we unite plant pathology and integrated pest management with architectural landscaping and smart irrigation engineering—creating resilient green spaces built to thrive year-round.',
  heroImageUrl: GENERATED_IMAGES.hero,
  heroImages: [
    GENERATED_IMAGES.hero,
    GENERATED_IMAGES.plantProtection,
    GENERATED_IMAGES.irrigation,
    GENERATED_IMAGES.afterLush,
  ],
  aboutSummaryAr:
    'تأسست شركة بروتيك (Protec) لسد الفجوة الحقيقية بين الشكل الجمالي للحدائق وبين الصحة البيولوجية والزراعية للنباتات. فنحن لا نكتفي بزراعة المسطحات الخضراء وتنسيقها، بل نبدأ من تحليل التربة والمياه، وتصميم شبكات الري المحسوبة هيدروليكياً، وصولاً إلى برامج وقاية النبات وتشخيص الآفات والأمراض الفطرية قبل ظهور آثارها، لنحمي استثمارك الأخضر في الفيلات، الكمبوندات، المنتجعات، والمزارع.',
  aboutSummaryEn:
    'Protec was established to bridge the gap between visual landscape design and agricultural plant science. Rather than treating greenery as mere decor, our agronomists and landscape engineers begin with soil and water diagnostics, hydraulically balanced irrigation, and preventive integrated pest management (IPM) protocols—protecting residential villas, gated communities, resorts, and commercial estates.',
  visionAr:
    'أن نكون الشريك الهندسي والزراعي الأول في مصر والمنطقة لبناء مساحات خضراء خالية من الآفات، مرشدة للمياه، ومستدامة القيمة الجمالية والبيئية.',
  visionEn:
    'To set the regional benchmark for pest-free, water-efficient, and scientifically managed landscapes that endure across every season.',
  missionAr:
    'تقديم منظومة متكاملة تبدأ بالتصميم الهندسي الدقيق للاندسكيب وشبكات الري، وتستمر ببرامج فحص مخبري وميداني لوقاية النبات ومكافحة الآفات بأحدث المركبات الآمنة بيئياً.',
  missionEn:
    'Delivering turnkey landscape engineering backed by field pathology diagnostics, low-residue safe pest control, and scheduled preventive plant nutrition.',
  goalsAr: [
    'حماية الأشجار والنخيل والمسطحات الخضراء من الآفات الحشرية والفطرية قبل تفاقم الإصابة.',
    'خفض استهلاك مياه الري بنسبة تصل إلى 40% عبر تصميم شبكات تنقيط ورش مقسمة حسب الاحتياج المائي.',
    'تحويل صيانة الحدائق من التدخل العشوائي إلى جدول وقائي وتسميد متوازن طوال العام.',
    'تسليم مشروعات لاندسكيب متكاملة بضمان هندسي وزراعي ومتابعة ميدانية موثقة.',
  ],
  goalsEn: [
    'Safeguard high-value palms, trees, and turf lawns through early-stage pest and pathogen interception.',
    'Reduce irrigation water waste by up to 40% with hydro-zoned drip and pop-up sprinkler networks.',
    'Replace reactive emergency spraying with scheduled preventive nutrition and plant health audits.',
    'Deliver turnkey garden transformations backed by clear agronomic handover and follow-up guarantees.',
  ],
  valuesAr: [
    'التشخيص العلمي أولاً: لا رش عشوائي للمبيدات دون تحديد دقيق للمسبب المرضي أو الحشري.',
    'سلامة الأسرة والبيئة: الاعتماد على مركبات معتمدة منخفضة الأثر المتبقي وآمنة للأطفال والحيوانات الأليفة.',
    'الدقة الهندسية: حساب التصرفات والضغوط في شبكات الري وتوزيع الإضاءة النباتية قبل بدء التنفيذ.',
    'الشفافية والمتابعة: تقارير فحص مصورة ومواعيد زيارة ملتزمة وواضحة لكل عميل.',
  ],
  valuesEn: [
    'Diagnosis Before Treatment: Zero blind pesticide application without verified pest or pathogen identification.',
    'Family & Environmental Safety: World-standard, low-residue formulations safe around children and pets.',
    'Hydraulic & Design Precision: Full flow, pressure, and plant-light calculation prior to trenching.',
    'Documented Accountability: Visual progress reports, transparent pricing, and reliable maintenance schedules.',
  ],
  differentiatorsAr: [
    'فريق مشترك يجمع مهندسي وقاية النبات وأمراضها مع مهندسي تصميم اللاندسكيب وشبكات الري.',
    'بروتوكولات وقاية مبكرة ومتخصصة لسوسة النخيل الحمراء، حشرات القشور، وأعفان جذور النجيل.',
    'معاينة ذكية أولية عبر الصور والفيديو لتقديم تقدير فني ومالي دقيق قبل الزيارة الميدانية.',
    'شريك واحد مسؤول عن التصميم والتنفيذ والشبكات والصيانة والوقاية دون تشتت المقاولين.',
  ],
  differentiatorsEn: [
    'Cross-disciplinary teams pairing certified plant protection specialists with landscape architects.',
    'Dedicated early-detection protocols for Red Palm Weevil, scale insects, and fungal turf diseases.',
    'Photo and video pre-assessment via our quote portal for faster, more accurate technical proposals.',
    'Single-partner accountability from soil preparation and irrigation to multi-year plant health care.',
  ],
  phones: ['01036084725', '01065324190'],
  whatsappNumber: '201036084725',
  email: 'protecprotection4@gmail.com',
  addressAr: 'القاهرة الكبرى والجيزة — خدمة المعاينة والتنفيذ لجميع المحافظات',
  addressEn: 'Greater Cairo & Giza — Field Engineering & Service Across Egypt',
  facebookUrl: 'https://www.facebook.com',
  tiktokUrl: 'https://www.tiktok.com',
  instagramUrl: 'https://www.instagram.com',
  coverageStatementAr: 'تخدم شركة بروتيك جميع محافظات جمهورية مصر العربية',
  coverageStatementEn: 'Protec serves all governorates across Egypt',
  availableAreasAr: 'دمياط والمنصورة',
  availableAreasEn: 'Damietta and Mansoura',
};

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'landscape-design',
    order: 1,
    slug: 'landscape-design',
    titleAr: 'تصميم وتنفيذ اللاندسكيب',
    titleEn: 'Landscape Design & Execution',
    shortDescAr:
      'تخطيط معماري متكامل للمساحات الخارجية يوازن بين العناصر النباتية والإنشائية (Hardscape & Softscape) بما يناسب مناخ الموقع.',
    shortDescEn:
      'Architectural outdoor master-planning harmonizing hardscape stonework, shaded pergolas, and climate-adapted planting.',
    fullDescAr:
      'نصمم وننفذ مشاريع اللاندسكيب للفلل والكمبوندات والمنشآت التجارية بدءاً من الرفع المساحي ودراسة حركة الشمس والرياح، مروراً باختيار أنواع النجيل والأشجار المتأقلمة، وصولاً إلى تنفيذ الممرات الحجرية، الإضاءة الليلية، والمسطحات المائية.',
    fullDescEn:
      'We engineer and build complete residential, compound, and commercial landscapes—from site surveying and microclimate solar mapping to stonework walkways, water features, night lighting, and climate-resilient turf and tree installation.',
    featuresAr: [
      'رفع مساحي وتصميم هندسي ثلاثي الأبعاد قبل التنفيذ',
      'أعمال الهاردسكيب (مشايات حجرية، برجولات، إضاءة حدائق)',
      'اختيار نباتات تتحمل حرارة الصيف وملوحة التربة',
      'إشراف هندسي كامل حتى التسليم النهائي',
    ],
    featuresEn: [
      'Full site survey and 3D concept visualization prior to groundwork',
      'Stone pathways, pergolas, planters, and architectural garden lighting',
      'Climate-adapted plant palettes selected for sun and soil salinity',
      'Turnkey engineering supervision through final handover',
    ],
    imageUrl: GENERATED_IMAGES.hero,
    active: true,
  },
  {
    id: 'garden-landscaping',
    order: 2,
    slug: 'garden-landscaping',
    titleAr: 'تنسيق وتجميل الحدائق',
    titleEn: 'Garden Styling & Beautification',
    shortDescAr:
      'إعادة إحياء الحدائق القائمة وتنسيق الأحواض الزهرية والأسوار النباتية لإبراز الطابع الجمالي للمبنى.',
    shortDescEn:
      'Revitalizing existing gardens with layered flower beds, ornamental hedges, and focal specimen palms.',
    fullDescAr:
      'نعمل على تطوير الحدائق المنزلية والروف جاردن عبر إعادة توزيع النباتات المتدرجة في الارتفاع والألوان، زراعة الشجيرات المزهرة دائمة الخضرة، وتغطية التربة بالحصى الديكوري واللحاء العضوي لمنع الحشائش وتقليل البخر.',
    fullDescEn:
      'We transform private yards, courtyards, and rooftop gardens through layered foliage heights, seasonal bloom borders, privacy hedging, and decorative mulch/gravel groundcovers that suppress weeds and conserve soil moisture.',
    featuresAr: [
      'توريد وزراعة أشجار الزينة والنخيل والشجيرات المزهرة',
      'تنسيق حدائق الأسطح (Roof Gardens) والمداخل',
      'تأسيس مسطحات النجيل الطبيعي والصناعي عالي الكثافة',
      'معالجة التربة وتحسين الخواص الفيزيائية قبل الزراعة',
    ],
    featuresEn: [
      'Supply and planting of specimen trees, palms, and flowering shrubs',
      'Lightweight rooftop garden and courtyard beautification',
      'High-density natural turf sodding and premium artificial grass',
      'Organic soil conditioning and drainage improvement',
    ],
    imageUrl: GENERATED_IMAGES.afterLush,
    active: true,
  },
  {
    id: 'garden-maintenance',
    order: 3,
    slug: 'garden-maintenance',
    titleAr: 'صيانة الحدائق الدورية',
    titleEn: 'Periodic Garden Maintenance',
    shortDescAr:
      'عقود صيانة شهرية وموسمية منتظمة تضمن بقاء الحديقة في أعلى كفاءة جمالية وصحية طوال العام.',
    shortDescEn:
      'Scheduled monthly and seasonal maintenance contracts keeping turf, hedges, and irrigation at peak vitality.',
    fullDescAr:
      'توفر بروتيك فرق صيانة مدربة تزور الموقع وفق جدول ثابت لقص النجيل بالارتفاع المثالي، تشكيل الأسوار النباتية، إزالة الحشائش الغريبة، فحص الرشاشات والمنقطات، وتقديم تقرير فني دوري عن الحالة الصحية لجميع النباتات.',
    fullDescEn:
      'Our trained field crews follow a strict visit calendar covering precision mowing, hedge shaping, manual weed removal, irrigation nozzle calibration, and proactive plant-health checks documented after every visit.',
    featuresAr: [
      'زيارات أسبوعية أو نصف شهرية مجدولة ومنتظمة',
      'قص النجيل وتحديد الحواف وتهوية التربة',
      'فحص وضبط شبكات الري واستبدال النقاط التالفة',
      'متابعة وقائية مستمرة لاكتشاف أي إصابة مبكراً',
    ],
    featuresEn: [
      'Consistent weekly or bi-weekly scheduled field visits',
      'Precision turf mowing, edging, and soil aeration',
      'Routine sprinkler/drip inspection and nozzle replacement',
      'Continuous preventive monitoring for early pest detection',
    ],
    imageUrl: GENERATED_IMAGES.hero,
    active: true,
  },
  {
    id: 'plant-protection-diagnosis',
    order: 4,
    slug: 'plant-protection-diagnosis',
    titleAr: 'وقاية النبات وتشخيص الأمراض والآفات',
    titleEn: 'Plant Protection & Disease/Pest Diagnosis',
    shortDescAr:
      'فحص متخصص لتحديد مسببات الاصفرار والذبول والآفات الحشرية والفطرية بدقة علمية قبل وصف العلاج.',
    shortDescEn:
      'Scientific field and diagnostic inspection to pinpoint insect pests, fungal pathogens, and nutrient deficiencies.',
    fullDescAr:
      'القلب التخصصي لشركة بروتيك: يقوم مهندسو وقاية النبات بفحص الأوراق والجذور والتربة والمياه لتفريق الأعراض المرضية (الفطرية والبكتيرية والفيروسية) عن نقص العناصر أو إجهاد الري، مع وضع خطة وقاية متكاملة (IPM) تحمي النباتات من الخسارة.',
    fullDescEn:
      'Protec’s signature discipline: our plant pathology engineers examine foliage, root zones, and soil moisture to distinguish fungal/bacterial diseases from nutrient lockouts or salinity stress—delivering an actionable Integrated Pest Management (IPM) protocol.',
    featuresAr: [
      'فحص ميداني دقيق للأوراق والسيقان ومنطقة الجذور',
      'تشخيص سوسة النخيل، المن، التربس، الأكاروسات، وأعفان الجذور',
      'تحديد نقص العناصر الصغرى والكبرى وأخطاء الري',
      'برامج تحصين موسمية قبل مواسم تكاثر الآفات',
    ],
    featuresEn: [
      'Detailed foliar, stem, and root-zone diagnostic inspection',
      'Targeted detection of palm weevils, aphids, mites, and root rot',
      'Separation of biotic diseases from abiotic watering/salinity stress',
      'Seasonal preventive immunization schedules before pest peaks',
    ],
    imageUrl: GENERATED_IMAGES.plantProtection,
    active: true,
  },
  {
    id: 'pest-disease-control',
    order: 5,
    slug: 'pest-disease-control',
    titleAr: 'مكافحة الآفات والأمراض النباتية',
    titleEn: 'Agricultural Pest & Plant Disease Control',
    shortDescAr:
      'تنفيذ برامج رش وحقن ومعالجة متخصصة للقضاء على الآفات الحشرية والأمراض الفطرية بأمان تام.',
    shortDescEn:
      'Targeted spraying, trunk injection, and soil drench treatments eliminating pests and plant diseases safely.',
    fullDescAr:
      'نستخدم معدات رش وحقن معايرة ومركبات معتمدة دولياً للقضاء الفعال على الآفات الزراعية في الحدائق والمزارع دون الإضرار بالنبات أو البيئة المحيطة، مع الالتزام بفترات الأمان وإجراءات السلامة الكاملة لأفراد الأسرة والحيوانات الأليفة.',
    fullDescEn:
      'We deploy calibrated spraying and trunk-injection equipment with WHO-compliant, low-odor formulations to eradicate pests and fungal outbreaks across villas, resorts, and orchards while maintaining strict safety buffers for residents and pets.',
    featuresAr: [
      'حقن ورش متخصص لمكافحة سوسة النخيل الحمراء والحفارات',
      'معالجة أعفان الجذور والبياض الدقيقي والزغبي في النجيل والشجيرات',
      'مكافحة الآفات الأرضية والنمل الأبيض والحشائش الضارة',
      'استخدام مبيدات مسجلة وآمنة بيئياً بنسب خلط علمية دقيقة',
    ],
    featuresEn: [
      'Specialized trunk injection and drenching for Red Palm Weevil',
      'Curative fungal treatments for powdery mildew and turf dollar-spot',
      'Soil-borne pest, grub, and invasive weed control programs',
      'Registered low-toxicity products applied at calibrated dosages',
    ],
    imageUrl: GENERATED_IMAGES.plantProtection,
    active: true,
  },
  {
    id: 'irrigation-networks',
    order: 6,
    slug: 'irrigation-networks',
    titleAr: 'تصميم وتنفيذ شبكات الري',
    titleEn: 'Irrigation Network Design & Installation',
    shortDescAr:
      'شبكات ري أوتوماتيكية (رشاشات Pop-up وتنقيط) مصممة هندسياً لتوفير المياه وضمان توزيع متجانس.',
    shortDescEn:
      'Automated pop-up sprinkler and drip irrigation networks engineered for uniform coverage and water savings.',
    fullDescAr:
      'نصمم شبكات الري على أسس هيدروليكية دقيقة مع تقسيم الحديقة إلى مناطق ري مستقلة (Zones) تفرق بين احتياج النجيل واحتياج الأشجار والشجيرات، مع تركيب وحدات تحكم ذكية (Timers) ومحابس كهربائية ومضخات عالية الكفاءة.',
    fullDescEn:
      'Our engineers calculate hydraulic head, flow rates, and precipitation zones—separating turf sprinklers from tree bubblers and shrub drip lines under smart weather-capable controllers and solenoid valves.',
    featuresAr: [
      'تقسيم هيدروليكي لمناطق الرش والتنقيط (Hydro-zoning)',
      'تركيب رشاشات Pop-up مخفية، بابلرز للنخيل، وخطوط GR',
      'برمجة لوحات التحكم الأوتوماتيكية وحساسات الرطوبة والمطر',
      'صيانة وتحديث الشبكات القديمة وعلاج ضعف الضغوط',
    ],
    featuresEn: [
      'Hydraulic zoning separating lawn sprinklers from tree and shrub drip lines',
      'Subsurface pop-up rotors, palm bubblers, and pressure-compensating drip',
      'Automated multi-station controllers with rain/moisture sensors',
      'Retrofitting and pressure-balancing of existing irrigation systems',
    ],
    imageUrl: GENERATED_IMAGES.irrigation,
    active: true,
  },
  {
    id: 'pruning-fertilization-care',
    order: 7,
    slug: 'pruning-fertilization-care',
    titleAr: 'التقليم والتسميد والعناية بالنباتات',
    titleEn: 'Pruning, Fertilization & Plant Nutrition',
    shortDescAr:
      'برامج تغذية معدنية وعضوية وتقليم فني للنخيل والأشجار لتحفيز النمو الخضري والإزهار الصحي.',
    shortDescEn:
      'Structural tree and palm pruning paired with balanced organic and mineral fertilization programs.',
    fullDescAr:
      'التقليم الخاطئ أو التسميد العشوائي يضعف مناعة النبات ويجعله عرضة للآفات. في بروتيك نطبق تقليماً تربوياً وثمرياً وتقليم تنظيف للنخيل مع تعقيم أدوات القطع، وبرامج تسميد متدرجة بالنيتروجين والفوسفور والبوتاسيوم والعناصر المخلبية.',
    fullDescEn:
      'Improper pruning or unbalanced fertilization weakens plant immunity and invites pests. Protec executes sanitized structural pruning and palm grooming alongside stage-specific NPK, humic acid, and chelated micronutrient feeding schedules.',
    featuresAr: [
      'تقليم وتشكيل الأشجار والأسوار النباتية وتعقيم أدوات القص',
      'تكريب وتنظيف النخيل مع المعالجة الوقائية لمناطق القطع',
      'برامج تسميد متوازنة (NPK، هيوميك، وعناصر صغرى مخلبية)',
      'إنعاش النباتات المجهدة وتحسين خصوبة التربة المستنفدة',
    ],
    featuresEn: [
      'Sanitized structural pruning for ornamental trees and formal hedges',
      'Professional palm frond trimming with preventive cut-surface sealing',
      'Season-matched NPK, humic acid, and chelated trace-element feeding',
      'Stress recovery protocols for transplanted or depleted plants',
    ],
    imageUrl: GENERATED_IMAGES.afterLush,
    active: true,
  },
];

export const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'villa-new-cairo-transformation',
    titleAr: 'تحويل حديقة فيلا بالكامل — التجمع الخامس',
    titleEn: 'Complete Villa Garden Transformation — New Cairo',
    category: 'landscaping',
    locationAr: 'التجمع الخامس، القاهرة الجديدة',
    locationEn: 'Fifth Settlement, New Cairo',
    areaSqm: 420,
    summaryAr:
      'إعادة تأهيل تربة مالحة ومهملة وتحويلها إلى مسطح نجيل باسبالم كثيف مع مشايات حجر جيري، نخيل زينة، وشبكة ري أوتوماتيكية بـ 4 مناطق تحكم.',
    summaryEn:
      'Full soil remediation and transformation of an arid courtyard into dense Paspalum turf, limestone pavers, specimen palms, and a 4-zone automated irrigation system.',
    beforeImageUrl: GENERATED_IMAGES.beforeArid,
    afterImageUrl: GENERATED_IMAGES.afterLush,
    featured: true,
  },
  {
    id: 'palm-ipm-sheikh-zayed',
    titleAr: 'برنامج وقاية وعلاج نخيل ملوكى — الشيخ زايد',
    titleEn: 'Royal Palm Protection & IPM Recovery — Sheikh Zayed',
    category: 'plant-protection',
    locationAr: 'الشيخ زايد، الجيزة',
    locationEn: 'Sheikh Zayed, Giza',
    areaSqm: 1200,
    summaryAr:
      'تشخيص مبكر وإيقاف إصابة حشرية وفطرية في 28 نخلة وأشجار موالح عبر الحقن الجذعي والرش الوقائي المعاير مع استعادة النموات الخضرية خلال 45 يوماً.',
    summaryEn:
      'Early detection and targeted trunk-injection treatment saving 28 mature palms and citrus borders, achieving full canopy recovery within 45 days.',
    beforeImageUrl: GENERATED_IMAGES.beforeArid,
    afterImageUrl: GENERATED_IMAGES.plantProtection,
    featured: true,
  },
  {
    id: 'smart-irrigation-katameya',
    titleAr: 'تحديث شبكة ري أوتوماتيكية موفرة للمياه — القطامية',
    titleEn: 'Water-Saving Automated Irrigation Retrofit — Katameya',
    category: 'irrigation',
    locationAr: 'القطامية هايتس، القاهرة',
    locationEn: 'Katameya Heights, Cairo',
    areaSqm: 680,
    summaryAr:
      'استبدال شبكة ري تقليدية غير متجانسة بشبكة رشاشات Pop-up مخفية وخطوط تنقيط مع لوحة تحكم ذكية، مما خفض استهلاك المياه بنسبة 38%.',
    summaryEn:
      'Replaced an uneven manual watering setup with subsurface pop-up sprinklers, pressure-compensated drip lines, and smart zoning—cutting water usage by 38%.',
    beforeImageUrl: GENERATED_IMAGES.beforeArid,
    afterImageUrl: GENERATED_IMAGES.irrigation,
    featured: true,
  },
  {
    id: 'seasonal-care-maadi',
    titleAr: 'عقد صيانة وتسميد وتقليم سنوي — المعادي',
    titleEn: 'Annual Turf Care, Pruning & Nutrition — Maadi',
    category: 'maintenance',
    locationAr: 'دجلة المعادي، القاهرة',
    locationEn: 'Degla Maadi, Cairo',
    areaSqm: 310,
    summaryAr:
      'برنامج رعاية دورية يشمل قص النجيل، تهوية التربة، تقليم التشكيل، وتسميد فصلي أبقى الحديقة خالية من الأعفان والحشرات طوال العام.',
    summaryEn:
      'Year-round maintenance schedule combining turf aeration, structural hedge pruning, and balanced seasonal fertilization with zero pest outbreaks.',
    beforeImageUrl: GENERATED_IMAGES.beforeArid,
    afterImageUrl: GENERATED_IMAGES.hero,
    featured: false,
  },
];

export const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: 'offer-winter-protection-2026',
    titleAr: 'باقة التحصين الوقائي الشاملة للحدائق والنخيل',
    titleEn: 'Comprehensive Garden & Palm Preventive Shield',
    descriptionAr:
      'تشمل زيارة فحص ميداني وتشخيص كامل للأمراض والآفات + دورة رش فطري وحشري آمنة + جرعة تسميد متوازن لتقوية الجذور قبل تقلبات الطقس.',
    descriptionEn:
      'Includes full agronomic pest/disease inspection, one safe preventive fungicide & insecticide cycle, plus root-strengthening mineral nutrition.',
    discountLabelAr: 'خصم 25%',
    discountLabelEn: '25% OFF',
    originalPrice: '4,800 ج.م',
    offerPrice: '3,600 ج.م',
    expiresAt: '2026-12-31',
    serviceType: 'plant-protection-diagnosis',
    imageUrl: GENERATED_IMAGES.plantProtection,
    active: true,
  },
  {
    id: 'offer-smart-irrigation-2026',
    titleAr: 'عرض تصميم وتنفيذ شبكة الري الأوتوماتيكية + معاينة مجانية',
    titleEn: 'Automated Irrigation Package + Free Site Survey',
    descriptionAr:
      'تصميم هيدروليكي كامل وتوريد وتركيب رشاشات Pop-up وخطوط تنقيط مع تايمر ذكي وضمان لمدة عامين على التركيبات لحدائق حتى 300 متر.',
    descriptionEn:
      'Complete hydraulic design, pop-up sprinklers, drip lines, and smart digital timer installation with 2-year workmanship warranty for gardens up to 300 m².',
    discountLabelAr: 'توفير 20%',
    discountLabelEn: 'Save 20%',
    originalPrice: '18,500 ج.م',
    offerPrice: '14,800 ج.م',
    expiresAt: '2026-12-20',
    serviceType: 'irrigation-networks',
    imageUrl: GENERATED_IMAGES.irrigation,
    active: true,
  },
  {
    id: 'offer-turnkey-landscape-2026',
    titleAr: 'باقة تنسيق الحديقة المتكاملة + شهرين صيانة مجاناً',
    titleEn: 'Turnkey Garden Styling + 2 Months Free Maintenance',
    descriptionAr:
      'عند تعاقدك على تصميم وتنفيذ اللاندسكيب لحديقة منزلك، احصل على برنامج الصيانة الدورية والتسميد الوقائي لأول شهرين مجاناً بعد التسليم.',
    descriptionEn:
      'Contract your villa landscape execution and receive two full months of scheduled mowing, irrigation checks, and preventive fertilization complimentary.',
    discountLabelAr: 'شهرين مجاناً',
    discountLabelEn: '2 Months Free',
    originalPrice: 'حسب المساحة',
    offerPrice: 'باقة شاملة',
    expiresAt: '2026-12-15',
    serviceType: 'landscape-design',
    imageUrl: GENERATED_IMAGES.hero,
    active: true,
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-palm-ipm-zayed',
    authorNameAr: 'م. طارق الشناوي',
    authorNameEn: 'Eng. Tarek El-Shenawy',
    roleAr: 'مدير إدارة المرافق واللاندسكيب',
    roleEn: 'Facilities & Grounds Director',
    organizationAr: 'كمبوند بالم هيلز — قطاع التوسعات',
    organizationEn: 'Palm Hills Residential Sector',
    locationAr: 'الشيخ زايد، الجيزة',
    locationEn: 'Sheikh Zayed, Giza',
    serviceCategory: 'plant-protection',
    serviceLabelAr: 'وقاية النبات ومكافحة الآفات',
    serviceLabelEn: 'Plant Protection & IPM',
    rating: 5,
    beforeStateAr: 'إصابات سوسة النخيل وتبقّع أوراق متكرر',
    beforeStateEn: 'Active palm weevil & recurring foliar blight',
    outcomeAr: 'تعافي 100% للتيجان خلال 6 أسابيع دون فقد شجرة واحدة',
    outcomeEn: '100% canopy recovery in 6 weeks with zero tree loss',
    quoteAr:
      'تعاملنا مع عدة مقاولي حدائق من قبل، لكن بروتيك هم أول فريق بدأ بفحص الجذور وتشخيص المسبب بدقة قبل أي رش. أوقفوا انتشار الإصابة في النخيل بمركبات آمنة وبدون رائحة مزعجة للسكان.',
    quoteEn:
      'Unlike general gardening crews we worked with before, Protec began by inspecting root zones and diagnosing the exact pathogen before applying any treatment. They halted palm weevil spread safely with zero odor disruption to residents.',
    dateLabel: '2026-10',
  },
  {
    id: 'rev-villa-landscape-cairo',
    authorNameAr: 'د. هالة عبد الرحمن',
    authorNameEn: 'Dr. Hala Abdelrahman',
    roleAr: 'مالكة فيلا سكنية',
    roleEn: 'Private Villa Owner',
    organizationAr: 'مجمع ميفيدا السكني',
    organizationEn: 'Mivida Residential Community',
    locationAr: 'التجمع الخامس، القاهرة الجديدة',
    locationEn: 'Fifth Settlement, New Cairo',
    serviceCategory: 'landscaping',
    serviceLabelAr: 'تصميم وتنفيذ اللاندسكيب',
    serviceLabelEn: 'Landscape Design & Execution',
    rating: 5,
    beforeStateAr: 'أرض رملية جافة وملوحة تربة مرتفعة',
    beforeStateEn: 'Arid sandy yard with high soil salinity',
    outcomeAr: 'حديقة متكاملة بمساحة 420 م² وضمان نمو النجيل',
    outcomeEn: '420 m² lush lawn & stone courtyard with full growth guarantee',
    quoteAr:
      'أرسلت فيديو وصور الحديقة عبر الموقع وخلال 48 ساعة قدم المهندس تصوراً واضحاً لمعالجة ملوحة التربة وتوزيع النباتات. النتيجة النهائية بعد التنفيذ فاقت التصور والتزموا بكل موعد.',
    quoteEn:
      'I uploaded photos and a site walkthrough video through the quote form, and within 48 hours a Protec engineer delivered a soil-remediation and planting plan. Execution matched the design cleanly and finished right on schedule.',
    dateLabel: '2026-09',
  },
  {
    id: 'rev-smart-irrigation-katameya',
    authorNameAr: 'أ. شريف المنياوي',
    authorNameEn: 'Sherif El-Meniawy',
    roleAr: 'مدير الصيانة والتشغيل',
    roleEn: 'Operations & Maintenance Manager',
    organizationAr: 'نادي ومنتجع القطامية الرياضي',
    organizationEn: 'Katameya Heights Club Grounds',
    locationAr: 'القطامية، القاهرة',
    locationEn: 'Katameya, Cairo',
    serviceCategory: 'irrigation',
    serviceLabelAr: 'تصميم وتنفيذ شبكات الري',
    serviceLabelEn: 'Smart Irrigation Networks',
    rating: 5,
    beforeStateAr: 'ضعف ضغط الرشاشات وهدر مياه وتجمع برك',
    beforeStateEn: 'Uneven sprinkler pressure & turf waterlogging',
    outcomeAr: 'تخفيض استهلاك المياه 38% وتجانس لون المسطح',
    outcomeEn: '38% lower water consumption & uniform turf density',
    quoteAr:
      'إعادة التقسيم الهيدروليكي لشبكة الري وفصل خطوط التنقيط عن رشاشات النجيل حلّت مشكلة اصفرار المسطحات وتجمعات المياه تماماً، ووفّرت لنا في فاتورة المياه بشكل ملموس.',
    quoteEn:
      'Hydro-zoning our irrigation network—separating shrub drip lines from turf pop-up rotors—eliminated waterlogging and yellowing patches while cutting our monthly irrigation water bill measurably.',
    dateLabel: '2026-08',
  },
  {
    id: 'rev-maintenance-maadi',
    authorNameAr: 'م. نادر فؤاد',
    authorNameEn: 'Eng. Nader Fouad',
    roleAr: 'الشريك الإداري',
    roleEn: 'Managing Partner',
    organizationAr: 'مقر شركة دجلة للاستشارات الهندسية',
    organizationEn: 'Degla Engineering Consultants HQ',
    locationAr: 'دجلة المعادي، القاهرة',
    locationEn: 'Degla Maadi, Cairo',
    serviceCategory: 'maintenance',
    serviceLabelAr: 'صيانة الحدائق والتسميد',
    serviceLabelEn: 'Periodic Maintenance & Nutrition',
    rating: 4.8,
    beforeStateAr: 'تقليم عشوائي وذبول متكرر بنهاية الصيف',
    beforeStateEn: 'Irregular pruning & late-summer shrub stress',
    outcomeAr: 'التزام 100% بالجدول الشهري ونمو متوازن طوال السنة',
    outcomeEn: '100% on-time monthly visits & healthy year-round foliage',
    quoteAr:
      'أهم ما يميز عقد الصيانة مع بروتيك هو التقرير الفني بعد كل زيارة والالتزام بمواعيد التسميد والتقليم الوقائي. حديقة المقر تحافظ على مظهرها طوال الصيف والشتاء دون أعطال مفاجئة.',
    quoteEn:
      'What sets Protec’s maintenance contract apart is the post-visit agronomic log and disciplined fertilization schedule. Our office courtyard stays crisp through peak summer heat without emergency interventions.',
    dateLabel: '2026-10',
  },
];

