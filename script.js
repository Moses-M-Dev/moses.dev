/* Navbar shadow on scroll */
const navbar = document.querySelector(".Navbar");

window.addEventListener("scroll", () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 10);
});
/* End of Navbar shadow on scroll */

/* Short synthesized water-ripple sound for interactive clicks */
let clickAudioContext;
let clickSfxUnavailableWarned = false;

function playClickSound() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextConstructor) {
        if (!clickSfxUnavailableWarned) {
            console.warn("Web Audio API is not supported; click sound is unavailable.");
            clickSfxUnavailableWarned = true;
        }
        return;
    }

    if (!clickAudioContext) {
        clickAudioContext = new AudioContextConstructor();
    }

    const playTone = () => {
        const now = clickAudioContext.currentTime;
        const ripples = [
            { delay: 0, startFrequency: 1250, endFrequency: 620, volume: 0.04, duration: 0.09 },
            { delay: 0.045, startFrequency: 1020, endFrequency: 520, volume: 0.022, duration: 0.1 },
            { delay: 0.095, startFrequency: 820, endFrequency: 430, volume: 0.012, duration: 0.11 },
        ];

        ripples.forEach((ripple) => {
            const start = now + ripple.delay;
            const oscillator = clickAudioContext.createOscillator();
            const volume = clickAudioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.setValueAtTime(ripple.startFrequency, start);
            oscillator.frequency.exponentialRampToValueAtTime(ripple.endFrequency, start + ripple.duration);
            volume.gain.setValueAtTime(0.0001, start);
            volume.gain.exponentialRampToValueAtTime(ripple.volume, start + 0.004);
            volume.gain.exponentialRampToValueAtTime(0.0001, start + ripple.duration);
            oscillator.connect(volume);
            volume.connect(clickAudioContext.destination);
            oscillator.start(start);
            oscillator.stop(start + ripple.duration + 0.01);
        });
    };

    if (clickAudioContext.state === "suspended") {
        clickAudioContext.resume()
            .then(playTone)
            .catch((error) => console.error("Could not enable click sound.", error));
        return;
    }

    playTone();
}

document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest('button:not(:disabled), a[href], [role="button"], [role="tab"]');
    if (control) playClickSound();
});
/* End of click sound effect */

/* Ripple trail follows mouse and pen movement */
const reducedMotionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
let lastRippleTime = 0;
let lastRippleX = null;
let lastRippleY = null;

document.addEventListener("pointermove", (event) => {
    if (event.pointerType === "touch" || reducedMotionPreference.matches) return;

    const now = performance.now();
    const distanceX = lastRippleX === null ? Infinity : event.clientX - lastRippleX;
    const distanceY = lastRippleY === null ? Infinity : event.clientY - lastRippleY;
    const movedEnough = distanceX * distanceX + distanceY * distanceY >= 400;

    if (now - lastRippleTime < 80 || !movedEnough) return;

    const ripple = document.createElement("span");
    ripple.className = "Pointer-ripple";
    ripple.style.left = `${event.clientX}px`;
    ripple.style.top = `${event.clientY}px`;
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    document.body.append(ripple);

    lastRippleTime = now;
    lastRippleX = event.clientX;
    lastRippleY = event.clientY;
});
/* End of pointer ripple trail */

/* Navbar theme and music controls */
const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    themeToggle.setAttribute("aria-pressed", isDark);
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
});

const musicToggle = document.getElementById("music-toggle");
const backgroundMusic = document.getElementById("background-music");
const musicStartButton = document.getElementById("music-start-button");
const musicPlayToggle = document.getElementById("music-play-toggle");
const musicPreviousButton = document.getElementById("music-previous");
const musicNextButton = document.getElementById("music-next");
const musicProgress = document.getElementById("music-progress");
const musicCurrentTime = document.getElementById("music-current-time");
const musicDuration = document.getElementById("music-duration");
const musicTrackTitle = document.getElementById("music-track-title");
const musicTrackArtist = document.getElementById("music-track-artist");
const musicTrackList = document.getElementById("music-tracklist");
const musicEmptyMessage = document.getElementById("music-empty");
const musicStatus = document.getElementById("music-status");

const musicTracks = [
    { title: "Seasons", artist: "wave to earth", src: "assets/music/seasons.mp3" },
    { title: "love", artist: "wave to earth", src: "assets/music/love.mp3" },
    { title: "multo", artist: "Darlyne Nightbloom", src: "assets/music/multo.mp3" },
    { title: "blue", artist: "yung kai", src: "assets/music/blue.mp3" },
    { title: "if only...", artist: "Skyline", src: "assets/music/if-only.mp3" },
    
];

let currentTrackIndex = 0;

function formatMusicTime(seconds) {
    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
}

function updateMusicToggle() {
    const isMuted = backgroundMusic.muted || backgroundMusic.paused;
    musicToggle.classList.toggle("is-muted", isMuted);
    musicToggle.setAttribute("aria-pressed", String(!isMuted));
    musicToggle.setAttribute("aria-label", isMuted ? "Putar musik" : "Mute musik");
}

