"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Play,
  Star,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/VideoPlayer";
import { MovieCard } from "@/components/MovieCard";
import { useFavorites } from "@/hooks/useFavorites";
import Image from "next/image";
import { Navigation } from "@/components/Navigation";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  video: boolean;
}

interface Genre {
  id: number;
  name: string;
}

interface TMDbResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function HomePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMovieInfo, setShowMovieInfo] = useState(false);
  const [forcusRerender, setForcusRerender] = useState(0);

  const { favorites, addToFavorites, removeFromFavorites, isFavorite } =
    useFavorites();

  const years = [
    "all",
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
  ];
  const ratings = ["all", "9", "8", "7", "6", "5"];
  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "release_date.desc", label: "Newest" },
    { value: "title.asc", label: "A-Z" },
  ];

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/genre/movie/list?api_key=${API_KEY}`
        );
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch movies
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${currentPage}&sort_by=${sortBy}`;

        if (selectedGenre !== "all") {
          url += `&with_genres=${selectedGenre}`;
        }

        if (selectedYear !== "all") {
          url += `&primary_release_year=${selectedYear}`;
        }

        if (selectedRating !== "all") {
          url += `&vote_average.gte=${selectedRating}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data: TMDbResponse = await response.json();
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [
    currentPage,
    sortBy,
    selectedGenre,
    selectedYear,
    selectedRating,
    forcusRerender,
  ]);

  // Search movies
  useEffect(() => {
    const searchMovies = async () => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
            searchQuery
          )}&page=${currentPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to search movies");
        }

        const data: TMDbResponse = await response.json();
        setMovies(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(searchMovies, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, currentPage]);

  const handlePlay = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowVideoPlayer(true);
  };

  const handleMoreInfo = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieInfo(true);
  };

  const handleFavoriteToggle = (movie: Movie) => {
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites({ ...movie, media_type: "movie" });
    }
  };

  const clearFilters = () => {
    setSelectedGenre("all");
    setSelectedYear("all");
    setSelectedRating("all");
    setSortBy("popularity.desc");
    setSearchQuery("");
    setCurrentPage(1);
    setForcusRerender(forcusRerender + 1);
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Search and Filters */}
      <div className="w-full px-4 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Toggle and Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(selectedGenre !== "all" ||
              selectedYear !== "all" ||
              selectedRating !== "all" ||
              searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <label className="text-sm font-medium">Genre</label>
                <Select
                  value={selectedGenre}
                  onValueChange={(value) => {
                    setSelectedGenre(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select
                  value={selectedYear}
                  onValueChange={(value) => {
                    setSelectedYear(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year === "all" ? "All Years" : year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select
                  value={selectedRating}
                  onValueChange={(value) => {
                    setSelectedRating(value);
                    handleFilterChange();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ratings.map((rating) => (
                      <SelectItem key={rating} value={rating}>
                        {rating === "all" ? "All Ratings" : `${rating}+ Stars`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      <main className="w-full px-4 lg:px-8 pb-8">
        {loading ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Loading Movies...</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {Array.from({ length: 20 }).map((_, index) => (
                <MovieCard isLoading key={index} />
              ))}
            </div>
          </>
        ) : movies.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h2 className="text-2xl font-semibold mb-2">No movies found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No movies match your filters"}
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {searchQuery
                  ? `Search results for "${searchQuery}"`
                  : "Popular Movies"}
                <span className="text-muted-foreground ml-2">
                  ({movies.length} results)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  genres={genres}
                  onPlay={handlePlay}
                  onMoreInfo={handleMoreInfo}
                  onFavoriteToggle={handleFavoriteToggle}
                  isFavorite={isFavorite(movie.id)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Video Player Modal */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
          {selectedMovie && (
            <VideoPlayer
              movie={selectedMovie}
              onClose={() => setShowVideoPlayer(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Movie Info Modal */}
      <Dialog open={showMovieInfo} onOpenChange={setShowMovieInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMovie?.title}</DialogTitle>
          </DialogHeader>
          {selectedMovie && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Image
                  src={
                    selectedMovie.poster_path
                      ? `${IMAGE_BASE_URL}${selectedMovie.poster_path}`
                      : "/placeholder.svg?height=300&width=200"
                  }
                  alt={selectedMovie.title}
                  width={150}
                  height={225}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {selectedMovie.release_date
                        ? new Date(selectedMovie.release_date).getFullYear()
                        : "N/A"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {selectedMovie.vote_average
                          ? selectedMovie.vote_average.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres
                      .filter((genre) =>
                        selectedMovie.genre_ids.includes(genre.id)
                      )
                      .map((genre) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-sm">{selectedMovie.overview}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowMovieInfo(false);
                        handlePlay(selectedMovie);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleFavoriteToggle(selectedMovie)}
                      className={
                        isFavorite(selectedMovie.id) ? "text-red-600" : ""
                      }
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          isFavorite(selectedMovie.id) ? "fill-red-600" : ""
                        }`}
                      />
                      {isFavorite(selectedMovie.id)
                        ? "Remove from List"
                        : "Add to List"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
