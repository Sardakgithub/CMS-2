import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';

@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @Get()
    async getAllRooms() {
        return this.roomsService.getAllRooms();
    }

    @Get(':id')
    async getRoomById(@Param('id') id: string) {
        return this.roomsService.getRoomById(id);
    }

    @Post()
    @UseGuards(FirebaseAuthGuard)
    async createRoom(@Body() body: { name: string; type: string }) {
        return this.roomsService.createRoom(body.name, body.type);
    }
}
