const betItems = document.querySelectorAll('.bet-item');
const rollButton = document.getElementById('roll-button');
const bananaCount = document.getElementById('banana-count');
const resultModal = document.getElementById('result-modal');
const resultMessage = document.getElementById('result-message');
const closeModal = document.getElementById('close-modal');
const helpButton = document.getElementById('help-button');
const helpModal = document.getElementById('help-modal');
const closeHelpModal = document.getElementById('close-help-modal');
const helpContent = document.getElementById('help-content');
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
    Faces(); 

}).catch(error => {
    console.error("Error loading images:", error);
});
function Faces() {
    diceElements.forEach(dice => {
        const faces = dice.querySelectorAll('.dice-face');
        faces.forEach((face, index) => {
            const item = items[index];
            face.style.backgroundImage = `url('${images[item].src}')`;
            face.style.backgroundSize = 'cover';
        });
        // Set initial rotation to show the front face
        dice.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
}


const diceElements = [
    document.getElementById('dice1'),
    document.getElementById('dice2'),
    document.getElementById('dice3')
];

let bananas = 5000000; // 5 million bananas
let bets = {
    bau: 0,
    cua: 0,
    tom: 0,
    ca: 0,
    ga: 0,
    nai: 0
};

let recoveryChances = 3;
let hasRecovered = false;
let hasShownCongratulations = false;

function updateBananaCount() {
    bananaCount.textContent = bananas.toLocaleString();
    document.getElementById('recovery-chances').textContent = `Số lần giải cứu bị sạch tiền còn lại: ${recoveryChances}`;
    
    console.log('Current bananas:', bananas); // Thêm dòng này
    
    if (bananas >= 100000000 && !hasShownCongratulations) {
        console.log('Showing congratulations modal'); // Thêm dòng này
        hasShownCongratulations = true;
        showCongratulationsModal();
    }
}

function showCongratulationsModal() {
    console.log('Creating congratulations modal'); // Thêm dòng này
    const modal = document.createElement('div');
    modal.className = 'modal-congratulations';
    modal.innerHTML = `
        <div class="modal-congratulations-content">

            <h2 style="color: red!important;">Chúc mừng!</h2>
            <p>Bạn đỉnh vãi ò =))) Chúng mừng bạn đã thành công chơi thử app và chơi thành công đạt được mốc 100 triệu!</p>
            <p>Đây là link FB của mình: <a href="https://www.facebook.com/thepp.tan/" target="_blank">@thepp.tan</a></p>
            <p>Hãy để lại đánh giá nhé!</p>
            <button id="close-congratulations-modal">Đóng</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('close-congratulations-modal').addEventListener('click', () => {
        modal.remove();
    });
}

function placeBet(item) {
    if (bananas === 0) {
        alert('Bạn không có đủ chuối để đặt cược. Hãy đợi kết quả roll dice để được giải cứu nếu còn lượt.');
        return;
    }
    showBetModal(item);
}

function calculateWinnings(results) {
    let winnings = 0;
    results.forEach(result => {
        winnings += bets[result] * 2;
    });
    return winnings;
}

function showBetModal(item) {
    const modal = document.getElementById('bet-modal');
    const slider = document.getElementById('bet-slider');
    const betAmount = document.getElementById('bet-amount');
    const confirmBet = document.getElementById('confirm-bet');
    const cancelBet = document.getElementById('cancel-bet');

    slider.max = bananas;
    slider.value = 0;
    betAmount.textContent = '0';

    modal.style.display = 'block';

    slider.oninput = function() {
        betAmount.textContent = parseInt(this.value).toLocaleString();
    }

    confirmBet.onclick = function() {
        const amount = parseInt(slider.value);
        if (amount > 0) {
            bets[item] += amount;
            bananas -= amount;
            updateBananaCount();
            document.querySelector(`.bet-item[data-item="${item}"] .bet-amount`).textContent = bets[item].toLocaleString();
        }
        modal.style.display = 'none';
    }

    cancelBet.onclick = function() {
        modal.style.display = 'none';
    }
}

function resetBets() {
    for (let item in bets) {
        bets[item] = 0;
        document.querySelector(`.bet-item[data-item="${item}"] .bet-amount`).textContent = '0';
    }
    // Không cộng lại tiền vào bananas ở đây
}

function rollDice() {
    const result = Math.floor(Math.random() * items.length);
    console.log("rollDice result:", result, items[result]);
    return result;
}

function getRandomRotation() {
    return [
        Math.floor(Math.random() * 360),
        Math.floor(Math.random() * 360),
        Math.floor(Math.random() * 360)
    ];
}

function getFinalRotation(result) {
    const rotations = [
        [0, 0],     // bau (mặt trước)
        [0, -90],   // cua (mặt phải)
        [0, 180],   // tom (mặt sau)
        [0, 90],    // ca (mặt trái)
        [-90, 0],   // ga (mặt trên)
        [90, 0]     // nai (mặt dưới)
    ];
    return rotations[items.indexOf(result)];
}


function updateDiceFace(dice, item) { // Fix this thing 
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
                const results = [rollDice(), rollDice(), rollDice()].map(index => items[index]);
                console.log("Kết quả roll:", results);
                diceElements.forEach((dice, index) => {
                    const [rotateX, rotateY] = getFinalRotation(results[index]);
                    dice.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    updateDiceFace(dice, results[index], index);
                    console.log(`Dice ${index + 1} final rotation: rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
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
    console.log("Kết quả cuối cùng:", results);
    let message = `Kết quả: ${results.join(', ')}\n`;
    if (winnings > 0) {
        message += `Chúc mừng! Bạn đã thắng ${winnings.toLocaleString()} chuối!`;
        createFireworks(); // Chỉ gọi createFireworks khi người chơi thắng
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
            checkForRecovery(); // Kiểm tra giải cứu sau khi đã tính toán kết quả
        });
    } else {
        alert('Vui lòng đặt cược trước khi xóc đĩa.');
    }
});

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

