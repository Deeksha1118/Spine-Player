import { TextureAtlas, SpineTexture, Spine } from "@esotericsoftware/spine-pixi-v8";
import { Assets, Texture } from "pixi.js";

export function setupDragDropLoader(player, onLoaded) {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("fileInput");

    if (!dropZone || !fileInput) return;
    dropZone.onclick = () => {
        fileInput.click();
    };

    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    };

    dropZone.ondragleave = () => {
        dropZone.classList.remove("dragover");
    };

    dropZone.ondrop = async (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");

        const files = Array.from(e.dataTransfer.files);
        await handleFiles(files);
    };

    fileInput.onchange = async () => {
        const files = Array.from(fileInput.files);
        await handleFiles(files);
        fileInput.value = "";
    };

    async function handleFiles(files) {
        const allowedExtensions = [".json", ".atlas", ".png", ".webp"];
        const invalidFiles = files.filter(file => {
            const ext = "." + file.name.split(".").pop().toLowerCase();
            return !allowedExtensions.includes(ext);
        });

        if (invalidFiles.length > 0) {
            showToast(
                "Invalid File Type",
                `Detected invalid files: ${invalidFiles.map(f => f.name).join(", ")}. Please upload only .json, .atlas, .png, and .webp files.`,
                "error"
            );
            return;
        }

        let jsonFile = null;
        let atlasFile = null;
        const imageFiles = [];

        for (const file of files) {
            const ext = "." + file.name.split(".").pop().toLowerCase();
            if (ext === ".json") {
                jsonFile = file;
            } else if (ext === ".atlas") {
                atlasFile = file;
            } else if (ext === ".png" || ext === ".webp") {
                imageFiles.push(file);
            }
        }

        if (!jsonFile || !atlasFile || imageFiles.length === 0) {
            showToast(
                "Missing Files",
                "Please select or drop one .json, one .atlas, and at least one image file (.png or .webp) simultaneously.",
                "error"
            );
            return;
        }

        try {
            const originalText = dropZone.innerHTML;
            dropZone.innerHTML = "<span>Loading Spine character...</span>";

            const imageTextures = {};
            for (const imgFile of imageFiles) {
                const imgUrl = URL.createObjectURL(imgFile);
                const img = new Image();
                img.src = imgUrl;
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        URL.revokeObjectURL(imgUrl);
                        resolve();
                    };
                    img.onerror = () => {
                        URL.revokeObjectURL(imgUrl);
                        reject(new Error(`Failed to load image: ${imgFile.name}`));
                    };
                });

                const texture = Texture.from(img);
                imageTextures[imgFile.name] = texture;
            }

            const atlasText = await atlasFile.text();
            const textureAtlas = new TextureAtlas(atlasText);
            for (const page of textureAtlas.pages) {
                const texture = imageTextures[page.name];
                if (texture) {
                    page.setTexture(SpineTexture.from(texture.source));
                } else {
                    const matchedName = Object.keys(imageTextures).find(
                        name => name.toLowerCase() === page.name.toLowerCase()
                    );
                    if (matchedName) {
                        page.setTexture(SpineTexture.from(imageTextures[matchedName].source));
                    } else {
                        throw new Error(`Atlas texture page not found in uploaded files: ${page.name}`);
                    }
                }
            }

            const jsonText = await jsonFile.text();
            const skeletonData = JSON.parse(jsonText);

            const newAlias = `custom_${Date.now()}`;
            const skeletonKey = `${newAlias}Data`;
            const atlasKey = `${newAlias}Atlas`;

            Assets.cache.set(skeletonKey, skeletonData);
            Assets.cache.set(atlasKey, textureAtlas);

            if (player.spine) {
                player.app.stage.removeChild(player.spine);
                player.spine.destroy({ children: true });
            }

            player.assetAlias = newAlias;
            player.spine = Spine.from({
                skeleton: skeletonKey,
                atlas: atlasKey,
            });

            player.spine.x = player.app.screen.width / 2;
            player.spine.y = player.app.screen.height / 2;
            player.spine.scale.set(player.scale);

            player.app.stage.addChild(player.spine);

            const animations = player.getAnimations();
            const defaultAnim = animations.includes("idle") ? "idle" : animations[0];
            player.playAnimation(defaultAnim, player.looping);
            // player.enableDragging();

            dropZone.innerHTML = originalText;

            showToast(
                "Character Loaded",
                `Successfully loaded character: ${jsonFile.name.replace('.json', '')}`,
                "success"
            );

            if (onLoaded) {
                onLoaded(defaultAnim);
            }

        } catch (error) {
            console.error("Error loading custom Spine files:", error);
            showToast("Failed to load Spine", error.message, "error");
            dropZone.innerHTML = "<span>Drag & Drop Spine files here</span><span style=\"font-size: 10px; color: rgba(255, 255, 255, 0.45); font-weight: normal;\">or click to select (.json, .atlas, .png, .webp)</span>";
        }
    }
}

export function showToast(title, message, type = "info") {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconChar = "ℹ️";
    if (type === "error") iconChar = "⚠️";
    if (type === "success") iconChar = "✅";

    toast.innerHTML = `
        <span class="toast-icon">${iconChar}</span>
        <div class="toast-body">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
        <button class="toast-close">✕</button>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    const closeBtn = toast.querySelector(".toast-close");
    let removeTimeout;

    const removeToast = () => {
        clearTimeout(removeTimeout);
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => {
            toast.remove();
            if (container.children.length === 0) {
                container.remove();
            }
        });
    };

    closeBtn.onclick = removeToast;
    removeTimeout = setTimeout(removeToast, 4000);
}
