import { useRef } from "react";
import Toaster, { ToasterRef } from "../components/ui/Toaster";

// Usage Example:
export function useToast() {
  const toasterRef = useRef<ToasterRef>(null);

  function show(message: string, duration?: number) {
    toasterRef.current?.show(message, duration);
  }

  return {
    toasterRef,
    show,
  };
}
