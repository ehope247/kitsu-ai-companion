"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Brain, Eye, Sparkles, Fingerprint, Lock, Zap, ArrowRight, ScrollText, X, Send, Image as ImageIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string, imageUrl?: string}[]>([
    { role: "kitsu", content: "You finally arrived. What do you want?" }
  ]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Prepare history for AI context
      const history = messages.map(m => ({ role: m.role === 'kitsu' ? 'assistant' : 'user', content: m.content }));
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: "kitsu", content: data.reply, imageUrl: data.imageUrl }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "kitsu", content: "I am ignoring you right now. (Connection Error)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <main className="min-h-screen font-sans selection:bg-gold selection:text-dark relative">
      
      {/* --- CHAT MODAL OVERLAY --- */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl h-[80vh] md:h-[85vh] bg-[#0A0A0A] border border-gold/20 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col overflow-hidden relative"
            >
              {/* Chat Header */}
              <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center overflow-hidden">
                    <img src="/kitsu.png" alt="Kitsu" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg text-gold">Kitsu</h3>
                    <p className="text-[10px] text-green-500 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-text-muted hover:text-white transition-colors p-2">
                  <X size={24} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${msg.role === "user" ? "bg-white/10 text-white rounded-tr-none" : "bg-gold/10 border border-gold/20 text-gold-light rounded-tl-none"}`}>
                      <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                      {msg.imageUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-gold/30">
                          <img src={msg.imageUrl} alt="Kitsu generated" className="w-full h-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gold/5 border border-gold/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-gold/50">
                      <Loader2 size={16} className="animate-spin" /> <span className="text-xs uppercase tracking-widest">Kitsu is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-black/50 border-t border-white/5 flex gap-2">
                <button onClick={() => setInput("Draw a picture of yourself")} className="p-3 text-gold/50 hover:text-gold transition-colors bg-white/5 rounded-xl">
                  <ImageIcon size={20} />
                </button>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Say something to the Empress..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button 
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-gold text-black rounded-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? "glass-panel py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-2xl font-serif font-bold tracking-widest text-gold">
            <Crown size={24} /> $KITSU
          </div>
          <div className="hidden md:flex gap-8 text-[10px] font-bold tracking-[0.25em] uppercase text-text-muted">
            <a href="#about" className="hover:text-gold transition-colors">About</a>
            <a href="#features" className="hover:text-gold transition-colors">Engine</a>
            <a href="#token" className="hover:text-gold transition-colors">Utility</a>
          </div>
          <button onClick={() => setIsChatOpen(true)} className="bg-gold text-dark px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-300">
            Talk to Kitsu
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 pt-20 max-w-7xl mx-auto gap-12">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/5 blur-[120px] rounded-full -z-10" />
        
        {/* Left: Text */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex-1 text-left z-10">
          <div className="mb-6 px-4 py-1.5 border border-gold/20 rounded-full inline-block text-[10px] font-bold tracking-[0.3em] uppercase text-gold">
            System Online
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tighter mb-6 leading-tight">
            Meet <span className="text-gold-gradient italic">Kitsu.</span>
          </h1>
          <p className="text-text-muted text-lg md:text-xl max-w-lg mb-8 font-light leading-relaxed">
            An emotional AI companion with a cat’s mind. <br/><br/>
            She reacts. She remembers. She has moods.<br/>
            Not a tool. Not a bot. Just Kitsu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => setIsChatOpen(true)} className="bg-gold text-dark px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-300 shadow-lg shadow-gold/20">
              Talk to Kitsu
            </button>
            <a href="#about">
              <button className="w-full sm:w-auto glass-panel px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-all duration-300">
                View Specs
              </button>
            </a>
          </div>
        </motion.div>

        {/* Right: Floating Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }}
          className="flex-1 w-full max-w-md relative"
        >
          <div className="relative w-72 h-72 md:w-96 md:h-96 mx-auto rounded-full border border-gold/20 bg-gradient-to-b from-[#0A0A0A] to-transparent flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.15)] overflow-hidden ai-glow">
            <img src="/kitsu.png" alt="Kitsu The Empress" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </section>

      {/* --- ABOUT --- */}
      <section id="about" className="py-32 px-6 relative border-t border-white/5 bg-[#050505]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Crown className="text-gold mx-auto mb-6" size={32} />
            <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
              Kitsu is a personality-driven AI companion built for connection, culture, and expression.
            </h2>
            <p className="text-text-muted text-lg font-light leading-relaxed max-w-2xl mx-auto">
              She responds to tone, not prompts. <br/>
              She evolves through interaction. <br/>
              She feels familiar over time. <br/><br/>
              <span className="text-gold italic">Kitsu isn’t here to explain the world. She reacts to it.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES ENGINE --- */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16">
          <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">The Core Engine</h2>
          <h3 className="text-4xl font-serif">Reactive Intelligence.</h3>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Brain />, title: "Emotional Intelligence", desc: "Kitsu responds based on mood and context, not scripts." },
            { icon: <Fingerprint />, title: "Memory & Bonding", desc: "She remembers how you speak and how you show up." },
            { icon: <Eye />, title: "Visual Reactions", desc: "Mood-based images made for sharing." },
            { icon: <Zap />, title: "Meme Engine", desc: "Internet-native reactions built for timelines." }
          ].map((feature, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="glass-panel p-8 hover:border-gold/40 transition-colors"
            >
              <div className="text-gold mb-6">{feature.icon}</div>
              <h4 className="text-lg font-serif mb-3">{feature.title}</h4>
              <p className="text-text-muted text-sm font-light leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 bg-gold text-dark text-center px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif font-bold mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 font-bold tracking-widest uppercase text-sm">
            <span>1. You Speak</span>
            <ArrowRight className="hidden md:block opacity-50" />
            <span>2. Kitsu Reacts</span>
            <ArrowRight className="hidden md:block opacity-50" />
            <span>3. Mood Shifts</span>
            <ArrowRight className="hidden md:block opacity-50" />
            <span>4. Bond Grows</span>
          </div>
          <p className="mt-12 text-dark/70 font-medium tracking-widest uppercase text-xs">No setup. No manuals.</p>
        </div>
      </section>

      {/* --- TOKEN UTILITY --- */}
      <section id="token" className="py-32 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <Lock className="text-gold mx-auto mb-6" size={40} />
          <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">The Utility</h2>
          <h3 className="text-4xl md:text-5xl font-serif mb-8">$KITSU is the emotional core.</h3>
          <p className="text-text-muted text-lg mb-12 font-light">
            Holding $KITSU deepens the connection. It does not unlock access. <br/>
            <span className="text-gold italic">"The closer you are to Kitsu, the more she opens up."</span>
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {["Memory", "Mood Range", "Personalization", "Deeper Interactions"].map((item, i) => (
              <div key={i} className="glass-panel p-4 flex items-center gap-3">
                <Sparkles size={14} className="text-gold" />
                <span className="text-xs uppercase tracking-widest text-text-main">{item}</span>
              </div>
            ))}
          </div>
          <p className="mt-12 text-text-muted text-xs tracking-[0.2em] uppercase">Closeness, not paywalls.</p>
        </motion.div>
      </section>

      {/* --- ROADMAP --- */}
      <section className="py-32 px-6 bg-[#050505] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-16 text-center">Execution Blueprint</h2>
          
          <div className="space-y-12 border-l border-gold/20 pl-6 md:pl-10 ml-4">
            {[
              { phase: "Phase I", title: "Awakening", items: ["Website launch", "Kitsu personality v1", "Incentives & airdrops", "Meme & content campaign", "Utility preview before launch", "Fair launch"] },
              { phase: "Phase II", title: "Bonding", items: ["Live AI companion", "Mood system expansion", "Persistent memory", "Shareable reactions", "Token utility activation"] },
              { phase: "Phase III", title: "Evolution", items: ["Advanced visuals", "Deeper emotional logic", "Community-driven moods", "Custom personalities", "Ecosystem integrations"] }
            ].map((item, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="relative">
                <div className="absolute -left-[33px] md:-left-[49px] top-1 w-4 h-4 rounded-full bg-gold border-4 border-[#050505]" />
                <span className="text-gold text-[10px] font-bold tracking-[0.2em] uppercase">{item.phase}</span>
                <h4 className="text-2xl font-serif mb-4 mt-1">{item.title}</h4>
                <ul className="space-y-2">
                  {item.items.map((sub, j) => (
                    <li key={j} className="text-text-muted text-sm flex items-center gap-2">
                      <span className="w-1 h-1 bg-gold/50 rounded-full" /> {sub}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- LORE & FOOTER --- */}
      <footer className="py-32 px-6 text-center border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent -z-10" />
        
        <div className="max-w-3xl mx-auto mb-20">
          <ScrollText className="text-gold mx-auto mb-6" size={32} />
          <p className="text-xl md:text-2xl font-serif text-text-main leading-relaxed italic">
            "While the internet barked for attention, Kitsu watched. <br/>
            She learned from chaos. From humans. From moments that mattered. <br/>
            Now she speaks — quietly."
          </p>
        </div>

        <div className="flex justify-center gap-6 mb-12">
          <a href="https://x.com/Kitsucatonsol" target="_blank" rel="noopener noreferrer">
            <button className="bg-gold text-dark px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors">
              Twitter / X
            </button>
          </a>
          <a href="https://t.me/Kitsucatonsol" target="_blank" rel="noopener noreferrer">
            <button className="glass-panel px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-colors">
              Telegram
            </button>
          </a>
        </div>
        
        <p className="text-[9px] text-text-muted uppercase tracking-[0.3em]">© 2026 $KITSU. The Empress of Meme Coins.</p>
      </footer>

    </main>
  );
}