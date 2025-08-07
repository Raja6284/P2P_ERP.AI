'use client';


import { useState,useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

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

export default function NewInvoicePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrExtracted, setOcrExtracted] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userRole = (session?.user as any)?.role;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
  });

  if (userRole !== 'finance' && userRole !== 'admin') {
    router.push('/dashboard');
    return null;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsProcessingOCR(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        const response = await fetch('/api/invoices/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 }),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Auto-fill form with extracted data
          if (result.invoiceNumber) {
            setValue('invoiceNumber', result.invoiceNumber);
          }
          if (result.vendorName) {
            setValue('vendorName', result.vendorName);
          }
          if (result.amount) {
            setValue('amount', result.amount);
          }
          if (result.poReference) {
            setValue('poNumber', result.poReference);
          }

          setOcrExtracted(true);
          setExtractedData(result);

          toast.success(`OCR completed with ${result.confidence}% confidence. Please verify the extracted data.`);
        } else {
          toast.error('Failed to process image with OCR');
        }
      };
      reader.readAsDataURL(file);
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
        toast.success('Invoice uploaded successfully');
        router.push('/finance/invoices');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to upload invoice');
      }
    } catch (error) {
      toast.error('An error occurred while uploading the invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Invoice</h1>
          <p className="text-gray-600">Upload a new invoice with AI-powered OCR data extraction</p>
        </div>

        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Invoice Upload with OCR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label>Upload Invoice Image (AI OCR)</Label>
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
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isProcessingOCR ? 'Processing with AI...' : 'Upload Invoice Image for AI Extraction'}
                </Button>
              </div>
              {ocrExtracted && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800">
                      Data extracted with {extractedData?.confidence}% confidence using Gemini AI. Please verify all fields.
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/finance/invoices')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading...' : 'Upload Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}