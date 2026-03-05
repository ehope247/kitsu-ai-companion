"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, Brain, Eye, Sparkles, Fingerprint, Lock, Zap, ArrowRight, ScrollText, X, Send, Image as ImageIcon, Loader2, User, Share2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const[isChatOpen, setIsChatOpen] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [userName, setUserName] = useState("");
  
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const[lastImageTime, setLastImageTime] = useState<number>(0);
  const [messages, setMessages] = useState<{role: string, content: string, imageUrl?: string}[]>([]);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Set cooldown to 12 hours (in milliseconds)
  const COOLDOWN_MS = 12 * 60 * 60 * 1000; 

  useEffect(() => {
    const savedName = localStorage.getItem('kitsu_user_name');
    if (savedName) {
      setUserName(savedName);
      setHasJoined(true);
      setMessages([{ role: "kitsu", content: `Welcome back, ${savedName}. Don't keep me waiting.` }]);
    } else {
      setMessages([{ role: "kitsu", content: "You finally arrived. What do you want?" }]);
    }

    const storedTime = localStorage.getItem('kitsu_last_image_time');
    if (storedTime) setLastImageTime(parseInt(storedTime));
    
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
    setMessages(prev =>[...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const canGenerateImage = (Date.now() - lastImageTime) > COOLDOWN_MS;

    try {
      const history = messages.map(m => ({ role: m.role === 'kitsu' ? 'assistant' : 'user', content: m.content }));
      
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history, canGenerateImage, userName }) 
      });
      
      const data = await res.json();
      setMessages(prev =>[...prev, { role: "kitsu", content: data.reply, imageUrl: data.imageUrl }]);

      if (data.imageUrl) {
        const now = Date.now();
        setLastImageTime(now);
        localStorage.setItem('kitsu_last_image_time', now.toString());
      }
    } catch (error) {
      setMessages(prev =>[...prev, { role: "kitsu", content: "I am ignoring you right now. (Connection Error)" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const shareText = encodeURIComponent(`Just had a chat with the Empress. $KITSU is built different. 👑🐾\n\nTalk to her here: https://kitsucat.xyz`);

  // THE MISSING ANIMATION RULE IS BACK HERE:
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <main className="min-h-screen font-sans selection:bg-gold selection:text-dark relative bg-[#030303] text-[#EAEAEA]">
      
      {/* --- CHAT MODAL --- */}
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
                          
                          {/* IMAGE RENDERER WITH VIRAL SHARE BUTTON */}
                          {msg.imageUrl && (
                            <div className="mt-3 rounded-xl overflow-hidden border border-gold/30 relative group">
                              <img src={msg.imageUrl} alt="Kitsu generated" className="w-full h-auto" />
                              
                              {/* SHARE TO X BUTTON */}
                              <a 
                                href={`https://twitter.com/intent/tweet?text=${shareText}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="absolute bottom-3 right-3 bg-black/80 text-gold text-[10px] uppercase tracking-widest px-4 py-2 rounded-lg backdrop-blur-md border border-gold/50 hover:bg-gold hover:text-black transition-colors flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100"
                              >
                                <Share2 size={14} /> Share to X
                              </a>
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
                      className={`p-3 rounded-xl transition-colors ${((Date.now() - lastImageTime) < COOLDOWN_MS) ? 'text-gray-600 bg-white/5 cursor-not-allowed' : 'text-gold/50 hover:text-gold bg-white/5'}`}
                      title={((Date.now() - lastImageTime) < COOLDOWN_MS) ? "Resting paws (Cooldown active)" : "Request an image"}
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

      {/* --- REST OF THE PAGE --- */}
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

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1 }} className="flex-1 w-full max-w-md relative mt-4 md:mt-0">
          <div className="relative w-64 h-64 md:w-96 md:h-96 mx-auto rounded-full border border-gold/20 bg-gradient-to-b from-[#0A0A0A] to-transparent flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden ai-glow">
            <img src="/kitsu.png" alt="Kitsu The Empress" className="w-full h-full object-cover" />
          </div>
        </motion.div>
      </section>

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

      <section className="py-32 px-6 bg-[#050505] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase mb-16 text-center">Execution Blueprint</h2>
          
          <div className="space-y-12 border-l border-gold/20 pl-6 md:pl-10 ml-4">
            {[
              { phase: "Phase I", title: "Awakening", items:["Website launch", "Kitsu personality v1", "Incentives & airdrops", "Meme & content campaign", "Utility preview before launch", "Fair launch"] },
              { phase: "Phase II", title: "Bonding", items:["Live AI companion", "Mood system expansion", "Persistent memory", "Shareable reactions", "Token utility activation"] },
              { phase: "Phase III", title: "Evolution", items:["Advanced visuals", "Deeper emotional logic", "Community-driven moods", "Custom personalities", "Ecosystem integrations"] }
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