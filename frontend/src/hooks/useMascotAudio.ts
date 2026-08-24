import { useState, useRef, useEffect, useCallback } from "react";

interface TimelineEvent {
  id: string;
  time: number;
  target_entity_id?: string;
  action_type?: string;
}

export function useMascotAudio() {
  const [isTalking, setIsTalking] = useState(false);
  const [pointLeft, setPointLeft] = useState(false);
  const [pointRight, setPointRight] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  const timersRef = useRef<number[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Helper to parse "00:03.2" or "3.2" to seconds
  const parseTimestamp = (ts: string): number => {
    const parts = ts.split(":");
    if (parts.length === 2) {
      const mins = parseFloat(parts[0]);
      const secs = parseFloat(parts[1]);
      return mins * 60 + secs;
    }
    return parseFloat(ts) || 0;
  };

  // Helper to parse narration captions with inline event tags
  // e.g. "Look here <event id="nucleus" timestamp="00:02.5"/> and notice this."
  const parseNarrationEvents = (text: string): { cleanText: string; events: TimelineEvent[] } => {
    const events: TimelineEvent[] = [];
    const eventRegex = /<event\s+id="([^"]+)"\s+timestamp="([^"]+)"\s*\/>/g;
    
    let cleanText = text;
    let match;
    
    // Extract events before replacing tags
    while ((match = eventRegex.exec(text)) !== null) {
      events.push({
        id: match[1],
        time: parseTimestamp(match[2]),
        target_entity_id: match[1],
        action_type: match[1].includes("left") ? "point_left" : "point_right"
      });
    }

    // Clean up all tags for TTS reading
    cleanText = text.replace(eventRegex, "");
    return { cleanText, events };
  };

  // Clear all pending setTimeout event timers
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  }, []);

  // Cancel speech and clear gestures
  const cancel = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    clearTimers();
    setIsTalking(false);
    setPointLeft(false);
    setPointRight(false);
    setCelebrate(false);
    setActiveHighlightId(null);
  }, [clearTimers]);

  // Pause speech
  const pause = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
      setIsTalking(false);
    }
  }, []);

  // Resume speech
  const resume = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.resume();
      setIsTalking(true);
    }
  }, []);

  // Main speak function
  const speak = useCallback((text: string, sceneActions: any[] = []) => {
    cancel();

    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech synthesis not supported in this browser.");
      return;
    }

    const { cleanText, events: inlineEvents } = parseNarrationEvents(text);
    
    // Combine inline events and sceneActions triggers
    const combinedEvents: TimelineEvent[] = [...inlineEvents];
    
    sceneActions.forEach((act) => {
      combinedEvents.push({
        id: act.target_entity_id || act.action_type,
        time: act.timestamp_sec || 0,
        target_entity_id: act.target_entity_id,
        action_type: act.action_type
      });
    });

    // Create the Speech Utterance
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    utterance.onstart = () => {
      setIsTalking(true);
      
      // Schedule all gesture and highlight timeouts relative to start
      combinedEvents.forEach((ev) => {
        const timerId = window.setTimeout(() => {
          // Trigger highlights
          if (ev.target_entity_id) {
            setActiveHighlightId(ev.target_entity_id);
          }

          // Trigger mascot gestures
          const isLeft = ev.action_type === "point_left" || ev.id?.toLowerCase().includes("left");
          const isRight = ev.action_type === "point_right" || ev.id?.toLowerCase().includes("right");
          const isCelebrate = ev.action_type === "celebrate" || ev.id?.toLowerCase().includes("celebrate");

          if (isLeft) {
            setPointLeft(true);
            const t = window.setTimeout(() => setPointLeft(false), 2200);
            timersRef.current.push(t);
          } else if (isRight) {
            setPointRight(true);
            const t = window.setTimeout(() => setPointRight(false), 2200);
            timersRef.current.push(t);
          } else if (isCelebrate) {
            setCelebrate(true);
            const t = window.setTimeout(() => setCelebrate(false), 2200);
            timersRef.current.push(t);
          }
        }, ev.time * 1000);

        timersRef.current.push(timerId);
      });
    };

    utterance.onend = () => {
      setIsTalking(false);
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsTalking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [cancel]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    isTalking,
    pointLeft,
    pointRight,
    celebrate,
    activeHighlightId,
    speak,
    pause,
    resume,
    cancel,
    setActiveHighlightId,
  };
}
