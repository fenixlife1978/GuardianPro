'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Camera, CameraOff, QrCode } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const QR_READER_ID = "qr-reader";

export default function EnrollmentPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!isScanning) {
            return;
        }

        const scanner = new Html5QrcodeScanner(
            QR_READER_ID,
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                rememberLastUsedCamera: true,
                supportedScanTypes: [0] // 0 for SCAN_TYPE_CAMERA
            },
            false // verbose
        );

        const onScanSuccess = (decodedText: string, decodedResult: any) => {
            setIsScanning(false);
            setScanResult(decodedText);
            toast({
                title: "Código QR Escaneado",
                description: `Dispositivo listo para enrolar.`,
            });
        };

        const onScanFailure = (error: any) => {
            // This is called on every frame that doesn't contain a QR code.
            // We can ignore it.
        };

        scanner.render(onScanSuccess, onScanFailure);


        return () => {
            // The scanner is not always initialized when the component unmounts
            if (scanner?.getState() === 2) { // 2 is SCANNING
                scanner.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode-scanner.", error);
                });
            }
        };
    }, [isScanning, toast]);

    const toggleScanning = () => {
        setScanResult(null);
        setIsScanning(prev => !prev);
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Inscripción Masiva de Dispositivos</h2>
                <p className="text-muted-foreground">Usa la cámara para escanear el código QR de un dispositivo y enrolarlo.</p>
            </div>

            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle>Escáner de Código QR</CardTitle>
                    <CardDescription>
                        {isScanning
                            ? 'Apunta la cámara al código QR.'
                            : 'Presiona el botón para iniciar el escáner.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
                    {isScanning ? (
                        <div id={QR_READER_ID} className="w-full" />
                    ) : (
                        <div className="flex flex-col items-center text-center text-muted-foreground">
                            {scanResult ? (
                                <Alert>
                                    <QrCode className="h-4 w-4" />
                                    <AlertTitle>Escaneo Exitoso</AlertTitle>
                                    <AlertDescription>
                                        <p>El dispositivo con ID:</p>
                                        <p className="font-mono bg-muted p-2 rounded-md my-2 break-all">{scanResult}</p>
                                        <p>ha sido registrado y está listo para ser configurado.</p>
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <QrCode className="h-16 w-16 mb-4" />
                                    <p>El escáner de QR está inactivo.</p>
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button onClick={toggleScanning} variant={scanResult ? "secondary" : "default"}>
                        {isScanning ? (
                            <>
                                <CameraOff className="mr-2 h-4 w-4" />
                                Detener Escáner
                            </>
                        ) : (
                            <>
                                <Camera className="mr-2 h-4 w-4" />
                                {scanResult ? 'Escanear Otro' : 'Iniciar Escáner'}
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
