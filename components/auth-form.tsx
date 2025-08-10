"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { BookOpen, Mail, Lock, LogIn, UserPlus, Github, Apple } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { signIn, signUp, signInWithProvider } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function AuthForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
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

  const handleSocialSignIn = async (provider: "github" | "google" | "apple") => {
    setSocialLoading(provider)
    setError("")

    try {
      const { error } = await signInWithProvider(provider)

      if (error) {
        setError(error.message || `Failed to sign in with ${provider}`)
        toast({
          title: "Error",
          description: error.message || `Failed to sign in with ${provider}`,
          variant: "destructive",
        })
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error(`${provider} sign in error:`, err)
    }

    setSocialLoading(null)
  }

  const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
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
              <CardTitle className="text-3xl font-bold text-foreground">VocabMaster</CardTitle>
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
                {/* Social Sign In Options */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl transition-all bg-transparent"
                    onClick={() => handleSocialSignIn("google")}
                    disabled={socialLoading === "google"}
                  >
                    {socialLoading === "google" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="ml-2">Sign in with Google</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl transition-all bg-transparent"
                    onClick={() => handleSocialSignIn("github")}
                    disabled={socialLoading === "github"}
                  >
                    {socialLoading === "github" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                    <span className="ml-2">Sign in with GitHub</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl transition-all bg-transparent"
                    onClick={() => handleSocialSignIn("apple")}
                    disabled={socialLoading === "apple"}
                  >
                    {socialLoading === "apple" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                    ) : (
                      <Apple className="h-4 w-4" />
                    )}
                    <span className="ml-2">Sign in with Apple</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

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
                {/* Social Sign Up Options */}
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl transition-all bg-transparent"
                    onClick={() => handleSocialSignIn("google")}
                    disabled={socialLoading === "google"}
                  >
                    {socialLoading === "google" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                    ) : (
                      <GoogleIcon />
                    )}
                    <span className="ml-2">Sign up with Google</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl transition-all bg-transparent"
                    onClick={() => handleSocialSignIn("github")}
                    disabled={socialLoading === "github"}
                  >
                    {socialLoading === "github" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                    <span className="ml-2">Sign up with GitHub</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-border hover:bg-muted/50 rounded-xl transition-all bg-transparent"
                    onClick={() => handleSocialSignIn("apple")}
                    disabled={socialLoading === "apple"}
                  >
                    {socialLoading === "apple" ? (
                      <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin mr-2" />
                    ) : (
                      <Apple className="h-4 w-4" />
                    )}
                    <span className="ml-2">Sign up with Apple</span>
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

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
