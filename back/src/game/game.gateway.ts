import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { Injectable } from "@nestjs/common";
import * as cookie from 'cookie';
import { JwtService } from "@nestjs/jwt";
import type { Game } from "./game.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { randomBytes } from "crypto";
import { Server } from "socket.io";
import { GameService } from "src/game/game.service";

// This is a WebSocket gateway for a game application. It handles real-time communication between clients and the server. The gateway manages game rooms, player connections, disconnections, and game state updates. It uses JWT for authentication and Prisma for database interactions. The gateway supports creating and joining game rooms, handling player choices, determining game results, and managing rematches. It also handles player disconnections and reconnections within a specified timeout period.
@Injectable()
@WebSocketGateway()
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private jwtService : JwtService, private prismaService: PrismaService, private gameService: GameService){}
    private Games = new Map<string, Game>();

    @WebSocketServer()
    server!: Server;

    async handleConnection(client: Socket) {
        const cookies = client.handshake.headers.cookie;
        const parsed =  cookie.parse(cookies || '');
        const jwt = parsed['jwt'];
        if (!jwt) {
            client.disconnect();
            return;
        }
        try {
            const payload = this.jwtService.verify(jwt);
            client.data.user = payload;
        } catch {
            client.disconnect();
            return;
        }
        const user = await this.prismaService.user.findFirst({
            where : { id:  client.data.user.sub }
        });
        if (!user) {
            client.disconnect();
            return;
        }
        client.emit('Identity', {username: user?.nickname});
        for (const [gameId, game] of this.Games) {
            if (!game.user2) continue;
            const isP1 = client.data.user.sub === game.user1Id;
            const isP2 = client.data.user.sub === game.user2Id;
            if ((isP1 || isP2) && (game.status === 'reconnecting' || game.status === 'playing')) {
                if (isP1)
                    game.socketid1 = client.id;
                else
                    game.socketid2 = client.id;
                clearTimeout(game.timer);
                game.status = 'playing';
                client.join(gameId);
                this.server.to(gameId).emit('Reconnecting', {
                    gameId: game.GameId,
                    player1: game.user1,
                    player2: game.user2,
                    level: game.level,
                    score1: game.score1,
                    score2: game.score2,
                    user2Id: game.user2Id,
                });
            }
        }
    }
    // This method handles the 'leaveGame' event from clients. When a client sends this event, the server checks if the client is part of any active game. If the client is found in a game, it emits a 'leaveGame' message to all clients in that game room, indicating that the game has ended because a player quit. The game is then removed from the active games map.
	@SubscribeMessage('leaveGame')
	leaveGame(client: Socket)
	{
	    for (const [gameId, game] of this.Games)
	    {
	    	if (game.socketid1 == client.id || game.socketid2 == client.id)
	    	{
	    		this.server.to(gameId).emit('leaveGame', {message : 'Game ended, player quit the game'});
	    		this.Games.delete(gameId);
	    	}
	    }
	}
    // This method handles client disconnections. When a client disconnects, the server checks if the client was part of any active game. If the client was in a game, it marks which player disconnected and changes the game status to 'reconnecting'. It emits an error message to all clients in that game room, indicating that a player has disconnected and is waiting for reconnection. A timer is set for 30 seconds, after which, if the disconnected player does not reconnect, the game ends and is removed from the active games map.
    handleDisconnect(client: Socket)
    {
		for (const [gameId, game] of this.Games)
		{
			if (game.socketid1 == client.id || game.socketid2 == client.id)
			{
				if (game.socketid1 == client.id)
					game.disconnectUser = 1;
				else
					game.disconnectUser = 2;
				game.status = 'reconnecting';
				this.server.to(gameId).emit('Error', {message : 'A player disconnected, waiting for reconnexion'});
				game.timer = setTimeout(() => {
					this.server.to(gameId).emit('Error', {message : 'Game ended, player did not reconnect'});
					this.Games.delete(gameId);
				}, 30000);
				return;
			}
		}
    }
    // This method handles the 'createRoom' event from clients. When a client sends this event with a specified game level, the server generates a unique game ID and creates a new game object with the client's information. The game is initialized with the status 'waiting' for an opponent to join. The server then emits a 'RoomCreated' message back to the client with the room ID and level, and the client is added to the newly created game room.
    @SubscribeMessage('createRoom')
    async handleCreateRoom(client: Socket, data: {level: number}) {
        const gameId = randomBytes(3).toString('hex');
        const user = await this.prismaService.user.findFirst({
            where : { email: client.data.user.email },
        });
        if (!user) {
            client.emit('error', { message: 'No user found' });
            return;
        }
            
        const game: Game = {
            socketid1: client.id,
            user1: user.nickname!,
            score1 : 0,
            score2 : 0,
            status : 'waiting',
            GameId : gameId,
            level : data.level,
            history1 :[],
            history2 :  [],
            user1Id : client.data.user.sub,
        };
        this.Games.set(gameId, game);
        client.emit('RoomCreated', { roomId : gameId, level: data.level });
        client.join(gameId);
    }   
    // This method handles the 'JoinRoom' event from clients. When a client sends this event with a specified game ID, the server checks if the game exists and if there is space for another player. If the game is valid and has an open slot, the server updates the game object with the second player's information, changes the game status to 'playing', and adds the client to the game room. The server then emits a 'gameReady' message to all clients in that room, indicating that the game is ready to start.
    @SubscribeMessage('JoinRoom')
    async handleJoinRoom(client : Socket, data: {gameId: string}) {
        const game = this.Games.get(data.gameId);
        if (!game) {
            client.emit('error', { message: 'Wrong gameId' });
            return;
        }
        if (game.user2) {
            client.emit('error', { message: 'Too many users' });
            return;
        }
        if (client.id == game?.socketid1) {
            client.emit('error', { message: 'User already in the room' });
            return;
        }
        if (client.data.user.sub === game.user1Id) {
            client.emit('error', { message: 'Cannot play against yourself' });
            return;
        }
        const user = await this.prismaService.user.findFirst({
            where : { email: client.data.user.email },
        });
        if (!user) {
            client.emit('error', { message: 'No user found' });
            return;
        }
        game.socketid2 = client.id;
        game.user2 = user.nickname!;
        game.user2Id = client.data.user.sub;
        game.status = 'playing';
        client.join(data.gameId);


        this.server.to(data.gameId).emit('gameReady', {
            gameId: data.gameId,
            player1: game.user1,
            player2: game.user2,
            level: game.level,
            user2Id : client.data.user.sub,
            message: 'Game is ready',
        });
    }

    // This method handles the 'choice' event from clients. When a client sends their choice for the game, the server checks if both players have made their choices. If both choices are present, it determines the winner using the GameService, updates the scores accordingly, and emits the result to all clients in the game room. If a player reaches the maximum score for the level, the game ends, and the server updates the win/loss records in the database. The method also handles bonus points based on the players' choice history.
    @SubscribeMessage('choice')
    async handleChoice(client: Socket, data: {gameId: string, choice: string}) {
        const game = this.Games.get(data.gameId);
        if(!game) {
            client.emit('error', { message: 'Wrong gameId'});
            return;
        }
        if (client.id == game.socketid1)
            game.choice1 = data.choice;
        else if (client.id == game.socketid2)
            game.choice2 = data.choice;
        else {
            client.emit('error', { message :  'No player found'});
            return;
        }
        if (game.choice1 && game.choice2) {
            game.history1.push(game.choice1);
            game.history2.push(game.choice2);
            const winner = this.gameService.getResult(game.choice1,  game.choice2, game.level);
            
            if (winner === "draw") {
                this.server.to(game.GameId).emit('Result', { 
                    message: {winner}, 
                    player1: game.score1, 
                    player2: game.score2, 
                    choice1: game.choice1, 
                    choice2: game.choice2,
                    level: game.level 
                });
                game.choice1 = undefined;
                game.choice2 = undefined;
                return;
            }
            
            let bonus;
			let bonusNbr;
            if (winner === "player1")
            {
               bonus = this.gameService.checkBonus(game.history1, game.level, game, winner);
					if (bonus == 1 || bonus == 2)
					    bonusNbr = 1;
					else if ( bonus == 3)
						bonusNbr = 2;
					else
						bonusNbr = 0;
					const result = 1 + bonusNbr;
					game.score1 += result;
            }
            else
            {
                bonus = this.gameService.checkBonus(game.history2, game.level, game, winner);
					if (bonus == 1 || bonus == 2)
						bonusNbr = 1;
					else if ( bonus == 3)
						bonusNbr = 2;
					else
						bonusNbr = 0;
					const result = 1 + bonusNbr;
               game.score2 += result;
            }
            if (winner == "player1" && game.choice2 == 'well')
                game.score2 -= 1;
            else if (winner == "player2" && game.choice1 == 'well')
                game.score1 -= 1;
            game.choice1 = undefined;
            game.choice2 = undefined;
            const max_score = game.level === 0 ? 5 : 10;
            if (game.score1 >= max_score || game.score2 >= max_score) {
                game.status = 'finished';
                this.server.to(game.GameId).emit('Winner', { 
                    message: {winner}, 
                    player1: game.score1, 
                    player2: game.score2,
                    level: game.level
                });
                if (game.score1 >= max_score) {
                    await this.prismaService.user.update({
                        where :{id : game.user1Id},
                        data : {winMatch : {increment: 1}},
                    });
                    await this.prismaService.user.update({
                        where :{id : game.user2Id},
                        data : {lostMatch: {increment: 1}}
                    });
                } else {
                    await this.prismaService.user.update({
                        where :{id : game.user2Id},
                        data : {winMatch : {increment: 1}},
                    });
                    await this.prismaService.user.update({
                        where :{id : game.user1Id},
                        data : {lostMatch: {increment: 1}}
                    });
                }
                return;
            }
            game.status = 'playing'; // Remis à playing pour le déroulement normal des manches
            this.server.to(game.GameId).emit('Result', { 
                message: {winner}, 
                player1: game.score1, 
                player2: game.score2,   
                choice1: game.history1[game.history1.length - 1], 
                choice2: game.history2[game.history2.length - 1],
                level: game.level,
                bonus: bonus
            });
            return;
        }
    }
    // This method handles the 'rematch' event from clients. When a client sends this event with their choice for a rematch, the server checks if both players have agreed to a rematch. If both players agree, the game state is reset, and a 'gameReady' message is emitted to all clients in the game room, indicating that the game is ready to start again. If one player refuses the rematch, an error message is sent to all clients in the room, and the game is removed from the active games map.
    @SubscribeMessage('rematch')
    rematch(client: Socket, data: {gameId: string, choice: boolean}) {
        const game = this.Games.get(data.gameId);
        if(!game) {
            client.emit('error', { message: 'Wrong gameId'});
            return;
        }
        if (client.data.user.sub == game.user1Id) {
            if (data.choice == true)
                game.rematch1 = true;
        }
        if (client.data.user.sub == game.user2Id) {
            if (data.choice == true)
                game.rematch2 = true;
        }
        if (data.choice == false) {
            this.server.to(data.gameId).emit('Error', { message: 'Opponent refused rematch' });
            this.Games.delete(data.gameId);
            return;
        }
        if (game.rematch1 && game.rematch2) {
            this.server.to(data.gameId).emit('gameReady', {
                gameId: data.gameId,
                player1: game.user1,
                player2: game.user2,
                level: game.level,
                user2Id : client.data.user.sub,
                status : 'playing',    
                message: 'Game is ready',
            });
            game.score1 = 0;
            game.score2 = 0;
            game.history1 = [];
            game.history2 = [];
            game.choice1 = undefined;
            game.choice2 = undefined;
            game.rematch1 = false;
            game.rematch2 = false;
        }
    }
}
