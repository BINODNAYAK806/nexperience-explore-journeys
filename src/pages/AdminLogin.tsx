
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { LockIcon, MailIcon } from "lucide-react";

const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Fixed credentials validation
    if (password === "Asd@1234") {
      // Set session in localStorage to maintain login state
      localStorage.setItem("adminLoggedIn", "true");
      
      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });
      
      navigate("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Incorrect password. Please try again.",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MailIcon className="h-4 w-4 opacity-70" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <div className="flex items-center border rounded-md bg-gray-100">
                <Input 
                  type="email" 
                  value="hello@nexyatra.com" 
                  readOnly 
                  className="border-0 bg-transparent" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <LockIcon className="h-4 w-4 opacity-70" />
                <span className="text-sm font-medium">Password</span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AdminLogin;
