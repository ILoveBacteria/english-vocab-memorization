"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, Check, X, ArrowLeft, Lightbulb, BookOpen } from 'lucide-react'
import { supabase, type Word } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface FlashcardModeProps {
  onBack: () => void
}

export function FlashcardMode({ onBack }: FlashcardModeProps) {
  const [words, setWords] = useState<Word[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: true })

      if (error) {
        console.error('Error fetching words:', error)
        toast({
          title: "Error",
          description: "Failed to load words",
          variant: "destructive",
        })
      } else if (data) {
        // Shuffle the words for variety
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setWords(shuffled)
      }
    } catch (err) {
      console.error('Unexpected error fetching words:', err)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const recordAttempt = async (isCorrect: boolean) => {
    if (!currentWord) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Record the attempt
      const { error: attemptError } = await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        word_id: currentWord.id,
        is_correct: isCorrect,
        attempt_type: 'flashcard'
      })

      if (attemptError) {
        console.error('Error recording attempt:', attemptError)
      }

      // Update word statistics
      const newTotalAttempts = (currentWord.total_attempts || 0) + 1
      const newCorrectAnswers = (currentWord.correct_answers || 0) + (isCorrect ? 1 : 0)

      const { error: updateError } = await supabase
        .from('words')
        .update({
          total_attempts: newTotalAttempts,
          correct_answers: newCorrectAnswers,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentWord.id)

      if (updateError) {
        console.error('Error updating word stats:', updateError)
      }

      // Update session stats
      setSessionStats(prev => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1
      }))

      // Move to next card
      nextCard()
    } catch (err) {
      console.error('Unexpected error recording attempt:', err)
    }
  }

  const nextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    } else {
      // Session complete
      const finalCorrect = sessionStats.correct + (sessionStats.total === words.length - 1 ? 1 : 0)
      toast({
        title: "Session Complete!",
        description: `You got ${finalCorrect} out of ${words.length} cards correct.`,
      })
      onBack()
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setSessionStats({ correct: 0, total: 0 })
    fetchWords() // Reshuffle
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2 text-foreground">No words available</h3>
        <p className="text-muted-foreground mb-4">Add some words to your vocabulary first!</p>
        <Button onClick={onBack} className="minimalist-button">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 minimalist-animate-in">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="border-border hover:bg-muted/50 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2 text-blue-500" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-border text-muted-foreground">
            {currentIndex + 1} / {words.length}
          </Badge>
          <Badge variant="secondary" className="bg-muted/50 text-foreground">
            Score: {sessionStats.correct}/{sessionStats.total}
          </Badge>
          <Button variant="outline" size="sm" onClick={resetSession} className="border-border hover:bg-muted/50 rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2 text-purple-500" />
            Reset
          </Button>
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <div className="relative">
        <Card 
          className={`min-h-96 cursor-pointer transition-all duration-300 minimalist-card ${
            isFlipped ? 'bg-muted/20' : ''
          } hover:shadow-md hover:translate-y-[-2px]`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex items-center justify-center p-12 text-center min-h-96">
            {!isFlipped ? (
              <div>
                <Lightbulb className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {currentWord.english_word}
                </h2>
                <p className="text-muted-foreground">Click to reveal meaning</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  {currentWord.english_word}
                </h2>
                <div className="text-2xl text-muted-foreground">
                  {currentWord.persian_meaning}
                </div>
                {currentWord.example_sentences && currentWord.example_sentences.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Examples:</h4>
                    {currentWord.example_sentences.map((sentence, index) => (
                      <p key={index} className="text-sm italic bg-muted/50 p-3 rounded-lg text-foreground">
                        {sentence}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isFlipped && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => recordAttempt(false)}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:hover:bg-red-950/50 rounded-xl"
          >
            <X className="h-5 w-5" />
            I didn't know
          </Button>
          <Button
            size="lg"
            onClick={() => recordAttempt(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl"
          >
            <Check className="h-5 w-5" />
            I knew this
          </Button>
        </div>
      )}
    </div>
  )
}
