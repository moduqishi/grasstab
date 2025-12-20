import { useEffect, useState, useRef } from 'react';

interface UseInViewOptions extends IntersectionObserverInit {
    triggerOnce?: boolean;
}

export function useInView(options: UseInViewOptions = {}) {
    const { 
        root = null, 
        rootMargin = '0px', 
        threshold = 0, 
        triggerOnce = false 
    } = options;

    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        // Check if IntersectionObserver is supported
        if (!window.IntersectionObserver) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            const isIntersecting = entry.isIntersecting;
            
            if (isIntersecting) {
                setInView(true);
                if (triggerOnce) {
                    observer.unobserve(element);
                }
            } else {
                if (!triggerOnce) {
                    setInView(false);
                }
            }
        }, { root, rootMargin, threshold });

        observer.observe(element);

        return () => {
            if (element) observer.unobserve(element);
        };
    }, [root, rootMargin, threshold, triggerOnce]);

    return { ref, inView };
}
