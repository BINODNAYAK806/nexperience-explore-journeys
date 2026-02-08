import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DestinationBreadcrumbProps {
  items: BreadcrumbItem[];
}

const DestinationBreadcrumb = ({ items }: DestinationBreadcrumbProps) => {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className="flex items-center space-x-1 text-sm text-muted-foreground mb-4"
    >
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default DestinationBreadcrumb;
