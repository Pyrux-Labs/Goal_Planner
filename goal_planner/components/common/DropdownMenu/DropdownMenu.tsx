import { HiDotsVertical } from "react-icons/hi";
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";

interface MenuItem {
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
}

interface DropdownMenuProps {
    items: MenuItem[];
    align?: "left" | "right";
}

export default function DropdownMenu({
    items,
    align = "right",
}: DropdownMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                }}
                className="flex items-center justify-center hover:opacity-70 transition-opacity text-white-pearl cursor-pointer text-xl"
            >
                <HiDotsVertical />
            </button>

            {/* Dropdown Menu */}
            <div
                className={clsx(
                    "absolute top-full mt-2 w-48 bg-deep-bg border border-input-bg rounded-lg z-50 transition-all duration-300",
                    align === "left" ? "left-0" : "right-0",
                    isMenuOpen
                        ? "opacity-100 translate-y-0 scale-100"
                        : "opacity-0 -translate-y-2 scale-95 pointer-events-none",
                )}
            >
                <div className="py-2">
                    {items.map((item, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                item.onClick();
                                setIsMenuOpen(false);
                            }}
                            className={clsx(
                                "w-full text-left px-4 py-2 hover:bg-orange-hover transition-all duration-200 font-text text-sm",
                                item.variant === "danger"
                                    ? "text-red-500"
                                    : "text-white-pearl",
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
