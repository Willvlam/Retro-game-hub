// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.leaderboards = this.loadLeaderboards();
    }

    loadLeaderboards() {
        const saved = localStorage.getItem('gameLeaderboards');
        if (saved) {
            return JSON.parse(saved);
        }
        return {};
    }

    saveLeaderboards() {
        localStorage.setItem('gameLeaderboards', JSON.stringify(this.leaderboards));
    }

    getLeaderboard(gameName) {
        if (!this.leaderboards[gameName]) {
            this.leaderboards[gameName] = [];
        }
        return this.leaderboards[gameName];
    }

    addScore(gameName, playerName, score) {
        if (!this.leaderboards[gameName]) {
            this.leaderboards[gameName] = [];
        }

        const leaderboard = this.leaderboards[gameName];
        // Ensure score is a number
        const numericScore = Number(score) || 0;
        leaderboard.push({ name: playerName, score: numericScore });
        leaderboard.sort((a, b) => b.score - a.score);
        
        // Keep only top 3
        leaderboard.splice(3);
        
        this.saveLeaderboards();
    }

    isHighScore(gameName, score) {
        const leaderboard = this.getLeaderboard(gameName);
        if (leaderboard.length < 3) {
            return true;
        }
        // Allow equal scores to qualify (ties allowed)
        return Number(score) >= leaderboard[leaderboard.length - 1].score;
    }

    clearLeaderboard(gameName) {
        this.leaderboards[gameName] = [];
        this.saveLeaderboards();
    }
}

// Global leaderboard manager
const leaderboardManager = new LeaderboardManager();

// Track if overlay was moved into a fullscreen element so we can restore it
let _leaderboardOriginalParent = null;
let _leaderboardOriginalNextSibling = null;
let _leaderboardMovedToFullscreen = false;

// Show leaderboard screen
function showLeaderboard(gameName, currentScore = null) {
    const leaderboard = leaderboardManager.getLeaderboard(gameName);
    const overlay = document.getElementById('leaderboard-overlay');

    document.getElementById('leaderboard-game-title').textContent = gameName.toUpperCase();

    let html = '';
    if (leaderboard.length === 0) {
        html = '<p style="padding: 20px;">NO HIGH SCORES YET</p>';
    } else {
        html = '<table class="leaderboard-table">';
        html += '<tr><th>RANK</th><th>NAME</th><th>SCORE</th></tr>';

        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            html += `<tr><td>${i + 1}</td><td>${entry.name}</td><td>${entry.score}</td></tr>`;
        }

        html += '</table>';
    }

    document.getElementById('leaderboard-content').innerHTML = html;

    // If currently in fullscreen, move the overlay into the fullscreen element so it remains visible
    const fsElem = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fsElem && overlay.parentElement !== fsElem) {
        _leaderboardOriginalParent = overlay.parentElement;
        _leaderboardOriginalNextSibling = overlay.nextSibling;
        try {
            fsElem.appendChild(overlay);
            _leaderboardMovedToFullscreen = true;
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.zIndex = '9999';
        } catch (e) {
            // If append fails, fall back to showing overlay normally (may be hidden by fullscreen restrictions)
            console.warn('Could not move leaderboard overlay into fullscreen element:', e);
        }
    }

    overlay.style.display = 'flex';

    // Show name input if a current score is provided and it's a high score
    if (currentScore !== null && leaderboardManager.isHighScore(gameName, currentScore)) {
        document.getElementById('name-input-section').style.display = 'block';
        document.getElementById('current-score').textContent = 'HIGH SCORE: ' + currentScore;

        // Set up the submit button
        const submitBtn = document.getElementById('submit-name-btn');
        submitBtn.onclick = function() {
            const nameInput = document.getElementById('player-name-input');
            let name = nameInput.value.toUpperCase().trim();

            // Ensure exactly 4 letters
            if (name.length === 0) {
                name = 'AAA';
            }
            name = name.substring(0, 4).padEnd(4, ' ');

            leaderboardManager.addScore(gameName, name, currentScore);

            // Refresh leaderboard display
            showLeaderboard(gameName);

            // Clear input
            nameInput.value = '';
            document.getElementById('name-input-section').style.display = 'none';
        };

        // Allow Enter key to submit
        const nameInput = document.getElementById('player-name-input');
        nameInput.onkeypress = function(e) {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        };
        nameInput.focus();
    } else {
        document.getElementById('name-input-section').style.display = 'none';
    }
}

// Hide leaderboard screen
function hideLeaderboard() {
    const overlay = document.getElementById('leaderboard-overlay');
    overlay.style.display = 'none';

    // If we moved the overlay into a fullscreen element, move it back to its original parent
    if (_leaderboardMovedToFullscreen) {
        try {
            if (_leaderboardOriginalParent) {
                _leaderboardOriginalParent.insertBefore(overlay, _leaderboardOriginalNextSibling);
            } else {
                document.body.appendChild(overlay);
            }
        } catch (e) {
            console.warn('Could not restore leaderboard overlay to original parent:', e);
        }

        // Reset styles and flags
        overlay.style.position = '';
        overlay.style.top = '';
        overlay.style.left = '';
        overlay.style.width = '';
        overlay.style.height = '';
        overlay.style.zIndex = '';
        _leaderboardOriginalParent = null;
        _leaderboardOriginalNextSibling = null;
        _leaderboardMovedToFullscreen = false;
    }
}

// Toggle leaderboard for a game
function toggleLeaderboard(gameName) {
    const overlay = document.getElementById('leaderboard-overlay');
    if (overlay.style.display === 'flex') {
        hideLeaderboard();
    } else {
        showLeaderboard(gameName);
    }
}
