import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-3 p-4 sm:max-w-[420px] pointer-events-none",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-4 overflow-hidden rounded-2xl border backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:fade-in-0 hover:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] hover:scale-[1.02] active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "border-gray-200/50 bg-white/95 text-gray-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
        success:
          "border-emerald-500/30 bg-gradient-to-br from-emerald-50/95 to-green-50/95 text-emerald-950 shadow-[0_8px_30px_rgb(16,185,129,0.25)]",
        destructive:
          "border-red-500/30 bg-gradient-to-br from-red-50/95 to-rose-50/95 text-red-950 shadow-[0_8px_30px_rgb(239,68,68,0.25)]",
        warning:
          "border-amber-500/30 bg-gradient-to-br from-amber-50/95 to-yellow-50/95 text-amber-950 shadow-[0_8px_30px_rgb(245,158,11,0.25)]",
        info: "border-blue-500/30 bg-gradient-to-br from-blue-50/95 to-sky-50/95 text-blue-950 shadow-[0_8px_30px_rgb(59,130,246,0.25)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const iconVariants = {
  default: { icon: Info, className: "text-gray-600" },
  success: { icon: CheckCircle2, className: "text-emerald-600" },
  destructive: { icon: AlertCircle, className: "text-red-600" },
  warning: { icon: AlertTriangle, className: "text-amber-600" },
  info: { icon: Info, className: "text-blue-600" },
};

const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  const IconComponent =
    iconVariants[variant]?.icon || iconVariants.default.icon;
  const iconClassName =
    iconVariants[variant]?.className || iconVariants.default.className;

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">
        <div className="relative">
          {/* Animated ring effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-current to-transparent opacity-20 animate-ping" />
          <IconComponent
            className={cn("h-5 w-5 relative z-10", iconClassName)}
            strokeWidth={2.5}
          />
        </div>
      </div>
      {props.children}
    </ToastPrimitives.Root>
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-9 shrink-0 items-center justify-center rounded-xl border border-gray-900/10 bg-white/80 px-4 text-xs font-semibold text-gray-900 ring-offset-white transition-all hover:bg-gray-900 hover:text-white hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitives.Action.displayName;

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 transition-all hover:text-gray-900 hover:bg-gray-900/5 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-900/20 active:scale-90",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-bold tracking-tight leading-tight", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-80 leading-relaxed mt-1", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
