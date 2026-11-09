import type { FileCategory } from '@/lib/api/types';

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const ALLOWED_EXTENSIONS: Record<FileCategory, readonly string[]> = {
  primary_report: ['.pdf', '.doc', '.docx', '.odt', '.rtf'],
  document: ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt', '.md'],
  spreadsheet: ['.xls', '.xlsx', '.ods', '.csv'],
  database: ['.mdb', '.accdb', '.sqlite', '.sqlite3', '.db', '.sql'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tif', '.tiff', '.bmp'],
  audio: ['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac'],
  video: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'],
  other: [],
};

export type FileValidationError = 'empty' | 'tooLarge' | 'invalidExtension';

export function fileExtension(filename: string): string {
  const index = filename.lastIndexOf('.');
  return index === -1 ? '' : filename.slice(index).toLowerCase();
}

export function validateFile(
  file: File,
  category: FileCategory,
): FileValidationError | null {
  if (file.size < 1) {
    return 'empty';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'tooLarge';
  }

  const allowed = ALLOWED_EXTENSIONS[category];

  if (allowed.length > 0 && !allowed.includes(fileExtension(file.name))) {
    return 'invalidExtension';
  }

  return null;
}
