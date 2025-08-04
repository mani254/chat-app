// components/modals/FeatureComingSoonModal.tsx
"use client";


import { motion } from "framer-motion";
import { ListChecks, Sparkles, Stars } from "lucide-react";
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
  title = "Exciting Feature Coming Soon!",
  description = "We’re working on something awesome. This feature will be available in the near future. Stay tuned!",
}: FeatureComingSoonModalProps) => {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} title="Comming Soon" trigger={<div></div>}>
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center space-y-6 bg-background">

        {/* Animated Sparkles Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl"
        >
          <Sparkles className="w-10 h-10 text-white" />
          <motion.div
            className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full shadow"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <Stars className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl font-bold text-foreground"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {title}
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-muted-foreground max-w-md text-sm sm:text-base"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {description}
        </motion.p>

        {/* Checklist Icons */}
        <motion.div
          className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-green-500" />
            <span>Beta access soon</span>
          </div>
          <div className="flex items-center gap-2">
            <Stars className="w-5 h-5 text-yellow-400" />
            <span>Premium experience</span>
          </div>
        </motion.div>
      </div>
    </ResponsiveModal>
  );
};

export default FeatureComingSoonModal;
