import {
	VideoAssetCreatedWebhookEvent,
	VideoAssetDeletedWebhookEvent,
	VideoAssetErroredWebhookEvent,
	VideoAssetReadyWebhookEvent,
	VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { mux } from "@/lib/mux";
import { videos } from "@/db/schema";
import { DEFAULT_DURATION } from "@/constants";
import { UTApi } from "uploadthing/server";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetTrackReadyWebhookEvent
	| VideoAssetDeletedWebhookEvent;
export const POST = async (req: Request) => {
	if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET is not set.");

	const headersPayload = await headers();
	const mux_signature = headersPayload.get("mux-signature");

	if (!mux_signature)
		throw new Response("Missing Mux headers", { status: 400 });

	const payload = await req.json();
	const body = JSON.stringify(payload);

	mux.webhooks.verifySignature(
		body,
		{
			"mux-signature": mux_signature,
		},
		SIGNING_SECRET
	);
	switch (payload.type as WebhookEvent["type"]) {
		case "video.asset.created": {
			const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

			if (!data.upload_id) return new Response("No upload id", { status: 400 });

			await db
				.update(videos)
				.set({
					muxAssetId: data.id,
					muxStatus: data.status,
				})
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.ready": {
			const data = payload.data as VideoAssetReadyWebhookEvent["data"];
			const playbackId = data.playback_ids?.[0].id;

			if (!playbackId) return new Response("No playback id", { status: 400 });
			if (!data.upload_id) return new Response("No upload id", { status: 400 });

			const __thumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
			const __previewUrl = `https://image.mux.com/${playbackId}/animated.gif`;
			const duration = data.duration
				? Math.round(data.duration * 1000)
				: DEFAULT_DURATION;

			const utApi = new UTApi({ token: process.env.UPLOADTHING_TOKEN! });

			const [uploadedThumbnail, uploadedPreview] =
				await utApi.uploadFilesFromUrl([__thumbnailUrl, __previewUrl]);

			if (!uploadedThumbnail.data || !uploadedPreview.data)
				return new Response("Failed to upload thumbnail or preview", {
					status: 500,
				});

			const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;
			const { key: previewKey, url: previewUrl } = uploadedPreview.data;

			await db
				.update(videos)
				.set({
					muxAssetId: data.id,
					muxStatus: data.status,
					muxPlaybackId: playbackId,
					thumbnailUrl,
					thumbnailKey,
					previewUrl,
					previewKey,
					duration,
				})
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.errored": {
			const data = payload.data as VideoAssetErroredWebhookEvent["data"];

			if (!data.upload_id) return new Response("No upload id", { status: 400 });

			await db
				.update(videos)
				.set({
					muxStatus: data.status,
				})
				.where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.deleted": {
			const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

			if (!data.upload_id) return new Response("No upload id", { status: 400 });

			await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));
			break;
		}
		case "video.asset.track.ready": {
			const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
				asset_id: string;
			};
			const trackId = data.id;
			const status = data.status;
			console.log("TRACK READY");

			if (!data.asset_id) return new Response("No upload id", { status: 400 });

			await db
				.update(videos)
				.set({
					muxTrackId: trackId,
					muxTrackStatus: status,
				})
				.where(eq(videos.muxAssetId, data.asset_id));
			break;
		}
	}

	return new Response("Webhook received", { status: 200 });
};
