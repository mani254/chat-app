"use client";

import { useEffect } from "react";

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  useEffect(() => {
    // Add keyboard navigation support
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close modals/overlays
      if (e.key === "Escape") {
        const modals = document.querySelectorAll("[role='dialog'], [aria-modal='true']");
        modals.forEach((modal) => {
          const closeButton = modal.querySelector("[aria-label*='close'], [aria-label*='Close']");
          if (closeButton instanceof HTMLButtonElement) {
            closeButton.click();
          }
        });
      }

      // Tab navigation enhancement
      if (e.key === "Tab") {
        document.body.classList.add("keyboard-navigation");
      }
    };

    const handleMouseDown = () => {
      document.body.classList.remove("keyboard-navigation");
    };

    // Focus management for dynamic content
    const handleFocusVisible = () => {
      document.body.classList.add("focus-visible");
    };

    const handleBlur = () => {
      document.body.classList.remove("focus-visible");
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("focusin", handleFocusVisible);
    document.addEventListener("focusout", handleBlur);

    // Add focus styles for keyboard navigation
    const style = document.createElement("style");
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid hsl(var(--focus-ring)) !important;
        outline-offset: 2px !important;
      }
      
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      .sr-only:focus:not-sr-only {
        position: static !important;
        width: auto !important;
        height: auto !important;
        padding: inherit !important;
        margin: inherit !important;
        overflow: visible !important;
        clip: auto !important;
        white-space: normal !important;
      }
      
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("focusin", handleFocusVisible);
      document.removeEventListener("focusout", handleBlur);
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
}

// Utility function to generate unique IDs for accessibility
export function generateId(prefix: string = "id"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to validate ARIA attributes
export function validateAriaLabel(element: HTMLElement): boolean {
  const hasAriaLabel = element.hasAttribute("aria-label") || element.hasAttribute("aria-labelledby");
  const hasTextContent = element.textContent?.trim().length > 0;
  const hasTitle = element.hasAttribute("title");
  
  return hasAriaLabel || hasTextContent || hasTitle;
}

// Utility function to announce changes to screen readers
export function announceToScreenReader(message: string, priority: "polite" | "assertive" = "polite"): void {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}