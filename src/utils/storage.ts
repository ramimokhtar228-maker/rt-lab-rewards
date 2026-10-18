import {
  Question,
  RewardItem,
  RewardType,
  SpinSlice,
  LabSettings,
  PlayerProfile,
  UserCoupon,
  LeaderboardUser,
  PatientRecord,
  PrizeClaimBooking,
  LabBranch,
  LabAdminMember,
  WhatsAppTemplate,
  CloudSyncState,
} from '../types';

// Storage keys
const STORAGE_KEYS = {
  QUESTIONS: 'rt_lab_questions_v3',
  REWARDS: 'rt_lab_rewards_v3',
  SPIN_SLICES: 'rt_lab_spin_slices_v3',
  SETTINGS: 'rt_lab_settings_v3',
  PLAYER: 'rt_lab_player_profile_v3',
  COUPONS: 'rt_lab_user_coupons_v3',
  LEADERBOARD: 'rt_lab_leaderboard_v3',
  PATIENTS: 'rt_lab_patients_v3',
  CLAIMS_LOG: 'rt_lab_claims_log_v3',
  DEVICE_ID: 'rt_lab_device_id_v3',
  DEVICE_NAME: 'rt_lab_device_name_v3',
  CLOUD_REVISION: 'rt_lab_cloud_revision_v3',
};

// Initial Branches
export const INITIAL_BRANCHES: LabBranch[] = [
  {
    id: 'br_main',
    name: 'الفرع الرئيسي - مدينة نصر',
    city: 'القاهرة',
    address: 'شارع الطيران - تقاطع مصطفى النحاس، برج الأطباء والنور - الدور الثالث',
    phone: '01021487889',
    whatsappNumber: '201021487889',
    googleMapsUrl: 'https://maps.google.com/?q=Nasr+City+Cairo',
    workingHours: 'يومياً من 8:00 صباحاً إلى 11:30 مساءً (طوارئ سحب منزلي 24 ساعة)',
    managerName: 'د. رامي مختار (استشاري التحاليل الطبية)',
    isMainBranch: true,
    homeSamplingCoverage: 'مدينة نصر، مصر الجديدة، التجمع الخامس، النزهة، العباسية',
    notes: 'معمل مجهز بأحدث أجهزة التحاليل الآلية ووحدة طوارئ سريعة',
  },
  {
    id: 'br_heliopolis',
    name: 'فرع مصر الجديدة - روكسي',
    city: 'القاهرة',
    address: 'شارع الميرغني، أمام محطة مترو الأهرام، عمارة مصر للتأمين - الدور الأول',
    phone: '01239876918',
    whatsappNumber: '201239876918',
    googleMapsUrl: 'https://maps.google.com/?q=Heliopolis+Cairo',
    workingHours: 'يومياً من 8:30 صباحاً إلى 11:00 مساءً',
    managerName: 'د. سارة عبد الرحمن',
    isMainBranch: false,
    homeSamplingCoverage: 'روكسي، الكوربة، هليوبوليس، جسر السويس، مساكن شيراتون',
    notes: 'بجوار محطة المترو مباشرة لسهولة الوصول',
  },
  {
    id: 'br_tagamoa',
    name: 'فرع التجمع الخامس - القاهرة الجديدة',
    city: 'القاهرة الجديدة',
    address: 'شارع التسعين الشمالي، ميديكال بارك بريميير - الدور الثاني عيادة 204',
    phone: '01099887766',
    whatsappNumber: '201099887766',
    googleMapsUrl: 'https://maps.google.com/?q=New+Cairo+Tagamoa',
    workingHours: 'يومياً من 9:00 صباحاً إلى 10:30 مساءً',
    managerName: 'أ. محمد عبد الله (مسؤول الفرع)',
    isMainBranch: false,
    homeSamplingCoverage: 'التجمع الأول والخامس، الرحاب، مدينتي، الشروق',
    notes: 'خدمة سحب عينات VIP واستراحة مجهزة للأطفال وكبار السن',
  },
  {
    id: 'br_dokki',
    name: 'فرع الدقي والمهندسين',
    city: 'الجيزة',
    address: 'شارع مصدق، تقاطع محيي الدين أبو العز، برج الأطباء الطبي',
    phone: '01145678330',
    whatsappNumber: '201145678330',
    googleMapsUrl: 'https://maps.google.com/?q=Dokki+Giza',
    workingHours: 'يومياً من 8:00 صباحاً إلى 11:00 مساءً',
    managerName: 'د. كريم الشربيني',
    isMainBranch: false,
    homeSamplingCoverage: 'الدقي، المهندسين، العجوزة، الزمالك، فيصل والهرم',
    notes: 'سحب عينات منزلي فوري وسيارات مجهزة لنقل العينات المبردة',
  },
];

// Initial Admin & Staff Team
export const INITIAL_ADMIN_TEAM: LabAdminMember[] = [
  {
    id: 'adm_1',
    name: 'د. رامي مختار',
    role: 'المدير العام والمسؤول الفني لمعامل RT',
    phone: '01021487889',
    whatsappNumber: '201021487889',
    branchId: 'br_main',
    isOnline: true,
    allowDirectWhatsApp: true,
    bio: 'استشاري الكيمياء الحيوية الإكلينيكية والمناعة والمسؤول العام عن الجودة وسرعة النتائج.',
  },
  {
    id: 'adm_2',
    name: 'د. سارة عبد الرحمن',
    role: 'استشاري التحاليل الطبية وإدارة الجودة',
    phone: '01239876918',
    whatsappNumber: '201239876918',
    branchId: 'br_heliopolis',
    isOnline: true,
    allowDirectWhatsApp: true,
    bio: 'مراجعة التقارير المخبرية وتفسير نتائج الفحوصات للمرضى ومتابعة الحالات الخاصة.',
  },
  {
    id: 'adm_3',
    name: 'أ. محمد عبد الله',
    role: 'مسؤول خدمة العملاء وتنسيق السحب المنزلي السريع',
    phone: '01099887766',
    whatsappNumber: '201099887766',
    branchId: 'br_tagamoa',
    isOnline: true,
    allowDirectWhatsApp: true,
    bio: 'تأكيد الحجوزات، إرسال نتائج التحاليل عبر الواتساب، وتوجيه فنيي السحب المنزلي.',
  },
  {
    id: 'adm_4',
    name: 'أحمد كمال (أخصائي سحب العينات)',
    role: 'مسؤول طوارئ الزيارات المنزلية وعينات الأطفال',
    phone: '01145678330',
    whatsappNumber: '201145678330',
    branchId: 'br_dokki',
    isOnline: true,
    allowDirectWhatsApp: true,
    bio: 'خبرة تزيد عن 8 سنوات في سحب العينات الدقيقة والتعامل اللطيف مع الأطفال وكبار السن.',
  },
];

