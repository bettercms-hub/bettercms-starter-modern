import { BcmsButton } from "@bettercms-ai/next";
import type { ButtonValue } from "../lib/cms";
import { Magnetic } from "./Magnetic";

/**
 * One call to action: a `button` field rendered with <BcmsButton>, so the BetterCMS editor finds it
 * as one button (label, link and look). Its look is styled by `data-variant` / `data-size`
 * (globals.css). A server component: the SDK's root export also carries server-only helpers.
 */
export function CtaButton({ path, value }: { path: string; value: ButtonValue | null }) {
  if (!value) return null;
  return (
    <Magnetic>
      <BcmsButton path={path} value={value} className="btn" />
    </Magnetic>
  );
}
