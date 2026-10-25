// Official Laboratory Data imported directly from Lab Backup JSON
import { LabSettings, Question, RewardItem, SpinSlice, LeaderboardUser } from "../types";

export const OFFICIAL_BACKUP_VERSION = "3.0";
export const OFFICIAL_EXPORT_DATE = "2026-10-20T08:17:08.766Z";

export const OFFICIAL_LAB_SETTINGS: LabSettings = {
  "labName": "معامل RT للتحاليل التشخيصية ",
  "tagline": "التشخيص الصحيح يبداء معنا",
  "whatsappNumber": "201100874444",
  "hotlineNumber": "01100046841",
  "address": "فروع معامل RT - خدمة السحب المنزلي متوفرة في جميع المناطق على مدار 24 ساعة",
  "workingHours": "يومياً من 8:00 صباحاً حتى 11:30 مساءً (طوارئ 24 ساعة للعينات المنزلية)",
  "homeVisitAvailable": true,
  "announcement": "🎉 مرحباً بكم في معامل RT! تم تفعيل المزامنة السحابية الفورية بين جميع الفروع والأجهزة للتواصل المباشر مع المرضى عبر الواتساب.",
  "quizPointsPerCorrect": 50,
  "dailyStreakBonus": 25,
  "adminPin": "7788",
  "branches": [
    {
      "id": "br_main",
      "name": "الفرع الرئيسي -  شبرا الخيمة ",
      "city": "القاهرة",
      "address": "ميدان بهتيم برج صيدلية العزبي الدور الثالث فوق جيم موسي امام الاسانسير ",
      "phone": "01100046841",
      "whatsappNumber": "201100874444",
      "googleMapsUrl": "",
      "workingHours": "يومياً من 10:00 صباحاً إلى 1000 مساءً (طوارئ سحب منزلي 24 ساعة)",
      "managerName": "دكتوره / رحاب على عبدالحميد ",
      "isMainBranch": true,
      "homeSamplingCoverage": "القاهرة الكبري والجيزة ",
      "notes": "معمل مجهز بأحدث أجهزة التحاليل الآلية ووحدة طوارئ سريعة"
    }
  ],
  "adminTeam": [
    {
      "id": "adm_1",
      "name": "د. رامي مختار",
      "role": "CEO - مؤسس ورئيس مجلس الادارة",
      "phone": "01124485444",
      "whatsappNumber": "201100874444",
      "branchId": "br_main",
      "isOnline": true,
      "allowDirectWhatsApp": true,
      "bio": "طبيب الباثولوجيا الاكلينيكية والكيميائية - طب قصر العيني"
    },
    {
      "id": "adm_2",
      "name": "د. رحاب علي عبدالحميد",
      "role": "المدير التنفيذي للمعامل",
      "phone": "01013242777",
      "whatsappNumber": "201100046841",
      "branchId": "br_heliopolis",
      "isOnline": true,
      "allowDirectWhatsApp": true,
      "bio": "طبيب باثولوجى "
    },
    {
      "id": "adm_3",
      "name": "أ.آية احمد",
      "role": "مسؤول خدمة العملاء وتنسيق السحب المنزلي السريع",
      "phone": "01278967133",
      "whatsappNumber": "201116979431",
      "branchId": "br_tagamoa",
      "isOnline": true,
      "allowDirectWhatsApp": true,
      "bio": "سحب عينات / استقبال"
    },
    {
      "id": "adm_4",
      "name": "ك. مني احمد",
      "role": "اخصائى تحاليل طبية",
      "phone": "01013242777",
      "whatsappNumber": "201000756144",
      "branchId": "br_dokki",
      "isOnline": true,
      "allowDirectWhatsApp": true,
      "bio": "سحب عينات / شغل الوحدات بالمعمل"
    }
  ],
  "whatsappTemplates": [
    {
      "id": "tpl_1",
      "title": "تأكيد حجز سحب عينات منزلي 🏠",
      "category": "booking",
      "templateText": "🎉 *أهلاً بك يا أستاذ/ة {patient_name} في {lab_name}!*\n\n✅ *تم استلام واعتماد طلبك لخدمة السحب المنزلي بنجاح:*\n📍 *العنوان:* {branch_address}\n⏰ *الميعاد المفضل:* {preferred_time}\n🎁 *الكوبون أو الخدمة:* {prize_title} (كود: *{coupon_code}*)\n🩺 *مسؤول الزيارة:* فريق التمريض المتنقل المجهز بأحدث أنابيب وأجهزة سحب العينات المعقمة.\n\n📞 للتواصل السريع مع منسق الزيارات: {manager_name} ({phone})\n💚 صحتك وراحتك في بيتك أولويتنا الدائمة!",
      "isActive": true
    },
    {
      "id": "tpl_2",
      "title": "إشعار جاهزية نتائج التحاليل 📋",
      "category": "results",
      "templateText": "السلام عليكم ورحمة الله وبركاته يا أستاذ/ة *{patient_name}* 🩺\n\nيسر *{lab_name}* إبلاغكم بأن نتائج تحاليلكم الطبية قد اكتملت وتمت مراجعتها واعتمادها من قبل استشاري المعمل *{manager_name}*.\n\n📄 يمكنكم استلام التقرير بصيغة PDF فوراً بالرد على هذه الرسالة، أو زيارة *{branch_name}*.\n📍 العنوان: {branch_address}\n📞 هاتف الفرع: {branch_phone}\n\nنتمنى لكم دوام الصحة والعافية والشفاء التام دائماً 💚",
      "isActive": true
    },
    {
      "id": "tpl_3",
      "title": "تهنئة الفوز بجائزة / تحليل مجاني 🎁",
      "category": "rewards",
      "templateText": "مبارك لك يا بطل/ة *{patient_name}*! 🏆🎉\n\nلقد فزت بـ *{prize_title}* بقيمة *{prize_value}* من *{lab_name}*!\n⭐ رصيد نقاطك الحالي: *{points} نقطة*.\n🔢 كود الكوبون المعتمد: *{coupon_code}*\n\n🏥 يمكنك الاستفادة من جائزتك مباشرة بزيارة أي من فروعنا أو بطلب خدمة السحب المنزلي:\n📍 *{branch_name}:* {branch_address}\n📞 للاستفسار والتفعيل المباشر: {phone}\n\nنتشرف دائماً بخدمتكم في معامل RT! 🌟",
      "isActive": true
    },
    {
      "id": "tpl_4",
      "title": "عناوين وفروع معامل RT ولوكيشن الخرائط 📍",
      "category": "branches",
      "templateText": "يسعدنا دائماً استقبالكم في كافة فروع *{lab_name}*:\n\n📍 *الفرع الرئيسي (شبرا الخيمة):*\nميدان بهتيم برج صيدلية العزبي الدور الثالث فوق جيم موسي امام الاسانسير\n📞 هاتف وواتساب: 01100046841 / 201100874444\n⏰ يومياً من 10:00 ص إلى 10:00 م\n\n🚗 *خدمة السحب المنزلي متوفرة في جميع أنحاء القاهرة والجيزة والقليوبية على مدار 24 ساعة.*\nللحجز السريع كلمنا على الخط الساخن: *{hotline}* 💚",
      "isActive": true
    },
    {
      "id": "tpl_5",
      "title": "متابعة المريض بعد الفحص والاطمئنان عليه 💚",
      "category": "inquiry",
      "templateText": "مساء الخير يا أستاذ/ة *{patient_name}* 🌷\nمعكم فريق المتابعة الطبية من *{lab_name}*.\n\nنود الاطمئنان على صحتكم الكريمة بعد زيارتكم الأخيرة لمعملنا، ونتمنى أن تكون نتائج الفحوصات مطمئنة.\nإذا كان لديكم أي استفسار طبي بخصوص قراءة التقرير، فإن أطباء واستشاريي المعمل يسعدهم الرد عليكم ومساعدتكم مجاناً في أي وقت.\n\nدمتم بصحة وعافية وراحة بال دائماً! 🤲",
      "isActive": true
    },
    {
      "id": "tpl_6",
      "title": "عرض باقة الفحص الدوري الشامل 🩺",
      "category": "general",
      "templateText": "عزيزنا العميل *{patient_name}* 🌟\n\"الوقاية خير من العلاج\" .. وحرصاً على صحتك وصحة أسرتك، تقدم لك *{lab_name}* باقة الفحص الشامل المتميزة:\n\n🩺 *تشمل الباقة:*\n- صورة دم كاملة (CBC)\n- وظائف كبد كاملة (ALT - AST)\n- وظائف كلى وكرياتينين\n- سكر تراكمي وسكر صائم\n- دهون ثلاثية وكوليسترول كلي\n- حمض اليوريك (النقرس)\n\n💰 *بخصم خاص 35%* لعملاء التحدي والمكافآت!\n🚗 شاملة سحب العينات من المنزل مجاناً.\nللحجز السريع: أرسل لنا رسالة هنا أو اتصل بنا: *{hotline}*",
      "isActive": true
    }
  ],
  "cloudSyncRoomId": "RT-LAB-MAIN-CLOUD",
  "githubRepo": "ramimokhtar228-maker/rt-lab-rewards",
  "githubBranch": "main"
};

