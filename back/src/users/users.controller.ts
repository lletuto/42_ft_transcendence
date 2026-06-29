import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { GuardJwt } from '../auth/guards/jwt.guards';

@Controller('users')
@UseGuards(GuardJwt)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('search')
  search(@Query('q') q: string, @Query('me') me: string) {
    const meId = Number.parseInt(me ?? '', 10);
    return this.usersService.searchByNickname(
      Number.isFinite(meId) ? meId : -1,
      q ?? '',
    );
  }

  // return user connecté actuellemtn
  @Get('me')
  // @UseGuards(GuardJwt)
  me(@Req() req: Request) {
    return this.usersService.findOne(req.user!.sub);
  }


  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // Le fichier est écrit dans back/uploads/avatars/, on fait juste son nom en DB.
  @Post(':id/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `user-${req.params.id}-${Date.now()}${ext}`);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo max
      fileFilter: (req, file, cb) => {
        cb(null, /^image\/(png|jpe?g|gif|webp)$/.test(file.mimetype));
      },
    }),
  )
  uploadAvatar(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: { filename: string },
  ) {
    if (!file) {
      throw new BadRequestException(
        'Avatar manquant ou format non supporté (png/jpg/gif/webp, 2 Mo max).',
      );
    }
    return this.usersService.setAvatar(id, file.filename);
  }

  // Liste les amis de :id
  @Get(':id/friends')
  getFriends(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getFriends(id);
  }

  // Ajoute :friendId comme ami de :id (insère les 2 sens en service)
  @Post(':id/friends/:friendId')
  addFriend(
    @Param('id', ParseIntPipe) id: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return this.usersService.addFriend(id, friendId);
  }

  // Retire :friendId des amis de :id
  @Delete(':id/friends/:friendId')
  removeFriend(
    @Param('id', ParseIntPipe) id: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    return this.usersService.removeFriend(id, friendId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
