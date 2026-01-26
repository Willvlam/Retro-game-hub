class PongGame {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score1 = 0;
        this.score2 = 0;
        this.gameRunning = false;
        this.gameStarted = false;
        
        this.paddleHeight = 80;
        this.paddleWidth = 10;
        
        this.player1 = {
            x: 10,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0,
            speed: 5
        };

        this.player2 = {
            x: this.canvas.width - 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            dy: 0,
            speed: 5
        };

        this.ball = null;
        this.keys = {};
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                if (!this.gameStarted) {
                    this.startGame();
                }
                e.preventDefault();
            }
            if (e.key === 'r' || e.key === 'R') {
                if (!this.gameRunning) {
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
        this.gameLoop();
    }

    stop() {
        this.gameRunning = false;
    }

    resetGame() {
        this.score1 = 0;
        this.score2 = 0;
        this.gameStarted = false;
        this.gameRunning = true;
        this.player1.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.player2.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 5,
            vx: 0,
            vy: 0,
            speed: 4
        };
        this.updateUI();
    }

    startGame() {
        this.gameStarted = true;
        const angle = (Math.random() - 0.5) * Math.PI / 4;
        const speed = this.ball.speed;
        this.ball.vx = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.vy = Math.sin(angle) * speed;
    }

    updateUI() {
        document.getElementById('pong-score1').textContent = this.score1;
        document.getElementById('pong-score2').textContent = this.score2;
    }

    gameLoop = () => {
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    update() {
        if (!this.gameStarted) return;

        // Player input
        if (this.keys['w']) {
            this.player1.y = Math.max(0, this.player1.y - this.player1.speed);
        }
        if (this.keys['s']) {
            this.player1.y = Math.min(this.canvas.height - this.player1.height, this.player1.y + this.player1.speed);
        }
        if (this.keys['arrowup']) {
            this.player2.y = Math.max(0, this.player2.y - this.player2.speed);
        }
        if (this.keys['arrowdown']) {
            this.player2.y = Math.min(this.canvas.height - this.player2.height, this.player2.y + this.player2.speed);
        }

        // Ball movement
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Ball-wall collision
        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.vy *= -1;
            this.ball.y = Math.max(this.ball.radius, Math.min(this.canvas.height - this.ball.radius, this.ball.y));
        }

        // Ball-paddle collision
        this.checkPaddleCollision(this.player1);
        this.checkPaddleCollision(this.player2);

        // Scoring
        if (this.ball.x - this.ball.radius < 0) {
            this.score2++;
            this.resetBall();
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.score1++;
            this.resetBall();
        }

        this.updateUI();
    }

    checkPaddleCollision(paddle) {
        if (this.ball.x - this.ball.radius < paddle.x + paddle.width &&
            this.ball.x + this.ball.radius > paddle.x &&
            this.ball.y < paddle.y + paddle.height &&
            this.ball.y + this.ball.radius > paddle.y) {
            
            // Bounce
            if (this.ball.vx > 0) {
                this.ball.vx = Math.abs(this.ball.vx);
            } else {
                this.ball.vx = -Math.abs(this.ball.vx);
            }
            this.ball.vx *= -1.02; // Slight speed increase
            
            // Add spin based on paddle position
            const paddleCenter = paddle.y + paddle.height / 2;
            const hitPos = (this.ball.y - paddleCenter) / (paddle.height / 2);
            this.ball.vy = hitPos * this.ball.speed;
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.gameStarted = false;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw center line
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw paddles
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(this.player1.x, this.player1.y, this.player1.width, this.player1.height);
        this.ctx.fillRect(this.player2.x, this.player2.y, this.player2.width, this.player2.height);

        // Draw ball
        this.ctx.fillStyle = '#00ffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw start instruction
        if (!this.gameStarted) {
            this.ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            this.ctx.font = '20px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press SPACE to Start', this.canvas.width / 2, 40);
        }
    }
}
