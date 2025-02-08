"use client";

import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorBoundary } from "react-error-boundary";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	CopyCheckIcon,
	CopyIcon,
	Globe2Icon,
	LockIcon,
	MoreVerticalIcon,
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
	return <p>loading...</p>;
};

const FormSectionSuspense = ({ videoId }: PageProps) => {
	const utils = trpc.useUtils();
	const [video] = trpc.studio.getOne.useSuspenseQuery({ id: videoId });
	const [categories] = trpc.categories.getMany.useSuspenseQuery();

	const update = trpc.videos.update.useMutation({
		onSuccess: () => {
			utils.studio.getMany.invalidate();
			utils.studio.getOne.invalidate({ id: videoId });
			toast.success("Video updated");
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
						<Button type="submit" disabled={update.isPending}>
							Save
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant={"ghost"} size={"icon"}>
									<MoreVerticalIcon />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>
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
										Title
										{/* AI GEN BTN */}
									</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Add a title to your video" />
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
										Description
										{/* AI GEN BTN */}
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
						{/* ADD THUMBNAIL FEILD */}
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
										<p className="text-xs text-muted-foreground">Video link</p>
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
					</div>
				</div>
			</form>
		</Form>
	);
};
