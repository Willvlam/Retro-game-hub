// Donkey Kong Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game states
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  GAME_OVER: 'gameOver',
  LEVEL_COMPLETE: 'levelComplete'
};

// Game variables
let gameState = GameState.MENU;
let score = 0;
let level = 1;
let lives = 3;

// Player
const player = {
  x: 50,
  y: canvas.height - 100,
  width: 20,
  height: 30,
  velocityY: 0,
  velocityX: 0,
  jumping: false,
  jumpPower: 12,
  speed: 4
};

// Donkey Kong
const kong = {
  x: canvas.width - 80,
  y: 50,
  width: 40,
  height: 40,
  barrelThrowTimer: 0,
  barrelThrowInterval: 80
};

// Game objects
let barrels = [];
let platforms = [];
let goal = {};
let camera = { y: 0 };

// Gravity
const gravity = 0.6;

// Initialize platforms
function initializePlatforms() {
  platforms = [
    // Ground
    { x: 0, y: canvas.height - 50, width: canvas.width, height: 50 },
    // Level platforms
    { x: 100, y: canvas.height - 150, width: 500, height: 20 },
    { x: 50, y: canvas.height - 250, width: 500, height: 20 },
    { x: 100, y: canvas.height - 350, width: 500, height: 20 },
    { x: 0, y: canvas.height - 450, width: canvas.width, height: 20 }
  ];

  // Goal at the top
  goal = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 470,
    width: 60,
    height: 30
  };
}

// Reset level
function resetLevel() {
  player.x = 50;
  player.y = canvas.height - 100;
  player.velocityY = 0;
  player.velocityX = 0;
  player.jumping = false;
  barrels = [];
  kong.barrelThrowTimer = 0;
  gameState = GameState.PLAYING;
}

// Start new game
function startGame() {
  score = 0;
  level = 1;
  lives = 3;
  initializePlatforms();
  resetLevel();
}

// Update game
function update() {
  if (gameState === GameState.MENU) {
    return;
  }

  if (gameState === GameState.PLAYING) {
    // Update player
    player.velocityX = 0;
    if (keys.left) player.velocityX = -player.speed;
    if (keys.right) player.velocityX = player.speed;

    player.x += player.velocityX;
    player.velocityY += gravity;
    player.y += player.velocityY;

    // Constrain player to canvas width
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // Platform collision
    player.jumping = true;
    for (let platform of platforms) {
      if (
        player.velocityY >= 0 &&
        player.y + player.height <= platform.y + 10 &&
        player.y + player.height >= platform.y - 10 &&
        player.x + player.width > platform.x &&
        player.x < platform.x + platform.width
      ) {
        player.velocityY = 0;
        player.y = platform.y - player.height;
        player.jumping = false;
      }
    }

    // Jump
    if (keys.space && !player.jumping) {
      player.velocityY = -player.jumpPower;
      player.jumping = true;
    }

    // Fall off the map
    if (player.y > canvas.height) {
      lives--;
      if (lives <= 0) {
        gameState = GameState.GAME_OVER;
      } else {
        resetLevel();
      }
    }

    // Check goal
    if (
      player.x + player.width > goal.x &&
      player.x < goal.x + goal.width &&
      player.y + player.height > goal.y &&
      player.y < goal.y + goal.height
    ) {
      score += 5000;
      level++;
      kong.barrelThrowInterval = Math.max(40, 80 - level * 5);
      resetLevel();
    }

    // Throw barrels
    kong.barrelThrowTimer++;
    if (kong.barrelThrowTimer > kong.barrelThrowInterval) {
      barrels.push({
        x: kong.x + kong.width / 2,
        y: kong.y + kong.height,
        width: 20,
        height: 20,
        velocityX: -3 - level * 0.5,
        velocityY: 0,
        bounce: true
      });
      kong.barrelThrowTimer = 0;
    }

    // Update barrels
    for (let i = barrels.length - 1; i >= 0; i--) {
      let barrel = barrels[i];
      barrel.velocityY += gravity;
      barrel.x += barrel.velocityX;
      barrel.y += barrel.velocityY;

      // Platform collision
      let onPlatform = false;
      for (let platform of platforms) {
        if (
          barrel.velocityY >= 0 &&
          barrel.y + barrel.height <= platform.y + 10 &&
          barrel.y + barrel.height >= platform.y - 10 &&
          barrel.x + barrel.width > platform.x &&
          barrel.x < platform.x + platform.width
        ) {
          barrel.velocityY = -barrel.velocityY * 0.6;
          barrel.y = platform.y - barrel.height;
          onPlatform = true;

          // Barrel bounce left/right
          if (barrel.velocityX > 0) {
            barrel.velocityX = -2 - level * 0.3;
          } else {
            barrel.velocityX = 2 + level * 0.3;
          }
        }
      }

      // Wall collision
      if (barrel.x < 0 || barrel.x + barrel.width > canvas.width) {
        barrel.velocityX = -barrel.velocityX;
      }

      // Remove off-screen barrels
      if (barrel.y > canvas.height) {
        barrels.splice(i, 1);
        score += 100;
        continue;
      }

      // Check barrel collision with player
      if (
        player.x < barrel.x + barrel.width &&
        player.x + player.width > barrel.x &&
        player.y < barrel.y + barrel.height &&
        player.y + player.height > barrel.y
      ) {
        lives--;
        if (lives <= 0) {
          gameState = GameState.GAME_OVER;
        } else {
          resetLevel();
        }
      }
    }
  }
}

