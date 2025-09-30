"use client";

import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare, ChevronDown } from 'lucide-react';

const ReviewsSection = ({ profileData }) => {
  const [helpfulVotes, setHelpfulVotes] = useState({});

  const toggleHelpful = (reviewId) => {
    setHelpfulVotes(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  // TODO: Replace with actual reviews data from API
  const reviews = []; // No reviews available yet

  const ratingDistribution = [
    { stars: 5, percentage: 0, count: 0 },
    { stars: 4, percentage: 0, count: 0 },
    { stars: 3, percentage: 0, count: 0 },
    { stars: 2, percentage: 0, count: 0 },
    { stars: 1, percentage: 0, count: 0 }
  ];

  const totalRatings = 0;
  const averageRating = 0;

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : index < rating
            ? 'fill-yellow-400/50 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleWriteReview = () => {
    // Scroll to comment form or open review modal
    const commentForm = document.querySelector('[data-comment-form]');
    if (commentForm) {
      commentForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Reviews for {profileData?.fp_display_name || 'This Freelancer'}
            </h2>
          </div>
          
          <button 
            onClick={handleWriteReview}
            className="flex items-center px-6 py-3 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Write Reviews
          </button>
        </div>

        {totalRatings > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Rating Summary */}
            <div className="lg:col-span-1">
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-gray-900 mb-2">{averageRating}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(averageRating)}
                </div>
                <div className="text-sm text-gray-600">({totalRatings.toLocaleString()} Ratings)</div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="lg:col-span-2">
              <div className="space-y-3">
                {ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-8">
                      <span className="text-sm font-medium text-gray-700">{item.stars}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-sm font-medium text-gray-700 w-12 text-right">
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 mb-8">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to leave a review for {profileData?.fp_display_name || 'this freelancer'}!
            </p>
            <button 
              onClick={handleWriteReview}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
            >
              Write the First Review
            </button>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                  />
                  
                  {/* Review Header */}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{review.author}</h4>
                      {review.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{review.date}</div>
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                </div>

                {/* Service Card */}
                <div className="flex-shrink-0 ml-4">
                  <div className="bg-gray-50 rounded-xl p-3 w-32">
                    <img
                      src={review.serviceImage}
                      alt={review.serviceTitle}
                      className="w-full h-20 object-cover rounded-lg mb-2"
                    />
                    <div className="text-xs font-semibold text-gray-900 mb-1">
                      {review.serviceTitle}
                    </div>
                    <div className="text-xs text-gray-600">{review.servicePrice}</div>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-4 ml-16">
                {review.text}
              </p>

              {/* Helpful Button */}
              <div className="ml-16">
                <button
                  onClick={() => toggleHelpful(review.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 ${
                    helpfulVotes[review.id]
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${helpfulVotes[review.id] ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">
                    Was This Helpful?
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button - Only show if there are reviews */}
        {reviews.length > 0 && (
          <div className="text-center mt-8">
            <button className="group flex items-center justify-center mx-auto px-6 py-3 text-gray-700 font-semibold hover:text-blue-700 transition-colors duration-200">
              <span className="border-b-2 border-gray-700 group-hover:border-blue-700 transition-colors duration-200">
                See More Reviews
              </span>
              <ChevronDown className="w-4 h-4 ml-2 group-hover:text-blue-700 transition-colors duration-200" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReviewsSection;