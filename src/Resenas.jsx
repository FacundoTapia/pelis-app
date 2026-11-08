import { useState } from 'react'
import { supabase } from './supabase'

export default function Resenas({ item, userName }) {
  // arrancamos con lo que ya está guardado en la película (si hay algo)
  // ?? '' = si el valor es null, usamos texto vacío
  const [rating, setRating] = useState(item.rating ?? '')
  const [comentario, setComentario] = useState(item.review ?? '')
  const [mensaje, setMensaje] = useState('')

  async function guardar(e) {
    e.preventDefault() // evita que recargue la página
    setMensaje('')

    // actualizamos las columnas de ESTA película
    const { error } = await supabase
      .from('items')
      .update({
        rating: rating ? Number(rating) : null, // convierte el texto a número; vacío = null
        review: comentario.trim() || null,
        reviewed_by_name: userName, // quién está guardando
        reviewed_at: new Date().toISOString(), // y cuándo
      })
      .eq('id', item.id) // IMPORTANTE: sin esto actualizaría TODAS las películas

    setMensaje(error ? 'No se pudo guardar' : 'Guardado ✓')
  }

  return (
    <div className="resenas">
      <h3>Nuestra reseña</h3>
      <form onSubmit={guardar}>
        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          <option value="">Sin puntaje</option>
          {/* Array.from crea la lista [1, 2, ... 10] para armar las opciones */}
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} / 10</option>
          ))}
        </select>
        <textarea
          placeholder="Notas o comentario..."
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          rows={3}
        />
        <button type="submit">Guardar reseña</button>
        {mensaje && <small>{mensaje}</small>}
      </form>

      {/* si alguien ya guardó algo, mostramos quién y cuándo */}
      {item.reviewed_at && (
        <p className="autor">
          Última edición: {item.reviewed_by_name} ·{' '}
          {/* toLocaleString con 'es-AR' muestra la fecha en formato argentino */}
          {new Date(item.reviewed_at).toLocaleString('es-AR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      )}
    </div>
  )
}