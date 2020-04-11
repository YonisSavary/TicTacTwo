const socket = require('socket.io');

class Party
{
    constructor(id)
    {
        // The party id is useful to
        // identify the object
        // (for the client)
        this.id = id;
        this.playerCount = 0;
        this.passwords = [];
        this.sockets = [];
        this.activePlayer = 0 ;

        // -1 mean the slot is clickable
        // 0 mean player 1 owe the slot
        // 1 same for player 2
        this.content = [
            -1, -1, -1,
            -1, -1, -1,
            -1, -1, -1,
        ];
    }

    getNewPlayer(socket)
    {
        this.sockets.push(socket);
        if (this.playerCount < 2)
        {
            this.playerCount++;
            let pass = Math.floor( Math.random()* 1000000);
            this.passwords.push(pass);
            return pass
        }
        else
        {
            return {id:0, state:"spectator", pass:-1}
        }
    }

    play(content)
    {
        let pass = content.password;
        // player mean the playing player 0 or 1
        let player = -1;
        if (this.passwords[0]==pass) player = 0 ;
        if (this.passwords[1]==pass) player = 1 ;
        let success = null;
        if (player == this.activePlayer)
        {
            if (this.content[content.slot] == -1)
            {
                this.content[content.slot] = player;
                if (player == 1) this.activePlayer = 0 ;
                if (player == 0) this.activePlayer = 1 ;
                // check for victory
                /* { 
                    0 1 2
                    3 4 5
                    6 7 8
                } */
                let field = this.content;
                // Horizontal checking
                if (field[0] == field[1] && field[1] == field[2] && field[0] != -1) success=field[0];
                if (field[3] == field[4] && field[4] == field[5] && field[3] != -1) success=field[3];
                if (field[6] == field[7] && field[7] == field[8] && field[6] != -1) success=field[6];
                // Vertical checking
                if (field[0] == field[3] && field[3] == field[6] && field[0] != -1) success=field[0];
                if (field[1] == field[4] && field[4] == field[7] && field[1] != -1) success=field[1];
                if (field[2] == field[5] && field[5] == field[8] && field[2] != -1) success=field[2];
                // Diagonal checking
                if (field[0] == field[4] && field[4] == field[8] && field[0] != -1) success=field[0];
                if (field[6] == field[4] && field[4] == field[2] && field[6] != -1) success=field[6];

                let fill = true;
                field.forEach(element => { if(element == -1) fill = false; });
                if (fill==true && success == null) success=3 ;
            }
        }
        return {field:this.content, success: success} ;
    }
}


module.exports = Party;