import { createTRPCRouter, protectedProcedure } from "../init";
import { z } from "zod";
export const appRouter = createTRPCRouter({
	hello: protectedProcedure
		.input(
			z.object({
				text: z.string(),
			})
		)
		.query((opts) => {
			console.log({ db_user: opts.ctx.user });
			return {
				greeting: `hello ${opts.input.text}`,
			};
		}),
});

export type AppRouter = typeof appRouter;
