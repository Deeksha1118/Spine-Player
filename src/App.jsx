import { useState, useEffect } from "react";
import SpineCanvas from "./components/SpineCanvas";
import Controls from "./components/Controls";
import Sidebar from "./components/Sidebar";

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

    const handlePlayerReady = (readyPlayer) => {
        setPlayer(readyPlayer);
        setAnimations(readyPlayer.getAnimations());
        setCurrentAnimation(readyPlayer.currentAnimation || "idle");
        setScale(readyPlayer.scale);
        setSpeed(readyPlayer.speed);
    };

    const handleAnimChange = (anim) => {
        setCurrentAnimation(anim);
        if (player) {
            player.playAnimation(anim, true);
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
                />
            )}
        </>
    );
}