import type { Metadata } from "next";
import { getForm, getForms, getSingleton } from "../../lib/content";
import { bcmsField } from "../../lib/bcms";
import { plain, richHtml, type Contact } from "../../lib/cms";
import { seo } from "../../lib/seo";
import { JsonLd } from "../../components/JsonLd";
import { ContactForm } from "../../components/Forms";

export function generateMetadata(): Metadata {
  const contact = getSingleton<Contact>("contact");
  return seo({ title: plain(contact?.heroTitle) || "Contact", metaDescription: plain(contact?.heroSubtitle) }).metadata;
}

export default function ContactPage() {
  const contact = getSingleton<Contact>("contact");
  const form = getForm("Contact");
  const { jsonLd } = seo({
    title: plain(contact?.heroTitle) || "Contact",
    metaDescription: plain(contact?.heroSubtitle),
    schema: { "@context": "https://schema.org", "@type": "ContactPage", name: plain(contact?.heroTitle) || "Contact" },
  });

  return (
    <main className="section container">
      <JsonLd data={jsonLd} />
      <div className="split">
        <div className="reveal">
          {contact?.eyebrow && <p className="eyebrow" {...bcmsField("eyebrow")} dangerouslySetInnerHTML={richHtml(contact.eyebrow)} />}
          <h1 {...bcmsField("heroTitle")} dangerouslySetInnerHTML={richHtml(contact?.heroTitle, "Get in touch")} />
          {contact?.heroSubtitle && <p className="lead" style={{ marginTop: "1.25rem" }} {...bcmsField("heroSubtitle")} dangerouslySetInnerHTML={richHtml(contact.heroSubtitle)} />}
        </div>
        <div className="form-card reveal">
          {form ? <ContactForm form={form} turnstileSiteKey={getForms().turnstileSiteKey} /> : <p className="lead">Add a form named “Contact” in BetterCMS to enable this form.</p>}
        </div>
      </div>
    </main>
  );
}
