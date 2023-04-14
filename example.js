// References:
// Player and Zombie animations by Jesse Freeman: https://gumroad.com/l/z-art-free
// Female player animation by Zoe Bockasten: https://www.behance.net/zbocka
// Music from: http://ericskiff.com/music/

// Asset variables
let player1Frames = [];
let player2Frames = [];
let zombieFrames = []; 
let song;
let titleFont;
let scoreFont = "Arial";

// Game objects & variables
let player;
let zombies = [];
let score = 0;

// our game will have 3 possible 'states':
const INTRO = 0;
const RUN_GAME = 1;
const GAME_OVER = 2;

// we start in the INTRO state
let gameState = INTRO;

// ------------------------------------------------------------------
// Code placed in setup() will run once at the beginning
function setup() {
  // Create a new canvas to match the browser size
  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
}

// ------------------------------------------------------------------
// load all of our games' assets in global variables
function preload() {
  zombieFrames = loadFrames("zombie", 6);
  player1Frames = loadFrames("Mplayer", 9);
  player2Frames = loadFrames("Fplayer", 9);

  song = loadSound("assets/tune.mp3");
  titleFont = loadFont("assets/greenfuz.ttf");
}

// ------------------------------------------------------------------
// On window resize, update the canvas size
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ------------------------------------------------------------------
// This is a helper function that creats an array of p5.Image objects
// based on the prefix and number of frames in an animation sequence
// For example:
// Our zombie animation frames are called 'zombie-0.png', 'zombie-1.png'
// etc... There are 6 frames in the sequence.
// so to load them, we can use:
// loadFrames("zombie", 6);
// where "zombie" is the "prefix" (the name before the dash) and 6
// is the number of images to load!
function loadFrames(prefix, numFrames, extension = ".png") {
  let frames = [];
  for (let i = 0; i < numFrames; i++) {
    let file = prefix + "-" + i + extension;
    print("Loading " + file);
    // remember, using '+' with strings combines them!
    frames[i] = loadImage("assets/" + file);
  }
  return frames;
}

// ------------------------------------------------------------------
// Main render loop - code placed in draw() will repeat over and over
function draw() {
  // switch into different functions based on the value of gameState
  if (gameState == INTRO) intro();
  else if (gameState == RUN_GAME) runGame();
  else if (gameState == GAME_OVER) gameOver();
}

// ------------------------------------------------------------------
function intro() {
  background(0);

  fill("green");
  textFont(titleFont);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("ZOMBIE\nAPOCALYPSE", width / 2, height / 4);

  textFont(scoreFont);
  textSize(20);
  fill("white");
  text("PLAYER SELECT", width / 2, height / 2);

  image(player1Frames[0], width / 2 - 100, height * 0.75);
  image(player2Frames[0], width / 2 + 100, height * 0.75);
}

// ------------------------------------------------------------------
function runGame() {
  // Place your drawing code here
  background(0);
  imageMode(CENTER);

  player.display();
  player.move();
  player.animate();

  // for every Zombie object in the array 'zombies'
  zombies.forEach(function (dead) {
    dead.display();
    dead.move();
    dead.animate();

    if (collision(player, dead) == true) {
      // there was a collision! oh no! we're dead :(
      gameState = GAME_OVER;
    }
  });

  // increase the score
  score++;
  drawScore();

  // add a zombie if the score is a multiple of 200, using the modulo/remainder trick
  if (score % 200 == 0) {
    zombies.push(new Zombie());
  }
}

// ------------------------------------------------------------------
function gameOver() {
  background(0);

  // display a "frozen" version of the game (ie: just display, don't
  // animate!
  player.display();
  zombies.forEach(function (dead) {
    dead.display();
  });

  // draw a transparent black rectangle over top of everything
  fill(0, 128);
  rect(0, 0, width, height);

  drawScore();

  fill("red");
  textFont(titleFont);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 4);

  textFont(scoreFont);
  textSize(20);
  fill("white");
  text("CLICK TO TRY AGAIN", width / 2, height / 2);
}

// ------------------------------------------------------------------
function drawScore() {
  fill("green");
  textSize(32);
  textFont(scoreFont);
  textAlign(LEFT);
  text(score, 10, 25);
}

// ------------------------------------------------------------------
function mousePressed() {
  if (gameState == INTRO) {
    if (mouseX < width / 2) player = new Player(player1Frames);
    else player = new Player(player2Frames);
    gameState = RUN_GAME;
    if (song.isLoaded()) song.loop();
  }
  if (gameState == GAME_OVER) {
    gameState = RUN_GAME;
    score = 0; // reset the score
    zombies = []; // clear out the zombie array
  }
}

// ------------------------------------------------------------------
// collision detection function
// p -> player
// z -> zombie
function collision(p, z) {
  let distance = dist(p.x, p.y, z.x, z.y);
  if (distance > p.radius + z.radius) {
    return false;
  } else {
    return true;
  }
}

// ------------------------------------------------------------------
class Player {
  constructor(playerFrames) {
    this.x = 0;
    this.y = 0;
    this.flip = 1;
    this.radius = 25;
    this.animationIndex = 0;
    this.animationImages = playerFrames;
  }

  move() {
    this.x = mouseX;
    this.y = mouseY;
    if (pmouseX < mouseX) this.flip = 1; // we're moving right
    if (pmouseX > mouseX) this.flip = -1; // we're moving left
  }

  animate() {
    if (frameCount % 4 == 0) this.animationIndex++;
    if (this.animationIndex >= this.animationImages.length)
      this.animationIndex = 0;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.flip, 1);
    image(this.animationImages[this.animationIndex], 0, 0);
    pop();
  }
}

// ------------------------------------------------------------------
class Zombie {
  constructor() {
    this.speedX = random(-2, 2);
    this.speedY = random(-2, 2);

    this.flip = 1;
    this.radius = 25;
    this.animationIndex = 0;
    this.animationImages = zombieFrames;

    // Avoid spawning right on top of the player
    this.x = random(width);
    this.y = random(height);
    while (collision(player, this) == true) {
      this.x = random(width);
      this.y = random(height);
    }
  }

  move() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x < 0 || this.x > width) this.speedX *= -1;
    if (this.y < 0 || this.y > height) this.speedY *= -1;
    if (this.speedX > 0) this.flip = 1; // facing right
    if (this.speedX < 0) this.flip = -1; // facing left

    // 1% chance to randomly change direction
    if (random() < 0.01) {
      this.speedX = random(-2, 2);
      this.speedY = random(-2, 2);
    }
  }

  animate() {
    if (frameCount % 4 == 0) this.animationIndex++;
    if (this.animationIndex >= this.animationImages.length)
      this.animationIndex = 0;
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.flip, 1);
    image(this.animationImages[this.animationIndex], 0, 0);
    pop();
  }
}
