"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, BookOpen, Type, Languages, FileText } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface AddWordModalProps {
  onWordAdded: () => void
}

export function AddWordModal({ onWordAdded }: AddWordModalProps) {
  const [open, setOpen] = useState(false)
  const [englishWord, setEnglishWord] = useState("")
  const [persianMeaning, setPersianMeaning] = useState("")
  const [englishMeaning, setEnglishMeaning] = useState("")
  const [exampleSentences, setExampleSentences] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add words",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const filteredSentences = exampleSentences.filter((sentence) => sentence.trim() !== "")

    const { error } = await supabase.from("words").insert({
      user_id: user.id,
      english_word: englishWord.trim(),
      persian_meaning: persianMeaning.trim(),
      english_meaning: englishMeaning.trim(),
      example_sentences: filteredSentences,
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add word",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success! 🎉",
        description: "Word added to your vocabulary!",
      })
      setEnglishWord("")
      setPersianMeaning("")
      setEnglishMeaning("")
      setExampleSentences([])
      setOpen(false)
      onWordAdded()
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="minimalist-button rounded-xl h-11 px-4 sm:px-6 font-medium">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Add Word</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] minimalist-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">Add New Word</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Add a new English word with its Persian meaning and optional example sentences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-6">
            <div className="space-y-3">
              <Label htmlFor="english-word" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Type className="h-4 w-4 text-blue-500" />
                English Word *
              </Label>
              <Input
                id="english-word"
                value={englishWord}
                onChange={(e) => setEnglishWord(e.target.value)}
                placeholder="Enter English word"
                className="h-12 border-border focus:border-blue-500 focus:ring-blue-500/20 rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="persian-meaning" className="text-sm font-medium text-foreground flex items-center gap-2">
                <Languages className="h-4 w-4 text-purple-500" />
                Persian Meaning *
              </Label>
              <Input
                id="persian-meaning"
                value={persianMeaning}
                onChange={(e) => setPersianMeaning(e.target.value)}
                placeholder="Enter Persian meaning"
                className="h-12 border-border focus:border-purple-500 focus:ring-purple-500/20 rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="english-meaning" className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                English Meaning *
              </Label>
              <Input
                id="english-meaning"
                value={englishMeaning}
                onChange={(e) => setEnglishMeaning(e.target.value)}
                placeholder="Enter English meaning/definition"
                className="h-12 border-border focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all"
                required
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  Example Sentences (Optional)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExampleSentence}
                  className="flex items-center gap-2 border-border hover:bg-muted/50 rounded-lg transition-all bg-transparent"
                >
                  <Plus className="h-3 w-3" />
                  Add Example
                </Button>
              </div>
              {exampleSentences.map((sentence, index) => (
                <div key={index} className="flex gap-3">
                  <Textarea
                    value={sentence}
                    onChange={(e) => updateExampleSentence(index, e.target.value)}
                    placeholder={`Example sentence ${index + 1}`}
                    className="min-h-[80px] border-border focus:border-green-500 focus:ring-green-500/20 rounded-xl resize-none transition-all"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExampleSentence(index)}
                    className="shrink-0 h-10 w-10 p-0 border-border hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950/50 rounded-lg transition-all"
                  >
                    <X className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-border hover:bg-muted/50 rounded-xl transition-all"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="minimalist-button rounded-xl px-6">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Word
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
