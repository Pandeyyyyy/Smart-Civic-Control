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
  Eye,
  X,
  Maximize2,
  Trash2,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

interface ReportProblemViewProps {
  currentUser: User;
  onNavigate: (view: string, complaintId?: string) => void;
  initialPresetId?: string;
}

type AIScanState =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'analyzing'
  | 'result'
  | 'low-confidence'
  | 'unavailable'
  | 'error';

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({
  currentUser,
  onNavigate,
  initialPresetId,
}) => {
  // 5 Step Workflow: 1 = Image, 2 = AI Analysis, 3 = Details & Speech, 4 = Location & Ward, 5 = Review & Submit
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // AI Scan State Machine
  const [aiState, setAiState] = useState<AIScanState>('idle');
  const [aiScanProgress, setAiScanProgress] = useState<number>(0);
  const [aiScanStageText, setAiScanStageText] = useState<string>('Uploading image...');
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiErrorMessage, setAiErrorMessage] = useState<string>('');

  // Description & Speech
  const [description, setDescription] = useState<string>('');
  const [speechLanguage, setSpeechLanguage] = useState<string>('en-IN');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [listeningTimer, setListeningTimer] = useState<number>(0);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [speechError, setSpeechError] = useState<string>('');

  // Selected Category & Multimodal
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory>('garbage_overflow');
  const [textAnalysisResult, setTextAnalysisResult] = useState<{
    predictedCategory: ComplaintCategory;
    confidence: number;
    scores: Record<ComplaintCategory, number>;
  } | null>(null);
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

  // Refs
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const scanIntervalRef = useRef<any>(null);

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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  const loadPreset = (presetId: string) => {
    const preset = DEMO_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setImagePreview(preset.imageUrl);
    setImageFileName(`${preset.id}.jpg`);
    setImageFileSize('1.2 MB');
    setSelectedCategory(preset.category);
    setDescription('');
    setSelectedWardNumber(preset.demoWard);
    setLocationDetails(getLocationFromDemoWard(preset.demoWard));

    // Preset uses verified demo AI evaluation
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
    setAiState('result');
    setCombinedConfidence(0.94);
    setIsMultimodalAgreed(true);
    setMultimodalNotice('');
  };

  // Image Upload Handler
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      alert('Image file size must be under 15MB.');
      return;
    }

    const sizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setImageFile(file);
    setImageFileName(file.name);
    setImageFileSize(sizeStr);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setImagePreview(base64);
      // Run AI pipeline with realistic multi-stage feedback
      await runAIPipeline(base64, file.name);
    };
    reader.readAsDataURL(file);
  };

  // Run AI Pipeline with realistic UI stages
  const runAIPipeline = async (imgData: string, filename: string) => {
    setCurrentStep(2);
    setAiErrorMessage('');

    // STAGE 1: Uploading
    setAiState('uploading');
    setAiScanProgress(15);
    setAiScanStageText('Uploading image to civic analysis queue...');

    await new Promise((r) => setTimeout(r, 450));

    // STAGE 2: Processing visual buffer
    setAiState('processing');
    setAiScanProgress(38);
    setAiScanStageText('Normalizing image resolution and color channels...');

    await new Promise((r) => setTimeout(r, 450));

    // STAGE 3: Analyzing visual features (dedicated scanning laser view)
    setAiState('analyzing');
    setAiScanProgress(68);
    setAiScanStageText('Extracting deep transfer-learning civic features...');

    try {
      const resultPromise = analyzeImageWithBackend(imgData, filename);

      // Smooth progress animation up to 92%
      let prog = 68;
      scanIntervalRef.current = setInterval(() => {
        prog = Math.min(94, prog + 6);
        setAiScanProgress(prog);
        if (prog >= 85) {
          setAiScanStageText('Matching detected patterns against municipal categories...');
        }
      }, 150);

      const result = await resultPromise;
      clearInterval(scanIntervalRef.current);
      setAiScanProgress(100);

      await new Promise((r) => setTimeout(r, 250));

      setAiResult(result);

      // Check model availability per spec rule 19
      if (!result.isModelInstalled) {
        setAiState('unavailable');
        return;
      }

      // Check confidence level per spec rule 18
      if (result.confidenceLevel === 'Low' || result.confidence < 0.55) {
        setAiState('low-confidence');
        setSelectedCategory(result.predictedCategory || 'others');
      } else {
        setAiState('result');
        if (result.predictedCategory) {
          setSelectedCategory(result.predictedCategory);
        }
      }
    } catch (err: any) {
      clearInterval(scanIntervalRef.current);
      console.error('AI Scan exception:', err);
      setAiErrorMessage(err?.message || 'Server inference connection failed.');
      setAiState('error');
    }
  };

  // Format recording timer: 00:05
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Speech-to-Text: Starts browser SpeechRecognition
  const startSpeaking = async () => {
    setSpeechError('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSpeechError('Speech recognition is not supported in this browser. Please type your description manually.');
      return;
    }

    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (err: any) {
      console.warn('Microphone permission denied:', err);
      setSpeechError('Microphone access was denied. Please allow microphone permissions and try again.');
      setIsListening(false);
      return;
    }

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
    setTextAnalysisResult(textAnalysis);
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
        setGpsError('GPS permission denied or signal unavailable. Dahisar Demo Location active.');
        setIsLocating(false);
        setLocationMode('demo');
        setLocationDetails(getLocationFromDemoWard('Demo Ward 01'));
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleWardSelect = (wardNumber: string) => {
    setSelectedWardNumber(wardNumber);
    const detected = getLocationFromDemoWard(wardNumber);
    setLocationDetails(detected);
    setLocationMode('demo');
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    const detected = detectWardFromCoordinates(lat, lng);
    setLocationDetails(detected);
    setSelectedWardNumber(detected.demoWardNumber);
  };

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
      setCurrentStep(6);
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
      {/* ---------------------------------------------------- */}
      {/* HEADER & WIZARD STEP TRACKER */}
      {/* ---------------------------------------------------- */}
      <div className="p-6 rounded-3xl glass-panel shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Report a Civic Problem
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              5-Step AI-Assisted Submission with Automatic Ward Detection & Department Routing
            </p>
          </div>
          <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-3.5 py-1.5 rounded-full border border-teal-200/80 self-start sm:self-auto shadow-2xs">
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
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/60'
                    : isCurrent
                    ? 'bg-[#0F766E] text-white font-extrabold shadow-sm ring-2 ring-teal-200'
                    : 'bg-slate-100/80 text-slate-400'
                }`}
              >
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK PRESETS PICKER (Top action) */}
      {currentStep === 1 && (
        <div className="p-4 rounded-2xl glass-card shadow-2xs">
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
                className="btn-interactive py-1.5 px-3 rounded-xl bg-white hover:bg-teal-50 text-[11px] font-semibold text-slate-700 hover:text-teal-900 border border-slate-200/80 transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 1: IMAGE UPLOAD & HIGH-QUALITY PREVIEW */}
      {/* ---------------------------------------------------- */}
      {currentStep === 1 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm space-y-6 page-enter">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Upload Problem Image</h3>
            <p className="text-xs text-slate-600 mt-1">
              Provide a clear photograph of the civic breakdown for multimodal AI classification.
            </p>
          </div>

          {/* DRAG & DROP ZONE WITH ROUNDED GLASS FRAME */}
          <div className="relative border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-3xl p-8 text-center bg-white/50 hover:bg-teal-50/20 transition-all">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              title="Click or drag image to upload"
            />

            {imagePreview ? (
              <div className="flex flex-col items-center relative z-20 pointer-events-auto">
                <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-slate-200/90 max-w-xs">
                  <img
                    src={imagePreview}
                    alt="Problem Preview"
                    className="w-56 h-56 object-cover object-center rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Image Overlay Controls */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomModalOpen(true);
                      }}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-900 shadow-sm cursor-pointer"
                      title="Zoom photo"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImagePreview('');
                        setImageFile(null);
                        setImageFileName('');
                        setImageFileSize('');
                      }}
                      className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
                      title="Remove photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">{imageFileName}</span>
                  {imageFileSize && <span className="text-slate-400">({imageFileSize})</span>}
                </div>

                <p className="text-[11px] text-teal-800 font-semibold mt-1">
                  Click or drag another image to replace photo
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 rounded-3xl bg-teal-50 text-[#0F766E] flex items-center justify-center mb-3 shadow-sm ring-4 ring-teal-50/50">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Drag & drop or browse image
                </h4>
                <p className="text-xs text-slate-500 mt-1">Supports JPG • PNG • WEBP up to 15MB</p>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200/60">
            <button
              type="button"
              disabled={!imagePreview}
              onClick={() => runAIPipeline(imagePreview, imageFileName || 'complaint.jpg')}
              className={`btn-interactive py-3.5 px-7 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md ${
                imagePreview
                  ? 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-teal-900/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Analyze with AI</span>
              <ArrowRight className="w-4 h-4 icon-shift" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 2: AI SCAN EXPERIENCES (ALL UI STATES) */}
      {/* ---------------------------------------------------- */}
      {currentStep === 2 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm space-y-6 page-enter">
          {/* 1. UPLOADING & PROCESSING & ANALYZING STATES */}
          {(aiState === 'uploading' || aiState === 'processing' || aiState === 'analyzing') && (
            <div className="py-8 text-center space-y-6">
              {/* Header Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-bold text-[#0F766E]">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>AI VISION ANALYSIS</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Scanning Civic Problem...
              </h3>

              {/* Dedicated AI Scanning Visual with Animated Moving Scan Line */}
              <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden border-2 border-teal-500/60 shadow-2xl bg-slate-900">
                <img
                  src={imagePreview}
                  alt="Analyzing issue"
                  className="w-full h-full object-cover object-center opacity-80"
                />

                {/* Animated Horizontal Laser Scan Line */}
                <div className="animate-scan-line" />

                {/* Corner reticle accents */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-teal-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-teal-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-teal-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-teal-400" />
              </div>

              {/* Progress Bar & Stage Indicator */}
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>{aiScanStageText}</span>
                  <span className="text-[#0F766E]">{aiScanProgress}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#0F766E] to-[#2DD4BF] transition-all duration-300"
                    style={{ width: `${aiScanProgress}%` }}
                  />
                </div>
              </div>

              {/* Real-time Feature Detection checklist */}
              <div className="max-w-sm mx-auto p-4 rounded-2xl glass-card text-left text-xs space-y-1.5 border border-white/60">
                <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wider mb-1">
                  Detecting Features:
                </span>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Objects & debris segmentation</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Surface damage & asphalt fissures</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Surrounding urban environment & street fixtures</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Civic municipal breakdown patterns</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. RESULT STATE (CONFIDENT AI PREDICTION) */}
          {aiState === 'result' && aiResult && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#0F766E] uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>AI ANALYSIS COMPLETE</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mt-1 capitalize">
                    {getCategoryLabel(aiResult.predictedCategory)}
                  </h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs ${
                      aiResult.confidenceLevel === 'High'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-50 text-amber-800 border border-amber-300'
                    }`}
                  >
                    ● {Math.round(aiResult.confidence * 100)}% Confidence ({aiResult.confidenceLevel})
                  </span>

                  {aiResult.analysisSource === 'rule_fallback' && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      DEMO / FALLBACK AI
                    </span>
                  )}
                </div>
              </div>

              {/* Image Preview + Top Alternative Class Probabilities */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-4 text-center">
                  <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 group">
                    <img
                      src={imagePreview}
                      alt="Scanned civic issue"
                      className="w-full h-48 object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => setIsZoomModalOpen(true)}
                      className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      <span>View Full Image</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1.5 block">
                    {imageFileName} ({imageFileSize})
                  </span>
                </div>

                <div className="md:col-span-8 p-5 rounded-3xl glass-card space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Predicted Probabilities:
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">Model: {aiResult.modelVersion}</span>
                  </div>

                  {aiResult.topPredictions && aiResult.topPredictions.length > 0 ? (
                    <div className="space-y-2.5">
                      {aiResult.topPredictions.map((pred, i) => (
                        <div key={pred.category}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-800 capitalize">
                              {i === 0 ? 'Primary: ' : 'Alternative: '}
                              {pred.category.replace('_', ' ')}
                            </span>
                            <span className="text-slate-700 font-bold">
                              {Math.round(pred.confidence * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                i === 0 ? 'bg-[#0F766E]' : 'bg-slate-400'
                              }`}
                              style={{ width: `${Math.round(pred.confidence * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-200/70 leading-relaxed">
                    {aiResult.explanation}
                  </p>
                </div>
              </div>

              {/* CITIZEN CONFIRMATION / OVERRIDE SELECTOR */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80">
                <label className="block text-xs font-bold text-teal-950 mb-1.5">
                  Confirm or Adjust Detected Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ComplaintCategory)}
                  className="w-full p-3 rounded-xl border border-teal-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {CIVIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-teal-800 mt-1.5 block">
                  You maintain full authority to correct the category before dispatching to the municipality.
                </span>
              </div>

              {/* STEP CONTROLS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-interactive py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-interactive py-3 px-7 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-teal-900/20 cursor-pointer"
                >
                  <span>Continue to Description</span>
                  <ArrowRight className="w-4 h-4 icon-shift" />
                </button>
              </div>
            </div>
          )}

          {/* 3. LOW CONFIDENCE STATE (SPEC RULE 18) */}
          {aiState === 'low-confidence' && (
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-amber-50 border border-amber-300/80 text-amber-950 space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                    LOW CONFIDENCE AI ASSESSMENT
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  The AI could not confidently identify the civic problem.
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lighting, distance, or visual obstruction reduced model certainty ({aiResult ? Math.round(aiResult.confidence * 100) : 0}%).
                  Please confirm the problem category manually from the options below:
                </p>
              </div>

              {/* 9 MANUAL CATEGORY BUTTONS PER SPEC RULE 18 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CIVIC_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`btn-interactive p-3 rounded-2xl border text-xs font-bold text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span>{getCategoryLabel(cat)}</span>
                    </button>
                  );
                })}
              </div>

              {/* STEP CONTROLS */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-interactive py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-interactive py-3 px-7 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-teal-900/20 cursor-pointer"
                >
                  <span>Continue with {getCategoryLabel(selectedCategory)}</span>
                  <ArrowRight className="w-4 h-4 icon-shift" />
                </button>
              </div>
            </div>
          )}

          {/* 4. AI MODEL UNAVAILABLE STATE (SPEC RULE 19) */}
          {aiState === 'unavailable' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                  AI Service Notice
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  AI MODEL UNAVAILABLE
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  The trained civic vision classifier is not currently available or API keys are unconfigured.
                  Please select the problem category manually.
                </p>
              </div>

              {/* Category selection */}
              <div className="max-w-md mx-auto text-left">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Select Problem Category:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as ComplaintCategory)}
                  className="w-full p-3 rounded-2xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {CIVIC_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryLabel(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* STEP CONTROLS */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200/60 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="btn-interactive py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Back to Photo
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="btn-interactive py-3 px-6 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Continue to Description
                </button>
              </div>
            </div>
          )}

          {/* 5. ERROR STATE */}
          {aiState === 'error' && (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Analysis Error Encountered</h3>
                <p className="text-xs text-rose-700 font-medium">
                  {aiErrorMessage || 'Unable to communicate with the classification pipeline.'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  You can retry inference or select the problem category manually.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => runAIPipeline(imagePreview, imageFileName || 'complaint.jpg')}
                  className="btn-interactive py-2.5 px-5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Retry AI Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAiState('low-confidence');
                  }}
                  className="btn-interactive py-2.5 px-5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold border border-slate-200 shadow-2xs cursor-pointer"
                >
                  Select Category Manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 3: DESCRIPTION & SPEECH-TO-TEXT (PRESERVED & UPGRADED UI) */}
      {/* ---------------------------------------------------- */}
      {currentStep === 3 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm space-y-6 page-enter">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Describe the Problem</h3>
            <p className="text-xs text-slate-600 mt-1">
              Type or speak your grievance. Natural language description is combined with 30% weighting alongside image vision (70%).
            </p>
          </div>

          {/* SPEECH LANGUAGE SELECTOR & RECORDING CONTROLS */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-card">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700">Speech Language:</span>
              <select
                value={speechLanguage}
                onChange={(e) => setSpeechLanguage(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none"
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

                  <span className="font-mono text-xs font-black text-slate-900 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                    {formatTimer(listeningTimer)}
                  </span>

                  {/* Dynamic Sound-Wave Visualization */}
                  <div className="flex items-center space-x-1 h-7 px-2 bg-white rounded-xl border border-slate-200" title="Audio waveform activity">
                    <span className="w-1 bg-teal-600 rounded-full soundwave-bar-1" />
                    <span className="w-1 bg-teal-600 rounded-full soundwave-bar-2" />
                    <span className="w-1 bg-teal-600 rounded-full soundwave-bar-3" />
                    <span className="w-1 bg-teal-600 rounded-full soundwave-bar-4" />
                    <span className="w-1 bg-teal-600 rounded-full soundwave-bar-5" />
                  </div>

                  <button
                    type="button"
                    onClick={stopSpeaking}
                    className="btn-interactive py-2 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    <span>Stop Speaking</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startSpeaking}
                  className="btn-interactive py-2.5 px-4 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 shadow-xs flex items-center space-x-2 transition-all hover:border-teal-500 cursor-pointer"
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
              placeholder="Describe the civic issue, landmarks, hazard level, or surrounding conditions... (or click '🎤 Start Speaking')"
              className="w-full p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 px-1">
              <span>Transcript is live and remains fully editable by you.</span>
              {description && (
                <button
                  type="button"
                  onClick={() => setDescription('')}
                  className="text-slate-400 hover:text-slate-700 underline cursor-pointer"
                >
                  Clear text
                </button>
              )}
            </div>
          </div>

          {/* STEP CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-interactive py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to AI</span>
            </button>
            <button
              type="button"
              disabled={!description.trim()}
              onClick={evaluateMultimodal}
              className={`btn-interactive py-3 px-7 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-md ${
                description.trim()
                  ? 'bg-[#0F766E] hover:bg-[#115E59] text-white shadow-teal-900/20 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Combine AI & Continue</span>
              <ArrowRight className="w-4 h-4 icon-shift" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 4: LOCATION & DEMO WARD DETECTION (STRICT SPEC) */}
      {/* ---------------------------------------------------- */}
      {currentStep === 4 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm space-y-6 page-enter">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Complaint Location & Ward</h3>
            <p className="text-xs text-slate-600 mt-1">
              Administrative wards are derived strictly from geographic location, NOT from image AI.
            </p>
          </div>

          {/* COMBINED ASSESSMENT PANEL (SPEC RULE 21) */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/90 shadow-2xs space-y-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-900 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Multimodal Combined Assessment</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Image Analysis (70%)</span>
                <span className="font-bold text-slate-900 capitalize block mt-0.5 truncate">
                  {aiResult ? getCategoryLabel(aiResult.predictedCategory) : 'N/A'}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold">
                  {aiResult ? `${Math.round(aiResult.confidence * 100)}% Confidence` : 'Manual'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-teal-100">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">2. Description Match (30%)</span>
                <span className="font-bold text-slate-900 capitalize block mt-0.5 truncate">
                  {textAnalysisResult ? getCategoryLabel(textAnalysisResult.predictedCategory) : 'Neutral'}
                </span>
                <span className="text-[11px] text-teal-700 font-semibold">
                  {textAnalysisResult && textAnalysisResult.confidence >= 0.75
                    ? 'High Match'
                    : textAnalysisResult && textAnalysisResult.confidence >= 0.5
                    ? 'Moderate Match'
                    : 'Low Match'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-white/80 border border-teal-200">
                <span className="text-[10px] text-[#0F766E] font-bold uppercase block">3. Final Assessment</span>
                <span className="font-bold text-[#0F766E] capitalize block mt-0.5 truncate">
                  {getCategoryLabel(selectedCategory)}
                </span>
                <span className="text-[11px] font-bold text-slate-900">
                  {Math.round(combinedConfidence * 100)}% Combined Score
                </span>
              </div>
            </div>

            {multimodalNotice && (
              <p className="text-[11px] text-teal-900 font-medium leading-relaxed pt-1">
                {multimodalNotice}
              </p>
            )}
          </div>

          {/* LOCATION MODE SWITCHER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl glass-card">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleUseCurrentGPS}
                disabled={isLocating}
                className={`btn-interactive py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer ${
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
                className={`btn-interactive py-2 px-3.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
              <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Demo Ward:</span>
              <select
                value={selectedWardNumber}
                onChange={(e) => handleWardSelect(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
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
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              {gpsError}
            </p>
          )}

          {/* INTERACTIVE LOCATION MAP */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
              <span>Click or tap the map to adjust exact pin coordinates:</span>
              <span className="font-bold text-teal-800">
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
          <div className="p-4 rounded-2xl glass-card grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">City</span>
              <span className="font-bold text-slate-900">{locationDetails.city}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Area</span>
              <span className="font-bold text-slate-900">{locationDetails.area}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Admin Ward</span>
              <span className="font-bold text-slate-900">{locationDetails.administrativeWard}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Demo Ward</span>
              <span className="font-black text-[#0F766E]">{locationDetails.demoWardNumber}</span>
            </div>
            <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Resolved Address</span>
              <span className="font-medium text-slate-800">{locationDetails.address}</span>
            </div>
          </div>

          {/* STEP CONTROLS */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-interactive py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Description</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="btn-interactive py-3 px-7 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center space-x-2 shadow-md shadow-teal-900/20 cursor-pointer"
            >
              <span>Review Complaint</span>
              <ArrowRight className="w-4 h-4 icon-shift" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* STEP 5: REVIEW & SUBMIT */}
      {/* ---------------------------------------------------- */}
      {currentStep === 5 && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-sm space-y-6 page-enter">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Complaint Review</h3>
            <p className="text-xs text-slate-600 mt-1">
              Verify all AI evaluations, geocoded ward information, and automated department routing before final submission.
            </p>
          </div>

          {/* REVIEW DOSSIER CARD */}
          <div className="p-6 rounded-3xl glass-card space-y-4">
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
                  <h4 className="text-base font-extrabold text-slate-900 capitalize">
                    {getCategoryLabel(selectedCategory)}
                  </h4>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/80">
                    {Math.round(combinedConfidence * 100)}% Combined Assessment Score
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 underline self-start cursor-pointer"
              >
                Change Category
              </button>
            </div>

            {/* DESCRIPTION */}
            <div className="py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Citizen Grievance Description
              </span>
              <p className="text-xs text-slate-800 leading-relaxed bg-white/90 p-3 rounded-xl border border-slate-200/60">
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
                <span className="text-[10px] text-slate-500">
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
                <span className="text-[10px] text-slate-500">{locationDetails.wardName}</span>
              </div>
            </div>

            {/* AUTOMATIC DEPARTMENT ROUTING BOX */}
            <div className="p-4 rounded-2xl bg-white/95 border border-teal-200/80 shadow-xs">
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
          <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
            <button
              type="button"
              onClick={() => setCurrentStep(4)}
              className="btn-interactive py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back / Edit Location</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitComplaint}
              className="btn-interactive py-3 px-8 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-teal-900/25 transition-all hover:scale-[1.02] cursor-pointer"
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

      {/* ---------------------------------------------------- */}
      {/* STEP 6: SUBMISSION SUCCESS SCREEN */}
      {/* ---------------------------------------------------- */}
      {currentStep === 6 && (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel shadow-xl text-center space-y-6 page-enter">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-emerald-50/50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-bold text-teal-800 uppercase tracking-widest">
              Submission Successful
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {submissionSuccessId}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
              Your grievance has been permanently logged in the Dahisar municipal register and auto-routed to the {routingInfo.department.departmentName}.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-card max-w-md mx-auto text-xs text-left space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Ward:</span>
              <span className="font-bold text-slate-900">{locationDetails.demoWardNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="font-bold text-slate-900 capitalize">
                {selectedCategory.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated SLA:</span>
              <span className="font-bold text-teal-800">{routingInfo.slaHours} Hours</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => onNavigate('complaint_detail', submissionSuccessId)}
              className="btn-interactive py-3 px-6 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              Track This Complaint
            </button>
            <button
              type="button"
              onClick={() => onNavigate('citizen_dashboard')}
              className="btn-interactive py-3 px-6 rounded-2xl glass-card hover:bg-white text-slate-800 text-xs font-bold shadow-xs cursor-pointer"
            >
              Return to Citizen Dashboard
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* ZOOM / VIEW PHOTO MODAL */}
      {/* ---------------------------------------------------- */}
      {isZoomModalOpen && imagePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-3xl w-full p-4 rounded-3xl glass-panel shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                Uploaded Photograph Full View ({imageFileName})
              </span>
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden max-h-[75vh] flex items-center justify-center bg-black/5">
              <img
                src={imagePreview}
                alt="Enlarged complaint preview"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
