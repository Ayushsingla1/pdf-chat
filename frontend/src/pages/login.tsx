import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, LogIn, UserPlus, Loader2, FileText } from 'lucide-react';

const Login = () => {
    const [details, setDetails] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isSignUp, setIsSignUp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        if (!details.username.trim()) {
            newErrors.username = 'Username is required';
        }
        
        if (!details.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(details.email)) {
            newErrors.email = 'Email is invalid';
        }
        
        if (!details.password) {
            newErrors.password = 'Password is required';
        } else if (details.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const signUpHandler = async () => {
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: details.username,
                    email: details.email,
                    password: details.password
                })
            });
            
            if (response.status === 200) {
                const data = await response.json();
                console.log(data);
                alert('Account created successfully!');
                setIsSignUp(false);
            } else {
                throw new Error('Signup failed');
            }
            
            console.log('Signup successful');
            alert('Account created successfully!');
            setIsSignUp(false);
        } catch (error) {
            console.error('Signup failed:', error);
            alert('Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const logInHandler = async () => {
        if (!validateForm()) return;
        
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: details.username,
                    email: details.email,
                    password: details.password
                })
            });
            
            if (response.status === 200) {
                const data = await response.json();
                localStorage.setItem("token", data.token);
                console.log(data);
                window.location.href = '/';
            } else {
                throw new Error('Login failed');
            }
            
            console.log('Login successful');
            localStorage.setItem("token", "demo-token-123");
            alert('Login successful! Redirecting...');
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const changeHandler = (e) => {
        const { name, value } = e.target;
        setDetails(detail => ({
            ...detail,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                        PDF Chat
                    </h1>
                    <p className="text-gray-400">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
                    <div className="flex mb-8 bg-gray-700/50 rounded-lg p-1">
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                !isSignUp 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <LogIn className="w-4 h-4 inline mr-2" />
                            Login
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                                isSignUp 
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <UserPlus className="w-4 h-4 inline mr-2" />
                            Sign Up
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="username"
                                    type="text"
                                    value={details.username}
                                    onChange={changeHandler}
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                                        errors.username 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter your username"
                                />
                            </div>
                            {errors.username && (
                                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="email"
                                    type="email"
                                    value={details.email}
                                    onChange={changeHandler}
                                    className={`w-full pl-12 pr-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                                        errors.email 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={details.password}
                                    onChange={changeHandler}
                                    className={`w-full pl-12 pr-12 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                                        errors.password 
                                            ? 'border-red-500 focus:ring-red-500' 
                                            : 'border-gray-600 focus:border-blue-500 focus:ring-blue-500'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={isSignUp ? signUpHandler : logInHandler}
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    {isSignUp ? (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Create Account
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="w-5 h-5" />
                                            Sign In
                                        </>
                                    )}
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-sm text-gray-400">
                        {isSignUp ? (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setIsSignUp(false)}
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                >
                                    Sign in
                                </button>
                            </>
                        ) : (
                            <>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setIsSignUp(true)}
                                    className="text-blue-400 hover:text-blue-300 font-medium"
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;