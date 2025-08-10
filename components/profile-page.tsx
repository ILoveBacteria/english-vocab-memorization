"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { User, Lock, Github, Apple, Link, Unlink, ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { supabase } from "@/lib/supabase"
import { updatePassword, linkProvider, unlinkProvider } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [linkLoading, setLinkLoading] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [connectedProviders, setConnectedProviders] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setLoading(true)

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      router.push("/")
      return
    }

    setUser(user)

    // Get connected providers
    const providers = user.app_metadata?.providers || []
    setConnectedProviders(providers)

    setLoading(false)
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all password fields")
      return
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await updatePassword(newPassword)

      if (error) {
        setError(error.message || "Failed to update password")
        toast({
          title: "Error",
          description: error.message || "Failed to update password",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Password updated! 🔒",
          description: "Your password has been successfully updated",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err) {
      setError("An unexpected error occurred")
      console.error("Password update error:", err)
    }

    setPasswordLoading(false)
  }

  const handleLinkProvider = async (provider: "github" | "google" | "apple") => {
    setLinkLoading(provider)

    try {
      const { error } = await linkProvider(provider)

      if (error) {
        toast({
          title: "Error",
          description: error.message || `Failed to connect ${provider}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account connected! 🔗",
          description: `Successfully connected your ${provider} account`,
        })
        fetchUserData()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error(`Link ${provider} error:`, err)
    }

    setLinkLoading(null)
  }

  const handleUnlinkProvider = async (provider: "github" | "google" | "apple") => {
    setLinkLoading(provider)

    try {
      const { error } = await unlinkProvider(provider)

      if (error) {
        toast({
          title: "Error",
          description: error.message || `Failed to disconnect ${provider}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Account disconnected! 🔓",
          description: `Successfully disconnected your ${provider} account`,
        })
        fetchUserData()
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      console.error(`Unlink ${provider} error:`, err)
    }

    setLinkLoading(null)
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

  if (loading) {
    return (
      <div className="min-h-screen minimalist-bg-light dark:minimalist-bg-dark flex items-center justify-center p-4">
        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="border-border hover:bg-muted/50 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Account Information */}
        <Card className="minimalist-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Account Information
            </CardTitle>
            <CardDescription>Your basic account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
              <p className="text-foreground font-medium">{user?.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
              <p className="text-foreground font-medium">{new Date(user?.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card className="minimalist-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 6 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-10 border-border focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                  required
                  minLength={6}
                  disabled={passwordLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                  Confirm New Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 border-border focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                  required
                  disabled={passwordLoading}
                />
              </div>
              <Button type="submit" disabled={passwordLoading} className="minimalist-button rounded-xl">
                {passwordLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Update Password
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Connected Accounts */}
        <Card className="minimalist-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5 text-green-500" />
              Connected Accounts
            </CardTitle>
            <CardDescription>Manage your social account connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <GoogleIcon />
                <div>
                  <p className="font-medium text-foreground">Google</p>
                  <p className="text-sm text-muted-foreground">Connect your Google account for easy sign-in</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectedProviders.includes("google") ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkProvider("google")}
                      disabled={linkLoading === "google"}
                      className="border-border hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 rounded-lg"
                    >
                      {linkLoading === "google" ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Unlink className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkProvider("google")}
                      disabled={linkLoading === "google"}
                      className="border-border hover:bg-muted/50 rounded-lg"
                    >
                      {linkLoading === "google" ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Link className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <Github className="h-4 w-4" />
                <div>
                  <p className="font-medium text-foreground">GitHub</p>
                  <p className="text-sm text-muted-foreground">Connect your GitHub account for easy sign-in</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectedProviders.includes("github") ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkProvider("github")}
                      disabled={linkLoading === "github"}
                      className="border-border hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 rounded-lg"
                    >
                      {linkLoading === "github" ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Unlink className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkProvider("github")}
                      disabled={linkLoading === "github"}
                      className="border-border hover:bg-muted/50 rounded-lg"
                    >
                      {linkLoading === "github" ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Link className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Apple */}
            <div className="flex items-center justify-between p-4 border border-border rounded-xl">
              <div className="flex items-center gap-3">
                <Apple className="h-4 w-4" />
                <div>
                  <p className="font-medium text-foreground">Apple</p>
                  <p className="text-sm text-muted-foreground">Connect your Apple account for easy sign-in</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connectedProviders.includes("apple") ? (
                  <>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkProvider("apple")}
                      disabled={linkLoading === "apple"}
                      className="border-border hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 rounded-lg"
                    >
                      {linkLoading === "apple" ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Unlink className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      <XCircle className="h-3 w-3 mr-1" />
                      Not Connected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLinkProvider("apple")}
                      disabled={linkLoading === "apple"}
                      className="border-border hover:bg-muted/50 rounded-lg"
                    >
                      {linkLoading === "apple" ? (
                        <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <Link className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
