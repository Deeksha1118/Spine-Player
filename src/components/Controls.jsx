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
    onSpineLoaded
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
                    <select value={selectedAnim} onChange={(e) => onAnimChange(e.target.value)}>
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