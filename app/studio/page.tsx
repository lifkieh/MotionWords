'use client';

import { useEffect, useRef, useState } from 'react';
import { HandTracker } from '@/lib/handtracking/HandTracker';
import { extractFeatures } from '@/lib/handtracking/FeatureExtractor';
import { HandFeatures, Point3D } from '@/lib/handtracking/types';

export default function Studio() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [features, setFeatures] = useState<HandFeatures | null>(null);
  const [letter, setLetter] = useState('A');
  const [recordedTemplates, setRecordedTemplates] = useState<Record<string, HandFeatures>>({});

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const tracker = new HandTracker(videoRef.current);
    
    tracker.onResults((landmarks) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (landmarks) {
        // Draw landmarks
        ctx.fillStyle = 'red';
        landmarks.forEach(p => {
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, 4, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Extract features
        try {
          const currentFeatures = extractFeatures(landmarks);
          setFeatures(currentFeatures);
        } catch (e) {
          console.error(e);
        }
      } else {
        setFeatures(null);
      }
    });

    tracker.start();

    return () => {
      tracker.stop();
    };
  }, []);

  const handleRecord = () => {
    if (features) {
      setRecordedTemplates(prev => ({
        ...prev,
        [letter]: features
      }));
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(recordedTemplates, null, 2);
    navigator.clipboard.writeText(json);
    alert('Templates copied to clipboard! Paste them in lib/handtracking/templates.ts');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-8 max-w-7xl mx-auto h-screen" style={{ background: 'var(--bg)', color: 'var(--t1)' }}>
      {/* Camera Area */}
      <div className="flex-1 space-y-4">
        <h1 className="text-2xl font-bold">Template Studio</h1>
        <p className="text-sm text-gray-500">Perform a gesture and record it to create real-world templates.</p>
        
        <div className="relative rounded-2xl overflow-hidden border border-gray-300 bg-gray-100 aspect-video">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
          />
        </div>

        <div className="flex gap-4 items-center p-4 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target Letter</label>
            <input 
              type="text" 
              maxLength={1} 
              value={letter} 
              onChange={e => setLetter(e.target.value.toUpperCase())}
              className="text-2xl font-bold w-16 text-center border-b-2 border-blue-500 focus:outline-none"
            />
          </div>
          <button 
            onClick={handleRecord}
            disabled={!features}
            className="ml-auto px-6 py-3 rounded-lg font-bold text-white shadow-md transition-transform active:scale-95 disabled:opacity-50"
            style={{ background: 'var(--ac)' }}
          >
            Record Template
          </button>
        </div>
      </div>

      {/* Debug & Output Area */}
      <div className="w-full md:w-96 space-y-6 flex flex-col">
        {/* Live Features */}
        <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex-1 overflow-auto">
          <h2 className="text-lg font-bold mb-4">Live Features</h2>
          {features ? (
            <div className="space-y-2 text-sm">
              {['thumb', 'index', 'middle', 'ring', 'pinky'].map(finger => (
                <div key={finger} className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="capitalize font-medium">{finger}</span>
                  <span className={features.fingers[finger as keyof HandFeatures['fingers']].isExtended ? 'text-green-600 font-bold' : 'text-red-500'}>
                    {features.fingers[finger as keyof HandFeatures['fingers']].isExtended ? 'Extended' : 'Folded'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 text-sm text-center py-10">No hand detected</div>
          )}
        </div>

        {/* Recorded Templates JSON */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 shadow-sm h-64 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-white">Export Data</h2>
            <button 
              onClick={handleExport}
              className="px-3 py-1 text-xs font-bold rounded bg-blue-600 text-white hover:bg-blue-500"
            >
              Copy JSON
            </button>
          </div>
          <pre className="text-xs text-green-400 overflow-auto flex-1 p-2 bg-black rounded">
            {Object.keys(recordedTemplates).length === 0 
              ? '// No templates recorded yet...' 
              : JSON.stringify(recordedTemplates, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
