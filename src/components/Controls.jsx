import { useRef } from "react";
import DropZone from "./DropZone";
import TimeLine from "./TimeLine";

export default function Controls({
    player,
    paused,
    setPaused,
    animations,
    selectedAnim,
    onAnimChange,
    onSpineLoaded,
    onExportVideo,
    exporting,
    onReset
}) {
    const runningTimeRef = useRef(null);
    const totalTimeRef = useRef(null);

    const toggle = () => {
        if (paused) {
            player.resume();
        } else {
            player.pause();
        }
        setPaused(!paused);
    };

    return (
        <div className="player-ui">
            <DropZone player={player} onLoaded={onSpineLoaded} />

            <div className="time-labels">
                <span ref={runningTimeRef}>0.00s</span>
                <span ref={totalTimeRef}>0.00s</span>
            </div>

            <TimeLine 
                player={player} 
                paused={paused} 
                setPaused={setPaused} 
                runningTimeRef={runningTimeRef} 
                totalTimeRef={totalTimeRef} 
            />
            <div className="controls">
                <button onClick={toggle}>{paused ? "▶" : "⏸"}</button>

                <div className="right-controls">
                    <button 
                        onClick={onReset} 
                        className="reset-btn-bottom" 
                        title="Reset Zoom & Position"
                    >
                        <svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                        </svg>
                        <span>Reset</span>
                    </button>
                    <button 
                        onClick={onExportVideo} 
                        className="export-btn" 
                        disabled={exporting}
                        title="Export MP4 Video"
                    >
                        {exporting ? (
                            <>
                                <span className="recording-dot">🔴</span>
                                <span>Recording...</span>
                            </>
                        ) : (
                            <>
                                <svg stroke="currentColor" fill="none" stroke-width="2.5" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                                <span>Export</span>
                            </>
                        )}
                    </button>
                    <select className="anim-select" value={selectedAnim} onChange={(e) => onAnimChange(e.target.value)}>
                        {animations.map((anim) => (
                            <option key={anim} value={anim}>
                                {anim}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}