import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TemplateManager from "./TemplateManager";
import QuotationEditor from "./QuotationEditor";
import QuotationsList from "./QuotationsList";

type View = "list" | "editor";

const QuotationBuilder: React.FC = () => {
  const [view, setView] = useState<View>("list");
  const [editData, setEditData] = useState<any>(null);
  const [preloadTemplate, setPreloadTemplate] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateFromTemplate = (template: any) => {
    setEditData(null);
    setPreloadTemplate(template);
    setView("editor");
  };

  const handleEditQuotation = (quotation: any) => {
    setPreloadTemplate(null);
    setEditData({
      id: quotation.id,
      template_id: quotation.template_id,
      client_name: quotation.client_name,
      client_contact: quotation.client_contact || "",
      destination_name: quotation.destination_name,
      cities_covered: quotation.cities_covered?.length ? quotation.cities_covered : [""],
      total_price: Number(quotation.total_price),
      price_per_person: Number(quotation.price_per_person || 0),
      num_persons: Number(quotation.num_persons || 2),
      person_label: quotation.person_label || "Adult",
      price_per_child: Number(quotation.price_per_child || 0),
      num_children: Number(quotation.num_children || 0),
      child_label: quotation.child_label || "Child",
      travel_start_date: quotation.travel_start_date,
      travel_end_date: quotation.travel_end_date || "",
      description: quotation.description || "",
      brief_itinerary: (quotation.brief_itinerary as any[])?.length ? quotation.brief_itinerary as any[] : [{ day: 1, description: "" }],
      hotel_details: (quotation.hotel_details as any[])?.length ? quotation.hotel_details as any[] : [{ city: "", hotel_name: "", room_type: "", nights: 1 }],
      days: (quotation.days || []) as any[],
      inclusions: (quotation.inclusions as string[])?.length ? quotation.inclusions as string[] : [""],
      exclusions: (quotation.exclusions as string[])?.length ? quotation.exclusions as string[] : [""],
      terms_conditions: (quotation.terms_conditions as string[])?.length ? quotation.terms_conditions as string[] : [],
      important_notes: (quotation.important_notes as string[])?.length ? quotation.important_notes as string[] : [""],
      bank_details: quotation.bank_details || "",
      status: quotation.status,
    });
    setView("editor");
  };

  const handleNewQuotation = () => {
    setEditData(null);
    setPreloadTemplate(null);
    setView("editor");
  };

  const handleSaved = () => {
    setView("list");
    setEditData(null);
    setPreloadTemplate(null);
    setRefreshKey((k) => k + 1);
  };

  if (view === "editor") {
    return (
      <QuotationEditor
        initialData={editData}
        preloadTemplate={preloadTemplate}
        onSaved={handleSaved}
        onCancel={() => { setView("list"); setEditData(null); setPreloadTemplate(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="quotations">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="quotations">Quotations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          <Button onClick={handleNewQuotation}><Plus className="h-4 w-4 mr-1" /> New Quotation</Button>
        </div>

        <TabsContent value="quotations" className="mt-4">
          <QuotationsList onEdit={handleEditQuotation} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplateManager onCreateQuotation={handleCreateFromTemplate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuotationBuilder;
