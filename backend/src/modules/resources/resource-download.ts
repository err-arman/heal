import { createReadStream } from 'node:fs';
import { StreamableFile } from '@nestjs/common';
import type { researchResources } from '../../database/schema/index.js';

export function toStreamableFile(
  resource: typeof researchResources.$inferSelect,
  absolutePath: string,
): StreamableFile {
  const disposition = `attachment; filename*=UTF-8''${encodeURIComponent(
    resource.originalFilename,
  )}`;

  return new StreamableFile(createReadStream(absolutePath), {
    type: resource.mimeType,
    disposition,
    length: resource.fileSize,
  });
}
