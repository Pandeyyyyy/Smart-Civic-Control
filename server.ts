import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

// ── Resolve the project root (.env lives next to server.ts) ──────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the same directory as server.ts, with explicit path so it
// works regardless of the working directory from which the server is started.
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn('[Env] Could not parse .env file:', result.error.message);
  } else {
    console.log(`[Env] Loaded .env from ${envPath}`);
  }
} else {
  console.warn(
    `[Env] No .env file found at ${envPath}. ` +
    'Copy .env.example to .env and add your GEMINI_API_KEY.'
  );
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.resolve(__dirname, 'public')));

// Supported Civic Categories per Specification
const CIVIC_CATEGORIES = [
  'garbage_overflow',
  'pothole',
  'water_leakage',
  'broken_streetlight',
  'drainage_blockage',
  'illegal_dumping',
  'road_damage',
  'fallen_tree',
  'others',
] as const;

// ── Initialize Gemini Client with server-side API key ─────────────────────────
let geminiClient: GoogleGenAI | null = null;
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();

if (!geminiApiKey) {
  console.warn(
    '[AI Pipeline] GEMINI_API_KEY is not set. ' +
    'AI image validation will return an error. ' +
    'Add the key to your .env file and restart the server.'
  );
} else {
  try {
    geminiClient = new GoogleGenAI({ apiKey: geminiApiKey });
    console.log('[AI Pipeline] Gemini Multimodal SDK initialized. Key length:', geminiApiKey.length);
  } catch (e) {
    console.warn('[AI Pipeline] Could not initialize Gemini SDK:', e);
  }
}

/**
 * Cleanly formats API errors into concise, user-friendly sentences without raw JSON or exposed keys
 */
function formatUserFriendlyError(err: any): string {
  const rawMsg = typeof err?.message === 'string' ? err.message : '';
  const status = err?.status || err?.code;

  let innerMsg = '';
  try {
    const jsonMatch = rawMsg.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed?.error?.message) {
        innerMsg = parsed.error.message;
      }
    }
  } catch {
    // ignore parse error
  }

  const combined = `${rawMsg} ${innerMsg}`.toLowerCase();

  if (status === 429 || combined.includes('quota') || combined.includes('resource_exhausted')) {
    return 'Gemini API quota exceeded. Please wait a moment before uploading another image.';
  }
  if (
    status === 401 ||
    status === 403 ||
    combined.includes('api_key_invalid') ||
    combined.includes('permission_denied') ||
    combined.includes('unauthorized')
  ) {
    return 'Gemini API authentication failed. Please verify your GEMINI_API_KEY credentials.';
  }
  if (status === 404 || combined.includes('not found') || combined.includes('no longer available')) {
    return 'Configured Gemini vision model is currently unavailable. Please verify the model configuration.';
  }
  if (combined.includes('aborted') || combined.includes('timeout')) {
    return 'AI analysis timed out while processing image. Please try again with a smaller or clearer photo.';
  }
  if (combined.includes('network') || combined.includes('fetch failed') || combined.includes('econnrefused')) {
    return 'Network connection to Gemini AI service failed. Please check internet access and try again.';
  }

  return 'AI image analysis failed due to an unexpected service error. Please try uploading the image again.';
}

/**
 * Helper to call Gemini Vision with verified active models supporting generateContent with image input.
 */
