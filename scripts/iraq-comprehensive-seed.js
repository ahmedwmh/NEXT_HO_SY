const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// مدن العراق
const iraqiCities = [
  { name: 'بغداد' },
  { name: 'البصرة' },
  { name: 'الموصل' },
  { name: 'أربيل' },
  { name: 'السليمانية' },
  { name: 'دهوك' },
  { name: 'كربلاء' },
  { name: 'النجف' },
  { name: 'كربلاء' },
  { name: 'الديوانية' },
  { name: 'بابل' },
  { name: 'واسط' },
  { name: 'ميسان' },
  { name: 'ذي قار' },
  { name: 'المثنى' },
  { name: 'صلاح الدين' },
  { name: 'ديالى' },
  { name: 'الأنبار' },
  { name: 'كركوك' }
]

// المستشفيات لكل مدينة
const hospitalsByCity = {
  'بغداد': [
    { name: 'مستشفى بغداد التعليمي', type: 'تعليمي' },
    { name: 'مستشفى الكرامة', type: 'عام' },
    { name: 'مستشفى الرشيد العسكري', type: 'عسكري' },
    { name: 'مستشفى ابن النفيس', type: 'خاص' },
    { name: 'مستشفى اليرموك', type: 'عام' },
    { name: 'مستشفى مدينة الطب', type: 'تعليمي' }
  ],
  'البصرة': [
    { name: 'مستشفى البصرة التعليمي', type: 'تعليمي' },
    { name: 'مستشفى الصدر', type: 'متخصص' },
    { name: 'مستشفى الفرات', type: 'عام' },
    { name: 'مستشفى النفط', type: 'خاص' }
  ],
  'الموصل': [
    { name: 'مستشفى الموصل التعليمي', type: 'تعليمي' },
    { name: 'مستشفى ابن سينا', type: 'عام' },
    { name: 'مستشفى الجمهورية', type: 'عام' }
  ],
  'أربيل': [
    { name: 'مستشفى أربيل التعليمي', type: 'تعليمي' },
    { name: 'مستشفى راجا', type: 'خاص' },
    { name: 'مستشفى ناوشيروان', type: 'عام' }
  ],
  'السليمانية': [
    { name: 'مستشفى السليمانية التعليمي', type: 'تعليمي' },
    { name: 'مستشفى شاندر', type: 'خاص' }
  ],
  'دهوك': [
    { name: 'مستشفى دهوك التعليمي', type: 'تعليمي' },
    { name: 'مستشفى آزادي', type: 'عام' }
  ],
  'كربلاء': [
    { name: 'مستشفى كربلاء التعليمي', type: 'تعليمي' },
    { name: 'مستشفى الحسين', type: 'عام' }
  ],
  'النجف': [
    { name: 'مستشفى النجف التعليمي', type: 'تعليمي' },
    { name: 'مستشفى علي الأكبر', type: 'عام' }
  ]
}

// التخصصات الطبية
const specializations = [
  'الطب الباطني', 'الجراحة العامة', 'أمراض القلب', 'أمراض الجلدية',
  'أمراض العيون', 'أمراض الأنف والأذن والحنجرة', 'أمراض النساء والولادة',
  'أطفال', 'أمراض العظام', 'الطب النفسي', 'التخدير', 'الأشعة',
  'الطب النووي', 'الطب الطبيعي', 'الطب الشرعي', 'الطب الوقائي',
  'أمراض الدم', 'أمراض الكلى', 'أمراض الجهاز الهضمي', 'أمراض الصدر'
]

// الأسماء العربية
const firstNames = [
  'أحمد', 'محمد', 'علي', 'حسن', 'حسين', 'عبدالله', 'عبدالرحمن', 'عبدالعزيز',
  'خالد', 'سعد', 'عمر', 'يوسف', 'إبراهيم', 'عبدالرحيم', 'محمود', 'عبداللطيف',
  'فاضل', 'كاظم', 'جعفر', 'طاهر', 'نور الدين', 'عبدالوهاب', 'عبدالهادي',
  'زين العابدين', 'عبدالمحسن', 'عبدالمنعم', 'عبدالرحيم', 'عبدالستار'
]

