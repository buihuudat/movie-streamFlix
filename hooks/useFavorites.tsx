"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface FavoriteItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type: "movie" | "tv";
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem("streamflix-favorites");
    if (savedFavorites) {
      try {
        console.log({ savedFavorites });
        setFavorites(JSON.parse(savedFavorites));
      } catch (error) {
        console.error("Error parsing favorites from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (favorites.length === 0) {
      localStorage.removeItem("streamflix-favorites");
      return;
    }
    localStorage.setItem("streamflix-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addToFavorites = (item: FavoriteItem) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === item.id)) {
        return prev;
      }
      return [...prev, item];
    });
    toast.success(`${item.title || item.name} added to favorites`);
  };

  const removeFromFavorites = (id: number) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
    toast.error("Removed from favorites");
  };

  const isFavorite = (id: number) => {
    return favorites.some((fav) => fav.id === id);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  return {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
  };
}
