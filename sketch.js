class FiguraOjos {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
  }

  show() {
    fill(255);
    circle(this.x - this.size * 0.5, this.y, this.size);
    fill(0);
    circle(this.x - this.size * 0.3, this.y - this.size * 0.15, this.size * 0.33);

    fill(255);
    circle(this.x + this.size * 0.5, this.y, this.size);
    fill(0);
    circle(this.x + this.size * 0.7, this.y - this.size * 0.15, this.size * 0.33);
  }
}

class Fruit {
  constructor(x, y, size, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = speed;
    this.color = color(random(220, 255), random(100, 190), random(40, 80));
  }

  update() {
    this.y += this.speed;
  }

  show() {
    fill(this.color);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
    fill(50, 120, 20);
    rect(this.x - 4, this.y - this.size * 0.6, 8, this.size * 0.3, 4);
  }

  isOffscreen() {
    return this.y - this.size > height;
  }

  hitsMouth(mouthX, mouthY, mouthRadius) {
    return dist(this.x, this.y, mouthX, mouthY) < this.size * 0.6 + mouthRadius;
  }
}

let figura;
let video;
let faceMesh;
let score = 0;
let lives = 3;
let gameState = "playing";
let unlockLevel2 = false;
let mouthOpen = false;
let mouthCenter = { x: 200, y: 200 };
let mouthRadius = 20;
let warningTimer = 0;
let spawnCooldown = 0;
let fruits = [];
let gameMessage = "Abre la boca para empezar a atrapar fruta.";

function setup() {
  createCanvas(400, 400);
  frameRate(24);

  video = createCapture(VIDEO);
  video.size(400, 400);
  video.hide();

  figura = new FiguraOjos(200, 200, 60);

  faceMesh = new FaceMesh({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
  });

  faceMesh.setOptions({
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  faceMesh.onResults(onResults);

  const camera = new Camera(video.elt, {
    onFrame: async () => {
      await faceMesh.send({ image: video.elt });
    },
    width: 400,
    height: 400
  });
  camera.start();
}

function onResults(results) {
  if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
    const landmarks = results.multiFaceLandmarks[0];
    const leftEye = landmarks[33];
    const rightEye = landmarks[263];
    const upperLip = landmarks[13];
    const lowerLip = landmarks[14];

    const mouthTop = createVector(map(upperLip.x, 0, 1, width, 0), map(upperLip.y, 0, 1, 0, height));
    const mouthBottom = createVector(map(lowerLip.x, 0, 1, width, 0), map(lowerLip.y, 0, 1, 0, height));
    const eyeLeft = createVector(map(leftEye.x, 0, 1, width, 0), map(leftEye.y, 0, 1, 0, height));
    const eyeRight = createVector(map(rightEye.x, 0, 1, width, 0), map(rightEye.y, 0, 1, 0, height));

    mouthCenter.x = (mouthTop.x + mouthBottom.x) / 2;
    mouthCenter.y = (mouthTop.y + mouthBottom.y) / 2;
    mouthRadius = dist(mouthTop.x, mouthTop.y, mouthBottom.x, mouthBottom.y) * 0.65;

    const mouthOpenDistance = dist(mouthTop.x, mouthTop.y, mouthBottom.x, mouthBottom.y);
    const eyeDistance = dist(eyeLeft.x, eyeLeft.y, eyeRight.x, eyeRight.y);
    mouthOpen = mouthOpenDistance > eyeDistance * 0.20;
  } else {
    mouthOpen = false;
  }
}

function draw() {
  background(45, 150, 200);

  updateGame();
  renderGame();
  updateHud();
}

function updateGame() {
  if (gameState !== "playing") {
    if (gameState === "gameOver" && mouthOpen) {
      restartGame();
    }
    return;
  }

  if (mouthOpen) {
    warningTimer = 0;
    if (spawnCooldown <= 0) {
      spawnFruit();
      spawnCooldown = 35;
    }
  } else if (spawnCooldown > 0) {
    spawnCooldown -= 1;
  }

  for (let i = fruits.length - 1; i >= 0; i--) {
    const fruit = fruits[i];
    fruit.update();

    if (mouthOpen && fruit.hitsMouth(mouthCenter.x, mouthCenter.y, mouthRadius)) {
      score += 10;
      fruits.splice(i, 1);
      gameMessage = "¡Fruta atrapada! Sigue así.";
      continue;
    }

    if (fruit.isOffscreen()) {
      fruits.splice(i, 1);
      loseLife("¡Se cayó una fruta! Pierdes una vida.");
    }
  }

  if (!mouthOpen) {
    warningTimer += 1;
    if (warningTimer === 60) {
      gameMessage = "Abre la boca para atrapar fruta.";
    }
    if (warningTimer > 150) {
      warningTimer = 0;
      loseLife("No abriste la boca a tiempo. Pierdes una vida.");
    }
  }

  if (score >= 100 && !unlockLevel2) {
    unlockLevel2 = true;
    gameMessage = "¡Nivel 2 desbloqueado!";
  }
}

function renderGame() {
  fill(255, 255, 255, 100);
  noStroke();
  rect(0, 0, width, height);

  figura.x = mouthCenter.x;
  figura.y = mouthCenter.y;
  figura.show();

  for (const fruit of fruits) {
    fruit.show();
  }

  if (gameState === "gameOver") {
    fill(255, 60, 60);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("GAME OVER", width / 2, height / 2 - 20);
    textSize(16);
    text("Abre la boca para reiniciar", width / 2, height / 2 + 18);
  }
}

function updateHud() {
  const hud = document.getElementById("hud");
  if (!hud) return;

  const stateText = gameState === "gameOver" ? "Estado: Fin" : "Estado: Jugando";
  const levelText = unlockLevel2 ? "Nivel 2 desbloqueado" : "Nivel 1";
  const message = gameState === "gameOver" ? "Abre la boca para reiniciar." : gameMessage;

  hud.innerHTML = `
    <div><strong>Puntaje:</strong> ${score}</div>
    <div><strong>Vidas:</strong> ${lives}</div>
    <div class="level"><strong>${levelText}</strong></div>
    <div><strong>${stateText}</strong></div>
    <div class="message">${message}</div>
  `;
}

function spawnFruit() {
  const x = random(30, width - 30);
  const size = random(22, 32);
  const speed = random(2, 4);
  fruits.push(new Fruit(x, -size, size, speed));
}

function loseLife(text) {
  if (gameState !== "playing") return;

  lives = max(0, lives - 1);
  gameMessage = text;

  if (lives <= 0) {
    gameState = "gameOver";
    gameMessage = "Perdiste todas las vidas. Abre la boca para reiniciar.";
    fruits = [];
  }
}

function restartGame() {
  score = 0;
  lives = 3;
  unlockLevel2 = false;
  gameState = "playing";
  gameMessage = "Abre la boca para empezar a atrapar fruta.";
  fruits = [];
  warningTimer = 0;
  spawnCooldown = 0;
}
