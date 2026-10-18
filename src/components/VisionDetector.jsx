import React, { useEffect, useRef, useState } from 'react';
import { IconCamera, IconCameraOff, IconShieldCheck, IconSparkles } from './Icons';

export const VisionDetector = ({ onGestureDetected, activeGesture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [detectedText, setDetectedText] = useState("Awaiting Hand Gestures...");

  const handsRef = useRef(null);
  const cameraUtilsRef = useRef(null);

  // Classify Hand Landmarks into Sign Language / Robot Commands
  const classifyGesture = (landmarks) => {
    // Distance helper
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const indexMcp = landmarks[5];
    const middleMcp = landmarks[9];
    const ringMcp = landmarks[13];
    const pinkyMcp = landmarks[17];

    const indexOpen = indexTip.y < indexMcp.y;
    const middleOpen = middleTip.y < middleMcp.y;
    const ringOpen = ringTip.y < ringMcp.y;
    const pinkyOpen = pinkyTip.y < pinkyMcp.y;
    const thumbUp = thumbTip.y < wrist.y && thumbTip.y < indexMcp.y;

    // Distance between thumb tip and index tip for OK sign
    const thumbIndexDist = dist(thumbTip, indexTip);

    if (indexOpen && middleOpen && ringOpen && pinkyOpen) {
      return { key: 'HELP', text: "🖐️ OPEN PALM -> HELP MODE / EMERGENCY ASSIST", symbol: "🖐️" };
    } else if (thumbUp && !indexOpen && !middleOpen && !ringOpen) {
      return { key: 'LIKE', text: "👍 THUMBS UP -> CONFIRMATION / DHANYAVADAGALU", symbol: "👍" };
    } else if (indexOpen && middleOpen && !ringOpen && !pinkyOpen) {
      return { key: 'NAMASKARA', text: "✌️ PEACE SIGN -> NAMASKARA / GREETINGS", symbol: "✌️" };
    } else if (!indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
      return { key: 'STOP', text: "✊ FIST -> STOP / PAUSE AUDIO", symbol: "✊" };
    } else if (thumbIndexDist < 0.05 && middleOpen) {
      return { key: 'OK', text: "👌 OK SIGN -> UNDERSTOOD / PROCEED", symbol: "👌" };
    }

    return { key: 'DETECTING', text: "🖐️ Hand Detected (Analyzing Gestures...)", symbol: "🔍" };
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!window.Hands || !window.Camera) {
        setCameraError("MediaPipe library loading from CDN. Please wait a moment...");
        return;
      }

      const hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });

      hands.onResults((results) => {
        if (!canvasRef.current || !videoRef.current) return;
        const canvasCtx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, width, height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          for (const landmarks of results.multiHandLandmarks) {
            // Draw custom glowing skeleton lines
            if (window.drawConnectors && window.HAND_CONNECTIONS) {
              window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, {
                color: '#06b6d4',
                lineWidth: 3
              });
              window.drawLandmarks(canvasCtx, landmarks, {
                color: '#f59e0b',
                fillColor: '#fbbf24',
                radius: 4
              });
            }

            const gesture = classifyGesture(landmarks);
            setDetectedText(gesture.text);
            if (onGestureDetected && gesture.key !== 'DETECTING') {
              onGestureDetected(gesture);
            }
          }
        } else {
          setDetectedText("Scanning area for hand sign gestures...");
        }
        canvasCtx.restore();
      });

      handsRef.current = hands;

      if (videoRef.current) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (videoRef.current && handsRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        await camera.start();
        cameraUtilsRef.current = camera;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Camera vision error:", err);
      setCameraError("Unable to access camera. Please allow camera permissions in your browser.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraUtilsRef.current) {
      cameraUtilsRef.current.stop();
      cameraUtilsRef.current = null;
    }
    setIsCameraActive(false);
    setDetectedText("Camera offline.");
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="glass-panel p-5 relative overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <IconCamera size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Accessibility Vision (Sign Language)
            </h3>
            <p className="text-xs text-slate-400">MediaPipe Real-Time Hand Gesture Engine</p>
          </div>
        </div>

        <button
          onClick={isCameraActive ? stopCamera : startCamera}
          className={`btn-primary text-xs ${isCameraActive ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30' : ''}`}
        >
          {isCameraActive ? (
            <>
              <IconCameraOff size={16} /> Stop Camera
            </>
          ) : (
            <>
              <IconCamera size={16} /> Start Vision Feed
            </>
          )}
        </button>
      </div>

      {/* Camera & Canvas Feed Container */}
      <div className="relative flex-1 min-h-[260px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
        {/* Hidden video element used as frame source */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 opacity-60"
          playsInline
          muted
        />

        {/* Canvas overlay for drawn landmarks */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-10"
        />

        {!isCameraActive && (
          <div className="z-20 text-center p-6 max-w-sm">
            <div className="w-14 h-14 rounded-full bg-slate-900/80 border border-slate-700 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <IconSparkles size={28} />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">Sign Language Gesture Control</h4>
            <p className="text-xs text-slate-400 mb-4">
              Click 'Start Vision Feed' to enable camera gesture detection for deaf or mute visitors.
            </p>
            {cameraError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/50">
                {cameraError}
              </p>
            )}
          </div>
        )}

        {/* Live Detected Gesture Overlay Banner */}
        {isCameraActive && (
          <div className="absolute bottom-3 left-3 right-3 z-30 glass-panel p-3 bg-slate-900/90 border-cyan-500/40 flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              {detectedText}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded">
              Hand Tracking Active
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
