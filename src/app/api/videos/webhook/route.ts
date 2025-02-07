import {
	VideoAssetCreatedWebhookEvent,
	VideoAssetErroredWebhookEvent,
	VideoAssetReadyWebhookEvent,
	VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks.mjs";
import { headers } from "next/headers";

import { mux } from "@/lib/mux";
import { db } from "@/db";
import { videos } from "@/db/schema";
import { eq } from "drizzle-orm";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!;

type WebhookEvent =
	| VideoAssetCreatedWebhookEvent
	| VideoAssetReadyWebhookEvent
	| VideoAssetErroredWebhookEvent
	| VideoAssetTrackReadyWebhookEvent;
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
	}

	return new Response("Webhook received", { status: 200 });
};
