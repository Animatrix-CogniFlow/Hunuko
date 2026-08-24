import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Dynamically import Rive hooks to avoid bundle failures if asset resolution differs
let useRive: any;
let useStateMachineInput: any;

try {
  const riveModule = await import("@rive-app/react-canvas");
  useRive = riveModule.useRive;
  useStateMachineInput = riveModule.useStateMachineInput;
} catch (e) {
  console.warn("Rive library could not be loaded dynamically. Falling back to SVG mascot.", e);
}

interface MascotProps {
  isTalking?: boolean;
  pointLeft?: boolean;
  pointRight?: boolean;
  celebrate?: boolean;
  idle?: boolean;
  activeEntityId?: string | null;
  className?: string;
}

export function Mascot({
  isTalking = false,
  pointLeft = false,
  pointRight = false,
  celebrate = false,
  idle = true,
  className = "",
}: MascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gaze, setGaze] = useState({ x: 0, y: 0 }); // values between -1 and 1
  const [riveError, setRiveError] = useState(false);

  // Gaze / Cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mascotCenterX = rect.left + rect.width / 2;
      const mascotCenterY = rect.top + rect.height / 2;

      // Calculate direction vector from mascot to cursor
      const dx = e.clientX - mascotCenterX;
      const dy = e.clientY - mascotCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        // Limit gaze intensity to max 1.0 (or -100 to 100 for Rive input)
        const intensity = Math.min(distance / 400, 1.0);
        setGaze({
          x: (dx / distance) * intensity,
          y: (dy / distance) * intensity,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Rive Engine Instantiation (if library is loaded)
  let riveData: any = null;
  if (useRive && !riveError) {
    try {
      riveData = useRive({
        src: "/assets/mascot.riv",
        stateMachines: "State Machine 1",
        autoplay: true,
        onLoadError: () => {
          console.warn("Failed to load mascot.riv file. Using high-fidelity fallback.");
          setRiveError(true);
        },
      });
    } catch (err) {
      console.warn("Error initializing Rive runtime:", err);
    }
  }

  // Bind Rive state machine inputs
  const isTalkingInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "isTalking") : null;
  const pointLeftInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "pointLeft") : null;
  const pointRightInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "pointRight") : null;
  const celebrateInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "celebrate") : null;
  const idleInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "idle") : null;
  const gazeXInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "gazeX") : null;
  const gazeYInput = useStateMachineInput && riveData?.rive ? useStateMachineInput(riveData.rive, "State Machine 1", "gazeY") : null;

  // React to prop changes inside Rive State Machine
  useEffect(() => {
    if (isTalkingInput) isTalkingInput.value = isTalking;
  }, [isTalking, isTalkingInput]);

  useEffect(() => {
    if (pointLeftInput) pointLeftInput.value = pointLeft;
  }, [pointLeft, pointLeftInput]);

  useEffect(() => {
    if (pointRightInput) pointRightInput.value = pointRight;
  }, [pointRight, pointRightInput]);

  useEffect(() => {
    if (celebrateInput) celebrateInput.value = celebrate;
  }, [celebrate, celebrateInput]);

  useEffect(() => {
    if (idleInput) idleInput.value = idle;
  }, [idle, idleInput]);

  useEffect(() => {
    if (gazeXInput && gazeYInput) {
      // Map -1 to 1 gaze to -100 to 100 for Rive bone aim constraint inputs
      gazeXInput.value = gaze.x * 100;
      gazeYInput.value = gaze.y * 100;
    }
  }, [gaze, gazeXInput, gazeYInput]);

  const shouldUseFallback = !useRive || riveError || !riveData?.RiveComponent;

  return (
    <div
      ref={containerRef}
      className={`relative w-48 h-48 flex items-center justify-center select-none ${className}`}
    >
      <AnimatePresence mode="wait">
        {!shouldUseFallback ? (
          <motion.div
            key="rive-mascot"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            {riveData && <riveData.RiveComponent className="w-full h-full" />}
          </motion.div>
        ) : (
          <motion.div
            key="fallback-mascot"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative w-40 h-40 flex items-center justify-center"
          >
            {/* Ambient Background Aura */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500/10 to-cobalt-500/10 blur-2xl rounded-full" />

            {/* Glowing floating body */}
            <motion.div
              animate={{
                y: celebrate ? [-10, 10, -10] : [-4, 4, -4],
                rotate: celebrate ? [0, 5, -5, 0] : [0, 1, -1, 0],
              }}
              transition={{
                duration: celebrate ? 0.6 : 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-36 h-36 rounded-full border border-white/10 bg-gradient-to-tr from-abyss-950/80 to-abyss-900/60 backdrop-blur-xl p-4 shadow-2xl flex flex-col items-center justify-center"
            >
              {/* Inner glass overlay */}
              <div className="absolute inset-0.5 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

              {/* Antenna / Sensor */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                <div className="w-1 h-3 bg-silver-500/60" />
                <motion.div
                  animate={{
                    backgroundColor: isTalking ? ["#eab308", "#3b82f6", "#eab308"] : "#eab308",
                    boxShadow: isTalking
                      ? ["0 0 10px #eab308", "0 0 20px #3b82f6", "0 0 10px #eab308"]
                      : "0 0 8px #eab308",
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-3.5 h-3.5 rounded-full"
                />
              </div>

              {/* Face Display Screen */}
              <div className="w-28 h-18 rounded-2xl bg-black/60 border border-white/5 flex flex-col items-center justify-between py-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent pointer-events-none" />

                {/* Eyes Box */}
                <div className="flex justify-around w-20 px-2 mt-1">
                  {/* Left Eye */}
                  <div className="w-5 h-5 rounded-full bg-blue-950/50 border border-blue-500/25 flex items-center justify-center overflow-hidden">
                    <motion.div
                      style={{
                        x: gaze.x * 4,
                        y: gaze.y * 4,
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_8px_#3b82f6]"
                    />
                  </div>

                  {/* Right Eye */}
                  <div className="w-5 h-5 rounded-full bg-blue-950/50 border border-blue-500/25 flex items-center justify-center overflow-hidden">
                    <motion.div
                      style={{
                        x: gaze.x * 4,
                        y: gaze.y * 4,
                      }}
                      className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 shadow-[0_0_8px_#3b82f6]"
                    />
                  </div>
                </div>

                {/* Mouth / Waveform */}
                <div className="h-6 flex items-center justify-center gap-0.5 w-16">
                  {isTalking ? (
                    [0.2, 0.8, 0.4, 0.9, 0.3].map((delay, index) => (
                      <motion.div
                        key={index}
                        animate={{
                          height: [4, 16, 4],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          delay: delay,
                        }}
                        className="w-1 rounded-full bg-gradient-to-t from-gold-500 to-yellow-300 shadow-[0_0_6px_#eab308]"
                      />
                    ))
                  ) : (
                    <div className="w-8 h-1 rounded-full bg-gold-500/40" />
                  )}
                </div>
              </div>

              {/* Dynamic Arm Overlays for gestures */}
              {/* Pointing Left */}
              <AnimatePresence>
                {pointLeft && (
                  <motion.div
                    initial={{ opacity: 0, x: 20, rotate: -20 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center"
                  >
                    <div className="w-8 h-3 rounded-full bg-gradient-to-r from-gold-500 to-silver-400 shadow-md border border-white/10" />
                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                  </motion.div>
                )}

                {/* Pointing Right */}
                {pointRight && (
                  <motion.div
                    initial={{ opacity: 0, x: -20, rotate: 20 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute -right-8 top-1/2 -translate-y-1/2 flex items-center flex-row-reverse"
                  >
                    <div className="w-8 h-3 rounded-full bg-gradient-to-l from-gold-500 to-silver-400 shadow-md border border-white/10" />
                    <div className="w-2 h-2 rounded-full bg-gold-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
