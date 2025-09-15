-- Insert sample data for hospital management system

-- Insert cities
INSERT INTO cities (id, name, "createdAt", "updatedAt") VALUES 
('city-1', 'بغداد', NOW(), NOW()),
('city-2', 'البصرة', NOW(), NOW()),
('city-3', 'الموصل', NOW(), NOW()),
('city-4', 'أربيل', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert hospitals
INSERT INTO hospitals (id, name, address, phone, email, "cityId", "createdAt", "updatedAt") VALUES 
('hospital-1', 'مستشفى بغداد التعليمي', 'شارع الرشيد، بغداد، العراق', '+964-1-234-5678', 'info@baghdadhospital.edu.iq', 'city-1', NOW(), NOW()),
('hospital-2', 'مستشفى البصرة العام', 'شارع الكورنيش، البصرة، العراق', '+964-40-123-4567', 'info@basrahhospital.gov.iq', 'city-2', NOW(), NOW()),
('hospital-3', 'مستشفى أربيل الطبي', 'شارع 60 متر، أربيل، كردستان العراق', '+964-66-123-4567', 'info@erbilmedical.com', 'city-4', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert users
INSERT INTO users (id, email, password, role, "createdAt", "updatedAt") VALUES 
('admin-user', 'admin@hospital.com', 'admin123', 'ADMIN', NOW(), NOW()),
('doctor-user', 'doctor@hospital.com', 'doctor123', 'DOCTOR', NOW(), NOW()),
('staff-user', 'staff@hospital.com', 'staff123', 'STAFF', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert doctor profile
INSERT INTO doctors (id, "userId", "hospitalId", "firstName", "lastName", specialization, phone, "licenseNumber", "createdAt", "updatedAt") VALUES 
('doctor-1', 'doctor-user', 'hospital-1', 'د. أحمد', 'المحمود', 'أمراض القلب', '+964-770-123-4567', 'MD-123456', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert staff profile
INSERT INTO staff (id, "userId", "hospitalId", "firstName", "lastName", position, phone, "createdAt", "updatedAt") VALUES 
('staff-1', 'staff-user', 'hospital-1', 'فاطمة', 'الحسن', 'ممرض', '+964-770-234-5678', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample patient
INSERT INTO patients (id, "cityId", "hospitalId", "patientNumber", "firstName", "lastName", "dateOfBirth", gender, phone, email, address, "emergencyContact", "bloodType", allergies, "medicalHistory", "isActive", "createdAt", "updatedAt") VALUES 
('patient-1', 'city-1', 'hospital-1', 'P001', 'محمد', 'الحسن', '1985-03-15', 'ذكر', '+964-770-123-4567', 'mohammed.hassan@email.com', 'شارع الرشيد، بغداد، العراق', '+964-770-123-4568', 'A+', 'البنسلين', 'لا يوجد تاريخ مرضي مهم', true, NOW(), NOW())
ON CONFLICT ("patientNumber") DO NOTHING;

-- Insert sample visit
INSERT INTO visits (id, "patientId", "doctorId", "hospitalId", "scheduledAt", status, notes, diagnosis, symptoms, "vitalSigns", temperature, "bloodPressure", "heartRate", weight, height, images, "createdAt", "updatedAt") VALUES 
('visit-1', 'patient-1', 'doctor-1', 'hospital-1', NOW(), 'COMPLETED', 'فحص دوري شامل', 'فحص طبيعي', 'لا توجد أعراض', 'ضغط الدم: 120/80، النبض: 72', '36.5°C', '120/80', '72', '75kg', '175cm', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample test
INSERT INTO tests (id, "patientId", "doctorId", "hospitalId", "visitId", name, description, "scheduledAt", status, results, notes, images, "createdAt", "updatedAt") VALUES 
('test-1', 'patient-1', 'doctor-1', 'hospital-1', 'visit-1', 'فحص الدم الشامل', 'تحليل شامل لمكونات الدم', NOW(), 'COMPLETED', 'نتائج طبيعية - جميع المؤشرات ضمن المعدل الطبيعي', 'تم إجراء الفحص بنجاح', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample disease
INSERT INTO diseases (id, "patientId", name, description, "diagnosedAt", severity, status, notes, "createdAt", "updatedAt") VALUES 
('disease-1', 'patient-1', 'ارتفاع ضغط الدم', 'تم تشخيص ارتفاع ضغط الدم بناءً على الفحوصات', NOW(), 'متوسط', 'نشط', 'يحتاج متابعة دورية', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample treatment
INSERT INTO treatments (id, "patientId", "doctorId", "hospitalId", "visitId", name, description, "scheduledAt", status, notes, images, "createdAt", "updatedAt") VALUES 
('treatment-1', 'patient-1', 'doctor-1', 'hospital-1', 'visit-1', 'العلاج الدوائي', 'تناول الأدوية الموصوفة لعلاج ارتفاع ضغط الدم', NOW(), 'COMPLETED', 'علاج ارتفاع ضغط الدم باستخدام الأدوية', '{}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample prescription
INSERT INTO prescriptions (id, "patientId", "doctorId", "hospitalId", "visitId", medication, dosage, frequency, duration, instructions, "startDate", "endDate", status, notes, "createdAt", "updatedAt") VALUES 
('prescription-1', 'patient-1', 'doctor-1', 'hospital-1', 'visit-1', 'أملوديبين', '5mg', 'مرة يومياً', '30 يوم', 'تناول مع الطعام', NOW(), NOW() + INTERVAL '30 days', 'ACTIVE', 'وصفة طبية من د. أحمد المحمود', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
