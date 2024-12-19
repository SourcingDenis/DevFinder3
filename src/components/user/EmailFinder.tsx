import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { storeUserEmail } from '@/lib/github-api';
import { toast } from 'sonner';

type EmailFinderProps = {
  username: string;
  onClose: () => void;
  onEmailSaved?: (email: string, source: string) => void;
};

export const EmailFinder: React.FC<EmailFinderProps> = ({ username, onClose, onEmailSaved }) => {
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEmail = async () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format');
      return;
    }

    setIsSaving(true);
    try {
      await storeUserEmail(username, email, 'manual_input');
      toast.success('Email saved successfully');
      onEmailSaved?.(email, 'manual_input');
      onClose();
    } catch (error) {
      toast.error('Failed to save email', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <Input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email"
        className="flex-1"
        disabled={isSaving}
      />
      <Button 
        size="icon" 
        variant="outline" 
        onClick={handleSaveEmail}
        disabled={isSaving}
      >
        <Check className="h-4 w-4" />
      </Button>
      <Button 
        size="icon" 
        variant="destructive" 
        onClick={onClose}
        disabled={isSaving}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
