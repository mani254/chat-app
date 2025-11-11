import { toast } from '@workspace/ui/components/sonner';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern API (supported in HTTPS or localhost)
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true; // success
    }

    // Fallback for older browsers or non-secure contexts
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    toast.success('Content Copied');

    return successful;
  } catch (err) {
    console.error('❌ Clipboard copy failed:', err);
    return false;
  }
}

export const wait = (ms: number = 300): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
