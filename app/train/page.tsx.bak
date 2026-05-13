'use client';

import { useState, useEffect, useRef } from 'react';
import { Layers, Camera, X, Check, RefreshCcw } from 'lucide-react';
import { type SignSystem, SIGN_SYSTEMS } from '@/data/signSystems';
import { getSignImage, PLACEHOLDER_IMAGE } from '@/data/alphabet';
import { HandTracker } from '@/lib/handtracking/HandTracker';
import { motion, AnimatePresence } from 'framer-motion';

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17]
];

const TARGET_PHOTOS = 10;
const ALPHABET_TRAIN = 'ABCDEFGHIJKLMNOPQRSTUVWXY'.split('').filter(l => l !== 'J'); 

async function augmentAndGetBase64(videoElement: HTMLVideoElement, degree: number, flip: boolean = false): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (flip) {
    ctx.scale(-1, 1);
  }
  if (degree !== 0) {
    ctx.rotate((degree * Math.PI) / 180);
  }
  ctx.drawImage(videoElement, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.9);
}

export default function TrainPage() {
  const [activeSystem, setActiveSystem] = useState<SignSystem>('bisindo');
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const fetchProgress = async (sys: SignSystem) => {
    try {
      const res = await fetch(`/api/train/progress?language=${sys}`);
      const data = await res.json();
      setProgress(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProgress(activeSystem);
  }, [activeSystem]);

  useEffect(() => {
    if (!activeLetter || !videoRef.current || !canvasRef.current) return;
    
    const tracker = new HandTracker(videoRef.current);
    tracker.onResults((primary, secondary) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const drawHand = (lms: typeof primary) => {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        for (const [start, end] of HAND_CONNECTIONS) {
          const p1 = lms[start];
          const p2 = lms[end];
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
        ctx.fillStyle = '#10b981';
        lms.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
          ctx.fill();
        });
      };

      if (primary) drawHand(primary);
      if (secondary) drawHand(secondary);
    });

    tracker.start();
    return () => tracker.stop();
  }, [activeLetter]);

  const handleCapture = async () => {
    if (!videoRef.current || !activeLetter || isUploading) return;
    setIsUploading(true);

    try {
      const b1 = await augmentAndGetBase64(videoRef.current, 0, true);
      const b2 = await augmentAndGetBase64(videoRef.current, 10, true);
      const b3 = await augmentAndGetBase64(videoRef.current, -10, true);

      const uploads = [b1, b2, b3].map(base64 => 
        fetch('/api/train/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: activeSystem, letter: activeLetter, imageBase64: base64 })
        })
      );

      await Promise.all(uploads);
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
      
      setProgress(p => ({ ...p, [activeLetter]: (p[activeLetter] || 0) + 3 }));
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-3">
            <span className="eyebrow"><Camera className="w-3 h-3" />Self-Training</span>
          </div>
          <h1 className="section-title mb-2">Dataset Collection</h1>
          <p className="text-sm text-slate-500 max-w-lg leading-relaxed">
            Help improve the sign language models by submitting your own hand gestures.
          </p>
        </div>

        {!activeLetter ? (
          <div className="space-y-6 anim-fade-up delay-1">
            <div className="card p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Sign System</p>
              <div className="flex flex-wrap gap-2">
                {SIGN_SYSTEMS.filter(s => s.key !== 'international').map(sys => (
                  <button
                    key={sys.key}
                    onClick={() => setActiveSystem(sys.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 select-none ${
                      activeSystem === sys.key
                        ? `${sys.color} text-white border-transparent shadow-md scale-[1.02]`
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {sys.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4">
                {ALPHABET_TRAIN.map(letter => {
                  const count = progress[letter] || 0;
                  const isDone = count >= TARGET_PHOTOS * 3; 
                  const pct = Math.min(100, Math.round((count / (TARGET_PHOTOS * 3)) * 100));
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => setActiveLetter(letter)}
                      className="group relative bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-3 hover:border-brand-400 hover:shadow-lg transition-all text-left overflow-hidden"
                    >
                      <div className="absolute bottom-0 left-0 h-1 bg-brand-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                      
                      <span className="text-3xl font-bold text-slate-800">{letter}</span>
                      <div className="w-full flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-medium">{count} / {TARGET_PHOTOS * 3}</span>
                        {isDone ? <Check className="w-4 h-4 text-emerald-500" /> : <Camera className="w-4 h-4 text-slate-300 group-hover:text-brand-400 transition-colors" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="anim-fade-up">
            <button 
              onClick={() => { setActiveLetter(null); fetchProgress(activeSystem); }}
              className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" /> Back to Grid
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card p-2 relative">
                <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-bold tracking-wider uppercase">
                  Capturing: {activeLetter}
                </div>
                <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video">
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
                  <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" />
                </div>
                
                <div className="p-4 flex justify-center">
                  <button 
                    onClick={handleCapture}
                    disabled={isUploading}
                    className={`btn btn-primary btn-lg flex items-center gap-3 px-10 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUploading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                    {isUploading ? 'Uploading...' : 'Take Photo'}
                  </button>
                </div>
                
                <AnimatePresence>
                  {uploadSuccess && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Captured 3 variations!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="card p-6 flex flex-col gap-6">
                <div>
                  <h3 className="font-bold text-slate-800 mb-2">Reference Image</h3>
                  <div className="w-full aspect-square bg-slate-100 rounded-2xl border border-slate-200 p-4 flex items-center justify-center">
                    <img 
                      src={getSignImage(activeSystem, activeLetter)} 
                      alt={activeLetter}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={e => { (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-sm text-slate-700 mb-2">Progress</h4>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, ((progress[activeLetter] || 0) / 30) * 100)}%` }} 
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{progress[activeLetter] || 0} / 30 photos collected</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
