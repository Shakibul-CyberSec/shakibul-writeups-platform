'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import { FiLock, FiKey } from 'react-icons/fi';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [hpAccessKey, setHpAccessKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, hp_website_trap: hpAccessKey })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/portal-shakibul-cyber-cms/editor';
      } else {
        setErrorMsg(data.message || 'Invalid password credentials');
      }
    } catch (err) {
      setErrorMsg('Authentication error. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <ThemeSwitcher />

      <main className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full p-8 border border-cyber-border space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-neon-green/10 border border-neon-green/40 flex items-center justify-center text-neon-green mx-auto shadow-lg shadow-neon-green/10">
              <FiLock className="text-2xl" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">Admin Access Portal</h1>
            <p className="text-xs font-sans text-cyber-gray">
              Protected authentication portal for Shakibul Bokthiar.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono text-center leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">

            <div className="space-y-1.5">
              <label className="text-xs font-sans text-cyber-gray">Security Access Key</label>
              <div className="relative flex items-center">
                <FiKey className="absolute left-3 text-cyber-gray" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secret admin password..."
                  className="w-full pl-10 pr-4 py-3 bg-[#0a0d14] border border-[#1a2336] rounded-xl text-white font-mono text-xs focus:outline-none focus:border-neon-green transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-neon-green/20 hover:bg-neon-green/30 border border-neon-green text-neon-green font-sans text-xs font-bold rounded-xl transition-all duration-300 shadow-md hover:shadow-neon-green/20 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Authenticate Secret Session'}
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs font-sans text-cyber-gray hover:text-white transition-colors">
              ← Return to Public Blog Feed
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
