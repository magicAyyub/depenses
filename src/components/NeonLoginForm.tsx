'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { User } from '@/types';

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

export default function NeonLoginForm({ onSuccess }: LoginFormProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Connexion réussie !');
        onSuccess(data.user);
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

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm sm:max-w-md mx-auto">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Connexion</CardTitle>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Connectez-vous à votre compte pour continuer.
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label className='font-medium text-gray-700 text-sm sm:text-base' htmlFor="emailOrUsername">Email ou nom d&apos;utilisateur</Label>
            <Input
              id="emailOrUsername"
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="entrez votre email ou nom d'utilisateur"
              required
              className="h-10 sm:h-12 text-sm sm:text-base"
            />
          </div>
          
          <div className="space-y-2">
            <Label className='font-medium text-gray-700 text-sm sm:text-base' htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
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
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}
