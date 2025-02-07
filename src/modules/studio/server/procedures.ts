import { z } from "zod";
import { eq, and, or, lt, desc } from "drizzle-orm";

import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const studioRouter = createTRPCRouter({
	getMany: protectedProcedure
		.input(
			z.object({
				cursor: z
					.object({
						id: z.string(),
						updatedAt: z.date(),
					})
					.nullish(),
				limit: z.number().min(1).max(100),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, cursor } = input;
			const { id: userId } = ctx.user;

			const data = await db
				.select()
				.from(videos)
				.where(
					and(
						eq(videos.userId, userId),
						cursor
							? or(
									lt(videos.updatedAt, cursor.updatedAt),
									and(
										eq(videos.updatedAt, cursor.updatedAt),
										lt(videos.id, cursor.id)
									)
							  )
							: undefined
					)
				)
				.orderBy(desc(videos.updatedAt), desc(videos.id))
				// add 1 to check if there is more data
				.limit(limit + 1);

			const hasMore = data.length > limit;
			//Remove last item if there is no more data
			const items = hasMore ? data.slice(0, -1) : data;
			// set the nextCursor to the last item
			const lastItem = items[items.length - 1];
			const nextCursor = hasMore
				? {
						id: lastItem.id,
						updatedAt: lastItem.updatedAt,
				  }
				: null;

			return {
				items,
				nextCursor,
			};
		}),
});
