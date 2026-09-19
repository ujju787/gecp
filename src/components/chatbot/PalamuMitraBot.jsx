import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  User, 
  ExternalLink, 
  HelpCircle,
  Settings,
  ChevronDown,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { QUICK_PROMPTS } from '../../data/botKnowledge';
import { api } from '../../services/api';

export default function PalamuMitraBot({ 
  isOpen, 
  setIsOpen, 
  setCurrentTab 
}) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: `Namaste! 🙏 I am **Palamu Mitra**, your live conversational AI assistant for **Government Engineering College, Palamu**.

I can answer any questions about **B.Tech Admissions**, **Hostel Allotment & Mess Fees**, **CSE/ME/CE/EE Syllabus**, **Previous Year Papers (PYQs)**, or **Campus Directions from Daltonganj**.`,
      time: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gecp_gemini_api_key') || '');
  const [copiedId, setCopiedId] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isStreaming, isOpen]);

  const handleSaveApiKey = (val) => {
    setApiKey(val);
    if (val.trim()) {
      localStorage.setItem('gecp_gemini_api_key', val.trim());
    } else {
      localStorage.removeItem('gecp_gemini_api_key');
    }
    setShowSettings(false);
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isStreaming) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const botMsgId = `bot-${Date.now()}`;
    const initialBotMsg = {
      id: botMsgId,
      sender: 'bot',
      text: '', // start empty for live stream
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, initialBotMsg]);
    setInputVal('');
    setIsStreaming(true);

    try {
      await api.streamChat(
        query,
        apiKey,
        (chunk) => {
          setMessages(prev => prev.map(m => {
            if (m.id === botMsgId) {
              return { ...m, text: m.text + chunk };
            }
            return m;
          }));
        },
        () => {
          setIsStreaming(false);
        },
        (err) => {
          console.error('Streaming error:', err);
          setIsStreaming(false);
          setMessages(prev => prev.map(m => {
            if (m.id === botMsgId && !m.text) {
              return { 
                ...m, 
                text: "I am having trouble connecting to the AI backend. Please verify your internet connection or check the institutional FAQ chips below." 
              };
            }
            return m;
          }));
        }
      );
    } catch (e) {
      setIsStreaming(false);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'bot',
        text: 'Chat history reset. How may I help you with GEC Palamu queries?',
        time: 'Just now'
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 bg-gradient-to-r from-gec-blue via-indigo-900 to-gec-navy hover:from-sky-900 hover:to-slate-950 text-white p-3.5 sm:px-5 sm:py-3 rounded-full shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:scale-105 border-2 border-amber-400"
            aria-label="Open Palamu Mitra Live AI Chatbot"
          >
            <div className="relative">
              <Bot className="w-6 h-6 text-amber-300" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                <span>Live AI Helpdesk</span>
                <Sparkles className="w-2.5 h-2.5" />
              </div>
              <div className="text-xs font-black leading-tight">Ask Palamu Mitra (ChatGPT)</div>
            </div>
          </button>
        </div>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full sm:w-[420px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-gec-navy via-indigo-950 to-sky-950 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                  <span>Palamu Mitra Pro</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[9px] font-bold border border-emerald-400/40">
                    LIVE AI
                  </span>
                </h3>
                <p className="text-[10px] text-sky-200">Official GEC Palamu Conversational Model</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sky-200">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 hover:text-white transition-colors"
                title="AI Settings / API Key"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleClearChat}
                className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 hover:text-white transition-colors"
                title="Clear Chat History"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-sky-200 hover:text-white transition-colors"
                title="Minimize Window"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showSettings && (
            <div className="p-3.5 bg-slate-900 text-white text-xs border-b border-slate-800 animate-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Optional Custom Gemini API Key
                </span>
                <span className="text-[10px] text-slate-400">Default: Built-in Institutional Model</span>
              </div>
              <p className="text-[10px] text-slate-300 mb-2 leading-relaxed">
                If provided, responses will stream directly from Google Gemini 1.5 Flash. Otherwise, the high-speed institutional knowledge engine answers automatically.
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Paste AIzaSy... key (optional)"
                  defaultValue={apiKey}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveApiKey(e.target.value);
                  }}
                  id="gemini-key-input"
                  className="flex-1 p-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('gemini-key-input');
                    handleSaveApiKey(el.value);
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Quick FAQ Suggestion Chips */}
          <div className="p-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                disabled={isStreaming}
                onClick={() => handleSend(prompt)}
                className="px-3 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-gec-blue rounded-full border border-slate-200 whitespace-nowrap font-medium transition-all shadow-2xs shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gec-blue to-indigo-900 text-amber-300 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs border border-amber-300/30">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 shadow-2xs text-xs leading-relaxed group relative ${
                      isBot
                        ? 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                        : 'bg-gec-blue text-white rounded-tr-sm font-medium'
                    }`}
                  >
                    {/* Copy Button for Bot Messages */}
                    {isBot && m.text && (
                      <button
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-1 rounded bg-slate-100 text-slate-500 hover:text-slate-800 transition-opacity"
                        title="Copy text"
                      >
                        {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}

                    {/* Render Text with Markdown Asterisk Formatting */}
                    <div className="whitespace-pre-line space-y-1.5 font-sans">
                      {m.text ? (
                        m.text.split('\n').map((paragraph, pIdx) => {
                          const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                          return (
                            <div key={pIdx}>
                              {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={i} className={isBot ? "text-slate-900 font-bold" : "text-amber-200"}>
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex items-center gap-1.5 text-slate-400 py-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                          <span>Thinking & generating answer...</span>
                        </div>
                      )}

                      {/* Blinking cursor effect while streaming */}
                      {isStreaming && m.id === messages[messages.length - 1]?.id && isBot && (
                        <span className="inline-block w-1.5 h-3.5 bg-gec-blue animate-pulse ml-0.5 align-middle"></span>
                      )}
                    </div>

                    <div className={`text-[9px] mt-2 text-right ${isBot ? 'text-slate-400' : 'text-sky-200'}`}>
                      {m.time}
                    </div>
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Navigation Buttons inside Chat */}
          <div className="px-3.5 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Quick Portals:</span>
            <div className="flex gap-2">
              <button onClick={() => { setCurrentTab('payment'); setIsOpen(false); }} className="hover:text-gec-blue font-bold underline">Pay Fees</button>
              <span>•</span>
              <button onClick={() => { setCurrentTab('library'); setIsOpen(false); }} className="hover:text-gec-blue font-bold underline">PYQs</button>
              <span>•</span>
              <button onClick={() => { setCurrentTab('placement'); setIsOpen(false); }} className="hover:text-gec-blue font-bold underline">T&P</button>
              <span>•</span>
              <button onClick={() => { setCurrentTab('events'); setIsOpen(false); }} className="hover:text-gec-blue font-bold underline">Hackathon</button>
            </div>
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything like ChatGPT..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={isStreaming}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gec-blue focus:border-transparent disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isStreaming}
              className="p-2.5 bg-gec-blue hover:bg-sky-900 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
