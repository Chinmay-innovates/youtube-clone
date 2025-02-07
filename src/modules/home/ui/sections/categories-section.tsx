"use client";

import { Suspense } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";

import { FilterCarousel } from "@/components/filter-carousel";

interface CategoriesSectionProps {
	categoryId?: string;
}

export const CategoriesSection = ({ categoryId }: CategoriesSectionProps) => {
	return (
		<Suspense fallback={<CategoriesSkeleton />}>
			<ErrorBoundary fallback={<p>Something went wrong</p>}>
				<CategoriesSectionSuspense categoryId={categoryId} />
			</ErrorBoundary>
		</Suspense>
	);
};
const CategoriesSkeleton = () => (
	<FilterCarousel isLoading data={[]} onSelectAction={() => {}} />
);
const CategoriesSectionSuspense = ({ categoryId }: CategoriesSectionProps) => {
	const router = useRouter();
	const [categories] = trpc.categories.getMany.useSuspenseQuery();
	const data = categories.map((c) => ({
		label: c.name,
		value: c.id,
	}));

	const onSelectAction = (value: string | null) => {
		const url = new URL(window.location.href);

		if (value) url.searchParams.set("categoryId", value);
		else url.searchParams.delete("categoryId");

		router.push(url.toString());
	};
	return (
		<FilterCarousel
			data={data}
			value={categoryId}
			onSelectAction={onSelectAction}
		/>
	);
};
