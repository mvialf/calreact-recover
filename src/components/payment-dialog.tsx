import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnrichedProject } from '@/types/project';
import { PaymentMethod } from '@/types/payment';
import { POSSIBLE_PAYMENT_METHODS } from '@/constants/payments';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project: EnrichedProject | null;
  onConfirm: (paymentData: { amount: number; date: Date; paymentMethod: PaymentMethod; installments?: number; isAdjustment: boolean }) => void;
}

export const PaymentDialog: React.FC<PaymentDialogProps> = ({ isOpen, onClose, project, onConfirm }) => {
  const [amount, setAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('');
  const [installments, setInstallments] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('');
      setInstallments('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const paymentAmount = parseFloat(amount);
    const numInstallments = parseInt(installments, 10);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error('Por favor, ingrese un monto válido.');
      return;
    }
    if (!paymentDate) {
      toast.error('Por favor, seleccione una fecha para el pago.');
      return;
    }
    if (!paymentMethod) {
      toast.error('Por favor, seleccione una forma de pago.');
      return;
    }
    if (paymentMethod === 'tarjeta de crédito' && (isNaN(numInstallments) || numInstallments <= 0)) {
      toast.error('Por favor, ingrese un número de cuotas válido.');
      return;
    }

    const paymentData: Parameters<PaymentDialogProps['onConfirm']>[0] = {
      amount: paymentAmount,
      date: new Date(paymentDate),
      paymentMethod,
      isAdjustment: false,
    };

    if (paymentMethod === 'tarjeta de crédito') {
      paymentData.installments = numInstallments;
    }

    onConfirm(paymentData);
  };

  if (!project) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Proyecto: <span className="font-semibold">{project.projectNumber}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Monto</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">Fecha</Label>
            <Input id="date" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentMethod" className="text-right">Forma de Pago</Label>
            <Select onValueChange={(value: PaymentMethod) => setPaymentMethod(value)} value={paymentMethod}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione un método" />
              </SelectTrigger>
              <SelectContent>
                {POSSIBLE_PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method} value={method}>{method.charAt(0).toUpperCase() + method.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paymentMethod === 'tarjeta de crédito' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="installments" className="text-right">Cuotas</Label>
              <Input id="installments" type="number" value={installments} onChange={(e) => setInstallments(e.target.value)} className="col-span-3" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar Pago</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
