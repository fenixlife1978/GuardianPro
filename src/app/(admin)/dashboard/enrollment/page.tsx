import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { QrCode } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function EnrollmentPage() {
    const qrImage = PlaceHolderImages.find((img) => img.id === 'qr-code');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inscripción Masiva de Dispositivos</h2>
        <p className="text-muted-foreground">Genera códigos QR para enrolar nuevos dispositivos fácilmente.</p>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Generador de Código QR</CardTitle>
          <CardDescription>Usa la cámara del dispositivo para escanear el código y comenzar el proceso de inscripción.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
            {qrImage && (
                <Image
                    src={qrImage.imageUrl}
                    width={200}
                    height={200}
                    alt="Código QR de inscripción"
                    className="rounded-lg"
                    data-ai-hint={qrImage.imageHint}
                />
            )}
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button>
                <QrCode className="mr-2 h-4 w-4" />
                Generar Nuevo Código
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
