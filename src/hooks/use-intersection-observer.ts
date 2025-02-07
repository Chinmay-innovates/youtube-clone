import { useEffect, useRef, useState } from "react";

export const useIntersectionObserver = (opts?: IntersectionObserverInit) => {
	const [isIntersecting, setIsIntersecting] = useState(false);
	const targetRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			setIsIntersecting(entry.isIntersecting);
		}, opts);

		if (targetRef.current) observer.observe(targetRef.current);

		return () => observer.disconnect();
	}, [opts]);

	return { targetRef, isIntersecting };
};
