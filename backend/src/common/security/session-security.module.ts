import { Global, Module } from '@nestjs/common';
import { SessionSecurityService } from './session-security.service';

@Global()
@Module({
  providers: [SessionSecurityService],
  exports: [SessionSecurityService],
})
export class SessionSecurityModule {}
