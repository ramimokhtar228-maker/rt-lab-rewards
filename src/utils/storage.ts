import {
  Question,
  RewardItem,
  UserCoupon,
  SpinSlice,
  LabSettings,
  PlayerProfile,
  LeaderboardUser,
  PatientRecord,
} from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // فئة معلومات طبية وصحية ممتعة
  {
    id: 'q1',
    category: 'medical',
    question: 'ما هو التحليل الطبي الأكثر دقة لقياس متوسط نسبة السكر في الدم خلال آخر 3 أشهر؟',
    options: ['تحليل سكر عشوائي (RBS)', 'السكر التراكمي (HbA1c)', 'تحليل بول كامل', 'وظائف كبد (ALT)'],
    correctIndex: 1,
    explanation: 'تحليل السكر التراكمي HbA1c يقيس نسبة الهيموجلوبين المرتبط بالجلوكوز ويعكس متوسط السكر لـ 90 يوماً.',
    points: 50,
    difficulty: 'easy',
  },
  {
    id: 'q2',
    category: 'medical',
    question: 'ما هو الفيتامين الذي يصنعه جسم الإنسان عند التعرض المعتدل لأشعة الشمس الصباحية؟',
    options: ['فيتامين C', 'فيتامين D', 'فيتامين B12', 'فيتامين K'],
    correctIndex: 1,
    explanation: 'تساعد الأشعة فوق البنفسجية الجلد على تكوين طليعة فيتامين D الضروري لكثافة العظام والمناعة.',
    points: 40,
    difficulty: 'easy',
  },
  {
    id: 'q3',
    category: 'medical',
    question: 'كم عدد ساعات الصيام المطلوبة عادة لإجراء تحليل الدهون الكاملة (Lipid Profile) بدقة؟',
    options: ['ساعتين فقط', 'من 4 إلى 6 ساعات', 'من 10 إلى 12 ساعة', '24 ساعة'],
    correctIndex: 2,
    explanation: 'يتطلب تحليل الدهون الثلاثية والكوليسترول صياماً من 10 إلى 12 ساعة (مسموح بشرب الماء النقي فقط).',
    points: 60,
    difficulty: 'medium',
  },
  {
    id: 'q4',
    category: 'medical',
    question: 'ما هي فصيلة الدم التي تُلقب بـ "المعطي العام" لجميع الفصائل؟',
    options: ['AB موجب (+)', 'O سالب (-)', 'A موجب (+)', 'B سالب (-)'],
    correctIndex: 1,
    explanation: 'فصيلة O سالب تفتقر لمولدات الضد A و B وعامل ريسوس، لذا يمكن نقل كرياتها الحمراء لأي فصيلة في الطوارئ.',
    points: 50,
    difficulty: 'easy',
  },
  {
    id: 'q5',
    category: 'medical',
    question: 'ما هو العضو الرئيسي في جسم الإنسان المسؤول عن فلترة وتصفية الدم من الفضلات والسموم؟',
    options: ['الرئتان', 'الكلى', 'الطحال', 'المرارة'],
    correctIndex: 1,
    explanation: 'تقوم الكليتان بتصفية نحو 180 لتراً من السوائل يومياً وتفرز الفضلات في البول للحفاظ على التوازن الكيميائي.',
    points: 40,
    difficulty: 'easy',
  },
  {
    id: 'q6',
    category: 'medical',
    question: 'تحليل صورة الدم الكاملة (CBC) يكشف عن خلايا الدم. أي منها مسؤول عن نقل الأكسجين لجميع الأنسجة؟',
    options: ['كرات الدم البيضاء (WBC)', 'الصفائح الدموية (Platelets)', 'كرات الدم الحمراء (RBC / الهيموجلوبين)', 'البلازما'],
    correctIndex: 2,
    explanation: 'تحتوي كرات الدم الحمراء على بروتين الهيموجلوبين الذي يرتبط بالأكسجين في الرئتين وينقله لأنسجة الجسم.',
    points: 50,
    difficulty: 'medium',
  },

  // فئة ألغاز ومسائل ذكاء
  {
    id: 'q7',
    category: 'puzzle',
    question: 'شيء يمشي بلا أرجل، ويبكي بلا عيون، ويدخل كل بيت دون إذن.. فما هو؟',
    options: ['الريح', 'السحاب / المطر', 'الوقت', 'الظل'],
    correctIndex: 1,
    explanation: 'السحاب يسير مع الريح بلا أقدام، ويهطل مطراً كالبكاء بلا عيون!',
    points: 60,
    difficulty: 'medium',
  },
  {
    id: 'q8',
    category: 'puzzle',
    question: 'مسألة ذكاء سريعة: إذا كان 5 قطط تصطاد 5 فئران في 5 دقائق، فكم دقيقة تحتاج 100 قطة لصيد 100 فأر؟',
    options: ['100 دقيقة', '5 دقائق', '20 دقيقة', 'دقيقة واحدة'],
    correctIndex: 1,
    explanation: 'كل قطة تستغرق 5 دقائق لصيد فأرها المستقل، لذا 100 قطة ستصطاد 100 فأر في نفس الـ 5 دقائق بالتزامن!',
    points: 75,
    difficulty: 'hard',
  },
  {
    id: 'q9',
    category: 'puzzle',
    question: 'أنا أملك قلباً لا ينبض، ولي أوراق كثيرة ولكنني لست شجرة.. فما أنا؟',
    options: ['الكتاب', 'الخس', 'البستان', 'القاموس الطبي'],
    correctIndex: 0,
    explanation: 'الكتاب له أوراق وفصول ويحتوي في وسطه على "قلب الكتاب" الفكري ولكنه جماد!',
    points: 40,
    difficulty: 'easy',
  },
  {
    id: 'q10',
    category: 'puzzle',
    question: 'ما هو الشيء الذي كلما أخذت منه كَبُر، وكلما وضعت فيه صَغُر؟',
    options: ['العمر', 'الحفرة', 'الظل', 'الصمت'],
    correctIndex: 1,
    explanation: 'الحفرة كلما أخذت وحفرت منها زاد اتساعها، وكلما ردمت فيها صغرت!',
    points: 50,
    difficulty: 'easy',
  },

  // فئة ثقافة عامة وترفيه
  {
    id: 'q11',
    category: 'culture',
    question: 'ما هو أكبر كوكب في مجموعتنا الشمسية حجماً؟',
    options: ['زحل', 'المشتري', 'المريخ', 'أورانوس'],
    correctIndex: 1,
    explanation: 'المشتري هو أضخم كواكب المجموعة الشمسية وكتلته تعادل أكثر من ضعفي جميع الكواكب الأخرى مجتمعة.',
    points: 40,
    difficulty: 'easy',
  },
  {
    id: 'q12',
    category: 'culture',
    question: 'في الأمثال الشعبية الشهيرة: "الوقاية خير من ..."',
    options: ['المعاملة', 'العلاج و الندم', 'الانتظار', 'الصبر'],
    correctIndex: 1,
    explanation: 'المثل الطبي الشهير "الوقاية خير من العلاج" يؤكد أهمية الفحص الدوري المبكر للحفاظ على الصحة.',
    points: 30,
    difficulty: 'easy',
  },
  {
    id: 'q13',
    category: 'general',
    question: 'ما هو المعدن السائل الوحيد في درجة حرارة الغرفة العادية وكان يستخدم في موازين الحرارة القديمة؟',
    options: ['البروم', 'الزئبق', 'الرصاص', 'الكالسيوم'],
    correctIndex: 1,
    explanation: 'الزئبق (Mercury) هو العنصر الفلزي الوحيد الذي يبقى سائلاً في درجات الحرارة والضغط المعياريين.',
    points: 50,
    difficulty: 'medium',
  },
  {
    id: 'q14',
    category: 'culture',
    question: 'ما هو أطول نهر في العالم يمر بعدة دول أفريقية منها مصر والسودان؟',
    options: ['نهر الأمازون', 'نهر النيل', 'نهر الدانوب', 'نهر الميسيسيبي'],
    correctIndex: 1,
    explanation: 'نهر النيل هو شريان الحياة وأطول أنهار كوكب الأرض ويمتد لأكثر من 6,650 كيلومتر.',
    points: 30,
    difficulty: 'easy',
  },
  {
    id: 'q15',
    category: 'medical',
    question: 'ما هو العضو في جسم الإنسان المسؤول عن إفراز هرمون الأنسولين لتنظيم السكر في الدم؟',
    options: ['الكبد', 'البنكرياس', 'الغدة الدرقية', 'المعدة'],
    correctIndex: 1,
    explanation: 'تفرز خلايا بيتا في جزر لانجرهانز بالبنكرياس هرمون الأنسولين لخفض الجلوكوز بعد الوجبات.',
    points: 45,
    difficulty: 'easy',
  },
  {
    id: 'q16',
    category: 'medical',
    question: 'ما هو التحليل الطبي المعتمد للكشف عن ترسبات حمض اليوريك وتشخيص داء النقرس وآلام المفاصل؟',
    options: ['حمض اليوريك (Uric Acid)', 'سرعة الترسيب (ESR)', 'الكالسيوم الكلي', 'الكرياتينين'],
    correctIndex: 0,
    explanation: 'ارتفاع حمض البوليك (Uric Acid) في الدم قد يسبب تبلور أملاح اليورات في المفاصل مسبباً النقرس.',
    points: 50,
    difficulty: 'medium',
  },
  {
    id: 'q17',
    category: 'medical',
    question: 'ما هو التحليل المخبري الأساسي للاطمئنان على كفاءة فلترة الكليتين قبل تناول أدوية معينة؟',
    options: ['إنزيمات القلب', 'الكرياتينين ووظائف الكلى (Creatinine)', 'فيتامين C', 'فصائل الدم'],
    correctIndex: 1,
    explanation: 'الكرياتينين هو ناتج أيض العضلات وتفرزه الكلى السليمة بانتظام، ويعد مؤشراً دقيقاً لسلامة الكليتين.',
    points: 50,
    difficulty: 'medium',
  },
  {
    id: 'q18',
    category: 'puzzle',
    question: 'لغز ذكاء سريع: كم شهراً في السنة الميلادية يحتوي على 28 يوماً على الأقل؟',
    options: ['شهر واحد فقط (فبراير)', '6 أشهر', 'جميع الشهور الـ 12', '10 أشهر'],
    correctIndex: 2,
    explanation: 'جميع شهور السنة الـ 12 تحتوي على 28 يوماً، فبعضها يحتوي 30 وبعضها 31 وفبراير 28 أو 29!',
    points: 70,
    difficulty: 'hard',
  },
  {
    id: 'q19',
    category: 'puzzle',
    question: 'شيء يخصك أنت وحدك، ولكن الناس يستخدمونه أكثر منك دون إذنك.. فما هو؟',
    options: ['حذاؤك', 'اسمك', 'صوتك', 'ظلك'],
    correctIndex: 1,
    explanation: 'اسمك ملكك ويناديك به الآخرون ويتداولونه طوال اليوم أكثر مما تنطق به أنت لنفسك!',
    points: 40,
    difficulty: 'easy',
  },
  {
    id: 'q20',
    category: 'culture',
    question: 'في الحكمة العربية الشهيرة: "الصحة تاج على رؤوس الأصحاء، لا يراه إلا ..."',
    options: ['الأطباء', 'الحكماء', 'المرضى', 'الأغنياء'],
    correctIndex: 2,
    explanation: 'المثل يؤكد نعمة العافية وأن الشخص المريض هو الأكثر إدراكاً لقيمة الصحة الغالية.',
    points: 35,
    difficulty: 'easy',
  },
  {
    id: 'q21',
    category: 'medical',
    question: 'ما هو الفحص الطبي الأشهر لتقييم نشاط الغدة الدرقية المنظمة لمعدل الحرق والطاقة؟',
    options: ['هرمون TSH', 'فيتامين B12', 'صورة دم CBC', 'تحليل بول'],
    correctIndex: 0,
    explanation: 'هرمون TSH المحفز للدرقية تفرزه الغدة النخامية ويعد الحساس الأول لأي خمول أو نشاط في الدرقية.',
    points: 55,
    difficulty: 'medium',
  },
];

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
  {
    id: 'rew_7',
    code: 'RT-URIC-FREE',
    title: 'فحص حمض اليوريك (نقرس) مجاناً 100%',
    description: 'اطمئن على سلامة مفاصلك ومعدل حمض البوليك بالدم مجاناً بالكامل.',
    type: 'free_test',
    value: 'تحليل مجاني 100%',
    pointsCost: 280,
    badge: 'مفاصل وعظام 🦴',
    terms: 'صالح في جميع الفروع وخدمة السحب المنزلي.',
    isActive: true,
  },
  {
    id: 'rew_8',
    code: 'RT-CREAT-FREE',
    title: 'تحليل وظائف كلى كرياتينين مجاناً',
    description: 'فحص دقيق لكفاءة تصفية الكلى بالمعمل.',
    type: 'free_test',
    value: 'فحص مجاني 100%',
    pointsCost: 300,
    badge: 'صحة وحماية 🛡️',
    terms: 'يتم تسليم التقرير الطبي خلال ساعات معدودة.',
    isActive: true,
  },
  {
    id: 'rew_9',
    code: 'RT-KIDS-40',
    title: 'خصم 40% على باقة نمو وصحة الطفل',
    description: 'تشمل صورة دم، كالسيوم، حديد، وتحاليل نمو متكاملة لطفلك بخصم استثنائي.',
    type: 'package_deal',
    value: 'خصم 40%',
    pointsCost: 400,
    badge: 'باقة الأطفال 👶',
    terms: 'فريق متخصص في سحب عينات الأطفال بلطف تام.',
    isActive: true,
  },
];

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

