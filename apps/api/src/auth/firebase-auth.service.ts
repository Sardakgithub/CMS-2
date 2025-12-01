import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { App, cert, getApps, initializeApp } from 'firebase-admin/app'
import { DecodedIdToken, getAuth } from 'firebase-admin/auth'

@Injectable()
export class FirebaseAuthService {
  private app: App
  private isConfigured: boolean

  constructor(private readonly configService: ConfigService) {
    if (!getApps().length) {
      const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID')
      const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL')
      let privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')

      if (!projectId || !clientEmail || !privateKey) {
        // Firebase is not configured; warn but allow startup (will fail when guard is invoked)
        console.warn('⚠️  Firebase admin environment variables are not set. Auth will fail until credentials are provided.')
        this.isConfigured = false
        return
      }

      if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n')
      }

      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
      this.isConfigured = true
    }

    this.app = getApps()[0] || null
  }

  async verifyAuthorizationHeader(authorization?: string): Promise<DecodedIdToken> {
    if (!this.isConfigured || !this.app) {
      throw new UnauthorizedException('Firebase authentication is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.')
    }

    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header')
    }

    const [scheme, token] = authorization.split(' ')
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header format')
    }

    try {
      const auth = getAuth(this.app)
      const decoded = await auth.verifyIdToken(token, true)
      return decoded
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
