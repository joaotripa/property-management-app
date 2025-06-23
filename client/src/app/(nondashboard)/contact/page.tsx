"use client";

import { useState } from "react";
import { toast } from "sonner";
import ContactForm from "@/app/(nondashboard)/contact/ContactForm";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(data.message);
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(
          data.message || "Failed to send message. Please try again."
        );
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <main className="flex-grow pt-42 pb-16">
        <section className="max-w-2xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-slate-600">
              Have questions about Domari? We&apos;d love to hear from you. Send
              us a message and we&apos;ll respond as soon as possible.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
            <h2 className="text-2xl font-semibold text-slate-900 mb-6">
              Send us a Message
            </h2>
            <ContactForm
              formData={formData}
              isLoading={isLoading}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
