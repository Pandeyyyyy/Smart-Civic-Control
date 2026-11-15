import { AIAnalysisResult, ComplaintCategory, PredictionScore } from '../types';

export const CIVIC_CATEGORIES: ComplaintCategory[] = [
  'garbage_overflow',
  'illegal_dumping',
  'pothole',
  'road_damage',
  'water_leakage',
  'broken_streetlight',
  'drainage_blockage',
  'fallen_tree',
  'others',
];

export const IMAGE_WEIGHT = 0.7;
export const TEXT_WEIGHT = 0.3;

/**
 * Client NLP classifier that evaluates problem descriptions & speech transcripts
 * using civic keyword weights and intent signals.
 */
export function analyzeTextDescription(text: string): {
  predictedCategory: ComplaintCategory;
  confidence: number;
  scores: Record<ComplaintCategory, number>;
} {
  const normalized = text.toLowerCase();
  if (!normalized || normalized.trim().length === 0) {
    return {
      predictedCategory: 'others',
      confidence: 0.1,
      scores: CIVIC_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat]: 0.1 }), {} as Record<ComplaintCategory, number>),
    };
  }

  const categoryKeywords: Record<ComplaintCategory, string[]> = {
    garbage_overflow: ['garbage', 'trash', 'dustbin', 'dumpster', 'waste', 'litter', 'smell', 'overflow', 'bin', 'rotten', 'kachra'],
    illegal_dumping: ['dumping', 'debris', 'rubble', 'malba', 'contractor', 'truck', 'illegal dump', 'construction waste', 'tiles', 'cement'],
    pothole: ['pothole', 'hole', 'crater', 'asphalt hole', 'bump', 'skid', 'two wheeler fell', 'gadda', 'road pit'],
    road_damage: ['broken road', 'footpath', 'paver', 'paver blocks', 'culvert', 'trench', 'cracked road', 'uneven surface', 'divider broken'],
    water_leakage: ['water leak', 'pipe burst', 'pipeline', 'pipeline leak', 'drinking water', 'tap leak', 'valve leak', 'submerged pipe', 'pani'],
    broken_streetlight: ['streetlight', 'street light', 'lamp', 'dark', 'bulb', 'light pole', 'sparking', 'electric wire', 'illumination', 'flickering'],
    drainage_blockage: ['drain', 'drainage', 'gutter', 'sewer', 'manhole', 'overflowing drain', 'stormwater', 'choked', 'nala', 'waterlogging'],
    fallen_tree: ['tree', 'branch', 'fallen branch', 'trunk', 'leaning tree', 'gulmohar', 'banyan', 'leaves blocking', 'pruning'],
    others: ['stray', 'noise', 'building', 'balcony', 'private', 'illegal parking', 'encroachment', 'stall'],
  };

  const rawScores: Record<ComplaintCategory, number> = {
    garbage_overflow: 0.05,
    illegal_dumping: 0.05,
    pothole: 0.05,
    road_damage: 0.05,
    water_leakage: 0.05,
    broken_streetlight: 0.05,
    drainage_blockage: 0.05,
    fallen_tree: 0.05,
    others: 0.05,
  };

  let totalHits = 0;
  for (const [cat, keywords] of Object.entries(categoryKeywords) as [ComplaintCategory, string[]][]) {
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        rawScores[cat] += 0.35;
        totalHits++;
      }
    }
  }

  // Softmax normalization
  const expScores = (Object.keys(rawScores) as ComplaintCategory[]).map((cat) => Math.exp(rawScores[cat]));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  const normalizedScores = {} as Record<ComplaintCategory, number>;
  (Object.keys(rawScores) as ComplaintCategory[]).forEach((cat, idx) => {
    normalizedScores[cat] = Number((expScores[idx] / sumExp).toFixed(4));
  });

  // Find top
  let topCategory: ComplaintCategory = 'others';
  let maxScore = -1;
  for (const cat of CIVIC_CATEGORIES) {
    if (normalizedScores[cat] > maxScore) {
      maxScore = normalizedScores[cat];
      topCategory = cat;
    }
  }

  // Determine realistic confidence based on keyword match strength
  let confidence = Math.min(0.96, Math.max(0.35, totalHits > 0 ? 0.65 + totalHits * 0.08 : 0.35));
  if (topCategory === 'others' && totalHits === 0) {
    confidence = 0.4;
  }

  return {
    predictedCategory: topCategory,
    confidence: Number(confidence.toFixed(2)),
    scores: normalizedScores,
  };
}

/**
 * Combines Image AI results with Description NLP results using:
 * IMAGE_WEIGHT = 0.70
 * TEXT_WEIGHT = 0.30
 */
