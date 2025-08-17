document.addEventListener('DOMContentLoaded', () => {
    const optionInput = document.getElementById('option-input');
    const addOptionBtn = document.getElementById('add-option-btn');
    const optionsList = document.getElementById('options-list');
    const pickRandomBtn = document.getElementById('pick-random-btn');
    const resultDiv = document.getElementById('result');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const confettiCanvas = document.getElementById('confetti-canvas');

    const myConfetti = confetti.create(confettiCanvas, { resize: true });

    let options = JSON.parse(localStorage.getItem('pickerOptions')) || [];
    let history = JSON.parse(localStorage.getItem('pickerHistory')) || [];

    const saveOptions = () => {
        localStorage.setItem('pickerOptions', JSON.stringify(options));
    };

    const saveHistory = () => {
        localStorage.setItem('pickerHistory', JSON.stringify(history));
    };

    const renderOptions = () => {
        optionsList.innerHTML = '';
        options.forEach((option, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = option;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.className = 'remove-btn';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                options.splice(index, 1);
                saveOptions();
                renderOptions();
            });
            li.appendChild(removeBtn);
            optionsList.appendChild(li);
        });
    };

    const renderHistory = () => {
        historyList.innerHTML = '';
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = item;
            historyList.appendChild(li);
        });
    };

    addOptionBtn.addEventListener('click', () => {
        const optionText = optionInput.value.trim();
        if (optionText) {
            options.push(optionText);
            optionInput.value = '';
            saveOptions();
            renderOptions();
        }
    });

    optionInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addOptionBtn.click();
        }
    });

    pickRandomBtn.addEventListener('click', () => {
        if (options.length === 0) {
            resultDiv.textContent = 'Add options first!';
            return;
        }

        resultDiv.classList.remove('animated');
        let duration = 3000;
        const interval = 100;
        let elapsed = 0;

        pickRandomBtn.disabled = true;

        const randomizer = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * options.length);
            resultDiv.textContent = options[randomIndex];
            elapsed += interval;

            if (elapsed >= duration) {
                clearInterval(randomizer);
                const finalChoice = options[Math.floor(Math.random() * options.length)];
                resultDiv.textContent = finalChoice;
                resultDiv.classList.add('animated');
                
                history.unshift(finalChoice);
                if(history.length > 10) history.pop();
                saveHistory();
                renderHistory();
                pickRandomBtn.disabled = false;

                myConfetti({
                    particleCount: 150,
                    spread: 180,
                    origin: { y: 0.6 }
                });
            }
        }, interval);
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        saveHistory();
        renderHistory();
    });

    renderOptions();
    renderHistory();
});