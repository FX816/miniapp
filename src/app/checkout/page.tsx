'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useTelegram } from '@/providers/telegram-provider';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const checkoutFormSchema = z.object({
  contact_name: z.string().min(2, 'Минимум 2 символа'),
  contact_phone: z.string().min(10, 'Введите корректный телефон'),
  contact_email: z.string().email('Некорректный email').optional().or(z.literal('')),
  delivery_address: z.string().min(10, 'Введите полный адрес'),
  delivery_notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { total, refresh } = useCart();
  const { user } = useTelegram();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      contact_name: user ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
      contact_phone: user?.phone || '',
      contact_email: user?.email || '',
      delivery_address: '',
      delivery_notes: '',
    },
  });

  const onSubmit = async (data: CheckoutForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (json.success) {
        toast.success('Заказ оформлен!');
        await refresh();
        router.push(`/orders/${json.data.id}`);
      } else {
        toast.error(json.error || 'Ошибка оформления');
      }
    } catch {
      toast.error('Ошибка сети');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Header title="Оформление заказа" />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-4">
        <section className="space-y-4">
          <h2 className="font-semibold">Контактные данные</h2>

          <div className="space-y-2">
            <Label htmlFor="contact_name">Имя</Label>
            <Input id="contact_name" {...register('contact_name')} />
            {errors.contact_name && (
              <p className="text-xs text-destructive">{errors.contact_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_phone">Телефон</Label>
            <Input id="contact_phone" type="tel" {...register('contact_phone')} />
            {errors.contact_phone && (
              <p className="text-xs text-destructive">{errors.contact_phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Email (необязательно)</Label>
            <Input id="contact_email" type="email" {...register('contact_email')} />
            {errors.contact_email && (
              <p className="text-xs text-destructive">{errors.contact_email.message}</p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-semibold">Доставка</h2>

          <div className="space-y-2">
            <Label htmlFor="delivery_address">Адрес доставки</Label>
            <Textarea id="delivery_address" rows={3} {...register('delivery_address')} />
            {errors.delivery_address && (
              <p className="text-xs text-destructive">{errors.delivery_address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_notes">Комментарий к заказу</Label>
            <Textarea id="delivery_notes" rows={2} {...register('delivery_notes')} />
          </div>
        </section>

        <div className="rounded-2xl bg-secondary/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">К оплате:</span>
            <span className="text-xl font-bold">{formatPrice(total)}</span>
          </div>
        </div>

        <Button type="submit" variant="telegram" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Оформление...
            </>
          ) : (
            'Подтвердить заказ'
          )}
        </Button>
      </form>
    </div>
  );
}