const lastNames = [
  'الأنباري', 'البغدادي', 'البصري', 'الموصلي', 'الكربلائي', 'النجفي',
  'الحسني', 'الحسيني', 'العباسي', 'الجعفري', 'الطوسي', 'الطبرسي',
  'الرازي', 'ابن سينا', 'الخوارزمي', 'الفراهيدي', 'الخليل', 'السيوطي',
  'الطبري', 'ابن خلدون', 'الغزالي', 'الرومي', 'الشيرازي', 'الطوسي'
]

// الأمراض الشائعة في العراق
const diseases = [
  { name: 'السكري', category: 'مزمن', severity: 'medium' },
  { name: 'ارتفاع ضغط الدم', category: 'قلبية', severity: 'high' },
  { name: 'أمراض القلب التاجية', category: 'قلبية', severity: 'high' },
  { name: 'الربو', category: 'تنفسية', severity: 'medium' },
  { name: 'التهاب المفاصل', category: 'عظام', severity: 'medium' },
  { name: 'السرطان', category: 'أورام', severity: 'critical' },
  { name: 'أمراض الكلى', category: 'كلى', severity: 'high' },
  { name: 'أمراض الكبد', category: 'كبد', severity: 'high' },
  { name: 'الاكتئاب', category: 'نفسية', severity: 'medium' },
  { name: 'القلق', category: 'نفسية', severity: 'low' },
  { name: 'أمراض العيون', category: 'عيون', severity: 'medium' },
  { name: 'أمراض الأذن', category: 'أنف وأذن', severity: 'low' },
  { name: 'أمراض الجلد', category: 'جلدية', severity: 'low' },
  { name: 'أمراض الجهاز الهضمي', category: 'هضمي', severity: 'medium' },
  { name: 'أمراض الدم', category: 'دم', severity: 'high' }
]

// الفحوصات الطبية
const tests = [
  { name: 'تحليل الدم الشامل', category: 'مخبرية', duration: '30 دقيقة' },
  { name: 'تحليل السكر', category: 'مخبرية', duration: '15 دقيقة' },
  { name: 'تحليل الكوليسترول', category: 'مخبرية', duration: '20 دقيقة' },
  { name: 'تحليل وظائف الكلى', category: 'مخبرية', duration: '25 دقيقة' },
  { name: 'تحليل وظائف الكبد', category: 'مخبرية', duration: '30 دقيقة' },
  { name: 'الأشعة السينية للصدر', category: 'أشعة', duration: '15 دقيقة' },
  { name: 'الأشعة السينية للعظام', category: 'أشعة', duration: '20 دقيقة' },
  { name: 'الرنين المغناطيسي', category: 'أشعة', duration: '45 دقيقة' },
  { name: 'الموجات فوق الصوتية', category: 'أشعة', duration: '30 دقيقة' },
  { name: 'تخطيط القلب', category: 'قلبية', duration: '15 دقيقة' },
  { name: 'منظار المعدة', category: 'تنظير', duration: '30 دقيقة' },
  { name: 'منظار القولون', category: 'تنظير', duration: '45 دقيقة' },
  { name: 'فحص العيون', category: 'عيون', duration: '20 دقيقة' },
  { name: 'فحص الأذن', category: 'أنف وأذن', duration: '15 دقيقة' },
  { name: 'فحص الجلد', category: 'جلدية', duration: '10 دقيقة' }
]

