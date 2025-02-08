import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { UploadThingError, UTApi } from "uploadthing/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";

import { users, videos } from "@/db/schema";
import { db } from "@/db";

const f = createUploadthing();

export const ourFileRouter = {
	thumnnailUploader: f({
		image: {
			maxFileSize: "4MB",
			maxFileCount: 1,
		},
	})
		.input(
			z.object({
				videoId: z.string().uuid(),
			})
		)
		.middleware(async ({ input }) => {
			const { userId: clerkUserId } = await auth();

			if (!clerkUserId) throw new UploadThingError("Unauthorized");

			const [user] = await db
				.select()
				.from(users)
				.where(eq(users.clerkId, clerkUserId));

			if (!user) throw new UploadThingError("Unauthorized");

			const [existingVideo] = await db
				.select({
					thumbnailKey: videos.thumbnailKey,
				})
				.from(videos)
				.where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)))
				.limit(1);

			if (!existingVideo) throw new UploadThingError("Not found");

			if (existingVideo.thumbnailKey) {
				const utApi = new UTApi({
					token: process.env.UPLOADTHING_TOKEN!,
				});

				await utApi.deleteFiles(existingVideo.thumbnailKey);

				await db
					.update(videos)
					.set({
						thumbnailUrl: null,
						thumbnailKey: null,
					})
					.where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
			}

			return { user, ...input };
		})
		.onUploadComplete(async ({ metadata, file }) => {
			await db
				.update(videos)
				.set({
					thumbnailUrl: file.url,
					thumbnailKey: file.key,
				})
				.where(
					and(
						eq(videos.id, metadata.videoId),
						eq(videos.userId, metadata.user.id)
					)
				);

			return { uploadedBy: metadata.user.id };
		}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
