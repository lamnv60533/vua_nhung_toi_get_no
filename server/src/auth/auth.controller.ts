import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import UserAuth from './models/user';
import { Response } from 'express';

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
  getLoginCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    return this.authService.handleLoginCallback(state, code, res);
  }
}
