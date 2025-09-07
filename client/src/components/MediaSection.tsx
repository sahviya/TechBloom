import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

interface MediaSectionProps {
  preview?: boolean;
}

export default function MediaSection({ preview = false }: MediaSectionProps) {
  const [activeTab, setActiveTab] = useState("movies");

  const { data: movies } = useQuery({
    queryKey: ["/api/media/movies"],
    queryFn: async () => {
      const response = await fetch("/api/media/movies");
      return response.json();
    },
  });

  const { data: music } = useQuery({
    queryKey: ["/api/media/music"],
    queryFn: async () => {
      const response = await fetch("/api/media/music");
      return response.json();
    },
  });

  const { data: tedTalks } = useQuery({
    queryKey: ["/api/media/ted-talks"],
    queryFn: async () => {
      const response = await fetch("/api/media/ted-talks");
      return response.json();
    },
  });

  const displayItems = (items: any[], limit?: number) => {
    return limit ? items?.slice(0, limit) : items;
  };

  return (
    <Card className="magical-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif font-semibold text-primary flex items-center">
            <i className="fas fa-star mr-2"></i>
            Uplifting Media
          </h3>
          {preview && (
            <Link href="/media">
              <Button variant="outline" size="sm" data-testid="view-all-media">
                View All
              </Button>
            </Link>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="movies" data-testid="tab-movies">Movies</TabsTrigger>
            <TabsTrigger value="music" data-testid="tab-music">Music</TabsTrigger>
            <TabsTrigger value="tedtalks" data-testid="tab-tedtalks">TED Talks</TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-6">
            <div className={`grid ${preview ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'} gap-4`}>
              {displayItems(movies || [], preview ? 3 : undefined)?.map((movie) => (
                <div key={movie.id} className="group cursor-pointer" data-testid={`movie-${movie.id}`}>
                  <div className="aspect-[2/3] bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg mb-2 group-hover:scale-105 transition-transform overflow-hidden">
                    <img 
                      src={movie.thumbnail} 
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
                      <i className="fas fa-play text-4xl text-primary/50"></i>
                    </div>
                  </div>
                  <h4 className="font-medium text-sm line-clamp-2">{movie.title}</h4>
                  <p className="text-xs text-muted-foreground">{movie.genre}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="music" className="mt-6">
            <div className="space-y-3">
              {displayItems(music || [], preview ? 3 : undefined)?.map((song) => (
                <div key={song.id} className="flex items-center space-x-3 p-3 bg-card/50 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer" data-testid={`song-${song.id}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <i className="fas fa-music text-primary-foreground"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{song.title}</h4>
                    <p className="text-sm text-muted-foreground">{song.artist}</p>
                    <p className="text-xs text-primary">{song.mood}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <i className="fas fa-play"></i>
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tedtalks" className="mt-6">
            <div className="space-y-3">
              {displayItems(tedTalks || [], preview ? 3 : undefined)?.map((talk) => (
                <div key={talk.id} className="flex items-center space-x-3 p-3 bg-card/50 rounded-lg hover:bg-accent/10 transition-colors cursor-pointer" data-testid={`tedtalk-${talk.id}`}>
                  <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center">
                    <i className="fas fa-video text-primary-foreground"></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{talk.title}</h4>
                    <p className="text-sm text-muted-foreground">{talk.speaker}</p>
                    <p className="text-xs text-accent">{talk.duration}</p>
                  </div>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={talk.url} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {preview && (
          <div className="mt-4 text-center">
            <Link href="/media">
              <Button variant="ghost" className="text-primary hover:text-primary/80" data-testid="view-more-media">
                <i className="fas fa-chevron-down mr-2"></i>View More
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
