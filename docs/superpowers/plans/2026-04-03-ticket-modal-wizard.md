# Ticket Modal Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline festival ticket purchase panel with a 3-step modal wizard for details, review, and payment that follows the provided mockups and the repository's `10px` radius design rule.

**Architecture:** Keep the existing ticket selection cards on the page, but when a user clicks `Register now`, render a centered overlay modal driven by the existing ticket form state. Split payment initialization from Razorpay launch so the Payment step can show a loading and ready state before handing off to checkout.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, Node test runner, Razorpay checkout

---
