'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/common/logo';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('vallecondo@gmail.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent, targetUser: 'admin' | 'super-admin') => {
    e.preventDefault();
    if (!auth) return;

    setLoading(true);
    setError(null);

    // Hardcoded check for demo purposes
    if (targetUser === 'admin' && email !== 'admin@colegio.com') {
        if(email !== 'vallecondo@gmail.com') {
            setError('Para acceder como Admin, usa el email: admin@colegio.com');
            setLoading(false);
            return;
        }
    } else if (targetUser === 'super-admin' && email !== 'vallecondo@gmail.com') {
        setError('Para acceder como Super Admin, usa el email: vallecondo@gmail.com');
        setLoading(false);
        return;
    }


    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: 'Inicio de Sesión Exitoso',
        description: 'Redirigiendo a tu panel...',
      });
      
      const redirectUrl = searchParams.get('redirect') || (targetUser === 'super-admin' ? '/super-admin' : '/dashboard');
      router.push(redirectUrl);

    } catch (err: any) {
      console.error(err);
      const errorCode = err.code;
      let friendlyMessage = 'Ocurrió un error inesperado.';
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        friendlyMessage = 'El email o la contraseña son incorrectos.';
      } else if (errorCode === 'auth/invalid-email') {
        friendlyMessage = 'El formato del email no es válido.';
      }
      setError(friendlyMessage);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al panel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Contraseña</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error de Autenticación</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" onClick={(e) => handleLogin(e, 'super-admin')} disabled={loading}>
                    {loading ? "Accediendo..." : "Acceder como Super Admin"}
                </Button>
                <Button variant="outline" className="w-full" onClick={(e) => handleLogin(e, 'admin')} disabled={loading}>
                    {loading ? "Accediendo..." : "Acceder como Admin"}
                </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
