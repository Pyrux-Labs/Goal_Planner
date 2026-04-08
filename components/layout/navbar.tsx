"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Home, Target, BarChart3, LogOut, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import icon from "@/public/icon.svg";
import { signOut } from "@/lib/services/auth-service";
import Modal from "@/components/ui/modal";
import { ROUTES } from "@/lib/constants/routes";
import UserAvatar from "./user-avatar";

const navItems = [
	{ path: ROUTES.CALENDAR, icon: Home, label: "Calendar" },
	{ path: ROUTES.GOALS, icon: Target, label: "Goals" },
	{ path: ROUTES.STATS, icon: BarChart3, label: "Stats" },
];

const profileMenuItems = [
	{ path: ROUTES.PROFILE, icon: User, label: "Profile" },
	{ path: ROUTES.SETTINGS, icon: Settings, label: "Settings" },
];

const Navbar = () => {
	const pathname = usePathname();
	const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const mobileMenuRef = useRef<HTMLElement>(null);

	// Close menu on click outside
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			if (
				menuRef.current &&
				!menuRef.current.contains(target) &&
				(!mobileMenuRef.current || !mobileMenuRef.current.contains(target))
			) {
				setIsProfileMenuOpen(false);
			}
		};
		if (isProfileMenuOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isProfileMenuOpen]);

	const handleLogout = useCallback(async () => {
		setIsLoggingOut(true);
		await signOut();
		setIsLogoutModalOpen(false);
		setIsLoggingOut(false);
		window.location.href = ROUTES.LANDING;
	}, []);

	return (
		<>
			{/* Desktop sidebar */}
			<aside className="w-14 lg:w-14 xl:w-16 2xl:w-20 h-screen bg-deep-bg border-r border-input-bg flex-shrink-0 fixed left-0 top-0 z-50 hidden md:block">
				<div className="flex flex-col items-center py-8 px-4 h-full">
					{/* Logo */}
					<div className="mb-10">
						<img src={icon.src} alt="Logo" className="w-10 h-10" />
					</div>

					{/* Navigation Icons */}
					<nav className="flex flex-col items-center gap-6 flex-1">
						{navItems.map((item) => {
							const isActive = pathname === item.path;
							const Icon = item.icon;

							return (
								<Link
									key={item.path}
									href={item.path}
									className="group relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-input-bg/50"
									aria-label={item.label}>
									<Icon
										className={`w-5 h-5 transition-colors ${
											isActive ? "text-vibrant-orange" : "text-white-pearl"
										}`}
										strokeWidth={2}
									/>
									{isActive && (
										<div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-vibrant-orange rounded-r-full" />
									)}
								</Link>
							);
						})}
					</nav>

					{/* Profile avatar at bottom */}
					<div className="relative" ref={menuRef}>
						<button
							onClick={() => setIsProfileMenuOpen((prev) => !prev)}
							className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:ring-2 hover:ring-vibrant-orange/50"
							aria-label="User menu">
							<UserAvatar />
						</button>

						{/* Desktop dropdown menu */}
						<div
							className={`absolute bottom-0 left-full ml-2 w-48 bg-deep-bg border border-input-bg rounded-lg z-50 transition-all duration-300 ${
								isProfileMenuOpen
									? "opacity-100 translate-x-0 scale-100"
									: "opacity-0 -translate-x-2 scale-95 pointer-events-none"
							}`}>
							<div className="py-2">
								{profileMenuItems.map((item) => {
									const Icon = item.icon;
									return (
										<Link
											key={item.path}
											href={item.path}
											onClick={() => setIsProfileMenuOpen(false)}
											className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-orange-hover transition-all duration-200 font-text text-sm text-white-pearl">
											<Icon className="w-4 h-4" />
											{item.label}
										</Link>
									);
								})}
								<button
									onClick={() => {
										setIsProfileMenuOpen(false);
										setIsLogoutModalOpen(true);
									}}
									className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-orange-hover transition-all duration-200 font-text text-sm text-red-500">
									<LogOut className="w-4 h-4" />
									Log Out
								</button>
							</div>
						</div>
					</div>
				</div>
			</aside>

			{/* Mobile bottom navigation */}
			<nav
				ref={mobileMenuRef}
				className="fixed bottom-0 left-0 right-0 z-50 bg-deep-bg border-t border-input-bg md:hidden">
				<div className="flex items-center justify-around h-16 px-2">
					{navItems.map((item) => {
						const isActive = pathname === item.path;
						const Icon = item.icon;

						return (
							<Link
								key={item.path}
								href={item.path}
								className="flex flex-col items-center justify-center gap-1 flex-1 py-2"
								aria-label={item.label}>
								<Icon
									className={`w-5 h-5 transition-colors ${
										isActive ? "text-vibrant-orange" : "text-white-pearl"
									}`}
									strokeWidth={2}
								/>
								<span
									className={`text-[10px] font-medium transition-colors ${
										isActive ? "text-vibrant-orange" : "text-white-pearl/70"
									}`}>
									{item.label}
								</span>
								{isActive && (
									<div className="absolute bottom-0 w-8 h-0.5 bg-vibrant-orange rounded-t-full" />
								)}
							</Link>
						);
					})}

					{/* Mobile profile button */}
					<button
						onClick={() => setIsProfileMenuOpen((prev) => !prev)}
						className="flex flex-col items-center justify-center gap-1 flex-1 py-2 relative"
						aria-label="Profile">
						<UserAvatar size="sm" />
						<span className="text-[10px] font-medium text-white-pearl/70">
							More
						</span>
					</button>
				</div>

				{/* Mobile profile dropdown (slides up) */}
				<div
					className={`absolute bottom-full left-0 right-0 bg-deep-bg border-t border-input-bg transition-all duration-300 ${
						isProfileMenuOpen
							? "opacity-100 translate-y-0"
							: "opacity-0 translate-y-4 pointer-events-none"
					}`}>
					<div className="py-2 px-4">
						{profileMenuItems.map((item) => {
							const Icon = item.icon;
							return (
								<Link
									key={item.path}
									href={item.path}
									onClick={() => setIsProfileMenuOpen(false)}
									className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-orange-hover transition-all duration-200 font-text text-sm text-white-pearl rounded-lg">
									<Icon className="w-4 h-4" />
									{item.label}
								</Link>
							);
						})}
						<button
							onClick={() => {
								setIsProfileMenuOpen(false);
								setIsLogoutModalOpen(true);
							}}
							className="flex items-center gap-3 w-full text-left px-4 py-3 hover:bg-orange-hover transition-all duration-200 font-text text-sm text-red-500 rounded-lg">
							<LogOut className="w-4 h-4" />
							Log Out
						</button>
					</div>
				</div>
			</nav>

			{/* Logout confirmation modal */}
			<Modal
				isOpen={isLogoutModalOpen}
				title="Log Out?"
				message="Are you sure you want to log out?"
				confirmText="Log Out"
				cancelText="Cancel"
				onConfirm={handleLogout}
				onCancel={() => setIsLogoutModalOpen(false)}
				onClose={() => setIsLogoutModalOpen(false)}
				isLoading={isLoggingOut}
				maxWidth="sm"
			/>
		</>
	);
};

export default Navbar;
