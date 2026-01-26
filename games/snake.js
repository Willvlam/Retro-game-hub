class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snakeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.score = 0;
        this.gameRunning = false;
        this.gameOver = false;
        
        this.snake = [];
        this.food = {};
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.keys = {};
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === 'ArrowUp' && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
            }
            if (e.key === 'ArrowDown' && this.direction.y === 0) {
                this.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' && this.direction.x === 0) {
                this.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' && this.direction.x === 0) {
                this.nextDirection = { x: 1, y: 0 };
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
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameOver = false;
        this.gameRunning = true;
        this.spawnFood();
        this.updateUI();
    }

    spawnFood() {
        let validPosition = false;
        while (!validPosition) {
            this.food = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
            validPosition = !this.snake.some(s => s.x === this.food.x && s.y === this.food.y);
        }
    }

    updateUI() {
        document.getElementById('snake-score').textContent = this.score;
    }

    gameLoop = () => {
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            setTimeout(this.gameLoop, 100);
        }
    }

    update() {
        if (this.gameOver) return;

        this.direction = this.nextDirection;

        // Move snake
        const head = this.snake[0];
        const newHead = {
            x: head.x + this.direction.x,
            y: head.y + this.direction.y
        };

        // Check wall collision
        if (newHead.x < 0 || newHead.x >= this.canvas.width / this.gridSize ||
            newHead.y < 0 || newHead.y >= this.canvas.height / this.gridSize) {
            this.gameOver = true;
            return;
        }

        // Check self collision
        if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(newHead);

        // Check food collision
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            this.spawnFood();
        } else {
            this.snake.pop();
        }

        this.updateUI();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.ctx.fillStyle = '#00ff00';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            if (i === 0) {
                this.ctx.fillStyle = '#00ffff';
                this.ctx.fillRect(
                    segment.x * this.gridSize + 1,
                    segment.y * this.gridSize + 1,
                    this.gridSize - 2,
                    this.gridSize - 2
                );
                this.ctx.fillStyle = '#00ff00';
            }
        }

        // Draw food
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4
        );

        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }

        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 30px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.font = '16px Courier New';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 15);
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
        }
    }
}
