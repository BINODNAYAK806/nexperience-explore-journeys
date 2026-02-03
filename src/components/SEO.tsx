import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
}

const SEO = ({
  title = "NexYatra - Affordable Travel Packages | Book Your Dream Destination",
  description = "Discover affordable travel packages to Dubai, Bali, Kerala, Manali and more. NexYatra offers customized holiday packages with best prices. Book your dream vacation today!",
  keywords = "travel packages, affordable tours, Dubai tour packages, Bali holidays, Kerala backwaters, Manali trips, budget travel, holiday packages India, international tours, domestic tours, adventure travel, luxury travel, family vacation packages",
  image = "/og-image.png",
  url,
  type = "website",
  structuredData
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to update or create meta tag
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'NexYatra');
    updateMetaTag('robots', 'index, follow');

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:type', type, true);
    if (url) updateMetaTag('og:url', url, true);
    updateMetaTag('og:site_name', 'NexYatra', true);
    updateMetaTag('og:locale', 'en_IN', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional SEO tags
    updateMetaTag('geo.region', 'IN-GJ');
    updateMetaTag('geo.placename', 'Surat');

    // Handle structured data
    if (structuredData) {
      let scriptElement = document.querySelector('#structured-data');
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.id = 'structured-data';
        scriptElement.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(structuredData);
    }

    // Cleanup function
    return () => {
      const structuredDataScript = document.querySelector('#structured-data');
      if (structuredDataScript) {
        structuredDataScript.remove();
      }
    };
  }, [title, description, keywords, image, url, type, structuredData]);

  return null;
};

export default SEO;

// Predefined structured data templates
export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "NexYatra",
  "alternateName": "NexYatra Travel Agency",
  "url": "https://nexperience-explore-journeys.lovable.app",
  "logo": "https://nexperience-explore-journeys.lovable.app/lovable-uploads/2b127b7a-f8e2-4ed9-b75a-f14f4e215484.png",
  "description": "NexYatra offers affordable travel packages to domestic and international destinations. Book customized holiday packages at best prices.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "320 Exult Shoppers, Nr. Siddhi Vinayak Temple, Vesu Main Road, Vesu",
    "addressLocality": "Surat",
    "addressRegion": "Gujarat",
    "postalCode": "395007",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-8347015725",
    "contactType": "customer service",
    "availableLanguage": ["English", "Hindi", "Gujarati"]
  },
  "sameAs": [
    "https://wa.me/918347015725"
  ],
  "priceRange": "₹₹"
});

export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NexYatra",
  "url": "https://nexperience-explore-journeys.lovable.app",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://nexperience-explore-journeys.lovable.app/destinations?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

export const getDestinationSchema = (destination: {
  name: string;
  description: string;
  price: number;
  image_url: string;
  country: string;
  rating: number;
  duration: string;
  slug: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": `${destination.name} Tour Package - NexYatra`,
  "description": destination.description,
  "touristType": "Adventure, Leisure",
  "offers": {
    "@type": "Offer",
    "price": destination.price,
    "priceCurrency": "INR",
    "availability": "https://schema.org/InStock",
    "url": `https://nexperience-explore-journeys.lovable.app/destinations/${destination.slug}`,
    "seller": {
      "@type": "TravelAgency",
      "name": "NexYatra"
    }
  },
  "image": destination.image_url,
  "itinerary": {
    "@type": "ItemList",
    "numberOfItems": parseInt(destination.duration) || 5,
    "itemListElement": {
      "@type": "ListItem",
      "position": 1,
      "name": `${destination.name} Tour`
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": destination.rating,
    "bestRating": 5,
    "ratingCount": 150
  }
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const getFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});
