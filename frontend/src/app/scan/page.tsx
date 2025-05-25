'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, BrowserCodeReader, Result } from '@zxing/browser';
import { useRouter } from 'next/navigation';
import { X, Camera, RotateCcw, Flashlight } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  const initializationRef = useRef<boolean>(false);
  const controlsRef = useRef<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [debug, setDebug] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [torchEnabled, setTorchEnabled] = useState(false);

  const addDebug = (message: string) => {
    console.log(message);
    setDebug(prev => [...prev.slice(-3), `${new Date().toLocaleTimeString().split(' ')[1]}: ${message}`]);
  };

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        addDebug('Requesting camera...');
        
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        addDebug('Camera granted!');
        setHasPermission(true);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
          addDebug('Video attached');
          
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                addDebug('Video playing');
                setTimeout(initializeScanner, 1500);
              });
            }
          };
        }

      } catch (error: any) {
        addDebug(`Camera error: ${error.message}`);
        setHasPermission(false);
      }
    };

    const initializeScanner = async () => {
      if (initializationRef.current) {
        addDebug('Already initializing...');
        return;
      }

      try {
        initializationRef.current = true;
        addDebug('Creating scanner...');
        
        // Clean up any existing reader
        if (controlsRef.current) {
          try {
            controlsRef.current.stop();
            addDebug('Previous controls stopped');
          } catch (e) {
            console.log('Previous controls cleanup:', e);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 500));

        // Create new reader
        readerRef.current = new BrowserMultiFormatReader();
        addDebug('Scanner created');

        if (videoRef.current && videoRef.current.videoWidth > 0 && readerRef.current) {
          addDebug(`Video ready: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
          scanningRef.current = true;
          setIsScanning(true);
          startContinuousScanning();
        } else {
          addDebug('Video not ready, retrying...');
          initializationRef.current = false;
          setTimeout(initializeScanner, 1000);
        }

      } catch (error: any) {
        addDebug(`Scanner init failed: ${error.message}`);
        initializationRef.current = false;
        
        // Try fallback manual scanning only
        setTimeout(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            setIsScanning(true);
            addDebug('Fallback: Manual scan only');
          }
        }, 2000);
      }
    };

    const startContinuousScanning = async () => {
      if (!readerRef.current || !videoRef.current || !scanningRef.current) {
        return;
      }

      try {
        addDebug('Starting continuous scan...');
        
        // Get available video devices using the static method from BrowserCodeReader
        const videoInputDevices = await BrowserCodeReader.listVideoInputDevices();
        addDebug(`Found ${videoInputDevices.length} camera(s)`);
        
        // Use decodeFromVideoDevice with device selection for better compatibility
        const selectedDeviceId = videoInputDevices.find((device: any) => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        )?.deviceId || videoInputDevices[0]?.deviceId;
        
        if (selectedDeviceId) {
          addDebug(`Using device: ${selectedDeviceId.substring(0, 20)}...`);
          
          // Use decodeFromVideoDevice for more reliable continuous scanning
          const controls = await readerRef.current.decodeFromVideoDevice(
            selectedDeviceId,
            videoRef.current,
            (result: Result, error: any, controls: any) => {
              if (result && scanningRef.current) {
                const barcodeText = result.getText();
                addDebug(`🎯 FOUND: ${barcodeText}`);
                
                // Check if this is a URL or a product barcode
                if (barcodeText.startsWith('http://') || barcodeText.startsWith('https://')) {
                  toast.error('URL detected - please scan a product barcode');
                  addDebug('URL detected, not a product barcode');
                  return; // Don't navigate for URLs
                }
                
                // Check if it looks like a product barcode (numeric or standard format)
                if (!/^[0-9]{8,}$/.test(barcodeText) && !/^[A-Z0-9]{6,}$/.test(barcodeText)) {
                  toast.error('Invalid barcode format - please scan a product barcode');
                  addDebug('Invalid barcode format');
                  return;
                }
                
                toast.success(`Product barcode detected: ${barcodeText}`);
                cleanup();
                router.push(`/product/${barcodeText}`);
              }
              
              // Count attempts
              setScanAttempts(prev => prev + 1);
              
              // Log significant errors only
              if (error && error.message && 
                  !error.message.includes('NotFoundException') && 
                  !error.message.includes('No MultiFormat') &&
                  !error.message.includes('NotFoundError')) {
                addDebug(`Scan error: ${error.message.substring(0, 25)}`);
              }
            }
          );
          
          controlsRef.current = controls;
          addDebug('Continuous scanning active');
          
        } else {
          // Fallback to direct video element scanning
          addDebug('No device ID, using video element directly');
          
          const controls = await readerRef.current.decodeFromVideoElement(
            videoRef.current,
            (result: Result) => {
              if (result && scanningRef.current) {
                const barcodeText = result.getText();
                addDebug(`🎯 FOUND: ${barcodeText}`);
                
                // Check if this is a URL or a product barcode
                if (barcodeText.startsWith('http://') || barcodeText.startsWith('https://')) {
                  toast.error('URL detected - please scan a product barcode');
                  addDebug('URL detected, not a product barcode');
                  return; // Don't navigate for URLs
                }
                
                // Check if it looks like a product barcode (numeric or standard format)
                if (!/^[0-9]{8,}$/.test(barcodeText) && !/^[A-Z0-9]{6,}$/.test(barcodeText)) {
                  toast.error('Invalid barcode format - please scan a product barcode');
                  addDebug('Invalid barcode format');
                  return;
                }
                
                toast.success(`Product barcode detected: ${barcodeText}`);
                cleanup();
                router.push(`/product/${barcodeText}`);
              }
              setScanAttempts(prev => prev + 1);
            },
            (error: any) => {
              // Only log significant errors
              if (error && error.message && 
                  !error.message.includes('NotFoundException') && 
                  !error.message.includes('No MultiFormat') &&
                  !error.message.includes('NotFoundError')) {
                addDebug(`Scan error: ${error.message.substring(0, 25)}`);
              }
              setScanAttempts(prev => prev + 1);
            }
          );
          
          controlsRef.current = controls;
          addDebug('Continuous scanning active (fallback)');
        }
        
      } catch (error: any) {
        addDebug(`Continuous scan error: ${error.message}`);
        initializationRef.current = false;
        
        // Try manual-only mode as final fallback
        setTimeout(() => {
          if (videoRef.current && videoRef.current.videoWidth > 0) {
            setIsScanning(true);
            addDebug('Fallback: Manual scan only mode');
          }
        }, 1000);
      }
    };

    const cleanup = () => {
      scanningRef.current = false;
      initializationRef.current = false;
      setIsScanning(false);
      
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
          controlsRef.current = null;
          addDebug('Scanner controls stopped');
        } catch (e) {
          console.log('Scanner cleanup error:', e);
        }
      }
      
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
        addDebug('Camera stopped');
      }
    };

    if (!navigator.mediaDevices) {
      addDebug('Camera not supported');
      setHasPermission(false);
      return;
    }

    initializeCamera();

    return cleanup;
  }, [router]);

  const handleClose = () => {
    router.push('/');
  };

  const manualScan = async () => {
    if (!videoRef.current) {
      toast.error('Video not ready');
      return;
    }

    try {
      addDebug('Manual scan...');
      
      // Create a fresh reader for manual scanning
      const tempReader = new BrowserMultiFormatReader();
      
      // Use decodeOnceFromVideoElement for single scan
      try {
        const result = await tempReader.decodeOnceFromVideoElement(videoRef.current);
        if (result) {
          const barcodeText = result.getText();
          addDebug(`Manual success: ${barcodeText}`);
          
          // Check if this is a URL or a product barcode
          if (barcodeText.startsWith('http://') || barcodeText.startsWith('https://')) {
            toast.error('URL detected - please scan a product barcode');
            addDebug('URL detected, not a product barcode');
            return; // Don't navigate for URLs
          }
          
          // Check if it looks like a product barcode (numeric or standard format)
          if (!/^[0-9]{8,}$/.test(barcodeText) && !/^[A-Z0-9]{6,}$/.test(barcodeText)) {
            toast.error('Invalid barcode format - please scan a product barcode');
            addDebug('Invalid barcode format');
            return;
          }
          
          toast.success(`Product barcode detected: ${barcodeText}`);
          router.push(`/product/${barcodeText}`);
          return;
        }
      } catch (error: any) {
        // Try canvas approach as fallback
        if (canvasRef.current && videoRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            
            try {
              // Use regular decodeFromCanvas method (no callback)
              const canvasResult = await tempReader.decodeFromCanvas(canvas);
              if (canvasResult) {
                const barcodeText = canvasResult.getText();
                addDebug(`Canvas success: ${barcodeText}`);
                
                // Check if this is a URL or a product barcode
                if (barcodeText.startsWith('http://') || barcodeText.startsWith('https://')) {
                  toast.error('URL detected - please scan a product barcode');
                  addDebug('URL detected, not a product barcode');
                  return; // Don't navigate for URLs
                }
                
                // Check if it looks like a product barcode (numeric or standard format)
                if (!/^[0-9]{8,}$/.test(barcodeText) && !/^[A-Z0-9]{6,}$/.test(barcodeText)) {
                  toast.error('Invalid barcode format - please scan a product barcode');
                  addDebug('Invalid barcode format');
                  return;
                }
                
                toast.success(`Product barcode detected: ${barcodeText}`);
                router.push(`/product/${barcodeText}`);
                return;
              }
            } catch (canvasError: any) {
              addDebug(`Canvas error: ${canvasError.message}`);
            }
          }
        }
      }
      
      addDebug('Manual failed');
      toast.error('No barcode detected - try better lighting');
      
    } catch (error: any) {
      addDebug(`Manual error: ${error.message}`);
      toast.error('Scanner error - try restarting');
    }
  };

  const toggleTorch = async () => {
    if (!streamRef.current) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchEnabled }]
        });
        setTorchEnabled(!torchEnabled);
        addDebug(`Torch ${!torchEnabled ? 'ON' : 'OFF'}`);
      } else {
        toast.error('Flashlight not available');
      }
    } catch (error) {
      console.log('Torch error:', error);
      toast.error('Could not control flashlight');
    }
  };

  const retrySetup = async () => {
    addDebug('Restarting...');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Hidden canvas for fallback scanning */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />

      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between">
        <button
          onClick={handleClose}
          className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
        >
          <X className="text-white" size={24} />
        </button>

        <div className="flex gap-2">
          {/* Manual scan always available */}
          <button
            onClick={manualScan}
            className="bg-emerald-500/80 rounded-full p-3 hover:bg-emerald-600 transition-colors"
          >
            <Camera className="text-white" size={24} />
          </button>
          
          {hasPermission && (
            <button
              onClick={toggleTorch}
              className={`rounded-full p-3 transition-colors ${
                torchEnabled 
                  ? 'bg-yellow-500/80 hover:bg-yellow-600' 
                  : 'bg-gray-500/80 hover:bg-gray-600'
              }`}
            >
              <Flashlight className="text-white" size={20} />
            </button>
          )}
          
          <button
            onClick={retrySetup}
            className="bg-blue-500/80 rounded-full p-3 hover:bg-blue-600 transition-colors"
          >
            <RotateCcw className="text-white" size={20} />
          </button>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="absolute bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs max-w-xs">
        <div className="mb-1">
          Status: {hasPermission === null ? 'Loading' : hasPermission ? '✅ Ready' : '❌ Error'}
        </div>
        <div className="mb-1">
          Auto-scan: {isScanning ? '🟢 Active' : '⚪ Manual only'}
        </div>
        <div className="mb-1">Torch: {torchEnabled ? '🔦 ON' : '⚫ OFF'}</div>
        <div className="mb-2">Attempts: {scanAttempts}</div>
        
        {debug.map((msg, i) => (
          <div key={i} className="text-green-300 text-xs">{msg}</div>
        ))}

        {hasPermission === false && (
          <button 
            onClick={retrySetup}
            className="mt-2 bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs"
          >
            Retry Camera
          </button>
        )}
      </div>

      {/* Camera Video */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />

        {/* Scanning Frame */}
      {hasPermission && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="w-80 h-48 border-2 border-emerald-400 rounded-lg bg-transparent">
              {/* Corners */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg"></div>
              
              {/* Center Line */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-0.5 bg-emerald-400"></div>
            </div>
          </div>
        </div>
      )}

        {/* Instructions */}
      {hasPermission && (
        <div className="absolute bottom-20 left-0 right-0 px-6">
          <div className="bg-black/70 rounded-xl p-4 text-center mx-auto max-w-sm">
            <p className="text-white font-medium">
              📱 Hold barcode in frame
            </p>
            <p className="text-white/70 text-sm mt-1">
              {isScanning ? 'Auto-scanning active' : 'Manual scan only'} • Use camera button to scan
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Camera Access Required</h3>
            <p className="text-gray-600 text-sm mb-6">
              Please allow camera access to scan barcodes
            </p>
            <button
              onClick={retrySetup}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-lg font-medium"
            >
              Allow Camera Access
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 