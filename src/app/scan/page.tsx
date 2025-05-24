'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useRouter } from 'next/navigation';
import { X, FlashlightOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const codeReader = useRef<BrowserMultiFormatReader>();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    startScan();

    return () => {
      stopScan();
    };
  }, []);

  const startScan = async () => {
    try {
      setIsScanning(true);
      setError('');
      
      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found');
      }

      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Get the media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDeviceId }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Start decoding from the video element
      codeReader.current?.decodeFromVideoElement(
        videoRef.current!,
        (result, err) => {
          if (result) {
            const barcode = result.getText();
            toast.success('Barcode detected!');
            stopScan();
            router.push(`/product/${barcode}`);
          }
          if (err && !(err.name === 'NotFoundException')) {
            console.error(err);
          }
        }
      );
    } catch (err) {
      console.error('Error starting scan:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsScanning(false);
    }
  };

  const stopScan = () => {
    // Stop the video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear the video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const handleManualEntry = () => {
    const barcode = prompt('Enter barcode manually:');
    if (barcode) {
      stopScan();
      router.push(`/product/${barcode}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              stopScan();
              router.push('/');
            }}
            className="bg-black/20 backdrop-blur-sm rounded-full p-2"
          >
            <X className="text-white" size={24} />
          </button>
          <h1 className="text-white text-lg font-semibold">Scan Barcode</h1>
          <button className="bg-black/20 backdrop-blur-sm rounded-full p-2">
            <FlashlightOff className="text-white" size={24} />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full">
        {isScanning && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
          />
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 mx-6 text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={startScan}
                className="bg-emerald-500 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Scanning Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-64 h-64 border-4 border-white/30 rounded-lg overflow-hidden">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
              
              {/* Moving Scanning Line */}
              {isScanning && (
                <div className="absolute inset-0">
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 via-emerald-300 to-transparent animate-[scan_2s_ease-in-out_infinite] shadow-lg shadow-emerald-400/50"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-20 left-0 right-0 px-6">
          <div className="text-center">
            <p className="text-white text-lg mb-4">
              Position the barcode within the frame
            </p>
            <button
              onClick={handleManualEntry}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg"
            >
              Enter Manually
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 