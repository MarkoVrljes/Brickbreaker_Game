// References
// Inspiration: Blackberry Brickbreaker Phone Game
// Sounds: https://mixkit.co/free-sound-effects/game/?page=2
// Images: https://www.flaticon.com/search?type=icon&search-group=all&word=speed&license=&color=&shape=&current_section=&author_id=&pack_id=&family_id=&style_id=&choice=&type=

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
let powerUps = [];
let ball;
let paddle;

// Asset variables
let blockHit;
let paddleHit;
let powerUpSound;
let bgImage;


// our game will have 3 possible 'states':
const INTRO = 0;
const RUN_GAME = 1;
const GAME_OVER = 2;

// we start in the INTRO state
let gameState = INTRO;

/////////////////////////////////////////////////////////////////

// Code placed in setup() will run once at the beginning
function setup() {
  // Create a new canvas to match the browser size
  createCanvas(windowWidth, windowHeight/2);
  //imageMode(CENTER);
}

/////////////////////////////////////////////////////////////////

function preload() {
  // load all of our games' assets in global variables
  blockHit = loadSound("Assets/blockHit.mp3");
  paddleHit = loadSound("Assets/paddleHit.wav");
  powerUpSound = loadSound("Assets/powerUp.wav");
  song = loadSound("Assets/song.mp3");
  bgImage = loadImage("Assets/background.jpeg");
  paddleTexture = loadImage("Assets/paddle.png");

}

/////////////////////////////////////////////////////////////////

// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight / 2);
}

/////////////////////////////////////////////////////////////////

// Main render loop - code placed in draw() will repeat over and over
function draw() {
  // switch into different functions based on the value of gameState
  if (gameState == INTRO) intro();
  else if (gameState == RUN_GAME) runGame();
  else if (gameState == GAME_OVER) gameOver();
}

/////////////////////////////////////////////////////////////////

function intro() {
  background(BACKGROUND_COLOR);

  textSize(50);
  textAlign(CENTER, CENTER);
  fill(TEXT_COLOR);
  text("Brick Breaker", width / 2, height / 2 - 50);
  textSize(20);
  text(
    "USE THE MOUSE TO MOVE THE PADDLE TO HIT THE BALL AND DESTROY ALL BLOCKS",
    width / 2,
    height / 2 + 10
  );
  text("CLICK TO START", width / 2, height / 2 + 40);
}

/////////////////////////////////////////////////////////////////

function runGame() {

  background(BACKGROUND_COLOR);
  background(bgImage);
  
  // Draw the paddle
  paddle.show();
  paddle.move();

  // Draw the ball
  ball.show();
  ball.move();
  ball.checkCollision();

  // Draw the score and lives
  textSize(20);
  textAlign(CENTER, CENTER);
  fill(TEXT_COLOR);
  text("SCORE: " + score, 60, 30);
  text("LIVES: " + lives, width - 50, 30);

  // Check if the ball is still stuck to the paddle
 

  // Show the bricks and check collision with ball and other elements
  for (let i = 0; i < bricks.length; i++) {
    let brick = bricks[i];
    brick.show();
    brick.checkCollision(ball, i);
  }

  // Update and render power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    let power = powerUps[i];
    power.show();
    power.move();
    power.checkCollision(paddle, i);
  }

  // Check for level complete
  if (bricks.length == 0) {
    nextLevel();
  }

  // Check for game over
  if (lives <= 0) {
    gameState = GAME_OVER;
  }
  textSize(20);
textAlign(CENTER, CENTER);
fill(TEXT_COLOR);
text("LEVEL: " + level, width / 2, 30);
}

/////////////////////////////////////////////////////////////////

function gameOver() {
  background(BACKGROUND_COLOR);

  // draw a transparent black rectangle over top of everything
  fill(0, 128);
  rect(0, 0, width, height);

  // Draw the score and lives
  textSize(20);
  fill(TEXT_COLOR);
  text("SCORE: " + score, 60, 30);
  text("LIVES: " + lives, width - 80, 30);

  fill("red");
  textSize(60);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 4);

  textSize(20);
  fill("white");
  text("CLICK TO TRY AGAIN", width / 2, height / 2);
}

/////////////////////////////////////////////////////////////////

function mousePressed() {
  if (gameState == INTRO) {
    resetGame();
    gameState = RUN_GAME;
    //if (song.isLoaded()) song.loop();  // find a good song
  }
  if (gameState == GAME_OVER) {
    gameState = RUN_GAME;
    resetGame();
  }
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
      bricks.push(new Brick(x, y, brickWidth, brickHeight, color, 0));
    }
  }
}

/////////////////////////////////////////////////////////////////

function resetGame() {
  score = 0;
  lives = 3;
  level = 1;
  bricks = [];
  powerUps = [];
  ball = new Ball();
  paddle = new Paddle();
  createBricks();
  
}

/////////////////////////////////////////////////////////////////

