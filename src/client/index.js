import {Login} from './networking';
import {startRendering} from './render';
import {loadAssets} from './assets';

const playButton = document.getElementById('play-button');
var username = document.getElementById('in-game-name');

loadAssets();

playButton.onclick = () => {
    Login(username.value)
        .then(() => {
            startRendering();
        })
        .catch((err) => {
            console.log(err);
        });
}