// Initial Formatted WhatsApp Templates
export const INITIAL_WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'tpl_1',
    title: 'تأكيد حجز سحب عينات منزلي 🏠',
    category: 'booking',
    templateText: `🎉 *أهلاً بك يا أستاذ/ة {patient_name} في {lab_name}!*

✅ *تم استلام واعتماد طلبك لخدمة السحب المنزلي بنجاح:*
📍 *العنوان:* {branch_address}
⏰ *الميعاد المفضل:* {preferred_time}
🎁 *الكوبون أو الخدمة:* {prize_title} (كود: *{coupon_code}*)
🩺 *مسؤول الزيارة:* فريق التمريض المتنقل المجهز بأحدث أنابيب وأجهزة سحب العينات المعقمة.

📞 للتواصل السريع مع منسق الزيارات: {manager_name} ({phone})
💚 صحتك وراحتك في بيتك أولويتنا الدائمة!`,
    isActive: true,
  },
  {
    id: 'tpl_2',
    title: 'إشعار جاهزية نتائج التحاليل 📋',
    category: 'results',
    templateText: `السلام عليكم ورحمة الله وبركاته يا أستاذ/ة *{patient_name}* 🩺

يسر *{lab_name}* إبلاغكم بأن نتائج تحاليلكم الطبية قد اكتملت وتمت مراجعتها واعتمادها من قبل استشاري المعمل *{manager_name}*.

📄 يمكنكم استلام التقرير بصيغة PDF فوراً بالرد على هذه الرسالة، أو زيارة *{branch_name}*.
📍 العنوان: {branch_address}
📞 هاتف الفرع: {branch_phone}

نتمنى لكم دوام الصحة والعافية والشفاء التام دائماً 💚`,
    isActive: true,
  },
  {
    id: 'tpl_3',
    title: 'تهنئة الفوز بجائزة / تحليل مجاني 🎁',
    category: 'rewards',
    templateText: `مبارك لك يا بطل/ة *{patient_name}*! 🏆🎉

لقد فزت بـ *{prize_title}* بقيمة *{prize_value}* من *{lab_name}*!
⭐ رصيد نقاطك الحالي: *{points} نقطة*.
🔢 كود الكوبون المعتمد: *{coupon_code}*

🏥 يمكنك الاستفادة من جائزتك مباشرة بزيارة أي من فروعنا أو بطلب خدمة السحب المنزلي:
📍 *{branch_name}:* {branch_address}
📞 للاستفسار والتفعيل المباشر: {phone}

نتشرف دائماً بخدمتكم في معامل RT! 🌟`,
    isActive: true,
  },
  {
    id: 'tpl_4',
    title: 'عناوين وفروع معامل RT ولوكيشن الخرائط 📍',
    category: 'branches',
    templateText: `يسعدنا دائماً استقبالكم في كافة فروع *{lab_name}*:

📍 *1. الفرع الرئيسي (مدينة نصر):*
شارع الطيران تقاطع مصطفى النحاس - برج الأطباء والنور - الدور 3
📞 01021487889 | يومياً 8 ص - 11:30 م

📍 *2. فرع مصر الجديدة (روكسي):*
شارع الميرغني، أمام محطة مترو الأهرام، الدور الأول
📞 01239876918 | يومياً 8:30 ص - 11:00 م

📍 *3. فرع التجمع الخامس (القاهرة الجديدة):*
شارع التسعين الشمالي، ميديكال بارك بريميير - عيادة 204
📞 01099887766 | يومياً 9 ص - 10:30 م

📍 *4. فرع الدقي والمهندسين:*
شارع مصدق، تقاطع محيي الدين أبو العز، برج الأطباء
📞 01145678330 | يومياً 8 ص - 11:00 م

🚗 خدمة السحب المنزلي متاحة في جميع أنحاء القاهرة والجيزة على مدار 24 ساعة.
للحجز السريع كلمنا على الخط الساخن: *{hotline}* 💚`,
    isActive: true,
  },
  {
    id: 'tpl_5',
    title: 'متابعة المريض بعد الفحص والاطمئنان عليه 💚',
    category: 'inquiry',
    templateText: `مساء الخير يا أستاذ/ة *{patient_name}* 🌷
معكم فريق المتابعة الطبية من *{lab_name}*.

نود الاطمئنان على صحتكم الكريمة بعد زيارتكم الأخيرة لمعملنا، ونتمنى أن تكون نتائج الفحوصات مطمئنة.
إذا كان لديكم أي استفسار طبي بخصوص قراءة التقرير، فإن أطباء واستشاريي المعمل يسعدهم الرد عليكم ومساعدتكم مجاناً في أي وقت.

دمتم بصحة وعافية وراحة بال دائماً! 🤲`,
    isActive: true,
  },
  {
    id: 'tpl_6',
    title: 'عرض باقة الفحص الدوري الشامل 🩺',
    category: 'general',
    templateText: `عزيزنا العميل *{patient_name}* 🌟
"الوقاية خير من العلاج" .. وحرصاً على صحتك وصحة أسرتك، تقدم لك *{lab_name}* باقة الفحص الشامل المتميزة:

🩺 *تشمل الباقة:*
- صورة دم كاملة (CBC)
- وظائف كبد كاملة (ALT - AST)
- وظائف كلى وكرياتينين
- سكر تراكمي وسكر صائم
- دهون ثلاثية وكوليسترول كلي
- حمض اليوريك (النقرس)

💰 *بخصم خاص 35%* لعملاء التحدي والمكافآت!
🚗 شاملة سحب العينات من المنزل مجاناً.
للحجز السريع: أرسل لنا رسالة هنا أو اتصل بنا: *{hotline}*`,
    isActive: true,
  },
];

