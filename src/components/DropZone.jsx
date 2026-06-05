import { useEffect } from "react";
import { setupDragDropLoader } from "../core/dragDropLoader";

export default function DropZone({ player, onLoaded }) {
    useEffect(() => {
        if (!player) return;
        setupDragDropLoader(player, onLoaded);
    }, [player, onLoaded]);

    return (
        <div id="drop-zone">
            <span>Drag & Drop Spine files here</span>
            <span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.45)", fontWeight: "normal" }}>
                or click to select (.json, .atlas, .png, .webp)
            </span>
            <input type="file" id="fileInput" multiple accept=".json,.atlas,.png,.webp" style={{ display: "none" }} />
        </div>
    );
}
