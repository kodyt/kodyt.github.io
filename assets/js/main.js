const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const themeToggle = document.querySelector('.theme-toggle');
const themeStorageKey = 'kody-theme';
const gameTrigger = document.querySelector('[data-reveal-game]');
const gameSection = document.getElementById('game');

const applyTheme = (mode) => {
  document.body.classList.toggle('dark', mode === 'dark');
  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(mode === 'dark'));
  }
};

const storedTheme = localStorage.getItem(themeStorageKey);
if (storedTheme) {
  applyTheme(storedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  applyTheme('dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem(themeStorageKey, isDark ? 'dark' : 'light');
    themeToggle.setAttribute('aria-pressed', String(isDark));
  });
}

if (gameTrigger && gameSection) {
  gameTrigger.addEventListener('click', (event) => {
    event.preventDefault();
    gameSection.classList.remove('game-hidden');
    gameSection.classList.add('visible');
    gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

reveals.forEach((section) => revealObserver.observe(section));

// Particle background
const canvas = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let particles = [];
  let particleColor = 'rgba(110, 243, 255, 0.7)';

  const updateParticleColor = () => {
    const accent = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    if (accent) {
      particleColor = `${accent}CC`;
    }
  };

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(devicePixelRatio, devicePixelRatio);
  };

  const createParticles = () => {
    const count = Math.min(70, Math.floor(width / 20));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.6,
      alpha: 0.2 + Math.random() * 0.6,
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = particleColor;

    particles.forEach((p) => {
      p.y -= p.speed;
      if (p.y < -10) {
        p.y = height + 10;
        p.x = Math.random() * width;
      }
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  };

  const init = () => {
    resize();
    updateParticleColor();
    createParticles();
    draw();
  };

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', updateParticleColor);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ctx.clearRect(0, 0, width, height);
  } else {
    init();
  }
}

// Tic-tac-toe bot
const tttCells = document.querySelectorAll('.ttt-cell');
const tttMessage = document.getElementById('ttt-message');
const tttReset = document.querySelector('.ttt-reset');
const tttPlayerScore = document.getElementById('ttt-player-score');
const tttBotScore = document.getElementById('ttt-bot-score');
const tttDrawScore = document.getElementById('ttt-draw-score');

if (tttCells.length) {
  const state = Array(9).fill('');
  const human = 'X';
  const bot = 'O';
  let isOver = false;
  const scores = { player: 0, bot: 0, draw: 0 };

  const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  const checkWinner = (player) =>
    winCombos.some((combo) => combo.every((index) => state[index] === player));

  const emptyCells = () => state.map((value, index) => (value ? null : index)).filter((v) => v !== null);

  const setMessage = (text) => {
    if (tttMessage) tttMessage.textContent = text;
  };

  const updateScores = () => {
    if (tttPlayerScore) tttPlayerScore.textContent = scores.player;
    if (tttBotScore) tttBotScore.textContent = scores.bot;
    if (tttDrawScore) tttDrawScore.textContent = scores.draw;
  };

  const botMove = () => {
    if (isOver) return;
    const empties = emptyCells();
    if (!empties.length) return;

    let move = empties.find((index) => {
      state[index] = bot;
      const win = checkWinner(bot);
      state[index] = '';
      return win;
    });

    if (move === undefined) {
      move = empties.find((index) => {
        state[index] = human;
        const win = checkWinner(human);
        state[index] = '';
        return win;
      });
    }

    if (move === undefined) {
      move = empties.includes(4) ? 4 : empties[Math.floor(Math.random() * empties.length)];
    }

    placeMove(move, bot);
    if (checkWinner(bot)) {
      isOver = true;
      scores.bot += 1;
      updateScores();
      setMessage('I win.');
      return;
    }
    if (!emptyCells().length) {
      isOver = true;
      scores.draw += 1;
      updateScores();
      setMessage('Draw.');
      return;
    }
    setMessage('Your move.');
  };

  const placeMove = (index, player) => {
    state[index] = player;
    const cell = tttCells[index];
    cell.textContent = player;
    cell.classList.add('filled');
    cell.setAttribute('aria-label', `Cell ${index + 1} ${player}`);
  };

  const handleClick = (event) => {
    const cell = event.currentTarget;
    const index = Number(cell.dataset.index);
    if (isOver || state[index]) return;
    placeMove(index, human);
    if (checkWinner(human)) {
      isOver = true;
      scores.player += 1;
      updateScores();
      setMessage('You win...');
      return;
    }
    if (!emptyCells().length) {
      isOver = true;
      scores.draw += 1;
      updateScores();
      setMessage('Draw, I guess...');
      return;
    }
    setMessage('Kody is thinking...');
    setTimeout(botMove, 300);
  };

  const resetGame = () => {
    state.fill('');
    isOver = false;
    tttCells.forEach((cell, index) => {
      cell.textContent = '';
      cell.classList.remove('filled');
      cell.setAttribute('aria-label', `Cell ${index + 1}`);
    });
    setMessage('Your move.');
  };

  tttCells.forEach((cell) => cell.addEventListener('click', handleClick));
  if (tttReset) tttReset.addEventListener('click', resetGame);
  updateScores();
  resetGame();
}
