"use client";

import { usePathname } from "next/navigation";

/**
 * Envuelve el contenido de cada página con una animación de fade-in.
 * Al cambiar de ruta, el componente se remonta (key={pathname}) y la
 * animación se reproduce desde el inicio.
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
