import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Film,
  MessageSquare,
  Plus,
  Menu,
  X,
  Download,
  Sparkles,
} from "lucide-react";
import { fetchText, getImageUrl, getVideoBlobUrl, downloadBlob } from "../lib/api";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("text"); // "text" | "image" | "video"
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Detect slash commands on input change
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);
    const lower = val.trim().toLowerCase();
    if (lower.startsWith("/image")) {
      setMode("image");
    } else if (lower.startsWith("/video")) {
      setMode("video");
    } else {
      // keep existing mode – user can also toggle manually
    }
  };

  // Strip command prefix before sending
  const getCleanPrompt = () => {
    let prompt = input.trim();
    if (prompt.startsWith("/image")) {
      prompt = prompt.replace(/^\/image\s*/i, "").trim();
    } else if (prompt.startsWith("/video")) {
      prompt = prompt.replace(/^\/video\s*/i, "").trim();
    }
    return prompt || prompt; // fallback to original if nothing left
  };

  const handleSend = async () => {
    const promptRaw = input.trim();
    if (!promptRaw || isLoading) return;

    // Determine final mode (slash command overrides toggle)
    let activeMode = mode;
    let finalPrompt = promptRaw;
    if (promptRaw.toLowerCase().startsWith("/image")) {
      activeMode = "image";
      finalPrompt = promptRaw.replace(/^\/image\s*/i, "").trim();
    } else if (promptRaw.toLowerCase().startsWith("/video")) {
      activeMode = "video";
      finalPrompt = promptRaw.replace(/^\/video\s*/i, "").trim();
    }
    if (!finalPrompt) {
      // If only the command was typed, do nothing
      return;
    }

    // Add user message
    const userMsg = {
      id: Date.now(),
      role: "user",
      content: finalPrompt,
      mediaUrl: null,
      mediaType: null,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      if (activeMode === "text") {
        const text = await fetchText(finalPrompt);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: text,
            mediaUrl: null,
            mediaType: null,
          },
        ]);
      } else if (activeMode === "image") {
        const imageUrl = getImageUrl(finalPrompt);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: "",
            mediaUrl: imageUrl,
            mediaType: "image",
          },
        ]);
      } else if (activeMode === "video") {
        const videoBlobUrl = await getVideoBlobUrl(finalPrompt);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            role: "assistant",
            content: "",
            mediaUrl: videoBlobUrl,
            mediaType: "video",
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "❌ Something went wrong. Please try again.",
          mediaUrl: null,
          mediaType: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDownload = (msg) => {
    if (!msg.mediaUrl) return;
    const ext = msg.mediaType === "video" ? "mp4" : "png";
    downloadBlob(msg.mediaUrl, `study-ai-${Date.now()}.${ext}`);
  };

  // Sidebar toggle for mobile
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* ---------- Sidebar ---------- */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0 md:flex md:flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="font-semibold text-lg">Study AI</span>
          </div>
          <button onClick={toggleSidebar} className="md:hidden p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={() => setMessages([])}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/10 transition"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          {/* History can be added later */}
          <div className="text-xs text-gray-500 mt-4">No chat history yet.</div>
        </div>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MessageSquare className="w-4 h-4" />
            Powered by Pollinations.ai
          </div>
        </div>
      </div>

      {/* ---------- Main Chat Area ---------- */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-gray-950/50 backdrop-blur-sm">
          <button onClick={toggleSidebar} className="md:hidden p-1">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-medium">Study AI Dashboard</h1>
          <div className="w-8" /> {/* spacer */}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/80 border border-white/10"
                  }`}
                >
                  {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                  {msg.mediaUrl && msg.mediaType === "image" && (
                    <div className="mt-2 relative group">
                      <img
                        src={msg.mediaUrl}
                        alt="Generated"
                        className="rounded-lg max-w-full"
                        crossOrigin="anonymous"
                      />
                      <button
                        onClick={() => handleDownload(msg)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {msg.mediaUrl && msg.mediaType === "video" && (
                    <div className="mt-2 relative group">
                      <video controls className="rounded-lg max-w-full" crossOrigin="anonymous">
                        <source src={msg.mediaUrl} type="video/mp4" />
                      </video>
                      <button
                        onClick={() => handleDownload(msg)}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-800/80 border border-white/10 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ---------- Omni-Input Bar ---------- */}
        <div className="p-4">
          <div className="max-w-4xl mx-auto">
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 mb-2">
              {["text", "image", "video"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition ${
                    mode === m
                      ? "bg-indigo-600 text-white shadow-lg"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {m === "text" && <MessageSquare className="w-3.5 h-3.5" />}
                  {m === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                  {m === "video" && <Film className="w-3.5 h-3.5" />}
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Glassmorphism Input */}
            <div className="flex items-center gap-3 bg-glass backdrop-blur-md border border-glass-border rounded-2xl px-4 py-3 shadow-2xl">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === "text"
                    ? "Ask anything..."
                    : mode === "image"
                    ? "Describe the image... (or type /image prompt)"
                    : "Describe the video... (or type /video prompt)"
                }
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Use <code className="bg-white/5 px-1 rounded">/image</code> or{" "}
              <code className="bg-white/5 px-1 rounded">/video</code> to switch mode instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile overlay when sidebar open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
