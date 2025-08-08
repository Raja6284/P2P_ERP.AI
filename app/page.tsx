// 'use client';

// import { useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import { useRouter } from 'next/navigation';

// export default function HomePage() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === 'loading') return;
    
//     if (session) {
//       router.push('/dashboard');
//     } else {
//       router.push('/auth/login');
//     }
//   }, [session, status, router]);

//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
//     </div>
//   );
// }






'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  Users, 
  BarChart3,
  CheckCircle,
  Workflow
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="relative bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Workflow className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">P2P ERP System</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6">
              Modern{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                P2P ERP
              </span>{' '}
              System
            </h1>
            <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Streamline your Procure-to-Pay workflow with our intelligent ERP system. 
              From requisition to payment, manage every step with AI-powered automation 
              and role-based access control.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Demo Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
              Everything you need for P2P workflow
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-16 max-w-2xl mx-auto">
              Built for modern enterprises with advanced AI capabilities and comprehensive workflow management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Role-Based Security</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Comprehensive RBAC with 5 distinct roles: Requester, Manager, Store, Finance, and Admin
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI-Powered OCR</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Smart invoice processing with automatic data extraction and PO matching
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">AI Assistant</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Intelligent chatbot for system queries, status updates, and workflow assistance
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Real-time Analytics</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Comprehensive dashboard with insights into workflow performance and bottlenecks
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Complete Audit Trail</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Full traceability of all actions with user attribution and timestamp tracking
              </p>
            </div>

            <div className="text-center p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Workflow className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">End-to-End Workflow</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Complete P2P process from requisition to payment with automated status updates
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
              Try our demo accounts
            </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12">
              Experience different user roles and see how the system works for each department
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {[
              { role: 'Requester', email: 'requester@demo.com', description: 'Submit and track requisitions' },
              { role: 'Manager', email: 'manager@demo.com', description: 'Approve requests and create POs' },
              { role: 'Store', email: 'store@demo.com', description: 'Confirm goods received' },
              { role: 'Finance', email: 'finance@demo.com', description: 'Process invoices and payments' },
              { role: 'Admin', email: 'admin@demo.com', description: 'Full system access and user management' },
            ].map((account) => (
              <div key={account.role} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{account.role}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">{account.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p><strong>Email:</strong> {account.email}</p>
                  <p><strong>Password:</strong> password123</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link
              href="/auth/login"
              className="inline-flex items-center px-6 sm:px-8 py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Try Demo Now
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="h-6 w-6 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Workflow className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">P2P ERP System</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Modern Procure-to-Pay workflow management with AI integration
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Built with Next.js, TypeScript, MongoDB, and OpenAI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}