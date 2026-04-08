"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps each page's content with a fade-in animation.
 * On route change, the component remounts (key={pathname}) and the
 * animation replays from the start.
 */
export default function PageTransition({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div key={pathname} className="gp-page-enter">
            {children}
        </div>
    );
}
