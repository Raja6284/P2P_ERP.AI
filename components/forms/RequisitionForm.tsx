'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const requisitionSchema = z.object({
  department: z.string().min(1, 'Department is required'),
  items: z.array(z.object({
    itemName: z.string().min(1, 'Item name is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    estimatedPrice: z.number().min(0.01, 'Price must be greater than 0'),
  })).min(1, 'At least one item is required'),
});

type RequisitionFormData = z.infer<typeof requisitionSchema>;

interface RequisitionFormProps {
  onSuccess?: () => void;
}

export default function RequisitionForm({ onSuccess }: RequisitionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<RequisitionFormData>({
    resolver: zodResolver(requisitionSchema),
    defaultValues: {
      department: '',
      items: [{ itemName: '', description: '', quantity: 1, estimatedPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');

  const totalAmount = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.estimatedPrice);
  }, 0);

  const getSuggestions = async (description: string, itemIndex: number) => {
    if (!description.trim()) return;
    
    setLoadingSuggestions(true);
    try {
      const response = await fetch('/api/ai/suggest-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applySuggestion = (suggestion: string, itemIndex: number) => {
    setValue(`items.${itemIndex}.itemName`, suggestion);
    setAiSuggestions([]);
  };

  const onSubmit = async (data: RequisitionFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/requisitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Requisition created successfully');
        onSuccess?.();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create requisition');
      }
    } catch (error) {
      toast.error('An error occurred while creating the requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Create New Requisition</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="department" className="text-sm sm:text-base">Department</Label>
            <Input
              id="department"
              {...register('department')}
              placeholder="Enter department name"
              className="text-sm sm:text-base"
            />
            {errors.department && (
              <p className="text-sm text-red-600 mt-1">{errors.department.message}</p>
            )}
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base sm:text-lg font-medium">Items</Label>
              <Button
                type="button"
                onClick={() => append({ itemName: '', description: '', quantity: 1, estimatedPrice: 0 })}
                className="flex items-center gap-2 text-sm sm:text-base"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Item</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor={`items.${index}.itemName`} className="text-sm sm:text-base">Item Name</Label>
                    <div className="relative">
                      <Input
                        {...register(`items.${index}.itemName`)}
                        placeholder="Enter item name"
                        className="text-sm sm:text-base"
                      />
                      {aiSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 mt-1 max-h-40 overflow-y-auto">
                          {aiSuggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              type="button"
                              className="w-full text-left px-2 sm:px-3 py-2 hover:bg-gray-100 text-xs sm:text-sm"
                              onClick={() => applySuggestion(suggestion, index)}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.items?.[index]?.itemName && (
                      <p className="text-sm text-red-600 mt-1">{errors.items[index]?.itemName?.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.description`} className="text-sm sm:text-base">Description</Label>
                    <div className="relative">
                      <Textarea
                        {...register(`items.${index}.description`)}
                        placeholder="Enter item description"
                        className="pr-10 text-sm sm:text-base"
                        rows={2}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-1 right-1 p-1 sm:top-2 sm:right-2"
                        onClick={() => getSuggestions(watchedItems[index]?.description, index)}
                        disabled={loadingSuggestions}
                      >
                        <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    {errors.items?.[index]?.description && (
                      <p className="text-sm text-red-600 mt-1">{errors.items[index]?.description?.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.quantity`} className="text-sm sm:text-base">Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      placeholder="Enter quantity"
                      className="text-sm sm:text-base"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-red-600 mt-1">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor={`items.${index}.estimatedPrice`} className="text-sm sm:text-base">Estimated Price ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register(`items.${index}.estimatedPrice`, { valueAsNumber: true })}
                      placeholder="Enter estimated price"
                      className="text-sm sm:text-base"
                    />
                    {errors.items?.[index]?.estimatedPrice && (
                      <p className="text-sm text-red-600 mt-1">{errors.items[index]?.estimatedPrice?.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Total: ${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.estimatedPrice || 0)).toFixed(2)}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-xs sm:text-sm"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="ml-1 sm:hidden">Remove</span>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
            <div className="text-base sm:text-lg font-semibold">
              Total Amount: ${totalAmount.toFixed(2)}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Creating...' : 'Create Requisition'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}