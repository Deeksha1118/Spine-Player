import { Spine } from "@esotericsoftware/spine-pixi-v8";

export class SpinePlayer {
    constructor(app, assetAlias) {
        this.app = app;
        this.assetAlias = assetAlias;

        this.spine = null;
        this.currentAnimation = null;
        this.speed = 1.0;
        this.scale = 1.0;
        this.paused = false;
        this.looping = false;
        this.dragEnabled = false;
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

        this.playAnimation("idle", this.looping);

        this.enableDragging();
    }

    playAnimation(animationName, loop = this.looping) {
        if (!this.spine) return;

        this.currentAnimation = animationName;
        this.spine.state.setAnimation(0, animationName, loop);
    }

    pause() {
        if (!this.spine) return;
        this.paused = true;
        this.spine.state.timeScale = 0;
    }

    resume() {
        if (!this.spine) return;
        this.paused = false;
        this.spine.state.timeScale = this.speed;
    }

    setScale(val) {
        this.scale = val;
        if (this.spine) {
            this.spine.scale.set(val);
        }
        this.updateGridOffset();
    }

    setSpeed(val) {
        this.speed = val;
        if (this.spine && !this.paused) {
            this.spine.state.timeScale = val;
        }
    }

    setLooping(val) {
        this.looping = val;
        if (this.spine) {
            const track = this.spine.state.getCurrent(0);
            if (track) {
                track.loop = val;
            }
        }
    }

    reset() {
        this.scale = 1.0;
        this.paused = false;
        this.speed = 1.0;
        this.looping = false;
        if (this.spine) {
            this.spine.scale.set(1.0);
            this.spine.x = this.app.screen.width / 2;
            this.spine.y = this.app.screen.height / 2;
            this.spine.state.timeScale = 1.0;
            const track = this.spine.state.getCurrent(0);
            if (track) {
                track.loop = false;
            }
        }
        this.updateGridOffset();
    }

    getAnimations() {
        return this.spine.skeleton.data.animations.map(animation => animation.name);
    }

    enableDragging() {
        let draggingSpine = false;
        let offsetX = 0;
        let offsetY = 0;

        this.spine.removeAllListeners("pointerdown");
        this.spine.removeAllListeners("pointerup");
        this.spine.removeAllListeners("pointerupoutside");
        this.spine.removeAllListeners("pointermove");

        this.spine.on("pointerdown", (e) => {
            if (!this.dragEnabled) return;
            draggingSpine = true;
            this.spine.cursor = 'grabbing';
            const position = e.data.global;
            offsetX = position.x - this.spine.x;
            offsetY = position.y - this.spine.y;
        });

        const handleSpineUp = () => {
            if (draggingSpine) {
                draggingSpine = false;
                if (this.dragEnabled) {
                    this.spine.cursor = 'grab';
                }
            }
        };

        this.spine.on("pointerup", handleSpineUp);
        this.spine.on("pointerupoutside", handleSpineUp);

        const handleMove = (e) => {
            if (!this.dragEnabled || !draggingSpine) return;

            const position = e.data.global;
            this.spine.x = position.x - offsetX;
            this.spine.y = position.y - offsetY;
            this.updateGridOffset();
        };

        this.spine.on("pointermove", handleMove);

        this.updateDragSettings();
        this.updateGridOffset();
    }

    setDragEnabled(enabled) {
        this.dragEnabled = enabled;
        this.updateDragSettings();
    }

    updateDragSettings() {
        if (!this.spine) return;

        if (this.dragEnabled) {
            this.spine.eventMode = 'static';
            this.spine.cursor = 'grab';
        } else {
            this.spine.eventMode = 'none';
            this.spine.cursor = 'default';
        }
    }

    updateGridOffset() {
        if (!this.spine) return;
        const gridOverlay = document.querySelector(".grid-overlay");
        if (gridOverlay) {
            const offsetX = this.spine.x - this.app.screen.width / 2;
            const offsetY = this.spine.y - this.app.screen.height / 2;
            gridOverlay.style.setProperty("--grid-offset-x", `${offsetX}px`);
            gridOverlay.style.setProperty("--grid-offset-y", `${offsetY}px`);
            gridOverlay.style.setProperty("--grid-scale", `${this.scale}`);
        }
    }
}