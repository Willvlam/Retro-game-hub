class SpaceInvadersGame {
    constructor() {
        this.canvas = document.getElementById('spaceInvadersCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        // Player
        this.player = {
            x: this.canvas.width / 2 - 20,
            y: this.canvas.height - 40,
            width: 40,
            height: 30,
            speed: 5
        };
        
        // Bullets
        this.bullets = [];
        this.bulletSpeed = 7;
        
        // Enemies
        this.enemies = [];
        this.enemySpeed = 1;
        this.enemyDirection = 1;
        this.spawnRate = 0.02;
        
        this.keys = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                this.shoot();
                e.preventDefault();
            }
            if (e.key === 'r' || e.key === 'R') {
                if (this.gameOver) {
                    this.resetGame();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
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
        this.player.x = this.canvas.width / 2 - 20;
        this.bullets = [];
        this.enemies = [];
        this.gameOver = false;
        this.updateScore();
    }

    shoot() {
        if (this.gameRunning && !this.gameOver) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10
            });
        }
    }

    updatePlayer() {
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bulletSpeed;
            
            if (this.bullets[i].y < 0) {
                this.bullets.splice(i, 1);
                continue;
            }
            
            // Check collision with enemies
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.bullets[i], this.enemies[j])) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += 10;
                    break;
                }
            }
        }
    }

    spawnEnemies() {
        if (Math.random() < this.spawnRate && this.enemies.length < 10) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30),
                y: 10,
                width: 30,
                height: 25
            });
        }
    }

    updateEnemies() {
        // Move enemies
        let hitEdge = false;
        for (let enemy of this.enemies) {
            enemy.x += this.enemySpeed * this.enemyDirection;
            
            if (enemy.x <= 0 || enemy.x + enemy.width >= this.canvas.width) {
                hitEdge = true;
            }
            
            // Check if enemy reached bottom
            if (enemy.y > this.canvas.height) {
                this.gameOver = true;
            }
        }
        
        // Move down and change direction if hit edge
        if (hitEdge) {
            this.enemyDirection *= -1;
            for (let enemy of this.enemies) {
                enemy.y += 30;
            }
        }
        
        // Move enemies down slowly
        if (Math.random() < 0.02) {
            for (let enemy of this.enemies) {
                enemy.y += 5;
            }
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Draw bullets
        this.ctx.fillStyle = '#ffff00';
        for (let bullet of this.bullets) {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        
        // Draw enemies
        this.ctx.fillStyle = '#ff0000';
        for (let enemy of this.enemies) {
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
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
        document.getElementById('spaceinvaders-score').textContent = this.score;
    }

    gameLoop = () => {
        if (!this.gameRunning) return;
        
        if (!this.gameOver) {
            this.updatePlayer();
            this.updateBullets();
            this.spawnEnemies();
            this.updateEnemies();
        }
        
        this.draw();
        this.updateScore();
        
        requestAnimationFrame(this.gameLoop);
    }
}
