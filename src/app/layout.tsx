import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";

import { TRPCProvider } from "@/trpc/client";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Youtube Clone",
	description:
		"Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on YouTube.",
	icons: {
		icon: "/logo.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<ClerkProvider afterSignOutUrl="/">
			<html lang="en">
				<body className={`${inter.className} antialiased`}>
					<TRPCProvider>
						<Toaster richColors />
						{children}
					</TRPCProvider>
				</body>
			</html>
		</ClerkProvider>
	);
}
