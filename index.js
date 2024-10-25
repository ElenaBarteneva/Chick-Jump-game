const board = document.getElementById('board');
const lastGamesBoard = document.querySelector('.last-games');
const egg = document.querySelector('.animation-frame');
const boardWidth = 515;
const boardHeight = 557;
let context;
let startGame = false;

const chickWidth = 90;
const chickHeight = 90;
const chickX = boardWidth / 2 - chickWidth / 2;
const chickY = boardHeight * 7 / 8 - chickHeight;
let chickRightImg;
let chickLeftImg;
let chick = {
    img : null,
    x : chickX,
    y : chickY,
    width : chickWidth,
    height : chickHeight
}

let velocityX = 0;
let velocityY = 0;
const initialVelocityY = -4;
const gravity = 0.2;

let platformArray = [];
const platformWidth = 100;
const platformHeight = 25;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;
let lastTenScores = [];

const backMusic = new Audio('audio/back-music.mp3');
backMusic.loop = true;
backMusic.volume = 0.2;
const gameOverMusic = new Audio('audio/gameover.mp3');
gameOverMusic.volume = 0.2;
const jumpSound = new Audio('audio/jumping.mp3');
const chickStartSound = new Audio('audio/chick2.mp3');

const imgSources = [
    'img/egg.png',
    'img/egg2.png',
    'img/egg3.png',
    'img/egg4.png',
    'img/chick1.png',
    'img/chick2.png',
    'img/chick2.png',
    'img/back.png',
    'img/chick-right.png',
    'img/chick-left.png',
    'img/platform.png',
]


function renderImages() {
    let loadedImgs = 0;

    imgSources.forEach((image) => {
        let img = document.createElement("img");
        img.src = image;
        img.addEventListener('loadeddata', () => {
            loadedImgs++;
        if (loadedImgs === imgSources.length) {
            initGame();
        }
    })
})
}


window.onload = function initGame() {
    egg.addEventListener('click', () => {
        egg.classList.add('animated');
        chickStartSound.play();
    })
    if (board) {
        chickStartSound.pause();
    }
    setTimeout(() => {
        document.querySelector('.animation').style.display = 'none';
        document.querySelector('main').style.display = 'flex';

        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext('2d');

        chickRightImg = new Image();
        chickRightImg.src = 'img/chick-right.png';
        chick.img = chickRightImg;
        chickRightImg.onload = function() {
            context.drawImage(chick.img, chick.x, chick.y, chick.width, chick.height);
        }

        chickLeftImg = new Image();
        chickLeftImg.src = 'img/chick-left.png';

        platformImg = new Image();
        platformImg.src = 'img/platform.png';

        velocityY = initialVelocityY;

        context.fillStyle = 'red';
        context.font = '18px sans-serif';
        context.fillText('Press "Space" to start the game!', boardWidth / 4, boardHeight * 3/8);
        context.fillText('Use "←" and "→" to control the chick!', boardWidth / 4.5, boardHeight * 4/8);

        placePlatforms();
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space' && !startGame) {
                startGame = true;
                backMusic.play();
                requestAnimationFrame(update);
                context.fillText('', boardWidth / 4, boardHeight * 3/8);
                context.fillText('', boardWidth / 4.5, boardHeight * 4/8);
            }
        })
        document.addEventListener('keydown', moveChick);
}, "5500");
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) return;

    context.clearRect(0, 0, board.width, board.height);

    chick.x += velocityX;
    if (chick.x > boardWidth) {
        chick.x = 0;
    }
    else if (chick.x + chick.width < 0) {
        chick.x = boardWidth;
    }

    velocityY += gravity;
    chick.y += velocityY;

    if (chick.y > board.height) {
        gameOver = true;
        backMusic.pause();
        gameOverMusic.play();
    }

    context.drawImage(chick.img, chick.x, chick.y, chick.width, chick.height);

    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && chick.y < boardHeight * 3/4) {
            platform.y -= initialVelocityY;
            jumpSound.play();
        }
        if (detectCollision(chick, platform) && velocityY >= 0) {
            velocityY = initialVelocityY;
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); 
        newPlatform();
    }

    updateScore();
    context.fillStyle = 'red';
    context.font = '18px sans-serif';
    context.fillText(`Score: ${score}`, 10, 20);

    if (gameOver) {
        // backMusic.pause();
        context.fillText('Game Over... Press "Enter" to restart', boardWidth / 4, boardHeight * 3/8);
        context.fillText(`Your Score: ${score}`, boardWidth / 2.5, boardHeight * 4/8);
        board.classList.add('filter');
        setLastTenScores(score);
    }
}

function moveChick(event) {
    if (event.code === 'ArrowRight' || event.code === 'KeyD') {
        velocityX = 4;
        chick.img = chickRightImg;
    }
    else if (event.code === 'ArrowLeft' || event.code === 'KeyA') {
        velocityX = -4;
        chick.img = chickLeftImg;
    }
    else if (event.code === 'Enter' && gameOver) {
        backMusic.play();
        chick = {
            img : chickRightImg,
            x : chickX,
            y : chickY,
            width : chickWidth,
            height : chickHeight
        }
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        board.classList.remove('filter');
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

    let platform = {
        img : platformImg,
        x : boardWidth / 2,
        y : boardHeight - 25,
        width: platformWidth,
        height: platformHeight
    }

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        const randomX = Math.floor(Math.random() * boardWidth * 3/4);
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        }
        platformArray.push(platform);
    }
}

function newPlatform() {
    const randomX = Math.floor(Math.random() * boardWidth * 3/4);
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width: platformWidth,
        height: platformHeight
    }
    platformArray.push(platform);  
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function updateScore() {
    let points = Math.floor(50 * Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    } 
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}

function setLastTenScores(score) {
    lastTenScores.unshift(score);
    if (lastTenScores.length > 10) {
        lastTenScores.pop();
    }
    console.log(lastTenScores);
    lastGamesBoard.innerHTML = "Last 10 games' scores";
   for (let i = 0; i < lastTenScores.length; i++) {
        const newScore = document.createElement('li');
        newScore.innerHTML = `Score: ${lastTenScores[i]}`;
        lastGamesBoard.appendChild(newScore);
   } 
}