function nextLevel() {
  level++;
  ball = new Ball();
  paddle = new Paddle();
  createBricks();
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
    if (
      mouseIsPressed &&
      mouseX > this.x &&
      mouseX < this.x + this.width &&
      mouseY > this.y &&
      mouseY < this.y + this.height
    ) {
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
    this.color = BALL_COLOR;
    this.xSpeed = random(-5, 5);
    this.ySpeed = -6;
    this.isAttached = true; // new variable to keep track of whether the ball is attached to the paddle
  }

  show() {
    fill(this.color);
    circle(this.x, this.y, this.radius * 2);
  }

  move() {
    // if user presses the paddle
    if (
      this.isAttached &&
      mouseIsPressed &&
      mouseX > paddle.x &&
      mouseX < paddle.x + paddle.width &&
      mouseY > paddle.y &&
      mouseY < paddle.y + paddle.height
    ) {
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
      this.x += (this.xSpeed * abs(this.ySpeed)) / 6;
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
      paddleHit.play();
    }
    // Check collision with walls
    if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
      this.reverseX();
    }
    if (this.y - this.radius <= 0) {
      this.reverseY();
    }
    if (this.y + this.radius >= height) {
      lives--;
      if (lives > 0) {
        this.isAttached = true;
      }
    }
  }

  reverseX() {
    this.xSpeed *= -1;
  }

  reverseY() {
    this.ySpeed *= -1;
  }
}

/////////////////////////////////////////////////////////////////

class Brick {
  constructor(x, y, w, h, c, d) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.color = c;
    this.damage = d; // new variable to keep track of the number of hits the block has taken
    if (Math.random() < 0.2) {
      // adjust the probability of a power-up appearing here
      this.hasPowerUp = true;
    } else {
      this.hasPowerUp = false;
    }
  }

  // Check collision with ball and bricks
  checkCollision(ball, blockNum) {
    if (
      ball.y - ball.radius < this.y + this.height &&
      ball.y + ball.radius > this.y &&
      ball.x + ball.radius > this.x &&
      ball.x - ball.radius < this.x + this.width
    ) {
      ball.reverseY(); // reverse ball y direction
      this.damage++; // increase brick damage
      //this.hasPowerUp = false; // remove power-up from brick
      blockHit.play();
      if (this.damage >= 2) {
        score += 10;
        bricks.splice(blockNum, 1); // remove brick if damage is 2 and add score
        if (this.hasPowerUp) {
          //let powerUp = new PowerUp(this.x + this.width / 2 - 10, this.y + this.height);
          let powerUp = new PowerUp(this.x, this.y);
          powerUps.push(powerUp); // if the brick has a power up, add it to the powerUps array
        }
      }
    }
  }

  show() {
    if (this.damage == 0) {
      fill(this.color);
      strokeWeight(2);
      rect(this.x, this.y, this.width, this.height);
    } else {
      // Draw a cracked Brick
      fill(this.color);
      strokeWeight(2);
      rect(this.x, this.y, this.width, this.height);
      rect(this.x, this.y, this.width / 2, this.height / 2);
      rect(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2,
        this.height / 2
      );
      rect(
        this.x + this.width / 4,
        this.y + this.height / 4,
        this.width / 2,
        this.height / 2
      );
      triangle(
        this.x,
        this.y,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.x,
        this.y + this.height
      );
      triangle(
        this.x + this.width,
        this.y,
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.x + this.width,
        this.y + this.height
      );
    }
  }
}

/////////////////////////////////////////////////////////////////

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 1.5;
    this.type = floor(random(0, 5));
    
   
    if (this.type == 0) {
      this.color1 = color(255, 0, 0);
      this.color2 = color(255, 255, 0);
    }
    else if (this.type == 1) {
      this.color1 = color(0, 255, 0);
      this.color2 = color(255, 255, 0);
    }
    else if (this.type == 2) {
      this.color1 = color(0, 0, 255);
      this.color2 = color(255, 255, 0);
    }
    else if (this.type == 3) {
      this.color1 = color(255, 165, 0);
      this.color2 = color(255, 255, 0);
    }
    else if (this.type == 4) {
      this.color1 = color(128, 0, 128);
      this.color2 = color(255, 255, 0);
    }
  }
  
  show() {
  // Calculate the current time in seconds and the speed factor
  let time = millis() / 1000;
  let speed = 5;
  

  let color1 = lerpColor(this.color1, this.color2, sin(time * 2 * speed) * 0.5 + 0.5);
  let color2 = lerpColor(this.color2, this.color1, sin(time * 2 * speed + PI) * 0.5 + 0.5);



  let x = this.x;
  let y = this.y;
  let r1 = this.width / 2;
  let r2 = this.height / 2;
  beginShape();
  for (let i = 0; i < 10; i++) {
    let angle = TWO_PI * i / 10 - HALF_PI;
    let radius = i % 2 == 0 ? r1 : r2;
    vertex(x + cos(angle) * radius, y + sin(angle) * radius);
  }
  endShape(CLOSE);

  
  let gradient = drawingContext.createRadialGradient(x, y, 0, x, y, r1);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  drawingContext.fillStyle = gradient;
  drawingContext.fill();
}






  move() {
    this.y += this.speed;
  }

  checkCollision(paddle, i) {
  
    if (
      this.y + this.height >= paddle.y &&
      this.x >= paddle.x &&
      this.x + this.width <= paddle.x + paddle.width
    ) {
      this.activate(paddle, this.type); // apply the power-up effect
      powerUps.splice(i, 1);
      powerUpSound.play(); // play a sound effect
      return true;
    }
  }

  activate(paddle, type) {
    if (type == 0) {
      // red power-up: increase paddle size
      paddle.width += 20;
    } else if (type == 1) {
      // green power-up: add extra life
      lives++;
    } else if (type == 2) {
      // blue power-up: decrease paddle size
      paddle.width -= 20;
    } else if (type == 3) {
      // orange power-up: increase ball speed
      ball.ySpeed *= 2;
    } else if (type == 4) {
      // purple power-up: fire ball
      ball.color = "red";
      ball.ySpeed *= 1.3;
      for (let i = 0; i < bricks.length; i++) {
        let brick = bricks[i];
        brick.damage = 2;
      }
    }
  }
}
