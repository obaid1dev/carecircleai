import * as React from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FaqItemData {
  question: string;
  answer: string;
}

interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  items: FaqItemData[];
  contactInfo?: {
    title: string;
    description: string;
    buttonText: string;
  };
}

export function FaqSection({
  className,
  title,
  description,
  items,
  contactInfo,
  ...props
}: FaqSectionProps) {
  return (
    <section
      id="faq"
      className={cn(
        "w-full bg-gradient-to-b from-transparent via-muted/50 to-transparent py-16 md:py-20",
        className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-3 text-muted-foreground">{description}</p>}
        </motion.div>

        <div className="mx-auto max-w-2xl space-y-2">
          {items.map((item, index) => (
            <FaqItem key={item.question} {...item} index={index} />
          ))}
        </div>

        {contactInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mx-auto mt-12 max-w-md rounded-2xl p-6 text-center"
          >
            <span className="gradient-primary text-primary-foreground shadow-emerald-900/20 mb-4 inline-flex items-center justify-center rounded-full p-2.5 shadow-lg">
              <Mail className="h-4 w-4" />
            </span>
            <p className="font-heading mb-1 font-semibold">{contactInfo.title}</p>
            <p className="mb-4 text-sm text-muted-foreground">{contactInfo.description}</p>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/contact">{contactInfo.buttonText}</Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function FaqItem({
  question,
  answer,
  index,
}: FaqItemData & {
  index: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.06, 0.3) }}
      className={cn(
        "rounded-xl border border-border bg-card transition-all duration-200",
        isOpen ? "shadow-soft" : "hover:bg-muted/40",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
      >
        <h3
          className={cn(
            "text-base font-semibold transition-colors duration-200",
            isOpen ? "text-primary" : "text-foreground/80",
          )}
        >
          {question}
        </h3>
        <motion.span
          animate={{
            rotate: isOpen ? 180 : 0,
          }}
          transition={{ duration: 0.2 }}
          className={cn(
            "shrink-0 rounded-full p-1 transition-colors duration-200",
            isOpen ? "bg-accent text-accent-foreground" : "text-muted-foreground",
          )}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.22, ease: "easeOut" },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.18, ease: "easeIn" },
            }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 leading-relaxed text-muted-foreground">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
