/* ==========================================================================
   Los Prisioneros - Interactive Romantic Hub Logic
   ========================================================================== */

// 1. Data Structure for Albums and Tracks
const albumsData = [
    {
        title: "Corazones",
        year: 1990,
        spotifyUrl: "https://open.spotify.com/album/4v1Y1WjS2j47x1K2Z4WJ5V",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b27341851e44f506869a19c11802",
        themeColor: "#ff4b72",
        tracks: [
            { name: "Tren al sur", duration: "5:36" },
            { name: "Amiga mía", duration: "4:03" },
            { name: "Estrechez de corazón", duration: "6:22" },
            { name: "Corazones rojos", duration: "3:30" },
            { name: "Cuéntame una historia original", duration: "3:52" }
        ]
    },
    {
        title: "Pateando Piedras",
        year: 1986,
        spotifyUrl: "https://open.spotify.com/album/1bH2J48gC1k13z5D5xO6y4",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273b060d4b971a8f9024f923b7a",
        themeColor: "#ffb830",
        tracks: [
            { name: "El baile de los que sobran", duration: "5:22" },
            { name: "Quieren dinero", duration: "5:12" },
            { name: "Muevan las industrias", duration: "4:07" },
            { name: "¿Por qué no se van?", duration: "3:01" },
            { name: "El cobarde", duration: "3:02" }
        ]
    },
    {
        title: "La Voz de los '80",
        year: 1984,
        spotifyUrl: "https://open.spotify.com/album/5121gG6P440c4J0a8q48yM",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273cd9b7754d92eeeb67e7ab437",
        themeColor: "#00b4d8",
        tracks: [
            { name: "La voz de los '80", duration: "4:08" },
            { name: "Sexo", duration: "4:35" },
            { name: "Paramar", duration: "3:45" },
            { name: "Latinoamérica es un pueblo al sur de los EE.UU.", duration: "4:02" },
            { name: "¿Quién mató a Marilyn?", duration: "3:08" }
        ]
    },
    {
        title: "La Cultura de la Basura",
        year: 1987,
        spotifyUrl: "https://open.spotify.com/album/2c7t3QG4yQk1466k0P4V93",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273a5a75908e2c7c5950e39665d",
        themeColor: "#9d4edd",
        tracks: [
            { name: "We are sudamerican rockers", duration: "3:35" },
            { name: "Que no destrocen tu vida", duration: "4:15" },
            { name: "Pa pa pa", duration: "3:31" },
            { name: "Maldito sudaca", duration: "2:22" },
            { name: "Lo estamos pasando muy bien", duration: "5:43" }
        ]
    }
];

// 2. State variables
let isPlaying = false;
let loadedAlbumIndex = 0; // Starts with Corazones
let activeTrackIndex = -1;

// 3. Audio Crackle Synthesizer (Web Audio API)
// Provides a warm, nostalgic vinyl hum and crackle when playing
let audioCtx = null;
let crackleNode = null;
let noiseNode = null;
let mainGain = null;

function initVinylSound() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        mainGain = audioCtx.createGain();
        mainGain.gain.setValueAtTime(0.012, audioCtx.currentTime); // Subtle volume
        mainGain.connect(audioCtx.destination);
    } catch (e) {
        console.warn("Web Audio API not supported in this browser:", e);
    }
}

function startVinylSound() {
    if (!audioCtx) initVinylSound();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    // Generate white/pinkish noise for vinyl hiss
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = noiseBuffer;
    noiseNode.loop = true;
    
    // Dust crackles generator
    const crackleBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const crackleOutput = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        // Random clicks
        if (Math.random() > 0.9997) {
            crackleOutput[i] = (Math.random() * 2 - 1) * 0.8;
            // Decay click
            for (let j = 1; j < 50 && (i + j) < bufferSize; j++) {
                crackleOutput[i + j] = crackleOutput[i] * Math.exp(-j * 0.1);
            }
        } else {
            crackleOutput[i] = 0;
        }
    }
    
    crackleNode = audioCtx.createBufferSource();
    crackleNode.buffer = crackleBuffer;
    crackleNode.loop = true;
    
    // Lowpass filter to make it sound deep and warm
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
    
    // Highpass filter to cut ultra low rumble
    const highpass = audioCtx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(80, audioCtx.currentTime);
    
    // Connections
    noiseNode.connect(filter);
    crackleNode.connect(highpass);
    
    filter.connect(mainGain);
    highpass.connect(mainGain);
    
    noiseNode.start(0);
    crackleNode.start(0);
}

function stopVinylSound() {
    try {
        if (noiseNode) {
            noiseNode.stop();
            noiseNode.disconnect();
            noiseNode = null;
        }
        if (crackleNode) {
            crackleNode.stop();
            crackleNode.disconnect();
            crackleNode = null;
        }
    } catch (e) {
        console.error(e);
    }
}

