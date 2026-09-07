import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export interface UploadResult {
  success: boolean;
  url?: string;
  message?: string;
}

export interface StorageProvider {
  upload(file: File, prefix?: string): Promise<UploadResult>;
  delete(fileUrl: string): Promise<{ success: boolean; message?: string }>;
}

/**
 * Local filesystem storage provider (intended for development).
 */
export class LocalStorageProvider implements StorageProvider {
  async upload(file: File, prefix = 'media'): Promise<UploadResult> {
    try {
      // 1. Validations
      if (file.size > MAX_FILE_SIZE) {
        return { success: false, message: 'File size exceeds 5MB limit.' };
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return { success: false, message: 'Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.' };
      }

      // Prevent SVG or scripting files (disabled for security reasons)
      if (file.type.includes('svg') || file.name.endsWith('.svg')) {
        return { success: false, message: 'SVG uploads are disabled for security reasons (XSS protection).' };
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // On serverless environments (like Vercel) where filesystem is read-only, or if write fails, fallback to Base64 data URL
      const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
      if (isServerless) {
        const mime = file.type || 'image/jpeg';
        const base64 = buffer.toString('base64');
        return { success: true, url: `data:${mime};base64,${base64}` };
      }

      // 2. Generate unique name using hash to prevent path traversal and naming conflicts
      const fileExtension = path.extname(file.name) || `.${file.type.split('/')[1]}`;
      const hash = crypto.createHash('md5').update(buffer).digest('hex');
      const safeName = `${prefix}-${hash}${fileExtension}`;

      try {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, safeName);
        await fs.writeFile(filePath, buffer);

        return { success: true, url: `/uploads/${safeName}` };
      } catch (fsError: any) {
        // Safe fallback to Base64 data URL if filesystem write fails (EROFS, permission denied, etc.)
        const mime = file.type || 'image/jpeg';
        const base64 = buffer.toString('base64');
        return { success: true, url: `data:${mime};base64,${base64}` };
      }
    } catch (error: unknown) {
      return { success: false, message: `Upload failed: ${(error as Error).message}` };
    }
  }

  async delete(fileUrl: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Ensure path is relative and safe
      const relativePath = fileUrl.replace(/^\/uploads\//, '');
      const safePath = path.join(process.cwd(), 'public', 'uploads', path.basename(relativePath));
      
      await fs.unlink(safePath);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, message: `Failed to delete local file: ${(error as Error).message}` };
    }
  }
}

/**
 * Placeholder Cloud S3 storage provider.
 */
export class S3StorageProvider implements StorageProvider {
  async upload(_file: File, _prefix = 'media'): Promise<UploadResult> {
    // To be implemented in Phase 8 using aws-sdk / client-s3
    console.log('S3 Upload called (Stub)');
    return { success: false, message: 'S3 storage provider is not initialized.' };
  }

  async delete(_fileUrl: string): Promise<{ success: boolean; message?: string }> {
    console.log('S3 Delete called (Stub)');
    return { success: true };
  }
}

/**
 * Placeholder Cloudflare R2 storage provider.
 */
export class R2StorageProvider implements StorageProvider {
  async upload(_file: File, _prefix = 'media'): Promise<UploadResult> {
    console.log('R2 Upload called (Stub)');
    return { success: false, message: 'R2 storage provider is not initialized.' };
  }

  async delete(_fileUrl: string): Promise<{ success: boolean; message?: string }> {
    console.log('R2 Delete called (Stub)');
    return { success: true };
  }
}

// Select active provider based on environment config
const providerType = process.env.STORAGE_PROVIDER || 'local';
export const storage: StorageProvider = 
  providerType === 's3' 
    ? new S3StorageProvider() 
    : providerType === 'r2' 
      ? new R2StorageProvider() 
      : new LocalStorageProvider();
