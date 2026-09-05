'use client';

import { createContext, forwardRef, useContext } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { EASE_OUT } from '@/lib/motion';

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const DialogOpenContext = createContext(false);

/**
 * Thin wrapper around Radix's Root that also tracks `open` in context, so
 * DialogContent can drive an AnimatePresence exit animation - Radix's own
 * presence detection only waits for CSS transitions/animations, not
 * Framer's JS-driven ones.
 */
export function Dialog({ open, ...props }: DialogPrimitive.DialogProps) {
  return (
    <DialogOpenContext.Provider value={Boolean(open)}>
      <DialogPrimitive.Root open={open} {...props} />
    </DialogOpenContext.Provider>
  );
}

export const DialogContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const open = useContext(DialogOpenContext);

  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
            >
              <DialogPrimitive.Content ref={ref} asChild forceMount {...props}>
                <motion.div
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'relative grid w-full max-w-md gap-4 rounded-lg border border-border bg-card p-6 shadow-xl',
                    className,
                  )}
                  initial={{ opacity: 0, scale: 0.96, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 8 }}
                  transition={{ duration: 0.18, ease: EASE_OUT }}
                >
                  {children}
                  <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
                    <FiX className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </DialogPrimitive.Close>
                </motion.div>
              </DialogPrimitive.Content>
            </motion.div>
          </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
});
DialogContent.displayName = 'DialogContent';

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex justify-end gap-2 pt-2', className)} {...props} />;
}

export const DialogTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-base font-semibold leading-none', className)} {...props} />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

export const DialogDescription = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
