"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Full-stack Developer",
    content: "OpenChat's codebase is incredibly clean. I contributed my first PR within hours!",
    avatar: "SC",
  },
  {
    name: "Marcus Rodriguez",
    role: "Security Engineer",
    content: "The security-first approach gives me confidence to recommend this to clients.",
    avatar: "MR",
  },
  {
    name: "Emily Watson",
    role: "Open Source Maintainer",
    content: "Best community experience I've had. The maintainers are so welcoming!",
    avatar: "EW",
  },
];

interface TestimonialsProps {
  className?: string;
}

export default function Testimonials({ className = "" }: TestimonialsProps) {
  return (
    <section id="contributors" className={`py-20 md:py-32 bg-background-accent/30 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-primary-accent" />
            <h2 className="text-4xl md:text-5xl font-bold text-primary-accent">What Our Community Says</h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hear from developers who've built amazing things with OpenChat
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl bg-background border border-border hover:border-primary-accent/50 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-accent/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-accent">{testimonial.avatar}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary-accent text-primary-accent" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link
            href="/contributors"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-border hover:bg-muted transition-colors text-lg font-semibold"
          >
            Meet All Contributors
          </Link>
        </motion.div>
      </div>
    </section>
  );
}