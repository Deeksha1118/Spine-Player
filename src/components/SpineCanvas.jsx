import { useEffect, useRef } from "react";
import { createPixiApp } from "../core/app";
import { loadSpineAssets } from "../core/spineLoader";
import { SpinePlayer } from "../player/SpinePlayer";

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
                player.spine.x = app.screen.width / 2;
                player.spine.y = app.screen.height / 2;
            });
        }

        init();
        return () => app?.destroy(true);
    },[]);

    return <div ref={canvasRef} className="canvas-container"/>;
}