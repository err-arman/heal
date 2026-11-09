'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { createResearch, uploadResearchFile } from '@/lib/api/client';
import type {
  AttachmentCategory,
  CreateResearchPayload,
  ReferenceOptions,
} from '@/lib/api/types';
import { ATTACHMENT_CATEGORIES } from '@/lib/api/types';
import { validateFile } from '@/lib/uploads/file-rules';
import { formatFileSize } from '@/lib/utils/format';
import { Alert } from './ui/alert';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Field,
  FieldError,
  FieldHint,
  Input,
  Select,
  Textarea,
} from './ui/form';

type FormValues = {
  organization: string;
  researchYear: string;
  studyTypeId: string;
  fundingSourceId: string;
  studyLocationId: string;
  domainIds: string[];
  en: {
    title: string;
    abstract: string;
    description: string;
    keywords: string;
  };
  bn: {
    title: string;
    abstract: string;
    description: string;
    keywords: string;
  };
  authors: { name: string; affiliation: string; email: string }[];
  attachments: { category: AttachmentCategory }[];
};

export function SubmissionForm({
  options,
  locale,
}: {
  options: ReferenceOptions;
  locale: string;
}) {
  const t = useTranslations('Submission');
  const validation = useTranslations('Validation');
  const uploadT = useTranslations('Upload');
  const [primaryFile, setPrimaryFile] = useState<File | null>(null);
  const [attachmentFiles, setAttachmentFiles] = useState<(File | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      organization: '',
      researchYear: String(new Date().getFullYear()),
      studyTypeId: '',
      fundingSourceId: '',
      studyLocationId: '',
      domainIds: [],
      en: { title: '', abstract: '', description: '', keywords: '' },
      bn: { title: '', abstract: '', description: '', keywords: '' },
      authors: [{ name: '', affiliation: '', email: '' }],
      attachments: [],
    },
  });
  const authors = useFieldArray({ control, name: 'authors' });
  const attachments = useFieldArray({ control, name: 'attachments' });
  const optionName = (x: { nameEn: string; nameBn: string }) =>
    locale === 'bn' ? x.nameBn : x.nameEn;
  function choosePrimary(file: File | null) {
    setPrimaryFile(file);
  }
  function chooseAttachment(index: number, file: File | null) {
    setAttachmentFiles((previous) => {
      const next = [...previous];
      next[index] = file;
      return next;
    });
  }
  function addAttachment() {
    attachments.append({ category: 'document' });
    setAttachmentFiles((previous) => [...previous, null]);
  }
  function removeAttachment(index: number) {
    attachments.remove(index);
    setAttachmentFiles((previous) => previous.filter((_, i) => i !== index));
  }
  async function onSubmit(values: FormValues) {
    setServerError(null);
    setProgress(null);
    if (!primaryFile) {
      setError('root', { message: validation('primaryReportRequired') });
      return;
    }
    const primaryProblem = validateFile(primaryFile, 'primary_report');
    if (primaryProblem) {
      setError('root', {
        message: uploadT(
          primaryProblem === 'tooLarge'
            ? 'fileTooLarge'
            : primaryProblem === 'empty'
              ? 'emptyFile'
              : 'invalidExtension',
        ),
      });
      return;
    }
    for (let index = 0; index < values.attachments.length; index += 1) {
      const file = attachmentFiles[index];
      if (!file) {
        setError('root', { message: t('attachmentRequired') });
        return;
      }
      const problem = validateFile(file, values.attachments[index].category);
      if (problem) {
        setError('root', {
          message: uploadT(
            problem === 'tooLarge'
              ? 'fileTooLarge'
              : problem === 'empty'
                ? 'emptyFile'
                : 'invalidExtension',
          ),
        });
        return;
      }
    }
    try {
      setProgress(t('uploadStarting'));
      const primary = await uploadResearchFile({
        file: primaryFile,
        category: 'primary_report',
        onProgress: (percent) =>
          setProgress(t('uploadProgress', { name: primaryFile.name, percent })),
      });
      const uploadedAttachments: NonNullable<
        CreateResearchPayload['attachments']
      > = [];
      for (let index = 0; index < values.attachments.length; index += 1) {
        const file = attachmentFiles[index]!;
        const category = values.attachments[index].category;
        const upload = await uploadResearchFile({
          file,
          category,
          onProgress: (percent) =>
            setProgress(t('uploadProgress', { name: file.name, percent })),
        });
        uploadedAttachments.push({ uploadId: upload.uploadId, category });
      }
      setProgress(t('submitting'));
      const keywords = (value: string) =>
        value
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);
      const payload: CreateResearchPayload = {
        submittingOrganizationName: values.organization.trim(),
        researchYear: Number(values.researchYear),
        studyTypeId: values.studyTypeId,
        fundingSourceId: values.fundingSourceId,
        studyLocationId: values.studyLocationId,
        domainIds: values.domainIds,
        authors: values.authors.map((x) => ({
          name: x.name.trim(),
          affiliation: x.affiliation.trim() || undefined,
          email: x.email.trim() || undefined,
        })),
        translations: {
          en: {
            language: 'en',
            title: values.en.title.trim(),
            abstract: values.en.abstract.trim(),
            description: values.en.description.trim(),
            keywords: keywords(values.en.keywords),
          },
          bn: {
            language: 'bn',
            title: values.bn.title.trim(),
            abstract: values.bn.abstract.trim(),
            description: values.bn.description.trim(),
            keywords: keywords(values.bn.keywords),
          },
        },
        primaryReport: { uploadId: primary.uploadId },
        attachments: uploadedAttachments.length
          ? uploadedAttachments
          : undefined,
      };
      const result = await createResearch(payload);
      setSuccessId(result.id);
      setProgress(null);
    } catch {
      setProgress(null);
      setServerError(t('submitErrorBody'));
    }
  }
  if (successId)
    return (
      <Alert className="mt-8" variant="success" title={t('successTitle')}>
        <p>{t('successBody')}</p>
        <p className="mt-2 font-semibold">
          {t('successReference')}: {successId}
        </p>
        <p className="mt-1">{t('referenceOnly')}</p>
      </Alert>
    );
  const textFields = (language: 'en' | 'bn', title: string) => (
    <Card className="p-5">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-5 grid gap-5">
        <Field
          id={`${language}-title`}
          label={t('titleLabel')}
          required
          error={errors[language]?.title?.message}
        >
          <Input
            id={`${language}-title`}
            {...register(`${language}.title`, {
              required: validation('required'),
              minLength: { value: 2, message: validation('min', { min: 2 }) },
            })}
          />
        </Field>
        <Field
          id={`${language}-abstract`}
          label={t('abstractLabel')}
          required
          error={errors[language]?.abstract?.message}
        >
          <Textarea
            id={`${language}-abstract`}
            {...register(`${language}.abstract`, {
              required: validation('required'),
              minLength: { value: 10, message: validation('min', { min: 10 }) },
            })}
          />
        </Field>
        <Field
          id={`${language}-description`}
          label={t('descriptionLabel')}
          required
          error={errors[language]?.description?.message}
        >
          <Textarea
            id={`${language}-description`}
            {...register(`${language}.description`, {
              required: validation('required'),
              minLength: { value: 10, message: validation('min', { min: 10 }) },
            })}
          />
        </Field>
        <Field
          id={`${language}-keywords`}
          label={t('keywordsLabel')}
          hint={t('keywordsHint')}
          required
          error={errors[language]?.keywords?.message}
        >
          <Input
            id={`${language}-keywords`}
            {...register(`${language}.keywords`, {
              validate: (value) =>
                value.split(',').some((x) => x.trim()) ||
                validation('keywordsRequired'),
            })}
          />
        </Field>
      </div>
    </Card>
  );
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-8 space-y-6"
      noValidate
    >
      {errors.root?.message ? (
        <Alert variant="error" title={t('validationErrorTitle')}>
          {errors.root.message}
        </Alert>
      ) : null}
      {serverError ? (
        <Alert variant="error" title={t('submitErrorTitle')}>
          {serverError}
        </Alert>
      ) : null}
      {progress ? <Alert variant="info">{progress}</Alert> : null}
      <Card className="p-5">
        <h2 className="text-lg font-bold">{t('organizationSection')}</h2>
        <p className="mt-1 text-sm text-ink/65">
          {t('organizationSectionHint')}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            id="organization"
            label={t('organizationLabel')}
            required
            error={errors.organization?.message}
            className="md:col-span-2"
          >
            <Input
              id="organization"
              {...register('organization', {
                required: validation('required'),
                minLength: { value: 2, message: validation('min', { min: 2 }) },
              })}
            />
          </Field>
          <Field
            id="year"
            label={t('classificationSection')}
            required
            error={errors.researchYear?.message}
          >
            <Input
              id="year"
              type="number"
              {...register('researchYear', {
                required: validation('required'),
                min: {
                  value: 1900,
                  message: validation('yearRange', {
                    max: new Date().getFullYear() + 1,
                  }),
                },
                max: {
                  value: new Date().getFullYear() + 1,
                  message: validation('yearRange', {
                    max: new Date().getFullYear() + 1,
                  }),
                },
              })}
            />
          </Field>
          <ReferenceSelect
            id="study-type"
            label={t('studyTypeLabel')}
            values={options.studyTypes}
            register={register('studyTypeId', {
              required: validation('invalidSelection'),
            })}
            error={errors.studyTypeId?.message}
            name={optionName}
          />
          <ReferenceSelect
            id="funding"
            label={t('fundingSourceLabel')}
            values={options.fundingSources}
            register={register('fundingSourceId', {
              required: validation('invalidSelection'),
            })}
            error={errors.fundingSourceId?.message}
            name={optionName}
          />
          <ReferenceSelect
            id="location"
            label={t('locationLabel')}
            values={options.locations}
            register={register('studyLocationId', {
              required: validation('invalidSelection'),
            })}
            error={errors.studyLocationId?.message}
            name={optionName}
          />
        </div>
      </Card>
      {textFields('en', t('englishSection'))}
      {textFields('bn', t('banglaSection'))}
      <Card className="p-5">
        <h2 className="text-lg font-bold">{t('authorsSection')}</h2>
        <p className="mt-1 text-sm text-ink/65">{t('authorsHint')}</p>
        <div className="mt-5 space-y-4">
          {authors.fields.map((field, index) => (
            <div
              className="grid gap-3 rounded-lg border border-ink/10 p-4 md:grid-cols-4"
              key={field.id}
            >
              <Field
                id={`author-${index}`}
                label={t('authorName')}
                required
                error={errors.authors?.[index]?.name?.message}
              >
                <Input
                  id={`author-${index}`}
                  {...register(`authors.${index}.name`, {
                    required: validation('authorNameRequired'),
                    minLength: {
                      value: 2,
                      message: validation('min', { min: 2 }),
                    },
                  })}
                />
              </Field>
              <Field id={`affiliation-${index}`} label={t('authorAffiliation')}>
                <Input
                  id={`affiliation-${index}`}
                  {...register(`authors.${index}.affiliation`)}
                />
              </Field>
              <Field
                id={`email-${index}`}
                label={t('authorEmail')}
                error={errors.authors?.[index]?.email?.message}
              >
                <Input
                  id={`email-${index}`}
                  type="email"
                  {...register(`authors.${index}.email`, {
                    validate: (value) =>
                      !value ||
                      /^\S+@\S+\.\S+$/.test(value) ||
                      validation('email'),
                  })}
                />
              </Field>
              {authors.fields.length > 1 ? (
                <div className="flex items-end">
                  <Button variant="ghost" onClick={() => authors.remove(index)}>
                    {t('removeAuthor')}
                  </Button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <Button
          className="mt-4"
          variant="secondary"
          onClick={() =>
            authors.append({ name: '', affiliation: '', email: '' })
          }
        >
          {t('addAuthor')}
        </Button>
      </Card>
      <Card className="p-5">
        <h2 className="text-lg font-bold">{t('domainsSection')}</h2>
        <p className="mt-1 text-sm text-ink/65">{t('domainsHint')}</p>
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
          {options.domains.map((domain) => (
            <label
              key={domain.id}
              className="flex items-center gap-3 rounded-lg border border-ink/10 p-3 text-sm"
            >
              <input
                type="checkbox"
                value={domain.id}
                {...register('domainIds', {
                  validate: (value) =>
                    value.length > 0 || validation('domainsRequired'),
                })}
              />
              {optionName(domain)}
            </label>
          ))}
        </fieldset>
        <FieldError>{errors.domainIds?.message}</FieldError>
      </Card>
      <Card className="p-5">
        <h2 className="text-lg font-bold">{t('filesSection')}</h2>
        <Field
          id="primary"
          className="mt-5"
          label={t('primaryReport')}
          hint={t('primaryReportHint')}
          required
        >
          <Input
            id="primary"
            type="file"
            accept=".pdf,.doc,.docx,.odt,.rtf"
            onChange={(event) => choosePrimary(event.target.files?.[0] ?? null)}
          />
          {primaryFile ? (
            <FieldHint>
              {t('fileSelected', {
                name: `${primaryFile.name} (${formatFileSize(primaryFile.size, locale)})`,
              })}
            </FieldHint>
          ) : null}
        </Field>
        <div className="mt-6 border-t border-ink/10 pt-5">
          <h3 className="font-bold">{t('supportingFiles')}</h3>
          <p className="mt-1 text-sm text-ink/65">{t('supportingFilesHint')}</p>
          {attachments.fields.map((field, index) => (
            <div
              key={field.id}
              className="mt-4 grid gap-3 rounded-lg border border-ink/10 p-4 md:grid-cols-[12rem_1fr_auto]"
            >
              <Field id={`category-${index}`} label={t('attachmentCategory')}>
                <Select
                  id={`category-${index}`}
                  {...register(`attachments.${index}.category`)}
                >
                  {ATTACHMENT_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {uploadT(`categories.${category}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id={`attachment-${index}`} label={t('fileLabel')}>
                <Input
                  id={`attachment-${index}`}
                  type="file"
                  onChange={(event) =>
                    chooseAttachment(index, event.target.files?.[0] ?? null)
                  }
                />
                {attachmentFiles[index] ? (
                  <FieldHint>{attachmentFiles[index]?.name}</FieldHint>
                ) : null}
              </Field>
              <div className="flex items-end">
                <Button variant="ghost" onClick={() => removeAttachment(index)}>
                  {t('removeAttachment')}
                </Button>
              </div>
            </div>
          ))}
          <Button className="mt-4" variant="secondary" onClick={addAttachment}>
            {t('addAttachment')}
          </Button>
        </div>
      </Card>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('submitting') : t('submit')}
      </Button>
    </form>
  );
}
function ReferenceSelect({
  id,
  label,
  values,
  register,
  error,
  name,
}: {
  id: string;
  label: string;
  values: { id: string; nameEn: string; nameBn: string }[];
  register: ReturnType<typeof useForm<FormValues>>['register'] extends (
    name: infer N,
    ...args: never[]
  ) => infer R
    ? R
    : never;
  error?: string;
  name: (item: { nameEn: string; nameBn: string }) => string;
}) {
  return (
    <Field id={id} label={label} required error={error}>
      <Select id={id} {...register}>
        <option value="">—</option>
        {values.map((item) => (
          <option key={item.id} value={item.id}>
            {name(item)}
          </option>
        ))}
      </Select>
    </Field>
  );
}
