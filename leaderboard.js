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
        leaderboard.push({ name: playerName, score: score });
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
        return score > leaderboard[leaderboard.length - 1].score;
    }

    clearLeaderboard(gameName) {
        this.leaderboards[gameName] = [];
        this.saveLeaderboards();
    }
}

// Global leaderboard manager
const leaderboardManager = new LeaderboardManager();

// Show leaderboard screen
function showLeaderboard(gameName, currentScore = null) {
    const leaderboard = leaderboardManager.getLeaderboard(gameName);
    
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
    document.getElementById('leaderboard-overlay').style.display = 'flex';
    
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
    document.getElementById('leaderboard-overlay').style.display = 'none';
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