// 4. Floating Particles System (Hearts and Music Notes)
function createFloatingParticle(type = null) {
    const container = document.getElementById('particles');
    if (!container) return;
    
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Heart and musical notes icons
    const hearts = ['❤️', '💖', '💕', '💙', '💜', '🎵', '🎶', '♩', '♪'];
    const selectedIcon = type || hearts[Math.floor(Math.random() * hearts.length)];
    
    particle.innerText = selectedIcon;
    particle.style.background = 'none';
    particle.style.fontSize = Math.random() * 15 + 12 + 'px';
    
    // Horizontal start position
    particle.style.left = Math.random() * 100 + 'vw';
    
    // Variable size & speed
    const duration = Math.random() * 5 + 6; // 6s to 11s
    particle.style.animation = `floatUp ${duration}s linear forwards`;
    
    // Random delay
    particle.style.animationDelay = Math.random() * 2 + 's';
    
    // Slightly pink or purple glow
    particle.style.filter = `drop-shadow(0 0 5px rgba(255, 75, 114, 0.4))`;
    
    container.appendChild(particle);
    
    // Cleanup
    setTimeout(() => {
        particle.remove();
    }, (duration + 2) * 1000);
}

function initParticles() {
    // Generate initial set
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createFloatingParticle();
        }, i * 400);
    }
    
    // Periodic particle spawner
    setInterval(() => {
        createFloatingParticle();
    }, 2000);
}

// Interactive greeting card mouse attraction particles
function spawnGreetingCardParticles() {
    const card = document.querySelector('.greeting-card');
    if (!card) return;
    
    card.addEventListener('mousemove', (e) => {
        if (Math.random() > 0.90) { // Limit spawning rate
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const miniParticle = document.createElement('div');
            miniParticle.classList.add('particle');
            miniParticle.innerText = Math.random() > 0.5 ? '❤️' : '✨';
            miniParticle.style.background = 'none';
            miniParticle.style.position = 'absolute';
            miniParticle.style.top = y + 'px';
            miniParticle.style.left = x + 'px';
            miniParticle.style.fontSize = '12px';
            miniParticle.style.pointerEvents = 'none';
            miniParticle.style.animation = 'floatUp 2.5s ease-out forwards';
            
            card.appendChild(miniParticle);
            setTimeout(() => miniParticle.remove(), 2500);
        }
    });
}

// 5. Turntable Controller
const activeRecord = document.getElementById('activeRecord');
const activeRecordLabel = document.getElementById('activeRecordLabel');
const tonearm = document.getElementById('tonearm');
const btnPlay = document.getElementById('btnPlay');
const btnPlayText = document.getElementById('btnPlayText');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const visualizer = document.getElementById('visualizer');
const statusLight = document.getElementById('statusLight');
const playingAlbum = document.getElementById('playingAlbum');
const playingSong = document.getElementById('playingSong');
const spotifyLink = document.getElementById('spotifyLink');
const trackListContainer = document.getElementById('trackList');
const tracklistTitle = document.getElementById('tracklistTitle');
const trackCount = document.getElementById('trackCount');

// Update Platter / Turntable state
function updatePlayerUI() {
    if (isPlaying) {
        activeRecord.classList.add('spinning');
        tonearm.classList.add('active');
        visualizer.classList.add('active');
        statusLight.classList.add('active');
        btnPlayText.innerText = "Pausar";
        playIcon.classList.add('hidden');
        pauseIcon.classList.remove('hidden');
        
        startVinylSound();
    } else {
        activeRecord.classList.remove('spinning');
        tonearm.classList.remove('active');
        visualizer.classList.remove('active');
        statusLight.classList.remove('active');
        btnPlayText.innerText = "Reproducir";
        playIcon.classList.remove('hidden');
        pauseIcon.classList.add('hidden');
        
        stopVinylSound();
    }
}

// Toggle Play action
function togglePlay() {
    isPlaying = !isPlaying;
    
    // If we hit play and no track is active, select the first track
    if (isPlaying && activeTrackIndex === -1) {
        activeTrackIndex = 0;
        const currentAlbum = albumsData[loadedAlbumIndex];
        playingSong.innerText = currentAlbum.tracks[0].name;
    }
    
    updatePlayerUI();
    renderTracklist(); // Re-render to show playing wave animations
}

