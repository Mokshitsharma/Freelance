import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("कैमरा एक्सेस करने में विफल (Failed to access camera)");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedImage(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      // Convert dataUrl to File
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);
          onClose();
        });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Camera className="text-orange-600" /> {t('camera')}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={24} />
          </button>
        </div>

        <div className="relative aspect-square bg-black overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex items-center justify-center text-white p-8 text-center">
              <p className="font-medium">{error}</p>
            </div>
          ) : capturedImage ? (
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-8 flex justify-center gap-6 bg-gray-50">
          {!capturedImage ? (
            <button 
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-orange-600 border-8 border-orange-100 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform"
            >
              <div className="w-8 h-8 rounded-full border-4 border-white"></div>
            </button>
          ) : (
            <>
              <button 
                onClick={() => setCapturedImage(null)}
                className="flex flex-col items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <RefreshCw size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Retake</span>
              </button>
              <button 
                onClick={handleConfirm}
                className="flex flex-col items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
              >
                <div className="w-14 h-14 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-md">
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Confirm</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
