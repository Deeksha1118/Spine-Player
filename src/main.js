import { createPixiApp } from "./core/app";
import { loadSpineAssets } from "./core/spineLoader";
import { SpinePlayer } from "./player/SpinePlayer";
import { setupDragDropLoader } from "./core/dragDropLoader";

async function init() {
    const app = await createPixiApp();

    await loadSpineAssets(
        "character",
        "./assets/spine/character.json",
        "./assets/spine/character.atlas"
    )

    const player = new SpinePlayer(app, "character");
    await player.init();

    createControls(player);

    window.addEventListener("resize", () => {
        player.spine.x = app.screen.width / 2;
        player.spine.y = app.screen.height / 2;
    });
}

init();

function createControls(player) {
    const playPauseBtn = document.getElementById("playPauseBtn");
    let isPaused = false;

    function togglePlayPause() {
        isPaused = !isPaused;
        if (isPaused) {
            player.pause();
            playPauseBtn.innerText = "▶";
        } else {
            player.resume();
            playPauseBtn.innerText = "⏸";
        }
    }
    playPauseBtn.onclick = togglePlayPause;

    let startX = 0;
    let startY = 0;
    let startTime = 0;

    const sidebar = document.getElementById("sidebar");

    window.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".player-ui") || e.target.closest("#sidebar") || e.target.closest("#menuBtn")) return;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
    });

    window.addEventListener("pointerup", (e) => {
        if (e.target.closest(".player-ui") || e.target.closest("#sidebar") || e.target.closest("#menuBtn")) return;

        if (sidebar && sidebar.classList.contains("open")) {
            sidebar.classList.remove("open");
            return;
        }

        const deltaX = Math.abs(e.clientX - startX);
        const deltaY = Math.abs(e.clientY - startY);
        const deltaTime = Date.now() - startTime;

        if (deltaX < 5 && deltaY < 5 && deltaTime < 300) {
            togglePlayPause();
        }
    });

    const animationSelect = document.getElementById("animationSelect");

    function updateDropdown(selectedAnim) {
        animationSelect.innerHTML = "";
        player.getAnimations().forEach((animation) => {
            const option = document.createElement("option");
            option.value = animation;
            option.innerText = animation;
            animationSelect.appendChild(option);
        });
        if (selectedAnim) {
            animationSelect.value = selectedAnim;
        }
    }

    updateDropdown(player.currentAnimation);

    animationSelect.onchange = () => {
        player.playAnimation(animationSelect.value, true);
    }

    const timelineFill = document.querySelector(".timeline-fill");
    const timelineHandle = document.querySelector(".timeline-handle");
    let isDragging = false;
    let wasPausedBeforeDrag = false;

    player.app.ticker.add(() => {
        if (isDragging) return;

        const track = player.spine.state.getCurrent(0);
        if (!track) return;

        const duration = track.animation.duration;
        const currentTime = track.trackTime;

        let progress = 0;
        if (duration > 0) {
            if (track.loop) {
                progress = Math.max(0, currentTime % duration) / duration;
            } else {
                progress = Math.min(Math.max(0, currentTime), duration) / duration;
            }
        }

        timelineFill.style.width = `${progress * 100}%`;
        if (timelineHandle) {
            timelineHandle.style.left = `${progress * 100}%`;
        }
    });

    const timeline = document.querySelector(".timeline");

    function handleSeek(e) {
        const rect = timeline.getBoundingClientRect();
        const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);

        const track = player.spine.state.getCurrent(0);
        if (!track) return;

        track.trackTime = track.animation.duration * percent;

        timelineFill.style.width = `${percent * 100}%`;
        if (timelineHandle) {
            timelineHandle.style.left = `${percent * 100}%`;
        }
    }

    timeline.onpointerdown = (e) => {
        isDragging = true;
        timeline.classList.add("dragging");
        timeline.setPointerCapture(e.pointerId);

        wasPausedBeforeDrag = isPaused;
        if (!isPaused) {
            player.pause();
        }

        handleSeek(e);
    };

    timeline.onpointermove = (e) => {
        if (!isDragging) return;
        handleSeek(e);
    };

    const stopDragging = (e) => {
        if (!isDragging) return;
        isDragging = false;
        timeline.classList.remove("dragging");
        try {
            timeline.releasePointerCapture(e.pointerId);
        } catch (err) { }

        if (!wasPausedBeforeDrag) {
            player.resume();
        }
    };

    timeline.onpointerup = stopDragging;
    timeline.onpointercancel = stopDragging;

    const menuBtn = document.getElementById("menuBtn");
    const closeSidebarBtn = document.getElementById("closeSidebarBtn");

    menuBtn.onclick = (e) => {
        e.stopPropagation();
        sidebar.classList.toggle("open");
    };

    closeSidebarBtn.onclick = () => {
        sidebar.classList.remove("open");
    };

    const scaleSlider = document.getElementById("scaleSlider");
    const scaleVal = document.getElementById("scaleVal");
    scaleSlider.oninput = () => {
        const val = parseFloat(scaleSlider.value);
        scaleVal.innerText = `${val.toFixed(2)}x`;
        player.setScale(val);
    };

    const speedSlider = document.getElementById("speedSlider");
    const speedVal = document.getElementById("speedVal");
    speedSlider.oninput = () => {
        const val = parseFloat(speedSlider.value);
        speedVal.innerText = `${val.toFixed(2)}x`;
        player.setSpeed(val);
    };

    const gridToggle = document.getElementById("gridToggle");
    gridToggle.onchange = () => {
        if (gridToggle.checked) {
            document.body.classList.add("grid-active");
        } else {
            document.body.classList.remove("grid-active");
        }
    };

    setupDragDropLoader(player, (newAnim) => {
        updateDropdown(newAnim);

        isPaused = false;
        playPauseBtn.innerText = "⏸";

        scaleSlider.value = "1";
        scaleVal.innerText = "1.00x";
        player.setScale(1.0);

        speedSlider.value = "1";
        speedVal.innerText = "1.00x";
        player.setSpeed(1.0);
    });
}  