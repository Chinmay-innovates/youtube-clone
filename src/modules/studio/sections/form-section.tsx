"use client";

import { z } from "zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CopyCheckIcon,
	CopyIcon,
	Globe2Icon,
	ImagePlusIcon,
	Loader2Icon,
	LockIcon,
	MoreVerticalIcon,
	RotateCwIcon,
	SparklesIcon,
	TrashIcon,
} from "lucide-react";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { videoUpdateSchema } from "@/db/schema";
import { THUMBNAIL_FALLBACK } from "@/constants";
import { snakeCaseToTitleCase } from "@/lib/utils";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";

import { ThumbnailUploadModal } from "@/modules/studio/ui/components/thumbnail-upload-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface PageProps {
	videoId: string;
}
export const FormSection = ({ videoId }: PageProps) => {
	return (
		<Suspense fallback={<FormSectionSkeleton />}>
			<ErrorBoundary fallback={<p>Something went wrong</p>}>
				<FormSectionSuspense videoId={videoId} />
			</ErrorBoundary>
		</Suspense>
	);
};

const FormSectionSkeleton = () => {
	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div className="space-y-2">
					<Skeleton className="h-7 w-32" />
					<Skeleton className="h-4 w-40" />
				</div>
				<Skeleton className="h-9 w-24" />
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
				<div className="space-y-8 lg:col-span-3">
					<div className="space-y-2">
						<Skeleton className="h-5 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-24" />
						<Skeleton className="h-[220px] w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-[84px] w-[153px]" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-[104px] w-full" />
					</div>
				</div>
				<div className="flex flex-col gap-y-8 lg:col-span-2">
					<div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden">
						<Skeleton className="aspect-video" />
						<div className="p-4 space-y-6">
							<div className="space-y-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-5 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-4 w-24" />
								<Skeleton className="h-5 w-32" />
							</div>
						</div>
					</div>
					<div className="space-y-2">
						<Skeleton className="h-5 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
			</div>
		</div>
	);
};

