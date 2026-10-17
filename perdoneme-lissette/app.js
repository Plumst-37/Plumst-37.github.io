document.addEventListener("DOMContentLoaded", () => {
  const btnSi = document.getElementById("btnSi");
  const btnNo = document.getElementById("btnNo");
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
    "¡Di que sí! 💕",
    "¡No se vale! 😜",
    "¡Snoopy llora! 🐶",
    "¡Kitty llora! 🎀",
    "¡Porfavooor! 💖"
  ];

  const prompts = [
    "Por favor... 🐾🎀",
    "¡Snoopy y Kitty te lo piden! 🥺",
    "¡No nos dejes tristes! 😿",
    "¡Mira qué caritas tenemos! 🐶",
    "¡Solo dale al Sí! 💕"
  ];

  function moveButtonNo() {
    noEscapeCount++;
    btnNo.classList.add("escaped");

    const btnWidth = btnNo.offsetWidth || 110;
    const btnHeight = btnNo.offsetHeight || 45;
    const padding = 20;

    const maxX = window.innerWidth - btnWidth - padding;
    const maxY = window.innerHeight - btnHeight - padding;

    const randomX = Math.max(padding, Math.floor(Math.random() * maxX));
    const randomY = Math.max(padding, Math.floor(Math.random() * maxY));

    btnNo.style.left = `${randomX}px`;
    btnNo.style.top = `${randomY}px`;

    // Cambiar texto del botón
    btnNo.textContent = noPhrases[(noEscapeCount - 1) % noPhrases.length];

    // Cambiar prompt
    promptText.textContent = prompts[(noEscapeCount - 1) % prompts.length];

    // Crecer el botón Sí
    const newScale = Math.min(1.0 + noEscapeCount * 0.08, 1.5);
    btnSi.style.transform = `scale(${newScale})`;
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

  // Repetir
  btnReplay.addEventListener("click", () => {
    noEscapeCount = 0;
    btnSi.style.transform = "scale(1)";
    btnNo.classList.remove("escaped", "hidden");
    btnNo.style.position = "relative";
    btnNo.style.left = "auto";
    btnNo.style.top = "auto";
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
