# نظام الصلاحيات المتقدم - Advanced Permissions System

## نظرة عامة

تم إنشاء نظام صلاحيات متقدم يسمح للإدمن بتحديد صلاحيات كل طبيب وموظف بشكل دقيق. النظام لا يخرب العمل الحالي بل يعززه ويضيف طبقة أمان إضافية.

## المميزات الرئيسية

### 1. نظام صلاحيات مرن
- **صلاحيات على مستوى المورد**: قراءة، كتابة، حذف، إدارة
- **صلاحيات محددة للمستشفى**: يمكن تحديد صلاحيات مختلفة لكل مستشفى
- **صلاحيات مؤقتة**: يمكن تحديد تاريخ انتهاء للصلاحيات
- **أدوار مخصصة**: إنشاء أدوار جديدة مع صلاحيات محددة

### 2. ميدلوير قوي
- **تحقق تلقائي**: في API routes
- **حماية الكومبوننتس**: في الواجهة الأمامية
- **تحقق متعدد المستويات**: دور + صلاحيات مباشرة + صلاحيات افتراضية

### 3. واجهة إدارة شاملة
- **إدارة الصلاحيات**: إنشاء وتعديل الصلاحيات
- **إدارة الأدوار**: إنشاء أدوار مخصصة
- **إدارة المستخدمين**: منح/منع صلاحيات للمستخدمين

## الهيكل

### قاعدة البيانات

```sql
-- جداول الصلاحيات الجديدة
Permission (الصلاحيات)
Role (الأدوار)
RolePermission (صلاحيات الأدوار)
UserPermission (صلاحيات المستخدمين)
```

### الملفات الرئيسية

```
src/lib/
├── permissions.ts              # نظام الصلاحيات الأساسي
├── permission-middleware.ts    # ميدلوير للتحقق من الصلاحيات
└── auth-middleware.ts          # ميدلوير المصادقة (محدث)

src/components/
├── admin/permissions-management.tsx  # واجهة إدارة الصلاحيات
├── ui/permission-guard.tsx          # كومبوننتات حماية الصلاحيات
└── patients/permissions-example.tsx  # مثال على الاستخدام

src/hooks/
└── use-permissions.ts          # Hooks للصلاحيات

src/app/api/
├── permissions/route.ts        # API للصلاحيات
├── roles/route.ts             # API للأدوار
└── user-permissions/route.ts  # API لصلاحيات المستخدمين
```

## كيفية الاستخدام

### 1. إعداد النظام

```bash
# تشغيل migration لقاعدة البيانات
npx prisma db push

# إنشاء الصلاحيات الأساسية
node scripts/setup-permissions.js
```

### 2. استخدام الميدلوير في API Routes

```typescript
import { withPermission } from '@/lib/permission-middleware'

// حماية API route
export const GET = withPermission({
  resource: 'PATIENTS',
  action: 'READ',
  hospitalId: (req) => req.headers.get('x-hospital-id')
})(async (request: NextRequest) => {
  // منطق API
})
```

### 3. استخدام Hooks في الكومبوننتس

```typescript
import { usePermissions } from '@/hooks/use-permissions'

function MyComponent() {
  const { hasPermission, loading, error } = usePermissions({
    resource: 'PATIENTS',
    action: 'WRITE',
    hospitalId: 'hospital-id'
  })

  if (loading) return <div>جاري التحميل...</div>
  if (error) return <div>خطأ: {error}</div>
  if (!hasPermission) return <div>ليس لديك صلاحية</div>

  return <div>محتوى محمي</div>
}
```

### 4. استخدام كومبوننتات الحماية

```typescript
import { PermissionGuard, PermissionButton } from '@/components/ui/permission-guard'

function PatientList() {
  return (
    <div>
      <PermissionButton
        resource="PATIENTS"
        action="WRITE"
        hospitalId="hospital-id"
        onClick={handleAddPatient}
        fallback={<div>ليس لديك صلاحية لإضافة مرضى</div>}
      >
        إضافة مريض
      </PermissionButton>

      <PermissionGuard
        resource="PATIENTS"
        action="READ"
        hospitalId="hospital-id"
        fallback={<div>ليس لديك صلاحية لعرض المرضى</div>}
      >
        <PatientListContent />
      </PermissionGuard>
    </div>
  )
}
```

## أنواع الصلاحيات

### الموارد (Resources)
- `PATIENTS` - المرضى
- `VISITS` - الزيارات
- `TESTS` - الفحوصات
- `TREATMENTS` - العلاجات
- `OPERATIONS` - العمليات
- `MEDICATIONS` - الأدوية
- `PRESCRIPTIONS` - الوصفات
- `REPORTS` - التقارير
- `SETTINGS` - الإعدادات
- `USERS` - المستخدمين
- `HOSPITALS` - المستشفيات
- `CITIES` - المدن

