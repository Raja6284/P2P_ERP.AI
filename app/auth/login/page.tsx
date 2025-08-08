'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Link from 'next/link'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Invalid credentials');
      } else {
        toast.success('Login successful');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
      <Card className="w-full max-w-sm sm:max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">Welcome to ERP System</CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    className="text-sm sm:text-base"
                  />
                </div>
                <Button type="submit" className="w-full text-sm sm:text-base" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="demo" className="space-y-3 sm:space-y-4">
              <div className="text-xs sm:text-sm text-gray-600 mb-4">
                Use these demo accounts to explore different user roles:
              </div>
              
              <div className="space-y-2 text-xs sm:text-sm">
                 <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-sm">Requester</div>
                  <div className="text-xs sm:text-sm">raja@gmail.com / raja@123</div>
                </div>
                <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                  <div className="font-medium text-sm">Manager</div>
                  <div className="text-xs sm:text-sm">rajamanager@gmail.com / raja@123</div>
                </div>
                <div className="p-2 sm:p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium text-sm">Store</div>
                  <div className="text-xs sm:text-sm">rajastore@gmail.com / raja@123</div>
                </div>
                <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium text-sm">Finance</div>
                  <div className="text-xs sm:text-sm">rajafinance@gmail.com / raja@123</div>
                </div>
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-sm">Admin</div>
                  <div className="text-xs sm:text-sm">rajaadmin@gmail.com / raja@123</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="p-3 sm:p-4 text-center text-xs sm:text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
}