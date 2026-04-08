"use client";
import { useUser } from "@/contexts/user-context";

export default function UserAvatar({ size = "md" }: { size?: "sm" | "md" }) {
	const { user } = useUser();

	const sizeClasses = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";

	const avatarUrl = user?.profile_picture || null;

	const initials = (() => {
		const name = user?.fullname || user?.email || "U";
		const parts = name.split(" ").filter(Boolean);
		if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		if (parts.length === 1) return parts[0][0].toUpperCase();
		return "U";
	})();

	if (avatarUrl) {
		return (
			<img
				src={avatarUrl}
				alt="Profile"
				className={`${sizeClasses} rounded-full object-cover border-2 border-vibrant-orange`}
			/>
		);
	}

	return (
		<div
			className={`${sizeClasses} rounded-full bg-vibrant-orange flex items-center justify-center text-white-pearl font-semibold`}>
			{initials}
		</div>
	);
}
