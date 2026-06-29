import { Controller, Post , Body, Res, UseGuards, Req } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express'
import { GuardJwt, GuardJwttemp } from './guards/jwt.guards';
import type { Request } from 'express'
import { uriDto } from './dto/uri.dto';

import { RefreshGuard } from './guards/refresh.guards';

@Controller('/auth')
export class AuthController
{
	constructor(private authService: AuthService){}
	@Post('/register')
	register(@Body() data : RegisterDto){
		return this.authService.register(data);
	}

	//Controller for login, logout, 2fa setup and verify, and refresh token. Pushing the access token and refresh token to the client as cookies.
	@Post('/login')
	async login(@Body() data : LoginDto, @Res({passthrough: true})res: Response)
	{
		const token = await this.authService.login(data);
		if (!token.twoFactorRequired)
		{
			res.cookie('jwt', token.accesToken, {httpOnly: true, secure : false, maxAge: 15 * 60 * 1000} );
			res.cookie('refreshToken', token.refreshToken, {httpOnly: true, secure : false, maxAge:  7 * 24 * 60 * 60 * 1000});
			res.cookie('UserId', token.userId, {httpOnly: true, secure : false} );
		}
		else{
			res.cookie('jwtTemp', token.jwtTemp, {httpOnly: true, secure : false, maxAge: 5 * 60 * 1000})
		}
		return {twoFactorRequired: token.twoFactorRequired ?? false};
	}
	//Controller for logout, clears the cookies for jwt, refreshToken, and UserId. Uses GuardJwt to ensure the user is authenticated before logging out.
	@UseGuards(GuardJwt)
	@Post('/logout')
	async logout(@Res({passthrough: true}) res:Response, @Req() req: Request)
	{
		await this.authService.logout(req.user);
		res.clearCookie('jwt');
		res.clearCookie('UserId');
		res.clearCookie('refreshToken');
	}

	//Controller for 2fa setup, uses GuardJwt to ensure the user is authenticated before setting up 2fa. Returns the QR code for the user to scan with their authenticator app.
	@UseGuards(GuardJwt)
	@Post('/2fa/setup')
	setup(@Req() req:Request)
	{	
		return this.authService.setup(req.user);
	}

	//Controller for 2fa verify, uses GuardJwttemp to ensure the user is authenticated with a temporary JWT before verifying 2fa. Returns the access token and refresh token as cookies.
	@UseGuards(GuardJwttemp)
	@Post('/2fa/verify')
	async verify(@Body() dataUri : uriDto, @Res({passthrough: true})res: Response, @Req() req:Request)
	{

		const token = await this.authService.verify(dataUri, req.user);
		res.cookie('jwt', token.jwt, {httpOnly: true, secure:false, maxAge: 15 * 60 * 1000});
		res.cookie('refreshToken', token.refreshToken, {httpOnly: true, secure : false, maxAge:  7 * 24 * 60 * 60 * 1000});
		res.cookie('UserId', req.user!.sub, {httpOnly: true, secure : false} );

		return ;	
	}
	//Controller for refresh token, uses RefreshGuard to ensure the user is authenticated with a valid refresh token before refreshing the access token. Returns the new access token and refresh token as cookies.
	@UseGuards(RefreshGuard)
	@Post('/refresh')
	async refreshVerify(@Req() req:Request, @Res({passthrough: true})res: Response)
	{
		const token = await this.authService.refreshVerify(req.refreshToken, req.userId);
		res.cookie('jwt', token.accesToken, {httpOnly: true, secure : false, maxAge: 15 * 60 * 1000} );
		res.cookie('refreshToken', token.refreshToken, {httpOnly: true, secure : false, maxAge:  7 * 24 * 60 * 60 * 1000});
		res.cookie('UserId', req.userId, {httpOnly: true, secure: false, maxAge: 7 * 24 * 60 * 60 * 1000});
		return ;
	}
}
