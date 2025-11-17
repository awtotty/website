import { type AppType } from "next/app";
import { Inter, VT323, Playfair_Display } from "next/font/google";

import "~/styles/globals.css";
import { ThemeProvider } from "~/contexts/ThemeContext";

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
    <ThemeProvider>
      <div className={`${inter.variable} ${vt323.variable} ${playfair.variable} light`} style={{ colorScheme: 'light' }}>
        <Component {...pageProps} />
      </div>
    </ThemeProvider>
  );
};

export default MyApp;
