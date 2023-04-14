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
/////////////////////////////////////////////////////////////////
function setup() {
  createCanvas(windowWidth,windowHeight/2);
  resetGame();
}
/////////////////////////////////////////////////////////////////
function preload() {
  blockHit = loadSound("Assets/blockHit.mp3");
  paddleHit = loadSound("Assets/paddleHit.wav");
  powerUp = loadSound("Assets/powerUp.wav");

}
/////////////////////////////////////////////////////////////////
function draw() {
  background(BACKGROUND_COLOR);

  // Draw the paddle
  paddle.show();
  paddle.move();

  // Draw the ball
  ball.show();
  ball.move();
  ball.checkCollision();

  // // Draw the bricks
  // for (let i = 0; i < bricks.length; i++) {
  //   bricks[i].show();
  //   if (ball.hits(bricks[i])) {
  //     bricks.splice(i, 1);
  //     score += 10;
  //     ball.reverseY();
  //   }
  // }

  for (let i = 0; i < bricks.length; i++) {
    bricks[i].show();
    if (ball.hits(bricks[i])) {
      blockHit.play();
      bricks[i].hits++;
      ball.reverseY();
      if (bricks[i].hits >= 2) {
        bricks.splice(i, 1);
        score += 10;
      }
    }

  }


  // Draw the score and lives
  textSize(20);
  fill(TEXT_COLOR);
  text("Score: " + score, 10, 30);
  text("Lives: " + lives, width - 80, 30);
  text("Press the paddle to release ball", width/2 - 140, 30);

  // Check for game over
  if (lives <= 0) {
    gameOver();
  }

  // Check for level complete
  if (bricks.length === 0) {
    nextLevel();
  }
}
/////////////////////////////////////////////////////////////////
// function intro() {
//   background(BACKGROUND_COLOR);
//   textSize(50);
//   textAlign(CENTER, CENTER);
//   fill(TEXT_COLOR);
//   text("Brick Breaker", width / 2, height / 2 - 50);
//   textSize(20);
//   text("Use the mouse to move the paddle and click on the paddle to release the ball.", width / 2, height / 2 + 10);
// }
/////////////////////////////////////////////////////////////////
function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  bricks = [];
  ball = new Ball();
  paddle = new Paddle();
  createBricks();
}
/////////////////////////////////////////////////////////////////
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
      bricks[bricks.length-1].hits = 0;
    }
  }
}
/////////////////////////////////////////////////////////////////
function nextLevel() {
  level++;
  ball = new Ball();
  paddle = new Paddle();
  createBricks();
}
/////////////////////////////////////////////////////////////////
function gameOver() {
  textSize(50);
  textAlign(CENTER, CENTER);
  fill(GAME_OVER_COLOR);
  text("Game Over", width / 2, height / 2);
}
/////////////////////////////////////////////////////////////////
class Paddle {
  constructor() {
    this.width = 100;
    this.height = 20;
    this.x = (width - this.width) / 2;
    this.y = height - this.height - 10;
    this.isDragging = false; // new variable to keep track of whether the user is dragging the paddle
  }

  show() {
    fill(PADDLE_COLOR);
    rect(this.x, this.y, this.width, this.height);
  }

  move() {
    if (mouseIsPressed && mouseX > this.x && mouseX < this.x + this.width && mouseY > this.y && mouseY < this.y + this.height) {
      this.isDragging = true;
      this.x = mouseX - this.width / 2;
    }
    if (this.isDragging) {
      this.x = mouseX - this.width / 2;
    }
    this.x = constrain(this.x, 0, width - this.width);
  }

  hits(ball) {
    return (
      ball.x > this.x &&
      ball.x < this.x + this.width &&
      ball.y > this.y &&
      ball.y < this.y + this.height
    );
  }
}
/////////////////////////////////////////////////////////////////
class Ball {
  constructor() {
    this.radius = 10;
    this.x = width / 2;
    this.y = height / 2;
    this.xSpeed = random(-5, 5);
    this.ySpeed = -6;
    this.isAttached = true; // new variable to keep track of whether the ball is attached to the paddle
  }

  show() {
    fill(BALL_COLOR);
    circle(this.x, this.y, this.radius * 2);
  }

  move() {
    if (this.isAttached && mouseIsPressed && mouseX > paddle.x && mouseX < paddle.x + paddle.width && mouseY > paddle.y && mouseY < paddle.y + paddle.height) {
      // release the ball from the paddle
      this.isAttached = false;
      this.ySpeed = -6;
      this.xSpeed = random(-5, 5);
    }

    if (this.isAttached) {
      // move the ball with the paddle
      this.x = paddle.x + paddle.width / 2;
      this.y = paddle.y - this.radius;
    } else {
      // move the ball normally
      this.x += this.xSpeed * abs(this.ySpeed) / 6;
      this.y += this.ySpeed;
      this.x = constrain(this.x, this.radius, width - this.radius);
      this.y = constrain(this.y, this.radius, height - this.radius);
    }
  }

  checkCollision() {
    // Check collision with paddle
    if (paddle.hits(this)) {
      this.reverseY();
      this.y = paddle.y - this.radius;
      // Updates x direction of ball based on where it hits the paddle
      let distance = this.x - (paddle.x + paddle.width / 2);
      let normalizedDistance = distance / (paddle.width / 2);
      this.xSpeed = normalizedDistance * 5;
    }
    // Check collision with walls
    if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
      this.reverseX();
    }
    if (this.y - this.radius <= 0) {
      this.reverseY();
    }
    if (this.y + this.radius >= height) {
      this.die();
    }
  }

  die() {
    lives--;
    if (lives > 0) {
      this.isAttached = true;
    } else {
      gameOver();
    }
  }

  reverseX() {
    this.xSpeed *= -1;
  }

  reverseY() {
    this.ySpeed *= -1;
  }

  hits(brick) {
    let distance = dist(this.x, this.y, brick.x + brick.width / 2, brick.y + brick.height / 2);
    return distance < this.radius + brick.width / 2;
  }
}
/////////////////////////////////////////////////////////////////
class Brick {
  constructor(x, y, w, h, c) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = c;
    this.hits = 0; // new variable to keep track of the number of hits the block has taken
  }
  
  show() {
    if (this.hits === 0) {
      fill(this.color);
      rect(this.x, this.y, this.width, this.height);
    } 
    else {
      // Draw a cracked Brick
      fill(this.color);
      strokeWeight(2);
      rect(this.x, this.y, this.width, this.height);
      rect(this.x, this.y, this.width/2, this.height/2);
      rect(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2);
      rect(this.x + this.width/4, this.y + this.height/4, this.width/2, this.height/2);
      triangle(this.x, this.y, this.x + this.width/2, this.y + this.height/2, this.x, this.y + this.height);
      triangle(this.x + this.width, this.y, this.x + this.width/2, this.y + this.height/2, this.x + this.width, this.y + this.height);
     }
  }

}