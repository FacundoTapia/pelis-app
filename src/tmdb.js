const KEY = import.meta.env.VITE_TMDB_KEY // la clave que guardamos en .env.local
const BASE = 'https://api.themoviedb.org/3' // dirección base de la API
export const IMG = 'https://image.tmdb.org/t/p/w342' // base de las imágenes (w342 = ancho 342px)

// Busca películas y series por texto
export async function buscar(texto) {
  // encodeURIComponent convierte espacios y caracteres raros para que entren en una URL
  // language=es-AR → resultados y sinopsis en español
  const url = `${BASE}/search/multi?api_key=${KEY}&language=es-AR&query=${encodeURIComponent(texto)}`

  const res = await fetch(url) // hace el pedido a internet
  const data = await res.json() // convierte la respuesta a un objeto de JavaScript

  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv') // descarta personas
    .map((r) => ({
      tmdb_id: r.id,
      media_type: r.media_type,
      title: r.title || r.name, // las pelis usan "title", las series "name"
      poster_path: r.poster_path,
      year: (r.release_date || r.first_air_date || '').slice(0, 4), // "2019-05-01" → "2019"
    }))
}