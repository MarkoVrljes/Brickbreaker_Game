// Styling variables
const BACKGROUND_COLOR = "#222222";
const PADDLE_COLOR = "#3399FF";
const BALL_COLOR = "#FFD700";
const BRICK_COLORS = ["#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9"];
const TEXT_COLOR = "#FFFFFF";
const GAME_OVER_COLOR = "#FFFFFF";

// Game variables
let score = 0;
let lives = 3;
let level = 1;
let bricks = [];
let ball;
let paddle;

function setup() {
  createCanvas(600, 400);
  resetGame();
}

function draw() {
  background(BACKGROUND_COLOR);

  // Draw the paddle
  paddle.show();
  paddle.move();

  // Draw the ball
  ball.show();
  ball.move();
  ball.checkCollision();

  // Draw the bricks
  for (let i = 0; i < bricks.length; i++) {
    bricks[i].show();
    if (ball.hits(bricks[i])) {
      bricks.splice(i, 1);
      score += 10;
      ball.reverseY();
    }
  }

  // Draw the score and lives
  textSize(20);
  fill(TEXT_COLOR);
  text("Score: " + score, 10, 30);
  text("Lives: " + lives, width - 80, 30);

  // Check for game over
  if (lives <= 0) {
    gameOver();
  }

  // Check for level complete
  if (bricks.length === 0) {
    nextLevel();
  }
}

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  bricks = [];
  ball = new Ball();
  paddle = new Paddle();
  createBricks();
}

function createBricks() {
  let rows = level + 2;
  let cols = 10;
  let brickWidth = width / cols;
  let brickHeight = 20;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let x = j * brickWidth;
      let y = i * brickHeight + 50;
      let color = BRICK_COLORS[i % BRICK_COLORS.length];
      bricks.push(new Brick(x, y, brickWidth, brickHeight, color));
    }
  }
}

function nextLevel() {
  level++;
  ball = new Ball();
  paddle = new Paddle();
  createBricks();
}

function gameOver() {
  textSize(50);
  textAlign(CENTER, CENTER);
  fill(GAME_OVER_COLOR);
  text("Game Over", width / 2, height / 2);
}

class Paddle {
  constructor() {
    this.width = 100;
    this.height = 20;
    this.x = (width - this.width) / 2;
    this.y = height - this.height - 10;
  }

  show() {
    fill(PADDLE_COLOR);
    rect(this.x, this.y, this.width, this.height);
  }

  move() {
    this.x = mouseX;
  }
  // move() {
  //   if (keyIsDown(LEFT_ARROW)) {
  //     this.x -= 10;
  //   } else if (keyIsDown(RIGHT_ARROW)) {
  //     this.x += 10;
  //   }
  //   this.x = constrain(this.x, 0, width - this.width);
  // }

  hits(ball) {
    return (
      ball.x > this.x &&
      ball.x < this.x + this.width &&
      ball.y > this.y &&
      ball.y < this.y + this.height
      );
}
}

class Ball {
constructor() {
this.radius = 10;
this.x = width / 2;
this.y = height / 2;
this.xSpeed = random(-5, 5);
this.ySpeed = -6;
}

show() {
fill(BALL_COLOR);
circle(this.x, this.y, this.radius * 2);
}

move() {
this.x += this.xSpeed;
this.y += this.ySpeed;
this.x = constrain(this.x, this.radius, width - this.radius);
this.y = constrain(this.y, this.radius, height - this.radius);
}

checkCollision() {
// Check collision with paddle
if (paddle.hits(this)) {
this.reverseY();
this.y = paddle.y - this.radius;
}
  // Check collision with walls
if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
  this.reverseX();
}
if (this.y - this.radius <= 0) {
  this.reverseY();
}

// Check collision with bottom wall (game over)
if (this.y + this.radius >= height) {
  lives--;
  this.reset();
}
}

hits(brick) {
let distance = dist(this.x, this.y, brick.x + brick.width / 2, brick.y + brick.height / 2);
if (distance < this.radius + sqrt(pow(brick.width, 2) + pow(brick.height, 2)) / 2) {
return true;
} else {
return false;
}
}

reverseX() {
this.xSpeed *= -1;
}

reverseY() {
this.ySpeed *= -1;
}

reset() {
this.x = width / 2;
this.y = height / 2;
this.xSpeed = random(-5, 5);
this.ySpeed = -6;
}
}

class Brick {
constructor(x, y, width, height, color) {
this.x = x;
this.y = y;
this.width = width;
this.height = height;
this.color = color;
}

show() {
fill(this.color);
rect(this.x, this.y, this.width, this.height);
}
}