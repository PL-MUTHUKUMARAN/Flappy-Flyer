let score = 0;
let targetY = 0;
let velocity = 0;
let BDead = false;
let BFallingGently = false;
let rotation = 0;
const gravity = 1;
const groundY = 667;
let pipeScored = [false, false, false, false];

let bestScore = parseInt(localStorage.getItem("bestScore"), 10) || 0;

function start() {
  const bg1 = document.getElementById("bg-image-1");
  const bg2 = document.getElementById("bg-image-2");
  let x1 = parseInt(bg1.getAttribute("x"));
  let x2 = parseInt(bg2.getAttribute("x"));
  x1 -= 2;
  x2 -= 2;
  if (x1 <= -1525) x1 = 1515;
  if (x2 <= -1525) x2 = 1515;
  bg1.setAttribute("x", x1);
  bg2.setAttribute("x", x2);

  const body = document.getElementById("bird-body");
  let cy = parseInt(body.getAttribute("cy"));
  const ry = parseInt(body.getAttribute("ry"));

  if (BDead) {
    velocity += gravity;
    rotation += 5;
    cy += velocity;

    if (cy + ry >= groundY) {
      cy = groundY - ry;
      updateBirdPosition(cy);
      document.getElementById("bird").setAttribute("transform", "rotate(" + rotation + ", 100, " + cy + ")");
      clearInterval(game);
      setTimeout(() => {
        scoreCard();
      }, 500);
      return;
    }

    updateBirdPosition(cy);
    document.getElementById("bird").setAttribute("transform", "rotate(" + rotation + ", 100, " + cy + ")");
    return;
  }

  if (BFallingGently) {
    velocity += 1;
    rotation += 2;
    cy += velocity;
    if (cy >= targetY) {
      cy = targetY;
      updateBirdPosition(cy);
      document.getElementById("bird").setAttribute("transform", "rotate(" + rotation + ", 100, " + cy + ")");
      BFallingGently = false;
      clearInterval(game);
      setTimeout(() => {
        scoreCard();
      }, 500);
      return;
    }

    updateBirdPosition(cy);
    document.getElementById("bird").setAttribute("transform", "rotate(" + rotation + ", 100, " + cy + ")");
    return;
  }

  velocity += gravity;
  cy += velocity;

  if (cy <= 265) {
    cy = 265;
    velocity = 0;
  }

  if (cy + ry >= groundY) {
    cy = groundY - ry;
    updateBirdPosition(cy);
    deathAudio();
    stopWingAnimation();
    clearInterval(game);
    setTimeout(() => {
      scoreCard();
    }, 30);
    return;
  }

  updateBirdPosition(cy);

  const cx = parseInt(body.getAttribute("cx"));
  const rx = parseInt(body.getAttribute("rx"));

  for (let i = 1; i <= 4; i++) {
    const top = document.getElementById("pipe-top-" + i);
    const bottom = document.getElementById("pipe-bottom-" + i);

    let topX = parseInt(top.getAttribute("x"));
    topX -= 2;

    if (topX < -60) {
      topX = 1525;
      const gap = 100;
      const topHeight = Math.floor(Math.random() * 150) + 80;
      const bottomY = gap + topHeight + 245;
      top.setAttribute("y", 245);
      top.setAttribute("height", topHeight);
      bottom.setAttribute("y", bottomY);
      bottom.setAttribute("height", groundY - bottomY);
      pipeScored[i - 1] = false;
    }

    top.setAttribute("x", topX);
    bottom.setAttribute("x", topX);

    const pipeW = parseInt(top.getAttribute("width"));
    const topH = parseInt(top.getAttribute("height"));
    const bottomY = parseInt(bottom.getAttribute("y"));
    if (
      cx + rx >= topX &&
      cx - rx <= topX + pipeW &&
      (cy - ry <= topH + 245 || cy + ry >= bottomY)
    ) {
      if (cx + rx == topX) {
        velocity = 1;
        rotation = 10;
        BDead = true;
        deathAudio();
        stopWingAnimation();
        return;
      } else if (cx + ry > topX && cx - rx <= topX + pipeW && cy - ry <= topH + 245) {
        velocity = 0;
        rotation = 100;
        BFallingGently = true;
        targetY = bottomY - ry;
        deathAudio();
        stopWingAnimation();
        return;
      } else {
        cy = bottomY - ry;
        velocity = 1;
        rotation = 45;
      }
      deathAudio();
      stopWingAnimation();
      updateBirdPosition(cy);
      document.getElementById("bird").setAttribute("transform", "rotate(" + rotation + ", 100, " + cy + ")");
      clearInterval(game);
      setTimeout(() => {
        scoreCard();
      }, 100);
      return;
    }

    if (!pipeScored[i - 1] && cx - rx > topX + pipeW) {
      pipeScored[i - 1] = true;
      score++;
      document.getElementById("score").textContent = score;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bestScore", bestScore);
      }
    }
  }
}

