"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Facebook,
  Instagram,
  Linkedin,
  Send,
  Twitter,
} from "lucide-react";

function Footerdemo() {
  const [newsletterEmail, setNewsletterEmail] = React.useState("");
  const [newsletterStatus, setNewsletterStatus] = React.useState("");
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = React.useState(false);
  const [messageEmail, setMessageEmail] = React.useState("");
  const [messageText, setMessageText] = React.useState("");
  const [messageStatus, setMessageStatus] = React.useState("");
  const [isMessageSubmitting, setIsMessageSubmitting] = React.useState(false);

  const normalizeEmailInput = React.useCallback((value: string) => value.trim().toLowerCase(), []);
  const normalizeMessageInput = React.useCallback((value: string) => value.replace(/\r\n?/g, "\n").trim(), []);

  async function handleNewsletterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNewsletterStatus("");
    setIsNewsletterSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizeEmailInput(newsletterEmail) }),
      });

      const data = await response.json();
      if (!response.ok) {
        setNewsletterStatus(data.error || "Subscription failed.");
      } else {
        setNewsletterStatus("Subscribed successfully.");
        setNewsletterEmail("");
      }
    } catch {
      setNewsletterStatus("Subscription failed.");
    } finally {
      setIsNewsletterSubmitting(false);
    }
  }

  async function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessageStatus("");
    setIsMessageSubmitting(true);

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmailInput(messageEmail),
          message: normalizeMessageInput(messageText),
        }),
      });

      let data: { error?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          data = { error: text };
        }
      }

      if (!response.ok) {
        setMessageStatus(data?.error || `Request failed (${response.status}).`);
      } else {
        setMessageStatus("Message sent.");
        setMessageEmail("");
        setMessageText("");
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
          ? (error as { message: string }).message
          : "Network error while sending message. Please try again.";

      setMessageStatus(errorMessage);
    } finally {
      setIsMessageSubmitting(false);
    }
  }

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto w-full max-w-screen-xl px-10 py-8">
        <div className="grid gap-x-10 gap-y-10 items-start md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <h3 className="mb-3 text-lg font-semibold">Stay Connected</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="relative" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="pr-12 backdrop-blur-sm"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                required
              />
              <Button
                type="submit"
                size="icon"
                disabled={isNewsletterSubmitting}
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            {newsletterStatus ? (
              <p className="mt-2 text-xs text-muted-foreground">{newsletterStatus}</p>
            ) : null}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <Link href="/" className="block transition-colors hover:text-primary">
                Home
              </Link>
              <Link href="/about" className="block transition-colors hover:text-primary">
                About Us
              </Link>
              <Link href="/themes" className="block transition-colors hover:text-primary">
                Themes
              </Link>
              <Link href="/speakers" className="block transition-colors hover:text-primary">
                Speakers
              </Link>
              <Link href="/contact" className="block transition-colors hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Message</h3>
            <form className="rounded-md border border-border/70 p-3" onSubmit={handleMessageSubmit}>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  className="h-8 text-xs"
                  value={messageEmail}
                  onChange={(event) => setMessageEmail(event.target.value)}
                  required
                />
                <textarea
                  placeholder="Message"
                  className="min-h-[68px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  minLength={10}
                  required
                />
                <Button type="submit" size="sm" className="h-8 w-full text-xs" disabled={isMessageSubmitting}>
                  {isMessageSubmitting ? "Sending..." : "Send"}
                </Button>
              </div>
            </form>
            {messageStatus ? <p className="mt-2 text-xs text-muted-foreground">{messageStatus}</p> : null}
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>Centre for Social Research</p>
              <p>New Delhi, India</p>
              <p>Email: info1@csrindia.org</p>
            </address>
            <div className="mt-5 space-y-2 text-sm">
              <a
                href="https://www.linkedin.com/company/tasifestival/?viewAsMember=true"
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-primary"
              >
                LinkedIn (TASI)
              </a>
              <a
                href="https://www.linkedin.com/showcase/trust-safety/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-primary"
              >
                LinkedIn (Trust and Safety Festival)
              </a>
            </div>
          </div>
          <div className="relative">
            <h3 className="mb-4 text-lg font-semibold">Follow CSR</h3>
            <div className="mb-4 flex flex-wrap gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <a
                      href="https://www.facebook.com/csrindia.org"
                      target="_blank"
                      rel="noreferrer"
                    >
                        <Facebook className="h-4 w-4" />
                        <span className="sr-only">Facebook</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <a href="https://x.com/CSR_India" target="_blank" rel="noreferrer">
                        <Twitter className="h-4 w-4" />
                        <span className="sr-only">Twitter</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow on X</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <a
                      href="https://www.instagram.com/csr_india/"
                      target="_blank"
                      rel="noreferrer"
                    >
                        <Instagram className="h-4 w-4" />
                        <span className="sr-only">Instagram</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      asChild
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                    >
                      <a
                      href="https://www.linkedin.com/company/centre-for-social-research-india/?viewAsMember=trueL"
                      target="_blank"
                      rel="noreferrer"
                    >
                        <Linkedin className="h-4 w-4" />
                        <span className="sr-only">LinkedIn</span>
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t pt-5 text-center md:flex-row">
          <p className="text-sm text-muted-foreground">
            Copyright 2026 Centre for Social Research. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link href="/privacy-policy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <Link href="/cookie-settings" className="transition-colors hover:text-primary">
              Cookie Settings
            </Link>
            <Link href="/sitemap.xml" className="transition-colors hover:text-primary">
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };