// =========================
// 基本設定
// =========================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameStarted = false;
let gameOver = false;
let score = 0;
let items = [];
let effectTimer = 0;
let spawnLoop;
let endTimer;

// =========================
// BGM & 効果音
// =========================
const bgmGame = new Audio("sounds/bgm_game.mp3");
bgmGame.loop = true;
bgmGame.volume = 0.3;

const bgmEndGood = new Audio("sounds/bgm_end_good.mp3");
const bgmEndNormal = new Audio("sounds/bgm_end_normal.mp3");
const bgmEndBad = new Audio("sounds/bgm_end_bad.mp3");

bgmEndGood.volume = 0.4;
bgmEndNormal.volume = 0.4;
bgmEndBad.volume = 0.4;

const seNormal = new Audio("sounds/se_normal.mp3");
const seSpecial = new Audio("sounds/se_special.mp3");
const seBad = new Audio("sounds/se_bad.mp3");

seNormal.volume = 0.4;
seSpecial.volume = 0.5;
seBad.volume = 0.4;

// =========================
// 丸ボタン描画関数
// =========================
function drawRoundButton(x, y, w, h, text) {
    const radius = h / 2;

    ctx.fillStyle = "#ffffffdd";
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.fill();

    ctx.strokeStyle = "#ff88aa";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#333";
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x + w / 2, y + h / 2);
}

// =========================
// スタート画面
// =========================
function showStartScreen() {
    const startImage = new Image();
    startImage.src = "images/start.png";

    startImage.onload = function () {
        ctx.drawImage(startImage, 0, 0, canvas.width, canvas.height);
        drawRoundButton(100, 450, 200, 80, "START");
    };
}

// =========================
// STARTボタンクリック（PC）
// =========================
canvas.addEventListener("click", function (e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (!gameStarted && !gameOver) {
        if (x > 100 && x < 300 && y > 450 && y < 530) {
            startGame();
            return;
        }
    }

    if (gameOver) {
        if (x > 100 && x < 300 && y > 450 && y < 530) {
            bgmEndGood.pause();
            bgmEndNormal.pause();
            bgmEndBad.pause();
            startGame();
            return;
        }
    }
});

// =========================
// STARTボタン（スマホタッチ）
// =========================
canvas.addEventListener("touchstart", function (e) {
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    const touchY = e.touches[0].clientY - rect.top;

    if (!gameStarted && !gameOver) {
        if (touchX > 100 && touchX < 300 && touchY > 450 && touchY < 530) {
            startGame();
            e.preventDefault();
            return;
        }
    }

    if (gameOver) {
        if (touchX > 100 && touchX < 300 && touchY > 450 && touchY < 530) {
            bgmEndGood.pause();
            bgmEndNormal.pause();
            bgmEndBad.pause();
            startGame();
            e.preventDefault();
            return;
        }
    }
}, { passive: false });

// =========================
// ゲーム開始
// =========================
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    items = [];
    effectTimer = 0;

    bgmGame.currentTime = 0;
    bgmGame.play();

    spawnLoop = setInterval(spawnItem, 800);
    update();
    endTimer = setTimeout(endGame, 30000);
}

// =========================
// プレイヤー画像
// =========================
const imgPlayerNormal = new Image();
imgPlayerNormal.src = "images/player_normal.png";

const imgPlayerSpecial = new Image();
imgPlayerSpecial.src = "images/player_special.png";

const imgPlayerBad = new Image();
imgPlayerBad.src = "images/player_bad.png";

let playerImage = imgPlayerNormal;

let player = { x: 180, y: 520, width: 60, height: 60 };

// =========================
// アイテム画像
// =========================
const itemImages = {
    normal: [
        "images/item_normal1.png",
        "images/item_normal2.png",
        "images/item_normal3.png"
    ],
    special: ["images/item_special.png"],
    bad: [
        "images/item_bad1.png",
        "images/item_bad2.png"
    ]
};

