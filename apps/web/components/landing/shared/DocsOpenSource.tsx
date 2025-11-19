"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Code, Shield, Github, Users, GitBranch, Heart } from "lucide-react";

const CONTRIBUTION_AREAS = [
  { title: "Frontend Development", description: "React, Next.js, Tailwind CSS", icon: Code },
  { title: "Backend Engineering", description: "Node.js, Express, WebSocket", icon: GitBranch },
  { title: "Security Auditing", description: "Encryption, Auth, Penetration Testing", icon: Shield },
  { title: "Documentation", description: "API docs, tutorials, guides", icon: BookOpen },
  { title: "Design & UX", description: "UI/UX, accessibility, mobile", icon: Heart },
  { title: "Community", description: "Support, outreach, events", icon: Users },
];

export default function DocsOpenSource() {
  return (
    <>
      {/* Documentation Preview Section */}
      <section id="docs" className="py-20 md:py-32 bg-background-accent/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-accent">Comprehensive Documentation</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started quickly with our detailed guides and API reference
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-background border border-border hover:border-primary-accent/50 transition-all duration-300"
            >
              <BookOpen className="w-8 h-8 text-primary-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quick Start</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Get up and running in minutes with our step-by-step installation guide.
              </p>
              <Link href="/docs/quickstart" className="text-primary-accent hover:underline text-sm font-medium">
                Read Guide →
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-background border border-border hover:border-primary-accent/50 transition-all duration-300"
            >
              <Code className="w-8 h-8 text-primary-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">API Reference</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Complete API documentation with examples and code snippets.
              </p>
              <Link href="/docs/api" className="text-primary-accent hover:underline text-sm font-medium">
                View API →
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-background border border-border hover:border-primary-accent/50 transition-all duration-300"
            >
              <Shield className="w-8 h-8 text-primary-accent mb-4" />
              <h3 className="text-lg font-semibold mb-2">Security Guide</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Learn about our security practices and how to deploy securely.
              </p>
              <Link href="/docs/security" className="text-primary-accent hover:underline text-sm font-medium">
                Learn More →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section id="opensource" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary-accent">Contribute to OpenChat</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our growing community of contributors and help shape the future of messaging
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {CONTRIBUTION_AREAS.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="group p-6 rounded-xl bg-background-accent/50 border border-border hover:border-primary-accent/50 transition-all duration-300"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 rounded-lg bg-primary-accent/10 group-hover:bg-primary-accent/20 transition-colors">
                    <area.icon className="w-5 h-5 text-primary-accent" />
                  </div>
                  <h3 className="text-lg font-semibold">{area.title}</h3>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{area.description}</p>
                <Link
                  href="https://github.com/openchat/openchat/issues"
                  className="text-primary-accent hover:underline text-sm font-medium"
                >
                  View Issues →
                </Link>
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
              href="https://github.com/openchat/openchat"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg font-semibold"
            >
              <Github className="w-5 h-5" />
              Start Contributing
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}