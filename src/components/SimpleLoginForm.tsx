'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';

export default function SimpleLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };

  const quickLogin = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Dépenses Familiales</CardTitle>
          <CardDescription>
            Connectez-vous pour gérer les dépenses
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>Mot de passe</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Connexion...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <LogIn className="h-4 w-4" />
                  <span>Se connecter</span>
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-3 pt-4 border-t">
            <p className="text-sm font-medium text-center text-gray-700">Comptes de test :</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Badge variant="outline">Jean Dupont</Badge>
                  <span className="ml-2 text-gray-600">jean.dupont@famille.com</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('jean.dupont@famille.com', 'password123')}
                  disabled={isLoading}
                >
                  Tester
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Badge variant="outline">Marie Dupont</Badge>
                  <span className="ml-2 text-gray-600">marie.dupont@famille.com</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('marie.dupont@famille.com', 'password123')}
                  disabled={isLoading}
                >
                  Tester
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Badge variant="outline">Pierre Dupont</Badge>
                  <span className="ml-2 text-gray-600">pierre.dupont@famille.com</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin('pierre.dupont@famille.com', 'password123')}
                  disabled={isLoading}
                >
                  Tester
                </Button>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Mot de passe pour tous : password123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
