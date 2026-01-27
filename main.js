// Game management
let currentGame = 'home';
let gameInstances = {};

// Initialize games
function initGames() {
    gameInstances.asteroids = new AsteroidsGame();
    gameInstances.snake = new SnakeGame();
    gameInstances.pong = new PongGame();
    gameInstances.spaceinvaders = new SpaceInvadersGame();
    gameInstances.breakout = new BreakoutGame();
    gameInstances.pacman = new PacManGame();
}

// Switch between games
function switchGame(gameName) {
    // Stop current game if it's running
    if (gameInstances[currentGame]) {
        if (typeof gameInstances[currentGame].stop === 'function') {
            gameInstances[currentGame].stop();
        }
    }

    // Hide all screens
    document.querySelectorAll('.game-screen').forEach(screen => {
        screen.classList.remove('active');
    });

    // Hide all nav buttons active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected screen
    const gameScreen = document.getElementById(gameName);
    if (gameScreen) {
        gameScreen.classList.add('active');
    }

    // Set active button
    const activeBtn = document.querySelector(`[data-game="${gameName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Start new game if not home
    if (gameName !== 'home' && gameInstances[gameName]) {
        if (typeof gameInstances[gameName].start === 'function') {
            gameInstances[gameName].start();
        }
    }

    currentGame = gameName;
}

// Fullscreen functionality
function toggleFullscreen(gameScreenId) {
    const element = document.getElementById(gameScreenId);
    if (!element) return;

    const isFullscreen = document.fullscreenElement === element;
    
    if (isFullscreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    } else {
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
    }
}

// Event listeners
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchGame(e.target.dataset.game);
    });
});

document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchGame(e.target.dataset.game);
    });
});

document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const gameScreenId = e.target.dataset.gameScreen;
        toggleFullscreen(gameScreenId);
    });
});

// Initialize on load
window.addEventListener('load', () => {
    initGames();
});
