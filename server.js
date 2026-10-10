import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    // 1. Birinci tercih: Güncel Flash modeli
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userMessage,
    });

    return res.json({ reply: response.text });
  } catch (error) {
    console.warn("⚠️ İlk model yanıt vermedi, yedek modele geçiliyor...", error?.status || error);

    try {
      // 2. İkinci tercih: Alternatif yedek model
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
      });

      return res.json({ reply: fallbackResponse.text });
    } catch (fallbackError) {
      console.error("❌ İki model de yanıt veremedi:", fallbackError);
      return res.status(503).json({ reply: "Anlık sunucu yoğunluğu var, lütfen birkaç saniye sonra tekrar deneyin." });
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Sunucu hazır! http://localhost:${PORT}`);
});