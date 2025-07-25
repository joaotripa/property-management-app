import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah K.",
      role: "Real Estate Investor",
      image:
        "https://images.unsplash.com/woman-in-white-crew-neck-shirt-smiling-IF9TK5Uy-KI?w=400&h=400&fit=crop&crop=face",
      content:
        "Domari helped me identify €2,400 in missed deductions and showed me which property was actually losing money. Game changer.",
      rating: 5,
      color: "from-blue-500 to-purple-600",
    },
    {
      name: "Michael Chen",
      role: "Property Manager",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
      content:
        "The booking calendar and tenant management features are incredibly intuitive. My clients love the transparency, and I love how everything syncs perfectly across all devices.",
      rating: 5,
      color: "from-green-500 to-emerald-600",
    },
    {
      name: "Emily Rodriguez",
      role: "Landlord & Entrepreneur",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
      content:
        "I was skeptical about property management software, but Domari's user-friendly interface and powerful analytics convinced me. My occupancy rate improved from 85% to 96%.",
      rating: 5,
      color: "from-orange-500 to-red-600",
    },
    {
      name: "David Thompson",
      role: "Real Estate Portfolio Owner",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      content:
        "The financial insights and expense tracking helped me identify cost savings I never knew existed. I've optimized my properties and increased profitability significantly.",
      rating: 5,
      color: "from-cyan-500 to-blue-600",
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-24 bg-gradient-to-br from-primary/20 to-primary-light/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">
                Customer Stories
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-snug">
              More than 500+ people{" "}
              <span className="text-primary text-shadow-sm text-shadow-primary">
                choose
              </span>
              <span className="italic"> Domari</span>
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Don't just take our word for it, hear from property owners who've
              transformed their business
            </p>
          </div>
        </div>
        <div className="mb-8 gap-5 py-4 md:mb-12 sm:columns-2 columns-1 c-col-1 c-sm-col-2 md:columns-3 c-md-col-3">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="mb-6 gap-6 bg-white p-8 rounded-3xl border border-border group relative overflow-hidden"
            >
              <div className="flex flex-row items-center mb-6">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-2xl object-cover mr-4 shadow-lg"
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="font-semibold text-foreground text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-muted text-sm">{testimonial.role}</p>
                </div>
              </div>

              <blockquote className="text-dark leading-relaxed text-lg relative z-10">
                "{testimonial.content}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
