const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

let level = 1;
const toNextLevel = 5;

const fruits = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
const maxFruits = 10;
const fruitSprites = {};
const heartSprites = {
    normal: 'img/heart.png',
    damaged: 'img/damaged_heart.png',
    noHeart: 'img/no_heart.png'
};
const fruitTypes = ['apple', 'avocado', 'coconut', 'dragonFruit', 'greenApple', 'kiwi', 'lemon', 'orange', 'peach', 'pomegranate', 'watermelon']; // Add other fruits here
const cursorImagePath = 'img/mouse/katana.png';
const cursorDefaultImagePath = 'img/mouse/dedo.png';

var fuente = new FontFace('MinecraftFont', 'url(font/Minecraft.ttf)');
fuente.load().then(function (loadedFont) {
    document.fonts.add(loadedFont);
}).catch(function (error) {
    console.error('Error al cargar la fuente:', error);
});

var musicTheme = new Audio('fx/music.mp3');
musicTheme.volume = 0.25;

function drawBackground() {
    var background = new Image();
    background.src = "img/background.png";
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function loadImages() {
    fruitTypes.forEach(fruit => {
        fruitSprites[fruit] = {
            normal: `img/fruit_sprites/${fruit}.png`,
            cut: `img/fruit_sprites/${fruit}_cuted.png`
        };
    });
}

// Class for fruits
class Fruta {
    constructor(type, x, y, angle, speed, cut, currentSprite) {
        this.type = type;
        this.sprites = fruitSprites[type];
        this.currentSprite = currentSprite;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.cut = cut;
        this.width = canvas.width / 12;
        this.height = canvas.width / 12;
        this.gravity = 0.04;
        this.vx = speed * Math.cos(angle);
        this.vy = -speed * Math.sin(angle);
    }

    draw() {
        const img = new Image();
        img.src = this.sprites[this.currentSprite];
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
    }

    update() {
        if (!this.cut) {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.vy += this.gravity;
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.gravity *= 1.05;
            this.rotation += this.rotationSpeed;
            this.vy += this.gravity;
        }
        this.draw();
    }

    cutFruit() {
        if (this.cut) return;
        this.cut = true;
        this.currentSprite = 'cut';
        score += 1;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
        const cutSound = new Audio('fx/cut.mp3');
        cutSound.play();

        const newRandomAngle = Math.random() < 0.5 ? 1 : -1;
        const fruta1 = new Fruta(this.type, this.x, this.y, this.angle + newRandomAngle, this.speed, true, 'cut');
        const fruta2 = new Fruta(this.type, this.x, this.y, this.angle - newRandomAngle, this.speed, true, 'cut');
        fruits.push(fruta1);
        fruits.push(fruta2);

        const index = fruits.indexOf(this);
        if (index > -1) {
            fruits.splice(index, 1);
        }
    }
}

function generateFruits() {
    const numberOfFruits = Math.min(Math.floor(Math.random() * 3 + (Math.floor(level / toNextLevel))) + 1, maxFruits);
    for (let i = 0; i < numberOfFruits; i++) {
        const randomIndex = Math.floor(Math.random() * fruitTypes.length);
        const type = fruitTypes[randomIndex];
        const isRightSide = Math.random() > 0.5;
        const x = isRightSide ? canvas.width : 0;
        const y = canvas.height;
        let angle = (Math.random() * (75 - 35) + 35) * (Math.PI / 180);

        if (isRightSide) {
            angle = Math.PI - angle;
        }
        const speed = Math.random() * 1.5 + 6;
        fruits.push(new Fruta(type, x, y, angle, speed, false, 'normal'));
    }
    const shootSound = new Audio('fx/shoot.mp3');
    shootSound.play();

    level += 1;
}

function checkCut(x, y) {
    fruits.forEach(fruit => {
        const distX = x - fruit.x;
        const distY = y - fruit.y;
        if (distX >= 0 && distX <= fruit.width && distY >= 0 && distY <= fruit.height) {
            fruit.cutFruit();
        }
    });
}

function checkCursorHover(x, y) {
    let cursorOverFruit = false;
    fruits.forEach(fruit => {
        const distX = x - fruit.x;
        const distY = y - fruit.y;
        if (distX >= 0 && distX <= fruit.width && distY >= 0 && distY <= fruit.height) {
            if (!fruit.cut) {
                cursorOverFruit = true;
            }
        }
    });

    if (cursorOverFruit) {
        canvas.style.cursor = `url(${cursorImagePath}), auto`;
    } else {
        canvas.style.cursor = `url(${cursorDefaultImagePath}), auto`;
    }
}

function drawHUD() {
    ctx.font = '30px MinecraftFont';
    ctx.shadowColor = 'black';

    ctx.fillStyle = '#FFF';
    // Cargar el sprite de la fruta cortada
    const cutFruitImg = new Image();
    cutFruitImg.src = 'img/fruit_sprites/dragonFruit_cuted.png'; // Cambia esta ruta según el sprite que desees usar
    ctx.drawImage(cutFruitImg, 10, 5, 50, 50); // Ajusta la posición y el tamaño según sea necesario
    ctx.font = '35px MinecraftFont';
    ctx.fillText(+ score, 70, 43); // Dibujar el puntaje al lado del sprite


    ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 110, 30);
    ctx.fillText('Level: ' + (Math.floor(level / toNextLevel) + 1), 10, canvas.height - 10);

    for (let i = 0; i < 3; i++) {
        const heartImg = new Image();
        heartImg.src = i < lives ? heartSprites.normal : heartSprites.noHeart;
        ctx.drawImage(heartImg, canvas.width - (i + 1) * 60, 10, 45, 45);
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawHUD();
    fruits.forEach((fruit, index) => {
        fruit.update();
        if (fruit.y > canvas.height) {
            if (fruit.cut) {
                fruits.splice(index, 1);
            } else {
                lives -= 1;
                fruits.splice(index, 1);
                if (lives === 0) {
                    alert('Game Over');
                    document.location.reload();
                }
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

// Event listeners
canvas.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();
    let xmouse = e.clientX - rect.left;
    let ymouse = e.clientY - rect.top;
    checkCut(xmouse, ymouse);
    musicTheme.play();
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let xmouse = e.clientX - rect.left;
    let ymouse = e.clientY - rect.top;
    checkCursorHover(xmouse, ymouse);
});

// Initialize game
loadImages();
gameLoop();

setInterval(generateFruits, Math.random() * 2000 + 3000);


document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('header');
    const text = header.innerText;
    header.innerHTML = '';
    text.split('').forEach((char, index) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.style.animationDelay = `${index * 0.2}s`; // Diferentes retrasos para cada letra
        header.appendChild(span);
    });
});