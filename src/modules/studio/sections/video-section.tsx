"use client";

import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { InfiniteScroll } from "@/components/infinite-scroll";

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
	const [data, query] = trpc.studio.getMany.useSuspenseInfiniteQuery(
		{
			limit: DEFAULT_LIMIT,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);
	return (
		<div>
			{JSON.stringify(data)}
			<InfiniteScroll
				isManual
				hasNextPage={query.hasNextPage}
				isFetchingNextPage={query.isFetchingNextPage}
				fetchNextPage={query.fetchNextPage}
			/>
		</div>
	);
};
