"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Edit,
  Trash2,
  Plus,
  X,
  Calendar,
  Target,
  TrendingUp,
  Type,
  Languages,
  FileText,
  Eye,
  EyeOff,
} from "lucide-react"
import { supabase, type Word } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface WordDetailModalProps {
  word: Word
  open: boolean
  onClose: () => void
  onWordUpdated: () => void
}

export function WordDetailModal({ word, open, onClose, onWordUpdated }: WordDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [englishWord, setEnglishWord] = useState(word.english_word)
  const [persianMeaning, setPersianMeaning] = useState(word.persian_meaning)
  const [exampleSentences, setExampleSentences] = useState<string[]>(word.example_sentences || [])
  const [loading, setLoading] = useState(false)
  const [isMeaningHidden, setIsMeaningHidden] = useState(true)

  const accuracy = word.total_attempts > 0 ? Math.round((word.correct_answers / word.total_attempts) * 100) : 0

  const addExampleSentence = () => {
    setExampleSentences([...exampleSentences, ""])
  }

  const updateExampleSentence = (index: number, value: string) => {
    const updated = [...exampleSentences]
    updated[index] = value
    setExampleSentences(updated)
  }

  const removeExampleSentence = (index: number) => {
    setExampleSentences(exampleSentences.filter((_, i) => i !== index))
  }

  const handleUpdate = async () => {
    setLoading(true)

    const filteredSentences = exampleSentences.filter((sentence) => sentence.trim() !== "")

    const { error } = await supabase
      .from("words")
      .update({
        english_word: englishWord.trim(),
        persian_meaning: persianMeaning.trim(),
        example_sentences: filteredSentences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", word.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update word",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Word updated successfully!",
      })
      setIsEditing(false)
      onWordUpdated()
    }

    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)

    const { error } = await supabase.from("words").delete().eq("id", word.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete word",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Word deleted successfully!",
      })
      onClose()
      onWordUpdated()
    }

    setLoading(false)
  }

  const resetForm = () => {
    setEnglishWord(word.english_word)
    setPersianMeaning(word.persian_meaning)
    setExampleSentences(word.example_sentences || [])
    setIsEditing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto minimalist-card">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-foreground">
            <span>Word Details</span>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 border-border hover:bg-muted/50 rounded-xl"
                  >
                    <Edit className="h-3 w-3 text-blue-500" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 border-border text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl bg-transparent"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="minimalist-card">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          This action cannot be undone. This will permanently delete the word "{word.english_word}" and
                          all its associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border hover:bg-muted/50 rounded-xl">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-english-word" className="text-foreground flex items-center gap-2">
                  <Type className="h-4 w-4 text-blue-500" />
                  English Word *
                </Label>
                <Input
                  id="edit-english-word"
                  value={englishWord}
                  onChange={(e) => setEnglishWord(e.target.value)}
                  placeholder="Enter English word"
                  className="h-10 border-border focus:border-blue-500 focus:ring-blue-500/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-persian-meaning" className="text-foreground flex items-center gap-2">
                  <Languages className="h-4 w-4 text-purple-500" />
                  Persian Meaning *
                </Label>
                <Input
                  id="edit-persian-meaning"
                  value={persianMeaning}
                  onChange={(e) => setPersianMeaning(e.target.value)}
                  placeholder="Enter Persian meaning"
                  className="h-10 border-border focus:border-purple-500 focus:ring-purple-500/20 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    Example Sentences
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addExampleSentence}
                    className="flex items-center gap-1 border-border hover:bg-muted/50 rounded-lg bg-transparent"
                  >
                    <Plus className="h-3 w-3" />
                    Add Example
                  </Button>
                </div>
                {exampleSentences.map((sentence, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={sentence}
                      onChange={(e) => updateExampleSentence(index, e.target.value)}
                      placeholder={`Example sentence ${index + 1}`}
                      className="min-h-[60px] border-border focus:border-green-500 focus:ring-green-500/20 rounded-xl resize-none"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeExampleSentence(index)}
                      className="shrink-0 h-9 w-9 p-0 border-border hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 rounded-lg"
                    >
                      <X className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2 break-words">{word.english_word}</h3>

                <div className="flex items-start gap-2 mb-4">
                  {isMeaningHidden ? (
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-muted-foreground">
                        {"•".repeat(Math.min(word.persian_meaning.length, 20))}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMeaningHidden(false)}
                        className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg shrink-0"
                      >
                        <Eye className="h-4 w-4 text-blue-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-lg text-muted-foreground break-words flex-1">{word.persian_meaning}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMeaningHidden(true)}
                        className="h-8 w-8 p-0 hover:bg-muted/50 rounded-lg shrink-0"
                      >
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge
                    variant="secondary"
                    className={`flex items-center gap-1 rounded-full ${
                      accuracy >= 80
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                        : accuracy >= 60
                          ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
                    }`}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {accuracy}% accuracy
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 border-border text-muted-foreground rounded-full"
                  >
                    <Target className="h-3 w-3 text-blue-500" />
                    {word.correct_answers}/{word.total_attempts} correct
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    Created
                  </Label>
                  <p className="mt-1 text-foreground">
                    {formatDistanceToNow(new Date(word.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    Last Updated
                  </Label>
                  <p className="mt-1 text-foreground">
                    {formatDistanceToNow(new Date(word.updated_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {word.example_sentences && word.example_sentences.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-muted-foreground mb-2 block flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      Example Sentences
                    </Label>
                    <div className="space-y-2">
                      {word.example_sentences.map((sentence, index) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-lg text-foreground">
                          <p className="text-sm break-words">{sentence}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <Label className="text-muted-foreground mb-2 block flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  Learning Statistics
                </Label>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground">{word.total_attempts}</div>
                    <div className="text-xs text-muted-foreground">Total Attempts</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{word.correct_answers}</div>
                    <div className="text-xs text-muted-foreground">Correct</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                    <div className="text-xs text-muted-foreground">Accuracy</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-border hover:bg-muted/50 rounded-xl bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={loading} className="minimalist-button rounded-xl">
                {loading ? "Updating..." : "Update Word"}
              </Button>
            </>
          ) : (
            <Button onClick={onClose} className="minimalist-button rounded-xl">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
