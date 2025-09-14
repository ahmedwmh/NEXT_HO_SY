// Storage configuration
export const STORAGE_CONFIG = {
  BUCKET_NAME: 'hospital',
  PATIENT_PHOTOS_FOLDER: 'patient-photos',
  MEDICAL_ATTACHMENTS_FOLDER: 'medical-attachments',
  REPORTS_FOLDER: 'medical-attachments/reports',
  SCANS_FOLDER: 'medical-attachments/scans',
  IMAGES_FOLDER: 'medical-attachments/images',
  DOCUMENTS_FOLDER: 'medical-attachments/documents',
} as const

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_IMAGE_SIZE_MB: 5,
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ],
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  ALLOWED_MEDICAL_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/dicom',
    'image/dicom',
  ],
} as const

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api',
  TIMEOUT: 30000, // 30 seconds
} as const

// Database configuration
export const DB_CONFIG = {
  CONNECTION_POOL_SIZE: 10,
  QUERY_TIMEOUT: 30000, // 30 seconds
} as const
