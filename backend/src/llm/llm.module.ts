// src/llm/llm.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { LlmController } from './llm.controller';
import { LlmService } from './llm.service';
import { OpenRouterLlmRepository } from './repository/openrouter-llm.repository';
import { TaskModule } from '../task/task.module';

@Module({
  imports: [forwardRef(() => TaskModule)],
  controllers: [LlmController],
  providers: [
    LlmService,
    OpenRouterLlmRepository,
    { provide: 'LlmRepository', useClass: OpenRouterLlmRepository },
  ],
  exports: [LlmService],
})
export class LlmModule {}