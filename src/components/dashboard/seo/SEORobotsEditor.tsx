import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, AlertTriangle } from "lucide-react";

export const SEORobotsEditor: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [robotsContent, setRobotsContent] = useState("");

  const { data: config, isLoading } = useQuery({
    queryKey: ["seo-config", "robots_txt"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_config")
        .select("*")
        .eq("config_key", "robots_txt")
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (config) setRobotsContent(config.config_value);
  }, [config]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("seo_config")
        .update({ config_value: robotsContent })
        .eq("config_key", "robots_txt");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-config", "robots_txt"] });
      toast({ title: "Robots.txt saved successfully" });
    },
    onError: (err: any) => {
      toast({ title: "Failed to save", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) return <p className="text-muted-foreground py-4">Loading...</p>;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Robots.txt Editor</CardTitle>
        <div className="flex items-start gap-2 p-3 bg-muted border border-border rounded text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>Changes here are saved to the database. To apply to production, update the <code>public/robots.txt</code> file or deploy an edge function to serve it dynamically.</p>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          className="font-mono text-sm min-h-[300px]"
          value={robotsContent}
          onChange={e => setRobotsContent(e.target.value)}
        />
        <Button className="mt-3" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-1" /> Save Robots.txt
        </Button>
      </CardContent>
    </Card>
  );
};
