// components/ui/responsive-modal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";
import useMediaQuery from "@/src/hooks/useMediaQuery";


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

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className="p-0 overflow-hidden bg-background rounded-3xl">
          {title && (
            <DialogHeader className="p-4 pb-1 border-b border-border">
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
      <DrawerContent className="p-0 overflow-hidden bg-background rounded-0 md:rounded-3xl">
        {title && (
          <DrawerHeader className="px-3 pt-2 border-b border-border">
            <DrawerTitle>{title}</DrawerTitle>
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}

        {children}
      </DrawerContent>
    </Drawer>
  );
};
