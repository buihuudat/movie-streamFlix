"use client";

import { useState } from "react";
import { Play, Info, Star, Calendar, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VideoPlayer } from "@/components/VideoPlayer";
import { useFavorites } from "@/hooks/useFavorites";
import Image from "next/image";
import { MovieCard } from "@/components/MovieCard";
import { Navigation } from "@/components/Navigation";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export default function MyListPage() {
  const { favorites, removeFromFavorites, isFavorite } = useFavorites();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handlePlay = (item: any) => {
    setSelectedItem(item);
    setShowVideoPlayer(true);
  };

  const handleMoreInfo = (item: any) => {
    setSelectedItem(item);
    setShowInfo(true);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="w-full px-4 lg:px-8 py-6 border-b">
          <h1 className="text-3xl font-bold">My List</h1>
          <p className="text-muted-foreground mt-2">
            Your favorite movies and TV shows
          </p>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">💔</div>
          <h2 className="text-2xl font-semibold mb-2">Your list is empty</h2>
          <p className="text-muted-foreground mb-4">
            Start adding movies and TV shows to your favorites to see them here
          </p>
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
          >
            Browse Movies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <div className="w-full px-4 lg:px-8 py-6 border-b">
        <h1 className="text-3xl font-bold">My List</h1>
        <p className="text-muted-foreground mt-2">
          Your favorite movies and TV shows ({favorites.length} items)
        </p>
      </div>

      {/* Favorites Grid */}
      <main className="w-full px-4 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
          {favorites.map((item: any) => (
            <MovieCard
              key={item.id}
              movie={item}
              genres={item?.genres || []}
              onPlay={handlePlay}
              onMoreInfo={handleMoreInfo}
              onFavoriteToggle={(movie) => removeFromFavorites(movie.id)}
              isFavorite={isFavorite(item.id)}
            />
          ))}
        </div>
      </main>

      {/* Video Player Modal */}
      <Dialog open={showVideoPlayer} onOpenChange={setShowVideoPlayer}>
        <DialogContent className="max-w-6xl w-full h-[80vh] p-0">
          {selectedItem && (
            <VideoPlayer
              movie={selectedItem}
              onClose={() => setShowVideoPlayer(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem?.title || selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Image
                  src={
                    selectedItem.poster_path
                      ? `${IMAGE_BASE_URL}${selectedItem.poster_path}`
                      : "/placeholder.svg?height=300&width=200"
                  }
                  alt={selectedItem.title || selectedItem.name}
                  width={150}
                  height={225}
                  className="rounded-lg object-cover"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {selectedItem.release_date || selectedItem.first_air_date
                        ? new Date(
                            selectedItem.release_date ||
                              selectedItem.first_air_date
                          ).getFullYear()
                        : "N/A"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>
                        {selectedItem.vote_average
                          ? selectedItem.vote_average.toFixed(1)
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {selectedItem.media_type === "movie" ? "Movie" : "TV Show"}
                  </Badge>
                  <p className="text-sm">{selectedItem.overview}</p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setShowInfo(false);
                        handlePlay(selectedItem);
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play Now
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        removeFromFavorites(selectedItem.id);
                        setShowInfo(false);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove from List
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
