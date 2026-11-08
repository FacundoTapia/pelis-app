import { useState } from 'react'
import { IMG } from './tmdb'
import { clasificar } from './nota'

export default function Lista({ items, onToggleVisto, onBorrar, onAbrir }) {
  const [pestana, setPestana] = useState('pendientes') // 'pendientes' o 'vistas'

  // filter se queda solo con los items que cumplen la condición
  const mostrados = items.filter((i) => (pestana === 'vistas' ? i.watched : !i.watched))

  return (
    <section>
      <div className="tabs">
        <button
          className={pestana === 'pendientes' ? 'activa' : ''}
          onClick={() => setPestana('pendientes')}
        >
          Pendientes ({items.filter((i) => !i.watched).length})
        </button>
        <button
          className={pestana === 'vistas' ? 'activa' : ''}
          onClick={() => setPestana('vistas')}
        >
          Vistas ({items.filter((i) => i.watched).length})
        </button>
      </div>

      {mostrados.length === 0 && <p className="vacio">No hay nada por acá todavía.</p>}

      <ul className="resultados">
        {mostrados.map((item) => (
          <li key={item.id}>
            {item.poster_path ? (
              <img
                className="clickeable"
                src={IMG + item.poster_path}
                alt={item.title}
                onClick={() => onAbrir(item)}
              />
            ) : (
              <div className="sin-poster clickeable" onClick={() => onAbrir(item)}>Sin póster</div>
            )}
            <div className="info">
              <strong className="clickeable" onClick={() => onAbrir(item)}>{item.title}</strong>
              <small>{item.media_type === 'movie' ? 'Película' : 'Serie'}</small>
              {/* si la peli está vista y tiene reseña, la mostramos directo en la lista */}
              {item.watched && (item.rating != null || item.review) && (
                <div className="resena-lista">
                  {item.rating != null && (
                    <span className="nota-chip" style={{ color: clasificar(item.rating).color }}>
                      {item.rating} · {clasificar(item.rating).etiqueta}
                    </span>
                  )}
                  {item.review && <p className="comentario-lista">{item.review}</p>}
                  <small>Por {item.reviewed_by_name}</small>
                </div>
              )}
              <div className="acciones">
                <button onClick={() => onToggleVisto(item)}>
                  {item.watched ? 'Volver a pendiente' : '✓ Ya la vimos'}
                </button>
                <button className="secundario" onClick={() => onBorrar(item)}>
                  🗑
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}