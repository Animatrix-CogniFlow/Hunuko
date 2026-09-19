import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Sparkles, FileText, ChevronDown,
  AlertCircle, Loader2, CheckCircle2, RotateCcw,
  Volume2, VolumeX,
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { aiService } from "../../services/aiService";
import type {
  OralExamStartResponse,
  OralAnswerResponse,
  OralExamResults,
  OralQuestion,
} from "../../services/aiService";
import { useChatStore } from "../../stores/useChatStore";
import { cn, uid } from "../../lib/utils";
import type { TranscriptEntry } from "../../lib/types";
import { MarkdownLite } from "../../components/tutor/MarkdownLite";

// ── Stage machine ────────────────────────────────────────────
type Stage =
  | "select"       // choosing document + settings
  | "ready"        // exam started, question displayed, waiting
  | "recording"    // mic active
  | "analyzing"    // waiting for backend response
  | "between"      // showing feedback before next question
  | "complete";    // all questions done, results shown

export default function OralExam() {
  // ── Document selection ──
  const documents = useChatStore((s) => s.documents);
  const selectedDocId = useChatStore((s) => s.selectedDocumentId);
  const selectDocument = useChatStore((s) => s.selectDocument);
  const docsLoading = useChatStore((s) => s.documentsLoading);
  const loadDocuments = useChatStore((s) => s.loadDocuments);
  const persona = useChatStore((s) => s.persona);
  const languageCode = useChatStore((s) => s.languageCode);
  
  const [docDropOpen, setDocDropOpen] = useState(false);
  const docDropRef = useRef<HTMLDivElement>(null);

  // ── Exam state ──
  const [stage, setStage] = useState<Stage>("select");
  const [examId, setExamId] = useState<string | null>(null);
  const [question, setQuestion] = useState<OralQuestion | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [totalQ, setTotalQ] = useState(5);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [lastEval, setLastEval] = useState<OralAnswerResponse["evaluation"] | null>(null);
  const [results, setResults] = useState<OralExamResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // --- Tries / Correctness state ---
  const [currentTry, setCurrentTry] = useState(1);
  const [maxTries, setMaxTries] = useState(3);
  const [isCorrect, setIsCorrect] = useState(false);
  const [nextQ, setNextQ] = useState<OralQuestion | null>(null);
  const [isCompleteResponse, setIsCompleteResponse] = useState(false);

  // --- Text-to-Speech state ---
  const [readAloud, setReadAloud] = useState(true);

  // ── Recording ──
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Helper to read text aloud using native Web Speech API
  const speak = (text: string, force = false) => {
    if (!readAloud && !force) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageCode || "en";
    window.speechSynthesis.speak(utterance);
  };

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // ── Load documents on mount ──
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Close doc dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (docDropRef.current && !docDropRef.current.contains(e.target as Node))
        setDocDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Start exam ──────────────────────────────────────────────
  async function startExam() {
    if (!selectedDocId) return;
    setError(null);
    setTranscript([]);
    setLastEval(null);
    setResults(null);
    setQIndex(0);
    setStage("analyzing");

    try {
      const res: OralExamStartResponse = await aiService.startOralExam(
        selectedDocId,
        { count: totalQ, languageCode, persona }
      );
      setExamId(res.exam_id);
      setTotalQ(res.total_questions);
      setQuestion(res.first_question);
      setTranscript([
        { id: uid("t"), speaker: "examiner", text: res.first_question.question },
      ]);
      setStage("ready");
      speak(res.first_question.question);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start exam.");
      setStage("select");
    }
  }

  // ── Recording controls ──────────────────────────────────────
  async function startRecording() {
    window.speechSynthesis.cancel();
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.start(250); // collect in 250ms chunks
      mediaRef.current = mr;
      setStage("recording");
    } catch {
      setError("Microphone access denied. Please allow mic access and try again.");
    }
  }

  async function stopAndSubmit() {
    if (!mediaRef.current || !examId || !question) return;
    setStage("analyzing");

    // Stop recorder and wait for final data
    await new Promise<void>((resolve) => {
      mediaRef.current!.onstop = () => resolve();
      mediaRef.current!.stop();
      mediaRef.current!.stream.getTracks().forEach((t) => t.stop());
    });

    try {
      const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });

      const res: OralAnswerResponse = await aiService.submitOralAnswer(
        examId,
        audioBlob
      );

      // Add student answer to transcript
      setTranscript((prev) => [
        ...prev,
        { id: uid("t"), speaker: "student", text: res.transcription },
      ]);

      setLastEval(res.evaluation);
      setCurrentTry(res.current_try);
      setMaxTries(res.max_tries);
      setIsCorrect(res.is_correct);
      setIsCompleteResponse(res.is_complete);
      if (res.next_question) {
        setNextQ(res.next_question);
      } else {
        setNextQ(null);
      }

      setStage("between");

      // Auto-speak details of feedback
      if (res.is_correct) {
        speak("Correct!");
      } else {
        if (res.current_try < res.max_tries && res.evaluation.clue) {
          speak(`Incorrect. Hint: ${res.evaluation.clue}`);
        } else if (res.current_try >= res.max_tries && res.evaluation.correct_answer) {
          speak(`Incorrect. The correct answer is: ${res.evaluation.correct_answer}`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit answer.");
      setStage("ready");
    }
  }

  // ── Reset ───────────────────────────────────────────────────
  function reset() {
    window.speechSynthesis.cancel();
    setStage("select");
    setExamId(null);
    setQuestion(null);
    setTranscript([]);
    setLastEval(null);
    setResults(null);
    setError(null);
    setQIndex(0);
    setCurrentTry(1);
    setIsCorrect(false);
    setNextQ(null);
    setIsCompleteResponse(false);
  }

  async function handleContinue() {
    window.speechSynthesis.cancel();
    if (isCompleteResponse) {
      if (!examId) return;
      setStage("analyzing");
      try {
        const fullResults = await aiService.getOralExamResults(examId);
        setResults(fullResults);
        setStage("complete");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load results.");
        setStage("between");
      }
    } else if (nextQ) {
      setQuestion(nextQ);
      setTranscript((prev) => [
        ...prev,
        { id: uid("t"), speaker: "examiner", text: nextQ.question },
      ]);
      setQIndex((i) => i + 1);
      setLastEval(null);
      setNextQ(null);
      setCurrentTry(1);
      setIsCorrect(false);
      setIsCompleteResponse(false);
      setStage("ready");
      speak(nextQ.question);
    }
  }

  function handleTryAgain() {
    window.speechSynthesis.cancel();
    setLastEval(null);
    setStage("ready");
  }

  const selectedDoc = documents.find((d) => d.id === selectedDocId);
  const isActive = stage === "recording" || stage === "analyzing";

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F8FAFA]">
          Voice Practice Partner
        </h1>
        <p className="mt-1 text-sm text-[#B2C9C5]">
          Practice speaking your answers out loud. Our AI tutor will help you improve and provide friendly tips on your understanding.
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 backdrop-blur-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Select stage ── */}
      {stage === "select" && (
        <Card className="mx-auto max-w-md bg-[#0E1715]/85 border-[#96C4BB]/25 backdrop-blur-xl shadow-2xl">
          <CardBody className="space-y-5">
            <h2 className="font-display text-lg font-semibold tracking-tight text-[#F8FAFA]">
              Choose Your Study Material
            </h2>

            {/* Document picker */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#96C4BB]">
                Document
              </p>
              <div ref={docDropRef} className="relative">
                <button
                  onClick={() => setDocDropOpen((o) => !o)}
                  disabled={docsLoading}
                  className={cn(
                    "flex h-11 w-full items-center gap-2.5 rounded-xl border px-3.5 text-sm transition-all backdrop-blur-md",
                    "border-[#96C4BB]/25 bg-[#111A18] text-[#F8FAFA] hover:border-[#D4AF37]",
                    docDropOpen && "border-[#D4AF37] ring-2 ring-[#D4AF37]/20"
                  )}
                >
                  {docsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#96C4BB]" />
                  ) : (
                    <FileText className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                  )}
                  <span className="flex-1 truncate text-left">
                    {docsLoading
                      ? "Loading…"
                      : selectedDoc?.title ?? "Select a document"}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-[#96C4BB] transition-transform",
                      docDropOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {docDropOpen && documents.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ duration: 0.13 }}
                      className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-52 overflow-y-auto rounded-xl border border-[#96C4BB]/30 bg-[#0E1715]/95 p-1.5 shadow-2xl backdrop-blur-2xl scrollbar-thin"
                    >
                      {documents.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            selectDocument(doc.id);
                            setDocDropOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                            doc.id === selectedDocId
                              ? "bg-[#507C7C]/30 text-[#F8FAFA] font-medium border border-[#96C4BB]/30"
                              : "text-[#B2C9C5] hover:bg-[#111A18]/80 hover:text-[#F8FAFA]"
                          )}
                        >
                          <FileText className="h-4 w-4 shrink-0 text-[#D4AF37]" />
                          <div className="min-w-0">
                            <p className="truncate font-medium">{doc.title}</p>
                            <p className="truncate text-[11px] text-[#96C4BB]">
                              {doc.subject}
                            </p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Number of questions */}
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-[#96C4BB]">
                Select Question Count
              </p>
              <div className="flex gap-2">
                {[3, 5, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setTotalQ(n)}
                    className={cn(
                      "flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all",
                      n === totalQ
                        ? "border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                        : "border-[#96C4BB]/20 bg-[#111A18] text-[#B2C9C5] hover:border-[#D4AF37] hover:text-[#F8FAFA]"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 border-none"
              onClick={startExam}
              disabled={!selectedDocId || docsLoading}
            >
              <Mic className="h-4 w-4" /> Start Session
            </Button>
          </CardBody>
        </Card>
      )}

      {/* ── Active exam stages ── */}
      {(stage === "ready" ||
        stage === "recording" ||
        stage === "analyzing" ||
        stage === "between") && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Examiner stage */}
          <div className="lg:col-span-3">
            <div className="relative flex flex-col items-center overflow-hidden rounded-3xl border border-[#96C4BB]/25 bg-[#070B0A]/95 p-10 shadow-2xl backdrop-blur-xl">
              <AmbientBackground variant="hero" particles={false} />
              <div className="absolute inset-0 cf-grid-bg opacity-20" />
              <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[#507C7C]/15 blur-3xl" />

              {/* Speech control */}
              <div className="absolute right-6 top-6 z-10">
                <button
                  onClick={() => {
                    const nextVal = !readAloud;
                    setReadAloud(nextVal);
                    if (!nextVal) {
                      window.speechSynthesis.cancel();
                    } else if (question) {
                      speak(question.question);
                    }
                  }}
                  className="rounded-full bg-[#111A18] border border-[#96C4BB]/30 p-2 text-[#F8FAFA] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all shadow-md"
                  title={readAloud ? "Disable read aloud" : "Enable read aloud"}
                >
                  {readAloud ? <Volume2 className="h-4 w-4 text-[#D4AF37]" /> : <VolumeX className="h-4 w-4 text-[#B2C9C5]" />}
                </button>
              </div>

              {/* Progress indicator */}
              <div className="relative flex items-center gap-1.5">
                {Array.from({ length: totalQ }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-6 rounded-full transition-colors",
                      i < qIndex
                        ? "bg-[#507C7C]"
                        : i === qIndex
                        ? "bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"
                        : "bg-[#96C4BB]/20"
                    )}
                  />
                ))}
              </div>

              <ExamOrb recording={stage === "recording"} analyzing={stage === "analyzing"} />

              <div className="relative mt-8 max-w-md text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                  Topic {qIndex + 1} of {totalQ} {stage === "between" && `(Attempt ${currentTry} of ${maxTries})`}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="text-lg text-[#F8FAFA] leading-relaxed flex-1 text-center font-medium">
                    {question?.question && <MarkdownLite text={question.question} />}
                  </div>
                  {question?.question && (
                    <button
                      onClick={() => speak(question.question, true)}
                      className="rounded-full bg-[#111A18] border border-[#96C4BB]/25 p-1.5 text-[#D4AF37] hover:border-[#D4AF37] transition-colors shrink-0"
                      title="Read question aloud"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {question?.key_points && question.key_points.length > 0 && (
                  <p className="mt-2 text-xs text-[#96C4BB]">
                    Tip: Try to mention: {question.key_points.slice(0, 2).join(", ")}
                  </p>
                )}
              </div>

              <Waveform active={stage === "recording"} />

              {stage === "between" ? (
                isCorrect || currentTry >= maxTries ? (
                  <Button
                    size="lg"
                    className="relative mt-8 bg-gradient-to-r from-[#507C7C] to-[#96C4BB] text-[#070B0A] font-bold border-none hover:brightness-110 shadow-lg"
                    onClick={handleContinue}
                  >
                    <CheckCircle2 className="h-5 w-5" /> Continue
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="relative mt-8 bg-[#111A18] border border-[#96C4BB]/30 text-[#F8FAFA] hover:border-[#D4AF37]"
                    variant="secondary"
                    onClick={handleTryAgain}
                  >
                    <RotateCcw className="h-5 w-5 text-[#D4AF37]" /> Try Again (Attempt {currentTry} of {maxTries} used)
                  </Button>
                )
              ) : (
                <Button
                  size="lg"
                  className={cn(
                    "relative mt-8 font-bold border-none shadow-lg",
                    stage === "recording" 
                      ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/25" 
                      : "bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] hover:brightness-110 shadow-[#D4AF37]/25"
                  )}
                  onClick={stage === "recording" ? stopAndSubmit : startRecording}
                  loading={stage === "analyzing"}
                  disabled={stage === "analyzing"}
                >
                  {stage === "recording" ? (
                    <><MicOff className="h-5 w-5" /> Stop & Answer</>
                  ) : stage === "analyzing" ? (
                    <><Loader2 className="h-5 w-5 animate-spin" /> Listening…</>
                  ) : (
                    <><Mic className="h-5 w-5" /> Record Answer</>
                  )}
                </Button>
              )}

              <button
                onClick={reset}
                className="relative mt-4 flex items-center gap-1.5 text-xs text-[#B2C9C5] transition hover:text-[#F8FAFA]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Cancel Session
              </button>
            </div>
          </div>

          {/* Transcript + feedback */}
          <div className="space-y-6 lg:col-span-2">
            <Card className="bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl">
              <CardBody>
                <h3 className="mb-3 font-display font-semibold tracking-tight text-[#F8FAFA]">
                  Conversation History
                </h3>
                <div className="max-h-64 space-y-3 overflow-y-auto scrollbar-thin">
                  <AnimatePresence initial={false}>
                    {transcript.map((t) => (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={t.speaker === "examiner" ? "" : "text-right"}
                      >
                        <p className="text-[11px] uppercase tracking-wider text-[#96C4BB]">
                          {t.speaker === "examiner" ? "Tutor" : "You"}
                        </p>
                        <div
                          className={cn(
                            "mt-1 inline-block rounded-2xl px-3.5 py-2 text-sm text-left shadow-sm",
                            t.speaker === "examiner"
                              ? "bg-[#111A18] border border-[#96C4BB]/20 text-[#F8FAFA]"
                              : "bg-[#D4AF37] text-[#070B0A] font-semibold"
                          )}
                        >
                          <MarkdownLite text={t.text} />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl">
              <CardBody>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                  <h3 className="font-display font-semibold tracking-tight text-[#F8FAFA]">
                    Feedback
                  </h3>
                  {lastEval && (
                    <span
                      className={cn(
                        "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold border",
                        isCorrect
                          ? "bg-[#507C7C]/30 text-[#96C4BB] border-[#96C4BB]/40"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      )}
                    >
                      {isCorrect ? "Correct" : `Incorrect (Try ${currentTry}/${maxTries})`}
                    </span>
                  )}
                </div>
                {lastEval ? (
                  <div className="space-y-4">
                    <Metric label="Score" value={lastEval.score * 10} />
                    <div className="text-sm text-[#F8FAFA] text-left">
                      <MarkdownLite text={lastEval.feedback} />
                    </div>

                    {!isCorrect && currentTry < maxTries && lastEval.clue && (
                      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-3.5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37]">
                            Clue
                          </p>
                          <button
                            onClick={() => speak(lastEval.clue!, true)}
                            className="text-[#D4AF37] hover:brightness-125 p-0.5"
                            title="Read clue aloud"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-sm text-[#F8FAFA] text-left">
                          <MarkdownLite text={lastEval.clue} />
                        </div>
                      </div>
                    )}

                    {!isCorrect && currentTry >= maxTries && lastEval.correct_answer && (
                      <div className="rounded-xl border border-[#96C4BB]/30 bg-[#507C7C]/20 p-3.5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#96C4BB]">
                            Model Answer
                          </p>
                          <button
                            onClick={() => speak(lastEval.correct_answer!, true)}
                            className="text-[#96C4BB] hover:text-[#F8FAFA] p-0.5"
                            title="Read model answer aloud"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="text-sm text-[#F8FAFA] text-left">
                          <MarkdownLite text={lastEval.correct_answer} />
                        </div>
                      </div>
                    )}

                    {lastEval.missed && lastEval.missed.length > 0 && (
                      <div>
                        <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#96C4BB]">
                          Suggestions for improvement
                        </p>
                        <ul className="space-y-1">
                          {lastEval.missed.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-[#B2C9C5]">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-[#B2C9C5]">
                    Record your answer to receive friendly AI tips.
                  </p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ── Complete stage ── */}
      {stage === "complete" && results && (
        <div className="space-y-6">
          {/* Score banner */}
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#96C4BB]/30 bg-[#0E1715]/95 px-6 py-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-[#D4AF37]/20 blur-xl animate-pulse" />
              <img
                src="/assets/mascot.jpg"
                alt="Hunuko Mascot"
                className="relative h-24 w-24 rounded-full object-cover shadow-2xl ring-2 ring-[#D4AF37]"
              />
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#F8FAFA]">
              Session completed!
            </h2>
            <p className="text-[#B2C9C5] text-sm">
              {results.title} · {results.subject}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-[#D4AF37]">
                {Math.round(results.average_score * 10)}%
              </span>
              <span className="text-[#B2C9C5] text-sm font-medium">average grade</span>
            </div>
            <Button onClick={reset} className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold border-none hover:brightness-110 shadow-lg shadow-[#D4AF37]/25 px-6">
              <RotateCcw className="h-4 w-4" /> Start new session
            </Button>
          </div>

          {/* Per-question breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            {results.answers.map((a, i) => (
              <Card key={a.question_id} className="bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl">
                <CardBody>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#96C4BB]">
                      Topic {i + 1}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold border",
                        a.evaluation.score >= 8
                          ? "bg-[#507C7C]/30 text-[#96C4BB] border-[#96C4BB]/40"
                          : a.evaluation.score >= 5
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30"
                          : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                      )}
                    >
                      {a.evaluation.score}/10
                    </span>
                  </div>
                  <p className="mb-2 text-sm font-medium text-[#F8FAFA]">{a.question}</p>
                  <p className="mb-2 text-sm text-[#B2C9C5] italic">
                    "{a.transcription}"
                  </p>
                  <p className="text-xs text-[#B2C9C5]/80">
                    {a.evaluation.feedback}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// ── Sub-components ───────────────────────────────────────────

function Metric({ label, value }: { label: string; value: number }) {
  const tone =
    value >= 85
      ? "bg-gradient-to-r from-[#507C7C] to-[#96C4BB]"
      : value >= 65
      ? "bg-gradient-to-r from-[#D4AF37] to-[#F59E0B]"
      : "bg-amber-500";
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="capitalize text-[#B2C9C5]">{label}</span>
        <span className="font-medium text-[#F8FAFA]">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#111A18] border border-[#96C4BB]/15">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`h-full rounded-full ${tone}`}
        />
      </div>
    </div>
  );
}

function ExamOrb({
  recording,
  analyzing,
}: {
  recording: boolean;
  analyzing: boolean;
}) {
  const active = recording || analyzing;
  return (
    <div className="relative mt-6 h-40 w-40">
      {active &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-gold-400/40 dark:border-cobalt-400/40"
            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeOut",
            }}
          />
        ))}
      <motion.div
        className="absolute inset-4 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-2xl shadow-gold-500/40 dark:from-cobalt-500 dark:to-cobalt-700 dark:shadow-cobalt-600/50"
        animate={active ? { scale: [1, 1.1, 1] } : { scale: 1 }}
        transition={{
          duration: 1.6,
          repeat: active ? Infinity : 0,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {analyzing ? (
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        ) : (
          <Mic className="h-8 w-8 text-white" />
        )}
      </div>
    </div>
  );
}

function Waveform({ active }: { active: boolean }) {
  const bars = Array.from({ length: 28 });
  return (
    <div className="relative mt-8 flex h-12 items-center gap-1" aria-hidden>
      {bars.map((_, i) => (
        <motion.span
          key={i}
          className="w-1 rounded-full bg-gold-500/70 dark:bg-cobalt-400/70"
          animate={
            active ? { height: [6, 8 + Math.random() * 30, 6] } : { height: 6 }
          }
          transition={{
            duration: 0.6 + Math.random() * 0.5,
            repeat: active ? Infinity : 0,
            ease: "easeInOut",
          }}
          style={{ height: 6 }}
        />
      ))}
    </div>
  );
}