updateBananaCount();

function Faces() {
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
    fireworksContainer.innerHTML = ''; // Clear previous fireworks

    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < 50; i++) { // Increase number of fireworks
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            
            const size = Math.random() * 15 + 5; // Random size between 5px and 20px
            firework.style.width = `${size}px`;
            firework.style.height = `${size}px`;
            
            firework.style.left = Math.random() * 100 + 'vw';
            firework.style.top = Math.random() * 100 + 'vh';
            firework.style.setProperty('--x', (Math.random() - 0.5) * 200 + 'px');
            firework.style.setProperty('--y', (Math.random() - 0.5) * 200 + 'px');
            
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            firework.style.color = firework.style.backgroundColor; // For the glow effect

            fireworksContainer.appendChild(firework);

            setTimeout(() => {
                firework.remove();
            }, 1500); // Remove after animation completes
        }, i * 50); // Stagger the creation of fireworks
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

function checkForRecovery() {
    if (bananas === 0 && recoveryChances > 0) {
        bananas = 1000000; // Hoặc số lượng chuối bạn muốn cấp khi giải cứu
        recoveryChances--;
        updateBananaCount();
        alert(`Bạn đã được hồi phục 1.000.000 chuối. Còn ${recoveryChances} lần hồi phục.`);
        return true; // Trả về true nếu đã thực hiện giải cứu
    }
    return false; // Trả về false nếu không cần giải cứu
}
const rescueButton = document.getElementById('rescue-button');

function updateRescueButtonVisibility() {
    rescueButton.style.display = (bananas === 0 && recoveryChances > 0) ? 'block' : 'none';
}

rescueButton.addEventListener('click', () => {
    if (checkForRecovery()) {
        updateRescueButtonVisibility();
        
    }
});

// Gọi hàm này sau mỗi lần cập nhật số chuối
updateRescueButtonVisibility();
