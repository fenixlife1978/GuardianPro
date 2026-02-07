import { MessagingForm } from '@/components/admin/messaging-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function MessagingPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mensajería Directa</h2>
        <p className="text-muted-foreground">Envía mensajes emergentes a las tablets de los estudiantes.</p>
      </div>

      <Card>
        <CardHeader>
            <CardTitle>Enviar un nuevo mensaje</CardTitle>
            <CardDescription>Selecciona un destinatario y escribe tu mensaje. Se enviará como una notificación emergente.</CardDescription>
        </CardHeader>
        <CardContent>
            <MessagingForm />
        </CardContent>
      </Card>
    </div>
  );
}
