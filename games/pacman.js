class PacManGame {
    constructor() {
        this.canvas = document.getElementById('pacmanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        // Pac-Man
        this.pacman = {
            gridX: 1,
            gridY: 1,
            direction: { x: 1, y: 0 },
            nextDirection: { x: 1, y: 0 }
        };
        
        // Ghosts
        this.ghosts = [
            { gridX: 5, gridY: 5, color: '#ff0000', dirX: 1, dirY: 0 },
            { gridX: 6, gridY: 5, color: '#ffb6de', dirX: -1, dirY: 0 },
            { gridX: 7, gridY: 5, color: '#00ffff', dirX: 1, dirY: 0 }
        ];
        
        // Maze
        this.mazeWidth = Math.floor(this.canvas.width / this.gridSize);
        this.mazeHeight = Math.floor(this.canvas.height / this.gridSize);
        this.pellets = [];
        this.createPellets();
        
        this.moveCounter = 0;
        this.keys = {};
        this.setupEventListeners();
    }

    createPellets() {
        this.pellets = [];
        for (let x = 0; x < this.mazeWidth; x++) {
            for (let y = 0; y < this.mazeHeight; y++) {
                // Don't place pellets in spawn areas
                if (!((x < 2 && y < 2) || (x > this.mazeWidth - 3 && y < 2))) {
                    this.pellets.push({ gridX: x, gridY: y });
                }
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'ArrowUp') {
                this.pacman.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
            }
            if (e.key === 'ArrowDown') {
                this.pacman.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft') {
                this.pacman.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
            }
            if (e.key === 'ArrowRight') {
                this.pacman.nextDirection = { x: 1, y: 0 };
                e.preventDefault();
            }
            if (e.key === 'r' || e.key === 'R') {
                if (this.gameOver) {
                    this.resetGame();
                }
            }
        });
    }

    start() {
        this.resetGame();
        this.gameRunning = true;
        this.gameOver = false;
        this.gameLoop();
    }

    stop() {
        this.gameRunning = false;
    }

    resetGame() {
        this.score = 0;
        this.pacman = {
            gridX: 1,
            gridY: 1,
            direction: { x: 1, y: 0 },
            nextDirection: { x: 1, y: 0 }
        };
        this.createPellets();
        this.gameOver = false;
        this.updateScore();
    }

    updatePacMan() {
        let newX = this.pacman.gridX + this.pacman.nextDirection.x;
        let newY = this.pacman.gridY + this.pacman.nextDirection.y;
        
        // Check bounds with wrapping
        if (newX < 0) newX = this.mazeWidth - 1;
        if (newX >= this.mazeWidth) newX = 0;
        if (newY < 0) newY = this.mazeHeight - 1;
        if (newY >= this.mazeHeight) newY = 0;
        
        this.pacman.gridX = newX;
        this.pacman.gridY = newY;
        this.pacman.direction = this.pacman.nextDirection;
        
        // Check pellet collision
        this.pellets = this.pellets.filter(pellet => {
            if (pellet.gridX === this.pacman.gridX && pellet.gridY === this.pacman.gridY) {
                this.score += 10;
                return false;
            }
            return true;
        });
        
        // Check win condition
        if (this.pellets.length === 0) {
            this.createPellets();
            this.score += 50;
        }
    }

    updateGhosts() {
        for (let ghost of this.ghosts) {
            // Simple AI: try to move towards Pac-Man with some randomness
            let dx = Math.sign(this.pacman.gridX - ghost.gridX);
            let dy = Math.sign(this.pacman.gridY - ghost.gridY);
            
            if (Math.random() < 0.1) {
                // Random direction change occasionally
                let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
                let dir = dirs[Math.floor(Math.random() * dirs.length)];
                ghost.dirX = dir[0];
                ghost.dirY = dir[1];
            } else if (Math.random() < 0.7) {
                // Chase Pac-Man
                if (Math.abs(dx) > Math.abs(dy)) {
                    ghost.dirX = dx;
                    ghost.dirY = 0;
                } else {
                    ghost.dirX = 0;
                    ghost.dirY = dy;
                }
            }
            
            ghost.gridX += ghost.dirX;
            ghost.gridY += ghost.dirY;
            
            // Wrap around
            if (ghost.gridX < 0) ghost.gridX = this.mazeWidth - 1;
            if (ghost.gridX >= this.mazeWidth) ghost.gridX = 0;
            if (ghost.gridY < 0) ghost.gridY = this.mazeHeight - 1;
            if (ghost.gridY >= this.mazeHeight) ghost.gridY = 0;
            
            // Check collision with Pac-Man
            if (ghost.gridX === this.pacman.gridX && ghost.gridY === this.pacman.gridY) {
                this.gameOver = true;
            }
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw pellets
        this.ctx.fillStyle = '#ffb8ae';
        for (let pellet of this.pellets) {
            this.ctx.fillRect(
                pellet.gridX * this.gridSize + 8,
                pellet.gridY * this.gridSize + 8,
                4, 4
            );
        }
        
        // Draw Pac-Man
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        let mouthAngle = (Math.sin(Date.now() / 200) * 0.2) + 0.2;
        this.ctx.arc(
            this.pacman.gridX * this.gridSize + 10,
            this.pacman.gridY * this.gridSize + 10,
            8,
            mouthAngle,
            Math.PI * 2 - mouthAngle
        );
        this.ctx.lineTo(this.pacman.gridX * this.gridSize + 10, this.pacman.gridY * this.gridSize + 10);
        this.ctx.fill();
        
        // Draw ghosts
        for (let ghost of this.ghosts) {
            this.ctx.fillStyle = ghost.color;
            this.ctx.fillRect(
                ghost.gridX * this.gridSize + 2,
                ghost.gridY * this.gridSize + 2,
                16, 16
            );
        }
        
        // Draw game over message
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '16px Arial';
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }

    updateScore() {
        document.getElementById('pacman-score').textContent = this.score;
    }

    gameLoop = () => {
        if (!this.gameRunning) return;
        
        if (!this.gameOver) {
            this.moveCounter++;
            if (this.moveCounter % 8 === 0) {
                this.updatePacMan();
            }
            if (this.moveCounter % 6 === 0) {
                this.updateGhosts();
            }
        }
        
        this.draw();
        this.updateScore();
        
        requestAnimationFrame(this.gameLoop);
    }
}
