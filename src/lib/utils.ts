import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatDuration = (duration: number) => {
	const seconds = Math.floor((duration % 60_000) / 1000);
	const minutes = Math.floor(duration / 60_000);

	return `${minutes.toString().padStart(2, "0")}:${seconds
		.toString()
		.padStart(2, "0")}`;
};

export const snakeCaseToTitleCase = (str: string) => {
	return str
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};
