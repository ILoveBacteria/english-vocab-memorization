"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Eye, Calendar, Target, TrendingUp, BookOpen, EyeOff } from "lucide-react"
import { supabase, type Word } from "@/lib/supabase"
import { AddWordModal } from "./add-word-modal"
import { WordDetailModal } from "./word-detail-modal"
import { CSVImportModal } from "./csv-import-modal"
import { CSVExportButton } from "./csv-export-button"
import { formatDistanceToNow } from "date-fns"

const WORDS_PER_PAGE = 8

export function WordList() {
  const [words, setWords] = useState<Word[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalWords, setTotalWords] = useState(0)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [hiddenMeanings, setHiddenMeanings] = useState<Set<string>>(new Set())

  const totalPages = Math.ceil(totalWords / WORDS_PER_PAGE)

  const fetchWords = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const from = (currentPage - 1) * WORDS_PER_PAGE
    const to = from + WORDS_PER_PAGE - 1

    const { data, error, count } = await supabase
      .from("words")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to)

    if (!error && data) {
      setWords(data)
      setTotalWords(count || 0)
      // Hide all meanings by default
      setHiddenMeanings(new Set(data.map((word) => word.id)))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchWords()
  }, [currentPage])

  const toggleMeaningVisibility = (wordId: string) => {
    setHiddenMeanings((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(wordId)) {
        newSet.delete(wordId)
      } else {
        newSet.add(wordId)
      }
      return newSet
    })
  }

  const getAccuracyPercentage = (correct: number, total: number) => {
    if (total === 0) return 0
    return Math.round((correct / total) * 100)
  }

  const getAccuracyColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-100 dark:bg-green-900/30"
    if (percentage >= 60) return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30"
    return "text-red-600 bg-red-100 dark:bg-red-900/30"
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="minimalist-word-card animate-pulse">
            <CardContent className="p-4 sm:p-6">
              <div className="h-6 bg-muted rounded-lg w-1/4 mb-3"></div>
              <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded-full w-20"></div>
                <div className="h-6 bg-muted rounded-full w-24"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">My Vocabulary</h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {totalWords} word{totalWords !== 1 ? "s" : ""} in your collection
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <CSVImportModal onWordsImported={fetchWords} />
          <CSVExportButton />
          <AddWordModal onWordAdded={fetchWords} />
        </div>
      </div>

      {words.length === 0 ? (
        <Card className="minimalist-card">
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">No words yet</h3>
            <p className="text-muted-foreground mb-6 text-base sm:text-lg max-w-md mx-auto">
              Start building your vocabulary by adding your first word!
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <CSVImportModal onWordsImported={fetchWords} />
              <AddWordModal onWordAdded={fetchWords} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:gap-6">
            {words.map((word, index) => {
              const accuracy = getAccuracyPercentage(word.correct_answers, word.total_attempts)
              const isMeaningHidden = hiddenMeanings.has(word.id)

              return (
                <Card
                  key={word.id}
                  className="minimalist-word-card group hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 truncate">
                          {word.english_word}
                        </h3>

                        <div className="flex items-center gap-2 mb-4">
                          {isMeaningHidden ? (
                            <div className="flex items-center gap-2">
                              <div className="text-muted-foreground text-base sm:text-lg">
                                {"•".repeat(word.persian_meaning.length)}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMeaningVisibility(word.id)}
                                className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                              >
                                <Eye className="h-4 w-4 text-blue-500" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <p className="text-muted-foreground text-base sm:text-lg">{word.persian_meaning}</p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleMeaningVisibility(word.id)}
                                className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg"
                              >
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              </Button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                          <Badge
                            variant="secondary"
                            className={`flex items-center gap-2 px-3 py-1 rounded-full ${getAccuracyColor(accuracy)}`}
                          >
                            <TrendingUp className="h-4 w-4" />
                            {accuracy}% accuracy
                          </Badge>
                          <Badge
                            variant="outline"
                            className="px-3 py-1 border-border text-muted-foreground rounded-full"
                          >
                            <Target className="h-4 w-4 mr-1 text-blue-500" />
                            {word.correct_answers}/{word.total_attempts}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-3 py-1 border-border text-muted-foreground rounded-full"
                          >
                            <Calendar className="h-4 w-4 text-purple-500" />
                            <span className="hidden sm:inline">
                              {formatDistanceToNow(new Date(word.created_at), { addSuffix: true })}
                            </span>
                            <span className="sm:hidden">
                              {formatDistanceToNow(new Date(word.created_at), { addSuffix: true }).replace(" ago", "")}
                            </span>
                          </Badge>
                        </div>

                        {word.example_sentences && word.example_sentences.length > 0 && (
                          <div className="text-muted-foreground bg-muted/50 p-3 sm:p-4 rounded-xl text-sm sm:text-base">
                            <strong className="text-foreground">Example:</strong> {word.example_sentences[0]}
                            {word.example_sentences.length > 1 && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                                (+{word.example_sentences.length - 1} more)
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:gap-4 lg:ml-6">
                        <div className="flex items-center gap-2 lg:gap-3">
                          <div
                            className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full ${
                              accuracy >= 80 ? "bg-green-500" : accuracy >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-base lg:text-lg font-bold text-foreground">{accuracy}%</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedWord(word)}
                          className="flex items-center gap-2 border-border hover:bg-muted/50 rounded-xl group-hover:scale-105 transition-all"
                        >
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="border-border hover:bg-muted/50 rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1 sm:gap-2">
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-xl ${
                          currentPage === page ? "minimalist-button" : "border-border hover:bg-muted/50"
                        }`}
                      >
                        {page}
                      </Button>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-1 sm:px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return null
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="border-border hover:bg-muted/50 rounded-xl"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}

      {selectedWord && (
        <WordDetailModal
          word={selectedWord}
          open={!!selectedWord}
          onClose={() => setSelectedWord(null)}
          onWordUpdated={fetchWords}
        />
      )}
    </div>
  )
}
