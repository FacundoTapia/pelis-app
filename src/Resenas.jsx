import { useState } from 'react'
import { supabase } from './supabase'

// Según la nota devuelve el color y el texto del rango
function clasificar(nota) {
  if (nota < 4) return { color: '#e5484d', etiqueta: 'Desaprobado' }
  if (nota < 6) return { color: '#f5a524', etiqueta: 'Apenas aprobado' }
  if (nota < 8) return { color: '#3b82f6', etiqueta: 'Buena peli' }
  return { color: '#30a46c', etiqueta: 'Peliculón' }
}

export default function Resenas({ item, userName }) {
  // copia local de la película: al guardar la actualizamos con lo que devuelve Supabase
  const [datos, setDatos] = useState(item)

  // != null chequea null y undefined, pero deja pasar el 0 (que es una nota válida)
  const tieneResena = datos.rating != null || !!datos.review

  // si todavía no hay reseña arrancamos con el formulario abierto; si hay, mostramos la reseña
  const [editando, setEditando] = useState(!tieneResena)
  const [rating, setRating] = useState(item.rating ?? '') // ?? '' = si es null, texto vacío
  const [comentario, setComentario] = useState(item.review ?? '')
  const [mensaje, setMensaje] = useState('')

  async function guardar(e) {
    e.preventDefault() // evita que recargue la página
    setMensaje('')

    const nota = rating === '' ? null : Number(rating) // el input da texto; lo pasamos a número
    const texto = comentario.trim() || null

    if (nota !== null && (Number.isNaN(nota) || nota < 0 || nota > 10)) {
      setMensaje('La nota tiene que estar entre 0 y 10')
      return // return corta la función: no se guarda nada
    }
    if (nota === null && !texto) {
      setMensaje('Poné una nota o un comentario')
      return
    }

    const { data, error } = await supabase
      .from('items')
      .update({
        rating: nota,
        review: texto,
        reviewed_by_name: userName, // quién guarda
        reviewed_at: new Date().toISOString(), // y cuándo
      })
      .eq('id', item.id) // IMPORTANTE: sin esto actualizaría TODAS las películas
      .select() // pedimos que nos devuelva la fila actualizada
      .single() // ...una sola, no una lista

    if (error) {
      setMensaje('No se pudo guardar')
    } else {
      setDatos(data)
      setEditando(false) // cerramos el formulario para que se vea la reseña
    }
  }

  // cancelar la edición: volvemos a los valores guardados y cerramos el formulario
  function cancelar() {
    setRating(datos.rating ?? '')
    setComentario(datos.review ?? '')
    setMensaje('')
    setEditando(false)
  }

  // ---------- Modo edición: formulario ----------
  if (editando) {
    return (
      <div className="resenas">
        <h3>Nuestra reseña</h3>
        <form onSubmit={guardar}>
          <input
            type="number"
            min="0"
            max="10"
            step="0.01" // permite decimales (7.5, 8.25)
            placeholder="Nota de 0 a 10"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          />
          <textarea
            placeholder="Notas o comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
          />
          <div className="botones">
            <button type="submit">Guardar reseña</button>
            {/* solo se puede cancelar si ya había una reseña guardada */}
            {tieneResena && (
              <button type="button" className="secundario" onClick={cancelar}>
                Cancelar
              </button>
            )}
          </div>
          {mensaje && <small className="error">{mensaje}</small>}
        </form>
      </div>
    )
  }

  // ---------- Modo lectura: la reseña ya guardada ----------
  // clasificar solo se llama si hay nota; si no hay, no mostramos color ni etiqueta
  const clase = datos.rating != null ? clasificar(datos.rating) : null

  return (
    <div className="resenas resena-vista">
      <h3>Nuestra reseña</h3>

      {clase && (
        <>
          <div className="nota" style={{ color: clase.color }}>
            {datos.rating} <span>/ 10</span>
          </div>
          <div className="etiqueta" style={{ color: clase.color }}>
            {clase.etiqueta}
          </div>
        </>
      )}

      {datos.review && <p className="comentario">{datos.review}</p>}

      <p className="autor">
        Escrito por {datos.reviewed_by_name} ·{' '}
        {/* toLocaleString con 'es-AR' muestra la fecha en formato argentino */}
        {new Date(datos.reviewed_at).toLocaleString('es-AR', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>

      <button className="secundario" onClick={() => setEditando(true)}>
        ✎ Editar
      </button>
    </div>
  )
}