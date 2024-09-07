const betItems = document.querySelectorAll('.bet-item');
const rollButton = document.getElementById('roll-button');
const resetButton = document.getElementById('reset-button');
const depositButton = document.getElementById('deposit-button');
const bananaCount = document.getElementById('banana-count');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const closeModal = document.getElementById('close-modal');

const items = ['bau', 'cua', 'tom', 'ca', 'ga', 'nai'];
const images = {};

// Tải trước tất cả hình ảnh
function preloadImages() {
    return Promise.all(items.map(item => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                images[item] = img;
                resolve();
            };
            img.onerror = reject;
            img.src = `images/${item}.png`;
        });
    }));
}

// Khởi tạo game sau khi tải xong hình ảnh
preloadImages().then(() => {
    initGame();
}).catch(error => {
    console.error("Error loading images:", error);
});

function initGame() {
    // Khởi tạo game ở đây
    updateDiceFaces();
    // ... (các hàm khởi tạo khác)
}

const diceElements = [
    document.getElementById('dice1'),
    document.getElementById('dice2'),
    document.getElementById('dice3')
];

let bananas = 1000000000; // 1 tỷ chuối
let bets = {
    bau: 0,
    cua: 0,
    tom: 0,
    ca: 0,
    ga: 0,
    nai: 0
};

function updateBananaCount() {
    bananaCount.textContent = bananas.toLocaleString();
}

function placeBet(item) {
    const betAmount = parseInt(prompt(`Nhập số chuối muốn đặt cược cho ${item}:`, '0'));
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Vui lòng nhập số chuối hợp lệ.');
        return;
    }
    if (betAmount > bananas) {
        alert('Bạn không đủ chuối để đặt cược.');
        return;
    }
    bets[item] += betAmount;
    bananas -= betAmount;
    updateBananaCount();
    document.querySelector(`.bet-item[data-item="${item}"] .bet-amount`).textContent = bets[item].toLocaleString();
}

function resetBets() {
    for (let item in bets) {
        bets[item] = 0;
        document.querySelector(`.bet-item[data-item="${item}"] .bet-amount`).textContent = '0';
    }
    // Không cộng lại tiền vào bananas ở đây
}

function rollDice() {
    return items[Math.floor(Math.random() * items.length)];
}

function getRandomRotation() {
    return [
        Math.floor(Math.random() * 360),
        Math.floor(Math.random() * 360),
        Math.floor(Math.random() * 360)
    ];
}

function getFinalRotation(item) {
    const rotations = {
        'bau': [0, 0],
        'cua': [0, 90],
        'tom': [0, 180],
        'ca': [0, 270],
        'ga': [90, 0],
        'nai': [-90, 0]
    };
    return rotations[item];
}

function updateDiceFace(dice, item) {
    const faces = dice.querySelectorAll('.dice-face');
    faces.forEach(face => {
        face.style.backgroundImage = `url('images/${item}.png')`;
        face.style.backgroundSize = 'cover';
    });
}

function animateDice(callback) {
    let rolls = 0;
    const maxRolls = 20;
    const interval = setInterval(() => {
        diceElements.forEach(dice => {
            const [rotateX, rotateY, rotateZ] = getRandomRotation();
            dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
        });
        rolls++;
        if (rolls >= maxRolls) {
            clearInterval(interval);
            setTimeout(() => {
                const results = [rollDice(), rollDice(), rollDice()];
                diceElements.forEach((dice, index) => {
                    const [rotateX, rotateY] = getFinalRotation(results[index]);
                    dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    updateDiceFace(dice, results[index]);
                });
                callback(results);
            }, 500);
        }
    }, 100);
}

function calculateWinnings(results) {
    let winnings = 0;
    results.forEach(result => {
        winnings += bets[result] * 2;
    });
    return winnings;
}

function showResults(results, winnings) {
    let message = `Kết quả: ${results.join(', ')}\n`;
    if (winnings > 0) {
        message += `Chúc mừng! Bạn đã thắng ${winnings.toLocaleString()} chuối!`;
        createFireworks();
    } else {
        message += 'Rất tiếc, bạn không thắng lần này.';
    }
    resultMessage.textContent = message;
    resultModal.style.display = 'block';
}

rollButton.addEventListener('click', () => {
    if (Object.values(bets).some(bet => bet > 0)) {
        rollButton.disabled = true;
        animateDice((results) => {
            const winnings = calculateWinnings(results);
            bananas += winnings; // Chỉ cộng tiền thắng, không cộng lại tiền cược
            updateBananaCount();
            showResults(results, winnings);
            resetBets();
            rollButton.disabled = false;
        });
    } else {
        alert('Vui lòng đặt cược trước khi xóc đĩa.');
    }
});

resetButton.addEventListener('click', resetBets);

betItems.forEach(item => {
    item.addEventListener('click', () => {
        placeBet(item.dataset.item);
    });
});

closeModal.addEventListener('click', () => {
    resultModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === resultModal) {
        resultModal.style.display = 'none';
    }
});

