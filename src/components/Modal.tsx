import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '../lib/utils'; 

interface ModalProps {
  trigger: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  trigger, 
  title, 
  children, 
  onOpenChange,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Dialog.Overlay>
            
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ",
                  "w-[90vw] max-w-md bg-white dark:bg-gray-800 p-6 rounded-lg ",
                  "shadow-xl z-50 focus:outline-none",
                  className
                )}
                initial={{ 
                  opacity: 0, 
                  scale: 0.9,
                  y: '-40%',
                  x: '-50%'
                }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  y: '-50%',
                  x: '-50%'
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.9,
                  y: '-40%'
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 300, 
                  damping: 20 
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="text-xl font-semibold dark:text-white">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button 
                      className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-full transition-colors"
                      aria-label="Close"
                    >
                      <Cross2Icon className="dark:text-white" />
                    </button>
                  </Dialog.Close>
                </div>
                
                {children}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

// Example Usage Component
export const ModalExample: React.FC = () => {
  const handleOpenChange = (open: boolean) => {
    console.log(`Modal is ${open ? 'opened' : 'closed'}`);
  };

  return (
    <Modal 
      trigger={<button className="btn btn-primary">Open Modal</button>}
      title="Example Modal"
      onOpenChange={handleOpenChange}
    >
      <p className="dark:text-white">This is the modal content with some additional information.</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Dialog.Close asChild>
          <button className="btn btn-secondary">Cancel</button>
        </Dialog.Close>
        <button className="btn btn-primary">Confirm</button>
      </div>
    </Modal>
  );
};
