import { useState } from 'react'
import { supabase } from './supabase'
import FormResena from './FormResena'
import { clasificar } from './nota'

export default function Resenas({ item, userName }) {
  // copia local de la película: al guardar la actualizamos con lo que devuelve Supabase
  const [datos, setDatos] = useState(item)

  // != null chequea null y undefined, pero deja pasar el 0 (que es una nota válida)
  const tieneResena = datos.rating != null || !!datos.review

  // si todavía no hay reseña arrancamos con el formulario abierto; si hay, mostramos la reseña
  const [editando, setEditando] = useState(!tieneResena)

  async function guardar({ nota, texto }) {
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

    if (error) return 'No se pudo guardar' // FormResena muestra este texto
    setDatos(data)
    setEditando(false) // cerramos el formulario para que se vea la reseña
    return null // null = salió todo bien
  }

  // ---------- Modo edición: formulario ----------
  if (editando) {
    return (
      <div className="resenas">
        <h3>Nuestra reseña</h3>
        <FormResena
          notaInicial={datos.rating}
          comentarioInicial={datos.review}
          textoGuardar="Guardar reseña"
          onGuardar={guardar}
          // solo se puede cancelar si ya había una reseña guardada
          textoSecundario={tieneResena ? 'Cancelar' : undefined}
          onSecundario={() => setEditando(false)}
        />
      </div>
    )
  }

  // ---------- Modo lectura: la reseña ya guardada ----------
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