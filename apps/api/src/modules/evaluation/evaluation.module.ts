import { Module } from '@nestjs/common';

import { AiModule } from 'src/shared/modules/ai/ai.module';

import { EvaluationService } from './evaluation.service';

@Module({
  imports: [AiModule],
  providers: [EvaluationService],
  exports: [EvaluationService],
})
export class EvaluationModule {}
