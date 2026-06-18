'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { User } from '@/types';

import { PinCodeInput } from './PinCodeInput';

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

type FileMode = 'credentials' | 'setup' | 'verify';

export default function NeonLoginForm({ onSuccess }: LoginFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [newPinDigits, setNewPinDigits] = useState<string[]>(['', '', '', '']);
  const [confirmPinDigits, setConfirmPinDigits] = useState<string[]>(['', '', '', '']);
  const [pinMode, setPinMode] = useState<FileMode>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const pin = pinDigits.join('');
    const newPin = newPinDigits.join('');
    const confirmPin = confirmPinDigits.join('');

    // Validation locale pour le mode setup
    if (pinMode === 'setup') {
      if (newPin.length !== 4 || confirmPin.length !== 4) {
        setError('Veuillez remplir les 4 chiffres du code PIN.');
        setLoading(false);
        return;
      }
      if (newPin !== confirmPin) {
        setError('Les codes PIN ne correspondent pas.');
        setLoading(false);
        return;
      }
    }

    // Validation locale pour le mode verify
    if (pinMode === 'verify') {
      if (pin.length !== 4) {
        setError('Veuillez remplir les 4 chiffres du code PIN.');
        setLoading(false);
        return;
      }
    }

    try {
      const body: Record<string, string> = { emailOrUsername, password };
      if (pinMode === 'verify') {
        body.pin = pin;
      } else if (pinMode === 'setup') {
        body.newPin = newPin;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        if (data.requirePinSetup) {
          setPinMode('setup');
          setError('');
        } else if (data.requirePinVerify) {
          setPinMode('verify');
          setError('');
        } else {
          toast.success('Connexion réussie !');
          onSuccess(data.user);
        }
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setPinMode('credentials');
    setPinDigits(['', '', '', '']);
    setNewPinDigits(['', '', '', '']);
    setConfirmPinDigits(['', '', '', '']);
    setError('');
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto my-2 p-3 bg-blue-100 rounded-full w-fit">
            <Lock className="h-6 w-6 text-blue-600 animate-pulse" />
          </div>
          
          <CardTitle className="text-xl sm:text-2xl">
            {pinMode === 'credentials' && 'Connexion'}
            {pinMode === 'setup' && 'Sécurité PIN'}
            {pinMode === 'verify' && 'Vérification PIN'}
          </CardTitle>
          
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            {pinMode === 'credentials' && 'Connectez-vous à votre compte pour continuer.'}
            {pinMode === 'setup' && 'Configurez votre code PIN à 4 chiffres.'}
            {pinMode === 'verify' && 'Saisissez votre code PIN secret à 4 chiffres.'}
          </p>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            
            {pinMode === 'credentials' && (
              <>
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 text-sm sm:text-base" htmlFor="emailOrUsername">
                    Email ou nom d&apos;utilisateur
                  </Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="Ex: jean_dupont"
                    required
                    className="h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 text-sm sm:text-base" htmlFor="password">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="************"
                      required
                      className="h-10 sm:h-12 text-sm sm:text-base pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full h-10 sm:h-12 text-sm sm:text-base font-medium" disabled={loading}>
                  {loading ? 'Vérification...' : 'Continuer'}
                </Button>
              </>
            )}

            {pinMode === 'setup' && (
              <>
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 text-sm sm:text-base block text-center">
                    Nouveau code PIN (4 chiffres)
                  </Label>
                  <PinCodeInput
                    value={newPinDigits}
                    onChange={setNewPinDigits}
                    disabled={loading}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 text-sm sm:text-base block text-center">
                    Confirmer le code PIN
                  </Label>
                  <PinCodeInput
                    value={confirmPinDigits}
                    onChange={setConfirmPinDigits}
                    disabled={loading}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-2 h-10 sm:h-12 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </>
            )}

            {pinMode === 'verify' && (
              <>
                <div className="space-y-2">
                  <Label className="font-medium text-gray-700 text-sm sm:text-base block text-center">
                    Saisissez votre code PIN (4 chiffres)
                  </Label>
                  <PinCodeInput
                    value={pinDigits}
                    onChange={setPinDigits}
                    disabled={loading}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    className="flex-2 h-10 sm:h-12 text-sm sm:text-base font-medium"
                    disabled={loading}
                  >
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


