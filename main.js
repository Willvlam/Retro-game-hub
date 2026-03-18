// ─── GAME MANAGEMENT ─────────────────────────────────────────────────────────
let currentGame  = 'home';
let gameInstances = {};

// ─── INIT ─────────────────────────────────────────────────────────────────────
function initGames() {
    gameInstances.asteroids    = new AsteroidsGame();
    gameInstances.snake        = new SnakeGame();
    gameInstances.pong         = new PongGame();
    gameInstances.spaceinvaders = new SpaceInvadersGame();
    gameInstances.breakout     = new BreakoutGame();
    gameInstances.pacman       = new PacManGame();
    // Donkey Kong uses its own canvas id ("gameCanvas") so no instance wrapper needed
    // — add one here if your DK implementation exposes a class
}

// ─── SWITCH GAME ──────────────────────────────────────────────────────────────
function switchGame(gameName) {
    // Stop the currently running game if it supports stopping
    if (gameInstances[currentGame]) {
        if (typeof gameInstances[currentGame].stop === 'function') {
            gameInstances[currentGame].stop();
        }
    }

    // Deactivate all screens and nav buttons
    document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    // Activate the chosen screen
    const gameScreen = document.getElementById(gameName);
    if (gameScreen) gameScreen.classList.add('active');

    // Activate the matching nav button (there may be more than one, e.g. home cards)
    document.querySelectorAll(`[data-game="${gameName}"]`).forEach(btn => {
        if (btn.classList.contains('nav-btn')) btn.classList.add('active');
    });

    // Start the new game if it isn't the home screen
    if (gameName !== 'home' && gameInstances[gameName]) {
        if (typeof gameInstances[gameName].start === 'function') {
            gameInstances[gameName].start();
        }
    }

    currentGame = gameName;
}

// ─── FULLSCREEN ───────────────────────────────────────────────────────────────
function toggleFullscreen(gameScreenId) {
    const element = document.getElementById(gameScreenId);
    if (!element) return;

    const isFullscreen =
        document.fullscreenElement         === element ||
        document.webkitFullscreenElement   === element ||
        document.mozFullScreenElement      === element ||
        document.msFullscreenElement       === element;

    if (isFullscreen) {
        (document.exitFullscreen            ||
         document.webkitExitFullscreen      ||
         document.mozCancelFullScreen       ||
         document.msExitFullscreen).call(document);
    } else {
        const requestFS =
            element.requestFullscreen            ||
            element.webkitRequestFullscreen      ||
            element.mozRequestFullScreen         ||
            element.msRequestFullscreen;

        if (requestFS) {
            requestFS.call(element).catch(err => {
                console.error(`Fullscreen request failed: ${err.message}`);
            });
        }
    }
}

// ─── FULLSCREEN CHANGE: update button icon ────────────────────────────────────
document.addEventListener('fullscreenchange',       _onFullscreenChange);
document.addEventListener('webkitfullscreenchange', _onFullscreenChange);
document.addEventListener('mozfullscreenchange',    _onFullscreenChange);
document.addEventListener('MSFullscreenChange',     _onFullscreenChange);

function _onFullscreenChange() {
    const isFullscreen = !!(
        document.fullscreenElement         ||
        document.webkitFullscreenElement   ||
        document.mozFullScreenElement      ||
        document.msFullscreenElement
    );
    document.querySelectorAll('.fullscreen-btn').forEach(btn => {
        btn.textContent = isFullscreen ? '✕' : '⛶';
        btn.title       = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    });
}

// ─── CLOSE LEADERBOARD ON OVERLAY CLICK ──────────────────────────────────────
document.getElementById('leaderboard-overlay').addEventListener('click', function (e) {
    // Close when clicking the dark backdrop (not the panel itself)
    if (e.target === this) hideLeaderboard();
});

// ─── EVENT LISTENERS ─────────────────────────────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => switchGame(e.currentTarget.dataset.game));
});

document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => switchGame(e.currentTarget.dataset.game));
});

document.querySelectorAll('.fullscreen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen(e.currentTarget.dataset.gameScreen);
    });
});

// ─── KEYBOARD: ESC closes leaderboard ────────────────────────────────────────
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const overlay = document.getElementById('leaderboard-overlay');
        if (overlay.style.display === 'flex') hideLeaderboard();
    }
});

// ─── BOOT ─────────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
    initGames();
});
