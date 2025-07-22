'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { CheckCircle, AlertCircle, Brain, Zap, Target } from 'lucide-react';

interface PredictionResultsProps {
  prediction: string;
  score: number;
  isLoading: boolean;
}

export const PredictionResults: React.FC<PredictionResultsProps> = ({
  prediction,
  score,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card className="w-full bg-white/70 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center h-48 space-y-6">
            {/* Loading Animation */}
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500"></div>
              <div className="absolute inset-4 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full animate-pulse"></div>
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Analyzing Image...</h3>
              <p className="text-sm text-gray-600">Our AI is processing your image</p>
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prediction) {
    return (
      <Card className="w-full bg-white/60 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20 hover:bg-white/70 transition-all duration-300">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-gray-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Ready to Analyze</h3>
              <p className="text-sm text-gray-600">Upload an image to see AI predictions</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const confidenceLevel = score >= 0.8 ? 'high' : score >= 0.5 ? 'medium' : 'low';
  const confidenceColors = {
    high: {
      badge: 'bg-green-50 text-green-700 border-green-200',
      progress: 'bg-gradient-to-r from-green-500 to-emerald-400',
      icon: <CheckCircle className="w-4 h-4" />,
      cardBg: 'from-green-50/50 to-emerald-50/50',
      borderColor: 'border-green-200/50'
    },
    medium: {
      badge: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      progress: 'bg-gradient-to-r from-yellow-500 to-amber-400',
      icon: <AlertCircle className="w-4 h-4" />,
      cardBg: 'from-yellow-50/50 to-amber-50/50',
      borderColor: 'border-yellow-200/50'
    },
    low: {
      badge: 'bg-red-50 text-red-700 border-red-200',
      progress: 'bg-gradient-to-r from-red-500 to-pink-400',
      icon: <AlertCircle className="w-4 h-4" />,
      cardBg: 'from-red-50/50 to-pink-50/50',
      borderColor: 'border-red-200/50'
    }
  };

  const colors = confidenceColors[confidenceLevel];

  return (
    <Card className="w-full bg-white/70 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
              Classification Result
            </span>
            <p className="text-xs text-gray-500 font-normal mt-1">Powered by ResNet50</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 animate-fadeInUp">
        {/* Main Prediction Card */}
        <div className={`relative p-6 rounded-2xl bg-gradient-to-br ${colors.cardBg} border ${colors.borderColor} backdrop-blur-sm`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Predicted Class</h3>
              <p className="text-2xl font-bold text-gray-800 capitalize leading-tight">
                {prediction.replace(/_/g, ' ')}
              </p>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${colors.badge}`}>
              {colors.icon}
              <span className="text-xs font-medium uppercase tracking-wider">
                {confidenceLevel} confidence
              </span>
            </div>
          </div>
          
          {/* Confidence Score */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Confidence Score</span>
              <span className="text-lg font-bold text-gray-800">{(score * 100).toFixed(1)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.progress}`}
                style={{ width: `${score * 100}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/50 border border-gray-200/50 rounded-xl p-4 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Accuracy</p>
                <p className="text-lg font-bold text-gray-800">{(score * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 border border-gray-200/50 rounded-xl p-4 backdrop-blur-sm hover:bg-white/70 transition-all duration-300">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Model</p>
                <p className="text-lg font-semibold text-gray-800">ResNet50</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning for Low Confidence */}
        {confidenceLevel === 'low' && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl p-4 backdrop-blur-sm animate-fadeInUp">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Low Confidence Prediction</p>
                <p className="text-xs text-yellow-700/80 leading-relaxed">
                  The model is not very certain about this classification. Consider uploading a clearer image or trying a different angle.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 