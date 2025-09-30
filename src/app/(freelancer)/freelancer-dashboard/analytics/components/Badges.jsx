"use client";
import { useState, useEffect } from "react";
import { Award, Star, Shield, CheckCircle, Clock, XCircle } from "lucide-react";
import { freelancerDashboardService } from '@/services/freelancerDashboardService';

// Badge type icons mapping
const getBadgeIcon = (badgeType) => {
  switch (badgeType) {
    case 'id_proof_verify':
      return Shield;
    case 'regi_complte':
      return CheckCircle;
    case 'skill_verified':
      return Star;
    case 'premium':
      return Award;
    default:
      return Award;
  }
};

// Badge type colors mapping
const getBadgeColor = (badgeType, isActive) => {
  if (!isActive) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      border: 'border-gray-200',
      icon: 'text-gray-400'
    };
  }

  switch (badgeType) {
    case 'id_proof_verify':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: 'text-blue-600'
      };
    case 'regi_complte':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: 'text-green-600'
      };
    case 'skill_verified':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: 'text-purple-600'
      };
    case 'premium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: 'text-yellow-600'
      };
    default:
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        icon: 'text-indigo-600'
      };
  }
};

// Individual badge component
const BadgeCard = ({ badge }) => {
  const badgeData = badge.get_fe_badge;
  const isActive = badge.fb_is_active === 1 && badgeData.b_is_active === 1;
  const IconComponent = getBadgeIcon(badgeData.b_type);
  const colors = getBadgeColor(badgeData.b_type, isActive);

  return (
    <div className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${colors.bg} ${colors.border} ${!isActive ? 'opacity-60' : ''}`}>
      {/* Inactive overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-white bg-opacity-50 rounded-xl flex items-center justify-center">
          <XCircle className="h-6 w-6 text-gray-400" />
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Badge Icon */}
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
          <IconComponent className={`h-6 w-6 ${colors.icon}`} />
        </div>
        
        {/* Badge Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold text-sm ${colors.text}`}>
              {badgeData.b_name}
            </h3>
            {isActive && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-xs font-medium text-yellow-600">
                  {badgeData.b_point} pts
                </span>
              </div>
            )}
          </div>
          
          <p className={`text-xs ${colors.text} opacity-80 mb-2 line-clamp-2`}>
            {badgeData.b_desc}
          </p>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
              {badgeData.b_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
            
            {isActive && (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">Active</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Badges component
export default function Badges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const data = await freelancerDashboardService.getFreelancerDashboard();
        const transformedData = freelancerDashboardService.transformFreelancerDashboardData(data);
        
        // Filter only active badges
        const activeBadges = (transformedData?.badges || []).filter(badge => 
          badge.fb_is_active === 1 && 
          badge.get_fe_badge && 
          badge.get_fe_badge.b_is_active === 1 &&
          !badge.get_fe_badge.deleted_at
        );
        
        setBadges(activeBadges);
        setError(null);
      } catch (err) {
        console.error('Error fetching badges:', err);
        // Set empty badges array instead of error
        setBadges([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Badges & Achievements</h3>
            <p className="text-sm text-gray-500 mt-1">Your earned badges and achievements</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="animate-pulse">
              <div className="p-4 rounded-xl border-2 border-gray-200 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  const totalPoints = badges.reduce((sum, badge) => sum + parseInt(badge.get_fe_badge.b_point || 0), 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Badges & Achievements</h3>
          <p className="text-sm text-gray-500 mt-1">
            {badges.length} active badges • {totalPoints} total points
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          <span className="text-sm font-medium text-gray-600">
            {badges.length}/{badges.length}
          </span>
        </div>
      </div>

      {/* Badges Grid */}
      {badges.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {badges.map((badge) => (
            <BadgeCard key={badge.fb_id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <Award className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-1">No Badges Yet</h3>
          <p className="text-sm text-gray-500">
            Complete your profile and verify your identity to earn badges
          </p>
        </div>
      )}

      {/* Footer - Always show at bottom */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Earn more badges by completing tasks and verifying your profile
          </span>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </button>
        </div>
      </div>
    </div>
  );
}
