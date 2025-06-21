"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, UserPlus, LogIn } from "lucide-react";
import {
  createUser,
  authenticateUser,
  validatePassword,
} from "@/app/lib/user-storage";
import { isEmailApproved } from "@/app/lib/approved-emails";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const userAuth = localStorage.getItem("isUserAuthenticated");
    const userLoginTime = localStorage.getItem("userLoginTime");

    if (userAuth === "true" && userLoginTime) {
      const now = Date.now();
      const loginTimestamp = Number.parseInt(userLoginTime);
      const sessionDuration = 24 * 60 * 60 * 1000;

      if (now - loginTimestamp < sessionDuration) {
        window.location.href = "/";
        return;
      }
    }
  }, []);

  const validateForm = () => {
    const newErrors: string[] = [];

    if (!email) {
      newErrors.push("Email is required");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push("Please enter a valid email address");
    }

    if (!password) {
      newErrors.push("Password is required");
    }

    if (!isLogin) {
      // Check if email is in the approved list
      // if (!isEmailApproved(email)) {
      //   newErrors.push("This email is not authorized to create an account");
      // }

      if (!confirmPassword) {
        newErrors.push("Please confirm your password");
      } else if (password !== confirmPassword) {
        newErrors.push("Passwords do not match");
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        newErrors.push(...passwordValidation.errors);
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const result = await authenticateUser(email, password);

        if (result.success && result.user) {
          localStorage.setItem("isUserAuthenticated", "true");
          localStorage.setItem("userLoginTime", Date.now().toString());
          localStorage.setItem("currentUserId", result.user.id);
          localStorage.setItem("currentUserEmail", result.user.email);

          toast({
            title: "Login Successful!",
            description: "Welcome back to the Resource Guide.",
          });

          window.location.href = "/";
        } else {
          setErrors([result.message]);
        }
      } else {
        // Handle signup
        const result = await createUser(email, password);

        if (result.success && result.user) {
          localStorage.setItem("isUserAuthenticated", "true");
          localStorage.setItem("userLoginTime", Date.now().toString());
          localStorage.setItem("currentUserId", result.user.id);

          toast({
            title: "Account Created!",
            description: "Welcome to the Resource Guide.",
          });

          window.location.href = "/";
        } else {
          setErrors([result.message]);
        }
      }
    } catch (error) {
      setErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {isLogin ? (
              <LogIn className="w-8 h-8 text-blue-600" />
            ) : (
              <UserPlus className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {isLogin ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <p className="text-gray-600">
            {isLogin
              ? "Sign in to access the Resource Guide"
              : "Join the Resource Guide community"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm space-y-1">
                {errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="text-xs space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• At least 1 uppercase letter</li>
                  <li>• At least 1 number</li>
                  <li>• At least 2 special characters (!@#$%^&*)</li>
                </ul>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors([]);
                setEmail("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