export const OFFICIAL_QUESTIONS: Question[] = [
  {
    "id": "q1",
    "category": "medical",
    "question": "ما هو التحليل الطبي المعتمد دولياً لقياس متوسط معدل السكر في الدم على مدار آخر 3 أشهر؟",
    "options": [
      "تحليل السكر العشوائي",
      "السكر التراكمي (HbA1c)",
      "سكر صائم وفاطر",
      "منحنى السكر بالدم"
    ],
    "correctIndex": 1,
    "explanation": "السكر التراكمي (HbA1c) يقيس نسبة ارتباط الجلوكوز بالهيموجلوبين داخل كريات الدم الحمراء خلال دورة حياتها (نحو 120 يوماً).",
    "points": 50,
    "difficulty": "easy"
  },
  {
    "id": "q2",
    "category": "medical",
    "question": "ما هو الفيتامين الملقب بـ \"فيتامين أشعة الشمس\" والمسؤول أساساً عن امتصاص الكالسيوم وتقوية العظام والمناعة؟",
    "options": [
      "فيتامين C",
      "فيتامين B12",
      "فيتامين D",
      "فيتامين A"
    ],
    "correctIndex": 2,
    "explanation": "يتم تصنيع فيتامين د في الجلد عند التعرض لأشعة الشمس المعتدلة، وهو ضروري لامتصاص الكالسيوم والفوسفور.",
    "points": 40,
    "difficulty": "easy"
  },
  {
    "id": "q3",
    "category": "medical",
    "question": "ما هي فصيلة الدم المعروفة علمياً بلقب \"المعطي العام\" لأنها تستطيع التبرع بالدم لجميع الفصائل الأخرى؟",
    "options": [
      "فصيلة AB موجب",
      "فصيلة O سالب (O-)",
      "فصيلة A موجب",
      "فصيلة B سالب"
    ],
    "correctIndex": 1,
    "explanation": "فصيلة O سالب تخلو خلاياها من الأنتيجينات A و B وعامل ريسس، لذا لا يهاجمها جهاز المناعة لدى أي مريض.",
    "points": 60,
    "difficulty": "medium"
  },
  {
    "id": "q4",
    "category": "medical",
    "question": "كم ساعة يفضل أن يصوم المريض عادة لإجراء تحليل الدهون الكاملة في الدم (Lipid Profile) بدقة عالية؟",
    "options": [
      "ساعتين فقط",
      "من 4 إلى 6 ساعات",
      "من 10 إلى 12 ساعة",
      "24 ساعة كاملة"
    ],
    "correctIndex": 2,
    "explanation": "تحليل الدهون الثلاثية والكوليسترول يتطلب صياماً من 10 إلى 12 ساعة مع السماح بشرب الماء العذب فقط للحصول على أدق نتائج.",
    "points": 45,
    "difficulty": "medium"
  },
  {
    "id": "q5",
    "category": "medical",
    "question": "ما هو البروتين الرئيسي المسؤول عن حمل ونقل الأكسجين في كريات الدم الحمراء إلى سائر أنسجة الجسم؟",
    "options": [
      "الميوجلوبين",
      "الألبومين",
      "الهيموجلوبين",
      "الترانسفيرين"
    ],
    "correctIndex": 2,
    "explanation": "الهيموجلوبين مركب غني بالحديد موجود في خلايا الدم الحمراء، ويرتبط بالأكسجين في الرئتين ليوزعه على خلايا الجسم.",
    "points": 50,
    "difficulty": "easy"
  },
  {
    "id": "q6",
    "category": "medical",
    "question": "ما هو العضو في جسم الإنسان المسؤول عن إفراز هرمون الأنسولين لتنظيم السكر في الدم؟",
    "options": [
      "الكبد",
      "البنكرياس",
      "الغدة الدرقية",
      "المعدة"
    ],
    "correctIndex": 1,
    "explanation": "تفرز خلايا بيتا في جزر لانجرهانز بالبنكرياس هرمون الأنسولين لخفض الجلوكوز بعد الوجبات.",
    "points": 45,
    "difficulty": "easy"
  },
  {
    "id": "q7",
    "category": "medical",
    "question": "ما هو التحليل الطبي المعتمد للكشف عن ترسبات حمض اليوريك وتشخيص داء النقرس وآلام المفاصل؟",
    "options": [
      "حمض اليوريك (Uric Acid)",
      "سرعة الترسيب (ESR)",
      "الكالسيوم الكلي",
      "الكرياتينين"
    ],
    "correctIndex": 0,
    "explanation": "ارتفاع حمض البوليك (Uric Acid) في الدم قد يسبب تبلور أملاح اليورات في المفاصل مسبباً النقرس.",
    "points": 50,
    "difficulty": "medium"
  },
  {
    "id": "q8",
    "category": "puzzle",
    "question": "لغز ذكاء سريع: إذا كان 5 قطط تصطاد 5 فئران في 5 دقائق، فكم دقيقة تحتاج 100 قطة لصيد 100 فأر؟",
    "options": [
      "100 دقيقة",
      "5 دقائق",
      "20 دقيقة",
      "دقيقة واحدة"
    ],
    "correctIndex": 1,
    "explanation": "كل قطة تستغرق 5 دقائق لصيد فأرها المستقل، لذا 100 قطة ستصطاد 100 فأر في نفس الـ 5 دقائق بالتزامن!",
    "points": 75,
    "difficulty": "hard"
  },
  {
    "id": "q9",
    "category": "culture",
    "question": "في الأمثال الشعبية الشهيرة: \"الوقاية خير من ...\"",
    "options": [
      "المعاملة",
      "العلاج والندم",
      "الانتظار",
      "الصبر"
    ],
    "correctIndex": 1,
    "explanation": "المثل الطبي الشهير \"الوقاية خير من العلاج\" يؤكد أهمية الفحص الدوري المبكر للحفاظ على الصحة.",
    "points": 30,
    "difficulty": "easy"
  },
  {
    "id": "q10",
    "category": "medical",
    "question": "ما هو الفحص الطبي الأشهر لتقييم نشاط الغدة الدرقية المنظمة لمعدل الحرق والطاقة؟",
    "options": [
      "هرمون TSH",
      "فيتامين B12",
      "صورة دم CBC",
      "تحليل بول"
    ],
    "correctIndex": 0,
    "explanation": "هرمون TSH المحفز للدرقية تفرزه الغدة النخامية ويعد الحساس الأول لأي خمول أو نشاط في الدرقية.",
    "points": 55,
    "difficulty": "medium"
  }
];

