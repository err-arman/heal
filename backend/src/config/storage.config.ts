import { resolve } from 'node:path';
import './load-env.js';

const storageDir = resolve(process.env.STORAGE_DIR ?? './storage');
const maxFileSize = Number(process.env.MAX_FILE_SIZE ?? 100 * 1024 * 1024);

export const STORAGE_CONFIG = {
  dir: storageDir,
  tempDir: resolve(storageDir, 'tmp'),
  uploadsDir: resolve(storageDir, 'uploads'),
  maxFileSize: Number.isInteger(maxFileSize) && maxFileSize > 0
    ? maxFileSize
    : 100 * 1024 * 1024,
} as const;
