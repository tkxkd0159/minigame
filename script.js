document.addEventListener("DOMContentLoaded", () => {
  const optionsInput = document.getElementById("options-input");
  const pickRandomBtn = document.getElementById("pick-random-btn");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const balloonContainer = document.getElementById("balloon-container");

  // Modal elements
  const winnerModal = document.getElementById("winnerModal");
  const winnerDisplay = document.getElementById("winner-display");

  const myConfetti = confetti.create(confettiCanvas, { resize: true });
  const pastelColors = [
    "#FFADAD",
    "#A0C4FF",
    "#9BF6CF",
    "#FDFFB6",
    "#BDB2FF",
    "#FFD6A5",
  ];

  let history = JSON.parse(localStorage.getItem("pickerHistory")) || [];

  // Fix: Check for incompatible history data and clear it if necessary.
  if (
    history.length > 0 &&
    (typeof history[0] !== "object" || !history[0].hasOwnProperty("picked"))
  ) {
    console.warn("Incompatible history format detected. Clearing history.");
    history = [];
    localStorage.setItem("pickerHistory", JSON.stringify(history));
  }

  const saveHistory = () => {
    localStorage.setItem("pickerHistory", JSON.stringify(history));
  };

  const renderHistory = () => {
    historyList.innerHTML = "";
    history.forEach((item, index) => {
      const uniqueId = `history-item-${index}`;

      const historyCard = document.createElement("div");
      historyCard.className = "history-entry";

      const cardHeader = document.createElement("div");
      cardHeader.className = "history-header p-2";
      cardHeader.setAttribute("data-bs-toggle", "collapse");
      cardHeader.setAttribute("data-bs-target", `#${uniqueId}`);
      cardHeader.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
        <span class="fw-bold"><i class="fas fa-star me-2"></i> ${
          item.picked
        }</span>
        <span class="text-muted small">${new Date(
          item.timestamp
        ).toLocaleString()}</span>
    </div>
`;

      const collapseContainer = document.createElement("div");
      collapseContainer.id = uniqueId;
      collapseContainer.className = "collapse";

      const list = document.createElement("ul");
      list.className = "list-group list-group-flush p-2";

      item.options.forEach((opt) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        if (opt === item.picked) {
          li.classList.add("picked");
        }
        li.textContent = opt;
        list.appendChild(li);
      });

      collapseContainer.appendChild(list);
      historyCard.appendChild(cardHeader);
      historyCard.appendChild(collapseContainer);
      historyList.appendChild(historyCard);
    });
  };

  const playBalloonAnimation = (options) => {
    let balloons = "";
    options.forEach((option, index) => {
      const color = pastelColors[index % pastelColors.length];
      const delay = Math.random() * 2;
      const duration = 4 + Math.random() * 3;
      const xEnd = Math.random() * 200 - 100 + "px";
      const rotateEnd = Math.random() * 40 - 20 + "deg";

      balloons += `<div class="balloon" style="--x-end: ${xEnd}; --rotate-end: ${rotateEnd}; background-color: ${color}; left: ${
        Math.random() * 100
      }%; animation-delay: ${delay}s; animation-duration: ${duration}s;">${option}</div>`;
    });
    balloonContainer.innerHTML = balloons;

    setTimeout(() => {
      balloonContainer.innerHTML = "";
    }, 8000);
  };

  pickRandomBtn.addEventListener("click", () => {
    const options = optionsInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (options.length < 2) {
      // Use Bootstrap's alert or a simple text update for feedback
      alert("Please add at least 2 options!"); // Simple alert for now
      return;
    }

    pickRandomBtn.disabled = true;
    playBalloonAnimation(options);

    setTimeout(() => {
      const finalChoice = options[Math.floor(Math.random() * options.length)];

      winnerDisplay.textContent = finalChoice; // Update modal content
      new bootstrap.Modal(winnerModal).show(); // Show the modal

      const historyEntry = {
        picked: finalChoice,
        options: [...options],
        timestamp: new Date().toISOString(),
      };

      history.unshift(historyEntry);
      if (history.length > 20) history.pop();
      saveHistory();
      renderHistory();
      pickRandomBtn.disabled = false;

      myConfetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 },
        colors: pastelColors,
      });
    }, 4000);
  });

  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    saveHistory();
    renderHistory();
  });

  renderHistory();
});
