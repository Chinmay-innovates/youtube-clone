import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import Replicate from "replicate";

import { videos } from "@/db/schema";
import { db } from "@/db";
import { UTApi } from "uploadthing/server";

interface InputType {
	userId: string;
	videoId: string;
	prompt: string;
}

export const { POST } = serve(async (context) => {
	const input = context.requestPayload as InputType;
	const utApi = new UTApi({ token: process.env.UPLOADTHING_TOKEN! });

	const { userId, videoId, prompt } = input;

	const replicate = new Replicate({
		auth: process.env.REPLICATE_API_KEY!,
	});

	const video = await context.run("fetch-video", async () => {
		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

		if (!existingVideo) throw new Error("Video not found");

		return existingVideo;
	});

	const output = await context.call("generate-thumbnail", async () => {
		return replicate.run("black-forest-labs/flux-schnell", {
			input: {
				prompt: `${prompt}, professional youtube thumbnail, trending on artstation`,
				negative_prompt: "text, watermark, low quality",
				width: 1792,
				height: 1024,
				num_outputs: 1,
			},
		});
	});
	const thumbnailUrl = output[0] as any;
	if (!thumbnailUrl) throw new Error("Thumbnail generation failed");

	await context.run("cleanup-thumbnail", async () => {
		if (video.thumbnailKey) {
			await utApi.deleteFiles(video.thumbnailKey);

			await db
				.update(videos)
				.set({
					thumbnailUrl: null,
					thumbnailKey: null,
				})
				.where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
		}
	});

	const uploadedThumbnail = await context.run("upload-thumbnail", async () => {
		const { data } = await utApi.uploadFilesFromUrl(thumbnailUrl);

		if (!data) throw new Error("Thumbnail not uploaded");

		return data;
	});

	await context.run("update-video", async () => {
		await db
			.update(videos)
			.set({
				thumbnailKey: uploadedThumbnail.key,
				thumbnailUrl: uploadedThumbnail.url,
			})
			.where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
	});
});
