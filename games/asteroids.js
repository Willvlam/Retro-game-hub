class AsteroidsGame {
    constructor() {
        this.canvas = document.getElementById('asteroidsCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gameOver = false;
        this.level = 1;
        
        // Game objects
        this.ship = null;
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        
        // Input
        this.keys = {};
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                this.handleShoot();
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
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.gameRunning = true;
        this.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2);
        this.asteroids = [];
        this.bullets = [];
        this.particles = [];
        this.createAsteroids(5);
        this.updateUI();
    }

    createAsteroids(count, x = null, y = null, size = 3) {
        for (let i = 0; i < count; i++) {
            let ax = x !== null ? x + (Math.random() - 0.5) * 50 : Math.random() * this.canvas.width;
            let ay = y !== null ? y + (Math.random() - 0.5) * 50 : Math.random() * this.canvas.height;
            
            // Avoid spawning too close to ship
            if (x === null && y === null) {
                if (Math.abs(ax - this.ship.x) < 100 && Math.abs(ay - this.ship.y) < 100) {
                    ay = (ay < this.canvas.height / 2) ? this.canvas.height - 50 : 50;
                }
            }
            
            this.asteroids.push(new Asteroid(ax, ay, size));
        }
    }

    handleShoot() {
        if (this.gameRunning && !this.gameOver) {
            this.bullets.push(this.ship.shoot());
        }
    }

    updateUI() {
        document.getElementById('asteroids-score').textContent = this.score;
        document.getElementById('asteroids-lives').textContent = this.lives;
    }

    gameLoop = () => {
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    update() {
        if (this.gameOver) return;

        // Update ship
        this.ship.update(this.keys, this.canvas.width, this.canvas.height);

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].update();
            if (this.bullets[i].isOffScreen(this.canvas.width, this.canvas.height)) {
                this.bullets.splice(i, 1);
            }
        }

        // Update asteroids
        for (let i = 0; i < this.asteroids.length; i++) {
            this.asteroids[i].update(this.canvas.width, this.canvas.height);
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }

        // Bullet-asteroid collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.asteroids.length - 1; j >= 0; j--) {
                if (this.checkCollision(this.bullets[i], this.asteroids[j])) {
                    this.score += (4 - this.asteroids[j].size) * 100;
                    
                    // Create particles
                    for (let k = 0; k < 8; k++) {
                        this.particles.push(new Particle(
                            this.asteroids[j].x,
                            this.asteroids[j].y
                        ));
                    }

                    // Split asteroid or remove
                    if (this.asteroids[j].size > 1) {
                        this.createAsteroids(2, this.asteroids[j].x, this.asteroids[j].y, this.asteroids[j].size - 1);
                    }

                    this.asteroids.splice(j, 1);
                    this.bullets.splice(i, 1);
                    break;
                }
            }
        }

        // Ship-asteroid collision
        for (let i = 0; i < this.asteroids.length; i++) {
            if (this.checkCollision(this.ship, this.asteroids[i])) {
                this.lives--;
                this.updateUI();
                if (this.lives <= 0) {
                    this.gameOver = true;
                } else {
                    this.ship = new Ship(this.canvas.width / 2, this.canvas.height / 2);
                }
            }
        }

        // Level complete
        if (this.asteroids.length === 0 && !this.gameOver) {
            this.level++;
            this.createAsteroids(3 + this.level);
        }

        this.updateUI();
    }

    checkCollision(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < obj1.radius + obj2.radius;
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw ship
        this.ship.draw(this.ctx);

        // Draw bullets
        this.ctx.fillStyle = '#00ff00';
        for (let bullet of this.bullets) {
            bullet.draw(this.ctx);
        }

        // Draw asteroids
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 2;
        for (let asteroid of this.asteroids) {
            asteroid.draw(this.ctx);
        }

        // Draw particles
        for (let particle of this.particles) {
            particle.draw(this.ctx);
        }

        // Draw game over
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 40px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
            this.ctx.font = '20px Courier New';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            this.ctx.fillText('Press R to Restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
        }
    }
}

class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.velocity = { x: 0, y: 0 };
        this.radius = 15;
        this.speed = 5;
        this.rotationSpeed = 0.2;
        this.friction = 0.99;
    }

    update(keys, canvasWidth, canvasHeight) {
        // Rotation
        if (keys['arrowleft']) this.angle -= this.rotationSpeed;
        if (keys['arrowright']) this.angle += this.rotationSpeed;

        // Acceleration
        if (keys['arrowup']) {
            this.velocity.x += Math.cos(this.angle) * this.speed;
            this.velocity.y += Math.sin(this.angle) * this.speed;
        }

        // Apply friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Wrap around screen
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
    }

    shoot() {
        const speed = 7;
        return {
            x: this.x + Math.cos(this.angle) * 20,
            y: this.y + Math.sin(this.angle) * 20,
            vx: Math.cos(this.angle) * speed + this.velocity.x,
            vy: Math.sin(this.angle) * speed + this.velocity.y,
            radius: 2,
            update() {
                this.x += this.vx;
                this.y += this.vy;
            },
            isOffScreen(w, h) {
                return this.x < 0 || this.x > w || this.y < 0 || this.y > h;
            },
            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(-10, -10);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

class Asteroid {
    constructor(x, y, size = 3) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.radius = size * 8;
        this.vx = (Math.random() - 0.5) * 3;
        this.vy = (Math.random() - 0.5) * 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.points = this.generatePoints();
    }

    generatePoints() {
        const points = [];
        const count = 8 + this.size * 2;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = this.radius * (0.7 + Math.random() * 0.3);
            points.push({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance
            });
        }
        return points;
    }

    update(canvasWidth, canvasHeight) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Wrap around
        if (this.x < -this.radius) this.x = canvasWidth + this.radius;
        if (this.x > canvasWidth + this.radius) this.x = -this.radius;
        if (this.y < -this.radius) this.y = canvasHeight + this.radius;
        if (this.y > canvasHeight + this.radius) this.y = -this.radius;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 30;
        this.maxLife = 30;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(0, 255, 0, ${this.life / this.maxLife})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
    }
}