export const INITIAL_LAB_SETTINGS: LabSettings = {
  labName: 'معامل RT للتحاليل الطبية',
  tagline: 'دقة التشخيص .. متعة المكافآت وراحة المرضى',
  whatsappNumber: '201021487889', // يمكن تغييره من الإدارة
  hotlineNumber: '01021487889',
  address: 'فروع معامل RT - خدمة السحب المنزلي متوفرة في جميع المناطق على مدار 24 ساعة',
  workingHours: 'يومياً من الساعة 8:00 صباحاً حتى 11:30 مساءً (طوارئ 24 ساعة للعينات المنزلية)',
  homeVisitAvailable: true,
  announcement: '🎉 مرحباً بكم في تحدي ومكافآت معامل RT! العب الآن، جاوب أسئلة الذكاء، دور عجلة الحظ، واكسب تحاليل مجانية وخصومات فورية!',
  quizPointsPerCorrect: 50,
  dailyStreakBonus: 25,
  adminPin: '7788', // رمز الحماية الافتراضي للوحة الإدارة
};

export const INITIAL_LEADERBOARD: LeaderboardUser[] = [
  { id: 'lb1', name: 'أحمد محمود النجار', phoneMasked: '010****542', points: 1850, rank: 1, badge: '👑 بطل RT الماسي', couponsWon: 7 },
  { id: 'lb2', name: 'د. سارة عبد الرحمن', phoneMasked: '012****918', points: 1620, rank: 2, badge: '🥈 بطل ذهبي', couponsWon: 5 },
  { id: 'lb3', name: 'محمد كمال رضوان', phoneMasked: '011****330', points: 1440, rank: 3, badge: '🥉 نجم الأسبوع', couponsWon: 4 },
  { id: 'lb4', name: 'مروة الشاذلي', phoneMasked: '015****774', points: 1290, rank: 4, badge: '🌟 متسابق مميز', couponsWon: 3 },
  { id: 'lb5', name: 'خالد يوسف إبراهيم', phoneMasked: '010****102', points: 1150, rank: 5, badge: '⭐ متسابق واعد', couponsWon: 3 },
];

