import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import axios from "axios";

import { videos } from "@/db/schema";
import { db } from "@/db";

interface InputType {
	userId: string;
	videoId: string;
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.

Transcript: {TRANSCRIPT}
`;

export const { POST } = serve(async (context) => {
	const input = context.requestPayload as InputType;
	const { userId, videoId } = input;

	// Step 1: Fetch the video from the database
	const video = await context.run("fetch-video", async () => {
		const [existingVideo] = await db
			.select()
			.from(videos)
			.where(and(eq(videos.id, videoId), eq(videos.userId, userId)));

		if (!existingVideo) throw new Error("Video not found");

		return existingVideo;
	});

	// Step 2: Fetch the transcript
	const transcript = await context.run("fetch-transcript", async () => {
		const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;

		const response = await axios.get(trackUrl);
		const text = response.data;
		if (!text) throw new Error("Transcript not found");

		return text;
	});

	// Step 3: Generate title using GEMINI
	interface GeminiCandidate {
		content: {
			parts: { text: string }[];
		};
	}

	interface GeminiResponse {
		candidates: GeminiCandidate[];
	}

	const { body } = await context.call<GeminiResponse>("generate-description", {
		method: "POST",
		url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process
			.env.GEMINI_API_KEY!}`,
		headers: { "Content-Type": "application/json" },
		body: {
			contents: [
				{
					parts: [
						{
							text: DESCRIPTION_SYSTEM_PROMPT.replace(
								"{TRANSCRIPT}",
								transcript.slice(0, 3000)
							), // Gemini has 30k token limit
						},
					],
				},
			],
		},
	});

	const description = body.candidates[0].content.parts[0].text;
	if (!description) throw new Error("description not found");

	// Step 4: Update the video description in the database
	await context.run("update-video", async () => {
		await db
			.update(videos)
			.set({
				description: description || video.description,
			})
			.where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
	});
});
