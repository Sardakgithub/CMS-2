import { Controller, Get, UseGuards } from '@nestjs/common'
import { FirebaseAuthGuard } from './auth/firebase-auth.guard'
import { User } from './auth/user.decorator'

@Controller('health')
export class HealthController {
  @Get()
  get() {
    return { ok: true }
  }

  @Get('secure')
  @UseGuards(FirebaseAuthGuard)
  getSecure(@User() user: any) {
    return { ok: true, user }
  }
}
