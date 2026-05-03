"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

const GOLD = "#C6A75E";

/**
 * LanguageSwitcher - botón flotante para cambiar idioma
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const newLocale = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: newLocale });
  };

  const displayText = locale === "es" ? "EN" : "ES";
  const ariaLabel = locale === "es" ? "Switch to English" : "Cambiar a Español";

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className="group fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-xl"
      style={{
        backgroundColor: GOLD,
        color: "white",
      }}
      aria-label={ariaLabel}
    >
      <Globe className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">{displayText}</span>
      <span className="sm:hidden">{displayText}</span>
    </button>
  );
}
