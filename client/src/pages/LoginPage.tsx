import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type LoginRequest = {
  identifier: string;
  password: string;
};

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<LoginRequest>({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Clear error when form values change
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [form.watch("identifier"), form.watch("password"), error, clearError]);

  const onSubmit = async (data: LoginRequest) => {
    try {
      console.log('Submitting login form with:', data);
      await login(data);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
      });
      
      // Navigation will be handled by useEffect above
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Show loading spinner if initializing
  if (isLoading && !form.formState.isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full">
        <Card className="shadow-material">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">JobConnect Admin</h1>
              <p className="text-muted-foreground">Sign in to your admin dashboard</p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  {...form.register("identifier", { 
                    required: "Identifier is required",
                    minLength: { value: 1, message: "Identifier cannot be empty" }
                  })}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  data-testid="input-identifier"
                  autoComplete="username"
                />
                <Label className="absolute left-4 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary">
                  Username or Email
                </Label>
                {form.formState.errors.identifier && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.identifier.message}
                  </p>
                )}
              </div>
              
              <div className="relative">
                <Input
                  type="password"
                  {...form.register("password", { 
                    required: "Password is required",
                    minLength: { value: 1, message: "Password cannot be empty" }
                  })}
                  placeholder=" "
                  className="peer w-full px-4 pt-6 pb-2 border rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                  data-testid="input-password"
                  autoComplete="current-password"
                />
                <Label className="absolute left-4 top-2 text-xs text-muted-foreground transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:text-xs peer-focus:top-2 peer-focus:text-primary">
                  Password
                </Label>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <Checkbox 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="w-4 h-4 text-primary border-muted rounded focus:ring-primary"
                    data-testid="checkbox-remember"
                  />
                  <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting || isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-login"
              >
                {form.formState.isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Debug info in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-3 bg-muted rounded text-xs">
                <details>
                  <summary className="cursor-pointer">Debug Info</summary>
                  <pre className="mt-2 text-xs">
                    {JSON.stringify({
                      isAuthenticated,
                      isLoading,
                      hasError: !!error,
                      formState: form.formState.errors
                    }, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
