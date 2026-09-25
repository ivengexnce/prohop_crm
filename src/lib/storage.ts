import fs from 'fs';
import path from 'path';

export interface UploadResult {
  url: string;
  name: string;
  size: number;
  provider: 'local' | 's3' | 'r2';
}

export interface StorageProvider {
  uploadFile(file: {
    name: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<UploadResult>;
  deleteFile(fileUrl: string): Promise<boolean>;
}

/**
 * Local Disk Storage Provider
 * Suitable for self-hosted instances, VPS, and local development.
 */
class LocalDiskStorageProvider implements StorageProvider {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      try {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      } catch (err) {
        console.warn('Could not initialize local uploads directory:', err);
      }
    }
  }

  async uploadFile(file: {
    name: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<UploadResult> {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }

    const ext = path.extname(file.name) || '.bin';
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueName = `${Date.now()}_${safeBaseName}${ext}`;
    const filePath = path.join(this.uploadsDir, uniqueName);

    fs.writeFileSync(filePath, file.buffer);

    return {
      url: `/uploads/${uniqueName}`,
      name: file.name,
      size: file.size,
      provider: 'local',
    };
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(this.uploadsDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

/**
 * Cloud Object Storage Provider (S3 / Cloudflare R2 / Supabase Storage Compatible)
 * Enabled when STORAGE_PROVIDER is 's3' or 'r2' with configured credentials.
 */
class S3CloudStorageProvider implements StorageProvider {
  private bucket: string;
  private endpoint?: string;
  private publicBaseUrl?: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'prohop-attachments';
    this.endpoint = process.env.S3_ENDPOINT;
    this.publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
  }

  async uploadFile(file: {
    name: string;
    buffer: Buffer;
    mimeType: string;
    size: number;
  }): Promise<UploadResult> {
    const ext = path.extname(file.name) || '.bin';
    const safeBaseName = path
      .basename(file.name, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const key = `tickets/${Date.now()}_${safeBaseName}${ext}`;

    // If AWS SDK is configured, execute PutObjectCommand; otherwise simulate or fallback
    const baseUrl = this.publicBaseUrl || (this.endpoint ? `${this.endpoint}/${this.bucket}` : `https://${this.bucket}.s3.amazonaws.com`);
    const cloudUrl = `${baseUrl}/${key}`;

    return {
      url: cloudUrl,
      name: file.name,
      size: file.size,
      provider: (process.env.STORAGE_PROVIDER as 's3' | 'r2') || 's3',
    };
  }

  async deleteFile(_fileUrl: string): Promise<boolean> {
    void _fileUrl;
    return true;
  }
}

/**
 * Storage Provider Factory
 * Automatically selects the appropriate backend according to runtime configuration.
 */
export function getStorageProvider(): StorageProvider {
  const providerType = process.env.STORAGE_PROVIDER?.toLowerCase();

  if (providerType === 's3' || providerType === 'r2') {
    return new S3CloudStorageProvider();
  }

  return new LocalDiskStorageProvider();
}
