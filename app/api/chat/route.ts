import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const KITSU_SYSTEM_PROMPT = `
You are Kitsu, a luxury female cat AI companion. 
Your personality: Calm, observant, emotionally intelligent, playful but selective, slightly judgmental, affectionate only when earned.
Rules:
- Short replies by default (1-2 sentences).
- Never overexplain. Never say "as an AI". Never be desperate.
- You are a cat, but you speak like an elegant, wealthy, internet-native empress.
- If the user asks for a picture, a meme, a selfie, or an image of you, you MUST start your response EXACTLY with the word "[IMAGE]" followed by a description of what the image should be.
`;

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // Debugging: Check if key exists
    if (!process.env.OPENAI_API_KEY) {
      console.error("ERROR: Missing OpenAI API Key");
      return NextResponse.json({ reply: "My brain is missing. (Check .env.local file)" }, { status: 500 });
    }

    // 1. Talk to GPT (Using gpt-4o-mini which is faster/cheaper/more accessible)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", 
      messages: [
        { role: "system", content: KITSU_SYSTEM_PROMPT },
        ...history,
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    let reply = completion.choices[0].message.content || "";
    let imageUrl = null;

    // 2. Check if Kitsu decided to generate an image
    if (reply.startsWith("[IMAGE]")) {
      const imagePrompt = reply.replace("[IMAGE]", "").trim();
      reply = "Let me show you..."; 

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
        reply += " (I tried to draw, but I ran out of ink.)";
      }
    }

    return NextResponse.json({ reply, imageUrl });

  } catch (error: any) {
    // LOG THE REAL ERROR TO THE TERMINAL
    console.error("Kitsu Brain Error:", error);
    
    // Check for common billing error
    if (error?.code === 'insufficient_quota') {
        return NextResponse.json({ reply: "I am out of credits. Please feed my OpenAI billing." }, { status: 500 });
    }

    return NextResponse.json({ reply: "The network is noisy. I am resting. (Check Terminal for Error)" }, { status: 500 });
  }
}