export const OFFICIAL_REWARDS: RewardItem[] = [
  {
    "id": "rew_1792484194899",
    "code": "RT-AMS7Y",
    "title": "نسبه خصم على اى فاتورة 66%",
    "description": "خصم 66% على قيمه الفاتورة عند حجز اى تحاليل ",
    "type": "discount_percent",
    "value": "66%",
    "pointsCost": 350,
    "badge": "الأكثر طلباً 🔥",
    "terms": "صالح لمدة 30 يوماً من تاريخ الإصدار.",
    "isActive": true
  },
  {
    "id": "rew_1",
    "code": "RT-CBC-FREE",
    "title": "تحليل صورة دم كاملة (CBC) مجاناً 100%",
    "description": "تحليل شامل لكريات الدم الحمراء والبيضاء والصفائح ونسبة الهيموجلوبين في أحدث أجهزة معامل RT.",
    "type": "free_test",
    "value": "تحليل مجاني 100%",
    "pointsCost": 350,
    "badge": "الأكثر طلباً 🔥",
    "terms": "صالح لمدة 30 يوماً في أي فرع أو مع خدمة السحب المنزلي.",
    "isActive": true
  },
  {
    "id": "rew_2",
    "code": "RT-DISC-25",
    "title": "خصم 25% على إجمالي فاتورة التحاليل",
    "description": "خصم فوري مباشر يطبق على أي تحاليل فردية تطلبها لنفسك أو لأحد أفراد أسرتك.",
    "type": "discount_percent",
    "value": "خصم 25%",
    "pointsCost": 200,
    "badge": "توفير فوري 💰",
    "terms": "يطبق الخصم عند الدفع في المعمل أو لمسؤول السحب المنزلي.",
    "isActive": true
  },
  {
    "id": "rew_3",
    "code": "RT-SUGAR-FREE",
    "title": "فحص سكر صائم وفاطر مجاناً",
    "description": "اطمئن على معدلات الجلوكوز لديك مع فحص السكر الصائم والفاطر الدقيق بأعلى معايير الجودة.",
    "type": "free_test",
    "value": "فحص مجاني 100%",
    "pointsCost": 250,
    "badge": "صحة وحيوية 🩺",
    "terms": "يلزم الصيام من 6 إلى 8 ساعات لتحليل السكر الصائم.",
    "isActive": true
  },
  {
    "id": "rew_4",
    "code": "RT-CHECKUP-35",
    "title": "خصم 35% على باقة الفحص الدوري الشامل",
    "description": "تشمل وظائف كبد، وظائف كلى، دهون ثلاثية وكوليسترول، صورة دم وسكر تراكمي بخصم استثنائي.",
    "type": "package_deal",
    "value": "خصم 35%",
    "pointsCost": 500,
    "badge": "الباقة الذهبية ⭐",
    "terms": "يمكن إهداء الكوبون لأي شخص من العائلة والأقارب.",
    "isActive": true
  },
  {
    "id": "rew_5",
    "code": "RT-CASH-50",
    "title": "قسيمة خصم 50 ج.م على أي فاتورة",
    "description": "خصم نقدي مباشر 50 جنيه من قيمة أي تحليل تجريه داخل معامل RT.",
    "type": "cash_discount",
    "value": "50 ج.م كاش",
    "pointsCost": 150,
    "badge": "كاش باك 🎁",
    "terms": "بدون حد أدنى لقيمة التحاليل المطلوبة.",
    "isActive": true
  },
  {
    "id": "rew_6",
    "code": "RT-VITD-GIFT",
    "title": "فحص فيتامين د (Vitamin D) بنصف السعر (خصم 50%)",
    "description": "اطمئن على صحة عظامك ومناعتك وتحليل نشاط فيتامين د بدقة كيميائية فائقة.",
    "type": "discount_percent",
    "value": "خصم 50%",
    "pointsCost": 450,
    "badge": "عرض خاص ✨",
    "terms": "متاح للحجز الفوري مع التقرير في نفس اليوم.",
    "isActive": true
  }
];

