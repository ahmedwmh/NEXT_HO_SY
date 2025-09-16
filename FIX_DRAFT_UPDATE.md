# إصلاح مشكلة الحفظ المؤقت - تحديث بدلاً من إنشاء جديد

## المشكلة
كان الحفظ المؤقت يقوم بإنشاء زيارة جديدة في كل مرة بدلاً من تحديث الزيارة الموجودة.

## الحلول المطبقة

### 1. تحديث API الزيارات (`/api/visits/route.ts`)
- ✅ **دعم التحديث**: إضافة منطق للتحقق من وجود `data.id`
- ✅ **إنشاء أو تحديث**: إذا كان هناك ID، يتم التحديث، وإلا يتم الإنشاء
- ✅ **تسجيل مفصل**: تسجيل ما إذا كان إنشاء أو تحديث

```typescript
// Check if this is an update (has ID) or create new
if (data.id) {
  console.log('🔄 Visits API: Updating existing visit:', data.id)
  visit = await prisma.visit.update({
    where: { id: data.id },
    data: visitData,
    // ... include relations
  })
} else {
  console.log('🆕 Visits API: Creating new visit with data:', visitData)
  visit = await prisma.visit.create({
    data: visitData,
    // ... include relations
  })
}
```

### 2. إضافة تتبع ID الزيارة الحالية
- ✅ **State جديد**: `currentVisitId` لتتبع ID الزيارة الحالية
- ✅ **حفظ ID**: عند تحميل مسودة موجودة من API
- ✅ **استخدام ID**: في `saveDraftToAPI` و `handleSubmit`

### 3. تحديث `loadDraftData`
- ✅ **حفظ ID**: `setCurrentVisitId(latestDraft.id)` عند تحميل من API
- ✅ **تسجيل مفصل**: تسجيل ID الزيارة المحملة

### 4. تحديث `saveDraftToAPI`
- ✅ **إرسال ID**: إضافة `visitData.id = currentVisitId` إذا كان موجود
- ✅ **تسجيل مفصل**: تسجيل ما إذا كان تحديث أو إنشاء
- ✅ **حفظ ID الجديد**: إذا كان إنشاء جديد

### 5. تحديث `handleSubmit`
- ✅ **إرسال ID**: إضافة `visitData.id = currentVisitId` إذا كان موجود
- ✅ **تسجيل مفصل**: تسجيل ما إذا كان تحديث أو إنشاء
- ✅ **حفظ ID الجديد**: إذا كان إنشاء جديد

### 6. تحديث `resetForm`
- ✅ **مسح ID**: `setCurrentVisitId(null)` عند إعادة تعيين الفورم

## النتيجة

### قبل الإصلاح:
1. ❌ **الحفظ المؤقت**: ينشئ زيارة جديدة في كل مرة
2. ❌ **تعدد الزيارات**: عدة زيارات مسودة لنفس المريض
3. ❌ **فقدان البيانات**: البيانات السابقة لا تُحدث

### بعد الإصلاح:
1. ✅ **الحفظ المؤقت**: يحدث الزيارة الموجودة
2. ✅ **زيارة واحدة**: مسودة واحدة فقط لكل مريض
3. ✅ **حفظ البيانات**: البيانات تُحدث بشكل صحيح

## كيفية الاختبار

1. **إنشاء زيارة جديدة**:
   - افتح الفورم
   - املأ الخطوة الأولى
   - احفظ مؤقتاً → يجب إنشاء زيارة جديدة

2. **تحديث الزيارة الموجودة**:
   - افتح الفورم مرة أخرى
   - املأ الخطوة الثانية
   - احفظ مؤقتاً → يجب تحديث الزيارة الموجودة

3. **التحقق من Console**:
   - `🆕 Creating new visit` (للمرة الأولى)
   - `🔄 Updating existing visit: [ID]` (للمرات التالية)

## رسائل Console المتوقعة

```
🔄 Form opened, loading draft data for patient: [ID]
📂 Loading draft from API: [visit data]
📂 Current visit ID set to: [visit ID]
💾 Saving draft to API for step: 2
🔄 Updating existing visit: [visit ID]
✅ Visit updated successfully: [visit data]
```
