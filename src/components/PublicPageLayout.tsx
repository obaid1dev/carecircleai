import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { type ReactNode } from "react";

type FooterLink = { label: string; href?: string; to?: string };

const footerColumns: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Daily Check-in", href: "/#daily-checkin" },
      { label: "Medication Tracking", href: "/#medication-tracking" },
      { label: "Family Dashboard", href: "/#family-dashboard" },
      { label: "Smart Alerts", href: "/#smart-alerts" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Refund & Cancellation Policy", to: "/refunds" },
    ],
  },
];

function PublicFooter() {
  return (
    <footer className="bg-card/50 border-t border-border backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-emerald-900/20">
                <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
              </div>
              <span className="font-heading font-semibold text-xl tracking-tight">CareCircle</span>
            </div>
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
              Gentle daily check-ins for aging loved ones. Peace of mind for the whole family.
            </p>
          </div>
          {footerColumns.map((col) => (
            <nav key={col.heading} aria-label={col.heading}>
              <h4 className="font-semibold mb-4">{col.heading}</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link
                        to={link.to}
                        className="hover:text-foreground transition-colors duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="hover:text-foreground transition-colors duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} CareCircle. Not a medical device. Always consult a
            healthcare professional.
          </p>
        </div>
      </div>
    </footer>
  );
}

export function PublicPageLayout({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description?: string;
}) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lift"
      >
        Skip to main content
      </a>
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between w-full">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading font-semibold text-lg tracking-tight rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img src="/logo.png" alt="CareCircle" className="h-8 w-8" />
            <span className="hidden sm:inline">CareCircle</span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="shrink-0 rounded-full"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            <Button asChild variant="ghost" className="px-3 sm:px-4">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild className="px-3 sm:px-4">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 md:py-20">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-balance">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-[65ch]">
              {description}
            </p>
          )}
          {children}
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
