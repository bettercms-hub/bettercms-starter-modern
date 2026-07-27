"use client";

import { useState } from "react";
import Script from "next/script";
import {
  submitForm,
  shouldShowField,
  formInitialValues,
  type DeliveryForm,
  type DeliveryFormField,
  type FormValues,
} from "@bettercms-ai/sdk";

const API = process.env.NEXT_PUBLIC_BCMS_API_URL || "https://api.bettercms.ai";

declare global {
  interface Window {
    /** Present only once Turnstile's api.js has loaded — always call it optionally. */
    turnstile?: { reset: (widget?: string | HTMLElement) => void };
  }
}

/** Shared submit state + handler over the SDK's submitForm (throws BetterCMSError w/ .fieldErrors). */
function useSubmit(form: DeliveryForm) {
  const [values, setValues] = useState<FormValues>(() => formInitialValues(form));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const set = (key: string, value: string | boolean) => setValues((v) => ({ ...v, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrors({});
    // Turnstile injects a hidden `cf-turnstile-response` input into the form when the
    // widget renders. Read it off the DOM rather than tracking it in React state: the
    // widget is not a controlled input, and it also refreshes the token on its own
    // schedule, so the DOM is the only place the CURRENT token is guaranteed to be.
    // Undefined when no widget is present, which the SDK treats as "no CAPTCHA".
    const formEl = e.currentTarget as HTMLFormElement;
    const turnstileToken =
      formEl.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value || undefined;
    try {
      await submitForm({ formId: form.id, data: values, turnstileToken, baseUrl: API });
      setStatus("done");
      if (form.redirectUrl) window.location.assign(form.redirectUrl);
    } catch (err) {
      // Tokens are SINGLE-USE. Without this reset a recoverable error (a missing required
      // field) leaves a spent token in the form, so the user's corrected resubmit fails
      // the CAPTCHA instead — a form that looks permanently broken.
      window.turnstile?.reset();
      const fe = (err as { fieldErrors?: Record<string, string> }).fieldErrors;
      if (fe) setErrors(fe);
      setStatus("error");
    }
  }

  return { values, set, errors, status, submit };
}

function Field({ field, value, error, onChange }: {
  field: DeliveryFormField;
  value: string | boolean;
  error?: string;
  onChange: (v: string | boolean) => void;
}) {
  const id = `f-${field.key}`;
  const label = (
    <label htmlFor={id}>{field.label}{field.required && <span className="req"> *</span>}</label>
  );
  const common = { id, "aria-invalid": !!error, required: field.required } as const;

  if (field.type === "textarea") {
    return (
      <div className="field">
        {label}
        <textarea {...common} className="textarea" placeholder={field.placeholder} value={String(value)} onChange={(e) => onChange(e.target.value)} />
        {error && <span className="field-error">{error}</span>}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <div className="field">
        {label}
        <select {...common} className="select" value={String(value)} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        {error && <span className="field-error">{error}</span>}
      </div>
    );
  }
  if (field.type === "checkbox" || field.type === "consent") {
    return (
      <div className="field">
        <label htmlFor={id} style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <input {...common} type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
          <span>{field.label}{field.required && <span className="req"> *</span>}</span>
        </label>
        {error && <span className="field-error">{error}</span>}
      </div>
    );
  }
  return (
    <div className="field">
      {label}
      <input
        {...common}
        type={field.type === "hidden" ? "text" : field.type}
        className="input"
        placeholder={field.placeholder}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

/** Honeypot: a real-looking field hidden from humans; bots that fill it are flagged server-side. */
function Honeypot({ name, value, onChange }: { name: string; value: string | boolean; onChange: (v: string) => void }) {
  return (
    <div className="visually-hidden" aria-hidden>
      <input tabIndex={-1} autoComplete="off" name={name} value={String(value)} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

/**
 * Cloudflare Turnstile widget. Renders nothing without a site key, so a project with no
 * Turnstile configured is unaffected.
 *
 * These forms were honeypot-only: `turnstileSiteKey` was already read in lib/content.ts
 * but no widget was ever rendered and no token was ever sent, so enabling CAPTCHA on the
 * form in BetterCMS did nothing here.
 *
 * Must sit INSIDE the <form> — that is what makes Turnstile inject the hidden
 * `cf-turnstile-response` input that useSubmit reads. next/script with a stable `id`
 * dedupes the loader when both forms appear on one page (contact page + footer).
 */
function Turnstile({ siteKey }: { siteKey?: string | null }) {
  if (!siteKey) return null;
  return (
    <>
      <div className="cf-turnstile" data-sitekey={siteKey} />
      <Script id="cf-turnstile" src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
    </>
  );
}

export function ContactForm({ form, turnstileSiteKey }: { form: DeliveryForm; turnstileSiteKey?: string | null }) {
  const { values, set, errors, status, submit } = useSubmit(form);
  if (status === "done") {
    return <p className="form-status ok">{form.successMessage ?? "Thanks! We'll be in touch soon."}</p>;
  }
  const honeypot = form.honeypotField ?? null;
  return (
    <form className="form" onSubmit={submit} noValidate>
      {form.fields
        .filter((f) => f.key !== honeypot && shouldShowField(f, values))
        .map((f) => (
          <Field key={f.key} field={f} value={values[f.key] ?? ""} error={errors[f.key]} onChange={(v) => set(f.key, v)} />
        ))}
      {honeypot && <Honeypot name={honeypot} value={values[honeypot] ?? ""} onChange={(v) => set(honeypot, v)} />}
      <Turnstile siteKey={turnstileSiteKey} />
      {status === "error" && Object.keys(errors).length === 0 && (
        <p className="field-error">Something went wrong. Please try again.</p>
      )}
      <button className="btn btn--accent" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : (form.submitLabel ?? "Send")} <span className="arrow">→</span>
      </button>
    </form>
  );
}

export function NewsletterForm({ form, turnstileSiteKey }: { form: DeliveryForm; turnstileSiteKey?: string | null }) {
  const { values, set, status, submit } = useSubmit(form);
  const honeypot = form.honeypotField ?? null;
  const emailKey = form.fields.find((f) => f.type === "email")?.key ?? "email";
  if (status === "done") return <p className="form-status ok">{form.successMessage ?? "You're subscribed."}</p>;
  return (
    <form className="newsletter" onSubmit={submit} noValidate>
      <input
        className="input"
        type="email"
        required
        placeholder="you@company.com"
        aria-label="Email"
        value={String(values[emailKey] ?? "")}
        onChange={(e) => set(emailKey, e.target.value)}
      />
      {honeypot && <Honeypot name={honeypot} value={values[honeypot] ?? ""} onChange={(v) => set(honeypot, v)} />}
      <Turnstile siteKey={turnstileSiteKey} />
      <button className="btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "…" : (form.submitLabel ?? "Subscribe")}
      </button>
    </form>
  );
}
