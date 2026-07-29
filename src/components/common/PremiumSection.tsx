import React from 'react';
import { Heart, Shield, Stethoscope, Award, Activity, Crosshair } from 'lucide-react';

export type PremiumSectionVariant = 'warm-1' | 'warm-2' | 'warm-3' | 'white';

interface PremiumSectionProps {
  children: React.ReactNode;
  variant?: PremiumSectionVariant;
  className?: string;
  containerClassName?: string;
  withGlow?: boolean;
  withIcons?: boolean;
  withTopDivider?: 'wave' | 'torn' | 'none';
  withBottomDivider?: 'wave' | 'torn' | 'none';
  paddingClass?: string;
  id?: string;
}

const backgroundMap = {
  'warm-1': 'bg-[#FFFDF8]', // Section A
  'warm-2': 'bg-[#FFF8ED]', // Section B
  'warm-3': 'bg-[#FFF6EA]', // Section C
  'white': 'bg-white',      // Fallback
};

export default function PremiumSection({
  children,
  variant = 'warm-1',
  className = '',
  containerClassName = '',
  withGlow = true,
  withIcons = true,
  withTopDivider = 'none',
  withBottomDivider = 'none',
  paddingClass = 'py-24 md:py-32', // 100-130px spacing
  id,
}: PremiumSectionProps) {
  
  // Randomize icon float delays and positions for organic feel
  const icons = [
    { Icon: Heart, top: '15%', left: '10%', delay: '0ms', duration: '8s' },
    { Icon: Shield, top: '65%', right: '15%', delay: '1500ms', duration: '12s' },
    { Icon: Stethoscope, bottom: '20%', left: '20%', delay: '700ms', duration: '9s' },
    { Icon: Award, top: '25%', right: '8%', delay: '2000ms', duration: '10s' },
    { Icon: Activity, bottom: '35%', right: '25%', delay: '3000ms', duration: '11s' },
    { Icon: Crosshair, top: '50%', left: '5%', delay: '1000ms', duration: '7s' },
  ];

  return (
    <section 
      id={id}
      className={`relative overflow-hidden w-full ${backgroundMap[variant]} ${paddingClass} ${className}`}
    >
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-multiply" />

      {/* Glow Effects */}
      {withGlow && (
        <>
          {/* Top Left Saffron Glow */}
          <div className="absolute top-0 left-0 w-[40vw] max-w-[600px] h-[40vw] max-h-[600px] bg-[#F28C28] opacity-[0.08] blur-[100px] rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3" />
          {/* Bottom Right Peach Glow */}
          <div className="absolute bottom-0 right-0 w-[40vw] max-w-[600px] h-[40vw] max-h-[600px] bg-[#FFCBA4] opacity-[0.12] blur-[120px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />
        </>
      )}

      {/* Floating Outline Graphics */}
      {withIcons && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          {icons.map((item, idx) => (
            <div
              key={idx}
              className="absolute text-primary opacity-[0.05] animate-float-slow"
              style={{
                top: item.top,
                bottom: item.bottom,
                left: item.left,
                right: item.right,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              <item.Icon className="w-16 h-16 md:w-24 md:h-24 stroke-[1.5]" />
            </div>
          ))}
        </div>
      )}

      {/* Top Divider */}
      {withTopDivider === 'torn' && (
        <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180 pointer-events-none z-10">
          <svg className="relative block w-[calc(133%+1.3px)] h-[30px] md:h-[50px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" className="text-white opacity-50"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="currentColor" className="text-white opacity-30"></path>
          </svg>
        </div>
      )}

      {/* Content */}
      <div className={`section-container relative z-10 ${containerClassName}`}>
        {children}
      </div>

      {/* Bottom Divider */}
      {withBottomDivider === 'torn' && (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none z-10">
          <svg className="relative block w-[calc(133%+1.3px)] h-[30px] md:h-[50px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="currentColor" className="text-white opacity-50"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="currentColor" className="text-white opacity-30"></path>
          </svg>
        </div>
      )}
    </section>
  );
}
