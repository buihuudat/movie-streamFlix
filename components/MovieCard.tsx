"use client";

import { useState } from "react";
import { Play, Info, Star, Calendar, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

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

interface MovieCardProps {
  movie: Movie;
  genres: Genre[];
  onPlay: (movie: Movie) => void;
  onMoreInfo: (movie: Movie) => void;
  onFavoriteToggle: (movie: Movie) => void;
  isFavorite: boolean;
  isLoading?: boolean;
}

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function MovieCard({
  movie,
  genres,
  onPlay,
  onMoreInfo,
  onFavoriteToggle,
  isFavorite,
  isLoading = false,
}: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (isLoading) {
    return (
      <Card className="h-full p-0">
        <CardContent className="p-0">
          <div className="aspect-[2/3] bg-muted animate-pulse rounded-t-lg" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="flex justify-between">
              <div className="h-3 w-12 bg-muted animate-pulse rounded" />
              <div className="h-3 w-8 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const movieGenres = genres.filter((genre) =>
    movie.genre_ids.includes(genre.id)
  );
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";
  const rating = movie.vote_average ? Number(movie.vote_average.toFixed(1)) : 0;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer h-full p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0 relative h-full">
        <div className="aspect-[2/3] relative overflow-hidden">
          <Image
            src={
              movie.poster_path
                ? `${IMAGE_BASE_URL}${movie.poster_path}`
                : "/placeholder.svg?height=750&width=500"
            }
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          />

          {/* Hover Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            } flex flex-col justify-end p-4`}
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <h3 className="text-white font-bold text-lg line-clamp-2">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{rating}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {movieGenres.slice(0, 2).map((genre) => (
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
                {movie.overview}
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlay(movie);
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
                    onMoreInfo(movie);
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
                  onFavoriteToggle({ ...movie, genres });
                }}
                className={`w-full cursor-pointer ${
                  isFavorite ? "text-red-600" : "text-white"
                }`}
              >
                <Heart
                  className={`w-4 h-4 mr-2 ${isFavorite ? "fill-red-600" : ""}`}
                />
                {isFavorite ? "Remove from List" : "Add to List"}
              </Button>
            </div>
          </div>
        </div>

        {/* Movie Info (Always Visible) */}
        <div className="p-3 space-y-2">
          <h3 className="font-semibold text-sm line-clamp-1">{movie.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{year}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{rating}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
