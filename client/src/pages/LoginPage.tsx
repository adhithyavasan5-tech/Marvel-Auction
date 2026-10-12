import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

const AVATARS = [
  { name: 'Captain', url: 'https://i.pinimg.com/736x/57/4a/09/574a09b77a2c69a51d9761f045d9a3a5.jpg' },
  { name: 'Iron Man', url: 'https://i.pinimg.com/736x/84/7b/1e/847b1e563d95b08430a711389e9a2875.jpg' },
  { name: 'Thor', url: 'https://i.pinimg.com/736x/40/74/71/40747151783756ff94b39e018048d30e.jpg' },
  { name: 'Hulk', url: 'https://i.pinimg.com/1200x/6e/56/ef/6e56eff768d2735658117e5370df0041.jpg' },
  { name: 'Loki', url: 'https://i.pinimg.com/736x/15/f8/3d/15f83d8bea83c1ed3dbac557cd38a27e.jpg' }
];

export const LoginPage = () => {
  const { login } = useUser();
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0].url);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Name is required.');
    if (!userId.trim()) return setError('User ID is required.');
    if (/\s/.test(userId)) return setError('User ID cannot contain spaces.');
    if (password.length < 4) return setError('Password must be at least 4 characters.');

    // Save and login
    login({ name: name.trim(), userId: userId.trim(), avatar });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="luxury-card w-full max-w-md p-8 rounded-xl shadow-2xl transition-all animate-in fade-in duration-700 slide-in-from-bottom-4 bg-gradient-to-b from-[#171A23] to-[#0A0C10] border border-[#C6A15B]/20">
        <div className="text-center mb-8">
          <h1 className="font-cinzel text-3xl font-bold tracking-widest text-gold-gradient uppercase mb-2">
            Identify Yourself
          </h1>
          <p className="text-sm text-[#9295A0]">Enter the high-stakes auction arena.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#9295A0] uppercase mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="w-full bg-[#111319] border border-[#C6A15B]/20 rounded-md p-3 text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B] transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Steve Rogers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#9295A0] uppercase mb-1">
                User ID
              </label>
              <input
                type="text"
                className="w-full bg-[#111319] border border-[#C6A15B]/20 rounded-md p-3 text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B] transition-colors"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="steve_rogers (no spaces)"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#9295A0] uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full bg-[#111319] border border-[#C6A15B]/20 rounded-md p-3 text-[#F5F0E7] focus:outline-none focus:border-[#C6A15B] transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#9295A0] uppercase mb-3">
              Select Avatar
            </label>
            <div className="flex flex-wrap gap-4 justify-center">
              {AVATARS.map((item) => (
                <div key={item.name} className="flex flex-col items-center gap-1.5 cursor-pointer" onClick={() => setAvatar(item.url)}>
                  <button
                    type="button"
                    className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all duration-300 ${avatar === item.url
                      ? 'border-[#C6A15B] scale-110 shadow-[0_0_15px_rgba(198,161,91,0.5)]'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                      }`}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover bg-[#08090D]"
                      onError={(e) => {
                        console.error(`Failed to load avatar for ${item.name} from ${item.url}`);
                        (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=120&auto=format&fit=crop&q=80';
                      }}
                    />
                  </button>
                  <span className={`text-[9px] font-cinzel font-bold tracking-wider uppercase transition-colors ${avatar === item.url ? 'text-[#C6A15B]' : 'text-[#9295A0]'
                    }`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-[#E01414]/10 border border-[#E01414]/50 text-[#E01414] p-3 rounded-md text-sm text-center font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#E01414] hover:bg-[#C62838] text-white font-bold uppercase tracking-widest py-4 rounded-md transition-all duration-300 shadow-[0_0_15px_rgba(224,20,20,0.3)] hover:shadow-[0_0_25px_rgba(224,20,20,0.6)]"
          >
            Enter Arena
          </button>
        </form>
      </div>
    </div>
  );
};
