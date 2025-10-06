"use client";

import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import { testimonialAPI } from '@/config/api';
import LoginModal from '@/components/LoginModal/LoginModal';

export default function CommentForm({ profileData, onTestimonialAdded }) {
  const { user, isAuthenticated, userType } = useSelector(state => state.auth);
  
  // Debug logging
  console.log('🔍 CommentForm Debug:', {
    isAuthenticated,
    userType,
    user: user?.name,
    userTypeFromUser: user?.userType
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    // Check if user is a customer (case-insensitive) - check both Redux state and user object
    const currentUserType = userType || user?.userType;
    if (currentUserType?.toLowerCase() !== 'customer') {
      alert('Only customers can leave testimonials.');
      return;
    }
    
    // Validate form data
    if (!formData.comment.trim() || rating === 0) {
      alert('Please fill in your review and select a rating.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const testimonialData = {
        freelancerId: profileData?.fp_u_id,
        comment: formData.comment.trim(),
        rating: rating
      };
      
      const response = await testimonialAPI.storeTestimonial(testimonialData);
      
      if (response.message === 'Testimonial  saved') {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          name: '',
          email: '',
          comment: '',
          saveInfo: false
        });
        setRating(0);
        
        // Notify parent component to refresh testimonials
        if (onTestimonialAdded) {
          onTestimonialAdded();
        }
        
        // Show success message
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Failed to submit testimonial');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      setSubmitError(error.response?.data?.message || error.message || 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
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
    <div className="mx-auto p-8 bg-white" data-comment-form>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Leave a Review for {profileData?.fp_display_name || 'this freelancer'}
        </h2>
        <div className="w-16 h-1 bg-blue-500 rounded-full"></div>
      </div>

      <div className="space-y-6">
        {/* Authentication Status */}
        {isAuthenticated ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 font-semibold text-sm">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Logged in as {user?.name || 'User'}
                </p>
                <p className="text-xs text-green-600">
                  {(userType || user?.userType)?.toLowerCase() === 'customer' ? 'Customer Account' : 'Account Type: ' + (userType || user?.userType)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Please log in to leave a testimonial. Only customers can submit testimonials.
            </p>
          </div>
        )}

        {/* Success/Error Messages */}
        {submitSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✅ Testimonial submitted successfully! It will be reviewed before being published.
            </p>
          </div>
        )}
        
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              ❌ {submitError}
            </p>
          </div>
        )}

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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 resize-none group-hover:border-gray-300"
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
            className="w-4 h-4 text-blue-600 bg-gray-50 border-gray-300 rounded transition-colors duration-200"
          />
          <label htmlFor="saveInfo" className="ml-3 text-sm text-gray-600 cursor-pointer">
            Save my name, email, and website in this browser for the next time I comment
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            className="group relative px-8 py-3 bg-[#3e5a9a] text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting || !isAuthenticated || (userType || user?.userType)?.toLowerCase() !== 'customer'}
          >
            <span className="flex items-center gap-2">
              {isSubmitting ? 'Submitting...' : 'Post Testimonial'}
              <Send size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </button>
          
          {!isAuthenticated && (
            <p className="text-sm text-gray-600 mt-2">
              You need to be logged in as a customer to leave a testimonial.
            </p>
          )}
          
          {isAuthenticated && (userType || user?.userType)?.toLowerCase() !== 'customer' && (
            <p className="text-sm text-gray-600 mt-2">
              Only customers can leave testimonials for freelancers.
            </p>
          )}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setShowLoginModal(false);
          // The parent component will handle refreshing testimonials
        }}
      />
    </div>
  );
}