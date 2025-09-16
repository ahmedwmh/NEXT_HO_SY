# Debug Doctor Selection Issue

## المشكلة
عند اختيار طبيب في الخطوة الثانية، ثم العودة للفورم، الطبيب موجود في القائمة لكنه غير مختار.

## التحسينات المضافة

### 1. تسجيل مفصل في `loadDraftData`
- تسجيل البيانات المحملة من localStorage
- تسجيل doctorIds المحملة
- تسجيل البيانات المحملة من API

### 2. تسجيل مفصل في `toggleDoctor`
- تسجيل الطبيب المختار
- تسجيل doctorIds السابقة والجديدة

### 3. تسجيل مفصل في `saveDraftToLocalStorage`
- تسجيل البيانات المحفوظة
- تسجيل doctorIds المحفوظة

### 4. إصلاح `useEffect` للأطباء
- عدم إعادة تعيين doctorIds إلا عند تغيير المستشفى فعلياً
- التحقق من صحة الأطباء المختارين للمستشفى الحالي

### 5. تسجيل في عرض الأطباء
- تسجيل حالة كل طبيب (مختار أم لا)

## كيفية الاختبار

1. افتح الفورم
2. اذهب للخطوة الثانية
3. اختر مدينة ومستشفى
4. اختر طبيب
5. احفظ مؤقتاً
6. أغلق الفورم
7. افتح الفورم مرة أخرى
8. اذهب للخطوة الثانية
9. تحقق من أن الطبيب مختار

## التحقق من Console

ابحث عن هذه الرسائل في console:
- `🔄 Form opened, loading draft data for patient:`
- `📂 Loading draft from localStorage:`
- `📂 Doctor IDs from localStorage:`
- `💾 Saving draft to localStorage:`
- `💾 Doctor IDs being saved:`
- `👨‍⚕️ Doctor [Name] ([ID]): selected=[true/false]`
