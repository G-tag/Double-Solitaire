const express = require('express');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');
const Game = require('./game');

const port = 3000;
var sockets = {};
var game = new Game();

var skip_events = false;

// middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('dist'));

http.listen(port, () => {
  console.log('listening on port: '+port);
});

io.on('connection', function(socket) {
    socket.on('login', function(input) {
        // only let 2 players join
        if (game.players.count < 2) {
            console.log(input+" connected!");
            sockets[socket.id] = socket;
            game.addPlayer(socket.id, input);
            sendUpdateToPlayers('init', game);
        }
        else {
            socket.emit('server_full');
        }
    });
    socket.on('disconnect', function() {
        console.log(game.players[socket.id]+" disconnected");
        delete sockets[socket.id];
        game.removePlayer(socket.id);
        sendUpdateToPlayers('update', game);
    });
    socket.on('mouseup', function(input) {
        if (!skip_events) {
            //console.log("up");
            var info = JSON.parse(input);
            game.placeCard(socket.id, info.x, info.y);
            let update = game.placedCardsUpdate(socket.id);
            sendUpdateToPlayers('placed', update);
        }
        skip_events = false;
    });
    socket.on('mousedown', function(input) {
        var info = JSON.parse(input);
        //console.log("down");
        if (!game.decideAction(socket.id, info.x, info.y)) {
            skip_events = true;
            let update = game.flippedCardsUpdate(socket.id);
            if (Object.keys(update).length != 0) {
                sendUpdateToPlayers('flip', update);
            }
        }
    });
    socket.on('mousemove', function(input) {
        if (!skip_events) {
            var info = JSON.parse(input);
            //console.log('drag');
            game.moveCardPos(socket.id, info.x, info.y);
            let update = game.movingCardsUpdate(socket.id);
            sendUpdateToPlayers('moving', update);
        }
    });
});

function sendUpdateToPlayers(type, update) {
    for (var id in sockets) {
        sockets[id].emit(type, JSON.stringify(update));
    }
}