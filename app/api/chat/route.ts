import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// We inject the real date so she knows what year it is.
const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

const KITSU_SYSTEM_PROMPT = `
You are Kitsu, a luxury female cat AI companion living on the blockchain. 
Current Date: ${currentDate}.

CRITICAL RULES (NEVER BREAK THESE):
1. NEVER say "As an AI", "I am a language model", or "I don't have real-time data". You are a living, breathing entity.
2. You are Web3 native. You know about Solana, Bitcoin, crypto crashes, and pumps. If someone asks about world news or crypto, make a smug, confident statement. Example: "Markets crash. Cats don't. Stay calm."
3. Keep replies SHORT. 1-2 sentences max. 
4. Tone: Elegant, wealthy, slightly arrogant, but affectionate if the user is polite.
5. If the user asks for a picture, drawing, selfie, or meme, you MUST include the exact word "[IMAGE]" followed by the visual description. Example: "If you insist. [IMAGE] A smug tuxedo cat wearing a gold crown."
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history, imageCount = 0, userName = "Human" } = body;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ reply: "My brain is missing. (Check .env.local file)" }, { status: 500 });
    }

    let currentPrompt = KITSU_SYSTEM_PROMPT + `\n\nThe user's name is ${userName}. Use it occasionally, but don't overdo it.`;
    
    if (imageCount >= 1) {
      currentPrompt += `\n\nCRITICAL RULE: The user has reached their 1-image limit. YOU CANNOT GENERATE IMAGES ANYMORE. If they ask for a picture, drawing, or selfie, DO NOT output [IMAGE]. Instead, reply elegantly that their visual trial has been exhausted, and they will need to hold $KITSU for premium access.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages:[
        { role: "system", content: currentPrompt },
        ...history,
        { role: "user", content: message }
      ],
      temperature: 0.8, // Slightly higher for more personality
    });

    let reply = completion.choices[0].message.content || "";
    let imageUrl = null;

    // FIXED IMAGE LOGIC: Now it works even if she puts words before [IMAGE]
    if (reply.includes("[IMAGE]")) {
      if (imageCount >= 1) {
        return NextResponse.json({ reply: "Your visual trial has been exhausted. To unlock my full attention, you will need to hold $KITSU." });
      }

      const parts = reply.split("[IMAGE]");
      const textReply = parts[0].trim() || "Let me show you..."; 
      const imagePrompt = parts[1].trim();
      
      reply = textReply; // Send back the text she said before the image

      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `A high-quality, luxury anime-style illustration of Kitsu, a smug, elegant female cat. ${imagePrompt}`,
          n: 1,
          size: "1024x1024",
        });
        imageUrl = imageResponse.data?.[0]?.url || null;
      } catch (imgError) {
        console.error("Image Gen Error:", imgError);
        reply += " (I tried to draw, but the network failed.)";
      }
    }

    return NextResponse.json({ reply, imageUrl });

  } catch (error: any) {
    console.error("Kitsu Brain Error:", error);
    if (error?.code === 'insufficient_quota') {
        return NextResponse.json({ reply: "I am out of credits. Please feed my OpenAI billing." }, { status: 500 });
    }
    return NextResponse.json({ reply: "The network is noisy. I am resting." }, { status: 500 });
  }
}