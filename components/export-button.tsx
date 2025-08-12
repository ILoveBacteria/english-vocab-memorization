"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileText, FileJson, ChevronDown } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export function ExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async (format: "csv" | "json") => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to export words",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const { data: words, error } = await supabase
      .from("words")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      toast({
        title: "Export failed",
        description: "Failed to fetch words for export",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (!words || words.length === 0) {
      toast({
        title: "No words to export",
        description: "Add some words to your vocabulary first",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    // Prepare data for export
    const exportData = words.map((word) => ({
      english_word: word.english_word,
      persian_meaning: word.persian_meaning,
      example_sentences: word.example_sentences || [],
      total_attempts: word.total_attempts || 0,
      correct_answers: word.correct_answers || 0,
      created_at: word.created_at,
    }))

    let content: string
    let filename: string
    let mimeType: string

    if (format === "csv") {
      // Create CSV content
      const headers = [
        "english_word",
        "persian_meaning",
        "example_sentences",
        "total_attempts",
        "correct_answers",
        "created_at",
      ]
      content = [
        headers.join(","),
        ...exportData.map((word) =>
          [
            `"${word.english_word}"`,
            `"${word.persian_meaning}"`,
            `"${(word.example_sentences || []).join(";")}"`,
            word.total_attempts,
            word.correct_answers,
            word.created_at,
          ].join(","),
        ),
      ].join("\n")

      filename = `vocabulary_export_${new Date().toISOString().split("T")[0]}.csv`
      mimeType = "text/csv"
    } else {
      // Create JSON content
      content = JSON.stringify(exportData, null, 2)
      filename = `vocabulary_export_${new Date().toISOString().split("T")[0]}.json`
      mimeType = "application/json"
    }

    // Download file
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export successful! 📁",
      description: `Exported ${words.length} words to ${format.toUpperCase()}`,
    })

    setLoading(false)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={loading}
          className="border-border hover:bg-muted/50 rounded-xl h-11 px-4 sm:px-6 font-medium bg-transparent"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Exporting...</span>
            </div>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2 text-blue-600" />
              <span className="hidden sm:inline">Export</span>
              <span className="sm:hidden">Export</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleExport("csv")} className="cursor-pointer">
          <FileText className="h-4 w-4 mr-2 text-blue-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="cursor-pointer">
          <FileJson className="h-4 w-4 mr-2 text-green-600" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
