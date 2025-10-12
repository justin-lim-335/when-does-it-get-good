// src/components/Carousel.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Show {
  tmdb_id: number;
  title: string;
  poster_path?: string;
  first_air_date?: string;
}

interface CarouselProps {
  title: string;
  shows: Show[];
}

export default function Carousel({ title, shows }: CarouselProps) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  // Update itemsPerPage based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setItemsPerPage(2); // mobile
      else if (width < 1024) setItemsPerPage(4); // tablet
      else setItemsPerPage(6); // desktop
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(shows.length / itemsPerPage);

  const handlePrev = () => {
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setIndex((prev) => Math.min(prev + 1, totalPages - 1));
  };

  // Calculate start index for current page
  let start = index * itemsPerPage;

  // If we are on the last page, snap to show the last full set
  if (index === totalPages - 1) {
    start = Math.max(shows.length - itemsPerPage, 0);
  }

  // Calculate translateX for smooth sliding
  const translateX = -(start * (100 / itemsPerPage));

  return (
    <div className="relative group mb-8">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>

      <div className="relative flex items-center">
        {/* Left Arrow */}
        {index > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-0 z-10 h-full px-3 bg-black/30 hover:bg-black/60 text-white text-3xl rounded-r-lg transition-opacity opacity-0 group-hover:opacity-100"
          >
            ‹
          </button>
        )}

        {/* Carousel Content */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(${translateX}%)` }}
          >
            {shows.map((show) => (
              <div
                key={show.tmdb_id}
                className={`flex-shrink-0 px-2`}
                style={{ width: `${100 / itemsPerPage}%` }}
                onClick={() => navigate(`/shows/${show.tmdb_id}`)}
              >
                <img
                  src={show.poster_path ? `https://image.tmdb.org/t/p/w300${show.poster_path}` : "/placeholder.png"}
                  alt={show.title}
                  className="rounded-lg shadow-md mb-2 w-full h-auto object-cover cursor-pointer"
                />
                <p className="text-sm text-center truncate">{show.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow */}
        {index < totalPages - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-0 z-10 h-full px-3 bg-black/30 hover:bg-black/60 text-white text-3xl rounded-l-lg transition-opacity opacity-0 group-hover:opacity-100"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
