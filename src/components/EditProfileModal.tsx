'use client';

import React, { useState, useEffect } from 'react';
import { useNeonAuth } from '@/contexts/NeonAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PinCodeInput } from '@/components/PinCodeInput';
import { toast } from 'sonner';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useNeonAuth();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [changePin, setChangePin] = useState(false);
  const [newPinDigits, setNewPinDigits] = useState<string[]>(['', '', '', '']);
  const [confirmPinDigits, setConfirmPinDigits] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setFullName(user.fullName || '');
    }
    setChangePin(false);
    setNewPinDigits(['', '', '', '']);
    setConfirmPinDigits(['', '', '', '']);
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !fullName.trim()) {
      toast.error('Tous les champs sont obligatoires');
      return;
    }

    let pin = '';
    if (changePin && !user?.isAdmin) {
      pin = newPinDigits.join('');
      const confirmPin = confirmPinDigits.join('');
      if (pin.length !== 4 || confirmPin.length !== 4) {
        toast.error('Veuillez saisir un code PIN de 4 chiffres');
        return;
      }
      if (pin !== confirmPin) {
        toast.error('Les codes PIN ne correspondent pas');
        return;
      }
    }

    try {
      setLoading(true);
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          fullName: fullName.trim(),
          pin: changePin && !user?.isAdmin ? pin : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Profil mis à jour avec succès');
        if (updateUser) {
          updateUser(data.user);
        }
        onClose();
      } else {
        toast.error(data.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Modifier mon profil</DialogTitle>
          <DialogDescription className="text-gray-500">
            Mettez à jour vos informations de profil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="profile-fullName" className="text-sm font-semibold text-gray-700">Nom complet</Label>
            <Input
              id="profile-fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              required
              disabled={loading}
              className="w-full text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-username" className="text-sm font-semibold text-gray-700">Nom d&apos;utilisateur</Label>
            <Input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: jean_dupont"
              required
              disabled={loading}
              className="w-full text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-md"
            />
          </div>

          {!user.isAdmin && (
            <div className="border-t border-gray-100 pt-4 mt-4 space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="change-pin-checkbox"
                  checked={changePin}
                  onChange={(e) => setChangePin(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                  disabled={loading}
                />
                <Label htmlFor="change-pin-checkbox" className="text-sm font-semibold text-gray-700 cursor-pointer select-none">
                  Modifier le code PIN de sécurité
                </Label>
              </div>

              {changePin && (
                <div className="space-y-4 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <Label className="text-center block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nouveau code PIN (4 chiffres)
                    </Label>
                    <PinCodeInput
                      value={newPinDigits}
                      onChange={setNewPinDigits}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-center block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Confirmer le code PIN
                    </Label>
                    <PinCodeInput
                      value={confirmPinDigits}
                      onChange={setConfirmPinDigits}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