// Load a selected Album
function loadAlbum(index, autoPlay = false) {
    if (index === loadedAlbumIndex && activeTrackIndex !== -1) {
        // If clicking the currently loaded album and it's already active, just play/pause
        togglePlay();
        return;
    }
    
    loadedAlbumIndex = index;
    activeTrackIndex = autoPlay ? 0 : -1; // Select first song if autoplay, otherwise reset
    
    const album = albumsData[index];
    
    // Update labels and styling
    playingAlbum.innerText = `${album.title} (${album.year})`;
    playingSong.innerText = autoPlay ? album.tracks[0].name : "Selecciona un disco para reproducir";
    spotifyLink.href = album.spotifyUrl;
    
    // Load label cover image
    activeRecordLabel.style.backgroundImage = `url('${album.coverUrl}')`;
    
    // Set active class on collection cards
    const albumCards = document.querySelectorAll('.album-item');
    albumCards.forEach((card, idx) => {
        if (idx === index) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });
    
    // If autoPlay requested, ensure player state is active
    if (autoPlay) {
        isPlaying = true;
    } else {
        isPlaying = false; // Reset to play button clicked
    }
    
    updatePlayerUI();
    renderTracklist();
    
    // Smooth scroll player into view on small screens if user tapped an album card
    if (window.innerWidth < 992 && autoPlay) {
        document.querySelector('.turntable-card').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Create extra burst of particles!
    for (let i = 0; i < 6; i++) {
        setTimeout(() => createFloatingParticle('🎵'), i * 150);
        setTimeout(() => createFloatingParticle('❤️'), i * 200);
    }
}

// Select a specific track inside the loaded album
function playTrack(idx) {
    activeTrackIndex = idx;
    const album = albumsData[loadedAlbumIndex];
    playingSong.innerText = album.tracks[idx].name;
    
    isPlaying = true;
    updatePlayerUI();
    renderTracklist();
    
    // Create small heart burst
    createFloatingParticle('💖');
    createFloatingParticle('🎶');
}

// Render Tracklist for the loaded album
function renderTracklist() {
    const album = albumsData[loadedAlbumIndex];
    tracklistTitle.innerText = `Canciones de ${album.title}`;
    trackCount.innerText = `${album.tracks.length} canciones`;
    
    trackListContainer.innerHTML = '';
    
    album.tracks.forEach((track, idx) => {
        const trackItem = document.createElement('div');
        trackItem.classList.add('track-item');
        if (idx === activeTrackIndex && isPlaying) {
            trackItem.classList.add('playing');
        }
        
        trackItem.innerHTML = `
            <div class="track-info">
                <span class="track-num">${idx + 1}</span>
                <span class="track-name">${track.name}</span>
                <div class="sound-wave">
                    <span class="wave-bar"></span>
                    <span class="wave-bar"></span>
                    <span class="wave-bar"></span>
                </div>
            </div>
            <span class="track-duration">${track.duration}</span>
        `;
        
        trackItem.addEventListener('click', () => playTrack(idx));
        trackListContainer.appendChild(trackItem);
    });
}

// 6. Setup Listeners & Initializers
function setupListeners() {
    // Play/Pause button
    btnPlay.addEventListener('click', () => {
        // Web Audio context initialization requires user interaction
        if (!audioCtx) initVinylSound();
        togglePlay();
    });
    
    // Vinyl Grid cards click events
    const albumCards = document.querySelectorAll('.album-item');
    albumCards.forEach(card => {
        card.addEventListener('click', () => {
            if (!audioCtx) initVinylSound();
            const index = parseInt(card.getAttribute('data-index'));
            loadAlbum(index, true); // Load and auto-play on click
        });
    });
    
    // Image loading fallbacks
    // If any Spotify cover CDN fails to load, replace with beautiful color gradient SVG dynamically!
    const coverImages = document.querySelectorAll('.album-cover');
    coverImages.forEach((img, idx) => {
        img.addEventListener('error', () => {
            const album = albumsData[idx];
            // Base64 encoded beautiful color gradient SVG
            const fallbackSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%233a1c71;stop-opacity:1" /><stop offset="50%" style="stop-color:%23d76d77;stop-opacity:1" /><stop offset="100%" style="stop-color:%23ffaf7b;stop-opacity:1" /></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g)"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="8" font-weight="bold" fill="white">${album.title.replace("'", "")}</text><text x="50%" y="60%" dominant-baseline="middle" text-anchor="middle" font-family="'Outfit', sans-serif" font-size="6" fill="%23d3c9e3">${album.year}</text></svg>`;
            img.src = fallbackSvg;
            
            // If this is currently active on the record, update record label
            if (idx === loadedAlbumIndex) {
                activeRecordLabel.style.backgroundImage = `url('${fallbackSvg}')`;
            }
        });
    });

    // Handle Title Image placeholder fallback
    const titleImage = document.getElementById('titleImage');
    if (titleImage) {
        titleImage.addEventListener('error', () => {
            // High quality fallback landscape photo of the band or romantic banner
            titleImage.src = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=cover";
        });
    }
}

// 7. Entry Point
document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    spawnGreetingCardParticles();
    setupListeners();
    
    // Load Corazones initially (index 0) without auto-play
    loadAlbum(0, false);
});
