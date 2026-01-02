import { useState, useCallback, useRef } from 'react';

interface ParticleEvent {
    id: number;
    x: number;
    y: number;
    type: 'explosion' | 'burst' | 'sparkle' | 'flame';
    count: number;
}

export const useParticles = () => {
    const [events, setEvents] = useState<ParticleEvent[]>([]);
    const eventIdRef = useRef(0);

    const triggerParticles = useCallback(
        (
            element: HTMLElement | null,
            type: ParticleEvent['type'] = 'explosion',
            count: number = 20
        ) => {
            if (!element) return;

            const rect = element.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            const newEvent: ParticleEvent = {
                id: eventIdRef.current++,
                x,
                y,
                type,
                count,
            };

            setEvents(prev => [...prev, newEvent]);

            // Remove event after animation completes
            setTimeout(() => {
                setEvents(prev => prev.filter(e => e.id !== newEvent.id));
            }, 1500);
        },
        []
    );

    const triggerAtPosition = useCallback(
        (
            x: number,
            y: number,
            type: ParticleEvent['type'] = 'explosion',
            count: number = 20
        ) => {
            const newEvent: ParticleEvent = {
                id: eventIdRef.current++,
                x,
                y,
                type,
                count,
            };

            setEvents(prev => [...prev, newEvent]);

            setTimeout(() => {
                setEvents(prev => prev.filter(e => e.id !== newEvent.id));
            }, 1500);
        },
        []
    );

    return {
        events,
        triggerParticles,
        triggerAtPosition,
    };
};
