"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import { ThemeToggle } from "./theme-toggle"
import { signIn, signUp } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const validateForm = () => {
    if (!email || !password) {
      setError("Please fill in all fields")
      return false
    }
    
    if (!email.includes("@")) {
      setError("Please enter a valid email address")
      return false
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return false
    }
    
    return true
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const { data, error } = await signIn(email, password)
      
      if (error) {
        setError(error.message || "Failed to sign in")
        toast({
          title: "Error",
          description: error.message || "Failed to sign in",
          variant: "destructive",
        })
      } else if (data?.user) {
        toast({
          title: "Welcome back! ✨",
          description: "Signed in successfully!",
        })
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Sign in error:", err)
    }
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateForm()) return
    
    setLoading(true)
    
    try {
      const { data, error } = await signUp(email, password)
      
      if (error) {
        setError(error.message || "Failed to create account")
        toast({
          title: "Error",
          description: error.message || "Failed to create account",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account created! 🎉",
          description: "Please check your email to verify your account.",
        })
        setEmail("")
        setPassword("")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Sign up error:", err)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen minimalist-bg-light dark:minimalist-bg-dark flex items-center justify-center p-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md minimalist-animate-in">
        <Card className="minimalist-card">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-md">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">
                VocabMaster
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-muted-foreground">
                Master your vocabulary with smart learning
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger 
                  value="signin" 
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <LogIn className="h-4 w-4 mr-2 text-blue-600" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all"
                >
                  <UserPlus className="h-4 w-4 mr-2 text-green-600" />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4 mt-6">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-border focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-border focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 minimalist-button rounded-xl font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 border-border focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 border-border focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 minimalist-button rounded-xl font-medium"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
