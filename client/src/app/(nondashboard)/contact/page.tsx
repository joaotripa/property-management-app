import type { Metadata } from "next";
import ContactFormClient from "./ContactFormClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have questions about Domari? Get in touch with our team for support, feedback, or inquiries about property finance management.",
  alternates: {
    canonical: "https://domari.app/contact",
  },
  openGraph: {
    title: "Contact Us | Domari",
    description:
      "Have questions about Domari? Get in touch with our team for support, feedback, or inquiries.",
    url: "https://domari.app/contact",
    type: "website",
  },
};

const ContactPage = () => {
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Domari",
    description:
      "Contact page for Domari property finance management platform",
    url: "https://domari.app/contact",
    mainEntity: {
      "@type": "Organization",
      name: "Domari",
      email: "support@domari.app",
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@domari.app",
        contactType: "customer service",
        availableLanguage: ["English"],
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactPageSchema),
        }}
      />
      <div className="bg-background flex flex-col">
        <main className="flex-grow py-16">
          <section className="max-w-2xl mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Contact Us
              </h1>
              <p className="text-lg text-muted-foreground">
                Have questions about Domari? We&apos;d love to hear from you.
                Send us a message and we&apos;ll respond as soon as possible.
              </p>
            </div>

            <div className="bg-card rounded-3xl shadow-xl border border-border p-6 md:p-10">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                Send us a Message
              </h2>
              <ContactFormClient />
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default ContactPage;
