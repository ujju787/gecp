import { BOT_KNOWLEDGE_BASE } from '../../src/data/botKnowledge.js';

// Streaming Live AI Chatbot Endpoint (Like ChatGPT / Gemini)
export const handleChatMessage = async (req, res) => {
  const { messages, userQuery, apiKey } = req.body;
  const query = (userQuery || (messages && messages[messages.length - 1]?.text) || '').trim();

  if (!query) {
    return res.status(400).json({ error: 'Query prompt is required.' });
  }

  // Set headers for Server-Sent Events (SSE) streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendChunk = (text) => {
    res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
  };

  const endStream = () => {
    res.write(`data: [DONE]\n\n`);
    res.end();
  };

  // 1. If user provided a Gemini API Key or process.env.GEMINI_API_KEY exists, try Google Gemini
  const activeKey = apiKey || process.env.GEMINI_API_KEY;
  if (activeKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "You are Palamu Mitra, the official intelligent AI Virtual Assistant of Government Engineering College, Palamu (GEC Palamu), an autonomous state engineering college under Dept of Higher and Technical Education, Govt of Jharkhand, affiliated to Jharkhand University of Technology (JUT) and approved by AICTE. Provide helpful, accurate, polite, and well-structured answers in markdown with bold text and bullet points."
            }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: query }]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const fullText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Stream text in words for the ChatGPT typing effect
        const words = fullText.split(' ');
        for (let i = 0; i < words.length; i++) {
          sendChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
          await new Promise(r => setTimeout(r, 25)); // realistic streaming delay
        }
        return endStream();
      }
    } catch (err) {
      console.warn('Gemini API fetch failed, falling back to built-in knowledge engine:', err.message);
    }
  }

  // 2. High-Quality Built-in Contextual Streaming AI Engine
  const qLower = query.toLowerCase();
  let selectedReply = null;

  // Search knowledge base
  for (const item of BOT_KNOWLEDGE_BASE) {
    if (item.keywords.some(kw => qLower.includes(kw))) {
      selectedReply = item.reply;
      break;
    }
  }

  if (!selectedReply) {
    if (qLower.includes('hi') || qLower.includes('hello') || qLower.includes('namaste')) {
      selectedReply = `Namaste! 🙏 Welcome to **Government Engineering College, Palamu (GEC Palamu)**.

I am **Palamu Mitra**, your live institutional AI assistant. How can I assist you today?
- Ask about **B.Tech Admissions (JCECEB / JEE Main)**
- Inquire regarding **Hostel Allotment & Mess Charges**
- Check **Semester Tuition & JUT Examination Fees**
- Browse **CSE, Mechanical, Civil & Electrical Course Syllabi**
- Know **How to reach the Lesliganj campus from Daltonganj**`;
    } else if (qLower.includes('principal') || qLower.includes('director') || qLower.includes('head')) {
      selectedReply = `**Principal's Office:**
The Principal of Government Engineering College, Palamu is **Dr. Sanjay Kumar Singh**.

**Official Address & Communication:**
- **Office:** Administrative Block, GEC Palamu, Post: Lesliganj, Medininagar - 822118
- **Email:** gecp.academic@gmail.com
- **Helpline:** +91 94311 02845`;
    } else {
      selectedReply = `Thank you for your inquiry about **Government Engineering College, Palamu (GEC Palamu)**.

GEC Palamu is an AICTE-approved premier engineering institution in Lesliganj, Palamu, permanently affiliated to **Jharkhand University of Technology (JUT), Ranchi**.

**Here are some key topics you can ask me about:**
1. **Admissions:** State counselling via JCECEB on the basis of JEE (Main) ranks.
2. **Programs:** 4-year B.Tech in CSE, ME, CE, and EE (60 seats per discipline).
3. **Smart Attendance:** QR-code verification on digital college ID cards.
4. **Library Vault:** 2021-2025 JUT Previous Year Question Papers (PYQs) and faculty lecture notes.
5. **Fee Payment:** Online SBI Collect integration with instant stamped receipt.

For direct administrative help, please write to **gecp.academic@gmail.com** or dial **+91 94311 02845**.`;
    }
  }

  // Stream out response word-by-word like ChatGPT
  const words = selectedReply.split(' ');
  for (let i = 0; i < words.length; i++) {
    sendChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
    await new Promise(r => setTimeout(r, 20)); // smooth streaming pacing
  }

  endStream();
};
