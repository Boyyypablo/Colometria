import type { Metadata } from "next";
import { Bodoni_Moda, Fraunces, DM_Sans } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

/** Wordmark luxury (estilo Safira / Didot) — só no nome da marca. */
const brand = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-brand",
  weight: ["400", "500", "600", "700"],
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Colorimetria — a cor certa revela quem você já é",
  description:
    "Consultoria em colorimetria e imagem: descubra sua cartela, recomendações e simulação visual.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${brand.variable} ${display.variable} ${sans.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
