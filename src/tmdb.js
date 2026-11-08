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

// Trae el detalle completo de una peli o serie
// tipo es 'movie' o 'tv', justo lo que guardamos en media_type, y coincide con la URL de TMDB
export async function detalle(id, tipo) {
  // función auxiliar: hace el pedido en el idioma que le pasemos
  async function pedir(idioma) {
    const res = await fetch(`${BASE}/${tipo}/${id}?api_key=${KEY}&language=${idioma}`)
    return res.json()
  }

  const d = await pedir('es-AR')

  // respaldo: si no hay sinopsis en es-AR, probamos con español de México
  if (!d.overview) {
    const alternativo = await pedir('es-MX')
    d.overview = alternativo.overview
  }

  return {
    title: d.title || d.name,
    year: (d.release_date || d.first_air_date || '').slice(0, 4),
    generos: (d.genres || []).map((g) => g.name), // [{id, name}, ...] → ['Drama', 'Ciencia ficción']
    puntaje: d.vote_average, // puntaje de TMDB, de 0 a 10
    sinopsis: d.overview,
    // las pelis tienen runtime (minutos); las series, cantidad de temporadas
    duracion:
      tipo === 'movie'
        ? d.runtime ? `${d.runtime} min` : ''
        : d.number_of_seasons ? `${d.number_of_seasons} temporada(s)` : '',
  }
}