"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Transition } from "framer-motion";
import { CheckCircleIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface PricingFeature {
  text: string;
  tooltip?: string;
}

export interface PricingPlan {
  name: string;
  info: string;
  price?: string;
  availability?: string;
  features: PricingFeature[];
  btn?: {
    text: string;
    href: string;
  };
  highlighted?: boolean;
  badge?: string;
}

interface PricingSectionProps extends React.ComponentProps<"div"> {
  plans: PricingPlan[];
  heading: string;
  description?: string;
  columnsClassName?: string;
}

export function PricingSection({
  plans,
  heading,
  description,
  columnsClassName,
  className,
  ...props
}: PricingSectionProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center space-y-6",
        className,
      )}
      {...props}
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white md:text-3xl lg:text-4xl">
          {heading}
        </h2>
        {description ? (
          <p className="text-center text-sm text-stone-600 dark:text-slate-300 md:text-base">
            {description}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3",
          columnsClassName,
        )}
      >
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </div>
  );
}

interface PricingCardProps extends React.ComponentProps<"div"> {
  plan: PricingPlan;
}

export function PricingCard({
  plan,
  className,
  ...props
}: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex w-full flex-col rounded-lg border bg-white dark:bg-slate-900",
        plan.highlighted
          ? "border-amber-300 bg-[linear-gradient(145deg,#fff7ed_0%,#fffdf8_35%,#ffffff_100%)] shadow-[0_28px_90px_-34px_rgba(217,119,6,0.42)] dark:bg-[linear-gradient(145deg,#2b1f0d_0%,#1f172a_45%,#111827_100%)]"
          : "border-stone-200 shadow-sm dark:border-slate-800",
        className,
      )}
      {...props}
    >
      {plan.highlighted ? (
        <BorderTrail
          className="bg-amber-300 [box-shadow:0px_0px_70px_34px_rgb(254_243_199_/_90%),0_0_120px_64px_rgb(245_158_11_/_22%),0_0_160px_90px_rgb(120_53_15_/_14%)]"
          size={100}
        />
      ) : null}

      <div
        className={cn(
          "bg-stone-50/70 rounded-t-lg border-b p-4 dark:border-slate-800 dark:bg-slate-800/80",
          plan.highlighted && "border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.98),rgba(255,247,237,0.9))] dark:border-amber-700/40 dark:bg-[linear-gradient(180deg,rgba(120,53,15,0.35),rgba(17,24,39,0.92))]",
        )}
      >
        <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
          {plan.highlighted ? (
            <p className="flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2 py-0.5 text-xs font-semibold text-amber-800">
              <StarIcon className="h-3 w-3 fill-current" />
              Platinum
            </p>
          ) : null}
          {plan.badge ? (
            <p className="rounded-md border border-stone-200 bg-white px-2 py-0.5 text-xs font-semibold text-stone-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              {plan.badge}
            </p>
          ) : null}
        </div>

        {plan.availability ? (
          <p className={cn("mb-3 text-xs font-black uppercase tracking-[0.18em]", plan.highlighted ? "text-amber-700 dark:text-amber-300" : "text-stone-500 dark:text-slate-400")}>
            {plan.availability}
          </p>
        ) : null}
        <div className={cn("text-lg font-medium text-stone-900 dark:text-white", plan.highlighted && "text-amber-950 dark:text-amber-100")}>
          {plan.name}
        </div>
        <p className="text-sm font-normal text-stone-500 dark:text-slate-300">
          {plan.info}
        </p>
        {plan.price ? (
          <h3 className="mt-3 flex items-end gap-1">
            <span className={cn("text-3xl font-bold text-stone-900 dark:text-white", plan.highlighted && "text-amber-900 dark:text-amber-100")}>{plan.price}</span>
          </h3>
        ) : null}
      </div>

      <div
        className={cn(
          "space-y-4 px-4 py-6 text-sm text-stone-600 dark:text-slate-300",
          plan.highlighted && "bg-[linear-gradient(180deg,rgba(255,251,235,0.65),rgba(255,255,255,0.9))] dark:bg-[linear-gradient(180deg,rgba(120,53,15,0.18),rgba(15,23,42,0.55))]",
        )}
      >
        {plan.features.map((feature, index) => (
          <div key={`${plan.name}-${index}`} className="flex items-center gap-2">
            <CheckCircleIcon className={cn("h-4 w-4 shrink-0 text-stone-900 dark:text-white", plan.highlighted && "text-amber-700 dark:text-amber-300")} />
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <p className={cn(feature.tooltip ? "cursor-help border-b border-dashed border-stone-400 dark:border-slate-500" : "")}>
                    {feature.text}
                  </p>
                </TooltipTrigger>
                {feature.tooltip ? (
                  <TooltipContent>
                    <p>{feature.tooltip}</p>
                  </TooltipContent>
                ) : null}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>

      {plan.btn ? (
        <div
          className={cn(
            "mt-auto w-full border-t p-3",
            plan.highlighted ? "border-amber-200 bg-[linear-gradient(180deg,rgba(255,247,237,0.85),rgba(255,255,255,0.95))] dark:border-amber-700/40 dark:bg-[linear-gradient(180deg,rgba(120,53,15,0.16),rgba(15,23,42,0.92))]" : "bg-white dark:border-slate-800 dark:bg-slate-900",
          )}
        >
          <Button
            className="w-full"
            variant={plan.highlighted ? "default" : "outline"}
            asChild
          >
            <Link href={plan.btn.href}>{plan.btn.text}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({
  className,
  size = 60,
  transition,
  delay,
  onAnimationComplete,
  style,
}: BorderTrailProps) {
  const BASE_TRANSITION: Transition = {
    repeat: Infinity,
    duration: 5,
    ease: "linear",
  };

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn(
          "absolute aspect-square",
          size === 100
            ? "w-[100px] [offset-path:rect(0_auto_auto_0_round_100px)]"
            : "w-[60px] [offset-path:rect(0_auto_auto_0_round_60px)]",
          className
        )}
        style={style}
        animate={{
          offsetDistance: ["0%", "100%"],
        }}
        transition={{
          ...(transition ?? BASE_TRANSITION),
          delay,
        }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
