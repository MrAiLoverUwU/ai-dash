// Copy this content into the <script id="game-script">...</script> block

const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

// --- Game Variables ---
const GRAVITY = 0.5;      // How quickly the player falls
const JUMP_FORCE = 10;    // How high the player jumps
const GROUND_Y = 0;       // Y position of the ground (relative to container bottom)
const PLAYER_X = 50;      // X position of the player (constant)
const SCROLL_SPEED = 4;   // Speed at which obstacles move left

let isJumping = false;
let velocityY = 0;
let playerY = GROUND_Y;
let isGameOver = false;
let score = 0;
let lastObstacleTime = 0;
const obstacleInterval = 1500; // Time in ms between obstacle spawns

// --- Core Game Loop ---
function gameLoop(timestamp) {
    if (isGameOver) return; // Stop the loop if game is over

    // 1. Player Movement (Gravity and Jumping)
    playerY += velocityY;
    velocityY -= GRAVITY;

    // Check if player has landed (hit the ground)
    if (playerY <= GROUND_Y) {
        playerY = GROUND_Y;
        velocityY = 0;
        isJumping = false;
    }

    // Update player's position
    player.style.bottom = playerY + 'px';

    // 2. Obstacle Spawning
    if (timestamp - lastObstacleTime > obstacleInterval) {
        createObstacle();
        lastObstacleTime = timestamp;
    }

    // 3. Obstacle Movement, Collision, and Cleanup
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        let currentX = parseFloat(obstacle.style.right) || 0;
        currentX += SCROLL_SPEED;
        obstacle.style.right = currentX + 'px';

        // Collision Detection
        if (checkCollision(player, obstacle)) {
            endGame();
        }

        // Cleanup (remove obstacles that have gone off-screen)
        if (currentX > gameContainer.clientWidth) {
            obstacle.remove();
            score++;
            scoreDisplay.textContent = score;
        }
    });

    // Request the next frame for smooth animation
    requestAnimationFrame(gameLoop);
}

// --- Player Jump Function ---
function jump() {
    if (!isJumping && !isGameOver) {
        isJumping = true;
        velocityY = JUMP_FORCE;
    } else if (isGameOver) {
        restartGame();
    }
}

// --- Obstacle Creation ---
function createObstacle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    // We use 'right: 0px' so it starts just off-screen on the right
    obstacle.style.right = '0px'; 
    gameContainer.appendChild(obstacle);
}

// --- Collision Detection ---
function checkCollision(p, o) {
    const pRect = p.getBoundingClientRect();
    const oRect = o.getBoundingClientRect();

    // Check if the player cube and the obstacle spike rectangles overlap
    return (
        pRect.right > oRect.left &&
        pRect.left < oRect.right &&
        pRect.bottom > oRect.top &&
        pRect.top < oRect.bottom
    );
}

// --- Game Control Functions ---
function endGame() {
    isGameOver = true;
    gameOverMessage.style.display = 'block';
    // Optional: Stop scrolling by removing the obstacles' animation/movement
}

function restartGame() {
    isGameOver = false;
    score = 0;
    scoreDisplay.textContent = score;
    gameOverMessage.style.display = 'none';

    // Clear all existing obstacles
    document.querySelectorAll('.obstacle').forEach(o => o.remove());

    // Reset player position and state
    playerY = GROUND_Y;
    velocityY = 0;
    isJumping = false;

    // Start the game loop again
    requestAnimationFrame(gameLoop);
}

// --- Event Listener (Spacebar for Jump/Restart) ---
document.addEventListener('keydown', (event) => {
    // Only respond to the SPACE key
    if (event.code === 'Space') {
        event.preventDefault(); // Prevents the page from scrolling
        jump();
    }
});

// --- Start the Game! ---
// A self-executing function to ensure the code runs immediately
(function init() {
    // Move the embedded CSS and JS into the required tags
    document.getElementById('game-styles').innerHTML = `
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background-color: #333;
            font-family: sans-serif;
            color: white;
        }

        #game-container {
            width: 600px;
            height: 150px;
            border-bottom: 5px solid #0f0; /* The ground line */
            position: relative;
            overflow: hidden; /* Important: keeps objects from showing outside the bounds */
            background-color: #222;
        }

        #player {
            width: 20px;
            height: 20px;
            background-color: yellow;
            position: absolute;
            bottom: 0px; /* Starts on the ground */
            left: 50px;
        }

        .obstacle {
            width: 15px;
            height: 15px;
            background-color: red;
            position: absolute;
            bottom: 0px;
            clip-path: polygon(0% 100%, 50% 0%, 100% 100%); /* Makes it look like a spike */
        }

        #score-board {
            margin-top: 10px;
            font-size: 1.2em;
        }

        #game-over-message {
            position: absolute;
            padding: 20px;
            background-color: rgba(0, 0, 0, 0.8);
            border-radius: 10px;
            text-align: center;
        }
    `;

    document.getElementById('game-script').innerHTML = `
        // The core game logic from above will be executed here
        // Note: For simplicity, I'm skipping the full re-paste here,
        // but when you combine files, you would put the JS code block here.

        // ... [The entire JavaScript block above] ...

        // Wait for the page to fully load before starting the loop
        window.onload = () => {
             requestAnimationFrame(gameLoop);
        };
    `;

    // A small hack to run the JS code when it's all in one file for easy setup
    // You should use the content from the JS section above and paste it directly
    // into the <script id="game-script"> tag for it to work instantly.
    
    // For this example, let's start the game loop directly after the code loads.
    window.onload = () => {
         requestAnimationFrame(gameLoop);
    };
})();
