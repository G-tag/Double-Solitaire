const Constants = require('./../shared/constants');
const {WIDTH, HEIGHT} = Constants;

module.exports = class Stack {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.cards = {up: [], down: []};
    }
    addCard(index, card) {
        this.cards[index].push(card);
    }
    flipCard() {
        this.cards.up.push(this.cards.down.pop());
    }
    alignCards(style) {
        switch(style) {
            case 'stacks':
                for (let i = 0; i < this.length('up'); i++) {
                    this.cards.up[i].x = this.x;
                    this.cards.up[i].y = this.y + i*0.33*HEIGHT;
                }
                break;
            case 'hand':
                let length = this.length('up');
                let j = 0;
                for (let i = 0; i < length; i++) {
                    this.cards.up[i].x = this.x + j*0.33*WIDTH;
                    this.cards.up[i].y = this.y;
                    if (length-i <= 3) {
                        j++;
                    }
                }
                break;
            default:
                for (let i = 0; i < this.length('up'); i++) {
                    this.cards.up[i].x = this.x;
                    this.cards.up[i].y = this.y;
                }
                break;
        }
    }
    top(index) {
        return this.length(index)-1;
    }
    length(index) {
        return this.cards[index].length;
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
            cards: this.cards.up,
            length: this.length('up')+this.length('down')
        };
    }
}