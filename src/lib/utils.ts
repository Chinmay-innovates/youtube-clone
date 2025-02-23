import { UTApi } from "uploadthing/server";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a duration in milliseconds to a formatted string in "MM:SS" format.
 *
 * @param duration - The duration in milliseconds.
 * @returns A string representing the duration in "MM:SS" format.
 */

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

/**
 * Utility function to delete video files (thumbnail, preview) from UploadThing.
 *
 * @param thumbnailKey - The key for the thumbnail file to be deleted.
 * @param previewKey - The key for the preview file to be deleted.
 */
export async function deleteFilesFromUploadThing(
	thumbnailKey: string | null,
	previewKey: string | null
) {
	const utApi = new UTApi({ token: process.env.UPLOADTHING_TOKEN! });

	const deleteUploads = [];

	if (thumbnailKey) deleteUploads.push(utApi.deleteFiles(thumbnailKey));
	if (previewKey) deleteUploads.push(utApi.deleteFiles(previewKey));

	await Promise.all(deleteUploads);
}
