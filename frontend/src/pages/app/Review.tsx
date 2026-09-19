import { useMemo, useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, Check, Sparkles, Trophy } from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useStudyStore } from "../../stores/useStudyStore";
import { studyService } from "../../services/studyService";
import type { ReviewGrade } from "../../lib/types";
import { MarkdownLite } from "../../components/tutor/MarkdownLite";

const GRADES: { grade: ReviewGrade; label: string; sub: string; cls: string }[] = [
  { grade: "again", label: "Again", sub: "< 1m", cls: "bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/20" },
  { grade: "hard", label: "Hard", sub: "soon", cls: "bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20" },
  { grade: "good", label: "Good", sub: "1–6d", cls: "bg-[#507C7C] hover:bg-[#96C4BB] hover:text-[#070B0A] shadow-md shadow-[#507C7C]/20" },
  { grade: "easy", label: "Easy", sub: "longer", cls: "bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-md shadow-[#D4AF37]/25" },
];

export default function Review() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const deck = useStudyStore((s) => s.documents.find((d) => d.document_id === deckId));
  const reviewCard = useStudyStore((s) => s.reviewCard);

  // Snapshot the due queue once at session start so grading doesn't reshuffle mid-session.
  const queue = useMemo(() => {
    if (!deck) return [];
    const cards = deck.flashcards ?? [];
    const due = studyService.dueCards(cards);
    return (due.length ? due : cards).map((c) => c.id);
  }, [deck?.document_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);

  const currentId = queue[pos];
  const card = deck?.flashcards?.find((c) => c.id === currentId);
  const finished = pos >= queue.length;

  const grade = useCallback(
    (g: ReviewGrade) => {
      if (!deck || !currentId) return;
      reviewCard(deck.document_id, currentId, g);
      setDone((d) => d + 1);
      setFlipped(false);
      setPos((p) => p + 1);
    },
    [deck, currentId, reviewCard]
  );

  // Keyboard: space to flip, 1-4 to grade
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
      if (e.key === " ") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ["1", "2", "3", "4"].includes(e.key)) {
        grade(GRADES[Number(e.key) - 1].grade);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, finished, grade]);

  if (!deck) return <Navigate to="/app/study" replace />;

  return (
    <PageContainer>
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate(`/app/study/${deck.document_id}`)}
          className="inline-flex items-center gap-1.5 text-sm text-[#A3B8B5] transition hover:text-[#D4AF37] cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> {deck.title}
        </button>
        {!finished && (
          <Badge tone="teal">
            Card {pos + 1} of {queue.length}
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      {!finished && (
        <div className="mx-auto mb-8 h-1.5 max-w-2xl overflow-hidden rounded-full bg-[#111A18] border border-[#96C4BB]/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#507C7C] via-[#96C4BB] to-[#D4AF37]"
            animate={{ width: `${(pos / Math.max(1, queue.length)) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        {finished ? (
          /* Celebratory Mascot State on Session Complete */
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto max-w-md text-center rounded-3xl border border-[#96C4BB]/30 bg-[#0E1715]/90 p-8 shadow-[0_0_40px_rgba(80,124,124,0.25)] backdrop-blur-2xl"
          >
            {/* Mascot Celebration Animation */}
            <div className="relative mb-6 flex items-center justify-center">
              <div className="absolute h-36 w-36 rounded-full bg-[#D4AF37]/20 blur-2xl animate-pulse" />
              <div className="absolute h-28 w-28 rounded-full bg-[#507C7C]/30 blur-xl" />
              <motion.img
                src="/assets/mascot.jpg"
                alt="Celebratory Hunuko"
                animate={{ y: [0, -10, 0], rotate: [0, 2, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 h-32 w-32 rounded-3xl object-contain drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)] border-2 border-[#D4AF37]/60"
              />
              <span className="absolute -top-1 -right-4 text-2xl animate-bounce">🎉</span>
            </div>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 px-3 py-1 text-xs font-bold text-[#D4AF37] mb-3">
              <Trophy className="h-3.5 w-3.5" /> Deck Mastery Progress
            </span>

            <h2 className="font-display text-2xl font-bold tracking-tight text-[#F8FAFA]">Session Complete!</h2>
            <p className="mt-2 text-sm text-[#B2C9C5] leading-relaxed">
              You reviewed <span className="font-bold text-[#F8FAFA]">{done}</span> {done === 1 ? "card" : "cards"}. Spaced-repetition has updated your memory intervals for optimum retention.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                onClick={() => navigate(`/app/study/${deck.document_id}/quiz`)}
                className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-lg shadow-[#D4AF37]/20 border-none cursor-pointer"
              >
                <Sparkles className="h-4 w-4 mr-1.5" /> Take the quiz
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/app/study/${deck.document_id}`)}
                className="border-[#96C4BB]/30 text-[#F8FAFA] hover:bg-[#507C7C]/20 cursor-pointer"
              >
                Back to deck
              </Button>
            </div>
          </motion.div>
        ) : card ? (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-2xl"
          >
            {/* Flip card */}
            <div
              className="relative cursor-pointer select-none"
              style={{ perspective: 1400 }}
              onClick={() => setFlipped((f) => !f)}
              role="button"
              tabIndex={0}
              aria-label="Flashcard. Press space to flip."
            >
              <motion.div
                className="relative h-72 w-full sm:h-80"
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front: Deep Slate Card Surface */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-[#96C4BB]/25 bg-[#0E1715]/95 p-8 text-center shadow-2xl backdrop-blur-xl transition-colors hover:border-[#96C4BB]/50"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="mb-4 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#96C4BB] bg-[#507C7C]/20 px-2.5 py-0.5 rounded-full border border-[#96C4BB]/30">
                    Question
                  </span>
                  <div className="font-display text-xl font-bold tracking-tight sm:text-2xl text-center max-w-md text-[#F8FAFA]">
                    <MarkdownLite text={card.front} />
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-[#A3B8B5]">
                    <RotateCcw className="h-3.5 w-3.5 text-[#96C4BB]" /> Tap or press space to flip
                  </span>
                </div>

                {/* Back: Deep slate with Gold Edge Illumination on flip */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-[#D4AF37]/70 bg-gradient-to-br from-[#131F1C] via-[#0E1715] to-[#152220] p-8 text-center shadow-[0_0_35px_rgba(212,175,55,0.3)] backdrop-blur-xl"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/40">
                    <Sparkles className="h-3.5 w-3.5" /> Answer
                  </span>
                  <div className="text-lg leading-relaxed sm:text-xl text-center max-w-md text-[#F8FAFA]">
                    <MarkdownLite text={card.back} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Grade controls */}
            <AnimatePresence>
              {flipped ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 grid grid-cols-4 gap-2.5"
                >
                  {GRADES.map((g, i) => (
                    <button
                      key={g.grade}
                      onClick={() => grade(g.grade)}
                      className={`flex flex-col items-center rounded-2xl py-3 text-white transition-all cursor-pointer hover:scale-102 ${g.cls}`}
                    >
                      <span className="text-sm font-bold">{g.label}</span>
                      <span className="text-[11px] opacity-80">{g.sub}</span>
                      <span className="mt-1 hidden text-[10px] opacity-70 sm:block">press {i + 1}</span>
                    </button>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex justify-center"
                >
                  <Button
                    onClick={() => setFlipped(true)}
                    className="bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] font-bold shadow-lg shadow-[#D4AF37]/25 px-8 cursor-pointer"
                  >
                    <Check className="h-4 w-4 mr-1.5" /> Show answer
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </PageContainer>
  );
}
