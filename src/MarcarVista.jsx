import { useState } from 'react'
import { supabase } from './supabase'
import FormResena from './FormResena'

export default function MarcarVista({ item, userName, onCerrar, onListo }) {
  const [mensaje, setMensaje] = useState('')

  // Marca como vista Y guarda la reseña, todo en una sola actualización
  async function guardarConResena({ nota, texto }) {
    const ahora = new Date().toISOString()
    const { error } = await supabase
      .from('items')
      .update({
        watched: true,
        watched_at: ahora,
        rating: nota,
        review: texto,
        reviewed_by_name: userName,
        reviewed_at: ahora,
      })
      .eq('id', item.id)

    if (error) return 'No se pudo guardar'
    onListo() // avisa a Home que terminó
    return null
  }

  // Marca como vista sin reseña (la pueden agregar después desde el detalle)
  async function soloMarcar() {
    setMensaje('')
    const { error } = await supabase
      .from('items')
      .update({ watched: true, watched_at: new Date().toISOString() })
      .eq('id', item.id)

    if (error) setMensaje('No se pudo actualizar')
    else onListo()
  }

  return (
    <div className="fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="cerrar" onClick={onCerrar}>✕</button>
        <h2>¿Qué tal estuvo?</h2>
        <p className="meta">{item.title}</p>
        <div className="resenas">
          <FormResena
            textoGuardar="Guardar y marcar como vista"
            onGuardar={guardarConResena}
            textoSecundario="Marcar sin reseña"
            onSecundario={soloMarcar}
          />
          {mensaje && <small className="error">{mensaje}</small>}
        </div>
      </div>
    </div>
  )
}