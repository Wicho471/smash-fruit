const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let mousePos = { x: 0, y: 0 };

const fruits = [];
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let lives = 3;
const maxFruits = 5;
const fruitSprites = {};
const heartSprites = {
    normal: 'img/heart.png',
    damaged: 'img/damaged_heart.png',
    noHeart: 'img/no_heart.png'
};
const fruitTypes = ['apple', 'avocado', 'coconut', 'dragonFruit', 'greenApple', 'kiwi', 'lemon', 'orange', 'peach', 'pomegranate', 'watermelon']; // Add other fruits here

//Funcion para cargar el fondo
function drawBackground() {
    var background = new Image();
    background.src = "img/background.png";
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

// Funcion para cargar los sprites de las frutas
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
    constructor(type, x, y, angle, speed) {
        this.type = type;
        this.sprites = fruitSprites[type];
        this.currentSprite = 'normal';
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.cut = false;
        this.width = canvas.width / 12; // Adjust fruit size based on canvas size
        this.height = canvas.height / 12;
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
            this.vy += this.gravity; // Apply gravity for parabolic motion
        } else {
            this.x += this.vx;
            this.y += this.vy;
            this.gravity *= 1.03;
            this.vy += this.gravity; // Apply gravity for parabolic motion
        }
        this.draw();
    }

    cutFruit() {
        if (this.cut) return; // Avoid cutting the fruit again
        this.cut = true;
        this.currentSprite = 'cut';
        score += 1;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('highScore', highScore);
        }
    }
}

// Function to generate random fruits
function generateFruits() {
    const numberOfFruits = Math.floor(Math.random() * maxFruits) + 1;
    for (let i = 0; i < numberOfFruits; i++) {
        const randomIndex = Math.floor(Math.random() * fruitTypes.length);
        const type = fruitTypes[randomIndex];
        const isRightSide = Math.random() > 0.5;
        const x = isRightSide ? canvas.width : 0;
        const y = canvas.height;
        let angle = (Math.random() * (75 - 35) + 35) * (Math.PI / 180);
        const direction = isRightSide ? -1 : 1; // Invert direction for right side

        if (isRightSide) {
            angle = Math.PI - angle; // Adjust angle for right side
        }

        const speed = Math.random() * 1 + 6;
        fruits.push(new Fruta(type, x, y, angle, speed, direction));
    }
}

// Function to check if fruit is cut
function checkCut(x, y) {
    fruits.forEach(fruit => {
        const distX = x - fruit.x;
        const distY = y - fruit.y;
        if (distX >= 0 && distX <= fruit.width && distY >= 0 && distY <= fruit.height) {
            fruit.cutFruit();
        }
    });
}

// Function to draw the score and lives
function drawHUD() {
    ctx.font = '20px Arial';
    ctx.fillStyle = '#FFF';
    ctx.fillText('Score: ' + score, 10, 30);
    ctx.fillText('High Score: ' + highScore, canvas.width / 2 - 50, 30);

    for (let i = 0; i < 3; i++) {
        const heartImg = new Image();
        heartImg.src = i < lives ? heartSprites.normal : heartSprites.noHeart;
        ctx.drawImage(heartImg, canvas.width - (i + 1) * 40, 10, 30, 30);
    }
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawHUD();
    fruits.forEach((fruit, index) => {
        fruit.update();
        if (fruit.y > canvas.height && !fruit.cut) {
            lives -= 1;
            fruits.splice(index, 1);
            if (lives === 0) {
                alert('Game Over');
                document.location.reload();
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

// Generate fruits continuously
setInterval(generateFruits, 5000);

// Event listeners
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    let xmouse = e.clientX - rect.left;
    let ymouse = e.clientY - rect.top;
    checkCut(xmouse, ymouse);
    console.log("X:" + xmouse, "X:" + ymouse);
});

// Initialize game
loadImages();
gameLoop(); 