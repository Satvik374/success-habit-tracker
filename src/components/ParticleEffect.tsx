import { useEffect, useState } from 'react';
import { useAuraTheme } from '@/contexts/AuraThemeContext';

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    life: number;
    opacity: number;
}

interface ParticleEffectProps {
    trigger: boolean;
    x?: number;
    y?: number;
    count?: number;
    type?: 'explosion' | 'burst' | 'sparkle' | 'flame';
}

const ParticleEffect = ({
    trigger,
    x = 0,
    y = 0,
    count = 20,
    type = 'explosion'
}: ParticleEffectProps) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const { themeColors } = useAuraTheme();

    useEffect(() => {
        if (!trigger) return;

        const newParticles: Particle[] = [];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = type === 'explosion' ? 3 + Math.random() * 2 : 1.5 + Math.random();

            newParticles.push({
                id: Date.now() + i,
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: type === 'sparkle' ? 2 + Math.random() * 2 : 3 + Math.random() * 3,
                life: 1,
                opacity: 1,
            });
        }

        setParticles(newParticles);

        // Animate particles
        const duration = type === 'flame' ? 1500 : 1000;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                setParticles([]);
                return;
            }

            setParticles(prev =>
                prev.map(p => ({
                    ...p,
                    x: p.x + p.vx,
                    y: p.y + p.vy + (type === 'flame' ? -0.5 : 0.5), // Float up for flame, fall for others
                    vy: p.vy + (type === 'flame' ? -0.05 : 0.1), // Gravity or anti-gravity
                    life: 1 - progress,
                    opacity: Math.max(0, 1 - progress * 1.5),
                }))
            );

            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [trigger, x, y, count, type]);

    if (particles.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-0 z-50">
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                        left: particle.x,
                        top: particle.y,
                        width: particle.size,
                        height: particle.size,
                        background: `linear-gradient(135deg, ${themeColors.particleStart}, ${themeColors.particleEnd})`,
                        opacity: particle.opacity,
                        boxShadow: `0 0 ${particle.size * 2}px ${themeColors.particleStart}`,
                        transform: `scale(${particle.life})`,
                        transition: 'transform 0.1s ease-out',
                    }}
                />
            ))}
        </div>
    );
};

export default ParticleEffect;
