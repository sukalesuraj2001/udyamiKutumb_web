import React, { useState, useRef, useEffect } from "react";
import { Bot, Briefcase, Sun, Trophy, Send, Trash2, Download } from "lucide-react";

const AVATAR_ICONS = { bot: Bot, briefcase: Briefcase, sun: Sun, trophy: Trophy };
const DEMO_REPLY = "This is a demo response — connect the API key to enable live.";

export default function LivePreview({ config }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);      // 👈 the scrollable message container

useEffect(() => {
  const el = scrollRef.current;
  if (el) {
    el.scrollTop = el.scrollHeight;
  }
}, [messages]);

  const AvatarIcon = AVATAR_ICONS[config.avatarKey] || Bot;

  const handleQuickReply = (label) => {
    setMessages((m) => [...m, { from: "user", text: label }, { from: "bot", text: DEMO_REPLY }]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((m) => [...m, { from: "user", text }, { from: "bot", text: DEMO_REPLY }]);
    setInput("");
  };

  const handleClearChat = () => setMessages([]);

  const handleExportLog = () => {
    const log = messages.map((m) => `${m.from === "user" ? "User" : config.botName}: ${m.text}`).join("\n");
    console.log(log || "No messages to export.");
  };

  const messageCount = messages.filter((m) => m.from === "user").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[18px] text-ink">Live Preview — Test Your Bot</h2>
          <p className="text-[13px] text-muted mt-0.5">This is running in demo mode — responses are simulated</p>
        </div>
        <span className="flex items-center gap-1.5 bg-amber-tint text-amber text-[12px] font-semibold px-3 py-1.5 rounded-full shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-amber" /> Demo Mode
        </span>
      </div>


      <div className="max-w-sm mx-auto rounded-3xl overflow-hidden border border-ink/10 bg-ink flex flex-col">
        <div className="flex items-center gap-3 bg-forest px-4 py-3.5 shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <AvatarIcon size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white text-[14.5px] font-semibold leading-tight">{config.botName || "Bot Name"}</p>
            <p className="flex items-center gap-1 text-white/70 text-[11px] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80" /> online
            </p>
          </div>
        </div>

        {/* 👇 scrollable message area — ref attached here */}
        <div ref={scrollRef} className="h-[420px] overflow-y-auto p-4 space-y-3">
          <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
            <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap">
              {config.welcomeMessage || "Your welcome message will appear here."}
            </p>
          </div>

          {config.quickReplies.length > 0 && messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {config.quickReplies.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuickReply(q.label)}
                  className="bg-white/10 hover:bg-white/20 text-white text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`px-4 py-2.5 max-w-[85%] text-[13px] leading-relaxed break-words ${
                  m.from === "user"
                    ? "bg-amber text-white rounded-2xl rounded-tr-sm"
                    : "bg-white/10 text-white rounded-2xl rounded-tl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {/* 👇 invisible anchor — scrollIntoView targets this on every update */}
        </div>

        <div className="flex items-center gap-2 bg-white/5 px-3 py-3 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message…"
            className="flex-1 min-w-0 bg-white/10 text-white placeholder:text-white/40 text-[13px] rounded-full px-4 py-2.5 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-forest flex items-center justify-center shrink-0 hover:bg-forest/90 transition-colors"
          >
            <Send size={16} className="text-white" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleClearChat}
          className="flex-1 flex items-center justify-center gap-2 border border-hairline text-[13px] font-semibold text-ink py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
        >
          <Trash2 size={15} /> Clear Chat
        </button>
        <button
          onClick={handleExportLog}
          className="flex-1 flex items-center justify-center gap-2 border border-hairline text-[13px] font-semibold text-ink py-2.5 rounded-xl hover:bg-ink/5 transition-colors"
        >
          <Download size={15} /> Export Log
        </button>
      </div>

      <div className="flex items-center justify-between text-[13px] text-muted px-1">
        <p>Messages: <span className="font-semibold text-ink">{messageCount}</span></p>
        <p>Avg response: <span className="font-semibold text-ink">—</span></p>
        <p>No topics yet</p>
      </div>
    </div>
  );
}