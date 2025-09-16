"use client";

export default function Banner() {
  return (
    <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      <div className="relative overflow-hidden py-3">
        <div className="flex animate-marquee">
          <div className="flex items-center space-x-8 whitespace-nowrap px-4">
            <span className="text-sm font-medium text-slate-300">
              Welcome to Hyrelancer - Professional Freelance Platform
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-slate-300">
              Connect with Top Talent
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-slate-300">
              Find Premium Projects
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-slate-300">
              Advance Your Career
            </span>
            <span className="text-slate-500">•</span>
          </div>
          <div className="flex items-center space-x-8 whitespace-nowrap px-4">
            <span className="text-sm font-medium text-slate-300">
              Welcome to Hyrelancer - Professional Freelance Platform
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-slate-300">
              Connect with Top Talent
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-slate-300">
              Find Premium Projects
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-sm font-medium text-slate-300">
              Advance Your Career
            </span>
            <span className="text-slate-500">•</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}