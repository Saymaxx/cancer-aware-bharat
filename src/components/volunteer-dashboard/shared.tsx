import React, { useState, useEffect } from 'react';

// ===========================
// Animated Counter
// ===========================
export function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * value));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
}

// ===========================
// Countdown Timer Hook & Display
// ===========================
function useCountdown(targetDate: string) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);
  return timeLeft;
}

export function CountdownDisplay({ targetDate }: { targetDate: string }) {
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  return (
    <div className="flex space-x-1.5">
      {[
        { val: days, label: 'd' },
        { val: hours, label: 'h' },
        { val: minutes, label: 'm' },
        { val: seconds, label: 's' },
      ].map((t, i) => (
        <div key={i} className="bg-primary/10 rounded-lg px-2 py-1 text-center min-w-[36px]">
          <span className="text-xs font-bold text-primary tabular-nums">{String(t.val).padStart(2, '0')}</span>
          <span className="text-[9px] text-slate-500 ml-0.5">{t.label}</span>
        </div>
      ))}
    </div>
  );
}

// ===========================
// Section Header
// ===========================
export function SectionHeader({ icon: Icon, title, subtitle, action }: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start sm:items-center justify-between mb-5 flex-col sm:flex-row gap-2">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-headline-lg text-lg sm:text-xl font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
