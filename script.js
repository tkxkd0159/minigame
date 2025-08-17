document.addEventListener('DOMContentLoaded', () => {
    const optionsInput = document.getElementById('options-input');
    const pickRandomBtn = document.getElementById('pick-random-btn');
    const resultDiv = document.getElementById('result');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const balloonContainer = document.getElementById('balloon-container');

    const myConfetti = confetti.create(confettiCanvas, { resize: true });
    const pastelColors = ['#FFADAD', '#A0C4FF', '#9BF6CF', '#FDFFB6', '#BDB2FF', '#FFD6A5'];

    let history = JSON.parse(localStorage.getItem('pickerHistory')) || [];

    const saveHistory = () => {
        localStorage.setItem('pickerHistory', JSON.stringify(history));
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        history.forEach(item => {
            const historyCard = document.createElement('div');
            historyCard.className = 'history-entry';

            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header text-muted small';
            cardHeader.textContent = new Date(item.timestamp).toLocaleString();

            const list = document.createElement('ul');
            list.className = 'list-group list-group-flush';

            item.options.forEach(opt => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                if (opt === item.picked) {
                    li.classList.add('picked');
                }
                li.textContent = opt;
                list.appendChild(li);
            });

            historyCard.appendChild(cardHeader);
            historyCard.appendChild(list);
            historyList.appendChild(historyCard);
        });
    };

    const playBalloonAnimation = (options) => {
        let balloons = '';
        options.forEach((option, index) => {
            const color = pastelColors[index % pastelColors.length];
            const delay = Math.random() * 2;
            const duration = 4 + Math.random() * 3;
            const xEnd = (Math.random() * 200 - 100) + 'px';
            const rotateEnd = (Math.random() * 40 - 20) + 'deg';

            balloons += `<div class="balloon" style="--x-end: ${xEnd}; --rotate-end: ${rotateEnd}; background-color: ${color}; left: ${Math.random() * 100}%; animation-delay: ${delay}s; animation-duration: ${duration}s;">${option}</div>`;
        });
        balloonContainer.innerHTML = balloons;

        setTimeout(() => {
            balloonContainer.innerHTML = '';
        }, 8000);
    };

    pickRandomBtn.addEventListener('click', () => {
        const options = optionsInput.value.split('\n').map(s => s.trim()).filter(s => s !== '');

        if (options.length < 2) {
            resultDiv.textContent = 'Add at least 2 options!';
            return;
        }

        pickRandomBtn.disabled = true;
        resultDiv.textContent = '';
        resultDiv.classList.remove('animated');
        playBalloonAnimation(options);

        setTimeout(() => {
            const finalChoice = options[Math.floor(Math.random() * options.length)];
            resultDiv.textContent = finalChoice;
            resultDiv.classList.add('animated');

            const historyEntry = {
                picked: finalChoice,
                options: [...options],
                timestamp: new Date().toISOString()
            };

            history.unshift(historyEntry);
            if (history.length > 20) history.pop(); // Increased history limit
            saveHistory();
            renderHistory();
            pickRandomBtn.disabled = false;

            myConfetti({
                particleCount: 200,
                spread: 90,
                origin: { y: 0.6 },
                colors: pastelColors
            });
        }, 4000);
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        saveHistory();
        renderHistory();
    });

    renderHistory();
});