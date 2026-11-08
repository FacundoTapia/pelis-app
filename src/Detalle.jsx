import { useState, useEffect } from 'react'
import { detalle, IMG } from './tmdb'

export default function Detalle({ item, onCerrar, yaEnLista, onAgregar }) {
  const [datos, setDatos] = useState(null) // null = todavía cargando
  const [error, setError] = useState(false)

  // se ejecuta al abrir la ventana: pide el detalle a TMDB
  useEffect(() => {
    detalle(item.tmdb_id, item.media_type)
      .then(setDatos) // cuando llega, lo guardamos (es lo mismo que (d) => setDatos(d))
      .catch(() => setError(true)) // si falla internet o la clave, mostramos aviso
  }, [item])

  return (
    // el fondo oscuro: al tocarlo se cierra la ventana
    <div className="fondo" onClick={onCerrar}>
      {/* stopPropagation evita que un toque DENTRO de la ventana cierre todo */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="cerrar" onClick={onCerrar}>✕</button>

        <div className="modal-cabecera">
          {item.poster_path && <img src={IMG + item.poster_path} alt={item.title} />}
          <div>
            <h2>{item.title}</h2>
            {datos && (
              <>
                <p className="meta">
                  {item.media_type === 'movie' ? 'Película' : 'Serie'}
                  {datos.year && ` · ${datos.year}`}
                  {datos.duracion && ` · ${datos.duracion}`}
                </p>
                {datos.generos.length > 0 && <p className="meta">{datos.generos.join(', ')}</p>}
                {/* toFixed(1) deja un solo decimal: 8.4 */}
                {datos.puntaje > 0 && <p className="puntaje">⭐ {datos.puntaje.toFixed(1)} / 10</p>}
              </>
            )}
          </div>
        </div>
        
        {/* si la peli todavía no está en la lista, ofrecemos agregarla desde acá */}
        {!yaEnLista && <button className="agregar-detalle" onClick={() => onAgregar(item)}>+ Agregar a la lista</button>}
        {yaEnLista && <p className="en-lista">✓ Ya está en la lista</p>}

        {!datos && !error && <p>Cargando...</p>}
        {error && <p className="error">No se pudo cargar la información</p>}
        {datos && <p>{datos.sinopsis || 'Sin sinopsis disponible.'}</p>}
      </div>
    </div>
  )
}