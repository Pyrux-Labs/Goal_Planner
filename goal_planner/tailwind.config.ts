import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "vibrant-orange": "hsl(20, 95%, 44%)", // #D94E06
                "input-bg": "hsl(13, 23%, 19%)", // #3D2B26
                "modal-bg": "hsl(14, 42%, 10%)", // #25140F
                "modal-bg-hover": "hsl(14, 42%, 15%)", // #2A1A12 - 50% más claro que modal-bg
                "deep-bg": "hsl(14, 68%, 6%)", // #1A0A05
                "landing-bg": "hsl(0, 0%, 2%)", // #050505
                "lading-modal-bg": "hsl(0, 0%, 0%)", // #000000
                "white-pearl": "hsl(46, 46%, 89%)", // #F0EAD6
                "sea-green": "hsl(146, 50%, 36%)", // #2EBB57
                "royal-blue": "hsl(217, 76%, 50%)", // #1F6AE1
                "progress-empty": "hsl(240, 4%, 16%)", // #27272A
                "input-text": "hsl(215, 20%, 65%)", // #94A3B8
                carmin: "hsl(6, 63%, 46%)", // #C0392B
                "line-gray": "hsl(0, 0%, 20%)", // #333333
                "orange-hover": "rgba(255, 85, 0, 0.08)", // Menu item hover state
            },
            fontFamily: {
                title: ["Montserrat", "sans-serif"],
                text: ["Manrope", "sans-serif"],
            },
        },
    },
    plugins: [],
};

export default config;
