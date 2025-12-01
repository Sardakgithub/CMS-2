import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Request } from 'express'
import { FirebaseAuthService } from './firebase-auth.service'

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>()
    const decoded = await this.firebaseAuthService.verifyAuthorizationHeader(
      request.headers.authorization,
    )

    ;(request as any).user = decoded

    return true
  }
}
