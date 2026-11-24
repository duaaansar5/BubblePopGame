
const gameArea = document.getElementById("gameArea");
const message = document.getElementById("message");

const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const bestDisplay = document.getElementById("bestScore");
const levelDisplay = document.getElementById("level");
const progress = document.getElementById("progress");
const soundBtn = document.getElementById("soundBtn");

let score = 0;
let timeLeft = 30;
let level = 1;
let playing = false;
let soundOn = true;

let gameTimer;
let bubbleTimer;

let bestScore = Number(localStorage.getItem("bubbleBest")) || 0;
let unlockedLevel = Number(localStorage.getItem("unlockedLevel")) || 1;

bestDisplay.textContent = bestScore;

// Level target
function getTarget() {
    return 100 + (level - 1) * 50;
}

// Sound
function playSound(frequency = 500) {
    if (!soundOn) return;

    try {
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.frequency.value = frequency;
        gain.gain.value = 0.1;

        oscillator.start();
        oscillator.stop(audio.currentTime + 0.12);
        oscillator.onended = () => audio.close();
    } catch (error) {
        console.log(error);
    }
}

// Update stats
function updateStats() {
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("bubbleBest", bestScore);
        bestDisplay.textContent = bestScore;
    }
}

// Show effects
function showEffect(x, y, points) {
    const effect = document.createElement("div");

    effect.className = "pop-effect";
    effect.textContent = points > 0 ? "+" + points : points;
    effect.style.left = x + "px";
    effect.style.top = y + "px";
    effect.style.color = points > 0 ? "#ff65aa" : "red";

    gameArea.appendChild(effect);

    setTimeout(() => effect.remove(), 600);
}

// Create bubble
function createBubble() {
    if (!playing) return;

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    const size = Math.floor(Math.random() * 25) + 50;

    const maxX = gameArea.clientWidth - size;
    const maxY = gameArea.clientHeight - size;

    const x = Math.random() * Math.max(0, maxX);
    const y = Math.random() * Math.max(0, maxY);

    bubble.style.width = size + "px";
    bubble.style.height = size + "px";
    bubble.style.left = x + "px";
    bubble.style.top = y + "px";
    bubble.style.zIndex = "2";

    const random = Math.random();

    let points = 10;
    let frequency = 550;

   if (random < Math.min(0.30, 0.12 + (level - 1) * 0.01)) {
        bubble.classList.add("golden");
        bubble.textContent = "⭐";
        points = 30;
        frequency = 900;

    } else if (random < Math.min(0.50, 0.22 + (level - 1) * 0.01)) {
        bubble.classList.add("bomb");
        bubble.textContent = "💣";
        points = -20;
        frequency = 180;

    } else {
        const colors = [
            ["#ffb6d9", "#ff65aa"],
            ["#b8a1ff", "#8b5cf6"],
            ["#9be7ff", "#38bdf8"],
            ["#b8f5c5", "#4ade80"],
            ["#ffe39c", "#fbbf24"]
        ];

        const selected = colors[
            Math.floor(Math.random() * colors.length)
        ];

        bubble.style.background =
            `radial-gradient(circle at 30% 25%, white, ${selected[0]}, ${selected[1]})`;
    }

    bubble.addEventListener("pointerdown", function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (!playing) return;

        score = Math.max(0, score + points);

        showEffect(x, y, points);
        playSound(frequency);
        updateStats();

        bubble.remove();

        // Check level completion
        if (score >= getTarget()) {
            finishLevel(true);
        }
    });

    gameArea.appendChild(bubble);

    setTimeout(() => {
        if (bubble.isConnected) bubble.remove();
    }, 3000);
}

// Show main menu
function showMenu() {
    playing = false;

    clearInterval(gameTimer);
    clearInterval(bubbleTimer);

    gameArea.querySelectorAll(".bubble, .pop-effect").forEach(
        element => element.remove()
    );

    message.innerHTML = `
        <div class="welcome-icon">🫧</div>
        <h2>Bubble Pop Challenge!</h2>

        <p>Welcome back, Bubble Popper!</p>

        <p class="instructions">
            🏆 Highest Unlocked: Level ${unlockedLevel}<br>
            ⭐ Best Score: ${bestScore}
        </p>

        <button id="continueBtn" class="menu-btn">
            ▶ Continue Game
        </button>

        <button id="newGameBtn" class="menu-btn">
            🌸 New Game
        </button>

        <button id="selectBtn" class="menu-btn">
            🎯 Select Level
        </button>
    `;

    message.style.display = "flex";

    document.getElementById("continueBtn").onclick = () => {
        startGame(unlockedLevel);
        progress.style.width = "100%";
        progress.style.background =
    "linear-gradient(90deg, #ff83bb, #a76bff)";
    };

    document.getElementById("newGameBtn").onclick = () => {
        startGame(1);
    };

    document.getElementById("selectBtn").onclick = showLevelSelection;
}

