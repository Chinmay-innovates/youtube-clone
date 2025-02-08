import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videos, videoUpdateSchema } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
	remove: protectedProcedure
		.input(z.object({ id: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;

			const [removedVideo] = await db
				.delete(videos)
				.where(and(eq(videos.userId, userId), eq(videos.id, input.id)))
				.returning();

			if (!removedVideo) throw new TRPCError({ code: "NOT_FOUND" });

			return removedVideo;
		}),
	update: protectedProcedure
		.input(videoUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			const { id: userId } = ctx.user;

			if (!input.id) throw new TRPCError({ code: "BAD_REQUEST" });
			const [updatedInput] = await db
				.update(videos)
				.set({
					title: input.title,
					description: input.description,
					categoryId: input.categoryId,
					visibility: input.visibility,
					updatedAt: new Date(),
				})
				.where(and(eq(videos.userId, userId), eq(videos.id, input.id)))
				.returning();
			if (!updatedInput) throw new TRPCError({ code: "NOT_FOUND" });

			return updatedInput;
		}),
	create: protectedProcedure.mutation(async ({ ctx }) => {
		const { id: userId } = ctx.user;

		const upload = await mux.video.uploads.create({
			new_asset_settings: {
				passthrough: userId,
				playback_policy: ["public"],
				input: [
					{
						generated_subtitles: [
							{
								language_code: "en",
								name: "English",
							},
						],
					},
				],
			},
			cors_origin: "*", //TODO: In prod , set url own url
		});

		const [video] = await db
			.insert(videos)
			.values({
				userId,
				title: "Untitled",
				muxStatus: "waiting",
				muxUploadId: upload.id,
			})
			.returning();

		return {
			video: video,
			url: upload.url,
		};
	}),
});
