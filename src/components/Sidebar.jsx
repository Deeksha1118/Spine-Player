export default function Sidebar({
    isOpen,
    onClose,
    scale,
    onScaleChange,
    speed,
    onSpeedChange,
    gridActive,
    onGridToggle,
    theme,
    onThemeToggle,
    looping,
    onLoopToggle,
    dragEnabled,
    onDragToggle
}) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-header">
                <h3>Settings</h3>
                <button id="closeSidebarBtn" onClick={onClose}>✕</button>
            </div>

            <div className="sidebar-content">
                <div className="control-group">
                    <div className="control-label">
                        <span>Scale</span>
                        <span id="scaleVal">{scale.toFixed(2)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="2"
                        step="0.05"
                        value={scale}
                        onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                    />
                </div>

                <div className="control-group">
                    <div className="control-label">
                        <span>Speed</span>
                        <span id="speedVal">{speed.toFixed(2)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="3"
                        step="0.05"
                        value={speed}
                        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                    />
                </div>

                <div className="control-group toggle-group">
                    <span>Enable Dragging</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={dragEnabled}
                            onChange={(e) => onDragToggle(e.target.checked)}
                        />
                        <span className="slider-switch" />
                    </label>
                </div>

                <div className="control-group toggle-group">
                    <span>Show Grid</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={gridActive}
                            onChange={(e) => onGridToggle(e.target.checked)}
                        />
                        <span className="slider-switch" />
                    </label>
                </div>

                <div className="control-group toggle-group">
                    <span>Loop Animation</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={looping}
                            onChange={(e) => onLoopToggle(e.target.checked)}
                        />
                        <span className="slider-switch" />
                    </label>
                </div>

                <div className="control-group toggle-group">
                    <span>Theme (Light/Dark)</span>
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={theme === "light"}
                            onChange={(e) => onThemeToggle(e.target.checked ? "light" : "dark")}
                        />
                        <span className="slider-switch" />
                    </label>
                </div>
            </div>
        </div>
    );
}
