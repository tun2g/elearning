import { z } from 'zod';

export const PaginationMetaSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  total: z.number().int(),
  totalPages: z.number().int(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

export function paginated<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    pagination: PaginationMetaSchema,
  });
}

export const ApiErrorSchema = z.object({
  requestId: z.string().optional(),
  message: z.string(),
  details: z.array(z.object({ field: z.string(), issue: z.string() })).optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
