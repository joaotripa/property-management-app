import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const FAQ = () => {
  const faqs = [
    {
      question: "How does the 14-day free trial work?",
      answer:
        "You can start using Domari immediately with full access to all features. No credit card required. After 14 days, you can choose to continue with a paid plan or downgrade to our free tier.",
    },
    {
      question: "Can I switch between plans at any time?",
      answer:
        "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments on your next invoice.",
    },
    {
      question: "What happens if I exceed my property limit?",
      answer:
        "We'll notify you when you're approaching your limit. You can easily upgrade to the next tier to accommodate more properties, or remove unused properties from your account.",
    },
    {
      question: "Is my financial data secure?",
      answer:
        "Absolutely. We use bank-level encryption (AES-256) and follow SOC 2 compliance standards. Your data is stored securely and never shared with third parties without your explicit consent.",
    },
    {
      question: "Can I import data from other property management tools?",
      answer:
        "Yes! We support imports from Excel/CSV files and have direct integrations with popular property management platforms. Our team can also help with custom data migrations.",
    },
    {
      question: "Do you offer customer support?",
      answer:
        "Yes! All plans include email support. Standard and Pro plans get priority support, and Pro users have access to a dedicated account manager and 24/7 phone support.",
    },
    {
      question: "Can I use Domari on mobile devices?",
      answer:
        "Definitely! Domari is fully responsive and works great on all devices. We also have native mobile apps for iOS and Android with offline capabilities.",
    },
    {
      question: "What integrations do you support?",
      answer:
        "We integrate with popular accounting software (QuickBooks, Xero), payment processors (Stripe, PayPal), and banking institutions. Pro users get access to our API for custom integrations.",
    },
  ];

  return (
    <section id="faq" className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg">
            Find clear answers to the questions owners, landlords and property
            managers ask most.
          </p>
        </div>

        <Accordion type="single" collapsible className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-primary-light/20 border border-border rounded-lg px-6"
            >
              <AccordionTrigger className="text-left text-md font-semibold hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-md leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 text-center">
          <p className="mb-4">Still have questions?</p>
          <Link
            href="mailto:support@domari.app"
            className="hover:text-accent font-semibold underline transition-colors"
          >
            Contact our support team
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
