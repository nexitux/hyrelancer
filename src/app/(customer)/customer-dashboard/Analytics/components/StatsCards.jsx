import { TrendingUp, TrendingDown, Users, DollarSign, Clock, Briefcase } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';

export default function StatsCards() {
  const stats = [
    { 
      title: 'Jobs Posted', 
      value: '24', 
      icon: Briefcase, 
      trend: 'up',
      change: '+12%',
      description: 'vs last month',
      pattern: 'up-trend'
    },
    { 
      title: 'Active Applications', 
      value: '186', 
      icon: Users, 
      trend: 'up',
      change: '+8.2%',
      description: 'vs last month',
      pattern: 'steady-up'
    },
    { 
      title: 'Total Spent', 
      value: '$12,450', 
      icon: DollarSign, 
      trend: 'up',
      change: '+4.5%',
      description: 'vs last month',
      pattern: 'volatile-up'
    },
    { 
      title: 'Time to Hire', 
      value: '18 days', 
      icon: Clock, 
      trend: 'down',
      change: '-2.1%',
      description: 'vs last month',
      pattern: 'down-trend'
    }
  ];

  // CSS-based decorative line patterns
  const getPatternPath = (pattern, trend) => {
    const baseColor = trend === 'up' ? 'text-green-500' : 'text-red-500';
    const paths = {
      'up-trend': 'M2,12 Q6,8 10,6 T18,4',
      'steady-up': 'M2,10 L6,8 L10,7 L14,5 L18,3',
      'volatile-up': 'M2,14 Q4,10 6,8 Q8,6 10,9 Q12,7 14,5 Q16,3 18,2',
      'down-trend': 'M2,4 Q6,8 10,10 T18,14'
    };
    
    return (
      <div className="absolute bottom-4 right-4 w-16 h-8 opacity-20">
        <svg viewBox="0 0 20 16" className={`w-full h-full ${baseColor}`}>
          <path 
            d={paths[pattern]} 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none"
            className="animate-pulse"
          />
        </svg>
      </div>
    );
  };

  // Alternative: Dot pattern decorations
  const getDotPattern = (trend) => {
    const dotColor = trend === 'up' ? 'bg-green-500' : 'bg-red-500';
    const heights = trend === 'up' ? [4, 3, 5, 4, 6, 5, 7] : [7, 6, 5, 4, 3, 2, 1];
    
    return (
      <div className="absolute bottom-4 right-4 flex items-end space-x-1 opacity-30">
        {heights.map((height, i) => (
          <div 
            key={i}
            className={`w-1 ${dotColor} rounded-sm transition-all duration-300`}
            style={{ height: `${height * 2}px` }}
          />
        ))}
      </div>
    );
  };

  // Alternative: Geometric shapes
  const getGeometricDecoration = (trend) => {
    const color = trend === 'up' ? 'border-green-500' : 'border-red-500';
    
    return (
      <div className="absolute bottom-3 right-3 opacity-20">
        <div className={`w-6 h-6 border ${color} rotate-45 transform`}>
          <div className={`w-2 h-2 ${trend === 'up' ? 'bg-green-500' : 'bg-red-500'} absolute top-1 right-1 rounded-sm`} />
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-gray-50/30 to-white group">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`p-2.5 rounded-xl transition-all duration-300 ${
                  stat.trend === 'up' 
                    ? 'bg-green-50 group-hover:bg-green-100' 
                    : 'bg-red-50 group-hover:bg-red-100'
                }`}>
                  <stat.icon className={`w-4 h-4 ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
              <div className={`flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded-full ${
                stat.trend === 'up' 
                  ? 'text-green-700 bg-green-50' 
                  : 'text-red-700 bg-red-50'
              }`}>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0 relative">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground tracking-tight">
                {stat.title}
              </h3>
              <div className="flex items-end justify-between pr-20">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs text-muted-foreground/80">
                {stat.description}
              </p>
            </div>
            
            {/* Choose one of these decorative elements: */}
            
            {/* Option 1: SVG Path Line */}
            {index % 3 === 0 && getPatternPath(stat.pattern, stat.trend)}
            
            {/* Option 2: Dot Bar Chart */}
            {index % 3 === 1 && getDotPattern(stat.trend)}
            
            {/* Option 3: Geometric Shape */}
            {index % 3 === 2 && getGeometricDecoration(stat.trend)}
            
          </CardContent>
          
          {/* Enhanced gradient bottom accent */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${
            stat.trend === 'up' 
              ? 'bg-gradient-to-r from-green-400 via-green-500 to-emerald-500' 
              : 'bg-gradient-to-r from-red-400 via-red-500 to-rose-500'
          } opacity-60`} />
          
          {/* Subtle corner accent */}
          <div className={`absolute top-0 right-0 w-16 h-16 ${
            stat.trend === 'up' 
              ? 'bg-gradient-radial from-green-100 to-transparent' 
              : 'bg-gradient-radial from-red-100 to-transparent'
          } opacity-30 rounded-full -translate-y-8 translate-x-8`} />
        </Card>
      ))}
    </div>
  );
}