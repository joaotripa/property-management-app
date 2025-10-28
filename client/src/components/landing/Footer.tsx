import Link from "next/link";
import { Mail } from "lucide-react";
import Logo from "@/components/branding/Logo";
import { getAllPosts } from "@/lib/blog/posts";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 4);

  const links = [
    { label: "Features", href: "/#solution" },
    { label: "Pricing", href: "/#pricing" },
    { label: "FAQ", href: "/#faq" },
  ];

  const legalLinks = [
    { label: "Terms of Service", href: "/terms-of-service" },
    { label: "Privacy Policy", href: "/privacy-policy" },
  ];

  return (
    <footer className="bg-primary-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-4 md:gap-8">
          <div className="space-y-6">
            <div className="flex items-center text-xl text-foreground">
              <Logo />
            </div>
            <p className="leading-relaxed text-muted-foreground">
              Stay on top of your property finances without spreadsheets or
              accounting headaches.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:contents">
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="flex flex-col gap-2 text-muted-foreground">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Recent Articles</h3>
              <ul className="flex flex-col gap-2">
                {recentPosts.length > 0 ? (
                  recentPosts.map((post) => (
                    <li key={post.slug}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-muted-foreground hover:text-primary transition-colors line-clamp-2"
                      >
                        {post.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground text-sm">
                    No articles yet
                  </li>
                )}
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="flex flex-col gap-2">
                <li className="flex items-center">
                  <Link
                    href="/contact"
                    className="hover:text-primary transition-colors text-muted-foreground"
                  >
                    Contact Us
                  </Link>
                </li>
                <li className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                  <a
                    href="mailto:support@domari.app"
                    className="hover:text-primary  transition-colors text-muted-foreground"
                  >
                    support@domari.app
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-muted-foreground mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Domari. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
