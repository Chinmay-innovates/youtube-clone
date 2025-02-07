import { relations } from "drizzle-orm";
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

export const userRelations = relations(users, ({ many }) => ({
	videos: many(videos),
}));

export const categories = pgTable(
	"categories",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull().unique(),
		description: text("description"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(t) => [uniqueIndex("name_idx").on(t.name)]
);

export const categoryRelations = relations(users, ({ many }) => ({
	videos: many(videos),
}));

export const videos = pgTable("videos", {
	id: uuid("id").defaultRandom().primaryKey(),
	title: text("title").notNull(),
	description: text("description"),
	muxStatus: text("mux_status"),
	muxAssetId: text("mux_assest_id").unique(),
	muxUploadId: text("mux_upload_id").unique(),
	muxPlaybackId: text("mux_playback_id").unique(),
	muxTrackId: text("mux_track_id").unique(),
	muxTrackStatus: text("mux_track_status"),
	userId: uuid("user_id")
		.references(() => users.id, {
			onDelete: "cascade",
		})
		.notNull(),
	categoryId: uuid("category_id").references(() => categories.id, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const videoRelations = relations(videos, ({ one }) => ({
	users: one(users, {
		fields: [videos.userId],
		references: [users.id],
	}),
	category: one(categories, {
		fields: [videos.categoryId],
		references: [categories.id],
	}),
}));
