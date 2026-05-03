import type { Metadata } from "next";
import { Playfair_Display, Inter, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { HotelProvider } from "@/lib/HotelContext";
import "../globals.css";

/**
 * Playfair Display — tipografía serif para títulos y encabezados.
 * Aporta elegancia y sensación de hotel premium.
 */
const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Inter — tipografía sans-serif para cuerpo de texto.
 * Legible, moderna y neutral: ideal para interfaces funcionales.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Geist Mono — fuente monoespaciada para código o valores técnicos.
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hotel Santa María",
  description: "Plataforma hotelera con asistente de inteligencia artificial",
};

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${playfairDisplay.variable} ${inter.variable} ${geistMono.variable}`}
      >
        <NextIntlClientProvider messages={messages}>
          <HotelProvider>
            {children}
            <LanguageSwitcher />
          </HotelProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
