"use client";
import { Home, Target, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import icon from "@/public/icon.svg";
import { usePathname } from "next/navigation";

const navItems = [
    { path: "/calendar", icon: Home, label: "Calendar" },
    { path: "/anual-goals", icon: Target, label: "Goals" },
    { path: "/stats", icon: BarChart3, label: "Stats" },
    { path: "/settings", icon: Settings, label: "Settings" },
];

const Navbar = () => {
    const pathname = usePathname();
    return (
        <aside className="w-20 lg:w-14 xl:w-16 2xl:w-20 h-screen bg-deep-bg border-r border-input-bg flex-shrink-0 fixed left-0 top-0 z-50 hidden sm:block">
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
                                aria-label={item.label}
                            >
                                <Icon
                                    className={`w-5 h-5 transition-colors ${
                                        isActive
                                            ? "text-vibrant-orange"
                                            : "text-white-pearl"
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
            </div>
        </aside>
    );
};

export default Navbar;
