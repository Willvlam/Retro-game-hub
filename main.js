// Game management
let currentGame = 'home';
let gameInstances = {};

// Initialize games
function initGames() {
    gameInstances.asteroids = new AsteroidsGame();
    gameInstances.snake = new SnakeGame();
    gameInstances.pong = new PongGame();
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

// Initialize on load
window.addEventListener('load', () => {
    initGames();
});
