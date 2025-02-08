"use client";
import MuxPlayer from "@mux/mux-player-react";
interface VideoPlayerProps {
	playbackId?: string | null | undefined;
	thumbnailUrl?: string | null | undefined;
	autoPlay?: boolean;
	onPlay?: () => void;
}

export const VideoPlayer = ({
	onPlay,
	autoPlay,
	playbackId,
	thumbnailUrl,
}: VideoPlayerProps) => {
	return (
		<div className="relative group w-full h-full">
			<MuxPlayer
				playbackId={playbackId || ""}
				poster={thumbnailUrl || "/placeholder.svg"}
				playerInitTime={0}
				autoPlay={autoPlay}
				thumbnailTime={0}
				className="w-full h-full object-contain"
				onPlay={onPlay}
				accentColor="#FF006F"
			/>
		</div>
	);
};
