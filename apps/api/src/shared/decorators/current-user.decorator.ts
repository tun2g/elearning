import { createParamDecorator } from '@nestjs/common';

import { HttpRequestContextService } from 'src/shared/modules/http-request-context/http-request-context.service';
import type { RequestUser } from 'src/shared/modules/http-request-context/interfaces/request-user.interface';

export const CurrentUser = createParamDecorator((): RequestUser | undefined => {
  return HttpRequestContextService.getCurrentUser();
});
