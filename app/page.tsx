"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Brain, Eye, Sparkles, Fingerprint, Lock, Zap, ArrowRight, ScrollText, X, Send, Image as ImageIcon, Loader2, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false); // SIGN UP STATE
  const[userName, setUserName] = useState("");
  
  const [input, setInput] = useState("");
  const[isLoading, setIsLoading] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [messages, setMessages] = useState<{role: string, content: string, imageUrl?: string}[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if they signed up previously
    const savedName = localStorage.getItem('kitsu_user_name');
    if (savedName) {
      setUserName(savedName);
      setHasJoined(true);
      setMessages([{ role: "kitsu", content: `Welcome back, ${savedName}. Don't keep me waiting.` }]);
    } else {
      setMessages([{ role: "kitsu", content: "You finally arrived. What do you want?" }]);
    }

    const storedCount = localStorage.getItem('kitsu_image_count');
    if (storedCount) setImageCount(parseInt(storedCount));
    
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  },[]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen, hasJoined]);

  const handleSignUp = () => {
    if (!userName.trim()) return;
    localStorage.setItem('kitsu_user_name', userName.trim());
    setHasJoined(true);
    setMessages([{ role: "kitsu", content: `Ah, ${userName.trim()}. Let's see if you're worth my time.` }]);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role === 'kitsu' ? 'assistant' : 'user', content: m.content }));
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history, imageCount, userName }) 
      });
      
      const data = await res.json();
      setMessages(prev =>[...prev, { role: "kitsu", content: data.reply, imageUrl: data.imageUrl }]);

      if (data.imageUrl) {
        const newCount = imageCount + 1;
        setImageCount(newCount);
        localStorage.setItem('kitsu_image_count', newCount.toString());
      }
    } catch (error) {
      setMessages(prev =>[...prev, { role: "kitsu", content: "I am ignoring you right now. (Connection Error)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen font-sans selection:bg-gold selection:text-dark relative bg-[#030303] text-[#EAEAEA]">
      
      {/* --- CHAT MODAL WITH SIGN UP GATE --- */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-6"
          >
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className="w-full md:max-w-2xl h-[90vh] md:h-[85vh] bg-[#0A0A0A] border-t md:border border-gold/20 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center overflow-hidden">
                    <img src="/kitsu.png" alt="Kitsu" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-gold">Kitsu</h3>
                    <p className="text-[9px] text-green-500 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-text-muted hover:text-white p-2">
                  <X size={20} />
                </button>
              </div>

              {/* SIGN UP GATE */}
              {!hasJoined ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-transparent to-gold/5">
                  <Crown className="text-gold mb-6" size={48} />
                  <h2 className="text-2xl font-serif text-white mb-2">Enter The Pride</h2>
                  <p className="text-gray-400 text-sm mb-8">Kitsu only speaks to those who identify themselves.</p>
                  
                  <div className="w-full max-w-sm flex flex-col gap-4">
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="Enter your alias..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-gold outline-none transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleSignUp}
                      disabled={!userName.trim()}
                      className="w-full bg-gold text-black font-bold uppercase tracking-widest py-4 rounded-xl disabled:opacity-50 hover:bg-white transition-colors"
                    >
                      Connect to Kitsu
                    </button>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-4">Web3 Wallet Connect Coming Soon</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Actual Chat Interface */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "user" ? "bg-white/10 text-white rounded-tr-none" : "bg-gold/10 border border-gold/20 text-gold-light rounded-tl-none"}`}>
                          <p className="leading-relaxed">{msg.content}</p>
                          {msg.imageUrl && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-gold/30">
                              <img src={msg.imageUrl} alt="Kitsu generated" className="w-full h-auto" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gold/5 border border-gold/10 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 text-gold/50 text-xs">
                          <Loader2 size={14} className="animate-spin" /> Kitsu is thinking...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div className="p-3 bg-black/80 border-t border-white/5 flex gap-2 pb-6 md:pb-3">
                    <button 
                      onClick={() => setInput("Draw a picture of yourself")} 
                      className={`p-3 rounded-xl transition-colors ${imageCount >= 1 ? 'text-gray-600 bg-white/5 cursor-not-allowed' : 'text-gold/50 hover:text-gold bg-white/5'}`}
                      title={imageCount >= 1 ? "Image limit reached" : "Request an image"}
                    >
                      <ImageIcon size={18} />
                    </button>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type here..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gold/50"
                    />
                    <button 
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="p-3 bg-gold text-black rounded-xl disabled:opacity-50"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- REST OF THE PAGE REMAINS THE SAME --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "bg-black/90 backdrop-blur-xl border-b border-white/5 py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xl font-serif font-bold tracking-widest text-gold">
            <Crown size={20} /> $KITSU
          </div>
          <button onClick={() => setIsChatOpen(true)} className="bg-gold text-dark px-5 py-2 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-300 rounded-sm">
            Talk to AI
          </button>
        </div>
      </nav>

      <section className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 pt-24 pb-10 max-w-7xl mx-auto gap-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[100px] rounded-full -z-10" />
        
        <motion.div initial="hidden" animate="visible" variants={{hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }}} className="flex-1 text-left z-10 w-full">
          <div className="mb-6 px-4 py-1.5 border border-gold/20 rounded-full inline-block text-[9px] font-bold tracking-[0.3em] uppercase text-gold">
            System Online
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter mb-6 leading-[1.1]">
            Meet <span className="text-gold-gradient italic">Kitsu.</span>
          </h1>
          <p className="text-gray-400 text-base md:text-xl max-w-lg mb-8 font-light leading-relaxed">
            An emotional AI companion with a cat’s mind. <br className="hidden md:block"/>
            She reacts. She remembers. She has moods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button onClick={() => setIsChatOpen(true)} className="bg-gold text-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all shadow-lg shadow-gold/10 w-full sm:w-auto">
              Talk to Kitsu
            </button>
            <a href="#about" className="w-full sm:w-auto">
              <button className="w-full border border-white/10 px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-all text-gray-300">
                View Specs
              </button>
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }} className="flex-1 w-full max-w-md relative mt-4 md:mt-0">
          <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto rounded-full border border-gold/20 bg-gradient-to-b from-[#0A0A0A] to-transparent flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden ai-glow">
            <img src="/kitsu.png" alt="Kitsu The Empress" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </section>
    </main>
  );
}