function updateMusicPlaybackState() {
    const isPlaying = !backgroundMusic.paused;
    musicPlayToggle.textContent = isPlaying ? "Ⅱ" : "▶";
    musicPlayToggle.setAttribute("aria-label", isPlaying ? "Jeda lagu" : "Putar lagu");
    musicPlayToggle.setAttribute("aria-pressed", String(isPlaying));
}

function updateMusicProgress() {
    const duration = backgroundMusic.duration;
    const currentTime = backgroundMusic.currentTime;

    musicCurrentTime.textContent = formatMusicTime(currentTime);
    musicDuration.textContent = formatMusicTime(duration);
    musicProgress.value = Number.isFinite(duration) && duration > 0
        ? String((currentTime / duration) * 100)
        : "0";
}

function playCurrentTrack(isAutoplay = false) {
    if (!musicTracks.length) return;

    backgroundMusic.muted = false;
    backgroundMusic.play()
        .then(() => {
            musicStatus.hidden = true;
        })
        .catch((error) => {
            if (isAutoplay && error.name === "NotAllowedError") {
                musicStatus.textContent = "Browser memblokir autoplay dengan suara. Klik tombol Play untuk mulai mendengarkan.";
            } else {
                console.error("Tidak dapat memutar lagu. Periksa file dan path di assets/music/.", error);
                musicStatus.textContent = "Lagu tidak dapat diputar. Periksa file audio dan path-nya.";
            }

            musicStatus.hidden = false;
        });
}

function selectMusicTrack(index, autoplay) {
    if (!musicTracks.length) return;

    currentTrackIndex = (index + musicTracks.length) % musicTracks.length;
    const track = musicTracks[currentTrackIndex];

    backgroundMusic.pause();
    backgroundMusic.src = track.src;
    backgroundMusic.load();
    musicTrackTitle.textContent = track.title;
    musicTrackArtist.textContent = track.artist;
    musicProgress.value = "0";
    musicCurrentTime.textContent = "0:00";
    musicDuration.textContent = "0:00";
    musicStatus.hidden = true;

    musicTrackList.querySelectorAll(".Music-track-button").forEach((button, trackIndex) => {
        const isCurrent = trackIndex === currentTrackIndex;
        button.classList.toggle("is-current", isCurrent);
        if (isCurrent) {
            button.setAttribute("aria-current", "true");
        } else {
            button.removeAttribute("aria-current");
        }
    });

    if (autoplay) playCurrentTrack();
}

function initializeMusicPlayer() {
    if (!musicTracks.length) return;

    musicTracks.forEach((track, index) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        const number = document.createElement("span");
        const label = document.createElement("span");
        const title = document.createElement("span");
        const artist = document.createElement("span");

        button.className = "Music-track-button";
        button.type = "button";
        number.className = "Music-track-index";
        label.className = "Music-track-label";
        title.className = "Music-track-name";
        artist.className = "Music-track-artist";
        number.textContent = String(index + 1).padStart(2, "0");
        title.textContent = track.title;
        artist.textContent = track.artist;
        label.append(title, artist);
        button.append(number, label);
        button.addEventListener("click", () => selectMusicTrack(index, true));
        item.append(button);
        musicTrackList.append(item);
    });

    musicEmptyMessage.hidden = true;
    musicTrackList.hidden = false;
    musicToggle.disabled = false;
    musicStartButton.disabled = false;
    musicPlayToggle.disabled = false;
    musicPreviousButton.disabled = false;
    musicNextButton.disabled = false;
    musicProgress.disabled = false;
    selectMusicTrack(0, false);
    playCurrentTrack(true);
}

musicToggle.addEventListener("click", () => {
    if (!musicTracks.length) return;

    if (backgroundMusic.paused) {
        playCurrentTrack();
    } else {
        backgroundMusic.muted = !backgroundMusic.muted;
    }

    updateMusicToggle();
});

musicStartButton.addEventListener("click", playCurrentTrack);

musicPlayToggle.addEventListener("click", () => {
    if (backgroundMusic.paused) {
        playCurrentTrack();
    } else {
        backgroundMusic.pause();
    }
});

musicPreviousButton.addEventListener("click", () => {
    selectMusicTrack(currentTrackIndex - 1, true);
});

musicNextButton.addEventListener("click", () => {
    selectMusicTrack(currentTrackIndex + 1, true);
});

musicProgress.addEventListener("input", () => {
    if (Number.isFinite(backgroundMusic.duration) && backgroundMusic.duration > 0) {
        backgroundMusic.currentTime = (Number(musicProgress.value) / 100) * backgroundMusic.duration;
    }
});

