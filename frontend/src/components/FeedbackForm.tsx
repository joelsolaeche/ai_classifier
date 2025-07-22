'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { MessageSquare, Send, CheckCircle, Heart, Star } from 'lucide-react';
import { apiService } from '../lib/api';

interface FeedbackFormProps {
  prediction: string;
  score: number;
  imageFileName: string;
  onFeedbackSent: () => void;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  prediction,
  score,
  imageFileName,
  onFeedbackSent,
}) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setLoading(true);
    try {
      await apiService.sendFeedback({
        feedback: feedback.trim(),
        score,
        predicted_class: prediction,
        image_file_name: imageFileName,
      });
      setSubmitted(true);
      onFeedbackSent();
      setTimeout(() => {
        setFeedback('');
        setSubmitted(false);
      }, 4000);
    } catch (error) {
      console.error('Failed to send feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="w-full bg-white/70 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20">
        <CardContent className="p-8">
          <div className="text-center space-y-6 animate-fadeInUp">
            {/* Success Animation */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-br from-green-400 to-emerald-300 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-800">Thank You!</h3>
              <p className="text-gray-600">Your feedback helps improve our AI model</p>
              
              {/* Appreciation Icons */}
              <div className="flex justify-center space-x-4 mt-6">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-500" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white/70 backdrop-blur-md shadow-xl border-0 ring-1 ring-white/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Share Your Feedback
            </span>
            <p className="text-xs text-gray-500 font-normal mt-1">Help us improve the model</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6 animate-fadeInUp">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prediction Summary */}
          <div className="bg-white/50 border border-gray-200/50 rounded-xl p-4 backdrop-blur-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Current Prediction</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Classification</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">
                  {prediction.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Confidence</p>
                <p className="text-sm font-semibold text-gray-800">
                  {(score * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Feedback Input */}
          <div className="space-y-3">
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
              Was this prediction accurate? Share your thoughts:
            </label>
            <div className="relative">
              <textarea
                id="feedback"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200/50 bg-white/50 backdrop-blur-sm rounded-xl text-gray-800 placeholder-gray-500 focus:border-purple-400 focus:bg-white transition-all duration-300 resize-none"
                placeholder="If the prediction was incorrect, please let us know what the correct classification should be. Your feedback helps train better models!"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {feedback.length}/500
              </div>
            </div>
            <p className="text-xs text-gray-500 flex items-center space-x-1">
              <Heart className="w-3 h-3 text-pink-500" />
              <span>Your feedback helps improve AI accuracy for everyone</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={loading || !feedback.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 mr-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-3" />
                  Send Feedback
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setFeedback('')}
              disabled={loading}
              className="bg-white/50 border-gray-200 text-gray-700 hover:bg-white/80 hover:border-gray-300 transition-all duration-300 h-12 px-6"
            >
              Clear
            </Button>
          </div>
        </form>

        {/* Feedback Encouragement */}
        <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/50 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mt-0.5">
              <Star className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 mb-1">Why Feedback Matters</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your feedback is invaluable for improving model accuracy. Each correction helps the AI learn and become better at recognizing similar images in the future.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 