// العلاجات الطبية
const treatments = [
  { name: 'العلاج الطبيعي', category: 'فيزيائي', duration: '6 أسابيع' },
  { name: 'العلاج الكيميائي', category: 'أورام', duration: '6 أشهر' },
  { name: 'العلاج الإشعاعي', category: 'أورام', duration: '8 أسابيع' },
  { name: 'العلاج النفسي', category: 'نفسي', duration: '12 جلسة' },
  { name: 'العلاج الطبيعي للعظام', category: 'عظام', duration: '8 أسابيع' },
  { name: 'العلاج الطبيعي للقلب', category: 'قلبية', duration: '12 أسبوع' },
  { name: 'العلاج الطبيعي للجهاز التنفسي', category: 'تنفسي', duration: '6 أسابيع' },
  { name: 'العلاج بالليزر', category: 'تجميلي', duration: '4 جلسات' },
  { name: 'العلاج بالحقن', category: 'مخدر', duration: '3 جلسات' },
  { name: 'العلاج بالحجامة', category: 'تقليدي', duration: '5 جلسات' }
]

// العمليات الجراحية
const operations = [
  { name: 'جراحة القلب المفتوح', category: 'قلبية', duration: '6 ساعات' },
  { name: 'جراحة استئصال المرارة', category: 'عامة', duration: '2 ساعة' },
  { name: 'جراحة استئصال الزائدة', category: 'عامة', duration: '1 ساعة' },
  { name: 'جراحة العيون', category: 'عيون', duration: '2 ساعة' },
  { name: 'جراحة الأذن', category: 'أنف وأذن', duration: '3 ساعات' },
  { name: 'جراحة العظام', category: 'عظام', duration: '4 ساعات' },
  { name: 'جراحة المخ والأعصاب', category: 'عصبية', duration: '8 ساعات' },
  { name: 'جراحة التجميل', category: 'تجميلي', duration: '3 ساعات' },
  { name: 'جراحة المسالك البولية', category: 'مسالك', duration: '2 ساعة' },
  { name: 'جراحة النساء', category: 'نساء', duration: '2 ساعة' }
]

// الأدوية الشائعة
const medications = [
  { name: 'الأسبرين', dosage: '100 مجم', frequency: 'مرة يومياً' },
  { name: 'الباراسيتامول', dosage: '500 مجم', frequency: '3 مرات يومياً' },
  { name: 'الإنسولين', dosage: '10 وحدات', frequency: 'قبل الوجبات' },
  { name: 'الميتفورمين', dosage: '500 مجم', frequency: 'مرتين يومياً' },
  { name: 'الأموكسيسيلين', dosage: '500 مجم', frequency: '3 مرات يومياً' },
  { name: 'الأوميبرازول', dosage: '20 مجم', frequency: 'مرة يومياً' },
  { name: 'الأتورفاستاتين', dosage: '20 مجم', frequency: 'مرة يومياً' },
  { name: 'اللوسارتان', dosage: '50 مجم', frequency: 'مرة يومياً' },
  { name: 'البروبرانولول', dosage: '40 مجم', frequency: 'مرتين يومياً' },
  { name: 'الديجوكسين', dosage: '0.25 مجم', frequency: 'مرة يومياً' }
]

