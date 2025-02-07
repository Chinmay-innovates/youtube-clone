"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ClapperboardIcon, UserCircle } from "lucide-react";

export const AuthButton = () => {
	return (
		<>
			<SignedIn>
				<UserButton>
					<UserButton.MenuItems>
						{/* TODO: add user profile btn */}
						<UserButton.Link
							label="Studio"
							href="/studio"
							labelIcon={<ClapperboardIcon className="size-4" />}
						/>
						<UserButton.Action label="manageAccount" />
					</UserButton.MenuItems>
				</UserButton>
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<Button
						variant={"outline"}
						className="px-4 py-2 text-sm font-medium  text-blue-600 hover:text-blue-600 border-blue-500/2 rounded-full shadow-none"
					>
						<UserCircle />
						Sign in
					</Button>
				</SignInButton>
			</SignedOut>
		</>
	);
};
