"use client";

import useMediaQuery from "@/hooks/useMediaQuery";
import { mobileWidth } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";

interface ResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const ResponsiveModal = ({
  open,
  onOpenChange,
  trigger,
  children,
  title,
  description,
}: ResponsiveModalProps) => {
  const isDesktop = useMediaQuery(`(min-width: ${mobileWidth}px)`);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          className="bg-background rounded-3xl border border-border p-0 shadow-xl focus:outline-none focus:ring-0 max-h-dvh"
        >
          {title && (
            <DialogHeader className="p-4 pb-2 border-b border-border">
              <DialogTitle>{title}</DialogTitle>
              {description && (
                <DialogDescription aria-describedby={undefined}>
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}

          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent
        className="w-full bg-background rounded-t-3xl p-0 shadow-xl focus:outline-none focus:ring-0 h-[90vh] ">

        {/* Pull Handle */}
        <div className="w-full flex justify-center py-2">
          <div className="h-1.5 w-12 rounded-full bg-foreground/30" />
        </div>

        {title && (
          <DrawerHeader className="px-4 pt-1 pb-2 border-b border-border">
            <DrawerTitle>{title}</DrawerTitle>
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {children}
      </DrawerContent>
    </Drawer >
  );
};
