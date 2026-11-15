/* Navbar shadow on scroll */
const navbar = document.querySelector(".Navbar");

window.addEventListener("scroll", () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 10);
});
/* End of Navbar shadow on scroll */

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
    setTimeout(() => preloader.classList.add("is-hidden"), 280);
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
