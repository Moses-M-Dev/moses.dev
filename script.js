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
