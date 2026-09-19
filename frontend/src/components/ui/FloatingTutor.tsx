import { useState, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Globe } from "lucide-react";
import { useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { aiService } from "../../services/aiService";
import { MarkdownLite } from "../tutor/MarkdownLite";

interface FloatingTutorProps {
  persona: string | null;
  documentId?: string | null; // Active document the student is studying
}

export function FloatingTutor({ persona, documentId }: FloatingTutorProps) {
  const location = useLocation();
  const isVisualLab = location.pathname.endsWith("/lab");
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en");
  const [searchWeb, setSearchWeb] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const constraintsRef = useRef(null);

  const getTutorVibe = () => {
    switch (persona) {
      case "kid":
        return {
          avatar: "🚀",
          name: "Cogni-Guide",
          color: "bg-pink-500",
          text: "Hey! Drop a book in the center and let's play! 🎉",
        };
      case "secondary":
        return {
          avatar: "🧠",
          name: "Study Coach",
          color: "bg-emerald-500",
          text: "Syllabus looking heavy? Let's break it down together.",
        };
      case "casual":
        return {
          avatar: "⚡",
          name: "Upskill Node",
          color: "bg-cobalt-600",
          text: "Ready to upskill? Ask me anything.",
        };
      case "university":
      default:
        return {
          avatar: "🤖",
          name: "Hunuko AI",
          color: "bg-abyss-800",
          text: "Upload your research. I will cross-examine your understanding.",
        };
    }
  };

  const vibe = getTutorVibe();

  const [messages, setMessages] = useState([
    { role: "assistant", text: vibe.text },
  ]);

  if (!persona) return null;

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // If no document is active, tell the student to upload one first
    if (!documentId) {
      setMessages((prev) => [
        ...prev,
        { role: "user", text: input },
        {
          role: "assistant",
          text: "Please upload a document first so I know what you are studying. Go to the Upload page and add your notes or textbook.",
        },
      ]);
      setInput("");
      return;
    }

    const userText = input;
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "assistant", text: "..." },
    ]);

    // Extract current page content from DOM dynamically
    const mainEl = document.querySelector("main");
    const rawText = mainEl ? (mainEl.innerText || mainEl.textContent || "") : "";
    const pageContent = rawText.replace(/\s+/g, " ").trim().substring(0, 4000);

    try {
      const response = await aiService.tutorChat(documentId, userText, {
        sessionId,
        languageCode: language,
        persona: persona ?? "university",
        searchWeb,
        pageContent,
      });

      // Save session_id from backend (uses underscore not camelCase)
      if (response.session_id && !sessionId) {
        setSessionId(response.session_id);
      }

      // Backend returns reply field
      const replyText = response.reply ?? "Sorry, I could not get a response. Please try again.";

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", text: replyText };
        return updated;
      });
    } catch (error) {
      console.error("Tutor error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          text: "My connection dropped. Check your internet and try again.",
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div ref={constraintsRef} className="pointer-events-none fixed inset-4 z-40" />

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        className={cn(
          "fixed z-50 flex flex-col items-end gap-3 pointer-events-auto transition-all duration-300",
          isVisualLab ? "bottom-28 right-8" : "bottom-8 right-8"
        )}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
      >
        {/* CHAT WINDOW */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="relative flex h-[440px] w-[340px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-silver-200 dark:bg-[#0E1715]/95 dark:border-[#96C4BB]/30 dark:shadow-[0_0_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl cursor-auto"
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0E1715] to-[#131F1C] border-b border-[#96C4BB]/20 text-white">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <img src="/assets/mascot.jpg" alt="Hunuko" className="h-7 w-7 rounded-full object-cover border border-[#96C4BB]/40 shadow-sm" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#D4AF37] ring-1 ring-black" />
                  </div>
                  <div>
                    <span className="font-display font-bold text-sm text-[#F8FAFA] block leading-tight">{vibe.name}</span>
                    <span className="text-[10px] text-[#96C4BB] font-medium block">Visual AI Tutor</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#111A18] text-[#B2C9C5] text-xs font-medium rounded-lg px-2 py-1 outline-none border border-[#96C4BB]/20 cursor-pointer appearance-none"
                  >
                    <option value="en">English</option>
                    <option value="yo">Yoruba</option>
                    <option value="ha">Hausa</option>
                    <option value="ig">Igbo</option>
                    <option value="tw">Twi</option>
                    <option value="sw">Swahili</option>
                    <option value="pcm">Pidgin</option>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="genZ">Gen Z</option>
                  </select>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-white/10 p-1 hover:bg-white/20 text-[#B2C9C5] hover:text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Document context indicator */}
              {documentId && (
                <div className="px-4 py-1.5 bg-gold-50 dark:bg-[#111A18] border-b border-gold-100 dark:border-[#96C4BB]/15 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                  <p className="text-xs text-[#D4AF37] font-medium truncate">
                    Studying active document
                  </p>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-silver-50 dark:bg-[#070B0A]/70">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex w-full",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                        msg.role === "user"
                          ? "bg-[#D4AF37] text-[#070B0A] font-semibold rounded-br-none shadow-[0_2px_10px_rgba(212,175,55,0.25)]"
                          : "bg-white border border-silver-200 text-abyss-900 dark:bg-[#131F1C] dark:border-[#96C4BB]/20 dark:text-[#F8FAFA] rounded-bl-none"
                      )}
                    >
                      {msg.text === "..." ? (
                        <span className="flex gap-1 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#96C4BB] animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#96C4BB] animate-bounce [animation-delay:0.15s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#96C4BB] animate-bounce [animation-delay:0.3s]" />
                        </span>
                      ) : (
                        <MarkdownLite text={msg.text} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                className="border-t border-silver-200 bg-white p-3 dark:border-[#96C4BB]/20 dark:bg-[#0E1715]"
              >
                <div className="flex items-center justify-between mb-2 px-1">
                  <button
                    type="button"
                    onClick={() => setSearchWeb(!searchWeb)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all border shadow-sm cursor-pointer",
                      searchWeb 
                        ? "bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#D4AF37]" 
                        : "bg-silver-50 border-silver-200 text-silver-500 hover:bg-silver-100 dark:bg-[#111A18] dark:border-[#96C4BB]/20 dark:text-[#A3B8B5] dark:hover:bg-[#152220]"
                    )}
                  >
                    <Globe className={cn("h-3 w-3", searchWeb && "animate-pulse text-[#D4AF37]")} />
                    <span>Web Research {searchWeb ? "ON" : "OFF"}</span>
                  </button>
                </div>
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your AI Tutor..."
                    disabled={isLoading}
                    className="w-full rounded-xl border border-silver-300 bg-silver-50 px-3.5 py-2 text-xs outline-none focus:border-[#96C4BB] dark:border-[#96C4BB]/25 dark:bg-[#111A18] dark:text-[#F8FAFA] dark:placeholder-[#A3B8B5]/50 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#D4AF37] text-[#070B0A] hover:bg-[#e0be4d] disabled:opacity-50 transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
                  >
                    <Send className="h-3.5 w-3.5 ml-0.5" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FLOATING BUTTON */}
        <motion.div
          whileHover={{ scale: 1.06, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => setIsOpen(!isOpen)}
          className="relative flex h-14 w-14 items-center justify-center rounded-2xl shadow-[0_0_25px_rgba(80,124,124,0.35)] border-2 border-[#96C4BB]/40 bg-gradient-to-tr from-[#0E1715] to-[#131F1C] cursor-pointer overflow-hidden group"
        >
          <img
            src="/assets/mascot.jpg"
            alt="Hunuko AI Tutor"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-[#D4AF37] border-2 border-[#070B0A] shadow-[0_0_8px_#D4AF37]" />
          {!isOpen && (
            <motion.div
              className="absolute inset-0 rounded-2xl border-2 border-[#96C4BB]/50"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
}
