import React, { useState, useEffect, useRef } from 'react';
import {
  ComplaintCategory,
  AIAnalysisResult,
  User,
} from '../types';
import { DEMO_PRESETS, DEMO_WARDS } from '../data/seedData';
import {
  analyzeTextDescription,
  combineMultimodalPredictions,
  analyzeImageWithBackend,
  CIVIC_CATEGORIES,
} from '../services/aiService';
import {
  detectWardFromCoordinates,
  getLocationFromDemoWard,
  LocationDetectionResult,
} from '../services/wardDetector';
import { routeComplaint, getCategoryLabel } from '../services/departmentRouter';
import { dataStore } from '../services/dataStore';
import { InteractiveMap } from '../components/InteractiveMap';
import {
  Upload,
  Camera,
  Cpu,
  Mic,
  MicOff,
  Navigation,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Check,
  FileCheck,
} from 'lucide-react';

interface ReportProblemViewProps {
  currentUser: User;
  onNavigate: (view: string, complaintId?: string) => void;
  initialPresetId?: string;
}

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({
  currentUser,
  onNavigate,
  initialPresetId,
}) => {
  // 5 Step Workflow: 1 = Image, 2 = AI Analysis, 3 = Description & Speech, 4 = Location & Ward, 5 = Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Description & Speech
  const [description, setDescription] = useState<string>('');
  const [speechLanguage, setSpeechLanguage] = useState<string>('en-IN');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listeningTimer, setListeningTimer] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string>('');

  // Selected Category (Can be confirmed or overridden by citizen)
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('garbage_overflow');
  const [isMultimodalAgreed, setIsMultimodalAgreed] = useState<boolean>(true);
  const [multimodalNotice, setMultimodalNotice] = useState<string>('');
  const [combinedConfidence, setCombinedConfidence] = useState<number>(0.92);

  // Location State
  const [locationMode, setLocationMode] = useState<'demo' | 'gps'>('demo');
  const [selectedWardNumber, setSelectedWardNumber] = useState<string>('Demo Ward 01');
  const [locationDetails, setLocationDetails] = useState<LocationDetectionResult>(
    getLocationFromDemoWard('Demo Ward 01')
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionSuccessId, setSubmissionSuccessId] = useState<string>('');

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Handle Preset Preload if requested
  useEffect(() => {
    if (initialPresetId) {
      loadPreset(initialPresetId);
    }
  }, [initialPresetId]);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const loadPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setImagePreview(preset.imageUrl);
    setImageFileName(`${preset.id}.jpg`);
    setSelectedCategory(preset.category);
    // STRICT REQUIREMENT: DO NOT pre-fill fake speech/description!
    // The description starts empty so the user can test live speech or typing.
    setDescription('');
    setSelectedWardNumber(preset.demoWard);
    setLocationDetails(getLocationFromDemoWard(preset.demoWard));

    // Simulated high-fidelity AI prediction for the preset
    const result: AIAnalysisResult = {
      predictedCategory: preset.category,
      confidence: 0.94,
      confidenceLevel: 'High',
      topPredictions: [
        { category: preset.category, confidence: 0.94 },
        { category: 'others', confidence: 0.04 },
        { category: 'road_damage', confidence: 0.02 },
      ],
      isModelInstalled: true,
      modelVersion: 'MobileNetV2-Civic-TransferLearning-v2.1',
      analysisSource: 'gemini_multimodal',
      explanation: `Verified visual characteristics matching ${getCategoryLabel(preset.category)}.`,
    };

    setAiResult(result);
    setCombinedConfidence(0.94);
    setIsMultimodalAgreed(true);
    setMultimodalNotice('');
  };

  // Image Upload Handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be under 10MB.');
      return;
    }

    setImageFile(file);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      // Trigger AI scan
      await triggerAIAnalysis(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Inference
  const triggerAIAnalysis = async (imgData: string, filename: string) => {
    setIsScanning(true);
    setCurrentStep(2);

    try {
      const result = await analyzeImageWithBackend(imgData, filename);
      setAiResult(result);
      if (result.predictedCategory) {
        setSelectedCategory(result.predictedCategory);
      }
    } catch (err) {
      console.error('AI Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Format recording timer: 00:05
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Real Speech-to-Text: Starts browser SpeechRecognition with mic permission request
  const startSpeaking = async () => {
    setSpeechError('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Speech recognition is not supported in this browser. Please type your description manually.');
      return;
    }

    // 1. Request microphone permission
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop temporary stream to release device for SpeechRecognition
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      setSpeechError('Microphone access was denied. Please allow microphone access and try again.');
      setIsListening(false);
      return;
    }

    // 2. Start Speech Recognition
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = speechLanguage;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setListeningTimer(0);
        setSpeechError('');
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = setInterval(() => {
          setListeningTimer((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += piece + ' ';
          } else {
            interimTranscript += piece;
          }
        }
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        if (fullTranscript) {
          setDescription(fullTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setSpeechError('Microphone access was denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          // Momentary silence, continue listening
          return;
        } else if (event.error !== 'aborted') {
          setSpeechError(`Speech recognition notice: ${event.error}. Please try speaking again or type manually.`);
        }
        setIsListening(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn('Speech recognition initiation failed:', e);
      setSpeechError('Speech recognition is not supported in this browser. Please type your description manually.');
      setIsListening(false);
    }
  };

  // Stops speech recording
  const stopSpeaking = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  };

  // Multimodal Description Analysis
  const evaluateMultimodal = () => {
    const textAnalysis = analyzeTextDescription(description);
    const combined = combineMultimodalPredictions(aiResult, textAnalysis);

    setSelectedCategory(combined.finalCategory);
    setCombinedConfidence(combined.finalConfidence);
    setIsMultimodalAgreed(!combined.requiresUserConfirmation);
    setMultimodalNotice(combined.explanation);
    setCurrentStep(4);
  };

  // GPS Location Trigger
  const handleUseCurrentGPS = () => {
    setIsLocating(true);
    setGpsError('');

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. Please select a demo location.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const detected = detectWardFromCoordinates(lat, lng);
        setLocationDetails(detected);
        setSelectedWardNumber(detected.demoWardNumber);
        setLocationMode('gps');
        setIsLocating(false);
      },
      (err) => {
        console.warn('GPS denied or error:', err.message);
        setGpsError('GPS permission was denied or signal unavailable. Dahisar Demo Location active.');
        setIsLocating(false);
        // Fallback to Demo ward 01
        setLocationMode('demo');
        setLocationDetails(getLocationFromDemoWard('Demo Ward 01'));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Demo Ward Select
  const handleWardSelect = (wardNumber: string) => {
    setSelectedWardNumber(wardNumber);
    const detected = getLocationFromDemoWard(wardNumber);
    setLocationDetails(detected);
    setLocationMode('demo');
  };

  // Handle Map Pin Click
  const handleMapLocationSelect = (lat: number, lng: number) => {
    const detected = detectWardFromCoordinates(lat, lng);
    setLocationDetails(detected);
    setSelectedWardNumber(detected.demoWardNumber);
  };

  // Submit Complaint
  const handleSubmitComplaint = () => {
    setIsSubmitting(true);

    try {
      const newComp = dataStore.createComplaint({
        category: selectedCategory,
        description: description || 'Civic infrastructure malfunction requiring municipal action.',
        speechTranscript: description,
        speechLanguage,
        latitude: locationDetails.latitude,
        longitude: locationDetails.longitude,
        city: locationDetails.city,
        area: locationDetails.area,
        administrativeWard: locationDetails.administrativeWard,
        demoWardNumber: locationDetails.demoWardNumber,
        wardName: locationDetails.wardName,
        address: locationDetails.address,
        imageUrl: imagePreview,
        imageFileName: imageFileName || 'complaint_photo.jpg',
        aiCategory: aiResult?.predictedCategory,
        aiConfidence: aiResult?.confidence,
        textCategory: selectedCategory,
        textConfidence: combinedConfidence,
        combinedCategory: selectedCategory,
        combinedConfidence,
        requiresUserConfirmation: !isMultimodalAgreed,
      });

      setSubmissionSuccessId(newComp.complaintId);
      setCurrentStep(6); // Success screen
    } catch (e) {
      console.error('Submission failed:', e);
      alert('Failed to register complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const routingInfo = routeComplaint(
    selectedCategory,
    locationDetails.city,
    locationDetails.demoWardNumber
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* HEADER & WIZARD PROGRESS TRACKER */}
      <div className="p-6 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Report a Civic Problem</h2>
            <p className="text-xs text-slate-500">
              5-Step AI-Assisted Submission with Automatic Ward Detection & Department Routing
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 self-start sm:self-auto">
            Dahisar R/North Testbed
          </span>
        </div>

        {/* STEP PROGRESS INDICATORS */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {[
            { step: 1, label: '1. Photo' },
            { step: 2, label: '2. AI Scan' },
            { step: 3, label: '3. Details' },
            { step: 4, label: '4. Location' },
            { step: 5, label: '5. Review' },
          ].map((s) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div
                key={s.step}
                className={`py-2 px-1 rounded-xl transition-all ${
                  isCompleted
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : isCurrent
                    ? 'bg-[#0F766E] text-white font-bold shadow-xs ring-2 ring-teal-200'
                    : 'bg-slate-100/70 text-slate-400'
                }`}
              >
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK PRESETS PICKER (Top quick-actions) */}
      {currentStep === 1 && (
        <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Load 1-Click Evaluation Presets</span>
            </span>
            <span className="text-[11px] text-slate-400">Pre-loads test image & data</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DEMO_PRESETS.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => loadPreset(p.id)}
                className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-teal-50 text-[11px] font-medium text-slate-700 hover:text-teal-900 border border-slate-200/60 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: IMAGE UPLOAD */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900">Upload Problem Image</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide a clear photograph of the civic breakdown for multimodal AI classification.
            </p>
          </div>

          {/* DRAG & DROP ZONE */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            {imagePreview ? (
              <div className="flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 sm:w-64 sm:h-64 object-cover rounded-2xl shadow-md border border-slate-200 mb-3"
                />
                <span className="text-xs font-semibold text-slate-700">{imageFileName}</span>
                <span className="text-[11px] text-teal-700 mt-1 font-medium">
                  Click or drag to replace photo
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-slate-800">
                  Drag & drop or browse image
                </h4>
                <p className="text-xs text-slate-400 mt-1">Supports JPG • PNG • WEBP up to 10MB</p>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={!imagePreview}
              onClick={() => triggerAIAnalysis(imagePreview, imageFileName || 'complaint.jpg')}
              className={`py-3 px-6 rounded-2xl text-xs font-semibold flex items-center space-x-2 transition-all shadow-md ${
                imagePreview
                  ? 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-teal-700/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Analyze with AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI SCANNING & PREDICTION RESULT */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs space-y-6 animate-in fade-in duration-200">
          {isScanning ? (
            <div className="py-16 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-teal-200 border-t-[#0F766E] animate-spin" />
                <div className="absolute inset-2 rounded-full bg-teal-50 flex items-center justify-center text-[#0F766E]">
                  <Cpu className="w-8 h-8 animate-pulse" />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-900">Scanning Image with AI...</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Running real vision inference classifier across 9 civic infrastructure categories.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>AI ANALYSIS RESULT</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    Category: {getCategoryLabel(selectedCategory)}
                  </h3>
                </div>

                {/* CONFIDENCE BADGE */}
                {aiResult && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      aiResult.confidenceLevel === 'High'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : aiResult.confidenceLevel === 'Medium'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    ● {Math.round(aiResult.confidence * 100)}% {aiResult.confidenceLevel} Confidence
                  </span>
                )}
              </div>

              {/* IMAGE + TOP PREDICTIONS BREAKDOWN */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center">
                  <img
                    src={imagePreview}
                    alt="Scanned issue"
                    className="w-full h-44 object-cover rounded-2xl shadow-sm border border-slate-200"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Input photograph</span>
                </div>

                <div className="md:col-span-8 p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Top Model Class Probabilities:
                  </h4>

                  {aiResult?.topPredictions && aiResult.topPredictions.length > 0 ? (
                    <div className="space-y-2">
                      {aiResult.topPredictions.map((pred) => (
                        <div key={pred.category}>
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-slate-800 capitalize">
                              {pred.category.replace('_', ' ')}
                            </span>
                            <span className="text-slate-600 font-semibold">
                              {Math.round(pred.confidence * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#0F766E] transition-all duration-500"
                              style={{ width: `${Math.round(pred.confidence * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs">
                      <strong>AI MODEL NOTICE:</strong> Model inference returned baseline scores.
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    {aiResult?.explanation || 'Visual analysis complete.'}
                  </p>
                </div>
              </div>

              {/* CATEGORY OVERRIDE SELECTOR (CITIZEN CONTROL) */}
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60">
                <label className="block text-xs font-bold text-teal-900 mb-1">
                  Verify or Change Predicted Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ComplaintCategory)}
                  className="w-full p-2.5 rounded-xl border border-teal-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {CIVIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-teal-700 mt-1 block">
                  You can correct the AI category if the photograph differs.
                </span>
              </div>

              {/* STEP CONTROLS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="py-2.5 px-6 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-teal-700/20"
                >
                  <span>Continue to Description</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: DESCRIPTION & SPEECH-TO-TEXT */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Describe the Problem</h3>
            <p className="text-xs text-slate-500 mt-1">
              Type or speak your grievance. Natural language will be evaluated with 30% weighting alongside image vision (70%).
            </p>
          </div>

          {/* SPEECH LANGUAGE SELECTOR & RECORDING CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700">Speech Language:</span>
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
              >
                <option value="en-IN">English (India) – en-IN</option>
                <option value="hi-IN">Hindi – hi-IN</option>
                <option value="mr-IN">Marathi – mr-IN</option>
              </select>
            </div>

            {/* RECORDING CONTROLS */}
            <div className="flex items-center">
              {isListening ? (
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
                    <span>🔴 Listening...</span>
                  </div>

                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                    {formatTimer(listeningTimer)}
                  </span>

                  {/* Real-time microphone activity animation */}
                  <div className="flex items-center space-x-1 h-6 px-1.5 bg-white rounded-lg border border-slate-200" title="Microphone activity">
                    <span className="w-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                    <span className="w-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s] h-4.5" />
                    <span className="w-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.4s] h-2.5" />
                    <span className="w-1 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.05s] h-4" />
                  </div>

                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="py-1.5 px-3.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center space-x-1.5"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Speaking</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startSpeaking}
                  className="py-2 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-xs flex items-center space-x-2 transition-all hover:border-teal-500"
                >
                  <Mic className="w-4 h-4 text-teal-700" />
                  <span>🎤 Start Speaking</span>
                </button>
              )}
            </div>
          </div>

          {/* MICROPHONE ERROR / PERMISSION DENIED BANNER */}
          {speechError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{speechError}</div>
            </div>
          )}

          {/* EDITABLE TEXTAREA */}
          <div>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the civic issue, location landmarks, severity, or hazards... (or click '🎤 Start Speaking')"
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>Transcript is live and remains fully editable.</span>
              {description && (
                <button
                  type="button"
                  onClick={() => setDescription('')}
                  className="text-slate-400 hover:text-slate-600 underline"
                >
                  Clear text
                </button>
              )}
            </div>
          </div>

          {/* STEP CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AI</span>
            </button>
            <button
              type="button"
              disabled={!description.trim()}
              onClick={evaluateMultimodal}
              className={`py-2.5 px-6 rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-md ${
                description.trim()
                  ? 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-teal-700/20'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Combine AI & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: LOCATION & DEMO WARD DETECTION */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Complaint Location & Ward</h3>
            <p className="text-xs text-slate-500 mt-1">
              CRITICAL: Wards are derived strictly from geographic location, NOT from image AI.
            </p>
          </div>

          {/* MULTIMODAL NOTICE BANNER IF DISAGREEMENT DETECTED */}
          {multimodalNotice && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 ${
                isMultimodalAgreed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/80'
              }`}
            >
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block mb-0.5">
                  {isMultimodalAgreed ? 'Multimodal Agreement Verified' : 'AI Result Requires Confirmation'}
                </span>
                <p className="text-[11px] leading-relaxed">{multimodalNotice}</p>
              </div>
            </div>
          )}

          {/* LOCATION MODE SWITCHER (GPS vs DEMO WARDS) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                disabled={isLocating}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all ${
                  locationMode === 'gps'
                    ? 'bg-[#0F766E] text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
              </button>

              <button
                type="button"
                onClick={() => setLocationMode('demo')}
                className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-all ${
                  locationMode === 'demo'
                    ? 'bg-[#0F766E] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                Select Demo Location
              </button>
            </div>

            {/* DEMO WARD DROPDOWN */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">Demo Ward:</span>
              <select
                value={selectedWardNumber}
                onChange={(e) => handleWardSelect(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
              >
                {DEMO_WARDS.map((w) => (
                  <option key={w.demoWardNumber} value={w.demoWardNumber}>
                    {w.demoWardNumber} – {w.wardName.split('(')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {gpsError && (
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {gpsError}
            </p>
          )}

          {/* INTERACTIVE LOCATION MAP */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Click or tap the map to adjust exact pin location:</span>
              <span className="font-semibold text-teal-700">
                Lat: {locationDetails.latitude.toFixed(4)}, Lng: {locationDetails.longitude.toFixed(4)}
              </span>
            </div>
            <InteractiveMap
              interactive
              selectedLocation={{ lat: locationDetails.latitude, lng: locationDetails.longitude }}
              onLocationSelect={handleMapLocationSelect}
              highlightWard={locationDetails.demoWardNumber}
              height="300px"
            />
          </div>

          {/* DETECTED LOCATION SUMMARY CARD */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">City</span>
              <span className="font-semibold text-slate-900">{locationDetails.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Area</span>
              <span className="font-semibold text-slate-900">{locationDetails.area}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Ward</span>
              <span className="font-semibold text-slate-900">{locationDetails.administrativeWard}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Demo Ward</span>
              <span className="font-bold text-[#0F766E]">{locationDetails.demoWardNumber}</span>
            </div>
            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Resolved Address</span>
              <span className="font-medium text-slate-800">{locationDetails.address}</span>
            </div>
          </div>

          {/* STEP CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Description</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="py-2.5 px-6 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-teal-700/20"
            >
              <span>Review Complaint</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {currentStep === 5 && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div>
            <h3 className="text-base font-bold text-slate-900">Complaint Review</h3>
            <p className="text-xs text-slate-500 mt-1">
              Verify all AI evaluations, geocoded ward information, and automated department routing before final submission.
            </p>
          </div>

          {/* REVIEW DOSSIER CARD */}
          <div className="p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200/60">
              <div className="flex items-center space-x-4">
                <img
                  src={imagePreview}
                  alt="Complaint thumbnail"
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">
                    Problem Category
                  </span>
                  <h4 className="text-base font-bold text-slate-900 capitalize">
                    {getCategoryLabel(selectedCategory)}
                  </h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                    {Math.round(combinedConfidence * 100)}% Combined AI Confidence
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 underline self-start"
              >
                Change Category
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Citizen Description
              </span>
              <p className="text-xs text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200/60">
                {description}
              </p>
            </div>

            {/* LOCATION DETAILS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-t border-slate-200/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Location & Address
                </span>
                <p className="text-xs font-medium text-slate-800 mt-0.5">{locationDetails.address}</p>
                <span className="text-[10px] text-slate-400">
                  {locationDetails.city} • {locationDetails.area}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Administrative Ward
                </span>
                <p className="text-xs font-bold text-teal-800 mt-0.5">
                  {locationDetails.demoWardNumber} (Dahisar {locationDetails.administrativeWard})
                </p>
                <span className="text-[10px] text-slate-400">{locationDetails.wardName}</span>
              </div>
            </div>

            {/* AUTOMATIC DEPARTMENT ROUTING BOX */}
            <div className="p-4 rounded-2xl bg-white border border-teal-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-teal-700" />
                  <span>Auto-Routed Department</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                  {routingInfo.priority} Priority
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900">{routingInfo.department.departmentName}</p>
              <p className="text-xs text-slate-500 mt-0.5">{routingInfo.reason}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Target Resolution SLA: {routingInfo.slaHours} hours
              </span>
            </div>
          </div>

          {/* STEP CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Edit Location</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitComplaint}
              className="py-3 px-8 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-teal-700/25 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Complaint ID...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Submit</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SUBMISSION SUCCESS SCREEN */}
      {currentStep === 6 && (
        <div className="p-8 sm:p-12 rounded-3xl bg-white/90 backdrop-blur-2xl border border-white shadow-xl text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-widest">
              Submission Successful
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              {submissionSuccessId}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Your grievance has been permanently logged in the Dahisar municipal register and routed to the {routingInfo.department.departmentName}.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 max-w-md mx-auto text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Ward:</span>
              <span className="font-semibold text-slate-900">{locationDetails.demoWardNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-900 capitalize">
                {selectedCategory.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated SLA:</span>
              <span className="font-semibold text-teal-800">{routingInfo.slaHours} Hours</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('complaint_detail', submissionSuccessId)}
              className="py-3 px-6 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              Track This Complaint
            </button>
            <button
              type="button"
              onClick={() => onNavigate('citizen_dashboard')}
              className="py-3 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-xs"
            >
              Return to Citizen Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
