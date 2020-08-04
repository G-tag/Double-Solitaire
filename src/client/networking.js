import io from 'socket.io-client';
import {setBoxes, showStatusButton, showStatusMessage} from './render';
import {startEventListeners} from './inputs';

export var enemy = {};
export var me = {};
export var aces = {};
export var cancel_events = false;

var socket;

export function Login(name, timeout = 10000) {
    socket = io();
    console.log(name+" found!");
    setupCallBacks();
    return new Promise((resolve, reject) => {
        let timer;
        socket.emit('login', name);
        socket.once('init', (msg) => {
            processUpdate(msg);
            setBoxes();
            startEventListeners();
            showStatusButton("Ready");
            resolve('init received');
            clearTimeout(timer);
        });
        timer = setTimeout(() => {
            reject(new Error("timeout waiting to login"));
        }, timeout);
    });
}

export function sendStatus(status) {
    socket.emit(status);
}

function setupCallBacks() {
    socket.on('update', (msg) => {
        processUpdate(msg);
    });
    socket.on('moving', (msg) => {
        let update = JSON.parse(msg);
        processMovingCards(update, socket.id);
    });
    socket.on('placed', (msg) => {
        let update = JSON.parse(msg);
        processPlacedCards(update, socket.id);
    });
    socket.on('flip', (msg) => {
        let update = JSON.parse(msg);
        processFlippedCards(update, socket.id);
    });
    socket.on('server_full', function() {
        console.log("server full");
        showStatusMessage("Server Full");
    });
    socket.on('start_game', (msg) => {
        let message = JSON.parse(msg);
        showStatusMessage(message);
        showStatusButton("Done");
    });
    socket.on('end_game', (msg) => {
        let message = JSON.parse(msg);
        showStatusMessage(message);
        showStatusButton("Again");
    });
    socket.on('restart_game', (msg) => {
        processUpdate(msg);
        showStatusButton("Ready");
    });
}

function processUpdate(msg) {
    let update = JSON.parse(msg);
    let players = Object.keys(update.decks);
    me = enemy = aces = {};
    for (let id in players) {
        if (players[id] == socket.id) {
            me = update.decks[players[id]];
        } else {
            enemy = update.decks[players[id]];
        }
    }
    aces = update.aces;
    console.log(update);
    if (update.message != undefined) {
        showStatusMessage(update.message);
    }
}
function processMovingCards(msg, id) {
    if (msg.player == id) {
        for (let i = 0; i < msg.cards.length; i++) {
            me[msg.type][msg.stack].cards[msg.indexes[i]].x = msg.cards[i].x;
            me[msg.type][msg.stack].cards[msg.indexes[i]].y = msg.cards[i].y;
        }
    } else {
        for (let i = 0; i < msg.cards.length; i++) {
            enemy[msg.type][msg.stack].cards[msg.indexes[i]].x = msg.cards[i].x;
            enemy[msg.type][msg.stack].cards[msg.indexes[i]].y = msg.cards[i].y;
        }
    }
}
function processPlacedCards(msg, id) {
    if (msg.player == id) {
        if (msg.aces) {
            aces[msg.dest.stack].cards = msg.dest.cards;
        } else {
            me[msg.dest.type][msg.dest.stack] = msg.dest.cards;
        }
        me[msg.src.type][msg.src.stack] = msg.src.cards;
    } else {
        if (msg.aces) {
            aces[msg.dest.stack].cards = msg.dest.cards;
        } else {
            enemy[msg.dest.type][msg.dest.stack] = msg.dest.cards;
        }
        enemy[msg.src.type][msg.src.stack] = msg.src.cards;
    }
}
function processFlippedCards(msg, id) {
    if (msg.player == id) {
        if (msg.type == 'hand') {
            me[msg.type] = msg.cards;
        } else {
            me[msg.type][msg.stack].cards = msg.cards;
        }
    } else {
        if (msg.type == 'hand') {
            enemy[msg.type] = msg.cards;
        } else {
            enemy[msg.type][msg.stack].cards = msg.cards;
        }
    }
}

export function sendInput(type, x, y) {
    var msg = {
        x: x,
        y: y
    };
    socket.emit(type, JSON.stringify(msg));
}