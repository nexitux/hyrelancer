// components/Loader.js
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader() {
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Simulate loading or wait for page to load
  //   const timer = setTimeout(() => {
  //     setLoading(false);
  //   }, 3000); // 3 seconds loader
  //   return () => clearTimeout(timer);
  // }, []);

  // if (!loading) return null;

  // return (
  //   <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
  //     <video
  //       src="/images/Logo_Animation.mp4"
  //       autoPlay
  //       muted
  //       className="w-64 h-64 object-cover"
  //       onEnded={e => e.target.play()}
  //     />
  //   </div>
  // );
  
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white">
        <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-spin-dot-one rounded-full bg-blue-600"></div>
            <div className="h-4 w-4 animate-spin-dot-two rounded-full bg-blue-400"></div>
            <div className="h-4 w-4 animate-spin-dot-three rounded-full bg-blue-200"></div>
            <div className="h-4 w-4 animate-spin-dot-four rounded-full bg-blue-100"></div>
        </div>
    </div>
  );
}
