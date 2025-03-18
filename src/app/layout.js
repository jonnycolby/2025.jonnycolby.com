//
import Script from "next/script";
import { Mulish, Anybody } from "next/font/google";
//
import CONFIG_public from "../../config/public";
//
import "@/styles/globals.scss";
//
//

const font__Mulish = Mulish({
    weight: "variable",
    // axes: ["wdth", "slnt", "GRAD", "XTRA"], // 12 axes in full font -> https://fonts.google.com/specimen/Roboto+Flex/tester
    subsets: ["latin"],
    display: "swap", // ensures the custom font always shows.  default is 'optional'.
    variable: "--font_Mulish", // use 'var(--font_Mulish)' to use this font in CSS/SCSS
});

const font__Anybody = Anybody({
    weight: "variable",
    axes: ["wdth"],
    subsets: ["latin"],
    display: "swap", // ensures the custom font always shows.  default is 'optional'.
    variable: "--font_Anybody", // use 'var(--font_Anybody)' to use this font in CSS/SCSS
});

export const metadata = {
    title: CONFIG_public.head.title,
    description: CONFIG_public.head.description,
    openGraph: {
        title: CONFIG_public.head.title,
        image: "/img/og-image-full.png",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export const themeColor = `#080809`;

//
//

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            {CONFIG_public.ga_id ? (
                <>
                    <Script src={`https://www.googletagmanager.com/gtag/js?id=${CONFIG_public.ga_id}`} strategy="afterInteractive" />
                    <Script id="ga-script" strategy="afterInteractive">
                        {`
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${CONFIG_public.ga_id}');
                    `}
                    </Script>
                </>
            ) : null}
            <body className={`${font__Mulish.variable} ${font__Anybody.variable}`}>{children}</body>
        </html>
    );
}

// https://beta.nextjs.org/docs/api-reference/segment-config#revalidate
export const revalidate = false; // false (default) allows caching; 0 requires re-render on every load
// When {revalidate} is set in layout.js, it affects all child pages as well.
