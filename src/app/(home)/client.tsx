"use client";

import { trpc } from "@/trpc/client";

type Props = {
	// define your props here
};

export const PageClient = ({}: Props) => {
	const [data] = trpc.hello.useSuspenseQuery({ text: "world" });
	return <div>PageClient : {data.greeting}</div>;
};
