import { ResponsiveModal } from "@/components/responsive-modal";
import { UploadDropzone } from "@/lib/uploadthing";
import { trpc } from "@/trpc/client";

interface ThumbnailUploadModalProps {
	videoId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const ThumbnailUploadModal = ({
	open,
	videoId,
	onOpenChange,
}: ThumbnailUploadModalProps) => {
	const utils = trpc.useUtils();

	const onUploadComplete = () => {
		utils.studio.getMany.invalidate();
		utils.studio.getOne.invalidate({ id: videoId });
		onOpenChange(false);
	};
	return (
		<ResponsiveModal
			title="Upload a thumbnail"
			open={open}
			onOpenChange={onOpenChange}
		>
			<UploadDropzone
				endpoint="thumnnailUploader"
				input={{ videoId }}
				onClientUploadComplete={onUploadComplete}
			/>
		</ResponsiveModal>
	);
};
