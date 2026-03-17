'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from "react-router-dom";

import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AuthFlipPage = () => {
    const pathname = usePathname();
    const navigate = useNavigate();
    const initial = pathname.includes('/register') ? 'register' : 'login';
    const [mode, setMode] = useState(initial);

    // Login state
    const { login, register } = useAuth();
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [showLoginPwd, setShowLoginPwd] = useState(false);

    // Register state
    const [regData, setRegData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [showRegPwd, setShowRegPwd] = useState(false);
    const [showRegConfirm, setShowRegConfirm] = useState(false);

    useEffect(() => {
        setMode(initial);
    }, [initial]);

    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegChange = (e) => setRegData({ ...regData, [e.target.name]: e.target.value });

    const submitLogin = async (e) => {
        e.preventDefault();
        if (!loginData.email || !loginData.password) return toast.error('Please fill all fields');
        const res = await login(loginData.email, loginData.password);
        if (res.success) navigate('/');
    };

    const submitRegister = async (e) => {
        e.preventDefault();
        if (!regData.name || !regData.email || !regData.password || !regData.confirmPassword) return toast.error('Please fill all fields');
        if (regData.password !== regData.confirmPassword) return toast.error('Passwords do not match');
        if (regData.password.length < 6) return toast.error('Password must be at least 6 characters');
        const res = await register(regData.name, regData.email, regData.password);
        if (res.success) navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-black p-8 md:p-14">
            <div className="relative">
                <style>{`
                    .flip-scene { perspective: 1600px; }
                    .flip-card { width: 1040px; max-width: 96vw; height: 680px; position: relative; transform-style: preserve-3d; transition: transform 900ms cubic-bezier(.2,.9,.2,1); }
                    .flip-card.flipped { transform: rotateY(-180deg); }
                    .flip-face { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(16,24,40,0.15); }
                    .flip-front { background: white; transform: rotateY(0deg); }
                    /* UPDATED: gray Gradient */
                    .flip-back { background: linear-gradient(135deg, #34d399, #047857); color: white; transform: rotateY(180deg); }
                    .flip-controls { position: absolute; top: 20px; right: 20px; z-index: 40; }
                        /* Force placeholder color on both faces so it remains readable */
                        .flip-front input::placeholder,
                        .flip-back input::placeholder {
                            color: rgba(0,0,0,0.5) !important;
                            opacity: 1 !important;
                        }
                `}</style>

                <div className="flip-scene">
                    <div className={`flip-card ${mode === 'register' ? 'flipped' : ''}`}>

                        {/* Front Face - Login */}
                        <div className="flip-face flip-front flex">
                            {/* Left Side: Form */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                <div className="max-w-md mx-auto w-full">
                                    <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Welcome Back</h2>
                                    <p className="text-gray-600 mb-8">Sign in to your account to continue</p>

                                    <form onSubmit={submitLogin} className="space-y-5">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Email</label>
                                            <div className="relative mt-1">
                                                <i className="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                                                <input name="email" value={loginData.email} onChange={handleLoginChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 placeholder-gray-600 transition" placeholder="Enter your email" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-700">Password</label>
                                            <div className="relative mt-1">
                                                <i className="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                                                <input name="password" type={showLoginPwd ? 'text' : 'password'} value={loginData.password} onChange={handleLoginChange} className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-700 focus:ring-1 focus:ring-gray-700 placeholder-gray-600 transition" placeholder="Enter your password" />
                                                <button type="button" onClick={() => setShowLoginPwd(!showLoginPwd)} className="absolute right-3 top-3.5 text-gray-900 hover:text-black">
                                                    {showLoginPwd ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                                                </button>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg shadow-gray-400 transition-all">Log In</button>
                                    </form>

                                    <div className="mt-8 text-center text-sm text-gray-900">
                                        Don't have an account? <button onClick={() => setMode('register')} className="text-black font-bold hover:underline">Register</button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Design Panel */}
                            <div className="hidden md:flex w-1/2 bg-gray-50 items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                <div className="text-center max-w-xs relative z-10">
                                    <div className="inline-block bg-white rounded-full p-6 shadow-xl mb-6">
                                        <div className="text-5xl">🌿</div>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-800">Fresh Start?</h3>
                                    <p className="text-gray-600 mt-4 leading-relaxed">Create an account to speed up checkout, track orders, and join our gray community.</p>
                                    <div className="mt-8">
                                        <button onClick={() => setMode('register')} className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white px-8 py-3 rounded-full font-semibold shadow-lg transition-transform hover:scale-105">
                                            Create Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Back Face - Register */}
                        <div className="flip-face flip-back flex">
                            {/* Left Side: Design Panel (Now flipped to left visually) */}
                            <div className="hidden md:flex w-1/2 items-center justify-center p-12">
                                <div className="max-w-xs text-center text-white">
                                    <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full p-6 mb-6">
                                        <div className="text-5xl">👋</div>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">Welcome Back!</h3>
                                    <p className="opacity-90 leading-relaxed text-gray-100">Already have an account? Sign in to access your saved items and profile.</p>
                                    <div className="mt-8">
                                        <button onClick={() => setMode('login')} className="bg-white text-black px-8 py-3 rounded-full font-bold shadow-lg hover:bg-gray-100 transition-transform hover:scale-105">
                                            Login Here
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Form */}
                            <div className="w-full md:w-1/2 p-8 md:p-12 flex items-center justify-center bg-white/10 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
                                <div className="max-w-md w-full">
                                    <h2 className="text-4xl font-extrabold mb-2 text-white">Create Account</h2>
                                    <p className="opacity-90 mb-6 text-gray-200">Enter your details to start your journey.</p>

                                    <form onSubmit={submitRegister} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-semibold text-gray-200">Full Name</label>
                                            <div className="relative mt-1">
                                                <i className="fas fa-user absolute left-3 top-3.5 text-white/70"></i>
                                                <input name="name" value={regData.name} onChange={handleRegChange} className="w-full pl-10 pr-4 py-3 bg-white/20 border border-gray-400/30 rounded-xl 
  focus:outline-none focus:bg-white/30 focus:border-gray-300 
  text-white placeholder-gray-200 transition" placeholder="Enter your full name" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-semibold text-gray-200">Email</label>
                                            <div className="relative mt-1">
                                                <i className="fas fa-envelope absolute left-3 top-3.5 text-white/70"></i>
                                                <input name="email" value={regData.email} onChange={handleRegChange} className="w-full pl-10 pr-4 py-3 bg-white/20 border border-emerald-400/30 rounded-xl 
  focus:outline-none focus:bg-white/30 focus:border-emerald-200 
  text-white placeholder-black transition" placeholder="Email address" />
                                            </div>
                                        </div>
                                        <div className='flex gap-2'>
                                            <div className='w-1/2'>
                                                <label className="text-sm font-semibold text-gray-200">Password</label>
                                                <div className="relative mt-1">
                                                    <i className="fas fa-lock absolute left-3 top-3.5 text-white/70"></i>
                                                    <input name="password" type={showRegPwd ? 'text' : 'password'} value={regData.password} onChange={handleRegChange} className="w-full pl-10 pr-8 py-3 bg-white/20 border border-gray-400/30 rounded-xl focus:outline-none focus:bg-white/30 focus:border-gray-300 text-white placeholder-gray-200 transition" placeholder="Password" />
                                                    <button type="button" onClick={() => setShowRegPwd(!showRegPwd)} className="absolute right-2 top-3.5 text-white/70 hover:text-white">
                                                        {showRegPwd ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className='w-1/2'>
                                                <label className="text-sm font-semibold text-gray-200">Confirm</label>
                                                <div className="relative mt-1">
                                                    <i className="fas fa-lock absolute left-3 top-3.5 text-white/70"></i>
                                                    <input name="confirmPassword" type={showRegConfirm ? 'text' : 'password'} value={regData.confirmPassword} onChange={handleRegChange} className="w-full pl-10 pr-8 py-3 bg-white/20 border border-gray-400/30 rounded-xl focus:outline-none focus:bg-white/30 focus:border-gray-300 text-white placeholder-gray-200 transition" placeholder="Confirm" />
                                                    <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)} className="absolute right-2 top-3.5 text-white/70 hover:text-white">
                                                        {showRegConfirm ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg transition-colors mt-2">Register Now</button>
                                    </form>

                                    {/* Mobile only switch */}
                                    <div className="md:hidden mt-6 text-center text-sm text-gray-300">
                                        Already have an account? <button onClick={() => setMode('login')} className="font-bold text-white underline">Log in</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flip Controls (Top Right) */}
                <div className="flip-controls hidden md:block">
                    <div className="bg-white/10 backdrop-blur-md p-1 rounded-lg border border-white/20 shadow-sm">
                        <button onClick={() => setMode('login')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'login' ? 'bg-white text-black shadow-sm' : 'text-gray-700 hover:text-black'}`}>Login</button>
                        <button onClick={() => setMode('register')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'register' ? 'bg-white text-black shadow-sm' : 'text-gray-700 hover:text-black'}`}>Register</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthFlipPage;