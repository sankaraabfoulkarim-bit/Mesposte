import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser for JSON with ample limit for image base64
app.use(express.json({ limit: '25mb' }));

// Lazy/Shared Gemini client initialization
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 1. AI Copywriting Endpoint (Gemini 3.7 Flash)
app.post('/api/gemini/copywrite', async (req, res) => {
  try {
    const {
      productName,
      price,
      currency = 'FCFA',
      details = '',
      tone = 'urgent', // 'urgent' | 'chic' | 'friendly' | 'storytelling' | 'whatsapp'
      boutiqueName = 'Ma Boutique',
      boutiquePhone = '',
      targetPlatform = 'all', // 'whatsapp' | 'instagram' | 'facebook' | 'all'
    } = req.body;

    if (!productName) {
      return res.status(400).json({ error: 'Product name is required.' });
    }

    const ai = getGeminiClient();

    const systemInstruction = `Tu es une experte d'élite en copywriting e-commerce et en vente sur les réseaux sociaux (WhatsApp, Instagram, Facebook, TikTok) pour les créatrices et vendeuses indépendantes.
Ta mission est de rédiger des textes de vente irrésistibles, ultra-persuasifs et adaptés aux habitudes d'achat sur mobile (Afrique francophone, France, monde francophone).

Règles impératives :
- Formats ultra-visuels et faciles à lire sur smartphone (utilisation judicieuse d'emojis pertinents, puces claires, espaces aérés).
- Accroches percutantes (Hooks) qui captent l'attention en 1 seconde.
- Mise en avant forte de la valeur, de la rareté/urgence et de la qualité.
- Appel à l'action (CTA) clair avec le prix (${price} ${currency}) et le contact WhatsApp direct (${boutiquePhone || 'en DM / WhatsApp'}).
- Rédige en français avec des expressions vendeuses naturelles et chaleureuses.`;

    const prompt = `Génère un pack complet de copywriting pour ce produit :
- Nom du produit : ${productName}
- Prix : ${price} ${currency}
- Détails / Avantage / Promo : ${details || 'Qualité supérieure, disponible immédiatement en stock'}
- Ton souhaité : ${tone} (urgent = promo flash/stock limité, chic = luxe/élégance/haut de gamme, friendly = chaleureux/proche des clientes, storytelling = émotion et transformation, whatsapp = format direct optimisé pour statut WhatsApp)
- Nom de la boutique : ${boutiqueName}
- Contact WhatsApp : ${boutiquePhone || '+221 77 000 00 00'}

Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte :
{
  "whatsappStatus": "Texte court et percutant parfait pour un statut WhatsApp ou story avec emojis, prix et CTA clair",
  "whatsappDirectMessage": "Message complet pour groupe ou message privé WhatsApp avec puces détaillées, avantages, prix et instructions de commande",
  "instagramFacebookPost": "Texte complet pour publication Instagram/Facebook avec accroche puissante, storytelling, détails produit, CTA et liste de 10 hashtags viraux ciblés",
  "shortCatchphrase": "Une phrase d'accroche coup de poing (Hook) de moins de 10 mots",
  "urgencyHook": "Phrase créant l'urgence d'achat (ex: Seulement 5 pièces restantes !)",
  "benefitsList": ["Avantage clé 1", "Avantage clé 2", "Avantage clé 3"],
  "voiceoverScript": "Un script fluide et rythmé de 15 à 25 secondes idéal pour une voix-off de vidéo promotionnelle ou de reel"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback extraction
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: 'Parsing failed' };
    }

    return res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Error generating copywriting:', error);
    return res.status(500).json({
      error: error.message || 'Erreur lors de la génération du texte IA.',
    });
  }
});

// 2. AI Product Image Visual Analysis (Gemini 3.7 Flash Multimodal)
app.post('/api/gemini/analyze-product', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required.' });
    }

    const ai = getGeminiClient();

    // Clean base64 header if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    const imagePart = {
      inlineData: {
        mimeType,
        data: cleanBase64,
      },
    };

    const textPart = {
      text: `Analyse cette photo de produit pour une vendeuse e-commerce / WhatsApp.
Identifie le produit et fournis des suggestions précises de vente.
Retourne UNIQUEMENT un objet JSON valide avec cette structure :
{
  "detectedName": "Nom commercial élégant du produit (ex: Sac à Main en Cuir Matelassé Noir)",
  "category": "Catégorie (Mode, Beauté, Chaussures, Bijoux, Électronique, Maison, etc.)",
  "keyHighlights": ["Caractéristique 1", "Caractéristique 2", "Caractéristique 3"],
  "suggestedPriceRange": "Fourchette de prix suggérée (ex: 15 000 - 25 000 FCFA)",
  "recommendedStudioBackground": "Description du meilleur décor d'arrière-plan (ex: Marbre blanc et touches dorées avec éclairage studio chaud)",
  "suggestedTone": "urgent" | "chic" | "friendly",
  "colorPalette": ["#Hex1", "#Hex2", "#Hex3"]
}`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : {};
    }

    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing product image:', error);
    return res.status(500).json({
      error: error.message || "Erreur lors de l'analyse visuelle du produit.",
    });
  }
});

// 3. AI Text-To-Speech (Gemini TTS API)
app.post('/api/gemini/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    const ai = getGeminiClient();

    // Voice options: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
    const validVoices = ['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'];
    const chosenVoice = validVoices.includes(voiceName) ? voiceName : 'Kore';

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [
        {
          parts: [
            {
              text: `Dis avec enthousiasme, clarté et un ton commercial vendeur chaleureux le texte promotionnel suivant : "${text}"`,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: chosenVoice },
          },
        },
      },
    });

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Audio) {
      return res.json({
        success: true,
        audioBase64: base64Audio,
        mimeType: 'audio/pcm;rate=24000',
      });
    }

    return res.json({
      success: false,
      message: 'No direct audio output, client fallback recommended.',
    });
  } catch (error: any) {
    console.warn('Gemini TTS error (will use client audio synthesizer):', error?.message);
    return res.json({
      success: false,
      fallbackRequired: true,
      error: error?.message,
    });
  }
});

// 4. Vite and static file serving setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VendeusePro AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
