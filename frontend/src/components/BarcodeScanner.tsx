'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScannerConfig, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface FoodData {
  barcode: string;
  name: string;
  brand?: string;
  caloriesPer100g: number;
  carbsPer100g: number;
  proteinsPer100g: number;
  fatsPer100g: number;
  sugarsPer100g: number;
  servingSize: number;
  imageUrl?: string;
}

interface BarcodeScannedData {
  foodItem: FoodData;
  source: 'database' | 'openfoodfacts';
  additionalData?: any;
}

interface BarcodeScannerProps {
  onFoodScanned: (data: BarcodeScannedData) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onFoodScanned, onClose }: BarcodeScannerProps) {
  const { firebaseUser } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [foodData, setFoodData] = useState<BarcodeScannedData | null>(null);
  const [amountConsumed, setAmountConsumed] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const elementId = 'qr-reader';

  useEffect(() => {
    if (isScanning && !manualMode) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning, manualMode]);

  const startScanner = () => {
    const config: Html5QrcodeScannerConfig = {
      fps: 10,
      qrbox: {
        width: 300,
        height: 200,
      },
      aspectRatio: 1.7777778,
      disableFlip: false,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      showTorchButtonIfSupported: true,
      showZoomSliderIfSupported: true,
      defaultZoomValueIfSupported: 2,
    };

    scannerRef.current = new Html5QrcodeScanner(elementId, config, false);
    
    scannerRef.current.render(
      (decodedText) => {
        // Successfully scanned
        console.log('🔍 Barcode scanned:', decodedText);
        setScannedBarcode(decodedText);
        stopScanner();
        fetchFoodData(decodedText);
      },
      (error) => {
        // Scanning error (can be ignored for continuous scanning)
        // console.log('Scan error:', error);
      }
    );
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((error) => {
        console.error('Failed to clear scanner:', error);
      });
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const fetchFoodData = async (barcode: string) => {
    setLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/food/barcode/${barcode}?autoFetch=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🍎 Food data fetched:', data);
        setFoodData(data);
        toast.success(`Found: ${data.foodItem.name}`);
      } else {
        const error = await response.json();
        console.error('❌ Food data fetch failed:', error);
        toast.error(`Food not found: ${error.message || 'Unknown product'}`);
        setScannedBarcode('');
        setIsScanning(true); // Restart scanning
      }
    } catch (error) {
      console.error('Error fetching food data:', error);
      toast.error('Failed to fetch food data. Please try again.');
      setScannedBarcode('');
      setIsScanning(true); // Restart scanning
    } finally {
      setLoading(false);
    }
  };

  const handleManualBarcode = () => {
    if (!scannedBarcode.trim()) {
      toast.error('Please enter a barcode');
      return;
    }
    fetchFoodData(scannedBarcode.trim());
  };

  const handleConfirmConsumption = async () => {
    if (!foodData || !amountConsumed) {
      toast.error('Please enter the amount consumed');
      return;
    }

    const amount = parseFloat(amountConsumed);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const token = await firebaseUser?.getIdToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          barcode: foodData.foodItem.barcode,
          amountConsumed: amount,
        }),
      });

      if (response.ok) {
        const logData = await response.json();
        console.log('✅ Food scanned and logged:', logData);
        toast.success(`Logged ${amount}g of ${foodData.foodItem.name}`);
        onFoodScanned(foodData);
        onClose();
      } else {
        const error = await response.json();
        console.error('❌ Failed to log consumption:', error);
        toast.error(error.error || 'Failed to log consumption');
      }
    } catch (error) {
      console.error('Error logging consumption:', error);
      toast.error('Failed to log consumption. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartScanning = () => {
    setIsScanning(true);
    setManualMode(false);
    setScannedBarcode('');
    setFoodData(null);
  };

  const handleManualMode = () => {
    stopScanner();
    setManualMode(true);
    setIsScanning(false);
    setScannedBarcode('');
    setFoodData(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icons.scan className="w-5 h-5" />
                Scan Barcode
              </CardTitle>
              <CardDescription>
                Scan or enter a barcode to log food consumption
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <Icons.x className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!foodData && (
            <>
              {/* Scanner Mode Selection */}
              <div className="flex gap-2">
                <Button
                  variant={!manualMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleStartScanning}
                  disabled={isScanning}
                  className="flex-1"
                >
                  <Icons.camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
                <Button
                  variant={manualMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleManualMode}
                  className="flex-1"
                >
                  <Icons.keyboard className="w-4 h-4 mr-2" />
                  Manual
                </Button>
              </div>

              {/* Manual Input */}
              {manualMode && (
                <div className="space-y-2">
                  <Label htmlFor="barcode">Enter Barcode</Label>
                  <div className="flex gap-2">
                    <Input
                      id="barcode"
                      value={scannedBarcode}
                      onChange={(e) => setScannedBarcode(e.target.value)}
                      placeholder="Enter barcode manually"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleManualBarcode}
                      disabled={loading || !scannedBarcode.trim()}
                    >
                      {loading ? (
                        <Icons.spinner className="w-4 h-4 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Camera Scanner */}
              {isScanning && !manualMode && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 text-center">
                    Point your camera at a barcode
                  </p>
                  <div id={elementId} className="rounded-lg overflow-hidden" />
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-4">
                  <Icons.spinner className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Fetching food data...</p>
                </div>
              )}

              {/* Initial State */}
              {!isScanning && !manualMode && !loading && (
                <div className="text-center py-8">
                  <Icons.scan className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Choose how you'd like to scan the barcode
                  </p>
                  <Button onClick={handleStartScanning}>
                    Start Camera Scanner
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Food Data Display */}
          {foodData && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {foodData.additionalData?.imageUrl && (
                    <img
                      src={foodData.additionalData.imageUrl}
                      alt={foodData.foodItem.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {foodData.foodItem.name}
                    </h3>
                    {foodData.additionalData?.brand && (
                      <p className="text-sm text-gray-600">
                        {foodData.additionalData.brand}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      Per 100g: {foodData.foodItem.caloriesPer100g} kcal
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Consumed (grams)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amountConsumed}
                  onChange={(e) => setAmountConsumed(e.target.value)}
                  placeholder="Enter amount in grams"
                  min="0"
                  step="0.1"
                />
                {amountConsumed && !isNaN(parseFloat(amountConsumed)) && (
                  <div className="text-sm text-gray-600">
                    Estimated calories: {Math.round((foodData.foodItem.caloriesPer100g * parseFloat(amountConsumed)) / 100)} kcal
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFoodData(null);
                    setScannedBarcode('');
                    setAmountConsumed('100');
                  }}
                  className="flex-1"
                >
                  Scan Again
                </Button>
                <Button
                  onClick={handleConfirmConsumption}
                  disabled={loading || !amountConsumed || isNaN(parseFloat(amountConsumed)) || parseFloat(amountConsumed) <= 0}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Icons.spinner className="w-4 h-4 animate-spin mr-2" />
                      Logging...
                    </>
                  ) : (
                    'Log Food'
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 