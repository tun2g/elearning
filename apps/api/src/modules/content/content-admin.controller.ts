import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { ImportResult } from '@elearning/contracts';
import { ImportBatchSchema } from '@elearning/contracts';
import { ZodError } from 'zod';

import { Public } from 'src/shared/decorators/public.decorator';
import { ApiKeyGuard } from 'src/shared/guards/api-key.guard';

import { ContentImportService } from './content-import.service';

@ApiTags('content-admin')
@ApiSecurity('x-api-key')
@Public()
@UseGuards(ApiKeyGuard)
@Controller('admin/content')
export class ContentAdminController {
  constructor(private readonly importService: ContentImportService) {}

  @Post('import')
  @ApiOperation({
    summary: 'Bulk-import reviewed crawler output (lessons + vocabulary)',
  })
  import(@Body() body: unknown): Promise<ImportResult> {
    const parsed = ImportBatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(formatZodError(parsed.error));
    }
    return this.importService.import(parsed.data);
  }
}

function formatZodError(error: ZodError): string[] {
  return error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
}
