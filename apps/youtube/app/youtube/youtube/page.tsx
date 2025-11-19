"use client";

import { Button } from "@workspace/ui/components/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@workspace/ui/components/tabs";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { useEffect, useState } from "react";
import Uploader from "../components/Uploader";
import YouTubeFeed from "../components/YouTubeFeed";
import { useYouTubeStore } from "../stores/useYouTubeStore";

export default function YouTubePage() {
  const [searchInput, setSearchInput] = useState("");
  const setQuery = useYouTubeStore((s) => s.setQuery);
  const setCategory = useYouTubeStore((s) => s.setCategory);
  const query = useYouTubeStore((s) => s.query);
  const category = useYouTubeStore((s) => s.category);

  useEffect(() => {
    toast("Mux YouTube module ready");
  }, []);

  useEffect(() => {
    // Sync search input with store query
    if (searchInput !== query) {
      setSearchInput(query);
    }
  }, [query]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    setQuery(value); // This will trigger debounced search in YouTubeFeed
  };

  const handleTabChange = (value: string) => {
    setCategory(value === "all" ? null : value);
  };

  return (
    <div className="mx-auto max-w-6xl p-4 space-y-4">
      <h1 className="text-xl font-semibold">Mux YouTube</h1>

      <Uploader />

      <Tabs 
        defaultValue="all" 
        value={category || "all"}
        onValueChange={handleTabChange}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tech">Tech</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
        </TabsList>
        <TabsContent value="all" />
        <TabsContent value="tech" />
        <TabsContent value="music" />
      </Tabs>

      <div className="flex items-center gap-2">
        <Input 
          placeholder="Search videos" 
          value={searchInput}
          onChange={handleSearchChange}
          className="max-w-md"
        />
        <Button 
          variant="outline" 
          onClick={() => setQuery("")}
          disabled={!searchInput}
        >
          Clear
        </Button>
      </div>

      {searchInput && (
        <div className="text-sm text-gray-600">
          Searching for: "{searchInput}"
        </div>
      )}

      <YouTubeFeed />
    </div>
  );
}