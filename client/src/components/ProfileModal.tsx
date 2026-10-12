import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext.js';
import { useAuction } from '../context/AuctionContext.js';
import { X, User, Shield, Check, Upload, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_AVATARS = [
  { name: 'Captain America', url: 'https://i.pinimg.com/736x/57/4a/09/574a09b77a2c69a51d9761f045d9a3a5.jpg' },
  { name: 'Iron Man', url: 'https://i.pinimg.com/736x/84/7b/1e/847b1e563d95b08430a711389e9a2875.jpg' },
  { name: 'Thor', url: 'https://i.pinimg.com/736x/40/74/71/40747151783756ff94b39e018048d30e.jpg' },
  { name: 'Hulk', url: 'https://i.pinimg.com/1200x/6e/56/ef/6e56eff768d2735658117e5370df0041.jpg' },
  { name: 'Loki', url: 'https://i.pinimg.com/736x/15/f8/3d/15f83d8bea83c1ed3dbac557cd38a27e.jpg' },
 
  { name: 'Spider-Man', url: 'https://i.pinimg.com/1200x/e7/1e/00/e71e00e068eb9d36473e85fec001ebc2.jpg' },
  
  { name: 'Wolverine', url: 'https://i.pinimg.com/736x/27/a9/ff/27a9ffa2c856ad90e49a8579b01cedb9.jpg' },
 
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useUser();
  const { updateProfileName } = useAuction();

  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [avatar, setAvatar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or user updates
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setUserId(user.userId || '');
      setAvatar(user.avatar || PRESET_AVATARS[0].url);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, user]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setUserId(user.userId);
      setAvatar(user.avatar);
    }
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported image format. Please select a JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (max 2.5 MB)
    const maxSize = 2.5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image file is too large (maximum 2.5 MB allowed).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read selected image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedName = name.trim();
    const trimmedUserId = userId.trim();

    // Validations
    if (!trimmedName) {
      setError('Display name cannot be empty.');
      return;
    }

    if (!trimmedUserId) {
      setError('Username handle cannot be empty.');
      return;
    }

    if (/\s/.test(trimmedUserId)) {
      setError('Username cannot contain spaces.');
      return;
    }

    if (trimmedUserId.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Validate uniqueness if changed from current username
      if (trimmedUserId.toLowerCase() !== user.userId.toLowerCase()) {
        try {
          const checkRes = await fetch(
            `/api/auth/check-username?username=${encodeURIComponent(trimmedUserId)}&current=${encodeURIComponent(user.userId)}`
          );
          if (checkRes.ok) {
            const data = await checkRes.json();
            if (data.available === false) {
              setError(`The username @${trimmedUserId} is already taken by another bidder.`);
              setLoading(false);
              return;
            }
          }
        } catch {
          // If server check fails or offline, continue with local update
        }
      }

      // Persist to UserContext and LocalStorage
      const updatedUser = {
        name: trimmedName,
        userId: trimmedUserId,
        avatar: avatar || user.avatar
      };

      updateUser(updatedUser);

      // Synchronize with active auction room via AuctionContext
      updateProfileName(trimmedName, avatar || user.avatar);

      // Attempt to synchronize with backend store if available
      try {
        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentUsername: user.userId,
            username: trimmedUserId,
            name: trimmedName,
            avatar: avatar || user.avatar
          })
        });
      } catch {
        // Backend optional sync
      }

      setSuccess('Profile updated successfully! Synchronized across the dynasty.');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile changes.');
    } finally {
      setLoading(false);
    }
  };

  const persistentPlayerId = localStorage.getItem('dynasty_player_id') || user.userId;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="relative w-full max-w-lg my-8 rounded-2xl bg-gradient-to-b from-[#171A23] via-[#111319] to-[#0A0C10] border border-[#C6A15B]/40 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-[#C6A15B]/20 flex items-center justify-between bg-gradient-to-r from-[#111319] to-[#1A1D27]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center text-[#F0D79A] shadow-[0_0_12px_rgba(198,161,91,0.25)]">
              <User className="w-5 h-5 text-[#F0D79A]" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="font-cinzel text-base sm:text-lg font-bold text-gold-gradient tracking-wider">
                MY BIDDER PROFILE
              </h2>
              <p className="text-xs text-[#9295A0]">Customize your auction chamber persona</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleCancel} 
            className="p-2 rounded-lg text-[#9295A0] hover:text-white hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B]"
            aria-label="Close profile editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Alerts */}
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-emerald-950/40">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-200 text-xs font-semibold flex items-center gap-2.5 shadow-lg shadow-rose-950/40">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="p-4 rounded-xl bg-[#08090D]/90 border border-[#C6A15B]/30 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
            <div className="relative flex-shrink-0">
              <img
                src={avatar || PRESET_AVATARS[0].url}
                alt="Avatar preview"
                className="w-16 h-16 rounded-full border-2 border-[#C6A15B] object-cover bg-[#111319] shadow-[0_0_15px_rgba(198,161,91,0.3)]"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=120&auto=format&fit=crop&q=80';
                }}
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#08090D]" />
            </div>

            <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-cinzel font-bold text-sm text-[#F5F0E7] truncate max-w-[180px]">
                  {name.trim() || 'Your Display Name'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#C6A15B]/15 text-[#F0D79A] border border-[#C6A15B]/30">
                  LIVE PREVIEW
                </span>
              </div>
              <div className="text-xs text-[#9295A0] font-mono">
                @{userId.trim() || 'username'}
              </div>
              <div className="text-[10px] text-[#9295A0]/80 font-mono">
                BIDDER ID: {persistentPlayerId}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name Input */}
            <div>
              <label htmlFor="profile-display-name" className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                id="profile-display-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tony Stark"
                maxLength={40}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-[#08090D] border border-[#C6A15B]/30 focus:border-[#F0D79A] text-sm text-[#F5F0E7] placeholder-[#9295A0]/50 focus:outline-none focus:ring-1 focus:ring-[#C6A15B] transition-colors"
              />
              <p className="text-[10px] text-[#9295A0] mt-1">This name appears on the leaderboard, rosters, and live gavel bids.</p>
            </div>

            {/* Username Handle Input */}
            <div>
              <label htmlFor="profile-username" className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider mb-1.5">
                Username Handle (@)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#9295A0] font-mono">@</span>
                <input
                  id="profile-username"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\s+/g, ''))}
                  placeholder="tony_stark"
                  maxLength={30}
                  required
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#08090D] border border-[#C6A15B]/30 focus:border-[#F0D79A] text-sm text-[#F5F0E7] font-mono placeholder-[#9295A0]/50 focus:outline-none focus:ring-1 focus:ring-[#C6A15B] transition-colors"
                />
              </div>
              <p className="text-[10px] text-[#9295A0] mt-1">Unique handle with no spaces. Your auction player identity remains preserved.</p>
            </div>

            {/* Avatar Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase font-semibold text-[#C6A15B] tracking-wider">
                  Chamber Avatar
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-[#F0D79A] hover:text-white transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Custom Image</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Preset Avatar Gallery */}
              <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 rounded-xl bg-[#08090D] border border-[#C6A15B]/20">
                {PRESET_AVATARS.map((av, idx) => {
                  const isSelected = avatar === av.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(av.url)}
                      title={av.name}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-[#C6A15B] ring-2 ring-[#C6A15B]/60 scale-105 shadow-md shadow-[#C6A15B]/30'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#C6A15B]/40'
                      }`}
                    >
                      <img
                        src={av.url}
                        alt={av.name}
                        className="w-full h-full object-cover bg-[#111319]"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=120&auto=format&fit=crop&q=80';
                        }}
                      />
                      {isSelected && (
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#C6A15B] flex items-center justify-center text-[#08090D]">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-[#C6A15B]/20">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#C6A15B]/30 hover:border-[#C6A15B]/60 text-xs font-cinzel font-semibold text-[#9295A0] hover:text-[#F5F0E7] transition-all disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C6A15B] via-[#E5C378] to-[#C6A15B] text-[#08090D] font-cinzel font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(198,161,91,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>SAVING...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-[#08090D]" />
                  <span>SAVE CHANGES</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
