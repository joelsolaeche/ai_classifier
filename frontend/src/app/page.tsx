'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/LoginForm';
import { ImageUpload } from '../components/ImageUpload';
import { PredictionResults } from '../components/PredictionResults';
import { FeedbackForm } from '../components/FeedbackForm';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { LogOut, Brain, Sparkles, Zap, Star, Upload } from 'lucide-react';
import { apiService } from '../lib/api';

interface PredictionResult {
  success: boolean;
  prediction: string;
  score: number;
  image_file_name: string;
}

export default function Home() {
  const { user, logout, isLoading } = useAuth();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    setPredictionResult(null);
    setShowFeedback(false);
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setPredictionResult(null);
    setShowFeedback(false);
  };

  const handleClassify = async () => {
    if (!selectedImage) return;

    setIsPredicting(true);
    try {
      const result = await apiService.predict(selectedImage);
      setPredictionResult(result);
      if (result.success) {
        setShowFeedback(true);
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  const handleFeedbackSent = () => {
    // Optional: You could refresh data or show a success message
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Beautiful background pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-cyan-500/5" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-20 w-72 h-72 bg-violet-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-blue-600 rounded-2xl mb-6 shadow-lg transform transition-transform hover:scale-105">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
              AI Vision Classifier
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Experience the power of deep learning with our 
              <span className="font-semibold text-violet-600"> ResNet50</span> neural network
            </p>
          </div>
          <LoginForm />
          
          {/* Features showcase */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl">
              <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Lightning Fast</p>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl">
              <Star className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">1000+ Classes</p>
            </div>
            <div className="text-center p-3 bg-white/60 backdrop-blur-sm rounded-xl">
              <Brain className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-xs font-medium text-gray-700">Deep Learning</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-10 animate-pulse animation-delay-2000" />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Vision Classifier
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Powered by ResNet50 Deep Learning
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="flex items-center space-x-2 bg-white/50 backdrop-blur-sm hover:bg-white/80 border-gray-200 transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="space-y-12">
          {/* Welcome Card */}
          <Card className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-none shadow-xl backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Welcome to AI Vision
                  </CardTitle>
                  <p className="text-gray-600 mt-1">
                    Upload any image and our ResNet50-powered neural network will classify it into one of 1000+ categories with confidence scores
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Categories Section */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              What Can Our AI Recognize?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  category: "Animals",
                  description: "Dogs, cats, birds, wild animals, fish, insects",
                  icon: "🐾",
                  gradient: "from-green-400 to-emerald-500"
                },
                {
                  category: "Vehicles", 
                  description: "Cars, planes, boats, motorcycles, trucks",
                  icon: "🚗",
                  gradient: "from-blue-400 to-cyan-500"
                },
                {
                  category: "Food & Drinks",
                  description: "Fruits, vegetables, dishes, beverages", 
                  icon: "🍎",
                  gradient: "from-orange-400 to-red-500"
                },
                {
                  category: "Objects",
                  description: "Electronics, furniture, tools, sports equipment",
                  icon: "💻",
                  gradient: "from-purple-400 to-pink-500"
                },
                {
                  category: "Nature",
                  description: "Flowers, trees, landscapes, weather",
                  icon: "🌸", 
                  gradient: "from-green-400 to-blue-500"
                },
                {
                  category: "Fashion",
                  description: "Clothing, accessories, footwear",
                  icon: "👕",
                  gradient: "from-pink-400 to-rose-500"
                }
              ].map((item, index) => (
                <Card key={index} className="p-4 border-0 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  <CardContent className="p-3">
                    <div className="text-center">
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h4 className={`font-bold text-lg mb-2 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                        {item.category}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center mt-6 text-gray-600 font-medium">
              🧠 <strong>1,000+ Categories</strong> powered by ResNet50 deep learning model
            </p>
          </div>

          {/* Upload Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-full text-sm font-bold">
                1
              </div>
              <h2 className="text-2xl font-bold text-gray-800">
                Upload Your Image
              </h2>
            </div>
            <ImageUpload
              onImageSelect={handleImageSelect}
              selectedImage={selectedImage}
              onClearImage={handleClearImage}
            />
          </div>

          {/* Classify Button */}
          {selectedImage && !predictionResult && (
            <div className="text-center">
              <Button 
                onClick={handleClassify}
                disabled={isPredicting}
                size="lg"
                className="px-12 py-4 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                {isPredicting ? (
                  <>
                    <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Analyzing with AI...</span>
                    <div className="ml-3 flex space-x-1">
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce animation-delay-200" />
                      <div className="w-1 h-1 bg-white rounded-full animate-bounce animation-delay-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <Brain className="mr-3 h-6 w-6" />
                    <span>Classify with AI</span>
                    <Sparkles className="ml-3 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Prediction Results */}
          {predictionResult && (
            <div className="space-y-8 animate-fadeInUp">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-full text-sm font-bold">
                    2
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    AI Classification Results
                  </h2>
                </div>
                <PredictionResults
                  prediction={predictionResult.prediction}
                  score={predictionResult.score}
                  isLoading={isPredicting}
                />
              </div>

              {/* Feedback Section */}
              {showFeedback && (
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-bold">
                      3
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Help Improve Our AI
                    </h2>
                  </div>
                  <FeedbackForm
                    prediction={predictionResult.prediction}
                    score={predictionResult.score}
                    imageFileName={predictionResult.image_file_name}
                    onFeedbackSent={handleFeedbackSent}
                  />
                </div>
              )}

              {/* New Image Button */}
              <div className="text-center pt-8 border-t border-gray-200">
                <Button 
                  onClick={handleClearImage}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 bg-white/60 backdrop-blur-sm hover:bg-white/80 border-gray-200 shadow-md hover:shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Classify Another Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Brain className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-semibold text-gray-800">AI Vision Classifier</span>
            </div>
            <p className="text-gray-600 mb-2">
              © 2024 AI Vision Classifier - Built with Next.js, FastAPI, and ResNet50 (v1.1)
            </p>
            <p className="text-sm text-gray-500">
              Powered by deep learning for accurate image classification across 1000+ categories
            </p>
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>Backend Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>AI Ready</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
