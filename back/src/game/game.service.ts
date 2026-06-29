import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Game } from './game.interface';

// this class is responsible for handling the game logic, including determining the winner of a game based on the players' choices and the game level. It also checks for bonus points based on the players' choice history. The service interacts with the PrismaService to save game results to the database.
@Injectable()
export class GameService
{
    private bonusCombinations = [
    ['rock', 'rock', 'rock'],
    ['paper', 'paper', 'paper'],
    ['scissors', 'scissors', 'scissors']
    ];
    
    constructor(private prisma: PrismaService) { }

    getResult(player1 : string, player2 : string, level: number)
    {
        
        if (level >= 2)
        {
            if (player1 === 'well')
            {
                if (player2 == 'well')
                    return 'draw';
                else if (player2 === 'scissors' || player2 ==='rock')
                    return 'player1'
                else
                    return 'player2'
            }
            if (player2 === 'well')
            {
                if (player1 === 'scissors' || player1 ==='rock')
                    return 'player2'
                else
                    return 'player1'
            }
        }
        if (player1 === player2) return 'draw'
        if ((player1 === 'rock' && player2 === 'scissors') ||
            (player1 === 'scissors' && player2 === 'paper') ||
            (player1 === 'paper' && player2 === 'rock'))
                return 'player1'
        return 'player2'
    }
    checkBonus(history: string[], level: number, game: Game, winner : string): number {
        if (history.length < 3) return 0;
        
        const lastThree = history.slice(-3);
       
        const bonusCombinations = [
            ['rock', 'rock', 'rock'],
            ['paper', 'paper', 'paper'],
            ['scissors', 'scissors', 'scissors'],
        ]; 
        
        const level3Combinations = [
            ['scissors', 'rock', 'scissors'],
            ['paper', 'rock', 'paper'],
        ];
        
        const gigaBonus = [
            ['well', 'well', 'well']
        ];
        
        if (level >= 1)
        {
            if (level != 3)
            {
                if (lastThree[0] === lastThree[1])
		        {
			    	if (winner == 'player1')
			    		game.history1 = [];
			    	else
			    		game.history2 = [];
		        }
            }
            if (level >= 3) {
                for (const combo of gigaBonus) {
                    if (JSON.stringify(lastThree) === JSON.stringify(combo))
                    {
                        if (winner == 'player1')
			    		    game.history1 = [];
                        else
                            game.history2 = [];
                        return 3;
                    }
                }
                for (const combo of level3Combinations) {
                    if (JSON.stringify(lastThree) === JSON.stringify(combo))
					{
						if (lastThree[0] === lastThree[1])
						{
							if (winner == 'player1')
								game.history1 = [];
							else
								game.history2 = [];
						}
                        return 2;
					}
                }
            }

            for (const combo of bonusCombinations) {
                if (JSON.stringify(lastThree) === JSON.stringify(combo))
				{
					if (lastThree[0] === lastThree[1])
		       		{
			    		if (winner == 'player1')
			    			game.history1 = [];
			    		else
			    			game.history2 = [];
		      		}
                    return 1;
				}
            }
        }
      
        return 0;
    }
}