// Draw game
function draw() {
  // Clear canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState === GameState.MENU) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DONKEY KONG', canvas.width / 2, 100);
    ctx.font = '20px Arial';
    ctx.fillText('Escape the barrels!', canvas.width / 2, 150);
    ctx.fillText('Arrow keys to move, Space to jump', canvas.width / 2, 250);
    ctx.fillText('Reach the top to complete the level', canvas.width / 2, 280);
    ctx.font = 'bold 30px Arial';
    ctx.fillText('Press ENTER to Start', canvas.width / 2, 400);
    return;
  }

  if (gameState === GameState.GAME_OVER) {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '24px Arial';
    ctx.fillText('Final Score: ' + score, canvas.width / 2, canvas.height / 2 + 80);
    ctx.fillText('Press ENTER to return to menu', canvas.width / 2, canvas.height / 2 + 150);
    return;
  }

  // Draw platforms
  ctx.fillStyle = '#ff6600';
  for (let platform of platforms) {
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
  }

  // Draw goal
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(goal.x, goal.y, goal.width, goal.height);
  ctx.font = '14px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';
  ctx.fillText('GOAL', goal.x + goal.width / 2, goal.y + goal.height / 2 + 5);

  // Draw Donkey Kong
  ctx.fillStyle = '#cc6600';
  ctx.fillRect(kong.x, kong.y, kong.width, kong.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(kong.x + 8, kong.y + 8, 8, 8); // Left eye
  ctx.fillRect(kong.x + 24, kong.y + 8, 8, 8); // Right eye
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(kong.x + 5, kong.y + kong.height - 8, kong.width - 10, 8); // Mouth

  // Draw player
  ctx.fillStyle = '#ff0000';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#ffff00';
  ctx.fillRect(player.x + 3, player.y + 3, 6, 6); // Left eye
  ctx.fillRect(player.x + 11, player.y + 3, 6, 6); // Right eye
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x + 5, player.y + 12, 10, 3); // Mouth

  // Draw barrels
  ctx.fillStyle = '#8b4513';
  for (let barrel of barrels) {
    ctx.beginPath();
    ctx.arc(barrel.x + barrel.width / 2, barrel.y + barrel.height / 2, barrel.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw UI
  ctx.fillStyle = '#fff';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Score: ' + score, 10, 20);
  ctx.fillText('Level: ' + level, 10, 45);
  ctx.fillText('Lives: ' + lives, 10, 70);
}

// Input handling
const keys = {
  left: false,
  right: false,
  space: false
};

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
  if (e.key === ' ') {
    keys.space = true;
    e.preventDefault();
  }
  if (e.key === 'Enter') {
    if (gameState === GameState.MENU) {
      startGame();
    } else if (gameState === GameState.GAME_OVER) {
      gameState = GameState.MENU;
    }
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
  if (e.key === ' ') keys.space = false;
});

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
