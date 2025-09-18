const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedMedicalData() {
  try {
    console.log('🏥 بدء إضافة البيانات الطبية...')

    // جلب جميع المستشفيات الموجودة
    const hospitals = await prisma.hospital.findMany({
      include: {
        city: true
      }
    })

    if (hospitals.length === 0) {
      console.log('❌ لا توجد مستشفيات في قاعدة البيانات. يرجى تشغيل سكريبت إنشاء المستشفيات أولاً.')
      return
    }

    console.log(`📊 تم العثور على ${hospitals.length} مستشفى`)

    // بيانات الأمراض
    const diseases = [
      {
        name: 'السكري',
        description: 'مرض مزمن يؤثر على قدرة الجسم على استخدام السكر',
        category: 'مزمن',
        severity: 'high'
      },
      {
        name: 'ارتفاع ضغط الدم',
        description: 'حالة طبية مزمنة ترتفع فيها قوة دفع الدم ضد جدران الشرايين',
        category: 'مزمن',
        severity: 'high'
      },
      {
        name: 'الربو',
        description: 'مرض التهابي مزمن في الشعب الهوائية',
        category: 'مزمن',
        severity: 'medium'
      },
      {
        name: 'الإنفلونزا',
        description: 'عدوى فيروسية تصيب الجهاز التنفسي',
        category: 'حاد',
        severity: 'low'
      },
      {
        name: 'التهاب المفاصل',
        description: 'التهاب يصيب المفاصل ويسبب الألم والتصلب',
        category: 'مزمن',
        severity: 'medium'
      },
      {
        name: 'السرطان',
        description: 'مرض يحدث بسبب نمو غير طبيعي للخلايا',
        category: 'مزمن',
        severity: 'critical'
      },
      {
        name: 'أمراض القلب',
        description: 'مجموعة من الأمراض التي تؤثر على القلب والأوعية الدموية',
        category: 'مزمن',
        severity: 'high'
      },
      {
        name: 'الاكتئاب',
        description: 'اضطراب مزاجي يسبب شعوراً مستمراً بالحزن',
        category: 'نفسي',
        severity: 'medium'
      }
    ]

    // بيانات العمليات
    const operations = [
      {
        name: 'جراحة القلب المفتوح',
        description: 'عملية جراحية لعلاج مشاكل القلب',
        category: 'قلبية',
        duration: '6-8 ساعات',
        cost: 5000000
      },
      {
        name: 'استئصال الزائدة الدودية',
        description: 'عملية جراحية لاستئصال الزائدة الدودية الملتهبة',
        category: 'باطنية',
        duration: '1-2 ساعة',
        cost: 500000
      },
      {
        name: 'جراحة العين بالليزر',
        description: 'عملية لتصحيح مشاكل الإبصار',
        category: 'عيون',
        duration: '30 دقيقة',
        cost: 2000000
      },
      {
        name: 'جراحة استبدال مفصل الورك',
        description: 'عملية لاستبدال مفصل الورك التالف',
        category: 'عظمية',
        duration: '3-4 ساعات',
        cost: 3000000
      },
      {
        name: 'جراحة المخ والأعصاب',
        description: 'عمليات جراحية معقدة على المخ والجهاز العصبي',
        category: 'عصبية',
        duration: '8-12 ساعة',
        cost: 8000000
      },
      {
        name: 'جراحة الأوعية الدموية',
        description: 'عمليات جراحية على الأوعية الدموية',
        category: 'وعائية',
        duration: '4-6 ساعات',
        cost: 4000000
      },
      {
        name: 'جراحة التجميل',
        description: 'عمليات جراحية لتحسين المظهر',
        category: 'تجميلية',
        duration: '2-4 ساعات',
        cost: 3000000
      },
      {
        name: 'جراحة الأذن والأنف والحنجرة',
        description: 'عمليات جراحية على الأذن والأنف والحنجرة',
        category: 'أنف وأذن وحنجرة',
        duration: '1-3 ساعات',
        cost: 1500000
      }
    ]

    // بيانات العلاجات
    const treatments = [
      {
        name: 'العلاج الطبيعي',
        description: 'علاج طبيعي لتحسين الحركة والقوة',
        category: 'فيزيائي',
        duration: '6-8 أسابيع'
      },
      {
        name: 'العلاج الكيميائي',
        description: 'علاج دوائي للسرطان',
        category: 'دوائي',
        duration: '3-6 أشهر'
      },
      {
        name: 'العلاج النفسي',
        description: 'علاج نفسي للمشاكل العقلية والعاطفية',
        category: 'نفسي',
        duration: '3-12 شهر'
      },
      {
        name: 'العلاج بالأكسجين',
        description: 'علاج بالأكسجين عالي الضغط',
        category: 'تنفسي',
        duration: '2-4 أسابيع'
      },
      {
        name: 'العلاج الإشعاعي',
        description: 'علاج بالأشعة للسرطان',
        category: 'إشعاعي',
        duration: '4-8 أسابيع'
      },
      {
        name: 'العلاج بالليزر',
        description: 'علاج بالليزر لمشاكل مختلفة',
        category: 'ليزر',
        duration: '2-6 أسابيع'
      },
      {
        name: 'العلاج المائي',
        description: 'علاج بالماء والتمارين المائية',
        category: 'فيزيائي',
        duration: '4-8 أسابيع'
      },
      {
        name: 'العلاج بالتدليك',
        description: 'علاج بالتدليك لتخفيف الألم',
        category: 'فيزيائي',
        duration: '2-4 أسابيع'
      }
    ]

    // بيانات الفحوصات
    const tests = [
      {
        name: 'فحص الدم الشامل',
        description: 'فحص شامل لمكونات الدم',
        category: 'مختبري',
        duration: '30 دقيقة',
        cost: 50000
      },
      {
        name: 'الأشعة السينية',
        description: 'فحص بالأشعة السينية للعظام',
        category: 'إشعاعي',
        duration: '15 دقيقة',
        cost: 30000
      },
      {
        name: 'التصوير بالرنين المغناطيسي',
        description: 'فحص بالرنين المغناطيسي للأنسجة الرخوة',
        category: 'إشعاعي',
        duration: '45 دقيقة',
        cost: 200000
      },
      {
        name: 'تخطيط القلب',
        description: 'فحص كهربائي للقلب',
        category: 'قلبي',
        duration: '10 دقائق',
        cost: 25000
      },
      {
        name: 'فحص السكر',
        description: 'فحص مستوى السكر في الدم',
        category: 'مختبري',
        duration: '5 دقائق',
        cost: 10000
      },
      {
        name: 'فحص ضغط الدم',
        description: 'فحص ضغط الدم',
        category: 'قلبي',
        duration: '5 دقائق',
        cost: 5000
      },
      {
        name: 'فحص العين',
        description: 'فحص شامل للعين',
        category: 'عيون',
        duration: '30 دقيقة',
        cost: 40000
      },
      {
        name: 'فحص الأذن',
        description: 'فحص السمع والأذن',
        category: 'أنف وأذن وحنجرة',
        duration: '20 دقيقة',
        cost: 30000
      }
    ]

    let totalDiseases = 0
    let totalOperations = 0
    let totalTreatments = 0
    let totalTests = 0

    // إضافة البيانات لكل مستشفى
    for (const hospital of hospitals) {
      console.log(`\n🏥 إضافة البيانات لمستشفى: ${hospital.name} - ${hospital.city.name}`)

      // إضافة الأمراض
      for (const disease of diseases) {
        await prisma.hospitalDisease.create({
          data: {
            hospitalId: hospital.id,
            name: disease.name,
            description: disease.description,
            category: disease.category,
            severity: disease.severity
          }
        })
        totalDiseases++
      }

      // إضافة العمليات
      for (const operation of operations) {
        await prisma.hospitalOperation.create({
          data: {
            hospitalId: hospital.id,
            name: operation.name,
            description: operation.description,
            category: operation.category,
            duration: operation.duration,
            cost: operation.cost
          }
        })
        totalOperations++
      }

      // إضافة العلاجات
      for (const treatment of treatments) {
        await prisma.hospitalTreatment.create({
          data: {
            hospitalId: hospital.id,
            name: treatment.name,
            description: treatment.description,
            category: treatment.category,
            duration: treatment.duration
          }
        })
        totalTreatments++
      }

      // إضافة الفحوصات
      for (const test of tests) {
        await prisma.hospitalTest.create({
          data: {
            hospitalId: hospital.id,
            name: test.name,
            description: test.description,
            category: test.category,
            duration: test.duration,
            cost: test.cost
          }
        })
        totalTests++
      }

      console.log(`✅ تم إضافة ${diseases.length} مرض، ${operations.length} عملية، ${treatments.length} علاج، ${tests.length} فحص`)
    }

    console.log('\n🎉 تم إضافة جميع البيانات الطبية بنجاح!')
    console.log(`📊 الإحصائيات النهائية:`)
    console.log(`- إجمالي الأمراض: ${totalDiseases}`)
    console.log(`- إجمالي العمليات: ${totalOperations}`)
    console.log(`- إجمالي العلاجات: ${totalTreatments}`)
    console.log(`- إجمالي الفحوصات: ${totalTests}`)
    console.log(`- إجمالي المستشفيات: ${hospitals.length}`)

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات الطبية:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
seedMedicalData()
