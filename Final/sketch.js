let myCircles = [];
let numOfCircles = 33;
let snowflakes = []; // Array to store snowflakes

let circlePositions = [
  [85,40],[85,85],[90,120],[114,130],[122,153],[120,183],[125,224],[150,248],[175,252],[198,247],
  [222,253],[247,250],[272,248],[280,218],[285,190],[289,158],[285,125],[300,120],[325,125],[350,134],
  [358,115],[180,165],[170,185],[190,183],[210,204],[230,185],[241,170],[210,230],
  [210,289],[200,340],[202,385],[208,410],[200,432]
];
let circleDiameters = [50, 43, 29, 27, 23, 40, 53, 28, 26, 20, 31, 22, 33, 35, 25, 44, 20, 15, 33, 22, 20, 16, 16, 26, 35, 22, 16, 20, 47, 61, 30, 23, 23];

const rez = 40;
let grid = [];
let balls = [];
let nBalls = 1000;
let offsetX, offsetY;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(91, 113, 129);

  // Offset to center the "apple tree" and its base
  offsetX = width / 2 - 210;
  offsetY = height / 2 - 250;

  for (let i = 0; i < numOfCircles; i++) {
    let x = circlePositions[i][0] + offsetX;
    let y = circlePositions[i][1] + offsetY;
    myCircles.push(new MyCircleClass(x, y, circleDiameters[i]));
  }

  for (let i = 0; i < nBalls; i++) {
    balls.push(new Ball(createVector(random(width), random(height))));
  }
}

function draw() {
  let spacing = min(width, height) / rez;
  noStroke();
  fill(91, 113, 129, 25);
  rect(0, 0, width, height);

  // Generate Perlin noise flow field for background animation
  for (let i = 0; i < rez; i++) {
    grid[i] = [];
    for (let j = 0; j < rez; j++) {
      let x = i * spacing - width / 2 + spacing / 2;
      let y = j * spacing - height / 2 + spacing / 2;
      let angle = map(noise(i / 10, j / 10, frameCount / 200), 0, 1, -TWO_PI, TWO_PI);
      grid[i][j] = createVector(x, y, angle);
    }
  }

  push();
  translate(width / 2, height / 2);
  for (let b of balls) {
    let x = floor(constrain(b.pos.x + width / 2, 0, width - 1) / spacing);
    let y = floor(constrain(b.pos.y + height / 2, 0, height - 1) / spacing);
    b.followField(grid[x][y].z);
    b.applyForce();
    b.update();
    b.edges();
    b.show();
  }
  pop();

  for (let circle of myCircles) {
    circle.draw();
  }

  drawForegroundShapes();
  createSnow();
  drawSnow();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(91, 113, 129);

  // Update offsets to re-center the "apple tree"
  offsetX = width / 2 - 210;
  offsetY = height / 2 - 250;

  // Reinitialize circles with updated positions
  myCircles = [];
  for (let i = 0; i < numOfCircles; i++) {
    let x = circlePositions[i][0] + offsetX;
    let y = circlePositions[i][1] + offsetY;
    myCircles.push(new MyCircleClass(x, y, circleDiameters[i]));
  }
}

class MyCircleClass {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color1 = color(228, 102, 103);
    this.color2 = color(142, 171, 126);
    this.fadeAlpha = 255;
    this.isHovered = false;
  }

  draw() {
    // Adjust stroke weight based on vertical position (y) for thicker outlines at the bottom
    let strokeWeightValue = map(this.y, offsetY, height, 1, 6);
    stroke(255);
    strokeWeight(strokeWeightValue);

    if (dist(mouseX, mouseY, this.x, this.y) < this.size / 2) {
      this.isHovered = true;
      this.fadeAlpha = 255;
    }

    if (this.isHovered) {
      fill(255, this.fadeAlpha);
      ellipse(this.x, this.y, this.size);
      this.fadeAlpha -= 5;
      if (this.fadeAlpha <= 0) {
        this.isHovered = false;
        this.fadeAlpha = 255;
      }
    } else {
      fill(this.color1);
      arc(this.x, this.y, this.size, this.size, HALF_PI, -HALF_PI, PIE);
      fill(this.color2);
      arc(this.x, this.y, this.size, this.size, -HALF_PI, HALF_PI, PIE);
    }
    noStroke(); // Disable stroke for other elements
  }
}

class Ball {
  constructor(pos) {
    this.pos = pos;
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
  }

  followField(angle) {
    let force = p5.Vector.fromAngle(angle);
    force.mult(0.5);
    this.applyForce(force);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  edges() {
    if (this.pos.x > width / 2) this.pos.x = -width / 2;
    if (this.pos.x < -width / 2) this.pos.x = width / 2;
    if (this.pos.y > height / 2) this.pos.y = -height / 2;
    if (this.pos.y < -height / 2) this.pos.y = height / 2;
  }

  show() {
    stroke(255, 100);
    strokeWeight(2);
    point(this.pos.x, this.pos.y);
  }
}

function drawForegroundShapes() {
  // Draw bottom green rectangle with a thick white outline
  stroke(255);
  strokeWeight(4); // Thick white outline
  fill(142, 171, 126);
  rect(27 + offsetX, 450 + offsetY, 345, 55);

  // Draw left and right vertical lines with thick white outline
  strokeWeight(4); // Thicker outline for vertical lines
  line(65 + offsetX, 450 + offsetY, 65 + offsetX, 505 + offsetY);
  line(340 + offsetX, 450 + offsetY, 340 + offsetX, 505 + offsetY);

  // Draw bottom yellow rectangle with a thick white outline
  strokeWeight(4); // Thick outline for the yellow rectangle
  fill(217, 194, 125);
  rect(92 + offsetX, 444 + offsetY, 204, 52);

  // Draw smaller red and green rectangles with thick white outline
  strokeWeight(4); // Thick outline for small rectangles
  fill(228, 102, 103);
  rect(130 + offsetX, 446 + offsetY, 35, 48);
  fill(142, 171, 126);
  rect(165 + offsetX, 446 + offsetY, 37, 48);
  rect(237 + offsetX, 446 + offsetY, 35, 48);

  // Remove stroke for other elements after drawing the base
  noStroke();
}

// Function to create snowflakes at the top
function createSnow() {
  let t = frameCount / 60;
  if (random() < 0.3) {
    snowflakes.push(new Snowflake(random(width), -10));
  }
}

// Function to display and update snowflakes
function drawSnow() {
  for (let flake of snowflakes) {
    flake.update();
    flake.show();
  }
}

class Snowflake {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, random(1, 3));
    this.acc = createVector();
    this.size = random(2, 5);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    if (this.pos.y > height) {
      this.pos.y = random(-10, 0);
      this.pos.x = random(width);
    }
  }

  show() {
    noStroke();
    fill(255, 200);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}