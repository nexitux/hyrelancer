"use client";
import React, { useState } from 'react';
import { Trophy, Target, Zap, Award, Star } from 'lucide-react';

const AchievementsRoadmap = () => {
  const [activeAchievement, setActiveAchievement] = useState(null);

  const achievements = [
    {
      id: 1,
      title: 'First Win',
      description: 'Complete your first project successfully',
      icon: Trophy,
      color: 'bg-blue-500',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      status: 'completed',
      date: '2 days ago',
      position: { top: '8%', left: '50%' }
    },
    {
      id: 2,
      title: 'Quick Response',
      description: 'Respond to 10 project proposals within 24 hours',
      icon: Zap,
      color: 'bg-green-500',
      iconColor: 'text-green-500',
      borderColor: 'border-green-500',
      status: 'completed',
      date: '5 days ago',
      position: { top: '28%', left: '65%' }
    },
    {
      id: 3,
      title: 'Top Rated',
      description: 'Achieve 5-star rating from 5 different clients',
      icon: Star,
      color: 'bg-yellow-500',
      iconColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      status: 'in-progress',
      progress: 60,
      date: 'In progress',
      position: { top: '48%', left: '35%' }
    },
    {
      id: 4,
      title: 'Goal Crusher',
      description: 'Complete 20 milestones on time',
      icon: Target,
      color: 'bg-orange-500',
      iconColor: 'text-orange-500',
      borderColor: 'border-orange-500',
      status: 'in-progress',
      progress: 35,
      date: 'In progress',
      position: { top: '68%', left: '60%' }
    },
    {
      id: 5,
      title: 'Elite Freelancer',
      description: 'Earn ₹1,00,000 in total project payments',
      icon: Award,
      color: 'bg-purple-500',
      iconColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      status: 'locked',
      date: 'Not started',
      position: { top: '88%', left: '45%' }
    }
  ];

  return (
    <div className="bg-gradient-to-b from-sky-50 to-blue-50 h-full rounded-2xl border border-gray-200 p-6 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Achievements Journey
          </h3>
        </div>
        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
          {achievements.filter(a => a.status === 'completed').length}/{achievements.length} Complete
        </span>
      </div>

      <div className="relative h-[500px] bg-gradient-to-b from-green-100 via-emerald-50 to-teal-50 rounded-xl shadow-inner overflow-hidden">
        {/* Realistic Curved Road using absolute positioned divs */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="none">
          <defs>
            {/* Road gradient for 3D effect */}
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1f2937" />
              <stop offset="20%" stopColor="#374151" />
              <stop offset="50%" stopColor="#4b5563" />
              <stop offset="80%" stopColor="#374151" />
              <stop offset="100%" stopColor="#1f2937" />
            </linearGradient>
            
            {/* Shadow filter */}
            <filter id="roadShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
              <feOffset dx="2" dy="3" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.4"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          {/* Road shadow */}
          <path
            d="M 200 0 
               C 220 50, 260 80, 270 120
               C 280 160, 200 180, 150 220
               C 100 260, 140 300, 220 340
               C 260 360, 240 380, 200 400"
            fill="none"
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="75"
            strokeLinecap="round"
            filter="url(#roadShadow)"
          />
          
          {/* Main road with gradient */}
          <path
            d="M 200 0 
               C 220 50, 260 80, 270 120
               C 280 160, 200 180, 150 220
               C 100 260, 140 300, 220 340
               C 260 360, 240 380, 200 400"
            fill="none"
            stroke="url(#roadGradient)"
            strokeWidth="70"
            strokeLinecap="round"
          />
          
          {/* Center yellow dashed line */}
          <path
            d="M 200 0 
               C 220 50, 260 80, 270 120
               C 280 160, 200 180, 150 220
               C 100 260, 140 300, 220 340
               C 260 360, 240 380, 200 400"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            strokeDasharray="18 12"
            strokeLinecap="round"
          />
          
          {/* Left edge white dashes */}
          <path
            d="M 200 0 
               C 220 50, 260 80, 270 120
               C 280 160, 200 180, 150 220
               C 100 260, 140 300, 220 340
               C 260 360, 240 380, 200 400"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2.5"
            strokeDasharray="12 8"
            strokeLinecap="round"
            transform="translate(-28, 0)"
          />
          
          {/* Right edge white dashes */}
          <path
            d="M 200 0 
               C 220 50, 260 80, 270 120
               C 280 160, 200 180, 150 220
               C 100 260, 140 300, 220 340
               C 260 360, 240 380, 200 400"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2.5"
            strokeDasharray="12 8"
            strokeLinecap="round"
            transform="translate(28, 0)"
          />
        </svg>

        {/* Decorative elements - Trees/Bushes */}
        <div className="absolute top-8 right-12 w-10 h-10 bg-green-600 rounded-full opacity-40 shadow-md"></div>
        <div className="absolute top-12 right-16 w-7 h-7 bg-green-700 rounded-full opacity-30"></div>
        <div className="absolute top-24 left-8 w-12 h-12 bg-green-600 rounded-full opacity-40 shadow-md"></div>
        <div className="absolute top-28 left-14 w-8 h-8 bg-green-700 rounded-full opacity-35"></div>
        <div className="absolute top-56 right-10 w-9 h-9 bg-green-700 rounded-full opacity-35 shadow-md"></div>
        <div className="absolute bottom-28 left-16 w-11 h-11 bg-green-600 rounded-full opacity-40 shadow-md"></div>
        <div className="absolute bottom-32 left-20 w-7 h-7 bg-green-700 rounded-full opacity-30"></div>
        <div className="absolute bottom-12 right-14 w-10 h-10 bg-green-600 rounded-full opacity-40 shadow-md"></div>

        {/* Achievement Nodes positioned along the road */}
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          const isActive = activeAchievement === achievement.id;
          
          return (
            <div
              key={achievement.id}
              className="absolute"
              style={{ 
                top: achievement.position.top, 
                left: achievement.position.left,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setActiveAchievement(achievement.id)}
              onMouseLeave={() => setActiveAchievement(null)}
            >
              {/* Node with shadow */}
              <button
                onClick={() => setActiveAchievement(achievement.id)}
                className={`relative z-10 w-14 h-14 rounded-full border-4 border-white shadow-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer ${
                  achievement.status === 'completed' 
                    ? achievement.color 
                    : achievement.status === 'in-progress'
                    ? 'bg-white'
                    : 'bg-gray-300'
                } ${isActive ? 'scale-125 shadow-2xl ring-4 ring-white' : 'hover:scale-110'}`}
              >
                <Icon 
                  className={`w-6 h-6 ${
                    achievement.status === 'completed' 
                      ? 'text-white' 
                      : achievement.iconColor
                  }`} 
                />
                
                {achievement.status === 'in-progress' && (
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="28"
                      cy="28"
                      r="24"
                      fill="none"
                      stroke={achievement.color.replace('bg-', '')}
                      strokeWidth="3"
                      strokeDasharray={`${achievement.progress * 1.5} 150`}
                      className="transition-all duration-500"
                    />
                  </svg>
                )}
              </button>

              {/* Details Card - Positioned dynamically */}
              {isActive && (
                <div 
                  className={`absolute top-1/2 left-16 -translate-y-1/2 w-64 p-4 rounded-lg border-2 bg-white shadow-xl z-20 animate-in fade-in slide-in-from-left-2 ${achievement.borderColor}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-base">
                        {achievement.title}
                      </h4>
                      <p className="text-gray-600 text-sm mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500">
                          {achievement.date}
                        </span>
                        {achievement.status === 'in-progress' && (
                          <span className={`text-xs font-medium ${achievement.iconColor}`}>
                            {achievement.progress}% complete
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {achievement.status === 'completed' && (
                      <div className={`px-2 py-1 rounded text-xs font-medium text-white ${achievement.color} ml-2`}>
                        ✓ Done
                      </div>
                    )}
                    {achievement.status === 'locked' && (
                      <div className="px-2 py-1 rounded text-xs font-medium text-gray-500 bg-gray-200 ml-2">
                        🔒 Locked
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          🎯 Keep progressing on your freelancing journey!
        </p>
      </div>
    </div>
  );
};

export default AchievementsRoadmap;