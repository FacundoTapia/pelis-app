import { useState } from 'react'
import { buscar, IMG } from './tmdb'

export default function Buscador({onAgregar, yaAgregados}) {
  const [texto, setTexto] = useState('')
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault() // evita que recargue la página
    if (!texto.trim()) return // si está vacío, no hace nada

    setBuscando(true)
    try {
      setResultados(await buscar(texto))
    } catch {
      setResultados([]) // si falla internet o la clave, no rompe la app
    }
    setBuscando(false)
  }

  return (
    <div>
      <form className="buscador" onSubmit={handleSubmit}>
        <input
          placeholder="Buscar película o serie..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <button type="submit">Buscar</button>
      </form>

      {buscando && <p>Buscando...</p>}

      <ul className="resultados">
        {resultados.map((r) => (
          // key ayuda a React a distinguir cada elemento de la lista
            <li key={`${r.media_type}-${r.tmdb_id}`}>
                {r.poster_path ? (
                <img src={IMG + r.poster_path} alt={r.title} />
                ) : (
                <div className="sin-poster">Sin póster</div>
                )}
                <div>
                <strong>{r.title}</strong>
                <small>
                    {r.media_type === 'movie' ? 'Película' : 'Serie'} {r.year && `· ${r.year}`}
                </small>
                </div>
                {yaAgregados.includes(`${r.media_type}-${r.tmdb_id}`) ? (
                    <span className="en-lista">✓ En la lista</span> // si ya está agregada, solo avisa
                    ) : (
                    <button className="agregar" onClick={() => onAgregar(r)}>+ Agregar</button>
                    )}
            </li>
        ))}
      </ul>
    </div>
  )
}