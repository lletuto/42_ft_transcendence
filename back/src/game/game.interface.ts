
export interface Game{
    user1: string;
    user2?: string;
    user1Id: number;
    user2Id?: number;
    status: string;
    choice1?: string;
    choice2?: string;
    socketid1: string;
    socketid2?: string;
    score1: number;
    score2: number;
    GameId: string;
    level : number;
    history1 : string[]
    history2 : string[]
    rematch1? : boolean
    rematch2? : boolean
	 disconnectUser? : 1 | 2
	 timer? : NodeJS.Timeout;
}