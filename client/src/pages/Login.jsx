import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Your existing login logic goes here
      await login(email, password);
      navigate('/books');
    } catch (error) {
      console.error(error);
      alert("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] text-white selection:bg-cyan-400 selection:text-black">
      
      {/* --- CUSTOM CSS FOR ANIMATIONS (Injected to work instantly) --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-blob { animation: blob 7s infinite; }
        .animate-shimmer { animation: shimmer 2s infinite; }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
        .input-glass {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }
        .input-glass:focus {
          border-color: #22d3ee; /* cyan-400 */
          box-shadow: 0 0 15px rgba(34, 211, 238, 0.2);
          background: rgba(0, 0, 0, 0.5);
        }
        .glow-button {
          box-shadow: 0 0 20px rgba(34, 211, 238, 0.3);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .glow-button:hover {
          box-shadow: 0 0 35px rgba(34, 211, 238, 0.5);
        }
      `}</style>

      {/* --- BACKGROUND BLOBS --- */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#0a0a0a] via-[#121212] to-[#000000]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-panel w-full p-10 rounded-[2.5rem] animate-float">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shadow-2xl mb-6 ring-1 ring-white/20">
              <BookOpen className="w-8 h-8 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 uppercase">
              Sign in to LibroSys
            </h1>
            <p className="text-xs text-zinc-500 text-center tracking-widest uppercase font-medium">
              Access your personal library workspace
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] pl-1" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <input 
                  className="input-glass block w-full rounded-xl py-4 px-5 text-white placeholder-zinc-600 focus:outline-none focus:ring-0 transition duration-300" 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-100 group-focus-within:text-cyan-400 transition-all duration-300">
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]" htmlFor="password">
                  Password
                </label>
                <a className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest hover:text-white transition-colors cursor-pointer" href="#">
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <input 
                  className="input-glass block w-full rounded-xl py-4 px-5 text-white placeholder-zinc-600 focus:outline-none focus:ring-0 transition duration-300" 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none opacity-40 group-focus-within:opacity-100 group-focus-within:text-cyan-400 transition-all duration-300">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              className="w-full relative overflow-hidden group bg-cyan-400 text-black font-black py-4 px-4 rounded-xl focus:outline-none glow-button transition-all duration-300 transform hover:-translate-y-1 active:scale-95 uppercase tracking-tighter text-lg disabled:opacity-70 disabled:cursor-not-allowed" 
              type="submit"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <span className="flex items-center justify-center gap-2 relative z-10">
                {loading ? 'Logging in...' : 'Continue'}
                <ArrowRight className="w-5 h-5 font-bold transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10 text-center">
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-medium">
              New here? 
              <a onClick={() => navigate('/register')} className="font-bold text-cyan-400 hover:text-white transition-colors relative inline-block group ml-1 cursor-pointer">
                Create account
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </p>
          </div>

        </div>
        {/* Reflection/Glow at bottom */}
        <div className="w-2/3 h-4 mx-auto mt-6 bg-cyan-400/5 blur-2xl rounded-[100%]"></div>
      </div>
    </div>
  );
};

export default Login;