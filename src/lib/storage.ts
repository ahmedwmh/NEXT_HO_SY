import { supabase, supabaseAdmin } from './supabase'
import { STORAGE_CONFIG, UPLOAD_LIMITS } from './config'

export interface UploadResult {
  url: string
  path: string
}

export async function uploadFile(
  file: File,
  bucket: string,
  path: string
): Promise<UploadResult> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function uploadPatientPhoto(
  file: File,
  patientId: string
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${patientId}-${Date.now()}.${fileExt}`
  const path = `${STORAGE_CONFIG.PATIENT_PHOTOS_FOLDER}/${fileName}`

  return uploadFile(file, STORAGE_CONFIG.BUCKET_NAME, path)
}

export async function uploadMedicalAttachment(
  file: File,
  patientId: string,
  type: 'report' | 'scan' | 'image' | 'document'
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${patientId}-${type}-${Date.now()}.${fileExt}`
  
  let folderPath: string
  switch (type) {
    case 'report':
      folderPath = STORAGE_CONFIG.REPORTS_FOLDER
      break
    case 'scan':
      folderPath = STORAGE_CONFIG.SCANS_FOLDER
      break
    case 'image':
      folderPath = STORAGE_CONFIG.IMAGES_FOLDER
      break
    case 'document':
      folderPath = STORAGE_CONFIG.DOCUMENTS_FOLDER
      break
    default:
      folderPath = STORAGE_CONFIG.MEDICAL_ATTACHMENTS_FOLDER
  }
  
  const path = `${folderPath}/${fileName}`
  return uploadFile(file, STORAGE_CONFIG.BUCKET_NAME, path)
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

export function getFileUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return data.publicUrl
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.indexOf(file.type) !== -1
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// Export constants from config for backward compatibility
export const ALLOWED_IMAGE_TYPES = UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES
export const ALLOWED_DOCUMENT_TYPES = UPLOAD_LIMITS.ALLOWED_DOCUMENT_TYPES
export const ALLOWED_MEDICAL_TYPES = UPLOAD_LIMITS.ALLOWED_MEDICAL_TYPES
export const MAX_FILE_SIZE_MB = UPLOAD_LIMITS.MAX_FILE_SIZE_MB
export const MAX_IMAGE_SIZE_MB = UPLOAD_LIMITS.MAX_IMAGE_SIZE_MB
