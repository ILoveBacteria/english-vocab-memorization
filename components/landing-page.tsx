"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, BookOpen, Brain, BarChart3, Users, Zap, Star, Play, Sparkles, Trophy, Target } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: "Smart Vocabulary Building",
      description: "Add words with meanings, examples, and track your learning progress with intelligent algorithms.",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      icon: <Brain className="h-6 w-6 text-purple-600" />,
      title: "Interactive Learning Modes",
      description: "Master vocabulary through flashcards, quizzes, and spaced repetition techniques.",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      title: "Progress Analytics",
      description: "Track your learning journey with detailed statistics and performance insights.",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      icon: <Users className="h-6 w-6 text-orange-600" />,
      title: "Multi-Language Support",
      description: "Learn vocabulary in multiple languages with Persian, English, and more coming soon.",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      icon: <Zap className="h-6 w-6 text-yellow-600" />,
      title: "Import & Export",
      description: "Easily import your existing vocabulary lists or export your progress to share.",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      icon: <Star className="h-6 w-6 text-pink-600" />,
      title: "Personalized Experience",
      description: "Customize your learning experience with themes, difficulty levels, and study schedules.",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
    },
  ]

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with vocabulary learning",
      features: [
        "Up to 100 vocabulary words",
        "Basic flashcard mode",
        "Simple quiz functionality",
        "Progress tracking",
        "Dark/Light theme",
      ],
      popular: false,
      buttonText: "Get Started Free",
      icon: <Target className="h-6 w-6 text-blue-600" />,
      iconBg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      name: "Pro",
      price: "$9",
      period: "per month",
      description: "Ideal for serious language learners",
      features: [
        "Unlimited vocabulary words",
        "Advanced spaced repetition",
        "Multiple quiz types",
        "Detailed analytics",
        "CSV/JSON import/export",
        "Priority support",
        "Custom study schedules",
      ],
      popular: true,
      buttonText: "Start Pro Trial",
      icon: <Trophy className="h-6 w-6 text-amber-600" />,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      name: "Premium",
      price: "$19",
      period: "per month",
      description: "For language professionals and educators",
      features: [
        "Everything in Pro",
        "Multiple language support",
        "Team collaboration",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "White-label options",
        "24/7 premium support",
      ],
      popular: false,
      buttonText: "Contact Sales",
      icon: <Sparkles className="h-6 w-6 text-purple-600" />,
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header Section */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            VocabMaster
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Master any language vocabulary with intelligent flashcards, spaced repetition, and personalized learning
            paths
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-3">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
              Start Learning Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 bg-transparent">
              <Play className="h-5 w-5 mr-2 text-blue-600" />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to master vocabulary</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to accelerate your language learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${feature.bgColor} p-3 rounded-xl shadow-sm`}>{feature.icon}</div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose your learning plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade as your vocabulary grows
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                  plan.popular ? "border-primary shadow-lg scale-105" : "border-border hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`${plan.iconBg} p-3 rounded-xl shadow-sm`}>{plan.icon}</div>
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2 text-base">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full mt-6"
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    onClick={() => {
                      setSelectedPlan(plan.name)
                      onGetStarted()
                    }}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 border border-primary/20">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-4 rounded-full shadow-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to master your vocabulary?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have already improved their language skills with VocabMaster
          </p>
          <Button size="lg" onClick={onGetStarted} className="text-lg px-8 py-3">
            <Sparkles className="h-5 w-5 mr-2 text-yellow-300" />
            Start Your Journey Today
          </Button>
        </div>
      </div>
    </div>
  )
}
