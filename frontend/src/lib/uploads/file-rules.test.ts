import { describe, expect, it } from 'vitest';
import { fileExtension, MAX_FILE_SIZE, validateFile } from './file-rules';

function makeFile(name: string, size: number) {
  const file = new File([], name, { type: 'application/octet-stream' });
  Object.defineProperty(file, 'size', { value: size });
  return file;
}

describe('file rules', () => {
  it('reads lowercase extensions', () => {
    expect(fileExtension('Report.PDF')).toBe('.pdf');
    expect(fileExtension('README')).toBe('');
  });

  it('accepts allowed extensions and rejects others', () => {
    expect(validateFile(makeFile('report.pdf', 10), 'primary_report')).toBeNull();
    expect(validateFile(makeFile('report.exe', 10), 'primary_report')).toBe(
      'invalidExtension',
    );
  });

  it('rejects empty and oversized files', () => {
    expect(validateFile(makeFile('report.pdf', 0), 'primary_report')).toBe(
      'empty',
    );
    expect(
      validateFile(makeFile('report.pdf', MAX_FILE_SIZE + 1), 'primary_report'),
    ).toBe('tooLarge');
  });
});
