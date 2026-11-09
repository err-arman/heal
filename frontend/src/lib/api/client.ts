import { ApiError, apiErrorFromPayload, apiErrorFromResponse } from './errors';
import type {
  AttachmentCategory,
  CreateResearchPayload,
  FileCategory,
  ResearchDetail,
  ReviewPayload,
  ReviewState,
  StoredUpload,
} from './types';

const API_PREFIX = '/api/backend';
const UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

export async function clientApiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
    });
  } catch (error) {
    throw new ApiError({
      message:
        error instanceof Error
          ? error.message
          : 'Could not reach the research service.',
      status: null,
      kind: 'network',
    });
  }

  if (!response.ok) {
    throw await apiErrorFromResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function uploadResearchFile({
  file,
  category,
  onProgress,
}: {
  file: File;
  category: FileCategory | AttachmentCategory;
  onProgress?: (percent: number) => void;
}): Promise<StoredUpload> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);

    const request = new XMLHttpRequest();
    request.open('POST', `${API_PREFIX}/resources/uploads`);
    request.responseType = 'json';
    request.timeout = UPLOAD_TIMEOUT_MS;
    request.setRequestHeader('Accept', 'application/json');

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      const body = request.response as unknown;

      if (request.status >= 200 && request.status < 300) {
        resolve(body as StoredUpload);
        return;
      }

      reject(apiErrorFromPayload(request.status, body));
    };

    request.onerror = () => {
      reject(
        new ApiError({
          message: 'The upload could not be completed.',
          status: null,
          kind: 'network',
        }),
      );
    };

    request.ontimeout = () => {
      reject(
        new ApiError({
          message: 'The upload timed out.',
          status: null,
          kind: 'network',
        }),
      );
    };

    request.onabort = () => {
      reject(
        new ApiError({
          message: 'The upload was cancelled.',
          status: null,
          kind: 'generic',
        }),
      );
    };

    request.send(form);
  });
}

export function createResearch(
  payload: CreateResearchPayload,
): Promise<ResearchDetail> {
  return clientApiFetch('/research', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function moveResearchToUnderReview(id: string): Promise<ReviewState> {
  return clientApiFetch(
    `/dashboard/research/${encodeURIComponent(id)}/under-review`,
    {
      method: 'POST',
    },
  );
}

export function createResearchReview(
  id: string,
  payload: ReviewPayload,
): Promise<ReviewState> {
  return clientApiFetch(
    `/dashboard/research/${encodeURIComponent(id)}/review`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );
}

export function publishResearch(id: string): Promise<ResearchDetail> {
  return clientApiFetch(
    `/dashboard/research/${encodeURIComponent(id)}/publish`,
    {
      method: 'POST',
    },
  );
}
