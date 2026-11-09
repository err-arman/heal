export const FILE_CATEGORIES = [
  'primary_report',
  'document',
  'spreadsheet',
  'database',
  'image',
  'audio',
  'video',
  'other',
] as const;

export type FileCategoryValue = (typeof FILE_CATEGORIES)[number];

export const ALLOWED_EXTENSIONS: Record<FileCategoryValue, string[]> = {
  primary_report: ['.pdf', '.doc', '.docx', '.odt', '.rtf'],
  document: ['.pdf', '.doc', '.docx', '.odt', '.rtf', '.txt', '.md'],
  spreadsheet: ['.xls', '.xlsx', '.ods', '.csv'],
  database: ['.mdb', '.accdb', '.sqlite', '.sqlite3', '.db', '.sql'],
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tif', '.tiff', '.bmp'],
  audio: ['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.aac', '.flac'],
  video: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'],
  other: [],
};

export const ATTACHMENT_CATEGORIES: Exclude<
  FileCategoryValue,
  'primary_report'
>[] = FILE_CATEGORIES.filter(
  (category): category is Exclude<FileCategoryValue, 'primary_report'> =>
    category !== 'primary_report',
);
