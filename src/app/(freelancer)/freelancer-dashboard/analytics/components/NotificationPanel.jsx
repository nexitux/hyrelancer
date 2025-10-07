"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Target, Zap, Award, Star, Shield, Users, Clock, DollarSign, Crown, Mail, Phone, MessageSquare, CheckCircle, XCircle, UserCheck, Globe, Briefcase, Lock } from 'lucide-react';
import api from '@/config/api';
import { freelancerDashboardService } from '@/services/freelancerDashboardService';

const AchievementsRoadmap = () => {
  const [activeBadge, setActiveBadge] = useState(null);
  const [verificationBadges, setVerificationBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState({
    registration: false,
    email: false,
    mobile: false,
    socialMedia: false,
    idProof: false
  });
  const [loading, setLoading] = useState(true);

  // Default verification badges
  const defaultVerificationBadges = [
    {
      id: 1,
      title: 'Registration Complete',
      description: 'Complete your account registration',
      icon: UserCheck,
      iconSrc: '/images/logo/icon-01.png', // replace with your exact file name
      color: 'bg-red-500',
      iconColor: 'text-red-500',
      borderColor: 'border-red-500',
      status: 'locked',
      date: 'Not started',
      position: { top: '7%', left: '15%' },
      verificationType: 'registration'
    },
    {
      id: 2,
      title: 'Email Verified',
      description: 'Verify your email address',
      icon: Mail,
      iconSrc: '/images/logo/icon-03.png', // replace with your exact file name
      color: 'bg-blue-500',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500',
      status: 'locked',
      date: 'Not started',
      position: { top: '25%', left: '55%' },
      verificationType: 'email'
    },
    {
      id: 3,
      title: 'Mobile Verified',
      description: 'Verify your mobile number',
      icon: Phone,
      iconSrc: '/images/logo/icon-04.png', // replace with your exact file name
      color: 'bg-emerald-500',
      iconColor: 'text-violet-500',
      borderColor: 'border-violet-500',
      status: 'locked',
      date: 'Not started',
      position: { top: '60%', left: '70%' },
      verificationType: 'mobile'
    },
    {
      id: 4,
      title: 'ID Proof Verified',
      description: 'Verify your identity document',
      icon: Shield,
      iconSrc: '/images/logo/icon-02.png', // replace with your exact file name
      color: 'bg-indigo-500',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      status: 'locked',
      date: 'Not started',
      position: { top: '80%', left: '33%' },
      verificationType: 'idProof'
    },
    {
      id: 5,
      title: 'Social Media Verified',
      description: 'Connect your social media accounts',
      icon: Globe,
      iconSrc: '/images/logo/icon-07.png', // replace with your exact file name
      color: 'bg-pink-600',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-600',
      status: 'locked',
      date: 'Not started',
      position: { top: '93%', left: '76%' },
      verificationType: 'socialMedia'
    }
  ];

  // Transform verification badges based on fb_b_id
  const transformVerificationBadges = (userBadges) => {
    if (!userBadges || !Array.isArray(userBadges)) return defaultVerificationBadges;
    
    // Create a map of verified badge IDs
    const verifiedIds = new Set();
    userBadges.forEach(badge => {
      const badgeId = parseInt(badge.fb_b_id);
      verifiedIds.add(badgeId);
    });
    
    // Update default badges with verification status based on fb_b_id
    return defaultVerificationBadges.map(badge => {
      let isVerified = false;
      switch (badge.id) {
        case 1: isVerified = verifiedIds.has(1); break; // Registration
        case 2: isVerified = verifiedIds.has(2); break; // Email
        case 3: isVerified = verifiedIds.has(3); break; // Mobile
        case 4: isVerified = verifiedIds.has(4); break; // ID Proof
        case 5: isVerified = verifiedIds.has(5); break; // Social Media
      }
      
      return {
        ...badge,
        status: isVerified ? 'completed' : 'locked',
        date: isVerified ? 'Completed' : 'Not started'
      };
    });
  };

  // Fetch verification badges from API
  useEffect(() => {
    
    // Fetch user badges from UserDashboard API
    const fetchUserBadges = async () => {
      try {
        console.log('Fetching user badges...');
        const response = await api.get('/UserDashboard');
        const data = response.data;
        console.log('API Response:', data);
        
        // Extract badges from UserDashboard API response
        // Check if badges are in fe_badges or other locations
        let badgesArray = data?.fe_badges || data?.badges || data?.data?.badges || data;
        if (!Array.isArray(badgesArray)) {
          console.error('Badges data is not an array:', badgesArray);
          badgesArray = [];
        }
        
        const activeBadges = badgesArray.filter(badge => 
          badge.fb_is_active === 1
        );
        
        console.log('Filtered active badges:', activeBadges);
        
        setUserBadges(activeBadges);
        
        // Transform badges to verification status
        const transformedBadges = transformVerificationBadges(activeBadges);
        setVerificationBadges(transformedBadges);
        
        // Also update verification status for hover cards
        const verification = {
          registration: false,
          email: false,
          mobile: false,
          socialMedia: false,
          idProof: false
        };
        
        activeBadges.forEach(badge => {
          const badgeData = badge.get_fe_badge;
          const badgeId = parseInt(badge.fb_b_id);
          
          console.log(`Badge ID: ${badgeId}`, {
            fb_id: badge.fb_id,
            fb_b_id: badge.fb_b_id,
            badge_name: badgeData?.b_name || 'No Name',
            badge_type: badgeData?.b_type || 'No Type'
          });
          
          // Map based on fb_b_id (regardless of get_fe_badge being null)
          switch (badgeId) {
            case 1: // Registration
              verification.registration = true;
              console.log('✅ Registration Badge Found:', badgeData?.b_name || 'Active');
              break;
            case 2: // Email
              verification.email = true;
              console.log('✅ Email Badge Found:', badgeData?.b_name || 'Active');
              break;
            case 3: // Mobile
              verification.mobile = true;
              console.log('✅ Mobile Badge Found:', badgeData?.b_name || 'Active');
              break;
            case 4: // ID Proof
              verification.idProof = true;
              console.log('✅ ID Proof Badge Found:', badgeData?.b_name || 'Active');
              break;
            case 5: // Social Media
              verification.socialMedia = true;
              console.log('✅ Social Media Badge Found:', badgeData?.b_name || 'Active');
              break;
            default:
              console.log('❌ Unknown Badge ID:', badgeId, 'Name:', badgeData?.b_name || 'Unknown');
          }
        });
        
        setVerificationStatus(verification);
      } catch (error) {
        console.error('Error fetching user badges:', error);
        setUserBadges([]);
        setVerificationBadges(defaultVerificationBadges);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBadges();
  }, []);

  // Use verification badges from API or default badges
  const achievements = verificationBadges.length > 0 ? verificationBadges : defaultVerificationBadges;

  return (
    <div className="bg-white h-full rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Verification Badges 
          </h3>
        </div>
        <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          {loading ? 'Loading...' : `${achievements.filter(a => a.status === 'completed').length}/${achievements.length} Complete`}
        </span>
      </div>

      <div className="relative h-[500px] bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-8">
        {/* Curved path connecting all badge nodes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
          <defs>
            <linearGradient id="contactPathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Main path connecting all achievement nodes */}
          <path
            d="M 60 10 
                C 240 150, 320 200, 320 250
                C 320 300, 150 350, 140 380
                C 80 420, 150 460, 320 490"
            fill="none"
            stroke="url(#contactPathGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="12 8"
          />
        </svg>

        {/* Loading state */}
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-gray-500">Loading verification badges...</div>
          </div>
        ) : (
          /* Contact achievement nodes positioned along the path */
          achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          
          return (
            <div
              key={achievement.id}
              className="absolute"
              style={{ 
                top: achievement.position.top, 
                left: achievement.position.left,
                transform: 'translate(-50%, -50%)',
                zIndex: 10 + index
              }}
            >
                {/* Achievement card */}
              <div className="flex flex-col items-center group relative">
                  {/* Info card - shown on hover (below for registration, above for others) */}
                <div 
                    className={`absolute ${achievement.id === 1 ? 'top-full mt-4' : 'bottom-full mb-4'} w-56 p-4 rounded-lg bg-white border-2 shadow-xl ${achievement.borderColor} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:scale-105 left-1/2 -translate-x-1/2`}
                  style={{ zIndex: 100 }}
                >
                  <div className="text-center">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                      {achievement.title}
                    </h4>
                    
                     <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                      {achievement.description}
                    </p>
                    
                    {/* Verification Status */}
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-xs font-medium text-gray-700">Verification Status</span>
                      </div>
                      <div className={`flex items-center justify-center px-3 py-2 rounded-lg ${
                        achievement.status === 'completed'
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{achievement.status === 'completed' ? '✓' : '⏳'}</span>
                          <span className="text-sm font-medium">
                            {achievement.status === 'completed' ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                     <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                        <span className="text-gray-500">{achievement.date}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${achievement.iconColor} bg-gray-50`}>
                          {achievement.status === 'completed' ? 'Complete' : 'Incomplete'}
                      </span>
                      </div>
                      
                      {achievement.status === 'in-progress' && achievement.progress && (
                        <div className="mt-2 text-xs">
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span>Progress</span>
                          <span className={`font-medium ${achievement.iconColor}`}>
                              {Math.round(achievement.progress)}%
                          </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${achievement.color}`}
                              style={{ width: `${achievement.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                  {/* Badge node */}
                <div
                  className={`relative w-16 h-16 flex items-center justify-center ${
                    achievement.status === 'completed' 
                      ? 'bg-gray-50 rounded-full border-2 border-gray-100 shadow-md' 
                      : achievement.status === 'in-progress'
                      ? `bg-gray-50 rounded-full ${achievement.borderColor} border-4 border-dashed`
                      : 'bg-gray-50 rounded-full border-4 border-gray-300'
                  }`}
                >
                  {/* Blurred background for locked badges */}
                  {achievement.status === 'locked' && (
                    <div className="absolute inset-0 bg-gray-50 rounded-full blur-sm opacity-50"></div>
                  )}
                  
                  {/* Icon or lock for locked badges */}
                  {achievement.status === 'locked' ? (
                    <div className="relative z-10 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-500" />
                    </div>
                  ) : (
                    <>
                      {achievement.iconSrc ? (
                        <Image
                          src={achievement.iconSrc}
                          alt={achievement.title}
                          width={56}
                          height={56}
                          className="object-contain"
                        />
                      ) : (
                        <Icon 
                          className={`w-14 h-14 ${
                            achievement.status === 'completed' 
                              ? achievement.iconColor
                              : achievement.status === 'in-progress'
                              ? achievement.iconColor
                              : 'text-gray-400'
                          }`} 
                          fill="currentColor"
                        />
                      )}
                    </>
                  )}
                  
                  {/* Progress ring for in-progress */}
                    {achievement.status === 'in-progress' && achievement.progress && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                          stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${achievement.progress * 1.76} 176`}
                          className={`${achievement.iconColor} opacity-30`}
                      />
                    </svg>
                  )}

                </div>
              </div>
            </div>
          );
          })
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Complete all verifications to build trust and credibility!
        </p>
      </div>
    </div>
  );
};

export default AchievementsRoadmap;