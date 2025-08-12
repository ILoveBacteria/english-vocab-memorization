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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, EyeOff, FileJson } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"

interface ImportExportModalProps {
  onWordsImported: () => void
}

interface ValidationError {
  row: number
  field: string
  value: any
  message: string
}

interface ParsedWord {
  english_word: string
  persian_meaning: string
  example_sentences: string[]
  total_attempts: number
  correct_answers: number
  created_at: string
}

export function ImportExportModal({ onWordsImported }: ImportExportModalProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<ParsedWord[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showAllRows, setShowAllRows] = useState(false)
  const [fileType, setFileType] = useState<"csv" | "json">("csv")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateData = (
    data: any[],
    format: "csv" | "json",
  ): { validData: ParsedWord[]; errors: ValidationError[] } => {
    const errors: ValidationError[] = []
    const validData: ParsedWord[] = []

    data.forEach((row, index) => {
      const rowNumber = index + 1
      const parsedRow: Partial<ParsedWord> = {}

      // Validate required fields
      const englishWord = row.english_word || row.english || row.word || ""
      const persianMeaning = row.persian_meaning || row.persian || row.meaning || ""

      if (!englishWord.trim()) {
        errors.push({
          row: rowNumber,
          field: "english_word",
          value: englishWord,
          message: "English word is required and cannot be empty",
        })
      } else {
        parsedRow.english_word = englishWord.trim()
      }

      if (!persianMeaning.trim()) {
        errors.push({
          row: rowNumber,
          field: "persian_meaning",
          value: persianMeaning,
          message: "Persian meaning is required and cannot be empty",
        })
      } else {
        parsedRow.persian_meaning = persianMeaning.trim()
      }

      // Validate example_sentences
      let exampleSentences: string[] = []
      if (row.example_sentences) {
        if (typeof row.example_sentences === "string") {
          exampleSentences = row.example_sentences
            .split(";")
            .map((s: string) => s.trim())
            .filter((s: string) => s)
        } else if (Array.isArray(row.example_sentences)) {
          exampleSentences = row.example_sentences
            .filter((s: any) => typeof s === "string" && s.trim())
            .map((s: string) => s.trim())
        } else {
          errors.push({
            row: rowNumber,
            field: "example_sentences",
            value: row.example_sentences,
            message: "Example sentences must be a string (semicolon-separated) or array of strings",
          })
        }
      }
      parsedRow.example_sentences = exampleSentences

      // Validate total_attempts
      const totalAttempts = row.total_attempts || 0
      if (totalAttempts !== "" && totalAttempts !== null && totalAttempts !== undefined) {
        const parsed = Number(totalAttempts)
        if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
          errors.push({
            row: rowNumber,
            field: "total_attempts",
            value: totalAttempts,
            message: "Total attempts must be a non-negative integer",
          })
        } else {
          parsedRow.total_attempts = parsed
        }
      } else {
        parsedRow.total_attempts = 0
      }

      // Validate correct_answers
      const correctAnswers = row.correct_answers || 0
      if (correctAnswers !== "" && correctAnswers !== null && correctAnswers !== undefined) {
        const parsed = Number(correctAnswers)
        if (isNaN(parsed) || !Number.isInteger(parsed) || parsed < 0) {
          errors.push({
            row: rowNumber,
            field: "correct_answers",
            value: correctAnswers,
            message: "Correct answers must be a non-negative integer",
          })
        } else {
          parsedRow.correct_answers = parsed
        }
      } else {
        parsedRow.correct_answers = 0
      }

      // Validate correct_answers <= total_attempts
      if (
        parsedRow.correct_answers !== undefined &&
        parsedRow.total_attempts !== undefined &&
        parsedRow.correct_answers > parsedRow.total_attempts
      ) {
        errors.push({
          row: rowNumber,
          field: "correct_answers",
          value: parsedRow.correct_answers,
          message: "Correct answers cannot be greater than total attempts",
        })
      }

      // Validate created_at
      let createdAt = new Date().toISOString()
      if (row.created_at) {
        const date = new Date(row.created_at)
        if (isNaN(date.getTime())) {
          errors.push({
            row: rowNumber,
            field: "created_at",
            value: row.created_at,
            message: "Created date must be a valid ISO date format (e.g., 2024-01-15T10:30:00Z)",
          })
        } else {
          createdAt = date.toISOString()
        }
      }
      parsedRow.created_at = createdAt

      // Only add to valid data if required fields are present
      if (parsedRow.english_word && parsedRow.persian_meaning) {
        validData.push(parsedRow as ParsedWord)
      }
    })

    return { validData, errors }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const isCSV = selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")
    const isJSON = selectedFile.type === "application/json" || selectedFile.name.endsWith(".json")

    if (!isCSV && !isJSON) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or JSON file",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)
    setFileType(isCSV ? "csv" : "json")
    parseFilePreview(selectedFile, isCSV ? "csv" : "json")
  }

  const parseFilePreview = (file: File, format: "csv" | "json") => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      let rawData: any[] = []

      try {
        if (format === "csv") {
          const lines = text.split("\n").filter((line) => line.trim())
          if (lines.length < 2) {
            toast({
              title: "Invalid CSV",
              description: "CSV file must have at least a header row and one data row",
              variant: "destructive",
            })
            return
          }

          const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
          rawData = lines.slice(1).map((line) => {
            const values = line.split(",").map((v) => v.trim().replace(/"/g, ""))
            const row: any = {}
            headers.forEach((header, index) => {
              row[header] = values[index] || ""
            })
            return row
          })
        } else {
          const jsonData = JSON.parse(text)
          if (!Array.isArray(jsonData)) {
            toast({
              title: "Invalid JSON",
              description: "JSON file must contain an array of vocabulary objects",
              variant: "destructive",
            })
            return
          }
          rawData = jsonData
        }

        const { validData, errors } = validateData(rawData, format)
        setPreview(validData)
        setValidationErrors(errors)
        setShowAllRows(false)
      } catch (error) {
        toast({
          title: `Invalid ${format.toUpperCase()}`,
          description: `Failed to parse ${format.toUpperCase()} file. Please check the format.`,
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!file || preview.length === 0) return

    if (validationErrors.length > 0) {
      toast({
        title: "Validation errors found",
        description: "Please fix the validation errors before importing",
        variant: "destructive",
      })
      return
    }

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

    const wordsToInsert = preview.map((word) => ({
      ...word,
      user_id: user.id,
    }))

    const { error } = await supabase.from("words").insert(wordsToInsert)

    if (error) {
      toast({
        title: "Import failed",
        description: "Failed to import words. Please try again.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Import successful! 🎉",
        description: `Successfully imported ${wordsToInsert.length} words`,
      })
      setOpen(false)
      setFile(null)
      setPreview([])
      setValidationErrors([])
      onWordsImported()
    }

    setLoading(false)
  }

  const downloadTemplate = (format: "csv" | "json") => {
    const sampleData = [
      {
        english_word: "hello",
        persian_meaning: "سلام",
        example_sentences: ["Hello world", "Hello there"],
        total_attempts: 5,
        correct_answers: 4,
        created_at: "2024-01-15T10:30:00Z",
      },
      {
        english_word: "goodbye",
        persian_meaning: "خداحافظ",
        example_sentences: ["Goodbye friend", "See you later"],
        total_attempts: 3,
        correct_answers: 2,
        created_at: "2024-01-16T14:20:00Z",
      },
      {
        english_word: "thank you",
        persian_meaning: "متشکرم",
        example_sentences: ["Thank you very much", "Thanks for your help"],
        total_attempts: 8,
        correct_answers: 7,
        created_at: "2024-01-17T09:15:00Z",
      },
    ]

    let content: string
    let filename: string
    let mimeType: string

    if (format === "csv") {
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
        ...sampleData.map((item) =>
          [
            `"${item.english_word}"`,
            `"${item.persian_meaning}"`,
            `"${item.example_sentences.join(";")}"`,
            item.total_attempts,
            item.correct_answers,
            item.created_at,
          ].join(","),
        ),
      ].join("\n")
      filename = "vocabulary_template.csv"
      mimeType = "text/csv"
    } else {
      content = JSON.stringify(sampleData, null, 2)
      filename = "vocabulary_template.json"
      mimeType = "application/json"
    }

    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
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
          <span className="hidden sm:inline">Import</span>
          <span className="sm:hidden">Import</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] minimalist-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto shadow-md">
            <Upload className="h-6 w-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-foreground">Import Vocabulary</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Upload a CSV or JSON file to import multiple words at once
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="upload">Upload & Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="instructions" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                File Format Requirements
              </h3>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-3">
                    <p>
                      <strong>Required fields:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <code>english_word</code> - The English word (cannot be empty)
                      </li>
                      <li>
                        <code>persian_meaning</code> - Persian translation (cannot be empty)
                      </li>
                    </ul>

                    <p>
                      <strong>Optional fields:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <code>example_sentences</code> - Array of strings (JSON) or semicolon-separated (CSV)
                      </li>
                      <li>
                        <code>total_attempts</code> - Non-negative integer (default: 0)
                      </li>
                      <li>
                        <code>correct_answers</code> - Non-negative integer ≤ total_attempts (default: 0)
                      </li>
                      <li>
                        <code>created_at</code> - ISO date format (default: current time)
                      </li>
                    </ul>

                    <p>
                      <strong>Validation rules:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Dates must be in ISO format (e.g., 2024-01-15T10:30:00Z)</li>
                      <li>Numbers must be valid integers</li>
                      <li>Correct answers cannot exceed total attempts</li>
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("csv")}
                  className="border-border hover:bg-muted/50 rounded-xl bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2 text-blue-500" />
                  CSV Template
                </Button>
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate("json")}
                  className="border-border hover:bg-muted/50 rounded-xl bg-transparent"
                >
                  <Download className="h-4 w-4 mr-2 text-green-500" />
                  JSON Template
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            {/* File Upload */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="text-foreground font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB • {fileType.toUpperCase()}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-center gap-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <FileJson className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-foreground font-medium">Choose CSV or JSON file</p>
                    <p className="text-sm text-muted-foreground">Click to select your vocabulary file</p>
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

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium">Found {validationErrors.length} validation error(s):</p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {validationErrors.slice(0, 10).map((error, index) => (
                        <div key={index} className="text-sm">
                          <strong>Row {error.row}:</strong> {error.message}
                          {error.value !== undefined && error.value !== "" && (
                            <span className="text-muted-foreground"> (value: "{String(error.value)}")</span>
                          )}
                        </div>
                      ))}
                      {validationErrors.length > 10 && (
                        <p className="text-sm text-muted-foreground">
                          ... and {validationErrors.length - 10} more errors
                        </p>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {preview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Preview {showAllRows ? `(All ${preview.length} rows)` : `(First 3 of ${preview.length} rows)`}
                    {validationErrors.length > 0 && (
                      <span className="text-sm text-red-500 ml-2">({validationErrors.length} errors found)</span>
                    )}
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
                            <td className="p-3">{row.english_word}</td>
                            <td className="p-3">{row.persian_meaning}</td>
                            <td className="p-3 text-xs">
                              {row.example_sentences.length > 0
                                ? row.example_sentences.slice(0, 2).join("; ") +
                                  (row.example_sentences.length > 2 ? "..." : "")
                                : "-"}
                            </td>
                            <td className="p-3">{row.total_attempts}</td>
                            <td className="p-3">{row.correct_answers}</td>
                            <td className="p-3 text-xs">{new Date(row.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-border hover:bg-muted/50 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading || preview.length === 0 || validationErrors.length > 0}
            className="minimalist-button rounded-xl px-6"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Importing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import {preview.length} Words
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