const STORAGE_KEYS = {
  QUESTIONS: 'rt_lab_questions_v2',
  REWARDS: 'rt_lab_rewards_v2',
  SPIN_SLICES: 'rt_lab_spin_slices_v2',
  SETTINGS: 'rt_lab_settings_v2',
  PLAYER: 'rt_lab_player_profile_v2',
  COUPONS: 'rt_lab_user_coupons_v2',
  LEADERBOARD: 'rt_lab_leaderboard_v2',
  LAST_SPIN_TIME: 'rt_lab_last_spin_time',
  PATIENTS: 'rt_lab_registered_patients_v2',
};

// Safe LocalStorage helpers
function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Player Profile
export function getPlayerProfile(): PlayerProfile {
  return safeGet<PlayerProfile>(STORAGE_KEYS.PLAYER, {
    name: 'عميل معامل RT',
    phone: '',
    points: 120, // Initial welcome bonus points
    streak: 1,
    lastPlayedDate: new Date().toISOString().split('T')[0],
    quizzesCompleted: 0,
    correctAnswersCount: 0,
    wheelSpinsCount: 0,
    scratchCardsCount: 0,
    levelTitle: 'صديق جديد لمعامل RT 🩺',
  });
}

export function savePlayerProfile(profile: PlayerProfile): void {
  // Update level title based on points
  let level = 'صديق جديد لمعامل RT 🩺';
  if (profile.points >= 1500) {
    level = 'سفير التميز لمعامل RT 👑';
  } else if (profile.points >= 800) {
    level = 'خبير الصحة والذكاء 🌟';
  } else if (profile.points >= 400) {
    level = 'بطل التحدي الفضي 🥈';
  } else if (profile.points >= 200) {
    level = 'متسابق نشط ومميز ⭐';
  }
  profile.levelTitle = level;
  safeSet(STORAGE_KEYS.PLAYER, profile);
}

