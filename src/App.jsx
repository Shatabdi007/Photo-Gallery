import { useEffect, useReducer, useState, useCallback, useMemo } from "react";
import useFetchPhotos from "./hooks/useFetchPhotos";

/* ---------------- REDUCER ---------------- */

function reducer(state, action) {
  switch (action.type) {
    case "SET_PHOTOS":
      return { ...state, photos: action.payload, original: action.payload };

    case "TOGGLE_FAV":
      const exists = state.favourites.find((p) => p.id === action.payload.id);

      let newFav;

      if (exists) {
        newFav = state.favourites.filter((p) => p.id !== action.payload.id);
      } else {
        newFav = [...state.favourites, action.payload];
      }

      localStorage.setItem("favourites", JSON.stringify(newFav));

      return { ...state, favourites: newFav };

    case "DELETE":
      return {
        ...state,
        photos: state.photos.filter((p) => p.id !== action.payload),
      };

    case "RESET":
      return {
        ...state,
        photos: state.original,
      };

    default:
      return state;
  }
}

/* ---------------- APP ---------------- */

export default function App() {

  /* CUSTOM HOOK */
  const { photos, loading, error } = useFetchPhotos();

  const [search, setSearch] = useState("");
  const [dark, setDark] = useState(false);
  const [selected, setSelected] = useState(null);

  const [state, dispatch] = useReducer(reducer, {
    photos: [],
    original: [],
    favourites: JSON.parse(localStorage.getItem("favourites")) || [],
  });

  /* SEND FETCHED PHOTOS TO REDUCER */

  useEffect(() => {

    if (photos.length > 0) {
      dispatch({ type: "SET_PHOTOS", payload: photos });
    }

  }, [photos]);

  /* -------- SEARCH -------- */

  const handleSearch = useCallback((e) => {
    setSearch(e.target.value);
  }, []);

  /* -------- FILTER -------- */

  const filteredPhotos = useMemo(() => {

    return state.photos.filter((photo) =>
      photo.author.toLowerCase().includes(search.toLowerCase())
    );

  }, [state.photos, search]);

  /* -------- DOWNLOAD -------- */

  const download = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = "image";
    link.click();
  };

  if (loading)
    return <p className="text-center mt-10 text-xl">Loading photos...</p>;

  if (error)
    return <p className="text-center text-red-500 mt-10">{error}</p>;

  return (
    <div className={dark ? "bg-gray-900 text-white min-h-screen" : "bg-gray-100 min-h-screen"}>

      {/* HEADER */}

      <div className="flex justify-between items-center p-6">

        <h1 className="text-3xl font-bold">📸 Photo Gallery</h1>

        <button
          onClick={() => setDark(!dark)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {dark ? "Light" : "Dark"}
        </button>

      </div>

      {/* SEARCH + RESET */}

      <div className="flex gap-4 justify-center mb-6">

        <input
          type="text"
          placeholder="Search author..."
          onChange={handleSearch}
          className="p-2 border rounded text-black"
        />

        <button
          onClick={() => dispatch({ type: "RESET" })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Reset
        </button>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">

        {filteredPhotos.map((photo) => {

          const isFav = state.favourites.find((p) => p.id === photo.id);

          return (

            <div key={photo.id} className="shadow-lg rounded overflow-hidden">

              <img
                src={photo.download_url}
                alt=""
                className="h-60 w-full object-cover cursor-pointer"
                onClick={() => setSelected(photo.download_url)}
              />

              <div className="flex justify-between items-center p-3">

                <p className="text-sm">{photo.author}</p>

                <div className="flex gap-2">

                  {/* FAV */}

                  <button
                    onClick={() =>
                      dispatch({ type: "TOGGLE_FAV", payload: photo })
                    }
                  >
                    {isFav ? "❤️" : "🤍"}
                  </button>

                  {/* DOWNLOAD */}

                  <button
                    onClick={() => download(photo.download_url)}
                    className="text-blue-500"
                  >
                    ⬇
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      dispatch({ type: "DELETE", payload: photo.id })
                    }
                    className="text-red-500"
                  >
                    🗑
                  </button>

                </div>

              </div>

            </div>

          );

        })}

      </div>

      {/* IMAGE MODAL */}

      {selected && (

        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={() => setSelected(null)}
        >

          <img
            src={selected}
            className="max-h-[80%] rounded"
          />

        </div>

      )}

    </div>
  );
}