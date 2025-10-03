import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Shield, CheckCircle, Copy } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface TwoFactorAuthProps {
  onSuccess?: () => void;
}

export function TwoFactorAuth({ onSuccess }: TwoFactorAuthProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [, setIs2FAEnabled] = useState(false);
  const [step, setStep] = useState<'check' | 'enroll' | 'verify' | 'enabled'>('check');
  const { toast } = useToast();

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const factors = await supabase.auth.mfa.listFactors();
        const hasActiveFactor = factors.data?.all.some(f => f.status === 'verified');
        setIs2FAEnabled(!!hasActiveFactor);
        setStep(hasActiveFactor ? 'enabled' : 'check');
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const enrollMFA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
      });

      if (error) throw error;

      if (data) {
        setQrCode(data.totp.qr_code);
        setSecret(data.totp.secret);
        setStep('verify');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al configurar 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un código de 6 dígitos',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      const factor = factors.data?.all[0];

      if (!factor) throw new Error('No se encontró el factor MFA');

      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: verificationCode,
      });

      if (error) throw error;

      setIs2FAEnabled(true);
      setStep('enabled');
      toast({
        title: 'Éxito',
        description: '2FA activado correctamente',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Código inválido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const disableMFA = async () => {
    setLoading(true);
    try {
      const factors = await supabase.auth.mfa.listFactors();
      const factor = factors.data?.all.find(f => f.status === 'verified');

      if (!factor) throw new Error('No se encontró factor activo');

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: factor.id,
      });

      if (error) throw error;

      setIs2FAEnabled(false);
      setStep('check');
      toast({
        title: 'Éxito',
        description: '2FA desactivado correctamente',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al desactivar 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast({
        title: 'Copiado',
        description: 'Secreto copiado al portapapeles',
      });
    }
  };

  if (step === 'check') {
    return (
      <Card data-testid="card-2fa-setup">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <CardTitle>Autenticación de Dos Factores (2FA)</CardTitle>
          </div>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La autenticación de dos factores añade seguridad adicional requiriendo un código de tu
            aplicación de autenticación cada vez que inicies sesión.
          </p>
          <Button 
            onClick={() => setStep('enroll')} 
            className="w-full"
            data-testid="button-enable-2fa"
          >
            <Shield className="h-4 w-4 mr-2" />
            Activar 2FA
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'enroll') {
    return (
      <Card data-testid="card-2fa-enroll">
        <CardHeader>
          <CardTitle>Configurar 2FA</CardTitle>
          <CardDescription>
            Escanea el código QR con tu aplicación de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
            <li>Descarga una app de autenticación (Google Authenticator, Authy, etc.)</li>
            <li>Haz clic en "Generar código QR"</li>
            <li>Escanea el código QR con tu app</li>
            <li>Ingresa el código de 6 dígitos para verificar</li>
          </ol>
          <Button 
            onClick={enrollMFA} 
            disabled={loading}
            className="w-full"
            data-testid="button-generate-qr"
          >
            {loading ? 'Generando...' : 'Generar código QR'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'verify') {
    return (
      <Card data-testid="card-2fa-verify">
        <CardHeader>
          <CardTitle>Verificar 2FA</CardTitle>
          <CardDescription>
            Escanea el código QR y ingresa el código de verificación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {qrCode && (
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCode} alt="QR Code" className="w-48 h-48" data-testid="img-qr-code" />
              </div>
              
              {secret && (
                <div className="w-full">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    O ingresa este código manualmente:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                      {secret}
                    </code>
                    <Button 
                      onClick={copySecret} 
                      variant="outline" 
                      size="icon"
                      data-testid="button-copy-secret"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Código de verificación
            </label>
            <Input
              type="text"
              placeholder="123456"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              data-testid="input-verification-code"
            />
          </div>

          <Button 
            onClick={verifyMFA} 
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
            data-testid="button-verify-2fa"
          >
            {loading ? 'Verificando...' : 'Verificar y Activar'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 'enabled') {
    return (
      <Card data-testid="card-2fa-enabled">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle>2FA Activado</CardTitle>
          </div>
          <CardDescription>
            Tu cuenta está protegida con autenticación de dos factores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Autenticación de dos factores activa
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Tu cuenta está protegida. Se te pedirá un código cada vez que inicies sesión.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={disableMFA} 
            disabled={loading}
            variant="destructive"
            className="w-full"
            data-testid="button-disable-2fa"
          >
            {loading ? 'Desactivando...' : 'Desactivar 2FA'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}