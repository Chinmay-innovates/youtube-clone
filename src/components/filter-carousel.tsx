"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./ui/carousel";
import { Skeleton } from "./ui/skeleton";

interface FilterCarouselProps {
	value?: string | null;
	isLoading?: boolean;
	onSelectAction: (value: string | null) => void;
	data: { label: string; value: string }[];
}

export const FilterCarousel = ({
	data,
	isLoading,
	onSelectAction,
	value,
}: FilterCarouselProps) => {
	const [api, setApi] = useState<CarouselApi>();
	const [count, setCount] = useState<number>(0);
	const [current, setCurrent] = useState<number>(0);

	useEffect(() => {
		if (!api) return;

		setCount(api.scrollSnapList().length);
		setCurrent(api.selectedScrollSnap() + 1);

		api.on("select", () => {
			setCurrent(api.selectedScrollSnap() + 1);
		});
	}, [api]);
	return (
		<div className="relative w-full">
			{/* LEFT FADE */}
			<div
				className={cn(
					"absolute left-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none",
					current === 1 && "hidden"
				)}
			/>
			<Carousel
				setApi={setApi}
				opts={{
					align: "start",
					dragFree: true,
				}}
				className="w-full px-12"
			>
				<CarouselContent className="-ml-3">
					{!isLoading && (
						<CarouselItem className="pl-3 basis-auto">
							<Badge
								onClick={() => onSelectAction(null)}
								variant={!value ? "default" : "secondary"}
								className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
							>
								All
							</Badge>
						</CarouselItem>
					)}
					{isLoading &&
						Array.from({ length: 15 }).map((_, i) => (
							<CarouselItem key={i} className="pl-3 basis-auto">
								<Skeleton className="rounded-lg px-3 py-1 h-full text-sm w-[100px] font-semibold">
									&nbsp;
								</Skeleton>
							</CarouselItem>
						))}
					{!isLoading &&
						data.map((item) => (
							<CarouselItem
								key={item.value}
								className="pl-3 basis-auto"
								onClick={() => onSelectAction(item.value)}
							>
								<Badge
									variant={item.value === value ? "default" : "secondary"}
									className="rounded-lg px-3 py-1 cursor-pointer whitespace-nowrap text-sm"
								>
									{item.label}
								</Badge>
							</CarouselItem>
						))}
				</CarouselContent>
				<CarouselNext className="right-0 z-20" />
				<CarouselPrevious className="left-0 z-20" />
			</Carousel>
			{/* RIGHT FADE */}
			<div
				className={cn(
					"absolute right-12 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none",
					current === count && "hidden"
				)}
			/>
		</div>
	);
};
