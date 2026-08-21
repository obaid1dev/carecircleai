import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/theme-provider";
import { type ReactNode } from "react";

function PublicFooter() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <img src="/logo.png" alt="CareCircle" className="w-5 h-5" />
              </div>
              <span className="font-semibold text-xl">CareCircle</span>
            </div>
            <p className="text-muted-foreground text-base max-w-xs leading-relaxed">
              Gentle daily check-ins for aging loved ones. Peace of mind for the whole family.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="/#daily-checkin" className="hover:text-foreground transition-colors">
                    Daily Check-in
                  </a>
                </li>
                <li>
                  <a href="/#medication-tracking" className="hover:text-foreground transition-colors">
                    Medication Tracking
                  </a>
                </li>
                <li>
                  <a href="/#family-dashboard" className="hover:text-foreground transition-colors">
                    Family Dashboard
                  </a>
                </li>
                <li>
                  <a href="/#smart-alerts" className="hover:text-foreground transition-colors">
                    Smart Alerts
                  </a>
                </li>
                <li>
                  <a href="/#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="hover:text-foreground transition-colors">
                  Refund &amp; Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} CareCircle. Not a medical device. Always consult a
              healthcare professional.
            </p>
          </div>
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
      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between w-full">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <img src="/logo.png" alt="CareCircle" className="w-6 h-6 shrink-0" />
          <span className="hidden sm:inline">CareCircle</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="transition-colors shrink-0"
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
      </header>

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-12 md:py-20">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-lg mb-8">{description}</p>
          )}
          {children}
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