async function callGeminiVision(
  client: GoogleGenAI,
  prompt: string,
  base64Data: string,
  mimeType: string
): Promise<{ responseText: string; modelUsed: string }> {
  // Use verified active multimodal vision models supporting generateContent with images.
  // process.env.GEMINI_MODEL can override if explicitly configured.
  const models = [
    process.env.GEMINI_MODEL,
    'gemini-3-flash-preview',
    'gemini-3.5-flash',
  ].filter(Boolean) as string[];

  const uniqueModels = Array.from(new Set(models));
  let lastError: any = null;

  for (const model of uniqueModels) {
    try {
      const response = await client.models.generateContent({
        model,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          abortSignal: AbortSignal.timeout(25000),
        },
      });
      return { responseText: response.text || '', modelUsed: model };
    } catch (err: any) {
      lastError = err;
      const isNotFound =
        err?.status === 404 ||
        err?.message?.includes('not found') ||
        err?.message?.includes('404') ||
        err?.message?.includes('no longer available');

      if (isNotFound && uniqueModels.indexOf(model) < uniqueModels.length - 1) {
        console.warn(`[AI Pipeline] Model ${model} unavailable (${err?.status || 404}), trying verified alternative...`);
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('No available Gemini model responded successfully.');
}

// ----------------------------------------------------
// 1. POST /api/ai/analyze-image
// Evaluates complaint image using real AI vision model
// Strict 3-step validation: Civic Problem Detection -> Location Visibility -> Classification
// ----------------------------------------------------
app.post('/api/ai/analyze-image', async (req, res) => {
  try {
    const { image, mimeType = 'image/jpeg' } = req.body || {};

    if (!image) {
      return res.status(400).json({
        validProblem: false,
        hasLocationContext: false,
        validationError: 'No image data provided for inference.',
        predictedCategory: 'others',
        confidence: 0,
        confidenceLevel: 'Low',
        topPredictions: [],
        isModelInstalled: Boolean(geminiClient),
        modelVersion: 'Gemini-Flash-CivicVision-v1.0',
        analysisSource: 'gemini_multimodal',
        explanation: 'Missing image payload.',
      });
    }

    let base64Data = '';
    let resolvedMimeType = mimeType || 'image/jpeg';

    // Handle URL images (e.g., Unsplash test images or remote photos)
    const cleanImgStr = typeof image === 'string' ? image.trim() : '';
    const isUrl =
      cleanImgStr.startsWith('http://') ||
      cleanImgStr.startsWith('https://') ||
      cleanImgStr.startsWith('//');

    if (isUrl) {
      const fetchUrl = cleanImgStr.startsWith('//') ? `https:${cleanImgStr}` : cleanImgStr;
      try {
        const imgFetch = await fetch(fetchUrl, { signal: AbortSignal.timeout(10000) });
        if (!imgFetch.ok) {
          throw new Error(`Failed to fetch image from URL: ${imgFetch.statusText}`);
        }
        const arrayBuffer = await imgFetch.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString('base64');
        const cType = imgFetch.headers.get('content-type');
        if (cType && cType.startsWith('image/')) {
          resolvedMimeType = cType.split(';')[0];
        }
      } catch (fetchErr: any) {
        console.warn('[AI Pipeline] Remote image fetch error:', fetchErr.message);
        return res.status(400).json({
          validProblem: false,
          hasLocationContext: false,
          validationError: 'Failed to download image from the provided URL. Please upload a photo directly.',
          predictedCategory: 'others',
          confidence: 0,
          confidenceLevel: 'Low',
          topPredictions: [],
          isModelInstalled: Boolean(geminiClient),
          modelVersion: 'Gemini-Flash-CivicVision-v1.0',
          analysisSource: 'gemini_multimodal',
          explanation: `URL download failure: ${fetchErr.message}`,
        });
      }
    } else {
      // It's a data URL or raw base64 string
      const match = cleanImgStr.match(/^data:([^;]+);base64,(.+)$/s);
      if (match) {
        resolvedMimeType = match[1];
        base64Data = match[2].trim();
      } else {
        base64Data = cleanImgStr.replace(/^data:[^;]+;base64,/s, '').trim();
      }
    }

    // Safety guard: Base64 data must never be empty or malformed
    if (!base64Data || base64Data.startsWith('http') || base64Data.includes('://')) {
      return res.status(400).json({
        validProblem: false,
        hasLocationContext: false,
        validationError: 'Invalid image format provided. Please upload a standard JPG, PNG, or WEBP photo.',
        predictedCategory: 'others',
        confidence: 0,
        confidenceLevel: 'Low',
        topPredictions: [],
        isModelInstalled: Boolean(geminiClient),
        modelVersion: 'Gemini-Flash-CivicVision-v1.0',
        analysisSource: 'gemini_multimodal',
        explanation: 'Malformed image data.',
      });
    }

    // If Gemini client is not configured, return explicit error notice (NEVER fake success)
    if (!geminiClient) {
      return res.status(503).json({
        validProblem: false,
        hasLocationContext: false,
        validationError: 'AI Analysis service unavailable: GEMINI_API_KEY is not configured on the server.',
        predictedCategory: 'others',
        confidence: 0,
        confidenceLevel: 'Low',
        topPredictions: [],
        isModelInstalled: false,
        modelVersion: 'Gemini-Flash-CivicVision-v1.0',
        analysisSource: 'gemini_multimodal',
        explanation: 'Server-side GEMINI_API_KEY environment variable is missing.',
      });
    }

    const prompt = `You are a real-time civic infrastructure computer vision validator and classifier for the Smart Civic Connect municipal complaint management system.
Evaluate the uploaded photograph according to strict municipal intake validation rules.

Follow this 3-step evaluation strictly based on the visual contents of the image:

--------------------------------------------------
STEP 1: CIVIC PROBLEM DETECTION
--------------------------------------------------
Determine if the photo visually shows a real, outdoor civic/municipal infrastructure problem from the following supported categories:
1. "garbage_overflow": Overflowing municipal trash cans, accumulated public street garbage, littered community bins.
2. "pothole": Asphalt road craters, pits, road surface holes dangerous to vehicles or pedestrians.
3. "road_damage": Broken footpath paver blocks, collapsed curbs, crumbling asphalt, unpaved utility trenches.
4. "water_leakage": Ruptured municipal potable water pipelines, leaking valves, submerged supply lines, clean water loss.
5. "broken_streetlight": Damaged street lighting fixtures, dead night lamps, hanging electrical wires, broken light poles.
6. "drainage_blockage": Blocked stormwater gutters, choked sewer manholes, stagnant monsoon wastewater, open sewage.
7. "illegal_dumping": Commercial construction debris, tiles, plaster rubble illegally dumped in public areas or road shoulders.
8. "fallen_tree": Tree branches obstructing roads, leaning hazardous trees, fallen trunks on paths or power lines.

MANDATORY REJECTION CRITERIA:
If the image shows ANY of the following:
- A selfie, human portrait, personal photo, face, or group photo
- An unrelated random object (e.g. food, clothes, shoes, laptop, phone, book, toy, desk, household item)
- A private indoor room (bedroom, living room, indoor kitchen, private bathroom, classroom, office)
- A vehicle or car with no civic infrastructure defect
- An animal or pet in a non-civic context
- A document, receipt, poster, artwork, meme, graphic design, or screenshot
- A blurry, dark, unidentifiable, or corrupted photo
THEN you MUST set:
"validProblem": false,
"hasLocationContext": false,
"rejectionReason": "Invalid image. Please upload a photo showing a civic problem.",
"category": "others",
"confidence": 0.0

--------------------------------------------------
STEP 2: LOCATION CONTEXT VISIBILITY
--------------------------------------------------
ONLY if Step 1 confirmed a valid civic problem:
Check if the image shows enough real-world outdoor environmental surroundings to show WHERE the problem is situated (e.g. visible road, street pavement, sidewalk, curb line, public area, building exterior, storefront, or landmark).
If the photo is an extreme closeup / macro shot showing only texture (such as a close-up of trash with zero surrounding pavement, ground or street visible, or a tight closeup of asphalt cracks with no street or surroundings visible) or has no visible surrounding context:
THEN you MUST set:
"validProblem": true,
"hasLocationContext": false,
"rejectionReason": "Image doesn't contain location. Please upload a photo showing the problem and its surroundings.",
"category": "others",
"confidence": 0.0

--------------------------------------------------
STEP 3: CLASSIFICATION & DESCRIPTION
--------------------------------------------------
ONLY if BOTH Step 1 (validProblem) AND Step 2 (hasLocationContext) are TRUE:
1. "validProblem": true
2. "hasLocationContext": true
3. "rejectionReason": null
4. "category": Strictly ONE of: ["garbage_overflow", "pothole", "road_damage", "water_leakage", "broken_streetlight", "drainage_blockage", "illegal_dumping", "fallen_tree"]
5. "confidence": A realistic number between 0.50 and 0.99 based on visual clarity and certainty.
6. "shortDescription": A concise 1-sentence description describing the specific problem and its visible surroundings (e.g., "Severe pothole on a two-lane asphalt road near the sidewalk curb.").
7. "topPredictions": An array of 2-3 category predictions with realistic probabilities.
8. "explanation": A brief 1-2 sentence technical explanation of the visual features observed.

Return ONLY a strict JSON object with this exact schema:
{
  "validProblem": boolean,
  "hasLocationContext": boolean,
  "rejectionReason": string | null,
  "category": "garbage_overflow" | "pothole" | "road_damage" | "water_leakage" | "broken_streetlight" | "drainage_blockage" | "illegal_dumping" | "fallen_tree" | "others",
  "confidence": number,
  "shortDescription": string,
  "topPredictions": [
    { "category": string, "confidence": number }
  ],
  "explanation": string
}`;

    const { responseText, modelUsed } = await callGeminiVision(
      geminiClient,
      prompt,
      base64Data,
      resolvedMimeType
    );

    let parsed: any;
    try {
      const cleaned = responseText
        .replace(/^```json\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.warn('[AI Pipeline] Failed to parse Gemini response as JSON:', responseText);
      return res.status(502).json({
        validProblem: false,
        hasLocationContext: false,
        validationError: 'AI response parsing failed. Please upload a clearer photo.',
        predictedCategory: 'others',
        confidence: 0,
        confidenceLevel: 'Low',
        topPredictions: [],
        isModelInstalled: true,
        modelVersion: modelUsed,
        analysisSource: 'gemini_multimodal',
        explanation: 'Could not parse visual inference results from AI model.',
      });
    }

    const validProblem = Boolean(parsed.validProblem ?? parsed.valid_civic_problem ?? false);
    const hasLocationContext = Boolean(
      parsed.hasLocationContext ?? parsed.has_location_context ?? false
    );

    let validationError: string | undefined = undefined;
    if (!validProblem) {
      validationError = 'Invalid image. Please upload a photo showing a civic problem.';
    } else if (!hasLocationContext) {
      validationError =
        "Image doesn't contain location. Please upload a photo showing the problem and its surroundings.";
    }

    let predictedCategory: (typeof CIVIC_CATEGORIES)[number] = 'others';
    if (validProblem && hasLocationContext) {
      const candidateCat = parsed.category || parsed.predicted_category;
      if (candidateCat && CIVIC_CATEGORIES.includes(candidateCat) && candidateCat !== 'others') {
        predictedCategory = candidateCat;
      }
    }

    const rawConf = typeof parsed.confidence === 'number' ? parsed.confidence : 0;
    const confidence =
      validProblem && hasLocationContext
        ? Math.min(0.99, Math.max(0.4, Number(rawConf.toFixed(2))))
        : 0;

    const confidenceLevel =
      confidence >= 0.8 ? 'High' : confidence >= 0.5 ? 'Medium' : 'Low';

    const shortDescription =
      validProblem && hasLocationContext
        ? parsed.shortDescription || parsed.short_description || ''
        : '';

    const topPredictions =
      validProblem &&
      hasLocationContext &&
      Array.isArray(parsed.topPredictions || parsed.top_predictions)
        ? parsed.topPredictions || parsed.top_predictions
        : validProblem && hasLocationContext
        ? [{ category: predictedCategory, confidence }]
        : [];

    return res.json({
      validProblem,
      hasLocationContext,
      validationError,
      predictedCategory,
      confidence,
      confidenceLevel,
      shortDescription,
      topPredictions,
      isModelInstalled: true,
      modelVersion: modelUsed,
      analysisSource: 'gemini_multimodal',
      explanation:
        parsed.explanation ||
        validationError ||
        'Visual inference complete with Gemini vision analysis.',
    });
  } catch (err: any) {
    const friendlyError = formatUserFriendlyError(err);
    console.error('[AI Pipeline Error]: Gemini inference failed:', friendlyError);
    return res.status(500).json({
      validProblem: false,
      hasLocationContext: false,
      validationError: friendlyError,
      predictedCategory: 'others',
      confidence: 0,
      confidenceLevel: 'Low',
      topPredictions: [],
      isModelInstalled: Boolean(geminiClient),
      modelVersion: 'Gemini-Flash-CivicVision-v1.0',
      analysisSource: 'gemini_multimodal',
      explanation: friendlyError,
    });
  }
});

// ----------------------------------------------------
// 2. Health check endpoint
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart Civic Connect',
    version: '1.0.0',
    modelInstalled: Boolean(geminiClient),
    environment: 'Dahisar R/North Demo Testbed',
    timestamp: new Date().toISOString(),
  });
});

// ----------------------------------------------------
// 3. Vite middleware for development & static for prod
// ----------------------------------------------------
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Smart Civic Connect] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
});
