const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const timeEl = document.getElementById("time");
const orbEl = document.getElementById("orbs");
const totalOrbEl = document.getElementById("totalOrbs");
const livesEl = document.getElementById("lives");
const timeLeftEl = document.getElementById("timeLeft");
const messageEl = document.getElementById("message");
const uploadInput = document.getElementById("avatarUpload");

const keys = new Set();
let lastTime = 0;
let elapsed = 0;
let message = "スタート！";
const timeLimit = 180;
let started = false;
let ended = false;

const world = {
  width: 3600,
  height: 540,
  gravity: 1800,
};

const player = {
  x: 80,
  y: 360,
  w: 46,
  h: 54,
  vx: 0,
  vy: 0,
  speed: 320,
  jump: 640,
  dashSpeed: 720,
  dashCooldown: 0,
  onGround: false,
  lives: 3,
  invincibleTimer: 0,
};

const camera = { x: 0, y: 0 };

const platforms = [
  { x: 0, y: 460, w: 600, h: 80 },
  { x: 660, y: 420, w: 240, h: 40 },
  { x: 980, y: 360, w: 200, h: 40 },
  { x: 1260, y: 300, w: 220, h: 40 },
  { x: 1560, y: 360, w: 260, h: 40 },
  { x: 1900, y: 420, w: 260, h: 40 },
  { x: 2260, y: 370, w: 200, h: 40 },
  { x: 2500, y: 300, w: 200, h: 40 },
  { x: 2800, y: 340, w: 280, h: 40 },
  { x: 3160, y: 420, w: 360, h: 80 },
  { x: 2100, y: 480, w: 800, h: 80 },
  { x: 600, y: 480, w: 80, h: 60, hazard: true },
  { x: 1460, y: 480, w: 120, h: 60, hazard: true },
  { x: 2100, y: 480, w: 120, h: 60, hazard: true },
  { x: 3200, y: 480, w: 120, h: 60, hazard: true },
];

const movingPlatforms = [
  { x: 1800, y: 260, w: 160, h: 24, range: 140, speed: 60, dir: 1 },
  { x: 2600, y: 220, w: 140, h: 24, range: 160, speed: 70, dir: -1 },
];

const springs = [
  { x: 1120, y: 340, w: 40, h: 20 },
  { x: 2420, y: 280, w: 40, h: 20 },
];

const orbs = [
  { x: 520, y: 380, r: 10 },
  { x: 760, y: 360, r: 10 },
  { x: 1030, y: 300, r: 10 },
  { x: 1300, y: 240, r: 10 },
  { x: 1600, y: 320, r: 10 },
  { x: 1980, y: 380, r: 10 },
  { x: 2280, y: 320, r: 10 },
  { x: 2540, y: 250, r: 10 },
  { x: 2850, y: 280, r: 10 },
  { x: 3100, y: 370, r: 10 },
];

const enemies = [
  { x: 900, y: 400, w: 40, h: 40, dir: 1, speed: 60, range: 120 },
  { x: 1700, y: 320, w: 40, h: 40, dir: -1, speed: 70, range: 100 },
  { x: 2700, y: 260, w: 40, h: 40, dir: 1, speed: 80, range: 120 },
];

const goal = { x: 3450, y: 340, w: 80, h: 120 };

let collected = 0;
let playerImage = null;

const defaultAvatar = new Image();
const defaultSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="140" viewBox="0 0 120 140">
  <defs>
    <linearGradient id="hair" x1="0" x2="1">
      <stop offset="0%" stop-color="#4fd1ff" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="120" height="140" rx="22" fill="#1e293b" />
  <circle cx="60" cy="60" r="34" fill="#f8fafc" />
  <path d="M20 54 L60 20 L100 52 L86 30 L110 40 L92 72 L70 34 L40 72 Z" fill="url(#hair)" />
  <circle cx="48" cy="64" r="6" fill="#0f172a" />
  <circle cx="74" cy="64" r="6" fill="#0f172a" />
  <rect x="44" y="84" width="32" height="10" rx="5" fill="#38bdf8" />
  <rect x="38" y="100" width="44" height="26" rx="12" fill="#22c55e" />
</svg>`;

defaultAvatar.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(defaultSvg)}`;
playerImage = defaultAvatar;

uploadInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      playerImage = img;
      message = "キャラクターが切り替わりました！";
      showMessage();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

const resetPlayer = () => {
  player.x = 80;
  player.y = 360;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.invincibleTimer = 0;
};

