import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  LineChart, 
  Zap, 
  Shield,
  Menu,
  X,
  ArrowRight,
  Check,
  Star,
  Twitter,
  Github,
  Linkedin,
  MessageSquare,
  BarChart3,
  Lightbulb
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: "AI Trade Analysis",
      description: "Automatically analyzes your trading patterns and identifies areas for improvement"
    },
    {
      icon: TrendingUp,
      title: "Performance Metrics",
      description: "Track your win rate, average profit/loss, and overall portfolio performance"
    },
    {
      icon: Target,
      title: "Risk Management",
      description: "Monitor your risk exposure across all positions and get alerts"
    },
    {
      icon: LineChart,
      title: "Advanced Analytics",
      description: "Deep insights with interactive charts and detailed performance breakdowns"
    },
    {
      icon: Zap,
      title: "Instant Logging",
      description: "Quickly log trades with AI-powered data extraction from natural language"
    },
    {
      icon: Shield,
      title: "Pattern Recognition",
      description: "Identify your winning patterns and replicate successful strategies"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 50 trades/month",
        "Basic analytics",
        "AI insights",
        "Mobile app",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "month",
      description: "For serious traders",
      features: [
        "Unlimited trades",
        "Advanced analytics",
        "AI suggestions",
        "Priority support",
        "Custom tags",
        "Export data",
        "API access"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Team",
      price: "$49",
      period: "month",
      description: "For trading groups",
      features: [
        "Everything in Pro",
        "Up to 5 members",
        "Shared insights",
        "Team analytics",
        "Admin controls",
        "Dedicated support",
        "Custom branding"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Day Trader",
      content: "This AI trading journal helped me improve my win rate by 23% in just 3 months. The pattern recognition is incredible!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Swing Trader",
      content: "Finally, a trading journal that understands natural language. I just type what I did and it extracts everything. Saves me hours every week.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Options Trader",
      content: "The AI insights are game-changing. It pointed out risk patterns I didn't even notice. Worth every penny!",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "How does the AI analyze my trades?",
      answer: "Our AI uses advanced machine learning algorithms to analyze your trading patterns, identify trends, and provide personalized insights. It looks at your win rate, risk-reward ratios, position sizing, and timing to help you understand what's working and what isn't."
    },
    {
      question: "Is my trading data secure?",
      answer: "Absolutely. We use bank-level encryption (AES-256) to protect your data both in transit and at rest. We never share your trading data with third parties, and you have full control to export or delete your data at any time."
    },
    {
      question: "Can I import trades from my broker?",
      answer: "Yes! We support importing trades from most major brokers via CSV files. We're also working on direct API integrations with popular platforms. You can also manually log trades using natural language."
    },
    {
      question: "What makes this different from other trading journals?",
      answer: "Our AI-powered insights go beyond simple logging. We automatically extract trade details from natural language, identify your trading patterns, provide personalized recommendations, and help you understand the psychology behind your trades."
    },
    {
      question: "Can I try it before committing to a plan?",
      answer: "Yes! We offer a 14-day free trial for all paid plans, no credit card required. You can also start with our free plan to get a feel for the platform before upgrading."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied for any reason, just contact our support team for a full refund."
    }
  ];

  const howItWorks = [
    {
      icon: MessageSquare,
      step: "1",
      title: "Log Your Trades",
      description: "Simply describe your trade in natural language. Our AI extracts ticker, entry/exit prices, and position size automatically."
    },
    {
      icon: BarChart3,
      step: "2",
      title: "Track Performance",
      description: "View comprehensive analytics with interactive charts, P&L tracking, and performance metrics across all your trades."
    },
    {
      icon: Lightbulb,
      step: "3",
      title: "Get AI Insights",
      description: "Receive personalized recommendations, pattern analysis, and actionable insights to improve your trading strategy."
    }
  ];

  return (
    <div className="min-h-screen bg-background dark">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border glassmorphism">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">
            tradingjournal
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-primary smooth-transition">Journal</a>
            <a href="#analytics" className="text-sm hover:text-primary smooth-transition">Analytics</a>
            <a href="#insights" className="text-sm hover:text-primary smooth-transition">Insights</a>
            <a href="#pricing" className="text-sm hover:text-primary smooth-transition">Pricing</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="#about" className="text-sm hover:text-primary smooth-transition">About Us</a>
            <a href="#contact" className="text-sm hover:text-primary smooth-transition">Contact</a>
            {!loading && (user ? (
              <>
                <Link to="/dashboard" className="text-sm hover:text-primary smooth-transition">Dashboard</Link>
                <Link to="/trades" className="text-sm hover:text-primary smooth-transition">Trades</Link>
                <Button asChild className="rounded-full" size="sm">
                  <Link to="/chat">Go to Journal</Link>
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth" className="text-sm hover:text-primary smooth-transition">Sign In</Link>
                <Button asChild className="rounded-full" size="sm">
                  <Link to="/auth">Start for Free</Link>
                </Button>
              </>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a href="#features" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Journal</a>
              <a href="#analytics" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Analytics</a>
              <a href="#insights" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Insights</a>
              <a href="#pricing" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#about" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>About Us</a>
              <a href="#contact" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              {!loading && (user ? (
                <>
                  <Link to="/dashboard" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                  <Link to="/trades" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Trades</Link>
                  <Button asChild className="rounded-full w-full">
                    <Link to="/chat">Go to Journal</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth" className="text-sm hover:text-primary smooth-transition" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Button asChild className="rounded-full w-full">
                    <Link to="/auth">Start for Free</Link>
                  </Button>
                </>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-mesh opacity-50"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <Badge className="rounded-full bg-primary/10 text-primary border-primary/20">
                AI-Powered Trading Intelligence
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Your AI-powered trading journal that learns from your trades
              </h1>
              
              <p className="text-lg text-muted-foreground">
                Track every trade with precision, get AI-powered insights, and improve your trading performance with intelligent analytics that adapt to your strategy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-full text-lg px-8">
                  <Link to="/auth">
                    Start for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground flex items-center">
                  No credit card required • 14-day free trial
                </p>
              </div>
            </div>

            {/* Chat Interface Preview */}
            <div className="relative animate-fade-in-up delay-200">
              <Card className="overflow-hidden shadow-2xl border-border/50">
                <CardHeader className="bg-secondary/50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                      <p className="text-sm">
                        I just closed a long position on AAPL. Bought at $178.50, sold at $182.30. Used 2% position size.
                      </p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-accent rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%] space-y-3">
                      <p className="text-sm font-medium">Trade recorded! Here's what I extracted:</p>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Ticker:</span> AAPL</p>
                        <p><span className="text-muted-foreground">Entry:</span> $178.50</p>
                        <p><span className="text-muted-foreground">Exit:</span> $182.30</p>
                        <p><span className="text-muted-foreground">Position Size:</span> 2%</p>
                        <p><span className="text-green-500">P&L:</span> +2.13% ($380)</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Great trade! This aligns with your winning pattern of taking profits around the 2% gain level.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Smart, Effective</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start improving your trading in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <Card key={index} className="relative gradient-panel border-border/50 smooth-transition hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{item.step}</span>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Everything you need to trade smarter</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you analyze, track, and improve your trading performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-panel border-border/50 smooth-transition hover:shadow-xl hover:scale-105">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section id="journal" className="py-20 bg-secondary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="rounded-full">Trade Journal</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Complete trade overview & management</h2>
              <p className="text-lg text-muted-foreground">
                Track every aspect of your trades with precision and clarity
              </p>
              
              <div className="space-y-4">
                {[
                  "Instant trade entry with AI-powered data extraction",
                  "Comprehensive P&L tracking across all positions",
                  "Detailed trade metadata and performance metrics"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <Card className="overflow-hidden shadow-2xl">
                <CardHeader className="bg-secondary/50">
                  <CardTitle>Recent Trades</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[
                      { ticker: "AAPL", type: "LONG", entry: "$178.50", exit: "$182.30", pnl: "+2.13%", status: "win" },
                      { ticker: "TSLA", type: "SHORT", entry: "$245.00", exit: "$238.50", pnl: "+2.65%", status: "win" },
                      { ticker: "NVDA", type: "LONG", entry: "$485.20", exit: "$478.30", pnl: "-1.42%", status: "loss" },
                    ].map((trade, index) => (
                      <div key={index} className="p-4 hover:bg-accent/50 smooth-transition">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{trade.ticker}</p>
                            <p className="text-sm text-muted-foreground">{trade.type}</p>
                          </div>
                          <div className="text-right">
                            <p className={trade.status === "win" ? "text-green-500 font-semibold" : "text-red-500 font-semibold"}>
                              {trade.pnl}
                            </p>
                            <p className="text-sm text-muted-foreground">{trade.entry} → {trade.exit}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analytics" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Card className="overflow-hidden shadow-2xl gradient-panel">
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                  <CardDescription>Your trading stats at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className="text-2xl font-bold text-green-500">68.5%</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Avg P&L</p>
                      <p className="text-2xl font-bold text-primary">+1.85%</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Trades</p>
                      <p className="text-2xl font-bold">247</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">Best Day</p>
                      <p className="text-2xl font-bold text-green-500">+$2,450</p>
                    </div>
                  </div>
                  
                  <div className="h-48 bg-background/30 rounded-lg flex items-center justify-center">
                    <LineChart className="w-16 h-16 text-primary/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <Badge className="rounded-full">Analytics</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Data-driven insights for better decisions</h2>
              <p className="text-lg text-muted-foreground">
                Understand your performance with comprehensive analytics and visualizations
              </p>
              
              <div className="space-y-4">
                {[
                  "Interactive charts and performance graphs",
                  "Win rate and profitability breakdowns",
                  "Trend analysis across timeframes"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Showcase */}
      <section id="insights" className="py-20 bg-secondary/20 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="rounded-full">AI Insights</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Smart recommendations powered by AI</h2>
              <p className="text-lg text-muted-foreground">
                Get personalized insights that help you understand and improve your trading patterns
              </p>
              
              <div className="space-y-4">
                {[
                  "Personalized trading pattern analysis",
                  "Risk assessment and suggestions",
                  "Market correlation insights"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Card className="overflow-hidden shadow-2xl gradient-panel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "Strong Pattern Detected",
                      description: "You have an 82% win rate on AAPL trades when entering after 10am EST. Consider focusing more trades in this window.",
                      type: "success"
                    },
                    {
                      title: "Risk Alert",
                      description: "Your position sizes have increased 45% this week. Consider returning to your 2% rule to manage risk.",
                      type: "warning"
                    },
                    {
                      title: "New Opportunity",
                      description: "Your tech stock trades outperform when VIX is below 15. Current VIX: 12.3",
                      type: "info"
                    }
                  ].map((insight, index) => (
                    <div key={index} className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <p className="font-semibold mb-1">{insight.title}</p>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Choose your plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. All plans include 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative gradient-panel smooth-transition hover:scale-105 ${
                  plan.popular ? 'border-primary shadow-2xl ring-2 ring-primary/20' : 'border-border/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button asChild className={`w-full ${plan.popular ? '' : 'variant-outline'}`}>
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full">Testimonials</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Loved by traders worldwide</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-panel border-border/50">
                <CardHeader>
                  <div className="flex gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">"{testimonial.content}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16 space-y-4">
            <Badge className="rounded-full">FAQ</Badge>
            <h2 className="text-3xl md:text-4xl font-bold">Frequently asked questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about our platform
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6 gradient-panel">
                <AccordionTrigger className="text-left hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Card className="max-w-4xl mx-auto gradient-panel border-border/50 shadow-2xl">
            <CardContent className="p-12 text-center space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold">Start trading smarter today</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of traders who are already improving their performance with AI-powered insights
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full text-lg px-8">
                  <Link to="/auth">
                    Start for Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full text-lg px-8">
                  <a href="#contact">Schedule Demo</a>
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                14-day free trial • No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">tradingjournal</h3>
              <p className="text-sm text-muted-foreground">
                The smartest way to track and improve your trading
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary smooth-transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary smooth-transition">Pricing</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#about" className="hover:text-primary smooth-transition">About</a></li>
                <li><a href="#contact" className="hover:text-primary smooth-transition">Contact</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary smooth-transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary smooth-transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 tradingjournal. All rights reserved.
            </p>
            
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary smooth-transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary smooth-transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary smooth-transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
