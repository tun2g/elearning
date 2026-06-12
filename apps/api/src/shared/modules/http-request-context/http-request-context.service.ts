import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestUser {
  id: string;
  email: string;
  sessionId: string;
}

export class HttpRequestContext {
  constructor(
    public requestId?: string,
    public user?: RequestUser
  ) {}
}

@Injectable()
export class HttpRequestContextService {
  private static asyncLocalStorage = new AsyncLocalStorage<HttpRequestContext>();

  runWithContext(next: () => void): void {
    HttpRequestContextService.asyncLocalStorage.run(new HttpRequestContext(), next);
  }

  setRequestId(id: string): void {
    const ctx = HttpRequestContextService.asyncLocalStorage.getStore();
    if (ctx) ctx.requestId = id;
  }

  getRequestId(): string | undefined {
    return HttpRequestContextService.asyncLocalStorage.getStore()?.requestId;
  }

  setUser(user: RequestUser): void {
    const ctx = HttpRequestContextService.asyncLocalStorage.getStore();
    if (ctx) ctx.user = user;
  }

  getUser(): RequestUser | undefined {
    return HttpRequestContextService.asyncLocalStorage.getStore()?.user;
  }

  static getCurrentUser(): RequestUser | undefined {
    return HttpRequestContextService.asyncLocalStorage.getStore()?.user;
  }
}
