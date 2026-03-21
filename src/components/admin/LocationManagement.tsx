import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical, Save, Loader2, MapPin } from "lucide-react";

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
  sort_order: number;
  is_active: boolean;
}

const LocationManagement = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("CT");

  const fetchLocations = async () => {
    const { data, error } = await supabase
      .from("dealership_locations" as any)
      .select("*")
      .order("sort_order");
    if (!error && data) setLocations(data as unknown as Location[]);
    setLoading(false);
  };

  useEffect(() => { fetchLocations(); }, []);

  const addLocation = async () => {
    if (!newName.trim() || !newCity.trim()) {
      toast({ title: "Name and city are required", variant: "destructive" });
      return;
    }
    const maxOrder = locations.length > 0 ? Math.max(...locations.map(l => l.sort_order)) : 0;
    const { error } = await supabase
      .from("dealership_locations" as any)
      .insert({ name: newName.trim(), city: newCity.trim(), state: newState.trim() || "CT", sort_order: maxOrder + 1 });
    if (error) {
      toast({ title: "Failed to add location", variant: "destructive" });
    } else {
      toast({ title: "Location added" });
      setNewName(""); setNewCity(""); setNewState("CT");
      fetchLocations();
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("dealership_locations" as any)
      .update({ is_active: !isActive })
      .eq("id", id);
    if (!error) {
      setLocations(prev => prev.map(l => l.id === id ? { ...l, is_active: !isActive } : l));
    }
  };

  const deleteLocation = async (id: string) => {
    const { error } = await supabase
      .from("dealership_locations" as any)
      .delete()
      .eq("id", id);
    if (!error) {
      setLocations(prev => prev.filter(l => l.id !== id));
      toast({ title: "Location removed" });
    }
  };

  const updateLocation = async (id: string, field: keyof Location, value: string) => {
    setLocations(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const saveAll = async () => {
    setSaving(true);
    let hasError = false;
    for (const loc of locations) {
      const { error } = await supabase
        .from("dealership_locations" as any)
        .update({ name: loc.name, city: loc.city, state: loc.state, sort_order: loc.sort_order })
        .eq("id", loc.id);
      if (error) hasError = true;
    }
    setSaving(false);
    toast({ title: hasError ? "Some updates failed" : "All locations saved", variant: hasError ? "destructive" : "default" });
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...locations];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((l, i) => l.sort_order = i + 1);
    setLocations(updated);
  };

  const moveDown = (index: number) => {
    if (index === locations.length - 1) return;
    const updated = [...locations];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((l, i) => l.sort_order = i + 1);
    setLocations(updated);
  };

  if (loading) return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin w-6 h-6" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Dealership Locations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage locations shown in the site footer and scheduling.</p>
        </div>
        <Button onClick={saveAll} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Order
        </Button>
      </div>

      {/* Existing locations */}
      <div className="space-y-2">
        {locations.map((loc, index) => (
          <div
            key={loc.id}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${loc.is_active ? "bg-card border-border" : "bg-muted/50 border-border/50 opacity-60"}`}
          >
            <div className="flex flex-col gap-0.5">
              <button onClick={() => moveUp(index)} disabled={index === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▲</button>
              <GripVertical className="w-4 h-4 text-muted-foreground/40" />
              <button onClick={() => moveDown(index)} disabled={index === locations.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs">▼</button>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Input
                value={loc.name}
                onChange={(e) => updateLocation(loc.id, "name", e.target.value)}
                placeholder="Location name"
                className="text-sm"
              />
              <Input
                value={loc.city}
                onChange={(e) => updateLocation(loc.id, "city", e.target.value)}
                placeholder="City"
                className="text-sm"
              />
              <Input
                value={loc.state}
                onChange={(e) => updateLocation(loc.id, "state", e.target.value)}
                placeholder="State"
                className="text-sm w-20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={loc.is_active} onCheckedChange={() => toggleActive(loc.id, loc.is_active)} />
              <Button variant="ghost" size="icon" onClick={() => deleteLocation(loc.id)} className="text-destructive hover:text-destructive/80 h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new */}
      <div className="border-t pt-4">
        <Label className="text-sm font-semibold mb-2 block">Add New Location</Label>
        <div className="flex items-center gap-2">
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Location name" className="flex-1" />
          <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="City" className="w-32" />
          <Input value={newState} onChange={(e) => setNewState(e.target.value)} placeholder="State" className="w-20" />
          <Button onClick={addLocation} size="sm" className="gap-1">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;
