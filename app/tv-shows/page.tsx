"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Play,
  Info,
  Star,
  Calendar,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/VideoPlayer";
import { Navigation } from "@/components/Navigation";
import { useFavorites } from "@/hooks/useFavorites";
import Image from "next/image";
import { MovieCard } from "@/components/MovieCard";

interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
}

interface Genre {
  id: number;
  name: string;
}

interface TMDbResponse {
  page: number;
  results: TVShow[];
  total_pages: number;
  total_results: number;
}

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function TVShowsPage() {
  const [tvShows, setTVShows] = useState<TVShow[]>([]);
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
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { favorites, addToFavorites, removeFromFavorites, isFavorite } =
    useFavorites();

  const years = [
    "all",
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
    { value: "first_air_date.desc", label: "Newest" },
    { value: "name.asc", label: "A-Z" },
  ];

  // Fetch genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/genre/tv/list?api_key=${API_KEY}`
        );
        const data = await response.json();
        setGenres(data.genres || []);
      } catch (err) {
        console.error("Error fetching genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch TV shows
  useEffect(() => {
    const fetchTVShows = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${currentPage}&sort_by=${sortBy}`;

        if (selectedGenre !== "all") {
          url += `&with_genres=${selectedGenre}`;
        }

        if (selectedYear !== "all") {
          url += `&first_air_date_year=${selectedYear}`;
        }

        if (selectedRating !== "all") {
          url += `&vote_average.gte=${selectedRating}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch TV shows");
        }

        const data: TMDbResponse = await response.json();
        setTVShows(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTVShows();
  }, [currentPage, sortBy, selectedGenre, selectedYear, selectedRating]);

  // Search TV shows
  useEffect(() => {
    const searchTVShows = async () => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(
            searchQuery
          )}&page=${currentPage}`
        );
        if (!response.ok) {
          throw new Error("Failed to search TV shows");
        }

        const data: TMDbResponse = await response.json();
        setTVShows(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(searchTVShows, 500);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, currentPage]);

  const handlePlay = (show: TVShow) => {
    setSelectedShow(show);
    setShowVideoPlayer(true);
  };

  const handleMoreInfo = (show: TVShow) => {
    setSelectedShow(show);
    setShowInfo(true);
  };

  const handleFavoriteToggle = (show: TVShow) => {
    if (isFavorite(show.id)) {
      removeFromFavorites(show.id);
    } else {
      addToFavorites({ ...show, media_type: "tv", title: show.name });
    }
  };

  const clearFilters = () => {
    setSelectedGenre("all");
    setSelectedYear("all");
    setSelectedRating("all");
    setSortBy("popularity.desc");
    setSearchQuery("");
    setCurrentPage(1);
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <div className="w-full px-4 lg:px-8 py-6 border-b">
        <h1 className="text-3xl font-bold">TV Shows</h1>
        <p className="text-muted-foreground mt-2">
          Discover the best TV series and shows
        </p>
      </div>

      {/* Search and Filters */}
      <div className="w-full px-4 lg:px-8 py-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search TV shows..."
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

      {/* TV Shows Grid */}
      <main className="w-full px-4 lg:px-8 pb-8">
        {loading ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Loading TV Shows...</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {Array.from({ length: 20 }).map((_, index) => (
                <MovieCard isLoading key={index} />
              ))}
            </div>
          </>
        ) : tvShows.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📺</div>
            <h2 className="text-2xl font-semibold mb-2">No TV shows found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No results for "${searchQuery}"`
                : "No TV shows match your filters"}
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
                  : "All TV Shows"}
                <span className="text-muted-foreground ml-2">
                  ({tvShows.length} results)
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
              {tvShows.map((show) => {
                const movieFormat = {
                  ...show,
                  title: show.name,
                  release_date: show.first_air_date,
                };
                return (
                  <div
                    key={show.id}
                    className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer h-full"
                  >
                    <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                      <Image
                        src={
                          show.poster_path
                            ? `${IMAGE_BASE_URL}${show.poster_path}`
                            : "/placeholder.svg?height=750&width=500"
                        }
                        alt={show.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                      />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <h3 className="text-white font-bold text-lg line-clamp-2">
                              {show.name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {show.first_air_date
                                  ? new Date(show.first_air_date).getFullYear()
                                  : "N/A"}
                              </span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>
                                {show.vote_average
                                  ? show.vote_average.toFixed(1)
                                  : "N/A"}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {genres
                                .filter((genre) =>
                                  show.genre_ids.includes(genre.id)
                                )
                                .slice(0, 2)
                                .map((genre) => (
                                  <Badge
                                    key={genre.id}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {genre.name}
                                  </Badge>
                                ))}
                            </div>
                          </div>

                          <p className="text-gray-300 text-sm line-clamp-3">
                            {show.overview}
                          </p>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlay(show);
                              }}
                              className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Play
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoreInfo(show);
                              }}
                              className="flex-1"
                            >
                              <Info className="w-4 h-4 mr-1" />
                              Info
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(show);
                            }}
                            className={`w-full ${
                              isFavorite(show.id)
                                ? "text-red-600"
                                : "text-white"
                            }`}
                          >
                            <Heart
                              className={`w-4 h-4 mr-2 ${
                                isFavorite(show.id) ? "fill-red-600" : ""
                              }`}
                            />
                            {isFavorite(show.id)
                              ? "Remove from List"
                              : "Add to List"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Show Info (Always Visible) */}
                    <div className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1">
                        {show.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {show.first_air_date
                            ? new Date(show.first_air_date).getFullYear()
                            : "N/A"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>
                            {show.vote_average
                              ? show.vote_average.toFixed(1)
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                  Previous
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
                  Next
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
          {selectedShow && (
            <VideoPlayer
              movie={{
                ...selectedShow,
                title: selectedShow.name,
                release_date: selectedShow.first_air_date,
              }}
              onClose={() => setShowVideoPlayer(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Show Info Modal */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedShow?.name}</DialogTitle>
          </DialogHeader>
          {selectedShow && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Image
                  src={
                    selectedShow.poster_path
                      ? `${IMAGE_BASE_URL}${selectedShow.poster_path}`
                      : "/placeholder.svg?height=300&width=200"
                  }
                  alt={selectedShow.name}
                  width={150}
                  height={225}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {selectedShow.first_air_date
                        ? new Date(selectedShow.first_air_date).getFullYear()
                        : "N/A"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {selectedShow.vote_average
                          ? selectedShow.vote_average.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {genres
                      .filter((genre) =>
                        selectedShow.genre_ids.includes(genre.id)
                      )
                      .map((genre) => (
                        <Badge key={genre.id} variant="secondary">
                          {genre.name}
                        </Badge>
                      ))}
                  </div>
                  <p className="text-sm">{selectedShow.overview}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowInfo(false);
                        handlePlay(selectedShow);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleFavoriteToggle(selectedShow)}
                      className={
                        isFavorite(selectedShow.id) ? "text-red-600" : ""
                      }
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          isFavorite(selectedShow.id) ? "fill-red-600" : ""
                        }`}
                      />
                      {isFavorite(selectedShow.id)
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