const FormSectionSuspense = ({ videoId }: PageProps) => {
	const router = useRouter();
	const utils = trpc.useUtils();

	const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);

	const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
	const [categories] = trpc.categories.getMany.useSuspenseQuery();

	const update = trpc.videos.update.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
			toast.success("Video updated");
			router.push("/studio");
		},
		onError: () => {
			toast.error("Something went wrong");
		},
	});

	const remove = trpc.videos.remove.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			toast.success("Video deleted");
			router.push("/studio");
		},
		onError: () => {
			toast.error("Something went wrong");
		},
	});

	const restoreThumbnail = trpc.videos.restoreThumbnail.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
			toast.success("Thumbnail restored");
		},
		onError: () => {
			toast.error("Something went wrong");
		},
	});

	const generateThumbnail = trpc.videos.generateThumbnail.useMutation({
		onSuccess: () => {
			toast.success("Background job started", {
				description: "This may take a few minutes",
			});
		},
		onError: () => {
			toast.error("Something went wrong");
		},
	});

	const generateTitle = trpc.videos.generateTitle.useMutation({
		onSuccess: () => {
			toast.success("Background job started", {
				description: "This may take a few minutes",
			});
		},
		onError: () => {
			toast.error("Something went wrong");
		},
	});

	const generateDescription = trpc.videos.generateDescription.useMutation({
		onSuccess: () => {
			toast.success("Background job started", {
				description: "This may take a few minutes",
			});
		},
		onError: () => {
			toast.error("Something went wrong");
		},
	});

	const form = useForm<z.infer<typeof videoUpdateSchema>>({
		resolver: zodResolver(videoUpdateSchema),
		defaultValues: video,
	});

	const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
		await update.mutateAsync(data);
	};

	const fullURL = `${
		process.env.VERCEL_URL || "http://localhost:3000"
	}/videos/${videoId}`;

	const [isCopied, setIsCopied] = useState<boolean>(false);
	const onCopy = async () => {
		await navigator.clipboard.writeText(fullURL);
		setIsCopied(true);
		setTimeout(() => {
			setIsCopied(false);
		}, 2000);
	};

	return (
		<>
			<ThumbnailUploadModal
				videoId={videoId}
				open={thumbnailModalOpen}
				onOpenChange={setThumbnailModalOpen}
			/>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-2xl font-bold">Video details</h1>
							<p className="text-xs text-muted-foreground">
								Manage your video details
							</p>
						</div>
						<div className="flex items-center gap-x-2">
							<Button
								type="submit"
								disabled={
									update.isPending
									// || !form.formState.isDirty
								}
							>
								Save
							</Button>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant={"ghost"} size={"icon"}>
										<MoreVerticalIcon />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent align="end">
									<DropdownMenuItem
										onClick={() => remove.mutate({ id: videoId })}
									>
										<TrashIcon className="size-4 mr-2" />
										Delete
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						<div className="space-y-8 lg:col-span-2">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className="flex items-center gap-x-2">
												Title
												<Button
													size={"icon"}
													variant={"outline"}
													type="button"
													className="rounded-full size-6 [&_svg]:size-3"
													onClick={() => generateTitle.mutate({ id: video.id })}
													disabled={
														generateDescription.isPending || !video.muxTrackId
													}
												>
													{generateTitle.isPending ? (
														<Loader2Icon className="animate-spin" />
													) : (
														<SparklesIcon />
													)}
												</Button>
											</div>
										</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Add a title to your video"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											<div className="flex items-center gap-x-2">
												Description
												<Button
													size={"icon"}
													variant={"outline"}
													type="button"
													className="rounded-full size-6 [&_svg]:size-3"
													onClick={() =>
														generateDescription.mutate({ id: video.id })
													}
													disabled={
														generateDescription.isPending || !video.muxTrackId
													}
												>
													{generateDescription.isPending ? (
														<Loader2Icon className="animate-spin" />
													) : (
														<SparklesIcon />
													)}
												</Button>
											</div>
										</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												value={field.value ?? ""}
												rows={10}
												className="resize-none pr-10"
												placeholder="Add a description to your video"
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								name="thumbnailUrl"
								control={form.control}
								render={({ field }) => (
									<FormItem>
										<FormLabel>Thumbnail</FormLabel>
										<FormControl>
											<div
												className="p-0.5 border border-dashed border-neutral-400 
										relative h-[84px] w-[153px] group"
											>
												<Image
													fill
													src={video.thumbnailUrl || THUMBNAIL_FALLBACK}
													className="object-cover"
													alt="Thumbnail"
												/>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															type="button"
															size="icon"
															className="bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7"
														>
															<MoreVerticalIcon className="text-white" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="start" side="right">
														<DropdownMenuItem
															onClick={() => setThumbnailModalOpen(true)}
														>
															<ImagePlusIcon className="size-4 mr-1" />
															Change
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																generateThumbnail.mutate({ id: videoId })
															}
														>
															<SparklesIcon className="size-4 mr-1" />
															AI-generated
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																restoreThumbnail.mutate({ id: videoId })
															}
														>
															<RotateCwIcon className="size-4 mr-1" />
															Restore
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="categoryId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Category
											{/* AI GEN BTN */}
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value ?? undefined}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a category" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{categories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="flex flex-col gap-y-8 lg:col-span-2">
							<div className="flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden h-fit">
								<div className="aspect-video overflow-hidden relative">
									<VideoPlayer
										playbackId={video.muxPlaybackId}
										thumbnailUrl={video.thumbnailUrl}
									/>
								</div>
								<div className="p-4 flex flex-col gap-y-6">
									<div className="flex justify-between items-center gap-x-2">
										<div className="flex flex-col gap-y-1">
											<p className="text-xs text-muted-foreground">
												Video link
											</p>
											<div className="flex items-center gap-x-2">
												<Link href={`/videos/${video.id}`}>
													<p className="text-sm line-clamp-1 text-blue-500">
														{fullURL}
													</p>
												</Link>
												<Button
													type="button"
													variant="secondary"
													size="icon"
													onClick={onCopy}
													disabled={false}
												>
													{isCopied ? (
														<CopyCheckIcon color="#3B82F6" />
													) : (
														<CopyIcon />
													)}
												</Button>
											</div>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex flex-col gap-y-1">
											<p className="text-xs text-muted-foreground">
												Videos status
											</p>
											<p className="text-sm">
												{snakeCaseToTitleCase(video.muxStatus || "preparing")}
											</p>
										</div>
									</div>

									<div className="flex items-center justify-between">
										<div className="flex flex-col gap-y-1">
											<p className="text-xs text-muted-foreground">
												Subtitles status
											</p>
											<p className="text-sm">
												{snakeCaseToTitleCase(
													video.muxTrackStatus || "no_subtitles"
												)}
											</p>
										</div>
									</div>
								</div>
							</div>
							{/* VISIBILITY */}
							<FormField
								control={form.control}
								name="visibility"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Visibility
											{/* AI GEN BTN */}
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value ?? undefined}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select visibility" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="public">
													<div className="flex items-center">
														<LockIcon className=" size-4 mr-2" />
														Public
													</div>
												</SelectItem>
												<SelectItem value="private">
													<div className="flex items-center">
														<Globe2Icon className=" size-4 mr-2" />
														Private
													</div>
												</SelectItem>
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
				</form>
			</Form>
		</>
	);
};
