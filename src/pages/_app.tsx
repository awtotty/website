import { type AppType } from "next/app";
import { Inter, VT323, Playfair_Display } from "next/font/google";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <div className={`${inter.variable} ${vt323.variable} ${playfair.variable} dark`}>
      <Component {...pageProps} />
    </div>
  );
};

export default MyApp;