function updateBirdPosition(cy) {
  document.getElementById("bird-body").setAttribute("cy", cy);
  document.getElementById("bird-lower-lip").setAttribute("cy", cy + 4);
  document.getElementById("bird-upper-lip").setAttribute("cy", cy + 7);
  document.getElementById("bird-wing").setAttribute("cy", cy + 2);
  document.getElementById("bird-eye-outer").setAttribute("cy", cy - 6);
  document.getElementById("bird-eye-inner").setAttribute("cy", cy - 6);
  document.getElementById("bird-eyebrow").setAttribute("y1", cy - 15);
  document.getElementById("bird-eyebrow").setAttribute("y2", cy - 9);
}

let wingInterval = null;

function fly() {
  if (BDead || BFallingGently) {
    stopWingAnimation();
    return;
  }

  if (wingInterval == null) {
    wingInterval = setInterval(() => {
      const wing = document.getElementById("bird-wing");
      let ry = parseInt(wing.getAttribute("ry"));
      ry = (ry + 1) % 7;
      wing.setAttribute("ry", ry);
    }, 20);
  }
}

function jump() {
  if (BDead || BFallingGently) return;

  const jumpAudio = document.getElementById("jump-audio");
  jumpAudio.currentTime = 0;
  jumpAudio.play();
  velocity = -10;
}

function scoreCard() {
  document.getElementById("Score-Card").style.display = "flex";
  document.getElementById("Final-Score").textContent = score;
  document.getElementById("Final-Best").textContent = bestScore;
}

function restart() {
  let countdown = 3;
  document.getElementById("countdown").textContent = countdown;
  document.getElementById("countdown-audio").currentTime = 0;
  document.getElementById("countdown-audio").play();

  const restartInterval = setInterval(() => {
    if (countdown > 0) {
      countdown--;
      document.getElementById("countdown").textContent = countdown;
    } else {
      clearInterval(restartInterval);
      location.reload();
    }
  }, 1000);
}

function deathAudio() {
  const deathAudio = document.getElementById("death-audio");
  deathAudio.currentTime = 0;
  deathAudio.play();
}

function stopWingAnimation() {
  document.removeEventListener("keydown", onClick);
  document.removeEventListener("touchstart", onClick);
  if (wingInterval != null) {
    clearInterval(wingInterval);
    wingInterval = null;
    const wing = document.getElementById("bird-wing");
    wing.setAttribute("ry", 6);
  }
}

function onClick() {
  if (BDead || BFallingGently) return;

  fly();
  jump();
}

function buttonClick() {
  document.getElementById("Score-Card").style.display = "none";
  document.getElementById("restart-countdown").style.display = "flex";
  restart();
}

document.addEventListener("keydown", onClick);
document.addEventListener("touchstart", onClick);

const game = setInterval(start, 20);