async function seedIraqiData() {
  try {
    console.log('🇮🇶 بدء إضافة البيانات الطبية فقط (العلاجات، العمليات، الأمراض، الفحوصات)...\n')

    // جلب جميع المستشفيات الموجودة
    console.log('🏥 جلب المستشفيات الموجودة...')
    const existingHospitals = await prisma.hospital.findMany({
      include: {
        city: true
      }
    })

    if (existingHospitals.length === 0) {
      console.log('❌ لا توجد مستشفيات في قاعدة البيانات. يرجى تشغيل سكريبت إنشاء المستشفيات أولاً.')
      return
    }

    console.log(`📊 تم العثور على ${existingHospitals.length} مستشفى`)

    // 1. إنشاء الأمراض المخصصة للمستشفيات
    console.log('\n🦠 إضافة الأمراض للمستشفيات...')
    let totalDiseases = 0
    for (const hospital of existingHospitals) {
      const hospitalDiseases = diseases.slice(0, Math.floor(Math.random() * 8) + 5) // 5-12 مرض لكل مستشفى
      for (const disease of hospitalDiseases) {
        await prisma.hospitalDisease.create({
          data: {
            hospitalId: hospital.id,
            name: disease.name,
            description: `وصف طبي لمرض ${disease.name}`,
            category: disease.category,
            severity: disease.severity
          }
        })
        totalDiseases++
      }
      console.log(`✅ تم إضافة ${hospitalDiseases.length} مرض لمستشفى ${hospital.name} - ${hospital.city.name}`)
    }

    // 2. إنشاء الفحوصات المخصصة للمستشفيات
    console.log('\n🔬 إضافة الفحوصات للمستشفيات...')
    let totalTests = 0
    for (const hospital of existingHospitals) {
      const hospitalTests = tests.slice(0, Math.floor(Math.random() * 10) + 8) // 8-17 فحص لكل مستشفى
      for (const test of hospitalTests) {
        await prisma.hospitalTest.create({
          data: {
            hospitalId: hospital.id,
            name: test.name,
            description: `وصف فحص ${test.name}`,
            category: test.category,
            duration: test.duration,
            cost: Math.floor(Math.random() * 50000) + 10000 // 10,000 - 60,000 دينار
          }
        })
        totalTests++
      }
      console.log(`✅ تم إضافة ${hospitalTests.length} فحص لمستشفى ${hospital.name} - ${hospital.city.name}`)
    }

    // 3. إنشاء العلاجات المخصصة للمستشفيات
    console.log('\n💊 إضافة العلاجات للمستشفيات...')
    let totalTreatments = 0
    for (const hospital of existingHospitals) {
      const hospitalTreatments = treatments.slice(0, Math.floor(Math.random() * 6) + 4) // 4-9 علاج لكل مستشفى
      for (const treatment of hospitalTreatments) {
        await prisma.hospitalTreatment.create({
          data: {
            hospitalId: hospital.id,
            name: treatment.name,
            description: `وصف علاج ${treatment.name}`,
            category: treatment.category,
            duration: treatment.duration
          }
        })
        totalTreatments++
      }
      console.log(`✅ تم إضافة ${hospitalTreatments.length} علاج لمستشفى ${hospital.name} - ${hospital.city.name}`)
    }

    // 4. إنشاء العمليات المخصصة للمستشفيات
    console.log('\n⚕️ إضافة العمليات للمستشفيات...')
    let totalOperations = 0
    for (const hospital of existingHospitals) {
      const hospitalOperations = operations.slice(0, Math.floor(Math.random() * 6) + 4) // 4-9 عملية لكل مستشفى
      for (const operation of hospitalOperations) {
        await prisma.hospitalOperation.create({
          data: {
            hospitalId: hospital.id,
            name: operation.name,
            description: `وصف عملية ${operation.name}`,
            category: operation.category,
            duration: operation.duration,
            cost: Math.floor(Math.random() * 200000) + 50000 // 50,000 - 250,000 دينار
          }
        })
        totalOperations++
      }
      console.log(`✅ تم إضافة ${hospitalOperations.length} عملية لمستشفى ${hospital.name} - ${hospital.city.name}`)
    }

    console.log('\n🎉 تم إضافة جميع البيانات الطبية بنجاح!')
    console.log(`📊 الإحصائيات النهائية:`)
    console.log(`- إجمالي المستشفيات: ${existingHospitals.length}`)
    console.log(`- إجمالي الأمراض: ${totalDiseases}`)
    console.log(`- إجمالي الفحوصات: ${totalTests}`)
    console.log(`- إجمالي العلاجات: ${totalTreatments}`)
    console.log(`- إجمالي العمليات: ${totalOperations}`)

  } catch (error) {
    console.error('❌ خطأ في إنشاء البيانات:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
seedIraqiData()
