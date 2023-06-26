import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Response,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import UserAuth from './models/user';

@Controller('oauth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/login')
  getLogin(@Res() res: Response) {
    return this.authService.doLogin(res);
  }

  @Post('/login')
  doLogin(@Body() user: UserAuth) {
    return this.authService.handleLoginTypePassword(user);
  }

  @Get('/login-callback')
  getLoginCallback(@Query('state') state: string, @Query('code') code: string) {
    return this.authService.handleLoginCallback(state, code);
  }
}
