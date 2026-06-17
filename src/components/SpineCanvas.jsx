import { useEffect, useRef } from "react";
import { createPixiApp } from "../pixi-scripts/core/app";
import { loadSpineAssets } from "../pixi-scripts/core/spineLoader";
import { SpinePlayer } from "../pixi-scripts/player/SpinePlayer";

export default function SpineCanvas({onPlayerReady}) {
    const canvasRef = useRef();

    useEffect(() => {
        let app;
        let player;

        async function init() {
            app = await createPixiApp();

            canvasRef.current.appendChild(app.canvas);

            await loadSpineAssets(
                "character",
                "./assets/spine/character.json",
                "./assets/spine/character.atlas"
            )

            player = new SpinePlayer(app, "character");
            await player.init();

            if (onPlayerReady) {
                onPlayerReady(player);
            }

            window.addEventListener("resize", () => {
                if (player && player.spine) {
                    player.spine.x = app.screen.width / 2;
                    player.spine.y = app.screen.height / 2;
                    player.updateGridOffset();
                }
            });
        }

        init();
        return () => app?.destroy(true);
    },[]);

    return <div ref={canvasRef} className="canvas-container"/>;
}