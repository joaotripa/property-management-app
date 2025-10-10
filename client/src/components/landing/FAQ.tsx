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
        "Start using Domari immediately with full access to all Business plan features. No credit card required. After 14 days, choose a paid plan that fits your portfolio size, or your account will be automatically downgraded.",
    },
    {
      question: "What happens if I exceed my property limit?",
      answer:
        "We'll notify you when you reach your plan's property limit. You can easily upgrade to the next tier (Starter: 10 properties, Pro: 50 properties, Business: unlimited) or remove unused properties from your account.",
    },
    {
      question: "Can I switch plans or cancel anytime?",
      answer:
        "Yes! Upgrade or downgrade your subscription anytime through your billing settings. Changes take effect immediately with prorated adjustments. You can cancel your subscription at any time with no penalties.",
    },
    {
      question: "How is my financial data stored and secured?",
      answer:
        "Your data is securely stored in encrypted PostgreSQL databases with enterprise-grade security. You retain full ownership of your data. We never share your information with third parties.",
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
