import { HydrateClient } from "@/trpc/server";
import { PageClient } from "./client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const HomePage = async () => {
	return (
		<HydrateClient>
			<Suspense fallback={<p>Loading...</p>}>
				<ErrorBoundary fallback={<p>Something went wrong.</p>} />
				<PageClient />
			</Suspense>
		</HydrateClient>
	);
};

export default HomePage;
