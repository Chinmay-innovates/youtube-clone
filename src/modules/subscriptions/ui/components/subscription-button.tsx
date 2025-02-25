import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubscriptionButtonProps {
	onClick: ButtonProps["onClick"];
	size?: ButtonProps["size"];
	isSubscribed: boolean;
	className?: string;
	disabled: boolean;
}

export const SubscriptionButton = ({
	disabled,
	isSubscribed,
	onClick,
	className,
	size,
}: SubscriptionButtonProps) => {
	return (
		<Button
			size={size}
			variant={isSubscribed ? "secondary" : "default"}
			className={cn("rounded-full", className)}
			disabled={disabled}
			onClick={onClick}
		>
			{isSubscribed ? "Unsubscribe" : "Subscribe"}
		</Button>
	);
};
