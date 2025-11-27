// --- Game Element Selection ---
const gameContainer = document.getElementById('game-container');
const player = document.getElementById('player');
const scoreDisplay = document.getElementById('score');
const gameOverMessage = document.getElementById('game-over-message');

// --- Game Constants & Variables ---
const GRAVITY = 0.5;      // How quickly the player falls
const JUMP_FORCE = 10;    // How high the player jumps
const GROUND_Y = 0;       // Y position of the ground (relative to container bottom)
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

    // The player's X position is fixed, but its Y position changes.
    // We check if the player's bounding box overlaps the obstacle's bounding box.
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

// --- Event Listeners (Input) ---

// 1. Keyboard Input (Spacebar)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); // Prevents page scrolling
        jump();
    }
});

// 2. Touch Input (Screen Tap/Touch)
document.addEventListener('touchstart', (event) => {
    event.preventDefault(); // Prevents scrolling/zooming on mobile
    jump();
});

// --- Initialization: Start the Game! ---
// The game waits for the window to load all elements (player, container)
// before starting the animation loop.
window.onload = () => {
     requestAnimationFrame(gameLoop);
};
