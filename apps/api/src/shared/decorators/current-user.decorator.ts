import { createParamDecorator } from '@nestjs/common';

import {
  HttpRequestContextService,
  type RequestUser,
} from 'src/shared/modules/http-request-context/http-request-context.service';

export const CurrentUser = createParamDecorator((): RequestUser | undefined => {
  return HttpRequestContextService.getCurrentUser();
});
