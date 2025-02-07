"use client";

import { Suspense } from "react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { DEFAULT_DURATION, DEFAULT_LIMIT } from "@/constants";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { VideoThumbnail } from "@/modules/videos/ui/components/video-thumbnail";

export const VideoSection = () => {
	return (
		<Suspense fallback={<p>Loading</p>}>
			<ErrorBoundary fallback={<p>error</p>}>
				<VideoSectionSuspense />
			</ErrorBoundary>
		</Suspense>
	);
};

const VideoSectionSuspense = () => {
	const [videos, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);
	return (
		<div>
			<div className="border-y">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="pl-6 w-[510px]">Vidoes</TableHead>
							<TableHead>Visibility</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Date</TableHead>
							<TableHead className="text-right">Views</TableHead>
							<TableHead className="text-right">Comments</TableHead>
							<TableHead className="text-right pr-6">Likes</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{videos.pages
							.flatMap((page) => page.items)
							.map((video) => (
								<Link
									href={`/studio/videos/${video.id}`}
									key={video.id}
									legacyBehavior
								>
									<TableRow className="cursor-pointer">
										<TableCell>
											<div className="flex items-center gap-4">
												<div className="relative aspect-video w-36 shrink-0">
													<VideoThumbnail
														imageURL={video.thumbnailUrl}
														previewURL={video.previewUrl}
														title={video.title}
														duration={video.duration || DEFAULT_DURATION}
													/>
												</div>
											</div>
										</TableCell>
										<TableCell>Visibility</TableCell>
										<TableCell>Status</TableCell>
										<TableCell>Date</TableCell>
										<TableCell className="text-right">Views</TableCell>
										<TableCell className="text-right">comments</TableCell>
										<TableCell className="text-right pr-6">likes</TableCell>
									</TableRow>
								</Link>
							))}
					</TableBody>
				</Table>
			</div>
			<InfiniteScroll
				isManual
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	);
};
