"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Brain, Target, LogOut, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { ThemeToggle } from "./theme-toggle"
import { WordList } from "./word-list"
import { FlashcardMode } from "./flashcard-mode"
import { QuizMode } from "./quiz-mode"
import { supabase } from "@/lib/supabase"
import { signOut } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

type DashboardView = 'words' | 'flashcards' | 'quiz'

export function Dashboard() {
const [currentView, setCurrentView] = useState<DashboardView>('words')
const [user, setUser] = useState<any>(null)
const [stats, setStats] = useState({
  totalWords: 0,
  averageAccuracy: 0,
  totalAttempts: 0
})
const [loading, setLoading] = useState(true)
const router = useRouter()

useEffect(() => {
  getCurrentUser()
  fetchStats()
}, [])

const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error)
      router.push('/')
      return
    }
    setUser(user)
  } catch (err) {
    console.error('Unexpected error getting user:', err)
    router.push('/')
  }
}

const fetchStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: words, error } = await supabase
      .from('words')
      .select('total_attempts, correct_answers')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching stats:', error)
    } else if (words) {
      const totalWords = words.length
      const totalAttempts = words.reduce((sum, word) => sum + (word.total_attempts || 0), 0)
      const totalCorrect = words.reduce((sum, word) => sum + (word.correct_answers || 0), 0)
      const averageAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0

      setStats({
        totalWords,
        averageAccuracy,
        totalAttempts
      })
    }
  } catch (err) {
    console.error('Unexpected error fetching stats:', err)
  } finally {
    setLoading(false)
  }
}

const handleSignOut = async () => {
  try {
    const { error } = await signOut()
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    } else {
      toast({
        title: "See you later! 👋",
        description: "Signed out successfully",
      })
      router.push("/")
    }
  } catch (err) {
    console.error('Unexpected error signing out:', err)
    toast({
      title: "Error",
      description: "An unexpected error occurred",
      variant: "destructive",
    })
  }
}

const renderCurrentView = () => {
  switch (currentView) {
    case 'flashcards':
      return <FlashcardMode onBack={() => setCurrentView('words')} />
    case 'quiz':
      return <QuizMode onBack={() => setCurrentView('words')} />
    default:
      return <WordList />
  }
}

if (loading) {
  return (
    <div className="min-h-screen minimalist-bg-light dark:minimalist-bg-dark flex items-center justify-center">
      <div className="text-center minimalist-animate-in">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
        <p className="text-muted-foreground text-lg">Loading your vocabulary...</p>
      </div>
    </div>
  )
}

return (
  <div className="min-h-screen minimalist-bg-light dark:minimalist-bg-dark">
    <header className="minimalist-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                VocabMaster
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! ✨
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSignOut}
              className="border-border hover:bg-muted/50 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4 mr-2 text-red-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {currentView === 'words' && (
        <div className="space-y-6 sm:space-y-8 minimalist-animate-in">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="minimalist-stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Words</CardTitle>
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalWords}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Words in your collection
                </p>
              </CardContent>
            </Card>
            
            <Card className="minimalist-stats-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Accuracy</CardTitle>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.averageAccuracy}%</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall performance
                </p>
              </CardContent>
            </Card>
            
            <Card className="minimalist-stats-card sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.totalAttempts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Practice sessions completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card 
              className="minimalist-card cursor-pointer group hover:shadow-md hover:translate-y-[-2px] transition-all duration-300" 
              onClick={() => setCurrentView('flashcards')}
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Flashcard Mode
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Practice with interactive flashcards. See the English word and try to recall the Persian meaning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full minimalist-button rounded-xl h-11 font-medium">
                  <Brain className="h-4 w-4 mr-2" />
                  Start Flashcards
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="minimalist-card cursor-pointer group hover:shadow-md hover:translate-y-[-2px] transition-all duration-300" 
              onClick={() => setCurrentView('quiz')}
            >
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Quiz Mode
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Test your knowledge with text input or multiple-choice questions and track your progress.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full minimalist-button rounded-xl h-11 font-medium">
                  <Zap className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="minimalist-scale-in">
        {renderCurrentView()}
      </div>
    </main>
  </div>
)
}
