import { db } from "@/db";
import { categories } from "@/db/schema";

const categoryNames = [
	"Music",
	"Gaming",
	"News",
	"Sports",
	"Entertainment",
	"Education",
	"Science & Technology",
	"Travel & Events",
	"Comedy",
	"Lifestyle",
	"Film & Animation",
	"DIY & Crafts",
	"Autos & Vehicles",
	"Health & Fitness",
	"People & Blogs",
];

async function main() {
	console.log("Seeding categories...");
	try {
		const values = categoryNames.map((name) => ({
			name,
			description: `Videos related to ${name.toLowerCase()}`,
		}));

		await db.insert(categories).values(values);

		console.log("Seeding categories complete.");
	} catch (error) {
		console.error("Error seeding categories:", error);
		process.exit(1);
	}
}
main();
