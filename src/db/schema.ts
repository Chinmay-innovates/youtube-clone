import {
	pgTable,
	text,
	timestamp,
	uuid,
	uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clerkId: text("clerk_id").unique().notNull(),
		name: text("name").notNull(),
		imageUrl: text("image_url").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [uniqueIndex("clerk_id_idx").on(t.clerkId)]
);
