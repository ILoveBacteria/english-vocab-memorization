"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

export function CSVExportButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
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

    // Create CSV content
    const headers = [
      "english_word",
      "persian_meaning",
      "example_sentences",
      "total_attempts",
      "correct_answers",
      "created_at",
    ]
    const csvContent = [
      headers.join(","),
      ...words.map((word) =>
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

    // Download file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vocabulary_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export successful! 📁",
      description: `Exported ${words.length} words to CSV`,
    })

    setLoading(false)
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
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
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </>
      )}
    </Button>
  )
}
