document.addEventListener("DOMContentLoaded", () => {
  const optionsInput = document.getElementById("options-input");
  const pickRandomBtn = document.getElementById("pick-random-btn");
  const historyList = document.getElementById("history-list");
  const clearHistoryBtn = document.getElementById("clear-history-btn");
  const confettiCanvas = document.getElementById("confetti-canvas");
  const balloonContainer = document.getElementById("balloon-container");
  const bgParticlesContainer = document.getElementById("bg-particles");

  // Modal elements
  const winnerModal = document.getElementById("winnerModal");
  const winnerDisplay = document.getElementById("winner-display");
  const warningModal = document.getElementById("warningModal"); // Get reference to warning modal

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

  // Background particles system
  let backgroundParticlesInterval;
  let isBackgroundPaused = false;

  const createBackgroundParticle = () => {
    const particle = document.createElement("div");
    particle.className = "bg-particle";

    // Random size
    const sizes = ["small", "medium", "large"];
    const size = sizes[Math.floor(Math.random() * sizes.length)];
    particle.classList.add(size);

    // Random color from pastel palette
    const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    particle.style.backgroundColor = color;

    // Random horizontal position
    particle.style.left = Math.random() * 100 + "%";

    // Random animation
    const animations = ["anim1", "anim2", "anim3"];
    const animation = animations[Math.floor(Math.random() * animations.length)];
    particle.classList.add(animation);

    // Random delay
    particle.style.animationDelay = Math.random() * 3 + "s";

    bgParticlesContainer.appendChild(particle);

    // Remove particle after animation completes
    const animationDuration =
      animation === "anim1" ? 8000 : animation === "anim2" ? 10000 : 12000;
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, animationDuration + 3000);
  };

  const startBackgroundParticles = () => {
    if (backgroundParticlesInterval) return;

    bgParticlesContainer.classList.remove("bg-particles-paused");
    isBackgroundPaused = false;

    // Create initial particles
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createBackgroundParticle(), i * 500);
    }

    // Continue creating particles
    backgroundParticlesInterval = setInterval(() => {
      if (!isBackgroundPaused) {
        createBackgroundParticle();
      }
    }, 1000);
  };

  const pauseBackgroundParticles = () => {
    isBackgroundPaused = true;
    bgParticlesContainer.classList.add("bg-particles-paused");
  };

  const resumeBackgroundParticles = () => {
    isBackgroundPaused = false;
    bgParticlesContainer.classList.remove("bg-particles-paused");
  };

  // Start background particles when page loads
  startBackgroundParticles();

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
      const duration = 5 + Math.random() * 6; // Longer duration for more playful movement
      const xEnd = Math.random() * 300 - 150 + "px"; // Increased movement range
      const rotateEnd = Math.random() * 60 - 30 + "deg"; // More rotation
      const wobbleDelay = Math.random() * 3 + "s";
      const sparkleDelay = Math.random() * 2 + "s";

      // Control initial positioning
      const leftPosition = Math.random() * 80 + 10; // Keep balloons within 10-90% to avoid edges
      const startBottom = -400 - Math.random() * 100; // Vary starting bottom position slightly

      balloons += `<div class="balloon" style="
        --x-end: ${xEnd};
        --rotate-end: ${rotateEnd};
        --balloon-color: ${color};
        --start-bottom: ${startBottom}px;
        left: ${leftPosition}%;
        animation-duration: ${duration}s;
        --wobble-delay: ${wobbleDelay};
        --sparkle-delay: ${sparkleDelay};
      ">${option}</div>`;
    });
    balloonContainer.innerHTML = balloons;

    // Add extra cute floating elements after balloons are created
    setTimeout(() => {
      const balloonElements = balloonContainer.querySelectorAll(".balloon");
      balloonElements.forEach((balloon, index) => {
        const extraWobble = Math.random() * 2;
        balloon.style.setProperty("--extra-wobble", extraWobble + "s");
        balloon.style.animation += ", bounce 2s ease-in-out infinite";
      });
    }, 100);

    setTimeout(() => {
      balloonContainer.innerHTML = "";
    }, 8000); // Extended time to enjoy the cute movements
  };

  pickRandomBtn.addEventListener("click", () => {
    const options = optionsInput.value
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    if (options.length < 2) {
      new bootstrap.Modal(warningModal).show(); // Show warning modal
      return;
    }

    pickRandomBtn.disabled = true;

    // Pause background particles during picking
    pauseBackgroundParticles();

    playBalloonAnimation(options);

    setTimeout(() => {
      const finalChoice = options[Math.floor(Math.random() * options.length)];

      winnerDisplay.textContent = finalChoice; // Update modal content
      new bootstrap.Modal(winnerModal).show(); // Show the winner modal

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

      // Resume background particles after picking is complete
      setTimeout(() => {
        resumeBackgroundParticles();
      }, 1000);
    }, 4000);
  });

  clearHistoryBtn.addEventListener("click", () => {
    history = [];
    saveHistory();
    renderHistory();
  });

  renderHistory();
});
