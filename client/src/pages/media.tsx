import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Media() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("movies");

  const { data: movies } = useQuery({
    queryKey: ["/api/media/movies"],
  });

  const { data: music } = useQuery({
    queryKey: ["/api/media/music"],
  });

  const { data: tedTalks } = useQuery({
    queryKey: ["/api/media/ted-talks"],
  });

  const filterItems = (items: any[]) => {
    if (!searchQuery) return items || [];
    return items?.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.speaker?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.genre?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-play-circle text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Uplifting Media
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover inspiring movies, uplifting music, and motivational talks to brighten your day and nourish your soul.
        </p>
      </div>

      {/* Search */}
      <Card className="magical-border mb-8 fade-in">
        <CardContent className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              placeholder="Search movies, music, speakers, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-media"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="movies" className="flex items-center" data-testid="tab-movies">
            <i className="fas fa-film mr-2"></i>
            Movies
          </TabsTrigger>
          <TabsTrigger value="music" className="flex items-center" data-testid="tab-music">
            <i className="fas fa-music mr-2"></i>
            Music
          </TabsTrigger>
          <TabsTrigger value="tedtalks" className="flex items-center" data-testid="tab-talks">
            <i className="fas fa-video mr-2"></i>
            TED Talks
          </TabsTrigger>
        </TabsList>

        {/* Movies */}
        <TabsContent value="movies" className="fade-in">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filterItems(movies || []).map((movie) => (
              <Card key={movie.id} className="group hover:magical-border hover:glow-effect transition-all cursor-pointer" data-testid={`movie-${movie.id}`}>
                <div className="aspect-[2/3] overflow-hidden rounded-t-lg">
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 to-primary/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                    <img 
                      src={movie.thumbnail} 
                      alt={`${movie.title} poster`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-primary/20">
                      <i className="fas fa-play text-6xl text-primary/50"></i>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">{movie.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {movie.genre}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filterItems(movies || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-film text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {searchQuery ? "No movies match your search" : "Loading inspiring movies..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Music */}
        <TabsContent value="music" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterItems(music || []).map((song) => (
              <Card key={song.id} className="group hover:magical-border hover:glow-effect transition-all" data-testid={`song-${song.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                      <i className="fas fa-music text-primary-foreground text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1 mb-1">{song.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{song.artist}</p>
                      <Badge className="text-xs genie-gradient">
                        {song.mood}
                      </Badge>
                    </div>
                    <Button size="sm" variant="ghost" className="hover:bg-primary hover:text-primary-foreground" asChild>
                      <a href={song.url} target="_blank" rel="noopener noreferrer">
                        <i className="fas fa-play"></i>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filterItems(music || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-music text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {searchQuery ? "No music matches your search" : "Loading uplifting music..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TED Talks */}
        <TabsContent value="tedtalks" className="fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filterItems(tedTalks || []).map((talk) => (
              <Card key={talk.id} className="group hover:magical-border hover:glow-effect transition-all" data-testid={`talk-${talk.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary to-primary rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <i className="fas fa-video text-primary-foreground text-xl"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2 mb-2">{talk.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{talk.speaker}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          <i className="fas fa-clock mr-1"></i>
                          {talk.duration}
                        </Badge>
                        <Button size="sm" className="genie-gradient hover:opacity-90" asChild>
                          <a href={talk.url} target="_blank" rel="noopener noreferrer">
                            <i className="fas fa-external-link-alt mr-2"></i>
                            Watch
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filterItems(tedTalks || []).length === 0 && (
            <Card className="magical-border">
              <CardContent className="p-8 text-center">
                <i className="fas fa-video text-4xl text-muted-foreground mb-4"></i>
                <p className="text-muted-foreground">
                  {searchQuery ? "No TED talks match your search" : "Loading inspiring TED talks..."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Featured Section */}
      <Card className="magical-border glow-effect mt-12 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary flex items-center justify-center">
            <i className="fas fa-star mr-2"></i>
            ✨ Daily Inspiration ✨
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center max-w-2xl mx-auto">
            <blockquote className="text-lg font-serif italic mb-4 text-foreground">
              "The only way to make sense out of change is to plunge into it, move with it, and join the dance."
            </blockquote>
            <cite className="text-secondary font-medium">- Alan Watts</cite>
            <p className="text-sm text-muted-foreground mt-4">
              Explore more wisdom in our curated collection of transformative content.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
