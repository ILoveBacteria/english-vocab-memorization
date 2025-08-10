"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Check, X, Trophy, RotateCcw, HelpCircle } from 'lucide-react'
import { supabase, type Word } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface QuizModeProps {
  onBack: () => void
}

type QuizType = 'text' | 'multiple-choice'
type QuizQuestion = {
  word: Word
  options?: string[]
  correctAnswer: string
}

export function QuizMode({ onBack }: QuizModeProps) {
  const [words, setWords] = useState<Word[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [selectedOption, setSelectedOption] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quizType, setQuizType] = useState<QuizType>('text')
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })
  const [quizComplete, setQuizComplete] = useState(false)

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  useEffect(() => {
    fetchWords()
  }, [])

  const fetchWords = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('words')
      .select('*')
      .eq('user_id', user.id)

    if (!error && data && data.length > 0) {
      setWords(data)
      generateQuestions(data)
    }
    
    setLoading(false)
  }

  const generateQuestions = (wordList: Word[]) => {
    // Shuffle words
    const shuffled = [...wordList].sort(() => Math.random() - 0.5)
    
    const quizQuestions: QuizQuestion[] = shuffled.map(word => {
      const question: QuizQuestion = {
        word,
        correctAnswer: word.persian_meaning
      }

      // For multiple choice, generate wrong options
      if (quizType === 'multiple-choice') {
        const wrongOptions = wordList
          .filter(w => w.id !== word.id)
          .map(w => w.persian_meaning)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
        
        const allOptions = [word.persian_meaning, ...wrongOptions]
          .sort(() => Math.random() - 0.5)
        
        question.options = allOptions
      }

      return question
    })

    setQuestions(quizQuestions)
  }

  const checkAnswer = () => {
    if (!currentQuestion) return

    const answer = quizType === 'text' ? userAnswer.trim().toLowerCase() : selectedOption.toLowerCase()
    const correct = answer === currentQuestion.correctAnswer.toLowerCase()
    
    setIsCorrect(correct)
    setShowResult(true)
    
    // Update session stats
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }))
  }

  const recordAttempt = async (correct: boolean) => {
    if (!currentQuestion) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Record the attempt
    await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      word_id: currentQuestion.word.id,
      is_correct: correct,
      attempt_type: 'quiz'
    })

    // Update word statistics
    const newTotalAttempts = currentQuestion.word.total_attempts + 1
    const newCorrectAnswers = currentQuestion.word.correct_answers + (correct ? 1 : 0)

    await supabase
      .from('words')
      .update({
        total_attempts: newTotalAttempts,
        correct_answers: newCorrectAnswers,
        updated_at: new Date().toISOString()
      })
      .eq('id', currentQuestion.word.id)
  }

  const nextQuestion = async () => {
    await recordAttempt(isCorrect)
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setUserAnswer("")
      setSelectedOption("")
      setShowResult(false)
    } else {
      setQuizComplete(true)
    }
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setUserAnswer("")
    setSelectedOption("")
    setShowResult(false)
    setSessionStats({ correct: 0, total: 0 })
    setQuizComplete(false)
    generateQuestions(words)
  }

  const switchQuizType = (type: QuizType) => {
    setQuizType(type)
    setCurrentIndex(0)
    setUserAnswer("")
    setSelectedOption("")
    setShowResult(false)
    setSessionStats({ correct: 0, total: 0 })
    setQuizComplete(false)
    generateQuestions(words)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
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

  if (quizComplete) {
    const percentage = Math.round((sessionStats.correct / sessionStats.total) * 100)
    
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 minimalist-animate-in">
        <Card className="minimalist-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-foreground">
              <Trophy className="h-8 w-8 text-yellow-500" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-6xl font-bold text-primary">
              {percentage}%
            </div>
            <div className="text-lg text-muted-foreground">
              You got {sessionStats.correct} out of {sessionStats.total} questions correct
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-foreground">{sessionStats.total}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{sessionStats.total - sessionStats.correct}</div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={onBack} className="border-border hover:bg-muted/50 rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2 text-blue-500" />
                Back to Dashboard
              </Button>
              <Button onClick={resetQuiz} className="minimalist-button">
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Quiz Again
              </Button>
            </div>
          </CardContent>
        </Card>
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
            {currentIndex + 1} / {questions.length}
          </Badge>
          <Badge variant="secondary" className="bg-muted/50 text-foreground">
            Score: {sessionStats.correct}/{sessionStats.total}
          </Badge>
        </div>
      </div>

      <div className="flex justify-center gap-2">
        <Button
          variant={quizType === 'text' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchQuizType('text')}
          className={quizType === 'text' ? 'minimalist-button' : 'border-border hover:bg-muted/50'}
        >
          Text Input
        </Button>
        <Button
          variant={quizType === 'multiple-choice' ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchQuizType('multiple-choice')}
          className={quizType === 'multiple-choice' ? 'minimalist-button' : 'border-border hover:bg-muted/50'}
        >
          Multiple Choice
        </Button>
      </div>

      <Progress value={progress} className="w-full" />

      <Card className="minimalist-card">
        <CardHeader>
          <CardTitle className="text-center text-foreground flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-orange-500" />
            What is the Persian meaning of:
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-primary mb-4">
              {currentQuestion?.word.english_word}
            </h2>
          </div>

          {!showResult ? (
            <div className="space-y-4">
              {quizType === 'text' ? (
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-foreground">Your Answer</Label>
                  <Input
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Enter the Persian meaning"
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                    className="border-border focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label className="text-foreground">Choose the correct answer:</Label>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    {currentQuestion?.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer text-foreground">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              <Button 
                onClick={checkAnswer} 
                className="w-full minimalist-button"
                disabled={quizType === 'text' ? !userAnswer.trim() : !selectedOption}
              >
                Submit Answer
              </Button>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className={`flex items-center justify-center gap-2 text-lg font-medium ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg text-foreground">
                <p className="text-sm text-muted-foreground mb-1">Correct answer:</p>
                <p className="text-lg font-medium">{currentQuestion?.correctAnswer}</p>
              </div>

              {currentQuestion?.word.example_sentences && currentQuestion.word.example_sentences.length > 0 && (
                <div className="p-4 bg-muted/50 rounded-lg text-left text-foreground">
                  <p className="text-sm text-muted-foreground mb-2">Example sentences:</p>
                  {currentQuestion.word.example_sentences.map((sentence, index) => (
                    <p key={index} className="text-sm italic mb-1">
                      • {sentence}
                    </p>
                  ))}
                </div>
              )}

              <Button onClick={nextQuestion} className="w-full minimalist-button">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
