import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Buscador from './Buscador'
import Lista from './Lista'

export default function Home() {
  const [items, setItems] = useState([]) // la lista compartida
  const [mensaje, setMensaje] = useState('') // avisos al usuario ("Ya está en la lista", errores)

  // Trae todos los items de Supabase, los más nuevos primero
  async function cargarItems() {
    const { data, error } = await supabase
      .from('items') // de la tabla items...
      .select('*') // ...traé todas las columnas
      .order('created_at', { ascending: false }) // ordenadas por fecha, más nuevo arriba
    if (error) setMensaje('No se pudo cargar la lista')
    else setItems(data)
  }

  // [] al final = se ejecuta una sola vez, al abrir la pantalla
useEffect(() => {
  // trae la lista y la guarda en el estado (la definimos adentro del efecto)
  function traer() {
    supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setMensaje('No se pudo cargar la lista')
        else setItems(data)
      })
  }

  traer() // carga inicial, al abrir la pantalla

  // nos suscribimos a los cambios de la tabla "items"
  const canal = supabase
    .channel('items-cambios') // nombre del canal, puede ser cualquiera
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' }, // '*' = cualquier cambio: agregar, editar o borrar
      traer // cuando algo cambia, volvemos a pedir la lista
    )
    .subscribe()

  // al salir de la pantalla, cerramos el canal (limpieza)
  return () => {
    supabase.removeChannel(canal)
  }
}, [])

  async function agregar(r) {
    setMensaje('')
    const { error } = await supabase.from('items').insert({
      tmdb_id: r.tmdb_id,
      media_type: r.media_type,
      title: r.title,
      poster_path: r.poster_path,
      // added_by no hace falta: Supabase lo completa solo con el usuario logueado
    })
    if (error) {
      // 23505 = violación de "unique": la tabla ya tiene ese título
      setMensaje(error.code === '23505' ? 'Ya está en la lista' : 'No se pudo agregar')
    } else {
      cargarItems() // recargamos para ver el nuevo item
    }
  }

  async function toggleVisto(item) {
    const { error } = await supabase
      .from('items')
      .update({
        watched: !item.watched, // si estaba en false pasa a true, y al revés
        watched_at: !item.watched ? new Date().toISOString() : null, // guardamos cuándo la vimos
      })
      .eq('id', item.id) // IMPORTANTE: sin esto actualizaría TODAS las filas
    if (error) setMensaje('No se pudo actualizar')
    else cargarItems()
  }

  async function borrar(item) {
    if (!window.confirm(`¿Borrar "${item.title}" de la lista?`)) return // pide confirmación
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (error) setMensaje('No se pudo borrar')
    else cargarItems()
  }

  // Lista de claves ("movie-123") de lo que ya está agregado, para marcarlo en el buscador
  const yaAgregados = items.map((i) => `${i.media_type}-${i.tmdb_id}`)

  return (
    <div className="app">
      <header>
        <h1>🎬 Pelis</h1>
        <button onClick={() => supabase.auth.signOut()}>Salir</button>
      </header>

      {mensaje && <p className="error">{mensaje}</p>}

      <Buscador onAgregar={agregar} yaAgregados={yaAgregados} />
      <Lista items={items} onToggleVisto={toggleVisto} onBorrar={borrar} />
    </div>
  )
}