import { CanActivate, Injectable , ExecutionContext, UnauthorizedException} from "@nestjs/common";

//Guard for refresh token authentication, checks for the presence of a refresh token and user ID in the cookies. If both are present, it attaches them to the request object. If either is missing, it throws an UnauthorizedException.
@Injectable()
export class RefreshGuard implements CanActivate
{
	canActivate(context: ExecutionContext,): boolean | Promise<boolean>
	{
		const req = context.switchToHttp().getRequest();
		const token = req.cookies['refreshToken'];
		if (!token)
			throw new UnauthorizedException("No User");
		req.refreshToken = token;
		const userId = req.cookies['UserId'];
		if (!userId)
			throw new UnauthorizedException("No User");
			req.userId = Number(userId);
		return true;
	}
	
}