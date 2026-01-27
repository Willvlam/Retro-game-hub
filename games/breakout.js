class BreakoutGame {
    constructor() {
        this.canvas = document.getElementById('breakoutCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        this.lives = 3;
        
        // Paddle
        this.paddle = {
            x: this.canvas.width / 2 - 40,
            y: this.canvas.height - 20,
            width: 80,
            height: 10,
            speed: 6
        };
        
        // Ball
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 40,
            radius: 5,
            speedX: 3,
            speedY: -3
        };
        
        // Bricks
        this.bricks = [];
        this.createBricks();
        
        this.keys = {};
        this.setupEventListeners();
    }

    createBricks() {
        this.bricks = [];
        const rows = 5;
        const cols = 8;
        const brickWidth = this.canvas.width / cols;
        const brickHeight = 20;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: col * brickWidth,
                    y: row * brickHeight + 30,
                    width: brickWidth,
                    height: brickHeight,
                    active: true
                });
            }
        }
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
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
        this.lives = 3;
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 40;
        this.ball.speedX = 3;
        this.ball.speedY = -3;
        this.paddle.x = this.canvas.width / 2 - 40;
        this.createBricks();
        this.gameOver = false;
        this.updateScore();
    }

    updatePaddle() {
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.paddle.x = Math.max(0, this.paddle.x - this.paddle.speed);
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.paddle.x = Math.min(this.canvas.width - this.paddle.width, this.paddle.x + this.paddle.speed);
        }
    }

    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Wall collision
        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.speedX *= -1;
            this.ball.x = Math.max(this.ball.radius, Math.min(this.canvas.width - this.ball.radius, this.ball.x));
        }
        
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.speedY *= -1;
        }
        
        // Paddle collision
        if (this.checkBallPaddleCollision()) {
            this.ball.speedY *= -1;
            this.ball.y = this.paddle.y - this.ball.radius;
        }
        
        // Brick collision
        for (let brick of this.bricks) {
            if (brick.active && this.checkBallBrickCollision(brick)) {
                brick.active = false;
                this.ball.speedY *= -1;
                this.score += 10;
            }
        }
        
        // Ball out of bounds
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver = true;
                showLeaderboard('breakout', this.score);
            } else {
                this.resetBall();
            }
        }
        
        // Check win
        if (this.bricks.every(brick => !brick.active)) {
            this.score += 50;
            this.createBricks();
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 40;
        this.ball.speedX = 3;
        this.ball.speedY = -3;
    }

    checkBallPaddleCollision() {
        return this.ball.x > this.paddle.x &&
               this.ball.x < this.paddle.x + this.paddle.width &&
               this.ball.y + this.ball.radius >= this.paddle.y &&
               this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height;
    }

    checkBallBrickCollision(brick) {
        return this.ball.x > brick.x &&
               this.ball.x < brick.x + brick.width &&
               this.ball.y > brick.y &&
               this.ball.y < brick.y + brick.height;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw paddle
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // Draw ball
        this.ctx.fillStyle = '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw bricks
        for (let brick of this.bricks) {
            if (brick.active) {
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
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
        document.getElementById('breakout-score').textContent = this.score;
        document.getElementById('breakout-lives').textContent = this.lives;
    }

    gameLoop = () => {
        if (!this.gameRunning) return;
        
        if (!this.gameOver) {
            this.updatePaddle();
            this.updateBall();
        }
        
        this.draw();
        this.updateScore();
        
        requestAnimationFrame(this.gameLoop);
    }
}
