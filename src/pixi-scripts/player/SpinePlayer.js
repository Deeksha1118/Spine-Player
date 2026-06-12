import { Spine } from "@esotericsoftware/spine-pixi-v8";

export class SpinePlayer {
    constructor(app, assetAlias) {
        this.app = app;
        this.assetAlias = assetAlias;

        this.spine = null;
        this.currentAnimation = null;
        this.speed = 1.0;
        this.scale = 1.0;
    }

    async init() {
        this.spine = Spine.from({
            skeleton: `${this.assetAlias}Data`,
            atlas: `${this.assetAlias}Atlas`,
        });

        this.spine.x = this.app.screen.width / 2;
        this.spine.y = this.app.screen.height / 2;
        this.spine.scale.set(this.scale);

        this.app.stage.addChild(this.spine);

        this.playAnimation("idle", true);

        this.enableDragging();
    }

    playAnimation(animationName, loop = true) {
        if (!this.spine) return;

        this.currentAnimation = animationName;
        this.spine.state.setAnimation(0, animationName, loop);
    }

    pause() {
        if (!this.spine) return;
        this.spine.state.timeScale = 0;
    }

    resume() {
        if (!this.spine) return;
        this.spine.state.timeScale = this.speed;
    }

    setScale(val) {
        this.scale = val;
        if (this.spine) {
            this.spine.scale.set(val);
        }
    }

    setSpeed(val) {
        this.speed = val;
        if (this.spine && this.spine.state.timeScale !== 0) {
            this.spine.state.timeScale = val;
        }
    }

    getAnimations() {
        return this.spine.skeleton.data.animations.map(animation => animation.name);
    }

    enableDragging() {
        this.spine.eventMode = "static";
        this.spine.cursor = "pointer";

        let dragging = false;

        let offsetX = 0;
        let offsetY = 0;

        this.spine.on("pointerdown", (e) => {
            dragging = true;
            const position = e.data.global;
            offsetX = position.x - this.spine.x;
            offsetY = position.y - this.spine.y;
        });

        this.spine.on("pointerup", () => {
            dragging = false;
        });

        this.spine.on("pointerupoutside", () => {
            dragging = false;
        });

        this.spine.on("pointermove", (e) => {
            if (!dragging) return;
            const position = e.data.global;
            this.spine.x = position.x - offsetX;
            this.spine.y = position.y - offsetY;
        });
    }
}