depositButton.addEventListener('click', () => {
    const depositAmount = parseInt(prompt('Nhập số chuối muốn nạp:', '0'));
    if (isNaN(depositAmount) || depositAmount <= 0) {
        alert('Vui lòng nhập số chuối hợp lệ.');
        return;
    }
    bananas += depositAmount;
    updateBananaCount();
    alert(`Nạp thành công ${depositAmount.toLocaleString()} chuối!`);
});

updateBananaCount();

function updateDiceFaces() {
    diceElements.forEach(dice => {
        const faces = dice.querySelectorAll('.dice-face');
        faces.forEach((face, index) => {
            const item = items[index];
            face.style.backgroundImage = `url('${images[item].src}')`;
            face.style.backgroundSize = 'cover';
        });
    });
}

// Thêm vào cuối file

function createFireworks() {
    const fireworksContainer = document.querySelector('.fireworks');
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.classList.add('firework');
            firework.style.left = Math.random() * 100 + 'vw';
            firework.style.top = Math.random() * 100 + 'vh';
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            fireworksContainer.appendChild(firework);
            setTimeout(() => firework.remove(), 1000);
        }, Math.random() * 2000);
    }
}

function createLuckyMoney() {
    const luckyMoneyContainer = document.querySelector('.lucky-money-container');
    const luckyMoney = document.createElement('div');
    luckyMoney.classList.add('lucky-money');
    const maxWidth = Math.min(window.innerWidth - 40, 800);
    luckyMoney.style.left = Math.random() * maxWidth + 'px';
    luckyMoneyContainer.appendChild(luckyMoney);

    luckyMoney.addEventListener('click', () => {
        bananas += 100000;
        updateBananaCount();
        showMoneyPopup(luckyMoney);
        luckyMoney.remove();
    });

    setTimeout(() => luckyMoney.remove(), 5000);
}

function showMoneyPopup(element) {
    const popup = document.createElement('div');
    popup.classList.add('money-popup');
    popup.textContent = '+ 1 pass môn';
    const rect = element.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.zIndex = '99999'; // Add this line to set a high z-index
    popup.style.top = `${rect.top + rect.height + 10}px`;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function startLuckyMoneyAnimation() {
    console.log('Lucky money animation started');
    setInterval(createLuckyMoney, 2000);
}

// Start the lucky money animation when the page loads
window.addEventListener('load', () => {
    console.log('Window loaded');
    startLuckyMoneyAnimation();
    // Các khởi tạo khác nếu cần
});

document.addEventListener('DOMContentLoaded', () => {
    const helpButton = document.getElementById('help-button');
    const helpModal = document.getElementById('help-modal');
    const closeHelpModal = document.getElementById('close-help-modal');
    const helpContent = document.getElementById('help-content');

    helpButton.addEventListener('click', () => {
        helpModal.style.display = 'block';
        setTimeout(() => {
            helpModal.classList.add('show');
        }, 10);
        helpContent.innerHTML = `
            <h3>Mục tiêu:</h3>
            <p>Đặt cược vào các biểu tượng (Bầu, Cua, Tôm, Cá, Gà, Nai) và dự đoán kết quả của 3 xúc xắc.</p>

            <h3>Cách chơi:</h3>
            <ol>
                <li>Đặt cược: Nhấp vào biểu tượng bạn muốn đặt cược. Nhập số chuối bạn muốn đặt.</li>
                <li>Xóc đĩa: Sau khi đặt cược, nhấn nút "Roll Dice" để xóc đĩa.</li>
                <li>Kết quả: 3 xúc xắc sẽ hiển thị kết quả. Nếu kết quả trùng với biểu tượng bạn đặt cược, bạn sẽ thắng.</li>
            </ol>

            <h3>Cách tính tiền thắng:</h3>
            <ul>
                <li>Nếu biểu tượng bạn đặt cược xuất hiện 1 lần: Nhận lại tiền cược + 1 lần tiền cược</li>
                <li>Nếu biểu tượng xuất hiện 2 lần: Nhận lại tiền cược + 2 lần tiền cược</li>
                <li>Nếu biểu tượng xuất hiện 3 lần: Nhận lại tiền cược + 3 lần tiền cược</li>
            </ul>

            <h3>Các tính năng khác:</h3>
            <ul>
                <li>Nạp Tiền: Nhấn nút "Nạp Tiền" để thêm chuối vào tài khoản.</li>
                <li>Reset Game: Nhấn nút "Reset Game" để đặt lại tất cả các cược về 0.</li>
                <li>Lucky Money: Nhấp vào các phong bì lì xì rơi xuống để nhận thêm chuối.</li>
            </ul>

            <h3>Lưu ý:</h3>
            <p>Hãy chơi có trách nhiệm và chỉ đặt cược trong khả năng của bạn. Đây chỉ là trò chơi giải trí!</p>
        `;
    });

    function closeHelpModalFunction() {
        helpModal.classList.remove('show');
        setTimeout(() => {
            helpModal.style.display = 'none';
        }, 300);
    }

    closeHelpModal.addEventListener('click', closeHelpModalFunction);

    window.addEventListener('click', (event) => {
        if (event.target === helpModal) {
            closeHelpModalFunction();
        }
    });
});
