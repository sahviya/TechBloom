import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function Books() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: books } = useQuery({
    queryKey: ["/api/books"],
  });

  const filteredBooks = books?.filter((book: any) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const bookCategories = [
    {
      name: "Mindfulness & Meditation",
      books: filteredBooks.filter((book: any) => 
        book.title.toLowerCase().includes('mindfulness') || 
        book.title.toLowerCase().includes('now') ||
        book.author.toLowerCase().includes('kabat-zinn') ||
        book.author.toLowerCase().includes('tolle')
      ),
      color: "bg-green-500/20 text-green-600 dark:text-green-400",
      icon: "fas fa-leaf"
    },
    {
      name: "Personal Growth",
      books: filteredBooks.filter((book: any) => 
        book.title.toLowerCase().includes('happiness') || 
        book.title.toLowerCase().includes('emotional') ||
        book.title.toLowerCase().includes('gifts')
      ),
      color: "bg-blue-500/20 text-blue-600 dark:text-blue-400", 
      icon: "fas fa-arrow-up"
    },
    {
      name: "Self-Help & Motivation",
      books: filteredBooks.filter((book: any) => 
        !book.title.toLowerCase().includes('mindfulness') &&
        !book.title.toLowerCase().includes('now') &&
        !book.title.toLowerCase().includes('happiness') &&
        !book.title.toLowerCase().includes('emotional') &&
        !book.title.toLowerCase().includes('gifts') &&
        !book.author.toLowerCase().includes('kabat-zinn') &&
        !book.author.toLowerCase().includes('tolle')
      ),
      color: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
      icon: "fas fa-lightbulb"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 pb-20 md:pb-8">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 genie-gradient rounded-full flex items-center justify-center glow-effect">
            <i className="fas fa-book-open text-primary-foreground text-2xl"></i>
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold mb-4 genie-gradient bg-clip-text text-transparent">
          Wisdom Library
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Discover transformative books that inspire growth, healing, and inner peace. All freely available for your journey.
        </p>
      </div>

      {/* Search */}
      <Card className="magical-border mb-8 fade-in">
        <CardContent className="p-4">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              placeholder="Search books, authors, or topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="search-books"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Book */}
      <Card className="magical-border glow-effect mb-8 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary flex items-center justify-center">
            <i className="fas fa-star mr-2"></i>
            ✨ Book of the Day ✨
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-6 max-w-3xl mx-auto">
            <div className="w-32 h-40 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <div className="text-center">
                <i className="fas fa-book-open text-4xl text-primary mb-2"></i>
                <div className="text-xs text-muted-foreground">Book Cover</div>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-serif font-semibold mb-2">The Power of Now</h3>
              <p className="text-lg text-secondary mb-2">by Eckhart Tolle</p>
              <p className="text-muted-foreground mb-4">
                A guide to spiritual enlightenment that teaches the importance of living in the present moment. 
                This transformative book offers practical teachings to help you find peace and happiness by focusing on the now.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400">Mindfulness</Badge>
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400">Spirituality</Badge>
                <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">Present Moment</Badge>
              </div>
              <div className="flex space-x-3">
                <Button className="genie-gradient hover:opacity-90" asChild data-testid="read-featured">
                  <a href="https://archive.org/details/powerofnow00tol" target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-book-reader mr-2"></i>
                    Read Online
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://archive.org/details/powerofnow00tol" target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-download mr-2"></i>
                    Download
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Categories */}
      <div className="space-y-8">
        {bookCategories.map((category) => (
          category.books.length > 0 && (
            <div key={category.name} className="fade-in">
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center mr-4`}>
                  <i className={`${category.icon} text-lg`}></i>
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-semibold text-primary">{category.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {category.books.length} book{category.books.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.books.map((book: any) => (
                  <Card key={book.id} className="hover:magical-border hover:glow-effect transition-all group" data-testid={`book-${book.id}`}>
                    <CardContent className="p-6">
                      <div className="flex space-x-4">
                        <div className="w-20 h-28 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <div className="text-center">
                            <i className="fas fa-book text-2xl text-primary mb-1"></i>
                            <div className="text-xs text-muted-foreground">Book</div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-lg mb-1 line-clamp-2">{book.title}</h3>
                          <p className="text-sm text-secondary mb-2">by {book.author}</p>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{book.description}</p>
                          <div className="flex flex-col space-y-2">
                            <Button 
                              size="sm" 
                              className="genie-gradient hover:opacity-90 w-full" 
                              asChild
                              data-testid={`read-${book.id}`}
                            >
                              <a href={book.url} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-book-reader mr-2"></i>
                                Read Online
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full" 
                              asChild
                              data-testid={`download-${book.id}`}
                            >
                              <a href={book.url} target="_blank" rel="noopener noreferrer">
                                <i className="fas fa-download mr-2"></i>
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* No Books Found */}
      {filteredBooks.length === 0 && books && (
        <Card className="magical-border fade-in">
          <CardContent className="p-8 text-center">
            <i className="fas fa-book-open text-4xl text-muted-foreground mb-4"></i>
            <h3 className="text-xl font-serif font-semibold mb-2 text-muted-foreground">
              No Books Found
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms to discover new wisdom."
                : "We're building our library of transformative books for you."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reading Benefits Section */}
      <Card className="magical-border mt-12 fade-in">
        <CardHeader>
          <CardTitle className="text-center text-xl font-serif text-primary">
            The Power of Reading for Wellness
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-brain text-green-600 dark:text-green-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Mental Growth</h3>
              <p className="text-sm text-muted-foreground">
                Expand your perspective and develop new ways of thinking
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-heart text-blue-600 dark:text-blue-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Emotional Healing</h3>
              <p className="text-sm text-muted-foreground">
                Find comfort and understanding through shared experiences
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-lightbulb text-purple-600 dark:text-purple-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Self-Discovery</h3>
              <p className="text-sm text-muted-foreground">
                Uncover insights about yourself and your potential
              </p>
            </div>
            <div>
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-peace text-yellow-600 dark:text-yellow-400 text-xl"></i>
              </div>
              <h3 className="font-medium mb-2">Inner Peace</h3>
              <p className="text-sm text-muted-foreground">
                Learn techniques for finding calm and balance in life
              </p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <blockquote className="text-lg font-serif italic text-foreground mb-4">
              "Reading is to the mind what exercise is to the body."
            </blockquote>
            <cite className="text-secondary font-medium">- Joseph Addison</cite>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