// Level selection
function showLevelSelection() {
    let buttons = "";

    for (let i = 1; i <= unlockedLevel; i++) {
        buttons += `
            <button class="menu-btn" data-level="${i}">
                🌟 Level ${i}
            </button>
        `;
    }

    message.innerHTML = `
        <div class="welcome-icon">🎮</div>
        <h2>Select Your Level</h2>
        <p>Choose any unlocked level!</p>
        ${buttons}
        <button id="backBtn" class="menu-btn">
            ⬅ Back to Menu
        </button>
    `;

    message.style.display = "flex";

    message.querySelectorAll("[data-level]").forEach(button => {
        button.onclick = () => {
            startGame(Number(button.dataset.level));
        };
    });

    document.getElementById("backBtn").onclick = showMenu;
}

// Start a level
function startGame(selectedLevel) {
    clearInterval(gameTimer);
    clearInterval(bubbleTimer);

    level = selectedLevel;
    score = 0;
    timeLeft = 30;
    playing = true;

    updateStats();

    timerDisplay.textContent = timeLeft;
    timerDisplay.style.color = "";
    progress.style.width = "100%";

    message.style.display = "none";

    gameArea.querySelectorAll(".bubble, .pop-effect").forEach(
        element => element.remove()
    );

    createBubble();

    // Har level par bubbles tez aayenge
const bubbleSpeed = Math.max(180, 650 - (level - 1) * 15);

bubbleTimer = setInterval(createBubble, bubbleSpeed);

    gameTimer = setInterval(() => {
        timeLeft--;

        timerDisplay.textContent = timeLeft;
        progress.style.width = (timeLeft / 30 * 100) + "%";

        if (timeLeft <= 10) {
            timerDisplay.style.color = "red";
            progress.style.background = "#ff5252";
        }

        if (timeLeft <= 0) {
            finishLevel(false);
        }
    }, 1000);
}

// Complete or fail level
function finishLevel(won) {
    if (!playing) return;

    playing = false;

    clearInterval(gameTimer);
    clearInterval(bubbleTimer);

    gameArea.querySelectorAll(".bubble").forEach(
        bubble => bubble.remove()
    );

    if (won) {
        unlockedLevel = Math.max(unlockedLevel, level + 1);

        localStorage.setItem("unlockedLevel", unlockedLevel);

        message.innerHTML = `
            <div class="welcome-icon">🏆</div>
            <h2>Level ${level} Completed!</h2>
            <p>Amazing! Your score is ${score} ⭐</p>
            <p>🎉 Level ${level + 1} is now unlocked!</p>

            <button id="nextBtn" class="menu-btn">
                Next Level 🚀
            </button>

            <button id="menuBtn" class="menu-btn">
                Main Menu
            </button>
        `;

        document.getElementById("nextBtn").onclick = () => {
            startGame(level + 1);
        };

    } else {
        message.innerHTML = `
            <div class="welcome-icon">💗</div>
            <h2>Time's Up!</h2>
            <p>Your score: ${score}</p>
            <p>Target: ${getTarget()}</p>
            <p>Try again to complete Level ${level}!</p>

            <button id="retryBtn" class="menu-btn">
                🔄 Retry Level
            </button>

            <button id="menuBtn" class="menu-btn">
                Main Menu
            </button>
        `;

        document.getElementById("retryBtn").onclick = () => {
            startGame(level);
        };
    }

    message.style.display = "flex";

    document.getElementById("menuBtn").onclick = showMenu;

    playSound(won ? 900 : 250);
}

// Sound button
soundBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    soundBtn.textContent = soundOn ? "🔊 Sound ON" : "🔇 Sound OFF";
});

// Register offline support
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(error => console.log(error));
    });
}

// Initial menu
showMenu();
