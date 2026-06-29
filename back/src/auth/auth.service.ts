import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/prisma/prisma.service';	
import { JwtService } from '@nestjs/jwt';
import { generateSecret,  verify ,generateURI} from "otplib";
import QRCode from "qrcode";
import { uriDto } from './dto/uri.dto';
import * as crypto from 'crypto';

@Injectable()
export class AuthService
{
	constructor(private prismaService : PrismaService, private jwtService : JwtService){}
	
	//Service for register, login, logout, 2fa setup and verify, and refresh token. Uses bcrypt to hash passwords and refresh tokens. Uses otplib to generate and verify 2fa tokens. Uses QRCode to generate QR codes for 2fa setup. Uses crypto to generate random strings for refresh tokens.
	async register(data : RegisterDto){
		const hash = await bcrypt.hash(data.password, 10);
		try{
			await this.prismaService.user.create({data: {email: data.email, password: hash, nickname: data.nickname, winMatch : 0, lostMatch : 0}});
		}
		catch {
			throw new ConflictException("Email/nickname already used");
		}
	}
	//Service for login, verifies the email/nickname and password provided by the user. If the credentials are valid, it generates a JWT and a refresh token for the user and returns them. If 2fa is enabled for the user, it returns a temporary JWT and a flag indicating that 2fa is required.
	async login(data : LoginDto): Promise <any>{
		const user = await this.prismaService.user.findFirst({
			where : {
				OR:[
					{email: data.email_nickname },
					{nickname: data.email_nickname},
				]}
		});
		if(!user)
			throw new NotFoundException("User not found");
		const password_comp = await bcrypt.compare(data.password, user.password);
		if (!password_comp)
			throw new UnauthorizedException("Wrong password");
		else
		{
			if (user.FAkey)
			{
				const payloadTemp = {sub:user.id};
				const jwtTemp = await this.jwtService.sign(payloadTemp);
				return { twoFactorRequired : true, jwtTemp};
			}
			const tokenCrypto = crypto.randomBytes(50).toString('hex');
			const hashCrypto =  await bcrypt.hash(tokenCrypto, 10);
			await this.prismaService.user.update({
				where: {id: user.id},
				data: {refreshToken: hashCrypto},
			});
			const payload = {sub: user.id, email: user.email};
			const token = await this.jwtService.sign(payload);
			return { accesToken: token, refreshToken: tokenCrypto, userId: user.id};
		}
	}	
	//Service for 2fa setup, generates a secret for the user and saves it in the database. Returns the QR code for the user to scan with their authenticator app.
	async setup(payload)
	{
		const secret = generateSecret();
		
		const user = await this.prismaService.user.findUnique({
			where: {
				id: payload.sub
			},
		});
		if(!user)
			throw new NotFoundException("User not found");
		await this.prismaService.user.update({
			where: {id: payload.sub},
			data: { FAkey: secret},
		});

		const uri = generateURI({
			issuer: "MyAPP",
			label: payload.email,
			secret,
		});

		const qrDataUrl = await QRCode.toDataURL(uri);
		return qrDataUrl;
	}

	 //Service for 2fa verify, verifies the 2fa token provided by the user. If the token is valid, it generates a JWT and a refresh token for the user and returns them.
	async verify(dataUri: uriDto, reqPayload)
	{
		
		const user = await this.prismaService.user.findFirst({
			where : {id: reqPayload.sub}
		});
		if(!user)
			throw new NotFoundException("User not found");
		if (!user.FAkey)
			throw new NotFoundException("FA not setup");
		const token = dataUri.token;
		const secret = user.FAkey;
		const result = await verify({secret, token});
		if (result.valid)
		{
			const tokenCrypto = crypto.randomBytes(50).toString('hex');
			const hashCrypto =  await bcrypt.hash(tokenCrypto, 10);
			await this.prismaService.user.update({
				where: {id: user.id},
				data: {refreshToken: hashCrypto},
			});
			const payload = {sub: user.id, email: user.email};
			const jwttoken = await this.jwtService.sign(payload);
			return ({jwt : jwttoken, refreshToken: tokenCrypto});
		}
		else
			throw new UnauthorizedException("Wrong user");
	}

	//Service for refresh token, verifies the refresh token provided by the user. If the token is valid, it generates a new JWT and a new refresh token for the user and returns them.
	async refreshVerify(refreshTokenstring, userId)
	{
		const user = await this.prismaService.user.findUnique({
			where: {id: userId}
		})
		if (!user)
			throw new NotFoundException("No user found");
		if (!user.refreshToken)
			throw new UnauthorizedException("No refresh token");
		const result = await bcrypt.compare(refreshTokenstring, user.refreshToken)
		if (!result)
			throw new UnauthorizedException("Wrong refresh token");
		const payload = { sub: user.id, email: user.email };
		const accesToken = await this.jwtService.sign(payload);
		
		const newRefreshToken = crypto.randomBytes(50).toString('hex');
		const hashCrypto = await bcrypt.hash(newRefreshToken, 10);
		await this.prismaService.user.update({
			where: { id:user.id },
			data: { refreshToken: hashCrypto},
		});
		return { accesToken, refreshToken: newRefreshToken };
	}

	//Service for logout, clears the cookies for jwt, refreshToken, and UserId. Uses GuardJwt to ensure the user is authenticated before logging out.
	async logout(userReq)
	{
		await this.prismaService.user.update({
			where: {id: userReq.sub},
			data: {refreshToken: null}
		})
	}
}