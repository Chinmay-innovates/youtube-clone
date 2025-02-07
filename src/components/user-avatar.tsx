import { cva, type VariantProps } from "class-variance-authority";
import { Avatar, AvatarImage } from "./ui/avatar";

const avatarVariant = cva("", {
	variants: {
		size: {
			default: "w-9 h-9",
			xs: "w-4 h-4",
			sm: "w-6 h-6",
			lg: "w-10 h-10",
			xl: "w-[160px] h-[160px]",
		},
	},
	defaultVariants: {
		size: "default",
	},
});

interface UserAvatarProps extends VariantProps<typeof avatarVariant> {
	avatarUrl: string;
	name: string;
	className?: string;
	onClick?: () => void;
}

export const UserAvatar = ({
	avatarUrl,
	name,
	className,
	onClick,
	size,
}: UserAvatarProps) => {
	return (
		<Avatar className={avatarVariant({ size, className })} onClick={onClick}>
			<AvatarImage src={avatarUrl} alt={name} />
		</Avatar>
	);
};
