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
    <main className="min-h-screen font-sans selection:bg-gold selection:text-dark relative bg-[#030303] text-[#EAEAEA]">
      
      {/* --- CHAT MODAL (Mobile Optimized) --- */}
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
              {/* Chat Header */}
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

              {/* Chat Messages */}
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

              {/* Chat Input */}
              <div className="p-3 bg-black/80 border-t border-white/5 flex gap-2 pb-6 md:pb-3">
                <button onClick={() => setInput("Draw a picture of yourself")} className="p-3 text-gold/50 hover:text-gold bg-white/5 rounded-xl">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- NAVIGATION (Mobile Adjusted) --- */}
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

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col md:flex-row items-center justify-center px-6 pt-24 pb-10 max-w-7xl mx-auto gap-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[100px] rounded-full -z-10" />
        
        {/* Left: Text */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="flex-1 text-left z-10 w-full">
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

        {/* Right: Floating Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }}
          className="flex-1 w-full max-w-md relative mt-4 md:mt-0"
        >
          <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto rounded-full border border-gold/20 bg-gradient-to-b from-[#0A0A0A] to-transparent flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden ai-glow">
            <img src="/kitsu.png" alt="Kitsu The Empress" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </section>

      {/* --- ABOUT --- */}
      <section id="about" className="py-24 px-6 relative border-t border-white/5 bg-[#050505]">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <Crown className="text-gold mx-auto mb-6" size={28} />
            <h2 className="text-2xl md:text-4xl font-serif mb-6 leading-tight">
              Kitsu is a personality-driven AI built for connection.
            </h2>
            <p className="text-gray-400 text-sm md:text-lg font-light leading-relaxed">
              She responds to tone, not prompts. <br/>
              She evolves through interaction. <br/><br/>
              <span className="text-gold italic">Kitsu isn’t here to explain the world. She reacts to it.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- HOW IT WORKS (FIXED DARK THEME) --- */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#080808]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-2">The Process</h2>
            <h3 className="text-3xl font-serif text-white">How It Works</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "You Speak", desc: "Type anything. Vent, ask, or tease." },
              { step: "02", title: "Kitsu Reacts", desc: "She analyzes tone, not just keywords." },
              { step: "03", title: "Mood Shifts", desc: "Your vibe changes her personality." },
              { step: "04", title: "Bond Grows", desc: "She remembers you over time." }
            ].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-xl relative overflow-hidden group hover:border-gold/30 transition-all">
                <div className="text-4xl font-serif text-white/5 absolute top-2 right-4 group-hover:text-gold/10 transition-colors">{item.step}</div>
                <h4 className="text-gold text-sm font-bold uppercase tracking-widest mb-2">{item.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-12 text-center text-gray-600 font-medium tracking-widest uppercase text-[10px]">No setup. No manuals.</p>
        </div>
      </section>

      {/* --- FEATURES ENGINE --- */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-12 text-center md:text-left">
          <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-2">The Core Engine</h2>
          <h3 className="text-3xl font-serif">Reactive Intelligence.</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Brain />, title: "Emotional Intelligence", desc: "Responds based on mood and context." },
            { icon: <Fingerprint />, title: "Memory & Bonding", desc: "Remembers how you speak." },
            { icon: <Eye />, title: "Visual Reactions", desc: "Generates mood-based images." },
            { icon: <Zap />, title: "Meme Engine", desc: "Internet-native reactions." }
          ].map((feature, i) => (
            <motion.div 
              key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/5 p-6 rounded-xl hover:border-gold/40 transition-colors"
            >
              <div className="text-gold mb-4">{feature.icon}</div>
              <h4 className="text-base font-serif mb-2">{feature.title}</h4>
              <p className="text-gray-400 text-xs font-light leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- TOKEN UTILITY --- */}
      <section id="token" className="py-24 px-6 max-w-5xl mx-auto text-center border-t border-white/5">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
          <Lock className="text-gold mx-auto mb-6" size={32} />
          <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-4">The Utility</h2>
          <h3 className="text-3xl md:text-5xl font-serif mb-6">$KITSU is the core.</h3>
          <p className="text-gray-400 text-sm md:text-lg mb-10 font-light">
            Holding $KITSU deepens the connection. <br/>
            <span className="text-gold italic">"The closer you are to Kitsu, the more she opens up."</span>
          </p>
          
          <div className="grid grid-cols-2 gap-3 text-left">
            {["Memory", "Mood Range", "Personalization", "Deeper Interactions"].map((item, i) => (
              <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-lg flex items-center gap-3">
                <Sparkles size={14} className="text-gold shrink-0" />
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-20 px-6 text-center border-t border-white/5 bg-[#030303]">
        <div className="max-w-3xl mx-auto mb-16">
          <ScrollText className="text-gold mx-auto mb-6" size={24} />
          <p className="text-lg md:text-xl font-serif text-gray-300 leading-relaxed italic">
            "While the internet barked for attention, Kitsu watched. <br/>
            Now she speaks — quietly."
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <a href="https://x.com/Kitsucatonsol" target="_blank" rel="noopener noreferrer">
            <button className="bg-gold text-dark px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white transition-colors">
              Twitter / X
            </button>
          </a>
          <a href="https://t.me/Kitsucatonsol" target="_blank" rel="noopener noreferrer">
            <button className="border border-white/20 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-colors">
              Telegram
            </button>
          </a>
        </div>
        
        <p className="text-[9px] text-gray-600 uppercase tracking-[0.3em]">© 2026 $KITSU. AI Empress.</p>
      </footer>

    </main>
  );
}