const showMessage = (text, options = {}) => {
  const { persist = false } = options;
  messageEl.textContent = text || message;
  messageEl.classList.add("show");
  clearTimeout(showMessage.timeout);
  if (!persist) {
    showMessage.timeout = setTimeout(() => {
      messageEl.classList.remove("show");
    }, 1400);
  }
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const isColliding = (rect, other) => {
  return (
    rect.x < other.x + other.w &&
    rect.x + rect.w > other.x &&
    rect.y < other.y + other.h &&
    rect.y + rect.h > other.y
  );
};

const applyCollision = (axis, rect, obstacle) => {
  if (!isColliding(rect, obstacle)) return;
  if (axis === "x") {
    if (rect.vx > 0) rect.x = obstacle.x - rect.w;
    else if (rect.vx < 0) rect.x = obstacle.x + obstacle.w;
    rect.vx = 0;
  } else {
    if (rect.vy > 0) {
      rect.y = obstacle.y - rect.h;
      rect.vy = 0;
      rect.onGround = true;
    } else if (rect.vy < 0) {
      rect.y = obstacle.y + obstacle.h;
      rect.vy = 0;
    }
  }
};

const updatePlayer = (dt) => {
  const left = keys.has("ArrowLeft") || keys.has("KeyA");
  const right = keys.has("ArrowRight") || keys.has("KeyD");
  const jump = keys.has("Space") || keys.has("ArrowUp") || keys.has("KeyW");
  const dash = keys.has("ShiftLeft") || keys.has("ShiftRight");

  player.vx = 0;
  if (left) player.vx = -player.speed;
  if (right) player.vx = player.speed;

  if (jump && player.onGround) {
    player.vy = -player.jump;
    player.onGround = false;
  }

  if (dash && player.dashCooldown <= 0) {
    const dir = right ? 1 : left ? -1 : player.vx >= 0 ? 1 : -1;
    player.vx = dir * player.dashSpeed;
    player.vy *= 0.4;
    player.dashCooldown = 0.6;
  }

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);

  player.vy += world.gravity * dt;
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  player.onGround = false;

  const allPlatforms = [...platforms, ...movingPlatforms];

  allPlatforms.forEach((platform) => {
    applyCollision("x", player, platform);
    applyCollision("y", player, platform);
  });

  springs.forEach((spring) => {
    if (isColliding(player, spring) && player.vy > 0) {
      player.vy = -player.jump * 1.2;
    }
  });

  if (player.y > world.height + 200) {
    loseLife();
  }

  player.x = clamp(player.x, 0, world.width - player.w);
  player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
};

const updatePlatforms = (dt) => {
  movingPlatforms.forEach((platform) => {
    platform.x += platform.speed * platform.dir * dt;
    if (platform.x < platform.originX - platform.range || platform.x > platform.originX + platform.range) {
      platform.dir *= -1;
    }
  });
};

movingPlatforms.forEach((platform) => {
  platform.originX = platform.x;
});

const updateEnemies = (dt) => {
  enemies.forEach((enemy) => {
    if (enemy.originX === undefined) enemy.originX = enemy.x;
    enemy.x += enemy.speed * enemy.dir * dt;
    if (Math.abs(enemy.x - enemy.originX) > enemy.range) {
      enemy.dir *= -1;
    }
  });
};

const checkHazards = () => {
  const hazardPlatforms = platforms.filter((platform) => platform.hazard);
  hazardPlatforms.forEach((hazard) => {
    if (isColliding(player, hazard)) {
      loseLife();
    }
  });

  enemies.forEach((enemy) => {
    if (isColliding(player, enemy)) {
      loseLife();
    }
  });
};

const loseLife = () => {
  if (player.invincibleTimer > 0) return;
  player.lives -= 1;
  livesEl.textContent = player.lives;
  player.invincibleTimer = 1.2;
  showMessage(player.lives > 0 ? "ダメージ！再挑戦！" : "ゲームオーバー！Rでリトライ");
  resetPlayer();
};

const updateOrbs = () => {
  orbs.forEach((orb) => {
    if (!orb.collected) {
      const dx = player.x + player.w / 2 - orb.x;
      const dy = player.y + player.h / 2 - orb.y;
      if (Math.hypot(dx, dy) < orb.r + 22) {
        orb.collected = true;
        collected += 1;
        orbEl.textContent = collected;
        showMessage("エネルギーコア獲得！");
      }
    }
  });
};

const endGame = (text) => {
  ended = true;
  showMessage(text, { persist: true });
};

const checkGoal = () => {
  if (isColliding(player, goal)) {
    endGame(`ゴール！ ${elapsed.toFixed(1)}秒でクリア！`);
    return true;
  }
  return false;
};

