'use client';

import Heading from '@/components/ui/heading';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import AlertModal from '@/components/modals/alert-modal';
import { Color } from '@prisma/client';

const formSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(4).regex(/^#/, {
    message: 'String must be a valid hex code'
  })
});

type ColorFormValues = z.infer<typeof formSchema>;

interface ColorFormProps {
  initialData: Color | null;
}

const ColorForm = ({ initialData }: ColorFormProps) => {
  const router = useRouter();
  const params = useParams();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit color' : 'Create color';
  const description = initialData ? 'Edit a color' : 'Add a new color';
  const toastMessage = initialData ? 'Color updated.' : 'Color created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: '', value: '' }
  });

  const onSubmit = async (data: ColorFormValues) => {
    try {
      setLoading(true);

      if (initialData) {
        const response = axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data);
      } else {
        const response = axios.post(`/api/${params.storeId}/colors`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success(toastMessage);
    } catch (e) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`);
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success('Color deleted.');
    } catch (e) {
      toast.error('Make sure you removed all products using this color first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className={'flex items-center justify-between'}>
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            onClick={() => setOpen(true)}
            variant={'destructive'}
            size={'icon'}
          >
            <Trash className={'h-4 w-4'} />
          </Button>
        )}
      </div>
      <Separator />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={'space-y-8 w-full'}>
          <div className={'grid grid-cols-3 gap-8'}>
            <FormField
              control={form.control}
              name={'name'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder={'Color name'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={'value'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <div className={'flex items-center gap-x-4'}>
                      <Input disabled={loading} placeholder={'Color value'} {...field} />
                      <div className={'border p-4 rounded-full'} style={{background: field.value}}/>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type={'submit'} disabled={loading} className={'ml-auto'}>
            {action}
          </Button>
        </form>
      </Form>
      <Separator />
    </>
  );
};

export default ColorForm;