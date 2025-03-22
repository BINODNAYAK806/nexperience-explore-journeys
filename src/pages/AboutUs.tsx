import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe, Luggage, Smile, Wallet, Phone, Mail } from "lucide-react"

const SectionHeading = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2a4bed] to-[#4364ed] bg-clip-text text-transparent mb-6">
    {children}
  </h2>
)

const AboutUs = () => {
  return (
    <div className="container max-w-6xl py-12 space-y-12">
      {/* Hero Section */}
      <header className="text-center space-y-4">
        <Badge variant="outline" className="px-4 py-1 bg-[#4364ed]/10">
          <Globe className="w-4 h-4 mr-2 text-[#4364ed]" />
          <span className="bg-gradient-to-r from-[#2a4bed] to-[#4364ed] bg-clip-text text-transparent">
            Crafting journeys since 2023
          </span>
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Travel with Confidence through
          <span className="block mt-2 bg-gradient-to-r from-[#2a4bed] to-[#4364ed] bg-clip-text text-transparent">
            NexYatra
          </span>
        </h1>
      </header>

      {/* Founders Story */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <SectionHeading>Our Journey</SectionHeading>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Avatar className="w-32 h-32 border-2 border-[#4364ed]/20">
              <AvatarImage src="/founders" />
              <AvatarFallback>BN</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">Binod & Samir</h3>
              <p className="text-sm text-muted-foreground">
                Passionate Travelers turned Planners
              </p>
            </div>
            <p className="text-muted-foreground">
              "We've made the mistakes so you don't have to. Every itinerary is 
              personally verified through our own travel experiences."
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-[#4364ed]/10 rounded-full flex items-center justify-center">
                <Luggage className="text-[#4364ed] w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pain-Free Planning</h3>
            </div>
            <p className="text-muted-foreground">
              After countless trips with hidden costs and logistical nightmares, 
              we built NexYatra with complete transparency and local expertise.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <div className="w-12 h-12 bg-[#4364ed]/10 rounded-full flex items-center justify-center">
                <Wallet className="text-[#4364ed] w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Budget Magic</h3>
            </div>
            <p className="text-muted-foreground">
              We unlock premium experiences at honest prices through direct local 
              partnerships we've cultivated ourselves.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Value Proposition */}
      <section>
        <SectionHeading>Why Choose Us</SectionHeading>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="bg-[#4364ed]/10 w-fit p-3 rounded-lg">
                <Smile className="w-8 h-8 text-[#4364ed]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Stress-Free Travel</h3>
              <p className="text-muted-foreground">
                24/7 support from local experts
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="bg-[#4364ed]/10 w-fit p-3 rounded-lg">
                <Globe className="w-8 h-8 text-[#4364ed]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Real Experience</h3>
              <p className="text-muted-foreground">
                Road-tested packages
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="bg-[#4364ed]/10 w-fit p-3 rounded-lg">
                <Wallet className="w-8 h-8 text-[#4364ed]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Fair Pricing</h3>
              <p className="text-muted-foreground">
                No hidden fees guaranteed
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <Card className="bg-[#4364ed]/5 border-[#4364ed]/10">
        <CardContent className="p-6 space-y-4">
          <SectionHeading>Start Your Adventure</SectionHeading>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#4364ed]" />
              <span className="font-medium">India:</span>
              <a href="tel:+918347015725" className="text-[#4364ed] hover:underline">
                +91 8347015725
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#4364ed]" />
              <span className="font-medium">Dubai:</span>
              <a href="tel:+971523273730" className="text-[#4364ed] hover:underline">
                +971 523273730
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#4364ed]" />
              <a href="mailto:book@nexyatra.in" className="text-[#4364ed] hover:underline">
                book@nexyatra.in
              </a>
            </div>
          </div>
          <Button className="bg-[#4364ed] text-white hover:bg-[#2a4bed]">
            Begin Your Journey
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Visit our office: UL, Mahalaxmi Market, Udhana, Surat, Gujarat 394210
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default AboutUs