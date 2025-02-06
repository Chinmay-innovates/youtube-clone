import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
import { MainSection } from "./main-section";
import { Separator } from "@/components/ui/separator";
import { PersonalSection } from "./personal-section";

interface HomeSidebarProps {}

export const HomeSidebar = ({}: HomeSidebarProps) => {
	return (
		<Sidebar className="pt-16 z-40 border-none" collapsible="icon">
			<SidebarContent className="bg-background">
				<MainSection />
				<Separator />
				<PersonalSection />
			</SidebarContent>
		</Sidebar>
	);
};
