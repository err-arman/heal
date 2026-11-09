import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  promises as fs,
} from 'node:fs';
import { basename, extname, join, resolve, sep } from 'node:path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { STORAGE_CONFIG } from '../../config/storage.config.js';
import {
  ALLOWED_EXTENSIONS,
  type FileCategoryValue,
} from './resource.constants.js';

export interface UploadedFileData {
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
  filename: string;
}

export interface StoredUpload {
  uploadId: string;
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  category: FileCategoryValue;
  uploadedAt: string;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class StorageService {
  constructor() {
    mkdirSync(STORAGE_CONFIG.tempDir, { recursive: true });
    mkdirSync(STORAGE_CONFIG.uploadsDir, { recursive: true });
  }

  async saveUpload(
    file: UploadedFileData,
    category: FileCategoryValue,
  ): Promise<StoredUpload> {
    if (file.size < 1) {
      await this.removeQuietly(file.path);
      throw new BadRequestException('The uploaded file is empty.');
    }

    if (file.size > STORAGE_CONFIG.maxFileSize) {
      await this.removeQuietly(file.path);
      throw new PayloadTooLargeException(
        `The uploaded file exceeds the ${STORAGE_CONFIG.maxFileSize} byte limit.`,
      );
    }

    this.assertAllowedExtension(file.originalname, category);

    const uploadId = randomUUID();
    const storageKey = `uploads/${uploadId}`;
    const finalPath = this.resolveStoragePath(storageKey);
    const metadataPath = join(STORAGE_CONFIG.uploadsDir, `${uploadId}.json`);
    const checksum = await this.checksumFile(file.path);

    try {
      await this.moveFile(file.path, finalPath);

      const metadata: StoredUpload = {
        uploadId,
        storageKey,
        originalFilename: basename(file.originalname),
        mimeType: file.mimetype || 'application/octet-stream',
        fileSize: file.size,
        checksum,
        category,
        uploadedAt: new Date().toISOString(),
      };

      await fs.writeFile(metadataPath, JSON.stringify(metadata), 'utf8');
      return metadata;
    } catch (error) {
      await this.removeQuietly(file.path);
      await this.removeQuietly(finalPath);
      await this.removeQuietly(metadataPath);
      throw error;
    }
  }

  async getUpload(uploadId: string): Promise<StoredUpload> {
    this.assertUploadId(uploadId);

    const metadataPath = join(STORAGE_CONFIG.uploadsDir, `${uploadId}.json`);
    let raw: string;

    try {
      raw = await fs.readFile(metadataPath, 'utf8');
    } catch {
      throw new NotFoundException('Upload not found or already consumed.');
    }

    let metadata: StoredUpload;
    try {
      metadata = JSON.parse(raw) as StoredUpload;
    } catch {
      throw new NotFoundException('Upload metadata is invalid.');
    }

    if (!existsSync(this.resolveStoragePath(metadata.storageKey))) {
      throw new NotFoundException('Uploaded file is missing.');
    }

    return metadata;
  }

  async deleteUpload(uploadId: string): Promise<void> {
    if (!UUID_PATTERN.test(uploadId)) {
      return;
    }

    const metadataPath = join(STORAGE_CONFIG.uploadsDir, `${uploadId}.json`);
    let storageKey = `uploads/${uploadId}`;

    try {
      const raw = await fs.readFile(metadataPath, 'utf8');
      const metadata = JSON.parse(raw) as StoredUpload;
      storageKey = metadata.storageKey;
    } catch {
      // Metadata may already be gone; fall back to the default key.
    }

    await this.removeQuietly(metadataPath);
    await this.removeQuietly(this.resolveStoragePath(storageKey));
  }

  resolveStoragePath(storageKey: string): string {
    const absolute = resolve(STORAGE_CONFIG.dir, storageKey);
    if (absolute !== STORAGE_CONFIG.dir && !absolute.startsWith(`${STORAGE_CONFIG.dir}${sep}`)) {
      throw new BadRequestException('Invalid storage key.');
    }
    return absolute;
  }

  createReadStream(storageKey: string) {
    return createReadStream(this.resolveStoragePath(storageKey));
  }

  private assertUploadId(uploadId: string): void {
    if (!UUID_PATTERN.test(uploadId)) {
      throw new NotFoundException('Upload not found.');
    }
  }

  private assertAllowedExtension(
    originalFilename: string,
    category: FileCategoryValue,
  ): void {
    if (category === 'other') {
      return;
    }

    const extension = extname(originalFilename).toLowerCase();
    const allowed = ALLOWED_EXTENSIONS[category];

    if (!allowed.includes(extension)) {
      throw new BadRequestException(
        `File type "${extension || 'unknown'}" is not allowed for category "${category}". Allowed: ${allowed.join(', ')}.`,
      );
    }
  }

  private async checksumFile(path: string): Promise<string> {
    const hash = createHash('sha256');
    const stream = createReadStream(path);

    for await (const chunk of stream) {
      hash.update(chunk as Buffer);
    }

    return hash.digest('hex');
  }

  private async moveFile(source: string, destination: string): Promise<void> {
    try {
      await fs.rename(source, destination);
    } catch (error) {
      if (!isCrossDeviceError(error)) {
        throw error;
      }
      await fs.copyFile(source, destination);
      await this.removeQuietly(source);
    }
  }

  private async removeQuietly(path: string): Promise<void> {
    try {
      await fs.unlink(path);
    } catch {
      // Ignore missing files; cleanup must not mask the original error.
    }
  }
}

function isCrossDeviceError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'EXDEV'
  );
}
