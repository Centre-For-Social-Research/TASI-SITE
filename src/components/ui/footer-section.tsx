'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Facebook, Instagram, Linkedin, Send, Twitter } from 'lucide-react';

function AdminLoginButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        router.push('/sign-in?redirect_url=/admin/registrations');
      }}
      className="w-full rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-[#140f26] transition hover:bg-white/90 dark:bg-white dark:text-[#140f26] dark:hover:bg-white/90"
    >
      Log In
    </button>
  );
}

function Footerdemo() {
  const [newsletterEmail, setNewsletterEmail] = React.useState('');
  const [newsletterStatus, setNewsletterStatus] = React.useState('');
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] =
    React.useState(false);
  const [messageEmail, setMessageEmail] = React.useState('');
  const [messageText, setMessageText] = React.useState('');
  const [messageStatus, setMessageStatus] = React.useState('');
  const [isMessageSubmitting, setIsMessageSubmitting] = React.useState(false);

  const normalizeEmailInput = React.useCallback(
    (value: string) => value.trim().toLowerCase(),
    []
  );
  const normalizeMessageInput = React.useCallback(
    (value: string) => value.replace(/\r\n?/g, '\n').trim(),
    []
  );

  async function handleNewsletterSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setNewsletterStatus('');
    setIsNewsletterSubmitting(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizeEmailInput(newsletterEmail) }),
      });

      const data = await response.json();
      if (!response.ok) {
        setNewsletterStatus(data.error || 'Subscription failed.');
      } else {
        setNewsletterStatus('Subscribed successfully.');
        setNewsletterEmail('');
      }
    } catch {
      setNewsletterStatus('Subscription failed.');
    } finally {
      setIsNewsletterSubmitting(false);
    }
  }

  async function handleMessageSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessageStatus('');
    setIsMessageSubmitting(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizeEmailInput(messageEmail),
          message: normalizeMessageInput(messageText),
        }),
      });

      let data: { error?: string } | null = null;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
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
        setMessageStatus('Message sent.');
        setMessageEmail('');
        setMessageText('');
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
          ? (error as { message: string }).message
          : 'Network error while sending message. Please try again.';

      setMessageStatus(errorMessage);
    } finally {
      setIsMessageSubmitting(false);
    }
  }

  return (
    <footer className="relative overflow-hidden border-t border-t-8 border-[#ff6900] bg-[linear-gradient(120deg,#55089e_-7.06%,#9f0099_16.19%,#ff0080_39.45%,#ef5700_85.96%,#ffff00_109.21%)] text-white transition-colors duration-300 dark:border-t-[#ffd919]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,20,0.28)_0%,rgba(8,8,18,0.58)_65%,rgba(5,5,12,0.82)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.42)_0%,rgba(2,6,23,0.74)_58%,rgba(2,6,23,0.92)_100%)]" />
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full mix-blend-luminosity bg-[url(data:image/png;base64,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)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(85,8,158,0)_-7.06%,rgba(159,0,153,0)_16.19%,rgba(255,0,188,0)_39.45%,rgba(239,87,0,0.25)_85.96%,rgba(255,255,0,0.85)_109.21%)]" />
      <div className="pointer-events-none absolute -top-20 left-[-8%] h-64 w-64 rounded-full bg-[#5547ec]/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 right-[-8%] h-72 w-72 rounded-full bg-[#ff2bbf]/35 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-screen-xl px-10 py-8">
        <div className="grid gap-x-10 gap-y-10 items-start md:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <h3 className="mb-3 text-lg font-semibold">Stay Connected</h3>
            <p className="mb-4 text-sm text-white/85">
              Join our newsletter for the latest updates and exclusive offers.
            </p>
            <form className="relative" onSubmit={handleNewsletterSubmit}>
              <Input
                type="email"
                placeholder="Enter your email"
                className="border-white/35 bg-black/20 pr-12 text-white placeholder:text-white/90 backdrop-blur-sm focus-visible:ring-white/85 dark:border-white/45 dark:bg-black/35 dark:text-white dark:placeholder:text-white/90 dark:focus-visible:ring-white dark:focus-visible:ring-offset-transparent"
                value={newsletterEmail}
                onChange={(event) => setNewsletterEmail(event.target.value)}
                required
              />
              <Button
                type="submit"
                size="icon"
                disabled={isNewsletterSubmitting}
                className="absolute right-1 top-1 h-8 w-8 rounded-full !bg-white !text-[#140f26] transition-transform hover:scale-105 hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26] dark:hover:!bg-white/90"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="mt-3">
              <ThemeToggle />
            </div>
            {newsletterStatus ? (
              <p className="mt-2 text-xs text-white/80">{newsletterStatus}</p>
            ) : null}
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <nav className="space-y-2 text-sm text-white/90">
              <Link
                href="/about"
                className="block transition-colors hover:text-white"
              >
                About Us
              </Link>
              <Link
                href="/programme"
                className="block transition-colors hover:text-white"
              >
                Program
              </Link>
              <Link
                href="/speakers"
                className="block transition-colors hover:text-white"
              >
                Speakers
              </Link>
              <Link
                href="/tasi-2025"
                className="block transition-colors hover:text-white"
              >
                TASI Editions
              </Link>
              <Link
                href="/sponsor"
                className="block transition-colors hover:text-white"
              >
                Sponsors
              </Link>
              <Link
                href="/contact"
                className="block transition-colors hover:text-white"
              >
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Message</h3>
            <form
              className="rounded-md border border-white/30 bg-black/20 p-3 backdrop-blur-sm dark:border-white/35 dark:bg-black/30"
              onSubmit={handleMessageSubmit}
            >
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  className="h-8 border-white/35 bg-black/20 text-xs text-white placeholder:text-white/90 dark:border-white/45 dark:bg-black/35 dark:text-white dark:placeholder:text-white/90"
                  value={messageEmail}
                  onChange={(event) => setMessageEmail(event.target.value)}
                  required
                />
                <textarea
                  placeholder="Message"
                  className="min-h-[68px] w-full rounded-md border border-white/35 bg-black/20 px-2 py-1.5 text-xs text-white outline-none placeholder:text-white/90 focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent dark:border-white/45 dark:bg-black/35 dark:text-white dark:placeholder:text-white/90"
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  minLength={10}
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-8 w-full !bg-white !text-[#140f26] text-xs hover:!bg-white/90 dark:!bg-white dark:!text-[#140f26] dark:hover:!bg-white/90"
                  disabled={isMessageSubmitting}
                >
                  {isMessageSubmitting ? 'Sending...' : 'Send'}
                </Button>
              </div>
            </form>
            {messageStatus ? (
              <p className="mt-2 text-xs text-white/80">{messageStatus}</p>
            ) : null}
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <address className="space-y-2 text-sm text-white/90 not-italic">
              <p>Centre for Social Research</p>
              <p>New Delhi, India</p>
              <p>Email: info1@csrindia.org</p>
            </address>
            <div className="mt-5 space-y-2 text-sm text-white/90">
              <a
                href="https://www.linkedin.com/company/tasifestival/?viewAsMember=true"
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-white"
              >
                LinkedIn (TASI)
              </a>
              <a
                href="https://www.linkedin.com/showcase/trust-safety/posts/?feedView=all"
                target="_blank"
                rel="noreferrer"
                className="block transition-colors hover:text-white"
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
                      className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
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
                      className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
                    >
                      <a
                        href="https://x.com/CSR_India"
                        target="_blank"
                        rel="noreferrer"
                      >
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
                      className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
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
                      className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20"
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
            <div className="mb-4 w-full max-w-[196px] rounded-[10px] border border-white/30 bg-black/20 p-3 backdrop-blur-sm dark:border-white/35 dark:bg-black/30">
              <p className="mb-3 text-sm text-white/85">Admin Access</p>
              <div className="flex flex-col gap-2">
                <AdminLoginButton />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/25 pt-5 text-center md:flex-row">
          <p className="text-sm text-white/80">
            Copyright 2026 Centre for Social Research. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm text-white/90">
            <Link
              href="/privacy-policy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="transition-colors hover:text-white"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookie-settings"
              className="transition-colors hover:text-white"
            >
              Cookie Settings
            </Link>
            <Link
              href="/sitemap.xml"
              className="transition-colors hover:text-white"
            >
              Sitemap
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footerdemo };