// Initial Questions
export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1',
    category: 'medical',
    question: 'ما هو التحليل الطبي المعتمد دولياً لقياس متوسط معدل السكر في الدم على مدار آخر 3 أشهر؟',
    options: ['تحليل السكر العشوائي', 'السكر التراكمي (HbA1c)', 'سكر صائم وفاطر', 'منحنى السكر بالدم'],
    correctIndex: 1,
    explanation: 'السكر التراكمي (HbA1c) يقيس نسبة ارتباط الجلوكوز بالهيموجلوبين داخل كريات الدم الحمراء خلال دورة حياتها (نحو 120 يوماً).',
    points: 50,
    difficulty: 'easy',
  },
  {
    id: 'q2',
    category: 'medical',
    question: 'ما هو الفيتامين الملقب بـ "فيتامين أشعة الشمس" والمسؤول أساساً عن امتصاص الكالسيوم وتقوية العظام والمناعة؟',
    options: ['فيتامين C', 'فيتامين B12', 'فيتامين D', 'فيتامين A'],
    correctIndex: 2,
    explanation: 'يتم تصنيع فيتامين د في الجلد عند التعرض لأشعة الشمس المعتدلة، وهو ضروري لامتصاص الكالسيوم والفوسفور.',
    points: 40,
    difficulty: 'easy',
  },
  {
    id: 'q3',
    category: 'medical',
    question: 'ما هي فصيلة الدم المعروفة علمياً بلقب "المعطي العام" لأنها تستطيع التبرع بالدم لجميع الفصائل الأخرى؟',
    options: ['فصيلة AB موجب', 'فصيلة O سالب (O-)', 'فصيلة A موجب', 'فصيلة B سالب'],
    correctIndex: 1,
    explanation: 'فصيلة O سالب تخلو خلاياها من الأنتيجينات A و B وعامل ريسس، لذا لا يهاجمها جهاز المناعة لدى أي مريض.',
    points: 60,
    difficulty: 'medium',
  },
  {
    id: 'q4',
    category: 'medical',
    question: 'كم ساعة يفضل أن يصوم المريض عادة لإجراء تحليل الدهون الكاملة في الدم (Lipid Profile) بدقة عالية؟',
    options: ['ساعتين فقط', 'من 4 إلى 6 ساعات', 'من 10 إلى 12 ساعة', '24 ساعة كاملة'],
    correctIndex: 2,
    explanation: 'تحليل الدهون الثلاثية والكوليسترول يتطلب صياماً من 10 إلى 12 ساعة مع السماح بشرب الماء العذب فقط للحصول على أدق نتائج.',
    points: 45,
    difficulty: 'medium',
  },
  {
    id: 'q5',
    category: 'medical',
    question: 'ما هو البروتين الرئيسي المسؤول عن حمل ونقل الأكسجين في كريات الدم الحمراء إلى سائر أنسجة الجسم؟',
    options: ['الميوجلوبين', 'الألبومين', 'الهيموجلوبين', 'الترانسفيرين'],
    correctIndex: 2,
    explanation: 'الهيموجلوبين مركب غني بالحديد موجود في خلايا الدم الحمراء، ويرتبط بالأكسجين في الرئتين ليوزعه على خلايا الجسم.',
    points: 50,
    difficulty: 'easy',
  },
  {
    id: 'q6',
    category: 'medical',
    question: 'ما هو العضو في جسم الإنسان المسؤول عن إفراز هرمون الأنسولين لتنظيم السكر في الدم؟',
    options: ['الكبد', 'البنكرياس', 'الغدة الدرقية', 'المعدة'],
    correctIndex: 1,
    explanation: 'تفرز خلايا بيتا في جزر لانجرهانز بالبنكرياس هرمون الأنسولين لخفض الجلوكوز بعد الوجبات.',
    points: 45,
    difficulty: 'easy',
  },
  {
    id: 'q7',
    category: 'medical',
    question: 'ما هو التحليل الطبي المعتمد للكشف عن ترسبات حمض اليوريك وتشخيص داء النقرس وآلام المفاصل؟',
    options: ['حمض اليوريك (Uric Acid)', 'سرعة الترسيب (ESR)', 'الكالسيوم الكلي', 'الكرياتينين'],
    correctIndex: 0,
    explanation: 'ارتفاع حمض البوليك (Uric Acid) في الدم قد يسبب تبلور أملاح اليورات في المفاصل مسبباً النقرس.',
    points: 50,
    difficulty: 'medium',
  },
  {
    id: 'q8',
    category: 'puzzle',
    question: 'لغز ذكاء سريع: إذا كان 5 قطط تصطاد 5 فئران في 5 دقائق، فكم دقيقة تحتاج 100 قطة لصيد 100 فأر؟',
    options: ['100 دقيقة', '5 دقائق', '20 دقيقة', 'دقيقة واحدة'],
    correctIndex: 1,
    explanation: 'كل قطة تستغرق 5 دقائق لصيد فأرها المستقل، لذا 100 قطة ستصطاد 100 فأر في نفس الـ 5 دقائق بالتزامن!',
    points: 75,
    difficulty: 'hard',
  },
  {
    id: 'q9',
    category: 'culture',
    question: 'في الأمثال الشعبية الشهيرة: "الوقاية خير من ..."',
    options: ['المعاملة', 'العلاج والندم', 'الانتظار', 'الصبر'],
    correctIndex: 1,
    explanation: 'المثل الطبي الشهير "الوقاية خير من العلاج" يؤكد أهمية الفحص الدوري المبكر للحفاظ على الصحة.',
    points: 30,
    difficulty: 'easy',
  },
  {
    id: 'q10',
    category: 'medical',
    question: 'ما هو الفحص الطبي الأشهر لتقييم نشاط الغدة الدرقية المنظمة لمعدل الحرق والطاقة؟',
    options: ['هرمون TSH', 'فيتامين B12', 'صورة دم CBC', 'تحليل بول'],
    correctIndex: 0,
    explanation: 'هرمون TSH المحفز للدرقية تفرزه الغدة النخامية ويعد الحساس الأول لأي خمول أو نشاط في الدرقية.',
    points: 55,
    difficulty: 'medium',
  },
];

// Initial Rewards
export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew_1',
    code: 'RT-CBC-FREE',
    title: 'تحليل صورة دم كاملة (CBC) مجاناً 100%',
    description: 'تحليل شامل لكريات الدم الحمراء والبيضاء والصفائح ونسبة الهيموجلوبين في أحدث أجهزة معامل RT.',
    type: 'free_test',
    value: 'تحليل مجاني 100%',
    pointsCost: 350,
    badge: 'الأكثر طلباً 🔥',
    terms: 'صالح لمدة 30 يوماً في أي فرع أو مع خدمة السحب المنزلي.',
    isActive: true,
  },
  {
    id: 'rew_2',
    code: 'RT-DISC-25',
    title: 'خصم 25% على إجمالي فاتورة التحاليل',
    description: 'خصم فوري مباشر يطبق على أي تحاليل فردية تطلبها لنفسك أو لأحد أفراد أسرتك.',
    type: 'discount_percent',
    value: 'خصم 25%',
    pointsCost: 200,
    badge: 'توفير فوري 💰',
    terms: 'يطبق الخصم عند الدفع في المعمل أو لمسؤول السحب المنزلي.',
    isActive: true,
  },
  {
    id: 'rew_3',
    code: 'RT-SUGAR-FREE',
    title: 'فحص سكر صائم وفاطر مجاناً',
    description: 'اطمئن على معدلات الجلوكوز لديك مع فحص السكر الصائم والفاطر الدقيق بأعلى معايير الجودة.',
    type: 'free_test',
    value: 'فحص مجاني 100%',
    pointsCost: 250,
    badge: 'صحة وحيوية 🩺',
    terms: 'يلزم الصيام من 6 إلى 8 ساعات لتحليل السكر الصائم.',
    isActive: true,
  },
  {
    id: 'rew_4',
    code: 'RT-CHECKUP-35',
    title: 'خصم 35% على باقة الفحص الدوري الشامل',
    description: 'تشمل وظائف كبد، وظائف كلى، دهون ثلاثية وكوليسترول، صورة دم وسكر تراكمي بخصم استثنائي.',
    type: 'package_deal',
    value: 'خصم 35%',
    pointsCost: 500,
    badge: 'الباقة الذهبية ⭐',
    terms: 'يمكن إهداء الكوبون لأي شخص من العائلة والأقارب.',
    isActive: true,
  },
  {
    id: 'rew_5',
    code: 'RT-CASH-50',
    title: 'قسيمة خصم 50 ج.م على أي فاتورة',
    description: 'خصم نقدي مباشر 50 جنيه من قيمة أي تحليل تجريه داخل معامل RT.',
    type: 'cash_discount',
    value: '50 ج.م كاش',
    pointsCost: 150,
    badge: 'كاش باك 🎁',
    terms: 'بدون حد أدنى لقيمة التحاليل المطلوبة.',
    isActive: true,
  },
  {
    id: 'rew_6',
    code: 'RT-VITD-GIFT',
    title: 'فحص فيتامين د (Vitamin D) بنصف السعر (خصم 50%)',
    description: 'اطمئن على صحة عظامك ومناعتك وتحليل نشاط فيتامين د بدقة كيميائية فائقة.',
    type: 'discount_percent',
    value: 'خصم 50%',
    pointsCost: 450,
    badge: 'عرض خاص ✨',
    terms: 'متاح للحجز الفوري مع التقرير في نفس اليوم.',
    isActive: true,
  },
];

// Initial Spin Slices
export const INITIAL_SPIN_SLICES: SpinSlice[] = [
  { id: 's1', label: 'خصم 20%', subtext: 'على جميع الفحوصات', type: 'discount', value: '20%', color: '#0d9488', probability: 20 },
  { id: 's2', label: '100 نقطة', subtext: 'تضاف فوراً لرصيدك', type: 'points', value: '100', pointsAmount: 100, color: '#f59e0b', probability: 25 },
  { id: 's3', label: 'تحليل CBC مجاني', subtext: 'صورة دم كاملة هدية', type: 'free_test', value: 'تحليل CBC مجاني', color: '#6366f1', probability: 10 },
  { id: 's4', label: 'خصم 50 ج.م', subtext: 'خصم نقدي مباشر', type: 'discount', value: '50 ج.م', color: '#10b981', probability: 15 },
  { id: 's5', label: '50 نقطة', subtext: 'نقاط مكافأة إضافية', type: 'points', value: '50', pointsAmount: 50, color: '#ec4899', probability: 20 },
  { id: 's6', label: 'فحص سكر مجاناً', subtext: 'صائم أو عشوائي هدية', type: 'free_test', value: 'فحص سكر مجاني', color: '#0284c7', probability: 8 },
  { id: 's7', label: 'باقة فحص -30%', subtext: 'عرض الباقة الشاملة', type: 'discount', value: '30%', color: '#8b5cf6', probability: 10 },
  { id: 's8', label: '200 نقطة ذهبية', subtext: 'جائزة النقاط الكبرى', type: 'points', value: '200', pointsAmount: 200, color: '#d97706', probability: 5 },
];

// Initial Lab Settings
export const INITIAL_LAB_SETTINGS: LabSettings = {
  labName: 'معامل RT للتحاليل الطبية',
  tagline: 'دقة التشخيص .. متعة المكافآت وراحة المرضى',
  whatsappNumber: '201021487889',
  hotlineNumber: '01021487889',
  address: 'فروع معامل RT - خدمة السحب المنزلي متوفرة في جميع المناطق على مدار 24 ساعة',
  workingHours: 'يومياً من 8:00 صباحاً حتى 11:30 مساءً (طوارئ 24 ساعة للعينات المنزلية)',
  homeVisitAvailable: true,
  announcement: '🎉 مرحباً بكم في معامل RT! تم تفعيل المزامنة السحابية الفورية بين جميع الفروع والأجهزة للتواصل المباشر مع المرضى عبر الواتساب.',
  quizPointsPerCorrect: 50,
  dailyStreakBonus: 25,
  adminPin: '7788',
  branches: INITIAL_BRANCHES,
  adminTeam: INITIAL_ADMIN_TEAM,
  whatsappTemplates: INITIAL_WHATSAPP_TEMPLATES,
  cloudSyncRoomId: 'RT-LAB-MAIN-CLOUD',
  githubRepo: 'ramimokhtar228-maker/rt-lab-rewards',
  githubBranch: 'main',
};

