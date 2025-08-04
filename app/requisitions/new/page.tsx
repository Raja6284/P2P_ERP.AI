import Layout from '@/components/layout/Layout';
import RequisitionForm from '@/components/forms/RequisitionForm';

export default function NewRequisitionPage() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Requisition</h1>
          <p className="text-gray-600">Submit a new purchase request for approval</p>
        </div>
        
        <RequisitionForm />
      </div>
    </Layout>
  );
}