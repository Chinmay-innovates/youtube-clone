import { VideoView } from "@/modules/videos/views/video-view";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

interface PageProps {
	params: Promise<{ videoId: string }>;
}
const Page = async ({ params }: PageProps) => {
	const { videoId } = await params;

	void trpc.videos.getOne.prefetch({ id: videoId });

	return (
		<HydrateClient>
			<VideoView videoId={videoId} />
		</HydrateClient>
	);
};

export default Page;