### الإجراءات (Actions)
- `READ` - قراءة
- `WRITE` - كتابة/تعديل
- `DELETE` - حذف
- `MANAGE` - إدارة شاملة

## الأدوار الافتراضية

### 1. مدير النظام
- جميع الصلاحيات
- لا يمكن حذفه
- يمكن إدارة جميع المستخدمين

### 2. طبيب أخصائي
- قراءة وكتابة المرضى
- إدارة الزيارات والفحوصات
- إدارة العلاجات والعمليات
- قراءة التقارير

### 3. طبيب عام
- صلاحيات أساسية للمرضى
- إدارة الزيارات والفحوصات
- إدارة العلاجات والأدوية

### 4. موظف استقبال
- قراءة وكتابة المرضى
- إدارة الزيارات

### 5. موظف مختبر
- قراءة المرضى
- إدارة الفحوصات

## إدارة الصلاحيات

### 1. واجهة الإدمن
```
/admin/permissions
```

### 2. إنشاء صلاحية جديدة
```typescript
await permissionManager.createPermission({
  name: 'قراءة المرضى',
  description: 'عرض قائمة المرضى وتفاصيلهم',
  resource: 'PATIENTS',
  action: 'READ'
})
```

### 3. إنشاء دور جديد
```typescript
await permissionManager.createRole({
  name: 'طبيب أخصائي',
  description: 'طبيب أخصائي مع صلاحيات محدودة',
  permissions: ['permission-id-1', 'permission-id-2']
})
```

### 4. منح صلاحية لمستخدم
```typescript
await permissionManager.grantUserPermission({
  userId: 'user-id',
  permissionId: 'permission-id',
  hospitalId: 'hospital-id', // اختياري
  expiresAt: new Date('2024-12-31'), // اختياري
  grantedBy: 'admin-id',
  reason: 'مهمة خاصة'
})
```

## التكامل مع النظام الحالي

### 1. لا يؤثر على النظام الحالي
- جميع الوظائف الموجودة تعمل كما هي
- الصلاحيات الافتراضية تحافظ على الوظائف الحالية

### 2. تحسينات تدريجية
- يمكن تطبيق الصلاحيات تدريجياً
- يمكن إضافة حماية جديدة دون كسر الكود الموجود

### 3. مرونة كاملة
- يمكن تخصيص الصلاحيات حسب الحاجة
- يمكن إضافة صلاحيات جديدة بسهولة

## الأمان

### 1. التحقق على مستوى الخادم
- جميع API routes محمية
- لا يمكن تجاوز الحماية من الواجهة الأمامية

### 2. التحقق على مستوى العميل
- واجهة مستخدم متجاوبة
- إخفاء العناصر غير المسموحة

### 3. تسجيل العمليات
- تسجيل جميع منح/منع الصلاحيات
- تتبع من قام بالعملية ومتى

## الاختبار

### 1. اختبار الصلاحيات
```typescript
// اختبار صلاحية معينة
const hasPermission = await hasPermission({
  userId: 'user-id',
  resource: 'PATIENTS',
  action: 'READ',
  hospitalId: 'hospital-id'
})
```

### 2. اختبار الميدلوير
```typescript
// اختبار API route محمي
const response = await fetch('/api/patients', {
  headers: {
    'x-user-id': 'user-id',
    'x-hospital-id': 'hospital-id'
  }
})
```

## الدعم والمساعدة

### 1. المشاكل الشائعة
- **صلاحية مرفوضة**: تحقق من الدور والصلاحيات المباشرة
- **خطأ في التحميل**: تحقق من اتصال قاعدة البيانات
- **صلاحية لا تعمل**: تحقق من hospitalId

### 2. التطوير
- استخدم `process.env.NODE_ENV === 'development'` لعرض معلومات الصلاحيات
- استخدم console.log لتتبع مشاكل الصلاحيات

### 3. المراجعة
- راجع الصلاحيات بانتظام
- احذف الصلاحيات المنتهية الصلاحية
- راقب استخدام الصلاحيات

## الخلاصة

نظام الصلاحيات الجديد يوفر:
- **مرونة كاملة** في تحديد الصلاحيات
- **أمان متقدم** على جميع المستويات
- **سهولة الاستخدام** للمطورين
- **واجهة إدارة شاملة** للإدمن
- **تكامل سلس** مع النظام الحالي

هذا النظام لن يخرب العمل الحالي بل سيعززه ويضيف طبقة أمان إضافية تسمح للإدمن بالتحكم الكامل في ما يمكن لكل مستخدم فعله.
