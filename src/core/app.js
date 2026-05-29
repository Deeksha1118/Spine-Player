import { Application } from "pixi.js";

export async function createPixiApp() {
    const app = new Application();

    await app.init({
        resizeTo: window,
        background: '#1e1e1e',
        antialias: true,
    });

    document.body.appendChild(app.canvas);

    return app;
}