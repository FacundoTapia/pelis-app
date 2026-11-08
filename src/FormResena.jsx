import { useState } from 'react'

export default function FormResena({
  notaInicial,
  comentarioInicial,
  textoGuardar,
  onGuardar, // función que guarda; devuelve un texto de error o null si salió bien
  textoSecundario, // texto del segundo botón (opcional)
  onSecundario, // qué hace el segundo botón (opcional)
}) {
  const [rating, setRating] = useState(notaInicial ?? '') // ?? '' = si es null, texto vacío
  const [comentario, setComentario] = useState(comentarioInicial ?? '')
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(e) {
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

    setGuardando(true)
    const error = await onGuardar({ nota, texto }) // el padre hace el guardado
    setGuardando(false)
    if (error) setMensaje(error)
  }

  return (
    <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={guardando}>{textoGuardar}</button>
        {/* el segundo botón solo aparece si el padre le pasó uno */}
        {textoSecundario && (
          <button type="button" className="secundario" onClick={onSecundario}>
            {textoSecundario}
          </button>
        )}
      </div>
      {mensaje && <small className="error">{mensaje}</small>}
    </form>
  )
}