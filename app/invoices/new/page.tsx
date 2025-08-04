import Layout from '@/components/layout/Layout';
import InvoiceForm from '@/components/forms/InvoiceForm';

export default function NewInvoicePage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Invoice</h1>
          <p className="text-gray-600">Add a new invoice with OCR support for automatic data extraction</p>
        </div>
        
        <InvoiceForm />
      </div>
    </Layout>
  );
}