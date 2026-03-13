import { useCallback, useMemo, useReducer, useState, useEffect } from "react";
import useFetchPhotos from "../hooks/useFetchPhotos";
import { favouritesReducer } from "../reducer/favouritesReducer";

export default function Gallery() {

  const { photos, loading, error } = useFetchPhotos();

  const [search, setSearch] = useState("");

  const [favourites, dispatch] = useReducer(
    favouritesReducer,
    JSON.parse(localStorage.getItem("favourites")) || []
  );

  useEffect(() => {
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [favourites]);

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  const filteredPhotos = useMemo(() => {

    return photos.filter((photo) =>
      photo.author.toLowerCase().includes(search.toLowerCase())
    );

  }, [photos, search]);

  if (loading)
    return <p className="text-center mt-10 text-xl">Loading photos...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (

    <div className="p-6">

      {/* SEARCH */}

      <input
        type="text"
        placeholder="Search by author..."
        className="border p-2 mb-6 w-full rounded"
        onChange={handleSearch}
      />

      {/* GRID */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {filteredPhotos.map((photo) => {

          const isFav = favourites.find((p) => p.id === photo.id);

          return (

            <div key={photo.id} className="shadow rounded-lg overflow-hidden">

              <img
                src={photo.download_url}
                alt={photo.author}
                className="h-60 w-full object-cover"
              />

              <div className="flex justify-between items-center p-3">

                <p className="text-sm font-medium">
                  {photo.author}
                </p>

                <button
                  onClick={() =>
                    dispatch({ type: "TOGGLE_FAV", payload: photo })
                  }
                  className="text-xl"
                >
                  {isFav ? "❤️" : "🤍"}
                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>

  );

}