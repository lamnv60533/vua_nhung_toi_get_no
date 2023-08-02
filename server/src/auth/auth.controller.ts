import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import UserAuth from './models/user';
import { Response } from 'express';
import { Public } from './decorators/public.decorator';

@Controller('oauth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Public()
  @Get('/login')
  getLogin(@Res() res: Response) {
    return this.authService.doLogin(res);
  }

  @Public()
  @Get('/test')
  test(@Res() res: Response) {
    return res.json({ message: 'test' });
  }

  @Public()
  @Post('/login')
  doLogin(@Body() user: UserAuth) {
    return this.authService.handleLoginTypePassword(user);
  }

  @Public()
  @Get('/login-callback')
  getLoginCallback(
    @Query('state') state: string,
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    return this.authService.handleLoginCallback(state, code, res);
  }

  @Public()
  @Post('/verify-token')
  verifyToken(@Body() token: any) {
    return this.authService.verifyToken(token);
  }
}
