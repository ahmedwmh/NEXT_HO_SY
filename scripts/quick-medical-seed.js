const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function quickSeedMedicalData() {
  try {
    console.log('🏥 بدء إضافة البيانات الطبية السريعة...')

    // جلب جميع المستشفيات الموجودة
    const hospitals = await prisma.hospital.findMany({
      include: {
        city: true
      }
    })

    if (hospitals.length === 0) {
      console.log('❌ لا توجد مستشفيات في قاعدة البيانات.')
      return
    }

    console.log(`📊 تم العثور على ${hospitals.length} مستشفى`)

    // بيانات مختصرة للاختبار
    const diseases = [
      { name: 'السكري', description: 'مرض مزمن يؤثر على قدرة الجسم على استخدام السكر', category: 'مزمن', severity: 'high' },
      { name: 'ارتفاع ضغط الدم', description: 'حالة طبية مزمنة ترتفع فيها قوة دفع الدم', category: 'مزمن', severity: 'high' },
      { name: 'الربو', description: 'مرض التهابي مزمن في الشعب الهوائية', category: 'مزمن', severity: 'medium' }
    ]

    const operations = [
      { name: 'جراحة القلب المفتوح', description: 'عملية جراحية لعلاج مشاكل القلب', category: 'قلبية', duration: '6-8 ساعات', cost: 5000000 },
      { name: 'استئصال الزائدة الدودية', description: 'عملية جراحية لاستئصال الزائدة الدودية', category: 'باطنية', duration: '1-2 ساعة', cost: 500000 },
      { name: 'جراحة العين بالليزر', description: 'عملية لتصحيح مشاكل الإبصار', category: 'عيون', duration: '30 دقيقة', cost: 2000000 }
    ]

    const treatments = [
      { name: 'العلاج الطبيعي', description: 'علاج طبيعي لتحسين الحركة والقوة', category: 'فيزيائي', duration: '6-8 أسابيع' },
      { name: 'العلاج الكيميائي', description: 'علاج دوائي للسرطان', category: 'دوائي', duration: '3-6 أشهر' },
      { name: 'العلاج النفسي', description: 'علاج نفسي للمشاكل العقلية', category: 'نفسي', duration: '3-12 شهر' }
    ]

    const tests = [
      { name: 'فحص الدم الشامل', description: 'فحص شامل لمكونات الدم', category: 'مختبري', duration: '30 دقيقة', cost: 50000 },
      { name: 'الأشعة السينية', description: 'فحص بالأشعة السينية للعظام', category: 'إشعاعي', duration: '15 دقيقة', cost: 30000 },
      { name: 'تخطيط القلب', description: 'فحص كهربائي للقلب', category: 'قلبي', duration: '10 دقائق', cost: 25000 }
    ]

    let totalDiseases = 0
    let totalOperations = 0
    let totalTreatments = 0
    let totalTests = 0

    // إضافة البيانات لكل مستشفى
    for (const hospital of hospitals) {
      console.log(`🏥 ${hospital.name} - ${hospital.city.name}`)

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
    }

    console.log('\n🎉 تم إضافة البيانات الطبية بنجاح!')
    console.log(`📊 الإحصائيات:`)
    console.log(`- إجمالي الأمراض: ${totalDiseases}`)
    console.log(`- إجمالي العمليات: ${totalOperations}`)
    console.log(`- إجمالي العلاجات: ${totalTreatments}`)
    console.log(`- إجمالي الفحوصات: ${totalTests}`)

  } catch (error) {
    console.error('❌ خطأ في إضافة البيانات الطبية:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// تشغيل السكريبت
quickSeedMedicalData()
