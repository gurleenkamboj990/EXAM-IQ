import { useState, useEffect, useRef, useCallback } from 'react';

const VIOLATION_WEIGHTS = {
  TAB_SWITCH: 20,
  WINDOW_BLUR: 15,
  FULLSCREEN_EXIT: 20,
  CLIPBOARD_COPY: 10,
  CLIPBOARD_PASTE: 15,
  RIGHT_CLICK: 5,
  NO_FACE: 10,
  MULTIPLE_FACES: 25,
  LOOKING_AWAY: 10,
};

export const useProctoring = ({
  isEnabled = false,
  maxViolations = 5,
  onMaxViolationsExceeded,
  onViolationOccurred,
}) => {
  const [violations, setViolations] = useState([]);
  const [riskScore, setRiskScore] = useState(0);
  const [riskLevel, setRiskLevel] = useState('LOW'); // LOW, MEDIUM, HIGH
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [faceStatus, setFaceStatus] = useState('FACE_OK'); // FACE_OK, NO_FACE, MULTIPLE_FACES, LOOKING_AWAY, MODEL_FALLBACK, CAMERA_OFF
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [latestViolation, setLatestViolation] = useState(null);

  const streamRef = useRef(null);
  const videoElementRef = useRef(null);
  const onMaxRef = useRef(onMaxViolationsExceeded);
  onMaxRef.current = onMaxViolationsExceeded;
  const onViolationRef = useRef(onViolationOccurred);
  onViolationRef.current = onViolationOccurred;

  const hasExceededRef = useRef(false);

  // Request Camera
  const requestCamera = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Webcam access is not supported by your browser.');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      setCameraStream(stream);
      setCameraError(null);
      return stream;
    } catch (err) {
      console.warn('Camera permission denied or camera unavailable:', err);
      setCameraError('Camera access denied. Please allow camera permissions to continue.');
      return null;
    }
  }, []);

  // Stop Camera Streams
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    setCameraStream(null);
  }, []);

  // Request Fullscreen
  const requestFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  // Record Violation
  const recordViolation = useCallback(
    (type, message) => {
      if (!isEnabled || hasExceededRef.current) return;

      const weight = VIOLATION_WEIGHTS[type] || 10;
      const newViolation = {
        id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type,
        message,
        weight,
      };

      setViolations((prev) => {
        const updated = [...prev, newViolation];
        const newTotalScore = Math.min(
          100,
          updated.reduce((sum, v) => sum + v.weight, 0)
        );

        setRiskScore(newTotalScore);
        if (newTotalScore >= 70) setRiskLevel('HIGH');
        else if (newTotalScore >= 30) setRiskLevel('MEDIUM');
        else setRiskLevel('LOW');

        if (updated.length >= maxViolations && !hasExceededRef.current) {
          hasExceededRef.current = true;
          if (onMaxRef.current) {
            onMaxRef.current(updated, newTotalScore);
          }
        }

        return updated;
      });

      setLatestViolation(newViolation);
      setShowWarningModal(true);

      if (onViolationRef.current) {
        onViolationRef.current(newViolation);
      }
    },
    [isEnabled, maxViolations]
  );

  // Browser Integrity Event Handlers
  useEffect(() => {
    if (!isEnabled) return;

    // 1. Tab switch / minimize
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('TAB_SWITCH', 'Candidate switched to another browser tab or minimized window');
      }
    };

    // 2. Window Blur
    const handleWindowBlur = () => {
      recordViolation('WINDOW_BLUR', 'Exam window lost active focus');
    };

    // 3. Fullscreen exit
    const handleFullscreenChange = () => {
      const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFull);
      if (!isFull) {
        recordViolation('FULLSCREEN_EXIT', 'Full-screen lockdown mode was exited');
      }
    };

    // 4. Clipboard operations
    const handleCopy = (e) => {
      e.preventDefault();
      recordViolation('CLIPBOARD_COPY', 'Attempted to copy assessment contents');
    };

    const handlePaste = (e) => {
      e.preventDefault();
      recordViolation('CLIPBOARD_PASTE', 'Attempted to paste text from external clipboard');
    };

    // 5. Context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation('RIGHT_CLICK', 'Right-click context menu is prohibited');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isEnabled, recordViolation]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    isEnabled,
    violations,
    violationCount: violations.length,
    maxViolations,
    riskScore,
    riskLevel,
    faceStatus,
    setFaceStatus,
    isFullscreen,
    cameraStream,
    cameraError,
    videoElementRef,
    showWarningModal,
    setShowWarningModal,
    latestViolation,
    requestCamera,
    stopCamera,
    requestFullscreen,
    recordViolation,
  };
};

export default useProctoring;