export function combineMultimodalPredictions(
  imageResult: AIAnalysisResult | null,
  textResult: { predictedCategory: ComplaintCategory; confidence: number; scores: Record<ComplaintCategory, number> } | null
): {
  finalCategory: ComplaintCategory;
  finalConfidence: number;
  confidenceLevel: 'High' | 'Medium' | 'Low';
  requiresUserConfirmation: boolean;
  explanation: string;
} {
  // Only consider image result if it successfully passed civic problem & location validation
  const isImageValid = Boolean(imageResult && imageResult.validProblem && imageResult.hasLocationContext);
  const activeImage = isImageValid ? imageResult : null;

  if (!activeImage && !textResult) {
    return {
      finalCategory: 'others',
      finalConfidence: 0.3,
      confidenceLevel: 'Low',
      requiresUserConfirmation: true,
      explanation: 'No valid image or text data provided for AI evaluation.',
    };
  }

  if (!activeImage && textResult) {
    const level = textResult.confidence >= 0.8 ? 'High' : textResult.confidence >= 0.5 ? 'Medium' : 'Low';
    return {
      finalCategory: textResult.predictedCategory,
      finalConfidence: textResult.confidence,
      confidenceLevel: level,
      requiresUserConfirmation: textResult.confidence < 0.8,
      explanation: `Prediction derived from text description analysis (${Math.round(textResult.confidence * 100)}% confidence).`,
    };
  }

  if (activeImage && !textResult) {
    return {
      finalCategory: activeImage.predictedCategory,
      finalConfidence: activeImage.confidence,
      confidenceLevel: activeImage.confidenceLevel,
      requiresUserConfirmation: activeImage.confidenceLevel === 'Low',
      explanation: `Prediction derived from visual model inference (${Math.round(activeImage.confidence * 100)}% confidence).`,
    };
  }

  // Both valid image and text exist
  const imgCat = activeImage!.predictedCategory;
  const txtCat = textResult!.predictedCategory;

  const isAgreement = imgCat === txtCat;

  let combinedConfidence: number;
  let finalCat: ComplaintCategory;
  let requiresUserConfirmation = false;
  let explanation = '';

  if (isAgreement) {
    // Both modalities agree!
    combinedConfidence = Math.min(
      0.99,
      Number((activeImage!.confidence * IMAGE_WEIGHT + textResult!.confidence * TEXT_WEIGHT + 0.03).toFixed(2))
    );
    finalCat = imgCat;
    explanation = `High multimodal agreement: Both image analysis (${Math.round(activeImage!.confidence * 100)}%) and text description (${Math.round(textResult!.confidence * 100)}%) identify this issue.`;
  } else {
    // Modal disagreement
    const imgScore = activeImage!.confidence * IMAGE_WEIGHT;
    const txtScore = textResult!.confidence * TEXT_WEIGHT;

    if (imgScore >= txtScore) {
      finalCat = imgCat;
      combinedConfidence = Number((imgScore + (1 - IMAGE_WEIGHT) * 0.3).toFixed(2));
    } else {
      finalCat = txtCat;
      combinedConfidence = Number((txtScore + (1 - TEXT_WEIGHT) * 0.3).toFixed(2));
    }

    requiresUserConfirmation = true;
    explanation = `AI RESULT REQUIRES USER CONFIRMATION: Visual model predicted '${imgCat.replace('_', ' ')}' (${Math.round(activeImage!.confidence * 100)}%), while text description suggests '${txtCat.replace('_', ' ')}' (${Math.round(textResult!.confidence * 100)}%). Please verify the category.`;
  }

  const confidenceLevel = combinedConfidence >= 0.8 ? 'High' : combinedConfidence >= 0.5 ? 'Medium' : 'Low';
  if (confidenceLevel === 'Low') {
    requiresUserConfirmation = true;
  }

  return {
    finalCategory: finalCat,
    finalConfidence: combinedConfidence,
    confidenceLevel,
    requiresUserConfirmation,
    explanation,
  };
}

/**
 * Sends image to backend AI inference endpoint
 */
export async function analyzeImageWithBackend(
  fileOrBase64: File | string,
  fileName?: string
): Promise<AIAnalysisResult> {
  try {
    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (typeof fileOrBase64 === 'string') {
      base64Data = fileOrBase64;
    } else {
      mimeType = fileOrBase64.type || 'image/jpeg';
      base64Data = await fileToBase64(fileOrBase64);
    }

    const response = await fetch('/api/ai/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        mimeType,
        fileName: fileName || (typeof fileOrBase64 !== 'string' ? fileOrBase64.name : 'complaint.jpg'),
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        validProblem: false,
        hasLocationContext: false,
        validationError: data.validationError || data.error || 'AI Analysis service returned an error.',
        predictedCategory: 'others',
        confidence: 0,
        confidenceLevel: 'Low',
        topPredictions: [],
        isModelInstalled: Boolean(data.isModelInstalled),
        modelVersion: data.modelVersion || 'Gemini-Flash-CivicVision-v1.0',
        analysisSource: 'gemini_multimodal',
        explanation: data.explanation || data.error || 'Server error during image analysis.',
      };
    }

    return {
      validProblem: Boolean(data.validProblem),
      hasLocationContext: Boolean(data.hasLocationContext),
      validationError: data.validationError,
      userMessage: data.userMessage,
      shortDescription: data.shortDescription,
      predictedCategory: data.predictedCategory || 'others',
      confidence: typeof data.confidence === 'number' ? data.confidence : 0,
      confidenceLevel: data.confidenceLevel || 'Low',
      topPredictions: Array.isArray(data.topPredictions) ? data.topPredictions : [],
      isModelInstalled: Boolean(data.isModelInstalled),
      modelVersion: data.modelVersion || 'Gemini-Flash-CivicVision-v1.0',
      analysisSource: data.analysisSource || 'gemini_multimodal',
      explanation: data.explanation || '',
    };
  } catch (err: any) {
    console.warn('Real server inference error:', err);
    return {
      validProblem: false,
      hasLocationContext: false,
      validationError: 'Network error: Failed to reach AI analysis service. Please try again.',
      predictedCategory: 'others',
      confidence: 0,
      confidenceLevel: 'Low',
      topPredictions: [],
      isModelInstalled: false,
      modelVersion: 'Gemini-Flash-CivicVision-v1.0',
      analysisSource: 'gemini_multimodal',
      explanation: 'Network or connectivity error while reaching server AI endpoint.',
    };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
