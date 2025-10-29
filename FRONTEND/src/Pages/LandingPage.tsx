import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { Button } from '../components/ui/button';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/5">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Recommendations
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] leading-tight">
                Find Perfect <span className="text-primary">Accessories</span> for Your Vehicle
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Our advanced hybrid AI model analyzes your vehicle's specifications and your preferences 
                to recommend the best accessories tailored just for you.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link to="/finder">
                  <Button size="lg" className="text-lg px-8 h-14 gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="text-lg px-8 h-14">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              <img
                src="https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop"
                alt="Luxury car"
                className="relative rounded-3xl shadow-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold font-['Space_Grotesk'] mb-4">
              Why Choose ModMatch?
            </h2>
            <p className="text-lg text-muted-foreground">
              Powered by advanced machine learning trained on thousands of vehicles and accessories
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Matching</h3>
              <p className="text-muted-foreground">
                Our hybrid WARP AI model analyzes multiple datasets to find accessories that perfectly match your vehicle
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Results</h3>
              <p className="text-muted-foreground">
                Get personalized recommendations in seconds based on your vehicle's make, model, and year
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Assured</h3>
              <p className="text-muted-foreground">
                Every recommendation is backed by compatibility data and user reviews from verified purchases
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Car Gallery */}
      <section className="py-20 px-4 bg-secondary/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold font-['Space_Grotesk'] text-center mb-12">
            Works With All Major Brands
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop',
              'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=400&h=300&fit=crop'
            ].map((url, i) => (
              <div key={i} className="rounded-xl overflow-hidden shadow-lg hover:scale-105 transition-transform">
                <img src={url} alt={`Car ${i + 1}`} className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary to-accent p-12 rounded-3xl text-white">
            <h2 className="text-4xl font-bold font-['Space_Grotesk'] mb-4">
              Ready to Find Your Perfect Match?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of car enthusiasts who trust ModMatch for their accessory needs
            </p>
              <Link to="/finder">
                <Button size="lg" variant="secondary" className="text-lg px-8 h-14 gap-2">
                  Start Finding Accessories <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>© 2025 ModMatch. Powered by Advanced AI Technology.</p>
        </div>
      </footer>
    </div>
  );
}
