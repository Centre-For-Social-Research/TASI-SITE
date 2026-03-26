"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MediaAccreditationSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/media-accreditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      let data = null;
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
        setStatus(data?.error || `Request failed (${response.status}).`);
      } else {
        setStatus("Application received. The TASI team will review your accreditation request.");
        setEmail("");
      }
    } catch (error) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
          ? error.message
          : "Network error while submitting your request. Please try again.";

      setStatus(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section
      id="media-accreditation"
      className="bg-[linear-gradient(135deg,#350265_0%,#5c0f4f_52%,#141c56_100%)] text-white"
    >
      <div className="mx-auto grid w-full max-w-7xl overflow-hidden lg:grid-cols-[1.04fr_1.06fr]">
        <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-10 lg:px-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">
            TASI 2026 Media
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white md:text-4xl">
            Media accreditation
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white md:text-[1.05rem] md:leading-[1.55]">
            Journalists, editors, and industry reporters covering digital trust, safety, public policy, and emerging
            technology are invited to apply for TASI 2026 media access.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/82 md:text-[15px]">
            Applications for accreditation are reviewed by the TASI team. Please make sure you apply with a valid
            business email address linked to your publication or newsroom.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/82 md:text-[15px]">
            Your personal data will be processed in line with our{" "}
            <a className="font-semibold underline underline-offset-4" href="/privacy-policy">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a className="font-semibold underline underline-offset-4" href="/terms-of-service">
              T&amp;Cs
            </a>
            .
          </p>

          <form className="mt-6 max-w-xl" onSubmit={handleSubmit}>
            <label
              htmlFor="media-business-email"
              className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-white"
            >
              Business email address *
            </label>
            <Input
              id="media-business-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              className="h-11 rounded-[10px] border-0 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-500 focus-visible:ring-2 focus-visible:ring-white"
              required
            />

            <div className="mt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-auto rounded-xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-stone-900 hover:bg-stone-100"
              >
                {isSubmitting ? "Submitting..." : "Apply for media accreditation"}
              </Button>
            </div>

            {status ? <p className="mt-3 text-sm leading-relaxed text-white/88">{status}</p> : null}
          </form>
        </div>

        <div className="relative min-h-[220px] lg:min-h-[40vh]">
          <Image
            src="/img/hero-bg-2.png"
            alt="TASI media placeholder"
            fill
            className="object-cover opacity-80"
            sizes="(min-width: 1024px) 55vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(53,2,101,0.18),rgba(20,28,86,0.08))]" />
        </div>
      </div>
    </section>
  );
}
