'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/70 backdrop-blur-md shadow-2xl border-0 ring-1 ring-white/20">
      <CardHeader className="text-center pb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <User className="w-7 h-7 text-white" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2 text-base">
          Sign in to access the AI Vision Classifier
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Email Address</span>
            </label>
            <div className="relative">
              <input
                id="username"
                type="email"
                placeholder="admin@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:border-blue-400 focus:bg-white transition-all duration-300 disabled:opacity-50"
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-500" />
              <span>Password</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3 text-base border-2 border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl focus:border-purple-400 focus:bg-white transition-all duration-300 disabled:opacity-50"
              />
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          {error && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl animate-fadeInUp">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-600 font-medium">{error}</span>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full py-3 text-base font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transform transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:hover:shadow-xl rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                <span>Signing In...</span>
                <div className="ml-3 flex space-x-1">
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce animation-delay-200" />
                  <div className="w-1 h-1 bg-white rounded-full animate-bounce animation-delay-400" />
                </div>
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                <span>Sign In to AI Vision</span>
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Demo Credentials</span>
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between px-3 py-2 bg-white/40 rounded-lg">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-blue-600 font-semibold">admin@example.com</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-white/40 rounded-lg">
                <span className="text-gray-600 font-medium">Password:</span>
                <span className="text-purple-600 font-semibold">admin</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 