"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Code, Shield, Users, Rocket } from "lucide-react";

const FEATURES = [
  {
    icon: Code,
    title: "Developer Friendly",
    description: "Built with TypeScript, Next.js, and modern tooling for easy contributions and customization.",
    demo: "TypeScript support with full type safety",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encryption ready, self-hostable, and open for security audits.",
    demo: "Zero-knowledge architecture",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join a growing community of contributors and users shaping the future of chat.",
    demo: "Active Discord & GitHub community",
  },
  {
    icon: Rocket,
    title: "Real-time Messaging",
    description: "WebSocket-powered instant messaging with typing indicators and presence.",
    demo: "Sub-100ms message delivery",
  },
];

interface FeaturesProps {
  className?: string;
}

export default function Features({ className = "" }: FeaturesProps) {
  return (
    <section id="features" className={`py-20 md:py-32 bg-background ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-accent">Built for Modern Teams</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build a secure, scalable messaging platform
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="group p-8 rounded-2xl bg-background-accent/50 border border-border hover:border-primary-accent/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary-accent/10 group-hover:bg-primary-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground mb-3">{feature.description}</p>
                  <div className="flex items-center gap-2 text-sm text-primary-accent">
                    <span>{feature.demo}</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}