const updateCamera = () => {
  camera.x = clamp(player.x - canvas.width / 2, 0, world.width - canvas.width);
};

const drawBackground = () => {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(56, 189, 248, 0.1)";
  for (let i = 0; i < 30; i += 1) {
    ctx.fillRect((i * 140 - camera.x * 0.4) % canvas.width, 40 + (i % 4) * 30, 60, 6);
  }
};

const drawPlatforms = () => {
  platforms.forEach((platform) => {
    ctx.fillStyle = platform.hazard ? "#ef4444" : "#334155";
    ctx.fillRect(platform.x - camera.x, platform.y, platform.w, platform.h);
  });

  movingPlatforms.forEach((platform) => {
    ctx.fillStyle = "#475569";
    ctx.fillRect(platform.x - camera.x, platform.y, platform.w, platform.h);
  });

  springs.forEach((spring) => {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(spring.x - camera.x, spring.y, spring.w, spring.h);
  });
};

const drawOrbs = () => {
  orbs.forEach((orb) => {
    if (orb.collected) return;
    ctx.beginPath();
    ctx.arc(orb.x - camera.x, orb.y, orb.r, 0, Math.PI * 2);
    ctx.fillStyle = "#a7f3d0";
    ctx.fill();
    ctx.strokeStyle = "#34d399";
    ctx.stroke();
  });
};

const drawEnemies = () => {
  enemies.forEach((enemy) => {
    ctx.fillStyle = "#f97316";
    ctx.fillRect(enemy.x - camera.x, enemy.y, enemy.w, enemy.h);
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(enemy.x - camera.x + 10, enemy.y + 12, 6, 6);
    ctx.fillRect(enemy.x - camera.x + 24, enemy.y + 12, 6, 6);
  });
};

const drawGoal = () => {
  ctx.fillStyle = "#22d3ee";
  ctx.fillRect(goal.x - camera.x, goal.y, goal.w, goal.h);
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(goal.x - camera.x + 10, goal.y + 10, goal.w - 20, goal.h - 20);
  ctx.fillStyle = "#38bdf8";
  ctx.fillRect(goal.x - camera.x + 16, goal.y + 20, goal.w - 32, goal.h - 40);
};

const drawPlayer = () => {
  if (playerImage && playerImage.complete) {
    ctx.save();
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    ctx.drawImage(playerImage, player.x - camera.x, player.y - 10, player.w, player.h + 10);
    ctx.restore();
  } else {
    ctx.fillStyle = "#38bdf8";
    ctx.fillRect(player.x - camera.x, player.y, player.w, player.h);
  }
};

const renderScene = () => {
  drawBackground();
  drawPlatforms();
  drawOrbs();
  drawEnemies();
  drawGoal();
  drawPlayer();
};

const loop = (timestamp) => {
  const dt = Math.min(0.033, (timestamp - lastTime) / 1000);
  lastTime = timestamp;
  if (!started || ended) return;

  elapsed += dt;
  timeEl.textContent = elapsed.toFixed(1);
  const remaining = Math.max(0, Math.ceil(timeLimit - elapsed));
  timeLeftEl.textContent = remaining;
  if (remaining <= 0) {
    endGame("時間切れ！Rでリトライ");
    return;
  }

  updatePlatforms(dt);
  updateEnemies(dt);
  updatePlayer(dt);
  updateOrbs();
  checkHazards();
  updateCamera();

  renderScene();

  if (!checkGoal()) {
    requestAnimationFrame(loop);
  }
};

const resetGame = () => {
  player.lives = 3;
  livesEl.textContent = player.lives;
  collected = 0;
  elapsed = 0;
  timeLeftEl.textContent = timeLimit;
  orbs.forEach((orb) => {
    orb.collected = false;
  });
  orbEl.textContent = collected;
  messageEl.classList.remove("show");
  resetPlayer();
  lastTime = performance.now();
  ended = false;
  started = true;
  requestAnimationFrame(loop);
};

totalOrbEl.textContent = orbs.length;
timeLeftEl.textContent = timeLimit;

const startIfNeeded = () => {
  if (started) return;
  started = true;
  messageEl.classList.remove("show");
  lastTime = performance.now();
  requestAnimationFrame(loop);
};

window.addEventListener("keydown", (event) => {
  if (event.code === "KeyR") {
    resetGame();
  }
  keys.add(event.code);
  startIfNeeded();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

canvas.addEventListener("click", () => {
  startIfNeeded();
});

renderScene();
showMessage("クリック/キー入力でスタート", { persist: true });
