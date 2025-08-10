"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Target, TrendingUp, LogOut, User, Menu, X } from "lucide-react"
import { WordList } from "./word-list"
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { ThemeToggle } from "./theme-toggle"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalWords: 0,
    averageAccuracy: 0,
    totalAttempts: 0,
  })
  const [currentMode, setCurrentMode] = useState<"list" | "flashcard" | "quiz">("list")
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchStats()
  }, [])

  const checkUser = async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      router.push("/")
      return
    }

    setUser(user)
    setLoading(false)
  }

  const fetchStats = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data: words, error } = await supabase
      .from("words")
      .select("total_attempts, correct_answers")
      .eq("user_id", user.id)

    if (!error && words) {
      const totalWords = words.length
      const totalAttempts = words.reduce((sum, word) => sum + word.total_attempts, 0)
      const totalCorrect = words.reduce((sum, word) => sum + word.correct_answers, 0)
      const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

      setStats({
        totalWords,
        averageAccuracy,
        totalAttempts,
      })
    }
  }

  const handleSignOut = async () => {
    const { error } = await signOut()

    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Signed out successfully! 👋",
        description: "See you next time!",
      })
      router.push("/")
    }
  }

  const handleModeChange = (mode: "list" | "flashcard" | "quiz") => {
    setCurrentMode(mode)
    setMobileMenuOpen(false)
    if (mode !== "list") {
      fetchStats() // Refresh stats when entering practice modes
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">VocabMaster</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Welcome back, {user?.email?.split("@")[0]}!
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={currentMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("list")}
                className={`rounded-xl ${currentMode === "list" ? "minimalist-button" : "hover:bg-muted/50"}`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                My Words
              </Button>
              <Button
                variant={currentMode === "flashcard" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("flashcard")}
                className={`rounded-xl ${currentMode === "flashcard" ? "minimalist-button" : "hover:bg-muted/50"}`}
              >
                <Brain className="h-4 w-4 mr-2" />
                Flashcards
              </Button>
              <Button
                variant={currentMode === "quiz" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("quiz")}
                className={`rounded-xl ${currentMode === "quiz" ? "minimalist-button" : "hover:bg-muted/50"}`}
              >
                <Target className="h-4 w-4 mr-2" />
                Quiz
              </Button>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/profile")}
                className="hover:bg-muted/50 rounded-xl"
              >
                <User className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="hover:bg-muted/50 rounded-xl text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="hover:bg-muted/50 rounded-xl"
              >
                {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-2">
              <Button
                variant={currentMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("list")}
                className={`w-full justify-start rounded-xl ${currentMode === "list" ? "minimalist-button" : "hover:bg-muted/50"}`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                My Words
              </Button>
              <Button
                variant={currentMode === "flashcard" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("flashcard")}
                className={`w-full justify-start rounded-xl ${currentMode === "flashcard" ? "minimalist-button" : "hover:bg-muted/50"}`}
              >
                <Brain className="h-4 w-4 mr-2" />
                Flashcards
              </Button>
              <Button
                variant={currentMode === "quiz" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("quiz")}
                className={`w-full justify-start rounded-xl ${currentMode === "quiz" ? "minimalist-button" : "hover:bg-muted/50"}`}
              >
                <Target className="h-4 w-4 mr-2" />
                Quiz
              </Button>
              <div className="border-t border-border pt-2 mt-2 space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    router.push("/profile")
                    setMobileMenuOpen(false)
                  }}
                  className="w-full justify-start hover:bg-muted/50 rounded-xl"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="w-full justify-start hover:bg-muted/50 rounded-xl text-red-600 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentMode === "list" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="minimalist-stats-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Total Words
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalWords}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Words in your vocabulary</p>
                </CardContent>
              </Card>

              <Card className="minimalist-stats-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Average Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.averageAccuracy}%</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Overall performance</p>
                </CardContent>
              </Card>

              <Card className="minimalist-stats-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Total Attempts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalAttempts}</div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Practice sessions completed</p>
                </CardContent>
              </Card>
            </div>

            <WordList />
          </>
        )}

        {currentMode === "flashcard" && <FlashcardMode />}
        {currentMode === "quiz" && <QuizMode />}
      </main>
    </div>
  )
}
