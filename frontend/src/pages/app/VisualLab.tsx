import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Atom,
  Sigma,
  ArrowRight,
  Sparkles,
  Play,
  Loader2,
  Check,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileText,
  ChevronDown,
  Send,
  Volume2,
  VolumeX
} from "lucide-react";
import { PageContainer } from "../../components/shell/PageContainer";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { AmbientBackground } from "../../components/visuals/AmbientBackground";
import { aiService, type Scene, type SceneScript } from "../../services/aiService";
import { contentService } from "../../services/contentService";
import { useChatStore } from "../../stores/useChatStore";
import { cn } from "../../lib/utils";
import { MarkdownLite } from "../../components/tutor/MarkdownLite";
import { Mascot } from "../../components/visuals/Mascot";
import { useMascotAudio } from "../../hooks/useMascotAudio";

export default function VisualLab() {
  const navigate = useNavigate();
  const documents = useChatStore((s) => s.documents);
  const selectedDocId = useChatStore((s) => s.selectedDocumentId);
  const selectDocument = useChatStore((s) => s.selectDocument);
  const docsLoading = useChatStore((s) => s.documentsLoading);

  const [docDropOpen, setDocDropOpen] = useState(false);
  const docDropRef = useRef<HTMLDivElement>(null);

  // Concept & Animation State
  const [concepts, setConcepts] = useState<any[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  // Topics / Chapters Outline State
  const [topics, setTopics] = useState<any[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [topicLoading, setTopicLoading] = useState<string | null>(null);

  const [animationScript, setAnimationScript] = useState<SceneScript | null>(null);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);

  // Feedback / Simplification state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [regenAttempt, setRegenAttempt] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Mascot & Audio states
  const mascotAudio = useMascotAudio();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi! Ask me anything about this diagram. I can highlight elements or point to them!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [mascotLoading, setMascotLoading] = useState(false);
  const [mascotSessionId, setMascotSessionId] = useState<string | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState("");

  // Speak active scene content automatically on change
  useEffect(() => {
    if (isPlaying && animationScript?.scenes[sceneIndex]) {
      const scene = animationScript.scenes[sceneIndex];
      let speechText = "";
      
      if (scene.type === "concept_intro") {
        speechText = `${scene.heading || ""}. ${scene.subheading || ""}`;
      } else if (scene.type === "definition") {
        speechText = `Let's define ${scene.term || ""}. ${scene.meaning || ""}`;
      } else if (scene.type === "bullet_reveal") {
        speechText = `${scene.heading || ""}. ${scene.points?.join(". ") || ""}`;
      } else if (scene.type === "flow_diagram") {
        speechText = `${scene.heading || ""}. The process flows as follows: ${scene.steps?.join(". Then, ") || ""}`;
      } else if (scene.type === "comparison") {
        speechText = `${scene.heading || ""}. Comparing: ${scene.left?.label || ""}: ${scene.left?.points.join(". ") || ""}. Versus ${scene.right?.label || ""}: ${scene.right?.points.join(". ") || ""}`;
      } else if (scene.type === "equation") {
        speechText = `${scene.heading || ""}. The formula elements are: ${scene.elements?.join(" ") || ""}`;
      } else if (scene.type === "timeline") {
        speechText = `${scene.heading || ""}. The sequence is: ${scene.events?.map(e => `${e.label}, ${e.description}`).join(". ") || ""}`;
      } else if (scene.type === "summary") {
        speechText = `${scene.heading || ""}. In summary: ${scene.points?.join(". ") || ""}`;
      }

      setActiveSpeechText(speechText);
      
      const sceneActions = (animationScript as any).actions?.filter((act: any) => {
        return act.action_type && act.timestamp_sec !== undefined;
      }) || [];

      mascotAudio.speak(speechText, sceneActions);
    } else {
      mascotAudio.cancel();
    }
    // Clean up timers on scene change
    return () => mascotAudio.cancel();
  }, [sceneIndex, isPlaying, animationScript]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (docDropRef.current && !docDropRef.current.contains(e.target as Node))
        setDocDropOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch topics and existing concepts when selectedDocId changes
  useEffect(() => {
    if (selectedDocId) {
      setTopicsLoading(true);
      setError(null);
      setSelectedConcept(null);
      setSelectedTopic(null);
      setAnimationScript(null);
      setAnimationId(null);
      setIsPlaying(false);
      setConcepts([]);

      contentService.getDocument(selectedDocId)
        .then((doc) => {
          setTopics(doc.topics || []);
          setConcepts(doc.key_concepts || []);
        })
        .catch(() => {
          setError("Failed to fetch topics for this document.");
        })
        .finally(() => {
          setTopicsLoading(false);
        });
    } else {
      setTopics([]);
      setConcepts([]);
    }
  }, [selectedDocId]);

  // Handle selecting/opening a topic and fetching its concepts lazily
  async function handleSelectTopic(topicName: string) {
    if (selectedTopic === topicName) {
      setSelectedTopic(null);
      return;
    }
    setSelectedTopic(topicName);

    // Check if concepts are already fetched for this topic
    const hasConcepts = concepts.some(
      (c) => c.extracted_for_topic?.toLowerCase() === topicName.toLowerCase()
    );
    if (hasConcepts) return;

    setTopicLoading(topicName);
    setError(null);
    try {
      const res = await contentService.lazyFetchConcepts(selectedDocId!, topicName);
      setConcepts((prev) => {
        const withoutNew = prev.filter(
          (c) => c.extracted_for_topic?.toLowerCase() !== topicName.toLowerCase()
        );
        return [...withoutNew, ...res.concepts];
      });
    } catch (err: any) {
      setError(err.message || `Failed to extract concepts for ${topicName}`);
    } finally {
      setTopicLoading(null);
    }
  }

  // Handle playing introductory overview animation
  async function playIntroOverview() {
    if (!selectedDocId) return;
    setGenerating(true);
    setError(null);
    setAnimationScript(null);
    setIsPlaying(false);

    try {
      const res = await aiService.generateIntroAnimation(selectedDocId);
      setAnimationScript(res.scene_script);
      setAnimationId(res.animation_id);
      setSceneIndex(0);
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate introductory animation.");
    } finally {
      setGenerating(false);
    }
  }

  // Handle playing specific concept animation
  async function playConceptAnimation(conceptName: string) {
    if (!selectedDocId) return;
    setSelectedConcept(conceptName);
    setGenerating(true);
    setError(null);
    setAnimationScript(null);
    setIsPlaying(false);
    setRegenAttempt(1);

    try {
      const res = await aiService.generateConceptAnimation(selectedDocId, conceptName);
      setAnimationScript(res.scene_script);
      setAnimationId(res.animation_id);
      setSceneIndex(0);
      setIsPlaying(true);
    } catch (err: any) {
      setError(err.message || "Failed to generate concept animation.");
    } finally {
      setGenerating(false);
    }
  }

  // Handle animation satisfaction
  async function handleUnderstand(satisfied: boolean) {
    if (!animationId) return;

    if (satisfied) {
      try {
        await aiService.evaluateAnimation(animationId, true);
        alert("Awesome! Glad this explanation helped. You can now test your knowledge in the Quiz or Oral Exam!");
        setIsPlaying(false);
        setAnimationScript(null);
        setSelectedConcept(null);
      } catch (err) {
        console.error(err);
      }
    } else {
      setShowFeedbackModal(true);
    }
  }

  // Handle simplify (Regeneration request)
  async function submitSimplification() {
    if (!animationId) return;
    setSubmittingFeedback(true);
    setError(null);

    try {
      // Send optional feedback and trigger evaluation
      const evalRes = await aiService.evaluateAnimation(animationId, false, feedbackText);

      if (evalRes.action === "tutor") {
        alert("Maximum explanation attempts reached. We'll redirect you to our interactive AI Tutor for personalized guidance.");
        setShowFeedbackModal(false);
        setIsPlaying(false);
        setAnimationScript(null);
      } else {
        // Trigger regeneration
        const regenRes = await aiService.regenerateAnimation(animationId);
        setAnimationScript(regenRes.scene_script);
        setAnimationId(regenRes.animation_id);
        setRegenAttempt(regenRes.attempt || 2);
        setSceneIndex(0);
        setShowFeedbackModal(false);
        setFeedbackText("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to simplify this animation.");
    } finally {
      setSubmittingFeedback(false);
    }
  }

  async function handleSendMascotMessage() {
    if (!chatInput.trim() || !selectedDocId) return;

    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setMascotLoading(true);

    // Stop active speaker immediately on user interruption
    mascotAudio.cancel();

    try {
      const activeScene = animationScript?.scenes[sceneIndex];
      const visualState = {
        sceneId: activeScene ? String(activeScene.id) : "unknown",
        activeEntityId: mascotAudio.activeHighlightId,
        sceneGraph: activeScene || null,
        precedingNarration: activeSpeechText,
        sessionId: mascotSessionId,
      };

      const res = await aiService.mascotChat(selectedDocId, userMsg, visualState);
      
      setMascotSessionId(res.sessionId);
      setChatMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);

      const sceneAction = res.action_trigger ? [{
        action_type: res.action_trigger,
        target_entity_id: res.target_entity_id,
        timestamp_sec: 0.1
      }] : [];
      
      mascotAudio.speak(res.reply, sceneAction);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Oops, I had a connection issue. Let's try again!" },
      ]);
    } finally {
      setMascotLoading(false);
    }
  }

  const selectedDoc = documents.find((d) => d.id === selectedDocId);

  return (
    <PageContainer wide>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-[#F8FAFA]">Visual Learning Lab</h1>
          <p className="mt-1 text-sm text-[#B2C9C5]">
            Interactive STEM visualizations dynamically rendered on canvas.
          </p>
        </div>

        {/* Document Selection Dropdown */}
        <div ref={docDropRef} className="relative">
          <button
            onClick={() => setDocDropOpen((o) => !o)}
            disabled={docsLoading}
            className={cn(
              "flex h-11 min-w-[200px] items-center gap-2.5 rounded-xl border px-3.5 text-sm transition-all backdrop-blur-xl shadow-md",
              "border-[#96C4BB]/25 bg-[#0E1715]/85 text-[#F8FAFA] hover:border-[#D4AF37] hover:bg-[#111A18]/90"
            )}
          >
            {docsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#96C4BB]" />
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-[#D4AF37]" />
            )}
            <span className="flex-1 truncate text-left">
              {docsLoading ? "Loading..." : selectedDoc?.title ?? "Choose a document"}
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-[#96C4BB]" />
          </button>

          <AnimatePresence>
            {docDropOpen && documents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                className="absolute right-0 top-[calc(100%+6px)] z-50 max-h-52 w-64 overflow-y-auto rounded-xl border border-[#96C4BB]/25 bg-[#0E1715]/95 p-1.5 shadow-2xl backdrop-blur-2xl scrollbar-thin"
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
                      <p className="truncate text-[11px] text-[#96C4BB]">{doc.subject}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 backdrop-blur-md">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {!selectedDocId ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl">
          <CardBody className="max-w-md flex flex-col items-center">
            <div className="h-16 w-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-6 ring-1 ring-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Atom className="h-8 w-8 text-[#D4AF37] animate-pulse" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2 text-[#F8FAFA]">No study materials loaded</h3>
            <p className="text-[#B2C9C5] mb-6 text-sm">
              Please choose a document or upload notes to start creating visual diagrams and learning key concepts.
            </p>
            {documents.length > 0 ? (
              <Button onClick={() => setDocDropOpen(true)} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold border-none hover:brightness-110 shadow-lg shadow-[#D4AF37]/20">Choose from Decks</Button>
            ) : (
              <Button onClick={() => navigate("/app/upload")} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold border-none hover:brightness-110 shadow-lg shadow-[#D4AF37]/20">Upload a File</Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-4">

          {/* Concepts Directory Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl">
              <CardBody className="p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#96C4BB]/15 pb-3">
                  <h3 className="font-semibold text-xs tracking-wider uppercase text-[#96C4BB]">Quick Actions</h3>
                </div>

                <Button
                  onClick={playIntroOverview}
                  variant="outline"
                  className="w-full flex items-center justify-start border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/5 hover:bg-[#D4AF37]/15 hover:border-[#D4AF37]"
                  disabled={generating}
                >
                  {generating && !selectedConcept ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-[#D4AF37]" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2 text-[#D4AF37]" />
                  )}
                  Show Topic Summary
                </Button>
              </CardBody>
            </Card>

            <Card className="max-h-[500px] overflow-y-auto bg-[#0E1715]/85 border-[#96C4BB]/20 backdrop-blur-xl shadow-xl scrollbar-thin">
              <CardBody className="p-4">
                <h3 className="font-semibold text-xs tracking-wider uppercase text-[#96C4BB] border-b border-[#96C4BB]/15 pb-3 mb-3">
                  Chapters & Topics ({topics.length})
                </h3>

                {topicsLoading ? (
                  <div className="py-10 text-center flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-[#D4AF37]" />
                    <span className="text-xs text-[#B2C9C5]">Loading outline...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {topics.map((t, idx) => {
                      const isExpanded = selectedTopic === t.topic_name;
                      const isLoading = topicLoading === t.topic_name;
                      const topicConcepts = concepts.filter(
                        (c) => c.extracted_for_topic?.toLowerCase() === t.topic_name.toLowerCase()
                      );

                      return (
                        <div key={idx} className="border border-[#96C4BB]/15 rounded-xl overflow-hidden bg-[#070B0A]/40 backdrop-blur-sm">
                          <button
                            onClick={() => handleSelectTopic(t.topic_name)}
                            className={cn(
                              "w-full text-left px-3 py-3 text-sm font-medium transition-all flex items-center justify-between gap-2.5",
                              isExpanded ? "text-[#D4AF37] bg-[#D4AF37]/10" : "text-[#F8FAFA] hover:bg-[#111A18]/60"
                            )}
                          >
                            <div className="min-w-0">
                              <p className="font-semibold truncate text-xs">{t.topic_name}</p>
                              <p className="text-[10px] text-[#B2C9C5] truncate mt-0.5">{t.brief_description}</p>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform text-[#96C4BB]", isExpanded && "rotate-180")} />
                          </button>

                          {isExpanded && (
                            <div className="p-2 border-t border-[#96C4BB]/10 space-y-1 bg-[#0E1715]/60">
                              {isLoading ? (
                                <div className="py-4 text-center flex flex-col items-center gap-1.5">
                                  <Loader2 className="h-4 w-4 animate-spin text-[#D4AF37]" />
                                  <span className="text-[10px] text-[#B2C9C5]">Finding core topics...</span>
                                </div>
                              ) : topicConcepts.length > 0 ? (
                                topicConcepts.map((c, i) => (
                                  <button
                                    key={i}
                                    onClick={() => playConceptAnimation(c.concept)}
                                    disabled={generating}
                                    className={cn(
                                      "w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2 border",
                                      selectedConcept === c.concept
                                        ? "bg-[#507C7C]/30 border-[#96C4BB]/40 text-[#F8FAFA] font-medium shadow-sm"
                                        : "border-transparent hover:bg-[#111A18]/80 text-[#B2C9C5] hover:text-[#F8FAFA]"
                                    )}
                                  >
                                    <Play className="h-3 w-3 mt-0.5 shrink-0 text-[#96C4BB]" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium truncate">{c.concept}</p>
                                      <span className={cn(
                                        "inline-block text-[9px] uppercase font-bold tracking-wider mt-0.5 px-1.5 py-0.2 rounded-full",
                                        c.complexity === "advanced"
                                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                          : c.complexity === "intermediate"
                                            ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                                            : "bg-[#507C7C]/30 text-[#96C4BB] border border-[#96C4BB]/30"
                                      )}>
                                        {c.complexity}
                                      </span>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <p className="text-center text-[10px] text-[#B2C9C5] py-2">No key topics found for this chapter.</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Interactive Rendering Canvas */}
          <div className="lg:col-span-3 space-y-4">
            {generating ? (
              <div className="relative min-h-[550px] rounded-3xl border border-[#96C4BB]/25 bg-[#070B0A]/95 flex flex-col items-center justify-center p-8 shadow-2xl backdrop-blur-xl">
                <AmbientBackground variant="hero" particles={true} />
                <Loader2 className="h-10 w-10 animate-spin text-[#D4AF37] mb-4" />
                <p className="text-[#F8FAFA] text-lg font-medium">Creating your visual explanation...</p>
                <p className="text-[#B2C9C5] text-xs mt-1">Designing the diagram layout and notes.</p>
              </div>
            ) : isPlaying && animationScript ? (
              <div className="space-y-4">

                {/* Canvas Container */}
                <div className="relative overflow-hidden rounded-3xl border border-[#96C4BB]/25 bg-[#070B0A]/95 min-h-[500px] flex flex-col justify-between p-8 shadow-2xl backdrop-blur-xl">
                  <AmbientBackground variant="hero" particles={false} />
                  <div className="absolute inset-0 cf-grid-bg opacity-25" />
                  <div className="absolute left-1/2 top-1/2 h-[450px] w-[450px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#507C7C]/10 blur-[90px]" />

                  {/* Top Bar info inside Canvas */}
                  <div className="relative z-10 flex justify-between items-center text-white">
                    <Badge tone={"flow" as any} className="border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37] shadow-sm">
                      <Atom className="h-4 w-4 mr-2" /> {selectedConcept || "Topic Summary"}
                    </Badge>
                    {regenAttempt > 1 && (
                      <Badge tone={"danger" as any} className="text-rose-300 bg-rose-500/20 border-rose-500/30">
                        Revision {regenAttempt} (Easier Explanation)
                      </Badge>
                    )}
                  </div>

                  {/* Dynamic Scene Renderer (Framer Motion Canvas) */}
                  <div className="relative z-10 flex-1 flex items-center justify-center py-6">
                    <AnimatePresence mode="wait">
                      <SceneRenderer key={sceneIndex} scene={animationScript.scenes[sceneIndex]} activeHighlightId={mascotAudio.activeHighlightId} />
                    </AnimatePresence>
                  </div>

                  {/* Navigation and Playback Controls */}
                  <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-[#96C4BB]/15 pt-4 bg-[#070B0A]/80 backdrop-blur-xl px-5 py-3 rounded-2xl">
                    <div className="flex gap-2">
                      {animationScript.scenes.map((s, i) => (
                        <button
                          key={s.id}
                          onClick={() => setSceneIndex(i)}
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            i === sceneIndex ? "w-8 bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" : "w-2 bg-[#96C4BB]/30 hover:bg-[#96C4BB]/60"
                          )}
                          aria-label={`Go to scene ${i + 1}`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-white">
                      {/* Audio Speak / Pause Interruption Control */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                          isPlaying 
                            ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/25" 
                            : "bg-[#111A18] border-[#96C4BB]/20 text-[#B2C9C5] hover:text-[#F8FAFA] hover:bg-[#1A2825]"
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Volume2 className="h-3.5 w-3.5 animate-pulse text-[#D4AF37]" />
                            <span>Mute Narrative</span>
                          </>
                        ) : (
                          <>
                            <VolumeX className="h-3.5 w-3.5 text-[#B2C9C5]" />
                            <span>Speak Narrative</span>
                          </>
                        )}
                      </button>

                      <span className="text-xs text-[#B2C9C5] font-medium">
                        Scene {sceneIndex + 1} of {animationScript.total_scenes}
                      </span>

                      <div className="flex gap-1.5">
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setSceneIndex(i => Math.max(0, i - 1))}
                          disabled={sceneIndex === 0}
                          className="bg-[#111A18] border border-[#96C4BB]/25 hover:border-[#D4AF37] text-[#F8FAFA] h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          onClick={() => setSceneIndex(i => Math.min(animationScript.scenes.length - 1, i + 1))}
                          disabled={sceneIndex === animationScript.scenes.length - 1}
                          className="bg-[#111A18] border border-[#96C4BB]/25 hover:border-[#D4AF37] text-[#F8FAFA] h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Socratic RAG Active Recall Panel */}
                {sceneIndex === animationScript.scenes.length - 1 && selectedConcept && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl border border-[#D4AF37]/35 bg-[#0E1715]/90 backdrop-blur-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl"
                  >
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2 text-[#F8FAFA]">
                        <HelpCircle className="h-5 w-5 text-[#D4AF37]" /> How did you do?
                      </h4>
                      <p className="text-sm text-[#B2C9C5] mt-1">
                        Do you feel you understand this topic and the ideas shown in the diagram?
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <Button onClick={() => handleUnderstand(true)} className="bg-gradient-to-r from-[#507C7C] to-[#96C4BB] hover:brightness-110 text-[#070B0A] font-bold border-none px-6">
                        Yes, continue
                      </Button>
                      <Button variant="secondary" onClick={() => handleUnderstand(false)} className="border border-[#96C4BB]/30 bg-[#111A18] hover:border-[#D4AF37] text-[#F8FAFA] px-6">
                        No, simplify it
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="relative min-h-[550px] rounded-3xl border border-[#96C4BB]/20 bg-[#070B0A]/95 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
                <AmbientBackground variant="hero" particles={true} />
                <div className="absolute inset-0 cf-grid-bg opacity-20" />
                <div className="relative z-10 max-w-md flex flex-col items-center">
                  <div className="h-16 w-16 rounded-full bg-[#D4AF37]/15 flex items-center justify-center mb-6 ring-1 ring-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.25)]">
                    <Play className="h-6 w-6 text-[#D4AF37] ml-1 animate-bounce" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#F8FAFA] mb-2">Visual Studio</h3>
                  <p className="text-[#B2C9C5] text-sm mb-6">
                    Choose a topic from the sidebar on the left, or show the summary, to watch visual diagrams of your learning material.
                  </p>
                  {concepts.length > 0 && (
                    <Button onClick={playIntroOverview} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] hover:brightness-110 text-[#070B0A] font-bold border-none shadow-lg shadow-[#D4AF37]/25 px-6">
                      Show Summary
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Simplification & Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070B0A]/75 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-2xl border border-[#96C4BB]/30 bg-[#0E1715]/95 p-6 shadow-2xl backdrop-blur-2xl"
            >
              <h3 className="font-display text-lg font-bold mb-2 text-[#F8FAFA]">What would you like to clarify?</h3>
              <p className="text-sm text-[#B2C9C5] mb-4">
                Tell us what was confusing, and our AI will recreate the diagram with a simpler explanation.
              </p>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g. The chloroplast diagram was too complex, show it step by step..."
                className="w-full h-32 rounded-xl border border-[#96C4BB]/25 bg-[#111A18] p-3 text-sm focus:border-[#D4AF37] focus:outline-none text-[#F8FAFA] placeholder:text-[#B2C9C5]/50 mb-4"
              />

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowFeedbackModal(false)} disabled={submittingFeedback} className="text-[#B2C9C5] hover:text-[#F8FAFA]">
                  Cancel
                </Button>
                <Button onClick={submitSimplification} loading={submittingFeedback} className="bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#070B0A] font-bold hover:brightness-110 border-none">
                  Try Again
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Mascot & Q&A Chat Panel */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Chat Panel */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-84 h-96 rounded-2xl border border-[#96C4BB]/30 bg-[#0E1715]/95 backdrop-blur-2xl shadow-2xl p-4 flex flex-col justify-between pointer-events-auto"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-[#96C4BB]/15 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#96C4BB] animate-ping" />
                  <h4 className="font-semibold text-xs text-[#F8FAFA] uppercase tracking-wider">Ask Hunuko (Mascot)</h4>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="text-xs text-[#B2C9C5] hover:text-[#F8FAFA] transition-colors"
                >
                  Hide
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 mb-2 scrollbar-thin">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                      msg.role === "user"
                        ? "ml-auto bg-[#D4AF37] text-[#070B0A] font-medium rounded-br-none shadow-sm"
                        : "mr-auto bg-[#111A18] text-[#F8FAFA] border border-[#96C4BB]/20 rounded-bl-none"
                    )}
                  >
                    <MarkdownLite text={msg.content} />
                  </div>
                ))}
                {mascotLoading && (
                  <div className="mr-auto bg-[#111A18] text-[#F8FAFA] border border-[#96C4BB]/20 rounded-2xl rounded-bl-none px-3 py-2 text-xs flex items-center gap-1.5 w-18">
                    <span className="w-1.5 h-1.5 bg-[#96C4BB] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#96C4BB] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#96C4BB] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMascotMessage()}
                  placeholder="Ask Hunuko about this diagram..."
                  disabled={mascotLoading}
                  className="flex-1 min-w-0 bg-[#111A18] border border-[#96C4BB]/25 text-[#F8FAFA] placeholder:text-[#B2C9C5]/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <Button
                  size="icon"
                  onClick={handleSendMascotMessage}
                  disabled={mascotLoading || !chatInput.trim()}
                  className="h-8 w-8 bg-[#D4AF37] hover:bg-[#EAB308] text-[#070B0A] border-none shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascot Toggle Button (Floating Face) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <motion.button
            onClick={() => setChatOpen(!chatOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full shadow-2xl transition-all duration-300 relative border overflow-hidden",
              chatOpen 
                ? "bg-[#0E1715] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.4)]" 
                : "bg-gradient-to-tr from-[#070B0A] to-[#111A18] border-[#96C4BB]/30 hover:border-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            )}
          >
            <Mascot
              isTalking={mascotAudio.isTalking}
              pointLeft={mascotAudio.pointLeft}
              pointRight={mascotAudio.pointRight}
              celebrate={mascotAudio.celebrate}
              idle={!mascotAudio.isTalking && !mascotAudio.pointLeft && !mascotAudio.pointRight}
              className="scale-90"
            />
          </motion.button>
        </div>

      </div>
    </PageContainer>
  );
}

// ── Scene Renderer (Canvas Painter) ───────────────────────────────────

function SceneRenderer({ scene, activeHighlightId }: { scene: Scene; activeHighlightId: string | null }) {

  // Custom renders for different Scene types
  switch (scene.type) {

    case "concept_intro":
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-white px-6 max-w-xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 rounded-full bg-gold-500/10 border border-gold-500/20 mb-6"
          >
            <Atom className="h-10 w-10 text-gold-500" />
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gold-200 to-gold-500">
            {scene.heading || "Concept Exploration"}
          </h2>
          <div className="text-silver-300 text-base md:text-lg leading-relaxed font-medium">
            <MarkdownLite text={scene.subheading || "Let's map out the mechanisms and variables in this topic."} />
          </div>
        </motion.div>
      );

    case "definition": {
      const isHighlighted = activeHighlightId && (
        activeHighlightId.toLowerCase() === "definition" || 
        activeHighlightId.toLowerCase() === scene.term?.toLowerCase()
      );
      return (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn(
            "w-full max-w-lg p-8 rounded-2xl border backdrop-blur-md text-white shadow-2xl relative transition-all duration-300",
            isHighlighted 
              ? "border-gold-400 bg-gold-500/10 shadow-[0_0_25px_#eab308] scale-105" 
              : "border-white/10 bg-white/5"
          )}
        >
          <div className="absolute -top-3 left-6 bg-gold-500 text-abyss-950 font-bold text-xs uppercase px-3.5 py-1 rounded-full">
            Definition
          </div>
          <h3 className="font-display text-2xl font-bold mb-4 text-gold-400 tracking-tight mt-1">
            {scene.term}
          </h3>
          <div className="text-silver-300 text-base md:text-lg leading-relaxed text-left">
            <MarkdownLite text={scene.meaning || ""} />
          </div>
        </motion.div>
      );
    }

    case "bullet_reveal":
      return (
        <div className="w-full max-w-lg text-white space-y-4 px-4">
          {scene.heading && (
            <h3 className="font-display text-xl font-bold text-gold-400 border-b border-white/10 pb-2 mb-4">
              {scene.heading}
            </h3>
          )}
          <div className="space-y-3">
            {scene.points?.map((pt, idx) => {
              const isHighlighted = activeHighlightId && (
                activeHighlightId === String(idx + 1) ||
                pt.toLowerCase().includes(activeHighlightId.toLowerCase())
              );
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.15, type: "spring", stiffness: 100 }}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border transition-all duration-300",
                    isHighlighted
                      ? "bg-gold-500/15 border-gold-500 shadow-[0_0_15px_rgba(234,179,8,0.35)] scale-[1.03]"
                      : "bg-white/5 border-white/5"
                  )}
                >
                  <div className="h-5 w-5 shrink-0 rounded-full bg-gold-500/20 flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-gold-400" />
                  </div>
                  <div className="text-sm md:text-base text-silver-300 font-medium text-left">
                    <MarkdownLite text={pt} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      );

    case "flow_diagram":
      return (
        <div className="w-full max-w-2xl text-white px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 text-center mb-6">
              {scene.heading}
            </h3>
          )}
          <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
            {scene.steps?.map((step, idx) => {
              const isHighlighted = activeHighlightId && (
                activeHighlightId === String(idx + 1) ||
                step.toLowerCase().includes(activeHighlightId.toLowerCase())
              );
              return (
                <div key={idx} className="flex flex-col md:flex-row items-center gap-4">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.2 }}
                    className={cn(
                      "bg-gradient-to-br p-4 rounded-xl text-center shadow-lg min-w-[120px] max-w-[180px] border transition-all duration-300",
                      isHighlighted
                        ? "from-gold-500/20 to-gold-600/10 border-gold-400 scale-108 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                        : "from-gold-500/10 to-gold-600/5 border-gold-500/25"
                    )}
                  >
                    <span className="text-xs font-mono font-bold text-gold-500 block mb-1">Step {idx + 1}</span>
                    <span className="text-sm font-semibold text-white block">
                      <MarkdownLite text={step} />
                    </span>
                  </motion.div>

                  {idx < (scene.steps?.length ?? 0) - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.2 + 0.1 }}
                      className="flex justify-center"
                    >
                      <ArrowRight className="h-5 w-5 text-gold-500/50 rotate-90 md:rotate-0" />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );

    case "comparison":
      return (
        <div className="w-full max-w-2xl text-white px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 text-center mb-6">
              {scene.heading}
            </h3>
          )}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Left side */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h4 className="font-bold text-gold-400 border-b border-white/15 pb-2 mb-3">
                {scene.left?.label}
              </h4>
              <ul className="space-y-2">
                {scene.left?.points.map((p, i) => (
                  <li key={i} className="text-sm text-silver-300 flex items-start gap-2 text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400 mt-2 shrink-0" />
                    <div className="flex-1">
                      <MarkdownLite text={p} />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Right side */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <h4 className="font-bold text-emerald-400 border-b border-white/15 pb-2 mb-3">
                {scene.right?.label}
              </h4>
              <ul className="space-y-2">
                {scene.right?.points.map((p, i) => (
                  <li key={i} className="text-sm text-silver-300 flex items-start gap-2 text-left">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                    <div className="flex-1">
                      <MarkdownLite text={p} />
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>

          </div>
        </div>
      );

    case "equation":
      return (
        <div className="w-full max-w-lg text-white text-center px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 mb-8">
              {scene.heading}
            </h3>
          )}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl">
            <Sigma className="h-8 w-8 text-gold-500 mr-2" />
            {scene.elements?.map((el, i) => (
              <motion.div
                key={i}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", delay: i * 0.1 }}
                className={cn(
                  "px-3 py-2 rounded-lg font-mono text-xl font-extrabold shadow-lg flex items-center justify-center",
                  ["+", "-", "*", "/", "=", "→"].includes(el)
                    ? "text-gold-500 font-bold bg-transparent"
                    : "bg-gold-500 text-abyss-950"
                )}
              >
                <MarkdownLite text={el.startsWith("$") ? el : `$${el}$`} />
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "timeline":
      return (
        <div className="w-full max-w-xl text-white px-4">
          {scene.heading && (
            <h3 className="font-display text-lg font-bold text-gold-400 text-center mb-6">
              {scene.heading}
            </h3>
          )}
          <div className="relative border-l border-gold-500/30 ml-4 space-y-6 py-2">
            {scene.events?.map((ev, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="relative pl-6"
              >
                <div className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full bg-gold-500 shadow-md ring-4 ring-gold-500/10" />
                <h4 className="font-bold text-sm text-gold-400 font-display">{ev.label}</h4>
                <div className="text-xs text-silver-300 mt-1 leading-relaxed text-left">
                  <MarkdownLite text={ev.description} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      );

    case "summary":
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative"
        >
          <div className="absolute -top-3 left-6 bg-emerald-500 text-abyss-950 font-bold text-xs uppercase px-3 py-0.5 rounded-full flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" /> Summary
          </div>
          <h3 className="font-display text-xl font-bold mb-4 text-emerald-400 tracking-tight mt-1">
            {scene.heading || "Key Takeaways"}
          </h3>
          <ul className="space-y-3">
            {scene.points?.map((pt, idx) => (
              <li key={idx} className="text-sm text-silver-300 flex items-start gap-2.5 text-left">
                <div className="h-4 w-4 shrink-0 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 text-emerald-400">
                  ✓
                </div>
                <div className="flex-1">
                  <MarkdownLite text={pt} />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      );

    default:
      return (
        <div className="text-white text-center">
          <p>Analyzing scene structure...</p>
        </div>
      );
  }
}
