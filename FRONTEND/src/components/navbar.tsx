import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, User } from 'lucide-react';
import { Button } from './ui/button';

interface NavbarProps {
  user?: any;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Simulating logout');
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-['Space_Grotesk']">ModMatch</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/finder">
                  <Button variant="ghost">Find Accessories</Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
