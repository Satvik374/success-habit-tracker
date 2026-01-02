import { useCallback } from 'react';
import confetti from 'canvas-confetti';

// Simple synth sounds using Web Audio API
const playSound = (type: 'complete' | 'levelUp' | 'achievement') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'complete') {
      // Quick cheerful "ding" for task completion
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialDecayTo?.(0.01, audioContext.currentTime + 0.2) ||
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } else if (type === 'levelUp') {
      // Triumphant ascending arpeggio for level up
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.1);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.3);
        osc.start(audioContext.currentTime + i * 0.1);
        osc.stop(audioContext.currentTime + i * 0.1 + 0.3);
      });
      return;
    } else if (type === 'achievement') {
      // Magical sparkle for achievements
      const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6
      notes.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.setValueAtTime(freq, audioContext.currentTime + i * 0.08);
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.4);
        osc.start(audioContext.currentTime + i * 0.08);
        osc.stop(audioContext.currentTime + i * 0.08 + 0.4);
      });
      return;
    }
  } catch (e) {
    // Audio not supported, fail silently
  }
};

export const useCelebration = () => {
  const triggerTaskComplete = useCallback(() => {
    playSound('complete');
    
    // Small burst of confetti from cursor area
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
      scalar: 0.8,
    });
  }, []);

  const triggerHabitComplete = useCallback(() => {
    playSound('complete');
    
    // Gentle confetti for habits
    confetti({
      particleCount: 20,
      spread: 45,
      origin: { y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7'],
      scalar: 0.7,
    });
  }, []);

  const triggerLevelUp = useCallback((level: number) => {
    playSound('levelUp');
    
    // Epic confetti explosion for level up
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fff'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fff'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Center burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#fff'],
        scalar: 1.2,
      });
    }, 300);
  }, []);

  const triggerAchievement = useCallback(() => {
    playSound('achievement');
    
    // Starry confetti for achievements
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#a78bfa', '#c4b5fd', '#fbbf24', '#fff'],
      shapes: ['star', 'circle'],
      scalar: 1,
    });
  }, []);

  const triggerPerfectDay = useCallback(() => {
    playSound('levelUp');
    
    // Rainbow explosion for perfect day
    const colors = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6', '#8b5cf6'];
    
    confetti({
      particleCount: 150,
      spread: 180,
      origin: { y: 0.5 },
      colors,
      scalar: 1.3,
    });
  }, []);

  return {
    triggerTaskComplete,
    triggerHabitComplete,
    triggerLevelUp,
    triggerAchievement,
    triggerPerfectDay,
  };
};
