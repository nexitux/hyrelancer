"use client";
import React, { useState } from 'react';
import { Trophy, Target, Zap, Award, Star } from 'lucide-react';

const AchievementsRoadmap = ({ width = 400, height = 400 }) => {
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
        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm">
          {achievements.filter(a => a.status === 'completed').length}/{achievements.length} Complete
        </span>
      </div>

      <div className="relative h-[450px] bg-gradient-to-b from-green-100 via-emerald-50 to-teal-50 rounded-xl shadow-inner">
        {/* Realistic Curved Road using absolute positioned divs */}
        <svg
width={width}
height={height}
viewBox="0 0 400 400"
preserveAspectRatio="none"
className="absolute inset-0 w-full h-full"
xmlns="http://www.w3.org/2000/svg"
>
<defs>
{/* asphalt texture using turbulence + displacement */}
<filter id="asphaltFilter">
<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" result="noise" />
<feColorMatrix in="noise" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.7 0" result="alphaNoise" />
<feComposite in="alphaNoise" in2="SourceGraphic" operator="in" result="textured"/>
<feGaussianBlur in="textured" stdDeviation="0.6" result="blurred"/>
<feMerge>
<feMergeNode in="blurred" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>


{/* subtle sheen to simulate wet / reflective patches */}
<filter id="sheen" x="-50%" y="-50%" width="200%" height="200%">
<feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
<feColorMatrix in="blur" type="matrix" values="0 0 0 0 0.15 0 0 0 0 0.15 0 0 0 0 0.15 0 0 0 0.4 0" />
<feBlend in2="SourceGraphic" in="SourceGraphic" mode="screen" />
</filter>


{/* soft drop shadow for road */}
<filter id="roadShadow" x="-10%" y="-10%" width="120%" height="120%">
<feDropShadow dx="0" dy="6" stdDeviation="6" floodOpacity="0.25" />
</filter>


{/* glow used for the center line (reflective paint) */}
<filter id="glow">
<feGaussianBlur stdDeviation="3" result="coloredBlur" />
<feMerge>
<feMergeNode in="coloredBlur" />
<feMergeNode in="SourceGraphic" />
</feMerge>
</filter>


{/* gradient for road surface (slight 3D shading) */}
<linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stopColor="#2a2f36" />
<stop offset="50%" stopColor="#42474e" />
<stop offset="100%" stopColor="#1f272b" />
</linearGradient>


{/* shoulder / grass gradient */}
<linearGradient id="grass" x1="0%" y1="0%" x2="0%" y2="100%">
<stop offset="0%" stopColor="#3a7a2b" />
<stop offset="100%" stopColor="#245717" />
</linearGradient>


{/* fade mask to simulate perspective (dashes get fainter toward horizon) */}
<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
<stop offset="30%" stopColor="#fff" stopOpacity="0.6" />
<stop offset="70%" stopColor="#fff" stopOpacity="0.2" />
<stop offset="100%" stopColor="#fff" stopOpacity="0" />
</linearGradient>
<mask id="fadeMask">
<rect x="0" y="0" width="400" height="400" fill="url(#fade)" />
</mask>


{/* small reflectors pattern for side posts */}
<pattern id="reflector" width="24" height="16" patternUnits="userSpaceOnUse">
<rect width="8" height="2" x="0" y="7" rx="1" fill="#ffffff" opacity="0.9" />
</pattern>


</defs>


{/* background sky / horizon subtle */}
<rect x="0" y="0" width="400" height="400" fill="#071026" />


{/* distant horizon glow */}
<ellipse cx="200" cy="60" rx="120" ry="30" fill="#0c2a4a" opacity="0.6" />


{/* left grass shoulder */}
<path d="M 80 90 C 60 140, 60 210, 80 300 L 0 400 L 0 0 Z" fill="url(#grass)" opacity="0.9" />


{/* right grass shoulder */}
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
              {/* Location pin shape node */}
              <button
                onClick={() => setActiveAchievement(achievement.id)}
                className={`relative z-10 w-14 h-16 flex items-center justify-center flex-shrink-0 transition-all duration-300 cursor-pointer ${isActive ? 'scale-125' : 'hover:scale-110'}`}
                style={{
                  filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
                }}
              >
                {/* Pin SVG shape */}
                <svg viewBox="0 0 100 120" className="w-full h-full">
                  <defs>
                    <filter id={`pinShadow-${achievement.id}`}>
                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                    </filter>
                  </defs>
                  
                  {/* Pin outline (white border) */}
                  <path
                    d="M 50 5 C 30 5, 15 20, 15 40 C 15 65, 50 100, 50 100 C 50 100, 85 65, 85 40 C 85 20, 70 5, 50 5 Z"
                    fill="white"
                    filter={`url(#pinShadow-${achievement.id})`}
                  />
                  
                  {/* Pin body */}
                  <path
                    d="M 50 10 C 32 10, 20 22, 20 40 C 20 62, 50 92, 50 92 C 50 92, 80 62, 80 40 C 80 22, 68 10, 50 10 Z"
                    fill={achievement.status === 'completed' 
                      ? achievement.color.replace('bg-', '#')
                        .replace('blue-500', '3b82f6')
                        .replace('green-500', '22c55e')
                        .replace('yellow-500', 'eab308')
                        .replace('orange-500', 'f97316')
                        .replace('purple-500', 'a855f7')
                      : achievement.status === 'in-progress'
                      ? '#ffffff'
                      : '#d1d5db'}
                  />
                  
                  {/* Inner circle for icon */}
                  <circle 
                    cx="50" 
                    cy="38" 
                    r="18" 
                    fill={achievement.status === 'completed' ? 'rgba(255,255,255,0.3)' : 'transparent'}
                    stroke={achievement.status === 'completed' ? 'rgba(255,255,255,0.5)' : 'transparent'}
                    strokeWidth="1"
                  />
                </svg>
                
                {/* Icon positioned in center of pin */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2">
                  <Icon 
                    className={`w-5 h-5 ${
                      achievement.status === 'completed' 
                        ? 'text-white' 
                        : achievement.iconColor
                    }`} 
                  />
                </div>
                
              </button>

              {/* Details Card - Positioned dynamically */}
              {isActive && (
                <div 
                  className={`absolute top-1/2 left-20 w-64 p-4 rounded-lg border-2 bg-white shadow-xl z-50 ${achievement.borderColor}`}
                  style={{
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                    maxWidth: 'calc(100vw - 2rem)',
                    left: '5rem',
                    zIndex: 9999
                  }}
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