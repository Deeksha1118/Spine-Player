import { useEffect, useRef } from "react";

export default function TimeLine({ player, paused, setPaused, runningTimeRef, totalTimeRef }) {
    const timelineRef = useRef(null);
    const fillRef = useRef(null);
    const handleRef = useRef(null);
    const isDraggingRef = useRef(false);
    const wasPausedBeforeDragRef = useRef(false);

    useEffect(() => {
        if (!player) return;

        const updateProgress = () => {
            if (isDraggingRef.current) return;

            const track = player.spine?.state?.getCurrent(0);
            if (!track) {
                if (runningTimeRef?.current) runningTimeRef.current.innerText = "0.00s";
                if (totalTimeRef?.current) totalTimeRef.current.innerText = "0.00s";
                return;
            }

            const duration = track.animation.duration;
            const currentTime = track.trackTime;

            let progress = 0;
            let currentSec = 0;
            if (duration > 0) {
                if (track.loop) {
                    currentSec = Math.max(0, currentTime % duration);
                    progress = currentSec / duration;
                } else {
                    currentSec = Math.min(Math.max(0, currentTime), duration);
                    progress = currentSec / duration;
                }
            }

            if (fillRef.current) fillRef.current.style.width = `${progress * 100}%`;
            if (handleRef.current) handleRef.current.style.left = `${progress * 100}%`;
            
            if (runningTimeRef?.current) {
                runningTimeRef.current.innerText = `${currentSec.toFixed(2)}s`;
            }
            if (totalTimeRef?.current) {
                totalTimeRef.current.innerText = `${duration.toFixed(2)}s`;
            }
        };

        player.app.ticker.add(updateProgress);

        return () => {
            player.app.ticker.remove(updateProgress);
        };
    }, [player, runningTimeRef, totalTimeRef]);

    const handleSeek = (e) => {
        if (!timelineRef.current || !player) return;

        const rect = timelineRef.current.getBoundingClientRect();
        const percent = Math.min(Math.max(0, (e.clientX - rect.left) / rect.width), 1);

        const track = player.spine?.state?.getCurrent(0);
        if (!track) return;

        const duration = track.animation.duration;
        const currentSec = duration * percent;
        track.trackTime = currentSec;

        if (fillRef.current) fillRef.current.style.width = `${percent * 100}%`;
        if (handleRef.current) handleRef.current.style.left = `${percent * 100}%`;
        
        if (runningTimeRef?.current) {
            runningTimeRef.current.innerText = `${currentSec.toFixed(2)}s`;
        }
        if (totalTimeRef?.current) {
            totalTimeRef.current.innerText = `${duration.toFixed(2)}s`;
        }
    };

    const handlePointerDown = (e) => {
        isDraggingRef.current = true;
        if (timelineRef.current) {
            timelineRef.current.classList.add("dragging");
            timelineRef.current.setPointerCapture(e.pointerId);
        }

        wasPausedBeforeDragRef.current = paused;
        if (!paused) {
            player.pause();
            setPaused(true);
        }

        handleSeek(e);
    };

    const handlePointerMove = (e) => {
        if (!isDraggingRef.current) return;
        handleSeek(e);
    };

    const handlePointerUp = (e) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;

        if (timelineRef.current) {
            timelineRef.current.classList.remove("dragging");
            try {
                timelineRef.current.releasePointerCapture(e.pointerId);
            } catch (err) {}
        }

        if (!wasPausedBeforeDragRef.current) {
            player.resume();
            setPaused(false);
        }
    };

    return (
        <div
            ref={timelineRef}
            className="timeline"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            <div ref={fillRef} className="timeline-fill" />
            <div ref={handleRef} className="timeline-handle" />
        </div>
    );
}