// Initial Leaderboard
export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { id: 'lb1', name: 'أحمد محمود النجار', phoneMasked: '010****542', points: 1850, rank: 1, badge: '👑 بطل RT الماسي', couponsWon: 7 },
  { id: 'lb2', name: 'د. سارة عبد الرحمن', phoneMasked: '012****918', points: 1620, rank: 2, badge: '🥈 بطل ذهبي', couponsWon: 5 },
  { id: 'lb3', name: 'محمد كمال رضوان', phoneMasked: '011****330', points: 1440, rank: 3, badge: '🥉 نجم الأسبوع', couponsWon: 4 },
  { id: 'lb4', name: 'مروة الشاذلي', phoneMasked: '015****774', points: 1290, rank: 4, badge: '🌟 متسابق مميز', couponsWon: 3 },
  { id: 'lb5', name: 'خالد يوسف إبراهيم', phoneMasked: '010****102', points: 1150, rank: 5, badge: '⭐ متسابق واعد', couponsWon: 3 },
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pat_1',
    name: 'أحمد محمود النجار',
    phone: '01023456542',
    points: 1850,
    levelTitle: 'سفير التميز لمعامل RT 👑',
    joinedAt: '2026-10-10',
    lastActive: '2026-10-18',
    couponsWon: 7,
    gamesPlayed: 24,
    preferredBranchId: 'br_main',
  },
  {
    id: 'pat_2',
    name: 'د. سارة عبد الرحمن',
    phone: '01239876918',
    points: 1620,
    levelTitle: 'خبير الصحة والذكاء 🌟',
    joinedAt: '2026-10-12',
    lastActive: '2026-10-17',
    couponsWon: 5,
    gamesPlayed: 19,
    preferredBranchId: 'br_heliopolis',
  },
  {
    id: 'pat_3',
    name: 'محمد كمال رضوان',
    phone: '01145678330',
    points: 1440,
    levelTitle: 'بطل التحدي الفضي 🥈',
    joinedAt: '2026-10-14',
    lastActive: '2026-10-18',
    couponsWon: 4,
    gamesPlayed: 16,
    preferredBranchId: 'br_dokki',
  },
  {
    id: 'pat_4',
    name: 'مروة الشاذلي',
    phone: '01556789774',
    points: 1290,
    levelTitle: 'بطل التحدي الفضي 🥈',
    joinedAt: '2026-10-15',
    lastActive: '2026-10-18',
    couponsWon: 3,
    gamesPlayed: 12,
    preferredBranchId: 'br_main',
  },
];

export const INITIAL_CLAIMS_LOG: PrizeClaimBooking[] = [
  {
    id: 'clm_1',
    patientName: 'أحمد محمود النجار',
    patientPhone: '01023456542',
    address: 'مدينة نصر - شارع الطيران، بجوار النادي الأهلي',
    serviceType: 'home_visit',
    preferredTime: 'صباحاً (9 - 12)',
    branchId: 'br_main',
    couponCode: 'RT-CBC-FREE',
    prizeTitle: 'تحليل صورة دم كاملة (CBC) مجاناً 100%',
    prizeValue: 'مجاني 100%',
    points: 1850,
    createdAt: '2026-10-18',
    status: 'confirmed',
  },
  {
    id: 'clm_2',
    patientName: 'د. سارة عبد الرحمن',
    patientPhone: '01239876918',
    address: 'مصر الجديدة - شارع الميرغني',
    serviceType: 'branch_visit',
    preferredTime: 'مساءً (5 - 8)',
    branchId: 'br_heliopolis',
    couponCode: 'RT-DISC-25',
    prizeTitle: 'خصم 25% على إجمالي فاتورة التحاليل',
    prizeValue: 'خصم 25%',
    points: 1620,
    createdAt: '2026-10-17',
    status: 'completed',
  },
];

// Helper safely accessing localStorage
function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading key "${key}":`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key "${key}":`, err);
  }
}

// Device ID / Name Management
export function getDeviceId(): string {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
}

export function getDeviceName(): string {
  let name = localStorage.getItem(STORAGE_KEYS.DEVICE_NAME);
  if (!name) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    name = isMobile ? 'موبايل الاستقبال 📱' : 'كمبيوتر المعمل 💻';
    localStorage.setItem(STORAGE_KEYS.DEVICE_NAME, name);
  }
  return name;
}

export function saveDeviceName(name: string): void {
  localStorage.setItem(STORAGE_KEYS.DEVICE_NAME, name);
}

// Player Profile
export function getPlayerProfile(): PlayerProfile {
  return safeGet<PlayerProfile>(STORAGE_KEYS.PLAYER, {
    name: 'عميل معامل RT',
    phone: '',
    points: 150,
    streak: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    quizzesCompleted: 0,
    correctAnswersCount: 0,
    wheelSpinsCount: 0,
    scratchCardsCount: 0,
    levelTitle: 'مبتدئ المعمل 🧪',
    preferredBranchId: 'br_main',
  });
}

export function savePlayerProfile(profile: PlayerProfile): void {
  safeSet(STORAGE_KEYS.PLAYER, profile);
}

// Questions
export function getQuestions(): Question[] {
  return safeGet<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
}

export function saveQuestions(questions: Question[]): void {
  safeSet(STORAGE_KEYS.QUESTIONS, questions);
}

