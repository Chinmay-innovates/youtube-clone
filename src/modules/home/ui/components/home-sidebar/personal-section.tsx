"use client";
import { useAuth, useClerk } from "@clerk/nextjs";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { HistoryIcon, ListVideoIcon, ThumbsUpIcon } from "lucide-react";
import Link from "next/link";

interface PersonalSectionProps {}

const items = [
	{
		title: "History",
		url: "/playlists/history",
		icon: HistoryIcon,
		auth: true,
	},
	{
		title: "Liked videos",
		url: "/playlist/liked",
		icon: ThumbsUpIcon,
		auth: true,
	},
	{
		title: "All playlist",
		url: "/feed/trending",
		icon: ListVideoIcon,
		auth: true,
	},
];
export const PersonalSection = ({}: PersonalSectionProps) => {
	const clerk = useClerk();
	const { isSignedIn } = useAuth();
	return (
		<SidebarGroup>
			<SidebarGroupLabel>YOU</SidebarGroupLabel>
			<SidebarGroupContent>
				<SidebarMenu>
					{items.map((item) => (
						<SidebarMenuItem key={item.title}>
							<SidebarMenuButton
								tooltip={item.title}
								asChild
								isActive={false}
								onClick={(e) => {
									if (!isSignedIn && item.auth) {
										e.preventDefault();
										return clerk.openSignIn();
									}
								}}
							>
								<Link href={item.url} className="flex items-center gap-4">
									<item.icon />
									<span className="text-sm">{item.title}</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					))}
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
};
