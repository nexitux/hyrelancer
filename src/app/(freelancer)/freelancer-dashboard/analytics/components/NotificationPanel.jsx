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
    <div className="bg-white h-full rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-900">
            Achievements Journey
          </h3>
        </div>
        <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
          {achievements.filter(a => a.status === 'completed').length}/{achievements.length} Complete
        </span>
      </div>

      <div className="relative h-[500px] bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 p-8">
        {/* Simplified curved path */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 500" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          
          {/* Main path - connecting all achievement nodes */}
          <path
            d="M 200 40 
               C 220 90, 260 110, 260 140
               C 260 170, 220 200, 140 240
               C 100 260, 140 300, 240 340
               C 280 360, 250 400, 180 440"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="10 6"
          />
        </svg>

        {/* Achievement Nodes positioned along the path */}
        {achievements.map((achievement, index) => {
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
              {/* Achievement card - always visible with all details */}
              <div className="flex flex-col items-center group">
                {/* Node button */}
                <div
                  className={`relative w-16 h-16 rounded-full border-3 bg-white shadow-lg flex items-center justify-center transition-all duration-300 mb-3 ${
                    achievement.status === 'completed' 
                      ? `${achievement.borderColor} border-4` 
                      : achievement.status === 'in-progress'
                      ? `${achievement.borderColor} border-4 border-dashed`
                      : 'border-4 border-gray-300'
                  }`}
                >
                  <Icon 
                    className={`w-7 h-7 ${
                      achievement.status === 'completed' 
                        ? achievement.iconColor
                        : achievement.status === 'in-progress'
                        ? achievement.iconColor
                        : 'text-gray-400'
                    }`} 
                    fill="currentColor"
                  />
                  
                  {/* Progress ring for in-progress */}
                  {achievement.status === 'in-progress' && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke={achievement.color.replace('bg-', 'rgb(var(--')}
                        strokeWidth="3"
                        strokeDasharray={`${achievement.progress * 1.76} 176`}
                        className={`${achievement.iconColor.replace('text-', 'stroke-')} opacity-30`}
                      />
                    </svg>
                  )}

                  {/* Status badge */}
                  {achievement.status === 'completed' && (
                    <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full ${achievement.color} flex items-center justify-center shadow-md`}>
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                  {achievement.status === 'locked' && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center shadow-md">
                      <span className="text-white text-xs">🔒</span>
                    </div>
                  )}
                </div>

                {/* Info card - hidden by default, shown on hover */}
                <div 
                  className={`w-52 p-3 rounded-lg bg-white border-2 shadow-xl ${achievement.borderColor} opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out transform group-hover:translate-y-0 translate-y-2`}
                  style={{ zIndex: 100 }}
                >
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1.5">
                      {achievement.title}
                    </h4>
                    
                    <p className="text-gray-600 text-xs mb-2 leading-relaxed">
                      {achievement.description}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-xs pt-1 border-t border-gray-100">
                      <span className="text-gray-500">
                        {achievement.date}
                      </span>
                      {achievement.status === 'in-progress' && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className={`font-medium ${achievement.iconColor}`}>
                            {achievement.progress}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Keep progressing on your freelancing journey!
        </p>
      </div>
    </div>
  );
};

export default AchievementsRoadmap;