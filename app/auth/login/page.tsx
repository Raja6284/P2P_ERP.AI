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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="absolute top-4 left-4">
        <Button asChild variant="outline">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome to ERP System</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="demo">Demo Accounts</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="demo" className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Use these demo accounts to explore different user roles:
              </div>
              
              <div className="space-y-2 text-sm">
                 <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">Requester</div>
                  <div>raja@gmail.com / raja@123</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">Manager</div>
                  <div>rajamanager@gmail.com / raja@123</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="font-medium">Store</div>
                  <div>rajastore@gmail.com / raja@123</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="font-medium">Finance</div>
                  <div>rajafinance@gmail.com / raja@123</div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium">Admin</div>
                  <div>rajaadmin@gmail.com / raja@123</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="p-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </div>
      </Card>
    </div>
  );
}