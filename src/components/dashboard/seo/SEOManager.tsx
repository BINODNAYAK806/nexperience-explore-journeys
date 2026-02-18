import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SEOPageSettings } from "./SEOPageSettings";
import { SEORobotsEditor } from "./SEORobotsEditor";
import { SEOSitemapViewer } from "./SEOSitemapViewer";

const SEOManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pages");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">SEO Manager</h2>
        <p className="text-sm text-muted-foreground">
          Manage meta titles, descriptions, keywords, robots.txt and sitemap for all pages.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pages">Pages & Meta Tags</TabsTrigger>
          <TabsTrigger value="robots">Robots.txt</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap.xml</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <SEOPageSettings />
        </TabsContent>

        <TabsContent value="robots">
          <SEORobotsEditor />
        </TabsContent>

        <TabsContent value="sitemap">
          <SEOSitemapViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOManager;
