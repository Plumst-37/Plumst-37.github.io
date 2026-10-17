document.addEventListener("DOMContentLoaded", () => {
  const btnSi = document.getElementById("btnSi");
  const btnNo = document.getElementById("btnNo");
  const buttonsArea = document.getElementById("buttonsArea");
  const apologyCard = document.getElementById("apologyCard");
  const successCard = document.getElementById("successCard");
  const promptText = document.getElementById("promptText");
  const btnReplay = document.getElementById("btnReplay");
  const floatingBg = document.getElementById("floatingBg");
  const confettiCanvas = document.getElementById("confettiCanvas");

  let noEscapeCount = 0;
  let animationId = null;
  let confettiInterval = null;

  // Fondo flotante de corazones y lazos
  const floatIcons = ["🌸", "🎀", "🐾", "✨", "💕", "💖", "🌷"];
  function initFloatingBackground() {
    floatingBg.innerHTML = "";
    for (let i = 0; i < 18; i++) {
      const item = document.createElement("span");
      item.className = "float-item";
      item.textContent = floatIcons[Math.floor(Math.random() * floatIcons.length)];
      item.style.left = Math.random() * 95 + "vw";
      item.style.fontSize = Math.floor(Math.random() * 14 + 18) + "px";
      item.style.animationDuration = Math.random() * 7 + 8 + "s";
      item.style.animationDelay = Math.random() * 6 + "s";
      floatingBg.appendChild(item);
    }
  }
  initFloatingBackground();

  // Frases cortas y tiernas para el botón No
  const noPhrases = [
    "¿Segura? 🥺",
    "¡Piénsalo! 😿",
    "¡Por favor! 😭",
    "¡No seas mala! 🥺",
    "¡Casi no me ves! 🤏",
    "¡Ya me voy! 🙈"
  ];

  const prompts = [
    "Por favor... 🐾🎀",
    "¡Snoopy y Kitty te lo piden! 🥺",
    "¡No nos dejes tristes! 😿",
    "¡Mira cómo se encoge! 🤏🥺",
    "¡Ya casi desaparece el No! 🤭",
    "¡Solo te queda decir que Sí! 💕"
  ];

  // Función para mover y encoger el botón No hasta que desaparezca
  function moveButtonNo() {
    noEscapeCount++;

    // Límite de intentos antes de desaparecer por completo (6 intentos)
    const maxAttempts = 6;

    if (noEscapeCount >= maxAttempts) {
      btnNo.style.transform = "scale(0)";
      btnNo.style.opacity = "0";
      btnNo.style.pointerEvents = "none";
      setTimeout(() => {
        btnNo.classList.add("hidden");
      }, 250);

      promptText.textContent = "¡Ups! El 'No' desapareció... ¡Solo queda decir que Sí! 🤭💖";
      btnSi.style.transform = "scale(1.4)";
      return;
    }

    // Mover el botón directamente al body para evitar distorsión de coordenadas
    if (btnNo.parentElement !== document.body) {
      document.body.appendChild(btnNo);
    }
    btnNo.classList.add("escaped");

    // Cambiar texto
    const phraseIndex = Math.min(noEscapeCount - 1, noPhrases.length - 1);
    btnNo.textContent = noPhrases[phraseIndex];

    // Cambiar mensajito superior
    const promptIndex = Math.min(noEscapeCount - 1, prompts.length - 1);
    promptText.textContent = prompts[promptIndex];

    // Encoger el botón No progresivamente
    // 1 -> 0.82 -> 0.65 -> 0.48 -> 0.30 -> desaparece
    const noScale = Math.max(0.25, (1.0 - noEscapeCount * 0.16)).toFixed(2);
    btnNo.style.transform = `scale(${noScale})`;

    // Crecer el botón Sí poco a poco
    const siScale = Math.min(1.0 + noEscapeCount * 0.08, 1.45).toFixed(2);
    btnSi.style.transform = `scale(${siScale})`;

    // Obtener dimensiones reales del botón y de la ventana visible
    const btnRect = btnNo.getBoundingClientRect();
    const btnWidth = btnRect.width || 100;
    const btnHeight = btnRect.height || 45;

    // Márgenes de seguridad para que NUNCA se salga de los bordes de la pantalla
    const margin = 24;
    const screenW = Math.max(window.innerWidth, document.documentElement.clientWidth);
    const screenH = Math.max(window.innerHeight, document.documentElement.clientHeight);

    const maxX = Math.max(margin, screenW - btnWidth - margin);
    const maxY = Math.max(margin, screenH - btnHeight - margin);

    const randomX = Math.floor(Math.random() * (maxX - margin)) + margin;
    const randomY = Math.floor(Math.random() * (maxY - margin)) + margin;

    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;
  }

  btnNo.addEventListener("mouseenter", moveButtonNo);
  btnNo.addEventListener("touchstart", (e) => {
    e.preventDefault();
    moveButtonNo();
  }, { passive: false });
  btnNo.addEventListener("click", (e) => {
    e.preventDefault();
    moveButtonNo();
  });

  // Botón ¡Sí!
  btnSi.addEventListener("click", () => {
    btnNo.classList.add("hidden");
    apologyCard.classList.add("hidden");
    successCard.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });
    startConfettiCelebration();
  });

  // Repetir / Reiniciar
  btnReplay.addEventListener("click", () => {
    noEscapeCount = 0;
    btnSi.style.transform = "scale(1)";

    // Devolver el botón No a su contenedor original
    if (buttonsArea && btnNo.parentElement !== buttonsArea) {
      buttonsArea.appendChild(btnNo);
    }

    btnNo.classList.remove("escaped", "hidden");
    btnNo.style.position = "";
    btnNo.style.left = "";
    btnNo.style.top = "";
    btnNo.style.transform = "scale(1)";
    btnNo.style.opacity = "1";
    btnNo.style.pointerEvents = "auto";
    btnNo.textContent = "No 💔";
    promptText.textContent = "Por favor... 🐾🎀";

    successCard.classList.add("hidden");
    apologyCard.classList.remove("hidden");

    stopConfetti();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Motor de confeti y corazones
  const ctx = confettiCanvas.getContext("2d");
  let particles = [];

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  const confettiColors = ["#ff476f", "#ff80a0", "#ffd166", "#06d6a0", "#118ab2", "#ffb703", "#ffffff"];

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(initial = false) {
      this.x = Math.random() * confettiCanvas.width;
      this.y = initial ? Math.random() * confettiCanvas.height : -20;
      this.size = Math.random() * 9 + 6;
      this.speedY = Math.random() * 3 + 2.5;
      this.speedX = (Math.random() - 0.5) * 3;
      this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      this.rotation = Math.random() * 360;
      this.rotationSpeed = (Math.random() - 0.5) * 8;
      this.type = Math.random() > 0.4 ? "rect" : "heart";
      this.opacity = Math.random() * 0.4 + 0.6;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      if (this.y > confettiCanvas.height + 20) this.reset(false);
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      if (this.type === "rect") {
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
      } else {
        ctx.fillStyle = "#ff2a5f";
        ctx.font = `${this.size * 1.5}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❤️", 0, 0);
      }
      ctx.restore();
    }
  }

  function startConfettiCelebration() {
    particles = [];
    const count = Math.min(window.innerWidth < 600 ? 60 : 120, 140);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    if (animationId) cancelAnimationFrame(animationId);

    function render() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      for (const p of particles) {
        p.update();
        p.draw();
      }
      animationId = requestAnimationFrame(render);
    }
    render();

    if (confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(() => {
      for (let i = 0; i < 15; i++) {
        if (particles.length < 150) particles.push(new Particle());
      }
    }, 2500);
  }

  function stopConfetti() {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (confettiInterval) {
      clearInterval(confettiInterval);
      confettiInterval = null;
    }
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
});
