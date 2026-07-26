/* ==========================================================================
   PRODUCTION BUG-FREE VECTOR LOGIC (TOP ALIGNED & UNSTOPPABLE SCROLL TO TOP)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Helper for absolute scroll to top
    function forceScrollToTop() {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    // ----------------------------------------------------
    // 1. AMBIENT WARM CANVAS PARTICLES (Floating Dust & Peony Sparkles)
    // ----------------------------------------------------
    const canvas = document.getElementById('ambient-canvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(25, Math.floor(width / 40));

    class AmbientParticle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = Math.random() * 2 + 0.8;
            this.color = Math.random() > 0.5 ? 'rgba(232, 93, 117, ' : 'rgba(255, 230, 200, ';
            this.alpha = Math.random() * 0.25 + 0.05;
            this.speedY = -(Math.random() * 0.3 + 0.08);
            this.speedX = (Math.random() - 0.5) * 0.2;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            if (this.y < -10 || this.x < -10 || this.x > width + 10) {
                this.y = height + 10;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ')';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new AmbientParticle());
    }

    function animateAmbient() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateAmbient);
    }
    animateAmbient();

    // ----------------------------------------------------
    // 2. VECTOR ENVELOPE UNSEALING & AUTO-SCROLL TO TOP
    // ----------------------------------------------------
    const envelopeWrapper = document.getElementById('envelope-wrapper');
    const envelopeSection = document.getElementById('envelope-section');
    const postcardSection = document.getElementById('postcard-section');
    const topFlapPath = document.getElementById('top-flap-path');
    const waxSeal = document.getElementById('envelope-seal');

    envelopeWrapper.addEventListener('click', () => {
        // Wax seal scale down effect
        waxSeal.style.transform = 'translateX(-50%) scale(0.5)';
        waxSeal.style.opacity = '0';
        waxSeal.style.transition = 'all 0.35s ease';

        setTimeout(() => {
            // Fold back vector top flap smoothly
            if (topFlapPath) {
                topFlapPath.style.transform = 'scaleY(-1)';
            }

            setTimeout(() => {
                envelopeSection.classList.remove('active');
                envelopeSection.classList.add('hidden');

                // Switch section and immediately force scroll to top
                postcardSection.classList.remove('hidden');
                postcardSection.classList.add('active');
                forceScrollToTop();

            }, 380);
        }, 160);
    });

    // ----------------------------------------------------
    // 3. 3D POSTCARD FLIP (FRONT / BACK)
    // ----------------------------------------------------
    const postcardCard = document.getElementById('postcard-card');
    const btnFlipToBack = document.getElementById('btn-flip-to-back');
    const btnFlipToFront = document.getElementById('btn-flip-to-front');

    function flipToBack() {
        postcardCard.classList.add('is-flipped');
        forceScrollToTop();
    }

    function flipToFront() {
        postcardCard.classList.remove('is-flipped');
        forceScrollToTop();
    }

    if (btnFlipToBack) btnFlipToBack.addEventListener('click', flipToBack);
    if (btnFlipToFront) btnFlipToFront.addEventListener('click', flipToFront);

    // ----------------------------------------------------
    // 4. RUNAWAY BUTTON "NO"
    // ----------------------------------------------------
    const btnNo = document.getElementById('btn-no');
    const runawayArea = document.getElementById('runaway-area');

    function escapeButton(e) {
        if (e) e.preventDefault();
        
        const areaRect = runawayArea.getBoundingClientRect();
        const btnRect = btnNo.getBoundingClientRect();

        const maxX = areaRect.width - btnRect.width;
        const maxY = areaRect.height - btnRect.height + 20;

        const randomX = Math.max(-60, Math.min(maxX + 60, (Math.random() - 0.5) * 180));
        const randomY = Math.max(-20, Math.min(maxY + 20, (Math.random() - 0.5) * 80));

        btnNo.style.position = 'relative';
        btnNo.style.left = `${randomX}px`;
        btnNo.style.top = `${randomY}px`;
    }

    btnNo.addEventListener('mouseover', escapeButton);
    btnNo.addEventListener('touchstart', escapeButton);
    btnNo.addEventListener('click', (e) => {
        e.preventDefault();
        escapeButton();
    });

    // ----------------------------------------------------
    // 5. CELEBRATION MODAL & CONFETTI
    // ----------------------------------------------------
    const btnYes = document.getElementById('btn-yes');
    const celebrationModal = document.getElementById('celebration-modal');
    const modalClose = document.getElementById('modal-close');
    const btnModalOk = document.getElementById('btn-modal-ok');

    function showModal() {
        celebrationModal.classList.remove('hidden');
        launchConfetti();
    }

    function closeModal() {
        celebrationModal.classList.add('hidden');
    }

    btnYes.addEventListener('click', showModal);
    modalClose.addEventListener('click', closeModal);
    btnModalOk.addEventListener('click', closeModal);

    celebrationModal.addEventListener('click', (e) => {
        if (e.target === celebrationModal) closeModal();
    });

    // Confetti particles generator
    function launchConfetti() {
        const colors = ['#e85d75', '#6c5ce7', '#ffd166', '#2ec4b6', '#ffffff'];
        const count = 65;

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-20px';
            confetti.style.width = (Math.random() * 8 + 6) + 'px';
            confetti.style.height = (Math.random() * 12 + 8) + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            confetti.style.zIndex = '2000';
            confetti.style.pointerEvents = 'none';
            confetti.style.opacity = Math.random() + 0.5;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

            document.body.appendChild(confetti);

            const duration = Math.random() * 2400 + 1800;
            const targetX = (Math.random() - 0.5) * 180;

            confetti.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${targetX}px, 105vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => {
                confetti.remove();
            }, duration);
        }
    }

});
