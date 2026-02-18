import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe } from "lucide-react";

interface Destination {
  name: string;
  slug: string;
  image_url: string | null;
}

export const SEOSitemapViewer: React.FC = () => {
  const { data: seoEntries } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("page_path, page_name, page_type")
        .order("page_path");
      if (error) throw error;
      return data;
    },
  });

  const { data: destinations } = useQuery({
    queryKey: ["destinations-sitemap"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("name, slug, image_url")
        .order("name");
      if (error) throw error;
      return data as Destination[];
    },
  });

  const staticPages = seoEntries || [];
  const destPages = destinations || [];
  const totalUrls = staticPages.length + destPages.length;

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sitemap Overview
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your sitemap.xml includes {totalUrls} URLs. The static file is at <code>/sitemap.xml</code>.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold mb-2">Static Pages ({staticPages.length})</h4>
              <div className="space-y-1">
                {staticPages.map((page, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                    <Badge variant="outline" className="text-xs w-20 justify-center">{page.page_type}</Badge>
                    <span className="font-mono text-xs">{page.page_path}</span>
                    <span className="text-muted-foreground ml-auto">{page.page_name}</span>
                    <a href={`https://www.nexyatra.in${page.page_path}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Destination Pages ({destPages.length})</h4>
              <div className="space-y-1">
                {destPages.map((dest, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm py-1 border-b last:border-0">
                    <Badge variant="outline" className="text-xs w-20 justify-center">product</Badge>
                    <span className="font-mono text-xs">/destinations/{dest.slug}</span>
                    <span className="text-muted-foreground ml-auto">{dest.name}</span>
                    <a href={`https://www.nexyatra.in/destinations/${dest.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