backgroundMusic.addEventListener("timeupdate", updateMusicProgress);
backgroundMusic.addEventListener("loadedmetadata", updateMusicProgress);
backgroundMusic.addEventListener("play", updateMusicPlaybackState);
backgroundMusic.addEventListener("pause", updateMusicPlaybackState);
backgroundMusic.addEventListener("play", updateMusicToggle);
backgroundMusic.addEventListener("pause", updateMusicToggle);
backgroundMusic.addEventListener("volumechange", updateMusicToggle);
backgroundMusic.addEventListener("ended", () => {
    if (currentTrackIndex < musicTracks.length - 1) {
        selectMusicTrack(currentTrackIndex + 1, true);
    }
});
backgroundMusic.addEventListener("error", () => {
    const track = musicTracks[currentTrackIndex];
    if (track) {
        console.error(`Gagal memuat "${track.title}" dari ${track.src}.`, backgroundMusic.error);
    }
});

initializeMusicPlayer();
updateMusicToggle();
updateMusicPlaybackState();
/* End of Navbar theme and music controls */

/** Loading Preloader */
const preloader = document.getElementById("preloader");
const progressTrack = document.querySelector(".Preloader-track");
const progressBar = document.getElementById("loading-progress");
const progressLabel = document.getElementById("loading-percent");

let progress = 0;
let loadingFinished = false;

function updateProgress(value) {
    progress = value;
    progressBar.style.width = `${progress}%`;
    progressLabel.textContent = `${progress}%`;
    progressTrack.setAttribute("aria-valuenow", progress);
}

const progressTimer = setInterval(() => {
    if (progress < 90) {
        updateProgress(Math.min(progress + (progress < 70 ? 4 : 1), 90));
    }
}, 70);

function finishLoading() {
    if (loadingFinished) return;

    loadingFinished = true;
    clearInterval(progressTimer);
    updateProgress(100);
    setTimeout(() => {
    preloader.classList.add("is-hidden");
    setTimeout(startFadeUp, 650);
    }, 280);
}

window.addEventListener("load", finishLoading, { once: true });
setTimeout(finishLoading, 4000);
/* End of Preloader */

/* Navbar About Me Toggle */
const aboutTabs = document.querySelectorAll(".About-tab");
const aboutPanels = document.querySelectorAll(".About-panel");

aboutTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        aboutTabs.forEach((item) => {
            item.setAttribute("aria-selected", item === tab);
        });

        aboutPanels.forEach((panel) => {
            panel.hidden = panel.id !== tab.getAttribute("aria-controls");
        });
    });
});
/* End of Navbar About Me Toggle */


/* Certificate image lightbox */
const certificateModal = document.getElementById("certificate-modal");

if (certificateModal) {
    const modalImage = document.getElementById("certificate-modal-image");
    const modalTitle = document.getElementById("certificate-modal-title");
    const modalPlatform = document.getElementById("certificate-modal-platform");
    const modalDate = document.getElementById("certificate-modal-date");
    const modalClose = certificateModal.querySelector(".Certificate-modal-close");

    document.addEventListener("click", (event) => {
        const preview = event.target.closest(".Certificate-preview");
        if (!preview) return;

        const image = preview.querySelector("img");
        if (!image || !image.getAttribute("src")) return;

        const card = preview.closest(".Certificate-card");
        const group = preview.closest(".Certificate-group");
        modalImage.src = image.currentSrc || image.src;
        modalImage.alt = image.alt || "Certificate image";
        modalTitle.textContent = card.querySelector("h4")?.textContent.trim() || "Certificate";
        modalPlatform.textContent = group.querySelector(".Certificate-heading")?.textContent.replace("//", "").trim() || "";
        modalDate.textContent = card.querySelector(".Certificate-date")?.textContent.trim() || "";
        certificateModal.showModal();
    });

    modalClose.addEventListener("click", () => certificateModal.close());

    certificateModal.addEventListener("click", (event) => {
        if (event.target === certificateModal) certificateModal.close();
    });

    certificateModal.addEventListener("close", () => {
        modalImage.removeAttribute("src");
    });
}
/* End of Certificate image lightbox */


/* Achievement photo lightbox: image only, without caption */
const achievementModal = document.getElementById("achievement-modal");

if (achievementModal) {
    const achievementModalImage = document.getElementById("achievement-modal-image");
    const achievementModalClose = achievementModal.querySelector(".Certificate-modal-close");

    document.addEventListener("click", (event) => {
        const preview = event.target.closest(".Achievement-preview");
        if (!preview) return;

        const image = preview.querySelector("img");
        if (!image || !image.getAttribute("src")) return;

        achievementModalImage.src = image.currentSrc || image.src;
        achievementModalImage.alt = image.alt || "Achievement photo";
        achievementModal.showModal();
    });

    achievementModalClose.addEventListener("click", () => achievementModal.close());

    achievementModal.addEventListener("click", (event) => {
        if (event.target === achievementModal) achievementModal.close();
    });

    achievementModal.addEventListener("close", () => {
        achievementModalImage.removeAttribute("src");
    });
}
/* End of Achievement photo lightbox */

function startFadeUp() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll(".fade-up").forEach((section) => {
        observer.observe(section);
    });
}
