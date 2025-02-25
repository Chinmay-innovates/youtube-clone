"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { VideoPlayer } from "../ui/components/video-player";
import { VideoBanner } from "../ui/components/video-banner";
import { VideoTopRow } from "../ui/components/video-top-row";

interface VideoSectionProps {
	videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<ErrorBoundary fallback={<p>Something went wrong</p>}>
				<VideoSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
	const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

	return (
		<>
			<div
				className={cn(
					"aspect-video bg-black rounded-xl overflow-hidden relative",
					video.muxStatus !== "ready" && "rounded-b-none"
				)}
			>
				<VideoPlayer
					// autoPlay
					onPlay={() => {}}
					playbackId={video.muxPlaybackId}
					thumbnailUrl={video.thumbnailUrl}
				/>
			</div>

			<VideoBanner status={video.muxStatus} />
			<VideoTopRow video={video} />
		</>
	);
};