// Questions CRUD
export function getQuestions(): Question[] {
  return safeGet<Question[]>(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
}

export function saveQuestions(questions: Question[]): void {
  safeSet(STORAGE_KEYS.QUESTIONS, questions);
}

export function addQuestion(q: Omit<Question, 'id'>): Question {
  const all = getQuestions();
  const newQ: Question = {
    ...q,
    id: 'q_' + Date.now(),
  };
  const updated = [newQ, ...all];
  saveQuestions(updated);
  return newQ;
}

export function updateQuestion(id: string, partial: Partial<Question>): void {
  const all = getQuestions();
  const updated = all.map((q) => (q.id === id ? { ...q, ...partial } : q));
  saveQuestions(updated);
}

export function deleteQuestion(id: string): void {
  const all = getQuestions();
  const updated = all.filter((q) => q.id !== id);
  saveQuestions(updated);
}

// Rewards CRUD
export function getRewards(): RewardItem[] {
  return safeGet<RewardItem[]>(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
}

export function saveRewards(rewards: RewardItem[]): void {
  safeSet(STORAGE_KEYS.REWARDS, rewards);
}

export function addReward(reward: Omit<RewardItem, 'id' | 'code'> & { code?: string }): RewardItem {
  const all = getRewards();
  const newReward: RewardItem = {
    ...reward,
    id: 'rew_' + Date.now(),
    code: reward.code || 'RT-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
  };
  const updated = [newReward, ...all];
  saveRewards(updated);
  return newReward;
}

export function updateReward(id: string, partial: Partial<RewardItem>): void {
  const all = getRewards();
  const updated = all.map((r) => (r.id === id ? { ...r, ...partial } : r));
  saveRewards(updated);
}

export function deleteReward(id: string): void {
  const all = getRewards();
  const updated = all.filter((r) => r.id !== id);
  saveRewards(updated);
}

// Spin Wheel Slices
export function getSpinSlices(): SpinSlice[] {
  return safeGet<SpinSlice[]>(STORAGE_KEYS.SPIN_SLICES, INITIAL_SPIN_SLICES);
}

export function saveSpinSlices(slices: SpinSlice[]): void {
  safeSet(STORAGE_KEYS.SPIN_SLICES, slices);
}

// Lab Settings
export function getLabSettings(): LabSettings {
  return safeGet<LabSettings>(STORAGE_KEYS.SETTINGS, INITIAL_LAB_SETTINGS);
}

export function saveLabSettings(settings: LabSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

// User Claimed Coupons
export function getUserCoupons(): UserCoupon[] {
  return safeGet<UserCoupon[]>(STORAGE_KEYS.COUPONS, [
    {
      id: 'welcome_coupon',
      couponCode: 'RT-WELCOME-15',
      title: 'كوبون ترحيبي: خصم 15% على أول تحليل',
      description: 'هدية فورية بمناسبة انضمامك لبرنامج مكافآت معامل RT.',
      value: 'خصم 15%',
      type: 'discount_percent',
      wonFrom: 'هدية التسجيل والترحيب',
      createdAt: new Date().toLocaleDateString('ar-EG'),
      expiresAt: new Date(Date.now() + 30 * 86400000).toLocaleDateString('ar-EG'),
      isUsed: false,
      terms: 'صالح لجميع التحاليل المخبرية داخل معامل RT.',
    },
  ]);
}

export function saveUserCoupons(coupons: UserCoupon[]): void {
  safeSet(STORAGE_KEYS.COUPONS, coupons);
}

export function issueUserCoupon(
  title: string,
  description: string,
  value: string,
  type: UserCoupon['type'],
  wonFrom: string,
  terms?: string
): UserCoupon {
  const coupons = getUserCoupons();
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const newCoupon: UserCoupon = {
    id: 'uc_' + Date.now(),
    couponCode: `RT-${randomSuffix}-${Math.floor(100 + Math.random() * 900)}`,
    title,
    description,
    value,
    type,
    wonFrom,
    createdAt: new Date().toLocaleDateString('ar-EG'),
    expiresAt: new Date(Date.now() + 30 * 86400000).toLocaleDateString('ar-EG'),
    isUsed: false,
    terms: terms || 'صالحة للاستخدام في أي فرع أو مع السحب المنزلي، أظهر هذا الكود لموظف الاستقبال.',
  };
  saveUserCoupons([newCoupon, ...coupons]);
  return newCoupon;
}

// Leaderboard
export function getLeaderboard(): LeaderboardUser[] {
  return safeGet<LeaderboardUser[]>(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
}

// Full Reset to Factory Data
export function resetAllDataToDefault(): void {
  safeSet(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTIONS);
  safeSet(STORAGE_KEYS.REWARDS, INITIAL_REWARDS);
  safeSet(STORAGE_KEYS.SPIN_SLICES, INITIAL_SPIN_SLICES);
  safeSet(STORAGE_KEYS.SETTINGS, INITIAL_LAB_SETTINGS);
  safeSet(STORAGE_KEYS.LEADERBOARD, INITIAL_LEADERBOARD);
}

// Export All JSON
export function exportDatabaseBackup(): string {
  const dump = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    settings: getLabSettings(),
    questions: getQuestions(),
    rewards: getRewards(),
    spinSlices: getSpinSlices(),
  };
  return JSON.stringify(dump, null, 2);
}

// Import JSON
export function importDatabaseBackup(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data.questions && Array.isArray(data.questions)) {
      saveQuestions(data.questions);
    }
    if (data.rewards && Array.isArray(data.rewards)) {
      saveRewards(data.rewards);
    }
    if (data.spinSlices && Array.isArray(data.spinSlices)) {
      saveSpinSlices(data.spinSlices);
    }
    if (data.settings && typeof data.settings === 'object') {
      saveLabSettings(data.settings);
    }
    return true;
  } catch (err) {
    console.error('Import error:', err);
    return false;
  }
}

// Initial Registered Patients (for Admin Demo and management)
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
  },
];

export function getRegisteredPatients(): PatientRecord[] {
  return safeGet<PatientRecord[]>(STORAGE_KEYS.PATIENTS, INITIAL_PATIENTS);
}

export function saveRegisteredPatients(patients: PatientRecord[]): void {
  safeSet(STORAGE_KEYS.PATIENTS, patients);
}

export function deletePatientRecord(id: string): void {
  const all = getRegisteredPatients();
  const updated = all.filter((p) => p.id !== id);
  saveRegisteredPatients(updated);
}

export function resetAllPatients(): void {
  saveRegisteredPatients([]);
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
    };
    saveRegisteredPatients([newRecord, ...all]);
  }
}

// Reset the entire app data for testing with new fresh patients
export function resetAppForNewPatients(): void {
  localStorage.removeItem(STORAGE_KEYS.PLAYER);
  localStorage.removeItem(STORAGE_KEYS.COUPONS);
}
