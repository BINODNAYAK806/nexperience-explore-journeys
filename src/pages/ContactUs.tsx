import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ContactUs = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message
          }
        ]);

      if (error) throw error;

      // Show success toast
      toast({
        title: "Message sent successfully!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      
      // Reset form
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error instanceof Error ? error.message : error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-6xl py-12 pt-24 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[#2a4bed] to-[#4364ed] bg-clip-text text-transparent">
            Get in Touch
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          We'd love to hear from you! Reach out for inquiries, support, or travel suggestions.
        </p>
      </div>

      {/* Contact Content */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Contact Form */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-2xl font-semibold">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Your message..."
                  rows={5}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    Sending...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Send Message
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              
              <div className="flex items-start gap-4">
                <div className="bg-[#4364ed]/10 p-2 rounded-lg">
                  <Phone className="w-5 h-5 text-[#4364ed]" />
                </div>
                <div>
                  <h3 className="font-medium">Phone Number</h3>
                  <p className="text-muted-foreground">+91 8347015725</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#4364ed]/10 p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-[#4364ed]" />
                </div>
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-muted-foreground">info@nexyatra.in</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#4364ed]/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-[#4364ed]" />
                </div>
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-muted-foreground">
                    320 Exult Shoppers<br />
                    Nr. Siddhi Vinayak Temple, Vesu Main Road,<br />
                    Vesu, Surat, Gujarat 395007
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-[#4364ed]/10 p-2 rounded-lg">
                  <Clock className="w-5 h-5 text-[#4364ed]" />
                </div>
                <div>
                  <h3 className="font-medium">Working Hours</h3>
                  <p className="text-muted-foreground">
                    Mon-Sat: 9 AM - 7 PM IST<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Map */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-0 h-64 overflow-hidden">
              <iframe
                title="NexYatra Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3721.966218932653!2d72.83921557507912!3d21.112107780967155!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be051fafd99e6c5%3A0x6cd3eb9a9a9423c!2sUdhana%2C%20Surat%2C%20Gujarat!5e0!3m2!1sen!2sin!4v1716380254437!5m2!1sen!2sin"
                width="100%"
                height="100%"
                className="border-0"
                loading="lazy"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
