"use client";

import { useState } from 'react';
import { Star, Send } from 'lucide-react';

export default function CommentForm({ profileData }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    saveInfo: false
  });
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.comment) {
      console.log('Form submitted:', { 
        ...formData, 
        rating,
        freelancerId: profileData?.fp_u_id,
        profileSlug: profileData?.fp_slug
      });
      // Handle form submission here
      alert('Comment submitted successfully!');
    } else {
      alert('Please fill in all required fields.');
    }
  };

  const StarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className="p-1 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
          >
            <Star
              size={20}
              className={`transition-colors duration-200 ${
                star <= (hoveredStar || rating)
                  ? 'fill-blue-500 text-blue-500'
                  : 'text-gray-300 hover:text-blue-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {rating} star{rating > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto p-8 bg-white">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Leave a Review for {profileData?.fp_display_name || 'this freelancer'}
        </h2>
        <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
      </div>

      <div className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                placeholder="Your Name"
                required
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          </div>

          <div className="group">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 group-hover:border-gray-300"
                placeholder="your.email@example.com"
                required
              />
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-focus-within:w-full"></div>
            </div>
          </div>
        </div>

        {/* Comment Field */}
        <div className="group">
          <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
            Review
          </label>
          <div className="relative">
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none group-hover:border-gray-300"
              placeholder="Share your thoughts and experience..."
              required
            />
            <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 group-focus-within:w-full"></div>
            {formData.comment.length === 0 && (
              <div className="absolute top-3 right-3 text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                Please fill in this field
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Your Rating
          </label>
          <StarRating />
        </div>

        {/* Save Info Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="saveInfo"
            name="saveInfo"
            checked={formData.saveInfo}
            onChange={handleInputChange}
            className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200"
          />
          <label htmlFor="saveInfo" className="ml-3 text-sm text-gray-600 cursor-pointer">
            Save my name, email, and website in this browser for the next time I comment
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            className="group relative px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl"
            onClick={handleSubmit}
          >
            <span className="flex items-center gap-2">
              Post Comment
              <Send size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="mt-12 flex justify-center">
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i === 1 ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}