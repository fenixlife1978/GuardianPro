'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateInstitutionForm } from './create-institution-form';

interface CreateInstitutionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInstitutionDialog({
  isOpen,
  onOpenChange,
}: CreateInstitutionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nueva Institución Educativa</DialogTitle>
          <DialogDescription>
            Completa los detalles para registrar una nueva institución en la plataforma.
          </DialogDescription>
        </DialogHeader>
        <CreateInstitutionForm onFinished={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
