import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
  formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  };
  isLoading: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ContactForm = ({
  formData,
  isLoading,
  onChange,
  onSubmit,
}: ContactFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={onChange}
          required
          className="mt-2"
          disabled={isLoading}
          placeholder="Your full name"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
          className="mt-2"
          disabled={isLoading}
          placeholder="your.email@example.com"
        />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          name="subject"
          type="text"
          value={formData.subject}
          onChange={onChange}
          required
          className="mt-2"
          disabled={isLoading}
          placeholder="What's this about?"
        />
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={onChange}
          required
          rows={6}
          disabled={isLoading}
          placeholder="Tell us more about your question or feedback..."
          className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-300 disabled:opacity-50 resize-none"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 h-12 text-base font-medium"
      >
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
};

export default ContactForm;
