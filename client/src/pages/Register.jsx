import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Added for the toggle button in the design
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await register(formData.name, formData.email, formData.password);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="bg-background-dark min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-300">
      
      {/* --- CUSTOM CSS FOR ANIMATIONS (Injected for portability) --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-shimmer { animation: shimmer 1.5s infinite; }
        
        .mesh-bg {
            background: radial-gradient(at 0% 0%, hsla(222,47%,11%,1) 0, transparent 50%), 
                        radial-gradient(at 50% 0%, hsla(201,100%,15%,1) 0, transparent 50%), 
                        radial-gradient(at 100% 0%, hsla(190,100%,40%,0.2) 0, transparent 50%), 
                        radial-gradient(at 0% 50%, hsla(210,100%,20%,1) 0, transparent 50%), 
                        radial-gradient(at 100% 50%, hsla(200,80%,40%,0.3) 0, transparent 50%), 
                        radial-gradient(at 0% 100%, hsla(222,47%,11%,1) 0, transparent 50%), 
                        radial-gradient(at 100% 100%, hsla(180,100%,95%,0.1) 0, transparent 50%);
            background-size: 200% 200%;
            animation: gradient-x 15s ease infinite;
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(186, 230, 253, 0.1);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.6);
        }
        .iridescent-border {
            position: relative;
        }
        .iridescent-border::before {
            content: "";
            position: absolute;
            inset: -1px;
            border-radius: inherit;
            padding: 1px;
            background: linear-gradient(135deg, #0c4a6e, #0ea5e9, #e0f2fe, #0ea5e9, #0c4a6e);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.4;
            z-index: -1;
        }
        .neon-input:focus {
            box-shadow: 0 0 15px rgba(14, 165, 233, 0.3), inset 0 0 10px rgba(14, 165, 233, 0.05);
            border-color: #0ea5e9;
        }
        .btn-glow {
            background-size: 200% auto;
            background-image: linear-gradient(to right, #0369a1 0%, #0ea5e9 51%, #0369a1 100%);
            transition: 0.5s;
        }
        .btn-glow:hover {
            background-position: right center;
            box-shadow: 0 0 25px rgba(14, 165, 233, 0.5);
        }
        .book-shape {
            position: absolute;
            background: rgba(224, 242, 254, 0.03);
            border: 1px solid rgba(186, 230, 253, 0.08);
            border-radius: 4px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(2px);
        }
      `}</style>

      {/* --- BACKGROUND ELEMENTS --- */}
      <div className="fixed inset-0 w-full h-full mesh-bg opacity-100 z-0 pointer-events-none"></div>
      <div className="fixed inset-0 w-full h-full bg-black/60 z-0 pointer-events-none"></div>
      
      {/* Floating Books */}
      <div className="absolute top-10 left-10 w-24 h-32 book-shape transform rotate-12 animate-float z-0 hidden md:block"></div>
      <div className="absolute bottom-20 right-10 w-32 h-40 book-shape transform -rotate-6 animate-float z-0 hidden md:block" style={{animationDelay: '3s'}}></div>
      <div className="absolute top-1/4 right-1/4 w-16 h-20 book-shape transform rotate-45 opacity-40 blur-sm animate-float z-0"></div>

      {/* --- MAIN CARD --- */}
      <main className="relative z-10 w-full max-w-md px-6 py-8 md:px-0">
        <div className="glass-panel iridescent-border rounded-2xl p-8 md:p-10 relative overflow-hidden group">
          
          {/* Glow Effects inside card */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="text-center mb-8 relative">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2 drop-shadow-[0_2px_10px_rgba(255,255,255,0.1)]">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide">
              Join <span className="text-sky-400 font-semibold">LibroSys</span> today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl mb-4 text-sm text-center animate-fade-in">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2 group/input">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 transition-colors group-focus-within/input:text-sky-400" htmlFor="fullname">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input 
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border-slate-700/50 bg-slate-900/40 backdrop-blur-sm text-white placeholder-slate-600 focus:outline-none focus:ring-0 focus:border-sky-400 neon-input transition-all duration-300" 
                  id="fullname" 
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-2 group/input">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 transition-colors group-focus-within/input:text-sky-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </span>
                <input 
                  className="block w-full pl-10 pr-3 py-3 rounded-xl border-slate-700/50 bg-slate-900/40 backdrop-blur-sm text-white placeholder-slate-600 focus:outline-none focus:ring-0 focus:border-sky-400 neon-input transition-all duration-300" 
                  id="email" 
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2 group/input">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 ml-1 transition-colors group-focus-within/input:text-sky-400" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </span>
                <input 
                  className="block w-full pl-10 pr-10 py-3 rounded-xl border-slate-700/50 bg-slate-900/40 backdrop-blur-sm text-white placeholder-slate-600 focus:outline-none focus:ring-0 focus:border-sky-400 neon-input transition-all duration-300" 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white btn-glow overflow-hidden shadow-lg mt-8 transition-all"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></span>
              <span className="flex items-center gap-2 relative z-10">
                <UserPlus className="w-5 h-5" />
                Sign Up
              </span>
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Already have an account? 
              <Link to="/login" className="font-semibold text-sky-400 hover:text-sky-300 transition-colors duration-200 relative inline-block group/link ml-1">
                Log in
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-400 transform scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </p>
          </div>

          {/* Decorative Bottom Line */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-sky-900 via-sky-400 to-white opacity-40"></div>
        </div>
        
        {/* Decorative Bottom Pill */}
        <div className="mt-8 flex justify-center">
          <div className="h-1 w-32 bg-sky-100/10 rounded-full backdrop-blur-sm"></div>
        </div>
      </main>
    </div>
  );
};

export default Register;