// =========================
// エンディング画像
// =========================
const endingImages = {
    good: "images/end_good.png",
    normal: "images/end_normal.png",
    bad: "images/end_bad.png"
};

// =========================
// アイテム生成
// =========================
function spawnItem() {
    if (!gameStarted || gameOver) return;

    const rand = Math.random();
    let type;

    if (rand < 0.7) type = "normal";
    else if (rand < 0.8) type = "special";
    else type = "bad";

    const imgList = itemImages[type];
    const img = new Image();
    img.src = imgList[Math.floor(Math.random() * imgList.length)];

    items.push({
        x: Math.random() * 360,
        y: -20,
        speed: 3 + Math.random() * 2,
        type: type,
        img: img
    });
}

// =========================
// 効果
// =========================
function applyEffect(type) {
    if (type === "special") {
        playerImage = imgPlayerSpecial;
        effectTimer = 30;
    }
    if (type === "bad") {
        playerImage = imgPlayerBad;
        effectTimer = 30;
    }
}

// =========================
// 操作（PC用）
// =========================
document.addEventListener("keydown", (e) => {
    if (!gameStarted || gameOver) return;

    if (e.key === "ArrowLeft") {
        player.x = Math.max(0, player.x - 30);
    }
    if (e.key === "ArrowRight") {
        player.x = Math.min(canvas.width - player.width, player.x + 30);
    }
});

// =========================
// ★ スマホ用タッチ操作（PCと干渉しない）
// =========================
canvas.addEventListener("touchmove", handleTouch, { passive: false });
canvas.addEventListener("touchstart", handleTouch, { passive: false });

function handleTouch(e) {
    if (!gameStarted || gameOver) return;
    if (e.touches.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;

    const move = 8; // ← ふんわり動く値

    if (touchX < canvas.width / 2) {
        player.x = Math.max(0, player.x - move);
    } else {
        player.x = Math.min(canvas.width - player.width, player.x + move);
    }

    e.preventDefault();
}

// =========================
// ゲームループ
// =========================
function update() {
    if (!gameStarted || gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255, 180, 200, 0.25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);

    if (effectTimer > 0) {
        effectTimer--;
        if (effectTimer === 0) playerImage = imgPlayerNormal;
    }

    items.forEach((item, i) => {
        item.y += item.speed;
        ctx.drawImage(item.img, item.x, item.y, 40, 40);

        if (
            item.x < player.x + player.width &&
            item.x + 40 > player.x &&
            item.y < player.y + player.height &&
            item.y + 40 > player.y
        ) {
            if (item.type === "normal") {
                score += 1;
                seNormal.currentTime = 0;
                seNormal.play();
            }
            if (item.type === "special") {
                score += 3;
                seSpecial.currentTime = 0;
                seSpecial.play();
            }
            if (item.type === "bad") {
                score -= 2;
                seBad.currentTime = 0;
                seBad.play();
            }

            applyEffect(item.type);
            items.splice(i, 1);
        }

        if (item.y > 600) items.splice(i, 1);
    });

    ctx.fillStyle = "black";
    ctx.font = "24px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 10, 10);

    requestAnimationFrame(update);
}

// =========================
// エンディング
// =========================
function endGame() {
    gameOver = true;
    clearInterval(spawnLoop);
    clearTimeout(endTimer);

    bgmGame.pause();

    let endingType = "";
    if (score >= 30) endingType = "good";
    else if (score >= 15) endingType = "normal";
    else endingType = "bad";

    if (endingType === "good") bgmEndGood.play();
    if (endingType === "normal") bgmEndNormal.play();
    if (endingType === "bad") bgmEndBad.play();

    const endImg = new Image();
    endImg.src = endingImages[endingType];

    endImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(endImg, 0, 0, canvas.width, canvas.height);

        drawRoundButton(100, 450, 200, 80, "もう一度プレイ");
    };
}

// =========================
// 最初にスタート画面
// =========================
showStartScreen();