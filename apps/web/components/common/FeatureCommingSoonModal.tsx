"use client";

import { motion } from "framer-motion";
import { Sparkles, Stars } from "lucide-react";
import { ResponsiveModal } from "./ResponsiveModal";

interface FeatureComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

const FeatureComingSoonModal = ({
  open,
  onOpenChange,
  title = "Feature Coming Soon",
  description = "We’re currently building this functionality. It will be released soon. Stay tuned!",
}: FeatureComingSoonModalProps) => {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title={title} description={description} trigger={<div></div>}>
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center space-y-6 bg-background">

        {/* Icon */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex items-center justify-center w-16 h-16 rounded-lg
          bg-background-accent border border-border shadow-sm"
        >
          <Sparkles className="w-7 h-7 text-foreground-accent" />
        </motion.div>


        {/* Subtle footer highlight */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center gap-2 text-xs text-foreground-accent"
        >
          <Stars className="w-4 h-4 text-primary" />
          <span>Available soon in upcoming updates</span>
        </motion.div>

      </div>
    </ResponsiveModal>
  );
};

export default FeatureComingSoonModal;