export const OFFICIAL_SPIN_SLICES: SpinSlice[] = [
  {
    "id": "s1",
    "label": "خصم 40%",
    "subtext": "على جميع الفحوصات",
    "type": "discount",
    "value": "40%",
    "color": "#0d9488",
    "probability": 20,
    "pointsAmount": 50
  },
  {
    "id": "s2",
    "label": "100 نقطة",
    "subtext": "تضاف فوراً لرصيدك",
    "type": "points",
    "value": "100",
    "pointsAmount": 100,
    "color": "#f59e0b",
    "probability": 25
  },
  {
    "id": "s3",
    "label": "تحليل CBC مجاني",
    "subtext": "صورة دم كاملة هدية",
    "type": "free_test",
    "value": "تحليل CBC مجاني",
    "color": "#6366f1",
    "probability": 10,
    "pointsAmount": 50
  },
  {
    "id": "s4",
    "label": "خصم 50 ج.م",
    "subtext": "خصم نقدي مباشر",
    "type": "discount",
    "value": "50 ج.م",
    "color": "#10b981",
    "probability": 15
  },
  {
    "id": "s5",
    "label": "50 نقطة",
    "subtext": "نقاط مكافأة إضافية",
    "type": "points",
    "value": "50",
    "pointsAmount": 50,
    "color": "#ec4899",
    "probability": 20
  },
  {
    "id": "s6",
    "label": "فحص سكر مجاناً",
    "subtext": "صائم أو عشوائي هدية",
    "type": "free_test",
    "value": "فحص سكر مجاني",
    "color": "#0284c7",
    "probability": 8
  },
  {
    "id": "s7",
    "label": "باقة فحص -30%",
    "subtext": "عرض الباقة الشاملة",
    "type": "discount",
    "value": "30%",
    "color": "#8b5cf6",
    "probability": 10
  },
  {
    "id": "s8",
    "label": "200 نقطة ذهبية",
    "subtext": "جائزة النقاط الكبرى",
    "type": "points",
    "value": "200",
    "pointsAmount": 200,
    "color": "#d97706",
    "probability": 5
  },
  {
    "id": "s_1792483794407",
    "label": "خصم 60% ",
    "subtext": "على اى تحاليل",
    "type": "discount",
    "value": "60%",
    "probability": 15,
    "color": "#962f0d",
    "pointsAmount": 50
  },
  {
    "id": "s_1792483876991",
    "label": "فحص شامل مخفض ",
    "subtext": "فحص 399",
    "type": "discount",
    "value": "399 ج.م",
    "probability": 20,
    "color": "#0d1696",
    "pointsAmount": 50
  },
  {
    "id": "s_1792483967008",
    "label": "خصم 55% ",
    "subtext": "على فيتامين د",
    "type": "discount",
    "value": "55%",
    "probability": 17,
    "color": "#38960d",
    "pointsAmount": 50
  },
  {
    "id": "s_1792484020623",
    "label": "خصم 60% ",
    "subtext": "على جرثومه المعدة بالبراز",
    "type": "discount",
    "value": "60%",
    "probability": 15,
    "color": "#0d9488",
    "pointsAmount": 50
  },
  {
    "id": "s_1792484087541",
    "label": "اسعار زماااان",
    "subtext": "سعر اى تحليل 80 ج.م",
    "type": "discount",
    "value": "80 ج.م",
    "probability": 19,
    "color": "#960d72",
    "pointsAmount": 50
  }
];

