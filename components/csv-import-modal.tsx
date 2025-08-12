"use client"

import type React from "react"

import { useState, useRef } from "react"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface CSVImportModalProps {
  onWordsImported: () => void
}

export function CSVImportModal({ onWordsImported }: CSVImportModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [showAllRows, setShowAllRows] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile)
      parseCSVPreview(selectedFile)
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      })
    }
  }

  const parseCSVPreview = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

      const previewData = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        return row
      })

      setPreview(previewData)
      setShowAllRows(false)
    }
    reader.readAsText(file)
  }

  const parseDate = (dateString: string): string => {
    if (!dateString || dateString.trim() === "") {
      return new Date().toISOString()
    }

    const date = new Date(dateString.trim())
    if (isNaN(date.getTime())) {
      return new Date().toISOString()
    }

    return date.toISOString()
  }

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString || dateString.trim() === "") {
      return "-"
    }

    const date = new Date(dateString.trim())
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }

    return date.toLocaleDateString()
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to import words",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const text = e.target?.result as string
      const lines = text.split("\n").filter((line) => line.trim())
      const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, "").toLowerCase())

      const words = lines
        .slice(1)
        .map((line) => {
          const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
          const row: any = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ""
          })

          const createdAt = parseDate(row["created_at"])

          return {
            user_id: user.id,
            english_word: row["english_word"] || row["english"] || row["word"] || "",
            persian_meaning: row["persian_meaning"] || row["persian"] || row["meaning"] || "",
            example_sentences: row["example_sentences"]
              ? row["example_sentences"].split(";").filter((s: string) => s.trim())
              : [],
            total_attempts: Number.parseInt(row["total_attempts"]) || 0,
            correct_answers: Number.parseInt(row["correct_answers"]) || 0,
            created_at: createdAt,
          }
        })
        .filter((word) => word.english_word && word.persian_meaning)

      if (words.length === 0) {
        toast({
          title: "No valid words found",
          description: "Please check your CSV format and try again",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const { error } = await supabase.from("words").insert(words)

      if (error) {
        toast({
          title: "Import failed",
          description: "Failed to import words. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Import successful! 🎉",
          description: `Successfully imported ${words.length} words`,
        })
        setOpen(false)
        setFile(null)
        setPreview([])
        onWordsImported()
      }

      setLoading(false)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csvContent = `english_word,persian_meaning,example_sentences,total_attempts,correct_answers,created_at
hello,سلام,"Hello world;Hello there",5,4,2024-01-15T10:30:00Z
goodbye,خداحافظ,"Goodbye friend;See you later",3,2,2024-01-16T14:20:00Z
thank you,متشکرم,"Thank you very much;Thanks for your help",8,7,2024-01-17T09:15:00Z`

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "vocabulary_template.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const displayRows = showAllRows ? preview : preview.slice(0, 3)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-border hover:bg-muted/50 rounded-xl h-11 px-4 sm:px-6 font-medium bg-transparent"
        >
          <Upload className="h-4 w-4 mr-2 text-green-600" />
          <span className="hidden sm:inline">Import CSV</span>
          <span className="sm:hidden">Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] minimalist-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Import Vocabulary from CSV
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Upload a CSV file to import multiple words at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              CSV Format Requirements
            </h3>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Required columns:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>english_word</code> (or <code>english</code>, <code>word</code>) - The English word
                    </li>
                    <li>
                      <code>persian_meaning</code> (or <code>persian</code>, <code>meaning</code>) - Persian translation
                    </li>
                  </ul>
                  <p className="mt-3">
                    <strong>Optional columns:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>
                      <code>example_sentences</code> - Multiple examples separated by semicolons (;)
                    </li>
                    <li>
                      <code>total_attempts</code> - Number of practice attempts (default: 0)
                    </li>
                    <li>
                      <code>correct_answers</code> - Number of correct answers (default: 0)
                    </li>
                    <li>
                      <code>created_at</code> - Creation date (ISO format, default: current time)
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="border-border hover:bg-muted/50 rounded-xl bg-transparent"
              >
                <Download className="h-4 w-4 mr-2 text-blue-500" />
                Download Template
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
              {file ? (
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-foreground font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-foreground font-medium">Choose CSV file</p>
                  <p className="text-sm text-muted-foreground">Click to select your vocabulary CSV file</p>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 border-border hover:bg-muted/50 rounded-xl"
              >
                {file ? "Choose Different File" : "Select File"}
              </Button>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Preview {showAllRows ? `(All ${preview.length} rows)` : `(First 3 of ${preview.length} rows)`}
                </h3>
                {preview.length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllRows(!showAllRows)}
                    className="border-border hover:bg-muted/50 rounded-lg bg-transparent"
                  >
                    {showAllRows ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Show All ({preview.length})
                      </>
                    )}
                  </Button>
                )}
              </div>
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 font-medium">English Word</th>
                        <th className="text-left p-3 font-medium">Persian Meaning</th>
                        <th className="text-left p-3 font-medium">Examples</th>
                        <th className="text-left p-3 font-medium">Attempts</th>
                        <th className="text-left p-3 font-medium">Correct</th>
                        <th className="text-left p-3 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((row, index) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-3">{row.english_word || row.english || row.word || "-"}</td>
                          <td className="p-3">{row.persian_meaning || row.persian || row.meaning || "-"}</td>
                          <td className="p-3 text-xs">
                            {row.example_sentences
                              ? row.example_sentences.split(";").slice(0, 2).join("; ") +
                                (row.example_sentences.split(";").length > 2 ? "..." : "")
                              : "-"}
                          </td>
                          <td className="p-3">{row.total_attempts || "0"}</td>
                          <td className="p-3">{row.correct_answers || "0"}</td>
                          <td className="p-3 text-xs">{formatDateForDisplay(row.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border hover:bg-muted/50 rounded-xl"
          >
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || loading} className="minimalist-button rounded-xl px-6">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Importing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Words
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
