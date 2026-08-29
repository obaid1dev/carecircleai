import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Send,
  CheckCircle2,
  Mic,
  MicOff,
  AlertCircle,
  Crown,
  Zap,
  Plus,
} from "lucide-react";
import { getProfile } from "@/lib/data.functions";
import { finishCheckin } from "@/lib/checkins.functions";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionContext } from "@/lib/subscription/subscription-provider";
import { PLANS } from "@/lib/subscription/plans";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => ({ meta: [{ title: "Daily check-in · CareCircle" }] }),
  component: ChatPage,
});

function ChatPage() {
  const router = useRouter();
  const profile = useQuery({ queryKey: ["profile"], queryFn: () => getProfile() });
  const { subscription, isPro, openPaywall, refresh } = useSubscriptionContext();
  const [input, setInput] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [summary, setSummary] = useState<null | {
    mood_score: number;
    risk_level: string;
    summary: string;
  }>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number>();

  const chatLimit = PLANS.free.limits.ai_conversations;
  const chatUsed = subscription?.usage.ai_conversations ?? 0;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { userName: profile.data?.name },
      headers: async () => {
        const { data } = await supabase.auth.getSession();
        return { Authorization: `Bearer ${data.session?.access_token ?? ""}` };
      },
    }),
    onResponse: ({ response }) => {
      if (response.status === 402) {
        openPaywall();
        toast.error(
          "Your free limit has been reached. Upgrade to CareCircleAI Pro for unlimited access.",
        );
      } else if (!response.ok) {
        const errorText = response.statusText || "Failed to get AI response";
        toast.error(`AI error: ${errorText}`);
      }
    },
    onFinish: () => {
      void refresh();
    },
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, summary]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let interim = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }

        setInterimTranscript(interim);

        if (finalTranscript) {
          setInput((prev) => prev + (prev ? " " : "") + finalTranscript);
          setInterimTranscript("");
        }
      };

      recognition.onerror = (event) => {
        if (event.error === "no-speech") return;
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          toast.error("Microphone permission denied. Please enable it in your browser settings.");
          setIsListening(false);
          return;
        }
        console.error("Speech recognition error:", event.error);
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch {
            setIsListening(false);
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    };
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current || isListening) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setInterimTranscript("");
    } catch (err) {
      console.error("Failed to start recognition:", err);
      toast.error("Could not start voice input. Please try again.");
    }
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    if (isListening && interimTranscript) {
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = window.setTimeout(() => {
        if (isListening && interimTranscript) stopListening();
      }, 3000);
    }
    return () => {
      if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    };
  }, [isListening, interimTranscript, stopListening]);

  const isLoading = status === "submitted" || status === "streaming";
  const blocked = !isPro && chatUsed >= chatLimit;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const newConversation = () => {
    // Clear the messages array and signal server to create a fresh conversation
    // by sending a message with newConversation flag in the body
    window.location.reload();
  };

  const finish = async () => {
    if (!isPro) {
      const checkinLimit = PLANS.free.limits.daily_checkins;
      const used = subscription?.usage.checkins ?? 0;
      if (used >= checkinLimit) {
        openPaywall();
        toast.error(
          "Your free limit has been reached. Upgrade to CareCircleAI Pro for unlimited access.",
        );
        return;
      }
    }
    setFinishing(true);
    try {
      const flat = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
      }));
      const result = await finishCheckin({ data: { messages: flat } });
      setSummary(result);
      toast.success("Check-in saved");
      void refresh();
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("LIMIT_REACHED")) {
        openPaywall();
        toast.error(
          "Your free limit has been reached. Upgrade to CareCircleAI Pro for unlimited access.",
        );
      } else {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    } finally {
      setFinishing(false);
    }
  };

  if (summary) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 24, stiffness: 280 }}
        >
          <Card className="p-8 text-center glass-strong rounded-3xl border-transparent shadow-2xl shadow-black/10 dark:shadow-black/40">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 14, delay: 0.1 }}
              className="w-16 h-16 mx-auto mb-4 gradient-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/25"
            >
              <CheckCircle2 className="w-8 h-8" />
            </motion.div>
            <h1 className="text-2xl font-bold">Thank you for checking in</h1>
            <p className="text-muted-foreground mt-2">Your family will see this summary.</p>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="p-6 space-y-4 glass rounded-2xl">
            <div>
              <p className="text-sm text-muted-foreground">Today's summary</p>
              <p className="mt-1">{summary.summary}</p>
            </div>
            <div className="flex gap-3 pt-2 border-t border-border/60">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Mood</p>
                <p className="text-xl font-semibold">{summary.mood_score}/10</p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Risk level</p>
                <p className={`text-xl font-semibold capitalize ${riskColor(summary.risk_level)}`}>
                  {summary.risk_level}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
        <Button className="w-full" size="lg" onClick={() => router.navigate({ to: "/dashboard" })}>
          Back to home
        </Button>
      </div>
    );
  }

  const displayInput = input + interimTranscript;

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-13rem)] min-h-[24rem] md:h-[calc(100dvh-8rem)] md:min-h-0">
      <div className="flex items-center gap-3 pb-4">
        <div className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-emerald-900/25">
          <Heart className="w-5 h-5" fill="currentColor" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">CareCircle</p>
          <p className="text-xs text-muted-foreground">Your daily check-in</p>
        </div>
        {messages.length > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={newConversation}
            title="Start new conversation"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        )}
      </div>

      <div
        className="flex-1 overflow-y-auto space-y-3 pb-4 scrollbar-hide"
        aria-live="polite"
        aria-label="Conversation messages"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = String(m.role) === "user";
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", damping: 26, stiffness: 320 }}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-base ${
                    isUser
                      ? "gradient-primary text-primary-foreground rounded-tr-sm shadow-lg shadow-emerald-900/20"
                      : "glass-strong rounded-tl-sm"
                  }`}
                >
                  {isUser ? (
                    <p>{text || " "}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{text || "..."}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="glass-strong px-4 py-3 rounded-2xl rounded-tl-sm">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:120ms]" />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:240ms]" />
              </span>
            </div>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t pt-4 space-y-3">
        {!isPro && (
          <div className="flex items-center justify-between gap-2 flex-wrap rounded-xl glass px-4 py-2.5 text-sm">
            <span className="text-muted-foreground">
              {blocked
                ? "Your free limit has been reached."
                : `You've used ${chatUsed} of ${chatLimit} AI chats today.`}
            </span>
            {blocked ? (
              <Button size="sm" onClick={() => openPaywall()}>
                <Crown className="w-3.5 h-3.5" /> Upgrade
              </Button>
            ) : (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Zap className="w-3.5 h-3.5" /> {chatLimit - chatUsed} left today
              </span>
            )}
          </div>
        )}
        <form onSubmit={submit} className="flex gap-2">
          <Input
            value={displayInput}
            onChange={(e) => setInput(e.target.value.replace(interimTranscript, ""))}
            placeholder={blocked ? "Free limit reached" : "Type your reply..."}
            className="text-base h-12 flex-1"
            disabled={isLoading || blocked}
          />
          <Button
            type="button"
            size="lg"
            variant={isListening ? "destructive" : "outline"}
            onClick={toggleListening}
            disabled={!isSupported || isLoading || blocked}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
            className={isListening ? "animate-pulse" : ""}
            title={
              !isSupported
                ? "Voice input not supported in this browser"
                : isListening
                  ? "Stop listening"
                  : "Start voice input"
            }
          >
            {isListening ? (
              <Mic className="w-4 h-4 text-white" />
            ) : !isSupported ? (
              <span className="flex items-center gap-1">
                <MicOff className="w-4 h-4" />
                <span className="hidden sm:inline">No mic</span>
              </span>
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>
          <Button type="submit" size="lg" disabled={isLoading || !displayInput.trim() || blocked}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
        {isListening && (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-destructive animate-pulse"
          >
            <span className="w-2 h-2 bg-destructive rounded-full" aria-hidden="true" />
            <span>Listening... Speak now</span>
            {interimTranscript && (
              <span className="text-muted-foreground">"{interimTranscript}"</span>
            )}
          </p>
        )}
        {!isSupported && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Voice input not supported in this browser.
          </p>
        )}
        {messages.length >= 3 && (
          <Button
            onClick={finish}
            variant="outline"
            className="w-full"
            disabled={finishing || isLoading}
          >
            {finishing ? "Saving summary..." : "Finish check-in"}
          </Button>
        )}
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
function riskColor(r: string) {
  if (r === "high") return "text-destructive";
  if (r === "medium") return "text-warning";
  return "text-success";
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
  }
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
    isFinal: boolean;
  }
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }
}

export {};
