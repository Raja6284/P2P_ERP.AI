'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { extractTextFromImage } from '@/lib/utils/ocr';

const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  poNumber: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSuccess?: () => void;
}

export default function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrExtracted, setOcrExtracted] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsProcessingOCR(true);
    try {
      const result = await extractTextFromImage(file);
      
      // Auto-fill form with extracted data
      if (result.invoiceNumber) {
        setValue('invoiceNumber', result.invoiceNumber);
      }
      if (result.vendor) {
        setValue('vendorName', result.vendor);
      }
      if (result.amount) {
        setValue('amount', result.amount);
      }
      if (result.date) {
        setValue('invoiceDate', result.date);
      }

      setOcrExtracted(true);
      setExtractedData({
        confidence: result.confidence,
        rawText: result.text,
      });

      toast.success(`OCR completed with ${result.confidence.toFixed(1)}% confidence. Please verify the extracted data.`);
    } catch (error) {
      toast.error('Failed to process image with OCR');
      console.error('OCR Error:', error);
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        ocrExtracted,
        extractedData,
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Invoice created successfully');
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create invoice');
      }
    } catch (error) {
      toast.error('An error occurred while creating the invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label>Upload Invoice Image (OCR)</Label>
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingOCR}
              className="w-full"
            >
              {isProcessingOCR ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isProcessingOCR ? 'Processing Image...' : 'Upload Invoice Image'}
            </Button>
          </div>
          {ocrExtracted && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm text-blue-800">
                  Data extracted with {extractedData?.confidence?.toFixed(1)}% confidence. Please verify all fields.
                </span>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                {...register('invoiceNumber')}
                placeholder="Enter invoice number"
              />
              {errors.invoiceNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.invoiceNumber.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="vendorName">Vendor Name</Label>
              <Input
                id="vendorName"
                {...register('vendorName')}
                placeholder="Enter vendor name"
              />
              {errors.vendorName && (
                <p className="text-sm text-red-600 mt-1">{errors.vendorName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="Enter amount"
              />
              {errors.amount && (
                <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="poNumber">PO Number (Optional)</Label>
              <Input
                id="poNumber"
                {...register('poNumber')}
                placeholder="Enter PO number"
              />
            </div>

            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                {...register('invoiceDate')}
              />
              {errors.invoiceDate && (
                <p className="text-sm text-red-600 mt-1">{errors.invoiceDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-600 mt-1">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}