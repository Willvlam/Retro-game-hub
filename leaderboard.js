// ─── FIREBASE INIT ────────────────────────────────────────────────────────────
const firebaseConfig = {
    apiKey:            "AIzaSyB6P-vmiaI6m3KXGlz9Ry-1Ox5iubdU0gQ",
    authDomain:        "messages-a3211.firebaseapp.com",
    projectId:         "messages-a3211",
    storageBucket:     "messages-a3211.firebasestorage.app",
    messagingSenderId: "1029521597397",
    appId:             "1:1029521597397:web:17126cd7146bd47813535c"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Firestore structure: leaderboards/{gameName} → { entries: [{name, score}, ...] }
const COLLECTION  = 'leaderboards';
const MAX_ENTRIES = 3;

// ─── LOCAL CACHE ──────────────────────────────────────────────────────────────
// Prevents flicker on repeat opens; always refreshed from Firestore on open.
let _cache = {};

// ─── LEADERBOARD MANAGER ──────────────────────────────────────────────────────
class LeaderboardManager {

    /** Returns cached entries for a game (sync — used for isHighScore check). */
    getLeaderboard(gameName) {
        return (_cache[gameName] || []).slice(0, MAX_ENTRIES);
    }

    /** Fetches a game's leaderboard fresh from Firestore and updates the cache. */
    async fetchLeaderboard(gameName) {
        try {
            const doc     = await db.collection(COLLECTION).doc(gameName).get();
            const entries = doc.exists ? (doc.data().entries || []) : [];
            _cache[gameName] = entries;
            return entries;
        } catch (err) {
            console.warn(`Firestore fetch failed for "${gameName}":`, err);
            return _cache[gameName] || [];
        }
    }

    /**
     * Adds a score using a Firestore transaction so concurrent writes never
     * corrupt the leaderboard. Re-sorts and trims to MAX_ENTRIES after insert.
     */
    async addScore(gameName, playerName, score) {
        const ref = db.collection(COLLECTION).doc(gameName);
        try {
            await db.runTransaction(async (tx) => {
                const doc     = await tx.get(ref);
                const entries = doc.exists ? (doc.data().entries || []) : [];

                entries.push({ name: playerName, score: Number(score) || 0 });
                entries.sort((a, b) => b.score - a.score);
                const trimmed = entries.slice(0, MAX_ENTRIES);

                tx.set(ref, { entries: trimmed });
                _cache[gameName] = trimmed;
            });
        } catch (err) {
            console.error('Firestore write failed:', err);
            // Optimistic local fallback so the player still sees their score
            const entries = (_cache[gameName] || []).slice();
            entries.push({ name: playerName, score: Number(score) || 0 });
            entries.sort((a, b) => b.score - a.score);
            _cache[gameName] = entries.slice(0, MAX_ENTRIES);
        }
    }

    /** Returns true if the score would appear in the top-N global list. */
    isHighScore(gameName, score) {
        const board = this.getLeaderboard(gameName);
        if (board.length < MAX_ENTRIES) return true;
        return Number(score) >= board[board.length - 1].score;
    }

    /** Wipes a game's leaderboard in Firestore. */
    async clearLeaderboard(gameName) {
        try {
            await db.collection(COLLECTION).doc(gameName).set({ entries: [] });
            _cache[gameName] = [];
        } catch (err) {
            console.error('Firestore clear failed:', err);
        }
    }
}

// Global instance used by all game files
const leaderboardManager = new LeaderboardManager();

// ─── OVERLAY STATE ────────────────────────────────────────────────────────────
let _leaderboardOriginalParent      = null;
let _leaderboardOriginalNextSibling = null;
let _leaderboardMovedToFullscreen   = false;

// ─── RENDER HELPER ────────────────────────────────────────────────────────────
function _renderTable(entries) {
    if (!entries || entries.length === 0) {
        return '<p style="padding: 20px;">NO HIGH SCORES YET</p>';
    }
    let html = '<table class="leaderboard-table">'
             + '<tr><th>RANK</th><th>NAME</th><th>SCORE</th></tr>';
    entries.forEach((entry, i) => {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
        html += `<tr>
                    <td>${medal}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score.toLocaleString()}</td>
                 </tr>`;
    });
    return html + '</table>';
}

// ─── SHOW LEADERBOARD ────────────────────────────────────────────────────────
async function showLeaderboard(gameName, currentScore = null) {
    const overlay     = document.getElementById('leaderboard-overlay');
    const contentEl   = document.getElementById('leaderboard-content');
    const nameSection = document.getElementById('name-input-section');

    // Heading
    document.getElementById('leaderboard-game-title').textContent =
        gameName.toUpperCase() + ' — GLOBAL';

    // Show loading state immediately so the overlay feels responsive
    contentEl.innerHTML       = '<p style="padding: 20px; color: #00ffff; animation: blink 1s infinite;">LOADING…</p>';
    nameSection.style.display = 'none';
    overlay.style.display     = 'flex';

    // If in fullscreen mode, move the overlay inside the fullscreen element
    // so it isn't clipped by the browser's fullscreen rendering layer.
    const fsElem = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsElem && overlay.parentElement !== fsElem) {
        _leaderboardOriginalParent      = overlay.parentElement;
        _leaderboardOriginalNextSibling = overlay.nextSibling;
        try {
            fsElem.appendChild(overlay);
            _leaderboardMovedToFullscreen = true;
            Object.assign(overlay.style, {
                position: 'absolute',
                top:      '0',
                left:     '0',
                width:    '100%',
                height:   '100%',
                zIndex:   '9999'
            });
        } catch (e) {
            console.warn('Could not move leaderboard into fullscreen element:', e);
        }
    }

    // Fetch fresh data from Firestore, then render
    const entries = await leaderboardManager.fetchLeaderboard(gameName);
    contentEl.innerHTML = _renderTable(entries);

    // ── High-score name entry ─────────────────────────────────────────────────
    if (currentScore !== null && leaderboardManager.isHighScore(gameName, currentScore)) {
        document.getElementById('current-score').textContent =
            'NEW HIGH SCORE: ' + Number(currentScore).toLocaleString();
        nameSection.style.display = 'block';

        const nameInput = document.getElementById('player-name-input');
        nameInput.value = '';
        nameInput.focus();

        // Clone the button each time to remove any stale event listeners
        const oldBtn  = document.getElementById('submit-name-btn');
        const freshBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(freshBtn, oldBtn);

        const doSubmit = async () => {
            let name = nameInput.value.toUpperCase().trim() || 'ANON';
            name = name.substring(0, 4).padEnd(4, ' ');

            freshBtn.textContent = 'SAVING…';
            freshBtn.disabled    = true;

            await leaderboardManager.addScore(gameName, name, currentScore);

            // Refresh the table with the newly updated data
            contentEl.innerHTML       = _renderTable(leaderboardManager.getLeaderboard(gameName));
            nameSection.style.display = 'none';
            freshBtn.textContent      = 'SUBMIT';
            freshBtn.disabled         = false;
        };

        freshBtn.addEventListener('click', doSubmit);
        nameInput.onkeypress = (e) => { if (e.key === 'Enter') doSubmit(); };
    }
}

// ─── HIDE LEADERBOARD ────────────────────────────────────────────────────────
function hideLeaderboard() {
    const overlay = document.getElementById('leaderboard-overlay');
    overlay.style.display = 'none';

    // Restore the overlay to its original DOM position if it was moved
    if (_leaderboardMovedToFullscreen) {
        try {
            if (_leaderboardOriginalParent) {
                _leaderboardOriginalParent.insertBefore(overlay, _leaderboardOriginalNextSibling);
            } else {
                document.body.appendChild(overlay);
            }
        } catch (e) {
            console.warn('Could not restore leaderboard overlay position:', e);
        }
        Object.assign(overlay.style, {
            position: '',
            top:      '',
            left:     '',
            width:    '',
            height:   '',
            zIndex:   ''
        });
        _leaderboardOriginalParent      = null;
        _leaderboardOriginalNextSibling = null;
        _leaderboardMovedToFullscreen   = false;
    }
}

// ─── TOGGLE LEADERBOARD ───────────────────────────────────────────────────────
function toggleLeaderboard(gameName) {
    const overlay = document.getElementById('leaderboard-overlay');
    if (overlay.style.display === 'flex') {
        hideLeaderboard();
    } else {
        showLeaderboard(gameName);
    }
}