export const OFFICIAL_LEADERBOARD: LeaderboardUser[] = [
  {
    "id": "lb1",
    "name": "أحمد محمود النجار",
    "phoneMasked": "010****542",
    "points": 1850,
    "rank": 1,
    "badge": "👑 بطل RT الماسي",
    "couponsWon": 7
  },
  {
    "id": "lb2",
    "name": "د. سارة عبد الرحمن",
    "phoneMasked": "012****918",
    "points": 1620,
    "rank": 2,
    "badge": "🥈 بطل ذهبي",
    "couponsWon": 5
  },
  {
    "id": "lb3",
    "name": "محمد كمال رضوان",
    "phoneMasked": "011****330",
    "points": 1440,
    "rank": 3,
    "badge": "🥉 نجم الأسبوع",
    "couponsWon": 4
  },
  {
    "id": "lb4",
    "name": "مروة الشاذلي",
    "phoneMasked": "015****774",
    "points": 1290,
    "rank": 4,
    "badge": "🌟 متسابق مميز",
    "couponsWon": 3
  },
  {
    "id": "lb5",
    "name": "خالد يوسف إبراهيم",
    "phoneMasked": "010****102",
    "points": 1150,
    "rank": 5,
    "badge": "⭐ متسابق واعد",
    "couponsWon": 3
  }
];
