import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

//Guard for JWT authentication, checks for the presence of a JWT in the cookies and verifies it. If the token is valid, it attaches the user information to the request object. If the token is missing or invalid, it throws an UnauthorizedException. There are two guards, one for the regular JWT and one for the temporary JWT used during 2FA verification.
@Injectable()
export class GuardJwt implements CanActivate
{
    constructor(private jwtService: JwtService){}
    canActivate(context: ExecutionContext,): boolean | Promise<boolean>
    {
        const req = context.switchToHttp().getRequest();
        const token = req.cookies['jwt'];
        if(!token)
            throw new UnauthorizedException("No User");
        try{
            req.user = this.jwtService.verify(token);
        }
        catch{
            throw new UnauthorizedException("Wrong User");
        }
        return true;
    }
}
@Injectable()
export class GuardJwttemp implements CanActivate
{
    constructor(private jwtService: JwtService){}
    canActivate(context: ExecutionContext,): boolean | Promise<boolean>
    {
        const req = context.switchToHttp().getRequest();
        const token = req.cookies['jwtTemp'];
        if(!token)
            throw new UnauthorizedException("No User");
        try{
            req.user = this.jwtService.verify(token);
        }
        catch{
            throw new UnauthorizedException("Wrong User");
        }
        return true;
    }
}