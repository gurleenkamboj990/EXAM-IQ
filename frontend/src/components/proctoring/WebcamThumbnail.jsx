import React, { useEffect, useRef } from 'react';
import { Camera, ShieldCheck, ShieldAlert, Eye, AlertTriangle } from 'lucide-react';

export const WebcamThumbnail = ({
  cameraStream,
  faceStatus = 'FACE_OK',
  riskScore = 0,
  violationCount = 0,
  maxViolations = 5,
  className = '',
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-rose-600 bg-rose-500';
    if (score >= 30) return 'text-amber-600 bg-amber-500';
    return 'text-emerald-600 bg-emerald-500';
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-40 w-48 sm:w-56 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-700 shadow-soft-lg overflow-hidden select-none transition-all ${className}`}
    >
      {/* Video Container */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
        {cameraStream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-slate-500 text-center">
            <Camera className="w-6 h-6 mb-1 text-slate-400 animate-pulse" />
            <span className="text-[10px] font-mono">Camera Sentinel Active</span>
          </div>
        )}

        {/* Live Indicator */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-sm text-[10px] font-bold text-white border border-slate-700">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>REC</span>
        </div>

        {/* AI Face Status Pill */}
        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between px-2 py-1 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-[10px]">
          <span className="text-slate-300 font-medium truncate flex items-center gap-1">
            {faceStatus === 'FACE_OK' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
            {faceStatus === 'NO_FACE' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
            {faceStatus === 'MULTIPLE_FACES' && <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />}
            {faceStatus === 'LOOKING_AWAY' && <Eye className="w-3.5 h-3.5 text-amber-400" />}
            {faceStatus === 'MODEL_FALLBACK' && <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />}

            {faceStatus === 'FACE_OK'
              ? 'Face Verified'
              : faceStatus === 'NO_FACE'
              ? 'No Face Detected'
              : faceStatus === 'MULTIPLE_FACES'
              ? 'Multiple Faces'
              : faceStatus === 'LOOKING_AWAY'
              ? 'Gaze Shift Detected'
              : 'AI Sentinel Active'}
          </span>
        </div>
      </div>

      {/* Risk Meter & Stats Bar */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 space-y-1.5 text-[11px]">
        <div className="flex items-center justify-between text-slate-400">
          <span className="font-semibold">Cheating Risk</span>
          <span className={`font-mono font-bold ${getRiskColor(riskScore).split(' ')[0]}`}>
            {riskScore}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${getRiskColor(riskScore).split(' ')[1]}`}
            style={{ width: `${Math.min(100, Math.max(5, riskScore))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>Violations:</span>
          <span className={`font-bold ${violationCount > 2 ? 'text-rose-400' : 'text-slate-300'}`}>
            {violationCount} / {maxViolations} Max
          </span>
        </div>
      </div>
    </div>
  );
};

export default WebcamThumbnail;

