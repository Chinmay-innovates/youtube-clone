"use client";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { UserCircle } from "lucide-react";

interface AuthButtonProps {}

export const AuthButton = ({}: AuthButtonProps) => {
	return (
		<>
			<SignedIn>
				<UserButton />
				{/* ADD MMENU ITEMS FOR STUDIO AND PROFILE */}
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
