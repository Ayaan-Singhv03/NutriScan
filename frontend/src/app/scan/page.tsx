'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useRouter } from 'next/navigation';
import { X, Camera, RotateCcw, Flashlight } from 'lucide-react';
import { toast } from 'sonner';

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningRef = useRef<boolean>(false);
  const [isScanning, setIsScanning] = useState(false);
  const [debug, setDebug] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanAttempts, setScanAttempts] = useState(0);

  const addDebug = (message: string) => {
    console.log(`[Scanner] ${message}`);
    setDebug(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const isValidProductBarcode = (barcode: string): boolean => {
    // Reject URLs and very short codes
    if (barcode.includes('://') || barcode.length < 6) {
      return false;
    }
    
    // Accept common product barcode formats
    const patterns = [
      /^[0-9]{8}$/,     // EAN-8
      /^[0-9]{12}$/,    // UPC-A
      /^[0-9]{13}$/,    // EAN-13
      /^[0-9]{14}$/,    // ITF-14
      /^[A-Z0-9]{6,}$/, // Code 39/128 alphanumeric
    ];
    
    return patterns.some(pattern => pattern.test(barcode));
  };

  const handleBarcodeDetected = async (barcode: string) => {
    // Stop scanning immediately
    scanningRef.current = false;
    setIsScanning(false);
    
    if (readerRef.current) {
      try {
        // Stop the reader by creating a new instance
        readerRef.current = null;
        addDebug('Scanner stopped');
      } catch (e) {
        console.log('Scanner reset error:', e);
      }
    }
    
    try {
      addDebug(`🔍 Fetching product data for: ${barcode}`);
      
      // Fetch product data from your backend (which uses OpenFoodFacts service) - using public barcode endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/barcode/${barcode}?autoFetch=true`);
      
      if (response.ok) {
        const productData = await response.json();
        addDebug(`✅ Product found: ${productData.foodItem.name}`);
        
        // Navigate to product page with the barcode
        addDebug(`🚀 Redirecting to /product/${barcode}`);
        router.push(`/product/${barcode}`);
      } else {
        const error = await response.json();
        addDebug(`❌ Product not found: ${error.message}`);
        
        // Still navigate to product page to allow manual entry
        addDebug(`🚀 Redirecting to /product/${barcode} (manual entry)`);
        router.push(`/product/${barcode}`);
      }
    } catch (error: any) {
      addDebug(`❌ Fetch error: ${error.message}`);
      
      // Navigate anyway to allow manual entry
      addDebug(`🚀 Redirecting to /product/${barcode} (error fallback)`);
      router.push(`/product/${barcode}`);
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeScanner = async () => {
      try {
        addDebug('🎥 Requesting camera access...');
        
        // Request camera access
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          addDebug('✅ Camera access granted');

          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play().then(() => {
                addDebug('▶️ Video playing');
                startScanning();
              });
            }
          };
        }
      } catch (error: any) {
        addDebug(`❌ Camera error: ${error.message}`);
        setHasPermission(false);
      }
    };

    const startScanning = async () => {
      if (!videoRef.current || scanningRef.current) {
        return;
      }

      try {
        addDebug('🔍 Starting barcode scanner...');
        readerRef.current = new BrowserMultiFormatReader();
        scanningRef.current = true;
        setIsScanning(true);

        // Start continuous scanning
        readerRef.current.decodeFromVideoElement(
          videoRef.current,
          (result, error) => {
            if (result && scanningRef.current) {
              const barcodeText = result.getText();
              addDebug(`🎯 BARCODE DETECTED: ${barcodeText}`);
              setScanAttempts(prev => prev + 1);
              
              // Validate barcode format
              if (isValidProductBarcode(barcodeText)) {
                addDebug(`✅ Valid barcode: ${barcodeText}`);
                handleBarcodeDetected(barcodeText);
              } else {
                addDebug(`❌ Invalid barcode format: ${barcodeText}`);
                // Skip toast notifications for invalid barcodes to avoid spam
              }
            }

            // Count scan attempts
            if (error) {
              setScanAttempts(prev => prev + 1);
              // Only log significant errors
              if (error.message && 
                  !error.message.includes('NotFoundException') && 
                  !error.message.includes('No MultiFormat')) {
                addDebug(`Scan error: ${error.message.substring(0, 30)}`);
              }
            }
          }
        );

        addDebug('🟢 Continuous scanning active');
      } catch (error: any) {
        addDebug(`❌ Scanner initialization failed: ${error.message}`);
        setIsScanning(false);
      }
    };

    const cleanup = () => {
      scanningRef.current = false;
      setIsScanning(false);
      
      if (readerRef.current) {
        try {
          // Clean up the reader
          readerRef.current = null;
          addDebug('🛑 Scanner stopped');
        } catch (e) {
          console.log('Scanner cleanup error:', e);
        }
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        addDebug('📷 Camera stopped');
      }
    };

    if (navigator.mediaDevices) {
      initializeScanner();
    } else {
      addDebug('❌ Camera not supported');
      setHasPermission(false);
    }

    return cleanup;
  }, []);

  const handleClose = () => {
    router.push('/');
  };

  const manualScan = async () => {
    if (!videoRef.current || !readerRef.current) {
      return;
    }

    try {
      addDebug('📸 Manual scan triggered...');
      const result = await readerRef.current.decodeOnceFromVideoElement(videoRef.current);
      
      if (result) {
        const barcodeText = result.getText();
        addDebug(`📸 Manual scan result: ${barcodeText}`);
        
        if (isValidProductBarcode(barcodeText)) {
          await handleBarcodeDetected(barcodeText);
        } else {
          addDebug('❌ Invalid barcode format');
        }
      } else {
        addDebug('❌ No barcode detected');
      }
    } catch (error: any) {
      addDebug(`❌ Manual scan error: ${error.message}`);
    }
  };

  const retrySetup = () => {
    addDebug('🔄 Restarting scanner...');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black">
      {/* Header Controls */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between">
        <button
          onClick={handleClose}
          className="bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
        >
          <X className="text-white" size={24} />
        </button>

        <div className="flex gap-2">
          <button
            onClick={manualScan}
            disabled={!isScanning}
            className="bg-emerald-500/80 rounded-full p-3 hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            <Camera className="text-white" size={24} />
          </button>
          
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
          Status: {hasPermission === null ? '⏳ Loading' : hasPermission ? '✅ Ready' : '❌ Error'}
        </div>
        <div className="mb-1">
          Scanner: {isScanning ? '🟢 Active' : '⚪ Inactive'}
        </div>
        <div className="mb-2">Attempts: {scanAttempts}</div>
        
        {debug.map((msg, i) => (
          <div key={i} className="text-green-300 text-xs mb-1">{msg}</div>
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
              
              {/* Scanning Animation */}
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-400 animate-pulse"></div>
                </div>
              )}
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
              {isScanning ? '🟢 Auto-scanning active' : '⚪ Scanner inactive'} • Use camera button for manual scan
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