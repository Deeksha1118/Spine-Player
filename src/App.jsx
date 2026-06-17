import { useState, useEffect } from "react";
import SpineCanvas from "./components/SpineCanvas";
import Controls from "./components/Controls";
import Sidebar from "./components/Sidebar";
import { showToast } from "./pixi-scripts/core/dragDropLoader";

export default function App() {
    const [player, setPlayer] = useState(null);
    const [animations, setAnimations] = useState([]);
    const [currentAnimation, setCurrentAnimation] = useState("");
    const [paused, setPaused] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [scale, setScale] = useState(1.0);
    const [speed, setSpeed] = useState(1.0);
    const [gridActive, setGridActive] = useState(false);
    const [theme, setTheme] = useState("dark");
    const [looping, setLooping] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [dragEnabled, setDragEnabled] = useState(false);

    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light-theme");
        } else {
            document.body.classList.remove("light-theme");
        }

        if (player) {
            player.app.renderer.background.color = theme === "light" ? "#f5f5f5" : "#1e1e1e";
        }
    }, [theme, player]);

    useEffect(() => {
        if (gridActive) {
            document.body.classList.add("grid-active");
        } else {
            document.body.classList.remove("grid-active");
        }
    }, [gridActive]);

    useEffect(() => {
        if (!player) return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handlePointerDown = (e) => {
            if (
                e.target.closest(".player-ui") ||
                e.target.closest(".sidebar") ||
                e.target.closest(".menu-btn")
            ) {
                return;
            }
            startX = e.clientX;
            startY = e.clientY;
            startTime = Date.now();
        };

        const handlePointerUp = (e) => {
            if (
                e.target.closest(".player-ui") ||
                e.target.closest(".sidebar") ||
                e.target.closest(".menu-btn")
            ) {
                return;
            }

            if (sidebarOpen) {
                setSidebarOpen(false);
                return;
            }

            const deltaX = Math.abs(e.clientX - startX);
            const deltaY = Math.abs(e.clientY - startY);
            const deltaTime = Date.now() - startTime;

            if (deltaX < 5 && deltaY < 5 && deltaTime < 300) {
                setPaused((prev) => {
                    const next = !prev;
                    if (next) {
                        player.pause();
                    } else {
                        player.resume();
                    }
                    return next;
                });
            }
        };

        window.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [player, sidebarOpen]);

    useEffect(() => {
        if (!player) return;

        const handleWheel = (e) => {
            if (
                e.target.closest(".player-ui") ||
                e.target.closest(".sidebar") ||
                e.target.closest(".menu-btn")
            ) {
                return;
            }

            e.preventDefault();

            const zoomIntensity = 0.05;
            const delta = -e.deltaY;
            const factor = delta > 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);

            const currentScale = player.scale;
            const newScale = Math.min(Math.max(0.1, currentScale * factor), 3.0);
            
            player.setScale(newScale);
            setScale(newScale);
        };

        window.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            window.removeEventListener("wheel", handleWheel);
        };
    }, [player]);

    const handlePlayerReady = (readyPlayer) => {
        setPlayer(readyPlayer);
        setAnimations(readyPlayer.getAnimations());
        setCurrentAnimation(readyPlayer.currentAnimation || "idle");
        setScale(readyPlayer.scale);
        setSpeed(readyPlayer.speed);
        setLooping(readyPlayer.looping);
        readyPlayer.setDragEnabled(dragEnabled);
    };

    const handleDragToggle = (enabled) => {
        setDragEnabled(enabled);
        if (player) {
            player.setDragEnabled(enabled);
        }
    };

    const handleAnimChange = (anim) => {
        setCurrentAnimation(anim);
        if (player) {
            player.playAnimation(anim, looping);
            if (paused) {
                player.resume();
                setPaused(false);
            }
        }
    };

    const handleSpineLoaded = (defaultAnim) => {
        if (!player) return;
        setAnimations(player.getAnimations());
        setCurrentAnimation(defaultAnim);
        setPaused(false);
        setScale(1.0);
        setSpeed(1.0);
        setLooping(false);

        player.paused = false;
        player.speed = 1.0;
        player.scale = 1.0;
        player.looping = false;
        player.setDragEnabled(dragEnabled);
    };

    const handleScaleChange = (newScale) => {
        setScale(newScale);
        if (player) {
            player.setScale(newScale);
        }
    };

    const handleSpeedChange = (newSpeed) => {
        setSpeed(newSpeed);
        if (player) {
            player.setSpeed(newSpeed);
        }
    };

    const handleLoopToggle = (newLooping) => {
        setLooping(newLooping);
        if (player) {
            player.setLooping(newLooping);
        }
    };

    const handleReset = () => {
        if (player) {
            player.reset();
            setScale(1.0);
            setSpeed(1.0);
            setPaused(false);
            setLooping(false);
        }
    };

    const handleExportVideo = async () => {
        if (!player || exporting) return;

        const track = player.spine?.state?.getCurrent(0);
        if (!track) return;

        console.log("Animation Duration:", track.animation.duration);

        setExporting(true);

        const expectedColor = theme === "light" ? "#f5f5f5" : "#1e1e1e";
        const originalPaused = paused;
        const originalTrackTime = track.trackTime;
        const originalLooping = looping;
        const originalSpeed = speed;
        const originalScale = scale;
        const originalAnimation = currentAnimation;

        player.app.renderer.background.color = "#000000";

        // Set up MediaRecorder & canvas stream
        const canvas = player.app.canvas;
        const stream = canvas.captureStream(60);
        const streamTracks = stream.getTracks();

        let mimeType = "video/webm;codecs=vp9";
        let extension = "webm";

        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm;codecs=vp8";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            if (MediaRecorder.isTypeSupported("video/mp4")) {
                mimeType = "video/mp4";
                extension = "mp4";
            } else {
                mimeType = "";
            }
        }

        const chunks = [];
        let mediaRecorder = null;
        let completionListener = null;

        let frameCount = 0;
        const tick = () => {
            frameCount++;
        };

        const cleanup = () => {
            if (completionListener && player?.spine?.state) {
                try {
                    player.spine.state.removeListener(completionListener);
                } catch (e) {
                    console.error("Error removing completion listener:", e);
                }
            }

            if (player?.app?.ticker) {
                try {
                    player.app.ticker.remove(tick);
                } catch (e) {
                    console.error("Error removing ticker listener:", e);
                }
            }

            console.log("Frames Rendered:", frameCount);

            if (streamTracks) {
                streamTracks.forEach((t) => {
                    try {
                        t.stop();
                    } catch (e) {
                        console.error("Error stopping stream track:", e);
                    }
                });
            }

            if (player?.app?.renderer?.background) {
                player.app.renderer.background.color = expectedColor;
            }

            if (player?.spine?.state) {
                try {
                    player.playAnimation(originalAnimation, originalLooping);
                    
                    const restoredTrack = player.spine.state.getCurrent(0);
                    if (restoredTrack) {
                        restoredTrack.trackTime = originalTrackTime;
                    }

                    player.setSpeed(originalSpeed);
                    player.setScale(originalScale);

                    if (originalPaused) {
                        player.pause();
                    } else {
                        player.resume();
                    }
                } catch (e) {
                    console.error("Error restoring player state:", e);
                }
            }

            setExporting(false);
        };

        let startTime = 0;
        let completeTime = 0;
        let stopTime = 0;
        let onstopTime = 0;

        try {
            const options = mimeType ? { mimeType } : undefined;
            mediaRecorder = new MediaRecorder(stream, options);

            mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                onstopTime = performance.now();
                console.log("[Export Debug] mediaRecorder.onstop timestamp:", onstopTime);
                console.log("[Export Debug] Total recording elapsed time:", (onstopTime - startTime).toFixed(2) + "ms");
                
                try {
                    const blob = new Blob(chunks, { type: mimeType || "video/webm" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${originalAnimation || "animation"}.${extension}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    showToast("Export Complete", `Animation downloaded as ${extension.toUpperCase()}!`, "success");
                } catch (err) {
                    console.error("Error generating download:", err);
                    showToast("Export Failed", "Could not generate download file.", "error");
                } finally {
                    cleanup();
                }
            };

            mediaRecorder.start();
            startTime = performance.now();
            console.log("[Export Debug] mediaRecorder.start() timestamp:", startTime);
            showToast("Exporting", "Recording and preparing video file...", "info");

            if (player?.app?.ticker) {
                console.log("Ticker FPS:", player.app.ticker.FPS);
                player.app.ticker.add(tick);
            }

            const exportEntry = player.spine.state.setAnimation(0, currentAnimation, false);
            console.log("[Export Debug] exportEntry.animation.duration:", exportEntry.animation.duration);
            
            const speedVal = player.speed > 0 ? player.speed : 1.0;
            player.spine.state.timeScale = speedVal;

            if (originalPaused) {
                player.resume();
                player.spine.state.timeScale = speedVal;
            }

            completionListener = {
                complete: (entry) => {
                    if (entry !== exportEntry) return;

                    completeTime = performance.now();
                    console.log("[Export Debug] animation complete timestamp:", completeTime);
                    console.log("[Export Debug] Animation duration in JS context:", (completeTime - startTime).toFixed(2) + "ms");

                    setTimeout(() => {
                        if (mediaRecorder && mediaRecorder.state !== "inactive") {
                            stopTime = performance.now();
                            console.log("[Export Debug] mediaRecorder.stop() timestamp:", stopTime);
                            mediaRecorder.stop();
                        }
                    }, 200);
                }
            };
            player.spine.state.addListener(completionListener);

        } catch (error) {
            console.error("Export execution failed:", error);
            showToast("Export Failed", "Failed during video export setup.", "error");
            cleanup();
        }
    };

    return (
        <>
            <div className="grid-overlay" />
            <button className="menu-btn" onClick={() => setSidebarOpen(true)}>☰</button>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                scale={scale}
                onScaleChange={handleScaleChange}
                speed={speed}
                onSpeedChange={handleSpeedChange}
                gridActive={gridActive}
                onGridToggle={setGridActive}
                theme={theme}
                onThemeToggle={setTheme}
                looping={looping}
                onLoopToggle={handleLoopToggle}
                dragEnabled={dragEnabled}
                onDragToggle={handleDragToggle}
            />
            <SpineCanvas onPlayerReady={handlePlayerReady} />
            {player && (
                <Controls
                    player={player}
                    paused={paused}
                    setPaused={setPaused}
                    animations={animations}
                    selectedAnim={currentAnimation}
                    onAnimChange={handleAnimChange}
                    onSpineLoaded={handleSpineLoaded}
                    onExportVideo={handleExportVideo}
                    exporting={exporting}
                    onReset={handleReset}
                />
            )}
        </>
    );
}