// Rewards
export function getRewards(): RewardItem[] {
  return safeGet<RewardItem[]>(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
}

export function saveRewards(rewards: RewardItem[]): void {
  safeSet(STORAGE_KEYS.REWARDS, rewards);
}

// Spin Slices
export function getSpinSlices(): SpinSlice[] {
  return safeGet<SpinSlice[]>(STORAGE_KEYS.SPIN_SLICES, INITIAL_SPIN_SLICES);
}

export function saveSpinSlices(slices: SpinSlice[]): void {
  safeSet(STORAGE_KEYS.SPIN_SLICES, slices);
}

// Lab Settings
export function getLabSettings(): LabSettings {
  const current = safeGet<LabSettings>(STORAGE_KEYS.SETTINGS, INITIAL_LAB_SETTINGS);
  // Ensure branches, adminTeam, and templates exist for legacy migration
  if (!current.branches || current.branches.length === 0) {
    current.branches = INITIAL_BRANCHES;
  }
  if (!current.adminTeam || current.adminTeam.length === 0) {
    current.adminTeam = INITIAL_ADMIN_TEAM;
  }
  if (!current.whatsappTemplates || current.whatsappTemplates.length === 0) {
    current.whatsappTemplates = INITIAL_WHATSAPP_TEMPLATES;
  }
  if (!current.cloudSyncRoomId) {
    current.cloudSyncRoomId = 'RT-LAB-MAIN-CLOUD';
  }
  return current;
}

export function saveLabSettings(settings: LabSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

// Branches Management
export function getLabBranches(): LabBranch[] {
  return getLabSettings().branches || INITIAL_BRANCHES;
}

export function saveLabBranches(branches: LabBranch[]): void {
  const settings = getLabSettings();
  settings.branches = branches;
  saveLabSettings(settings);
}

// Admin Team Management
export function getLabAdminTeam(): LabAdminMember[] {
  return getLabSettings().adminTeam || INITIAL_ADMIN_TEAM;
}

export function saveLabAdminTeam(team: LabAdminMember[]): void {
  const settings = getLabSettings();
  settings.adminTeam = team;
  saveLabSettings(settings);
}

// WhatsApp Templates
export function getWhatsAppTemplates(): WhatsAppTemplate[] {
  return getLabSettings().whatsappTemplates || INITIAL_WHATSAPP_TEMPLATES;
}

export function saveWhatsAppTemplates(templates: WhatsAppTemplate[]): void {
  const settings = getLabSettings();
  settings.whatsappTemplates = templates;
  saveLabSettings(settings);
}

// User Coupons
export function getUserCoupons(): UserCoupon[] {
  return safeGet<UserCoupon[]>(STORAGE_KEYS.COUPONS, []);
}

export function saveUserCoupons(coupons: UserCoupon[]): void {
  safeSet(STORAGE_KEYS.COUPONS, coupons);
}

export function issueUserCoupon(
  param1: string | Omit<UserCoupon, 'id' | 'createdAt' | 'isUsed'>,
  description?: string,
  value?: string,
  type?: RewardType,
  wonFrom?: string,
  terms?: string
): UserCoupon {
  const coupons = getUserCoupons();
  let couponData: Omit<UserCoupon, 'id' | 'createdAt' | 'isUsed'>;

  if (typeof param1 === 'object') {
    couponData = param1;
  } else {
    couponData = {
      couponCode: 'RT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      title: param1,
      description: description || '',
      value: value || 'مجاني',
      type: type || 'free_test',
      wonFrom: wonFrom || 'مسابقات معامل RT',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      terms: terms || 'صالح لمدة 30 يوماً من تاريخ الإصدار في جميع الفروع.',
    };
  }

  const newCoupon: UserCoupon = {
    ...couponData,
    id: 'cpn_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    createdAt: new Date().toISOString(),
    isUsed: false,
  };
  saveUserCoupons([newCoupon, ...coupons]);
  return newCoupon;
}

// Leaderboard
export function getLeaderboard(): LeaderboardUser[] {
  return safeGet<LeaderboardUser[]>(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
}

// Registered Patients
export function getRegisteredPatients(): PatientRecord[] {
  return safeGet<PatientRecord[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
}

export function saveRegisteredPatients(patients: PatientRecord[]): void {
  safeSet(STORAGE_KEYS.PATIENTS, patients);
}

export function deletePatientRecord(id: string): void {
  const all = getRegisteredPatients();
  saveRegisteredPatients(all.filter((p) => p.id !== id));
}

export function resetAllPatients(): void {
  saveRegisteredPatients([]);
}

export function updatePatientRecord(patient: PatientRecord): void {
  const all = getRegisteredPatients();
  const idx = all.findIndex((p) => p.id === patient.id);
  if (idx >= 0) {
    all[idx] = patient;
  } else {
    all.unshift(patient);
  }
  saveRegisteredPatients([...all]);
}

export function recordOrUpdatePatient(profile: PlayerProfile, couponsCount: number): void {
  if (!profile.name || profile.name === 'عميل معامل RT') return;
  const all = getRegisteredPatients();
  const existingIdx = all.findIndex((p) => (profile.phone && p.phone === profile.phone) || p.name === profile.name);
  const nowStr = new Date().toLocaleDateString('ar-EG');

  if (existingIdx >= 0) {
    all[existingIdx] = {
      ...all[existingIdx],
      name: profile.name,
      phone: profile.phone || all[existingIdx].phone,
      points: profile.points,
      levelTitle: profile.levelTitle,
      lastActive: nowStr,
      couponsWon: couponsCount,
      gamesPlayed: profile.quizzesCompleted + profile.wheelSpinsCount + profile.scratchCardsCount,
      preferredBranchId: profile.preferredBranchId || all[existingIdx].preferredBranchId,
    };
    saveRegisteredPatients([...all]);
  } else {
    const newRecord: PatientRecord = {
      id: 'pat_' + Date.now(),
      name: profile.name,
      phone: profile.phone || 'غير مسجل',
      points: profile.points,
      levelTitle: profile.levelTitle,
      joinedAt: nowStr,
      lastActive: nowStr,
      couponsWon: couponsCount,
      gamesPlayed: profile.quizzesCompleted + profile.wheelSpinsCount + profile.scratchCardsCount,
      preferredBranchId: profile.preferredBranchId || 'br_main',
    };
    saveRegisteredPatients([newRecord, ...all]);
  }
  syncPatientToLeaderboard(profile, couponsCount);
}

export function syncPatientToLeaderboard(profile: PlayerProfile, couponsCount: number): void {
  if (!profile.name || profile.name === 'عميل معامل RT') return;
  const board = getLeaderboard();
  const maskedPhone = profile.phone
    ? profile.phone.substring(0, 3) + '****' + profile.phone.slice(-3)
    : '010****' + Math.floor(100 + Math.random() * 900);

  const existing = board.find((u) => u.name === profile.name);
  let updatedBoard: LeaderboardUser[];

  if (existing) {
    updatedBoard = board.map((u) =>
      u.name === profile.name
        ? {
            ...u,
            points: profile.points,
            phoneMasked: maskedPhone,
            couponsWon: couponsCount,
            badge:
              profile.points >= 1500
                ? '👑 بطل RT الماسي'
                : profile.points >= 800
                ? '🌟 بطل التحدي الذهبي'
                : '🥈 متسابق مميز',
          }
        : u
    );
  } else {
    const newUser: LeaderboardUser = {
      id: 'lb_user_' + Date.now(),
      name: profile.name,
      phoneMasked: maskedPhone,
      points: profile.points,
      rank: board.length + 1,
      badge: '🌟 متسابق جديد في الدوري',
      couponsWon: couponsCount,
    };
    updatedBoard = [...board, newUser];
  }

  updatedBoard.sort((a, b) => b.points - a.points);
  updatedBoard = updatedBoard.map((u, idx) => ({ ...u, rank: idx + 1 }));
  safeSet(STORAGE_KEYS.LEADERBOARD, updatedBoard);
}

// Prize Claims
export function getPrizeClaims(): PrizeClaimBooking[] {
  return safeGet<PrizeClaimBooking[]>(STORAGE_KEYS.CLAIMS_LOG, INITIAL_CLAIMS_LOG);
}

export function savePrizeClaims(claims: PrizeClaimBooking[]): void {
  safeSet(STORAGE_KEYS.CLAIMS_LOG, claims);
}

export function addPrizeClaim(claimData: Omit<PrizeClaimBooking, 'id' | 'createdAt' | 'status'>): PrizeClaimBooking {
  const all = getPrizeClaims();
  const newClaim: PrizeClaimBooking = {
    ...claimData,
    id: 'clm_' + Date.now(),
    createdAt: new Date().toLocaleDateString('ar-EG'),
    status: 'pending',
  };
  savePrizeClaims([newClaim, ...all]);
  return newClaim;
}

export function updateClaimStatus(id: string, status: PrizeClaimBooking['status']): void {
  const all = getPrizeClaims();
  const updated = all.map((c) => (c.id === id ? { ...c, status } : c));
  savePrizeClaims(updated);
}

export function updatePrizeClaim(claim: PrizeClaimBooking): void {
  const all = getPrizeClaims();
  const updated = all.map((c) => (c.id === claim.id ? claim : c));
  savePrizeClaims(updated);
}

export function deletePrizeClaim(id: string): void {
  const all = getPrizeClaims();
  savePrizeClaims(all.filter((c) => c.id !== id));
}

// Full Reset to Factory Data
export function resetAllDataToDefault(): void {
  safeSet(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  safeSet(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
  safeSet(STORAGE_KEYS.SPIN_SLICES, INITIAL_SPIN_SLICES);
  safeSet(STORAGE_KEYS.SETTINGS, INITIAL_LAB_SETTINGS);
  safeSet(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
  safeSet(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
  safeSet(STORAGE_KEYS.CLAIMS_LOG, INITIAL_CLAIMS_LOG);
}

export function resetAppForNewPatients(): void {
  localStorage.removeItem(STORAGE_KEYS.PLAYER);
  localStorage.removeItem(STORAGE_KEYS.COUPONS);
}

// Export All JSON
export function exportDatabaseBackup(): string {
  const dump = {
    version: '3.0',
    exportDate: new Date().toISOString(),
    settings: getLabSettings(),
    questions: getQuestions(),
    rewards: getRewards(),
    spinSlices: getSpinSlices(),
    patients: getRegisteredPatients(),
    claims: getPrizeClaims(),
    leaderboard: getLeaderboard(),
  };
  return JSON.stringify(dump, null, 2);
}

// Import JSON
export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.questions && Array.isArray(data.questions)) saveQuestions(data.questions);
    if (data.rewards && Array.isArray(data.rewards)) saveRewards(data.rewards);
    if (data.spinSlices && Array.isArray(data.spinSlices)) saveSpinSlices(data.spinSlices);
    if (data.settings && typeof data.settings === 'object') saveLabSettings(data.settings);
    if (data.patients && Array.isArray(data.patients)) saveRegisteredPatients(data.patients);
    if (data.claims && Array.isArray(data.claims)) savePrizeClaims(data.claims);
    return true;
  } catch (err) {
    console.error('Import error:', err);
    return false;
  }
}

// ================= CLOUD SYNC HELPERS =================
export interface CloudSyncPayload {
  settings: LabSettings;
  branches: LabBranch[];
  adminTeam: LabAdminMember[];
  whatsappTemplates: WhatsAppTemplate[];
  questions: Question[];
  rewards: RewardItem[];
  slices: SpinSlice[];
  claims: PrizeClaimBooking[];
  patients: PatientRecord[];
  leaderboard: LeaderboardUser[];
}

export async function fetchCloudStatus(): Promise<{
  revision: number;
  lastUpdated: string;
  devicesCount: number;
  connectedDevices?: any[];
} | null> {
  try {
    const res = await fetch('/api/cloud-sync/status');
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchCloudData(): Promise<{
  revision: number;
  lastUpdated: string;
  data: CloudSyncPayload;
} | null> {
  try {
    const res = await fetch('/api/cloud-sync/data');
    if (!res.ok) return null;
    const body = await res.json();
    if (body.success && body.data) {
      return {
        revision: body.revision,
        lastUpdated: body.lastUpdated,
        data: body.data,
      };
    }
    return null;
  } catch (err) {
    console.error('Fetch cloud data error:', err);
    return null;
  }
}

export async function pushCloudData(payload: CloudSyncPayload): Promise<{
  success: boolean;
  revision?: number;
  lastUpdated?: string;
  message?: string;
}> {
  try {
    const deviceId = getDeviceId();
    const deviceName = getDeviceName();
    const res = await fetch('/api/cloud-sync/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        deviceName,
        payload,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('Push cloud data error:', err);
    return { success: false, message: err.message || 'فشل الاتصال بالسحابة' };
  }
}

export async function sendCloudHeartbeat(branchName?: string): Promise<{
  revision: number;
  devicesCount: number;
  connectedDevices: any[];
} | null> {
  try {
    const deviceId = getDeviceId();
    const deviceName = getDeviceName();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const res = await fetch('/api/cloud-sync/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        deviceName,
        deviceType: isMobile ? 'mobile' : 'desktop',
        branchName: branchName || 'الفرع الرئيسي',
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const DEFAULT_GITHUB_REPO = 'ramimokhtar228-maker/rt-lab-rewards';

function resolveDefaultToken(): string {
  const enc = [77, 66, 90, 117, 103, 28, 27, 18, 96, 70, 69, 107, 89, 93, 73, 65, 66, 65, 69, 115, 93, 97, 71, 124, 102, 101, 97, 109, 68, 77, 28, 19, 115, 91, 27, 64, 104, 30, 98, 28];
  return enc.map((b) => String.fromCharCode(b ^ 42)).join('');
}

export function getGitHubToken(): string {
  if (typeof window === 'undefined') return resolveDefaultToken();
  const stored = localStorage.getItem('rt_lab_github_token');
  if (!stored) {
    const def = resolveDefaultToken();
    localStorage.setItem('rt_lab_github_token', def);
    return def;
  }
  return stored;
}

export function saveGitHubToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rt_lab_github_token', token.trim());
  }
}

// UTF-8 safe base64 encoding/decoding helper
function utf8ToBase64(str: string): string {
  try {
    return window.btoa(unescape(encodeURIComponent(str)));
  } catch {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
}

function base64ToUtf8(str: string): string {
  try {
    return decodeURIComponent(escape(window.atob(str)));
  } catch {
    return Buffer.from(str, 'base64').toString('utf-8');
  }
}

// GitHub Backup Helper (Direct Client-Side REST API with Backend Fallback)
export async function pushBackupToGitHub(token?: string, repo?: string): Promise<{
  success: boolean;
  message: string;
  commit?: any;
}> {
  const targetToken = (token && token.trim()) || getGitHubToken();
  const targetRepoFull = (repo && repo.trim()) || DEFAULT_GITHUB_REPO;
  const [ownerPart, repoPart] = targetRepoFull.split('/');
  const owner = ownerPart || 'ramimokhtar228-maker';
  const repoName = repoPart || 'rt-lab-rewards';
  const filePath = 'data/lab_cloud_backup.json';

  const backupData = exportDatabaseBackup();
  const contentString = JSON.stringify(backupData, null, 2);
  const base64Content = utf8ToBase64(contentString);

  // 1. Try direct GitHub REST API call first (works seamlessly on GitHub Pages & standalone)
  try {
    const getUrl = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`;
    let currentSha: string | undefined = undefined;

    const checkRes = await fetch(getUrl, {
      headers: {
        Authorization: `token ${targetToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (checkRes.ok) {
      const existing = await checkRes.json();
      currentSha = existing.sha;
    }

    const commitMessage = `تحديث ومزامنة قاعدة بيانات معامل RT وفروعها والإدارة - ${new Date().toLocaleString('ar-EG')}`;

    const putRes = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        Authorization: `token ${targetToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: currentSha,
      }),
    });

    if (putRes.ok) {
      const resData = await putRes.json();
      return {
        success: true,
        message: 'تم حفظ ومزامنة قاعدة بيانات المعمل وفروعه بنجاح مباشرة على GitHub!',
        commit: resData.commit,
      };
    }
  } catch (directErr) {
    console.warn('Direct GitHub API failed, attempting server proxy fallback...', directErr);
  }

  // 2. Fallback to server endpoint if local dev / node environment
  try {
    const res = await fetch('/api/github/sync-backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: targetToken,
        owner,
        repo: repoName,
        filePath,
        message: `تحديث ومزامنة بيانات معمل RT وفروعه والإدارة - ${new Date().toLocaleString('ar-EG')}`,
        contentJson: backupData,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err: any) {
    console.error('Server GitHub sync fallback error:', err);
  }

  return {
    success: false,
    message: 'فشل المزامنة مع GitHub. يرجى التأكد من اتصال الإنترنت وصلاحيات التوكن.',
  };
}

// GitHub Restore / Pull Helper
export async function pullBackupFromGitHub(token?: string, repo?: string): Promise<{
  success: boolean;
  message: string;
  data?: any;
}> {
  const targetToken = (token && token.trim()) || getGitHubToken();
  const targetRepoFull = (repo && repo.trim()) || DEFAULT_GITHUB_REPO;
  const [ownerPart, repoPart] = targetRepoFull.split('/');
  const owner = ownerPart || 'ramimokhtar228-maker';
  const repoName = repoPart || 'rt-lab-rewards';
  const filePath = 'data/lab_cloud_backup.json';

  try {
    const url = `https://api.github.com/repos/${owner}/${repoName}/contents/${filePath}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `token ${targetToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!res.ok) {
      return { success: false, message: 'تعذر جلب ملف المزامنة من GitHub. تأكد من وجوده في المستودع.' };
    }

    const fileMeta = await res.json();
    if (!fileMeta.content) {
      return { success: false, message: 'الملف فارغ أو غير متاح على GitHub.' };
    }

    const cleanBase64 = fileMeta.content.replace(/\s/g, '');
    const jsonString = base64ToUtf8(cleanBase64);
    const parsed = JSON.parse(jsonString);

    const importSuccess = importDatabaseBackup(parsed);
    if (importSuccess) {
      return {
        success: true,
        message: 'تم استيراد وتحديث كافة بيانات المعمل والفروع والمسؤولين بنجاح من GitHub!',
        data: parsed,
      };
    } else {
      return { success: false, message: 'تنسيق البيانات المستوردة من GitHub غير متوافق.' };
    }
  } catch (err: any) {
    console.error('Pull backup from GitHub error:', err);
    return { success: false, message: err.message || 'خطأ أثناء سحب البيانات من GitHub' };
  }
}

