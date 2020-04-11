const http = require('http');
const express = require('express');
const ejs = require('ejs');
const Party = require('./local_modules/tictactwo');

var app = express();
var server = http.createServer(app);
const io = require('socket.io').listen(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));

let partyList = [];
let waitingSlot = undefined;

app.get('/', (req, res)=>{
    res.render('index');
});

app.get('/shuffle', (req, res)=>{
    let id = partyList.length;
    if (waitingSlot == undefined)
    {
        partyList.push(new Party(id));
        waitingSlot = id;
        res.redirect(`/party/${id}`);
    }
    else
    {
        res.redirect(`/party/${waitingSlot}`);
        waitingSlot = undefined;
    }
});

app.get('/party/:id', (req, res)=>{
    let id = req.params.id;
    if (partyList[id] == undefined)
    {
        res.render('index', {error: 'Halt ! This party does not exist !'})
    }
    else
    {
        res.render('party', {id:id});
    }
});

io.sockets.on('connection', function(socket){
    socket.on('connectToParty', (content)=>{
        socket.emit('responseToConnection', {
            pass: partyList[content.id].getNewPlayer(socket),
            field: partyList[content.id].content  
         });
    })

    socket.on('play', (content)=>{
        let res = partyList[content.id].play(content);
        if (res != null) setTimeout(()=>{ delete partyList[content.id];}, 60000);
        partyList[content.id].sockets.forEach( client => {
            client.emit('newField', res); 
        });
    })
})

server.listen(80);
