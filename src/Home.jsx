import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Buscador from './Buscador'
import Lista from './Lista'
import Detalle from './Detalle'
import MarcarVista from './MarcarVista'

export default function Home({ userName }) {
  const [items, setItems] = useState([]) // la lista compartida
  const [mensaje, setMensaje] = useState('') // avisos al usuario ("Ya está en la lista", errores)
  const [abierto, setAbierto] = useState(null) // el item que se está mirando en detalle (null = ninguno)
  const [porMarcar, setPorMarcar] = useState(null) // la película que se está por marcar como vista
  const [busquedaKey, setBusquedaKey] = useState(0) // cada vez que cambia, el buscador se reinicia

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
      setBusquedaKey((k) => k + 1) // k + 1 cambia la key → React reinicia el buscador (texto y resultados vacíos)
    }
  }

  async function toggleVisto(item) {
    // si todavía no la vieron, abrimos el cartel para dejar la reseña en el momento
    if (!item.watched) {
        setPorMarcar(item)
        return // salimos: el guardado lo hace el cartel
    }

    // si ya estaba vista y la pasan a pendiente, se hace directo
    const { error } = await supabase
        .from('items')
        .update({ watched: false, watched_at: null })
        .eq('id', item.id)
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
  // find devuelve el primer item que cumple la condición (o undefined si no hay ninguno)
// buscamos la fila de Supabase de la película abierta, porque ahí está guardada la reseña
    const itemLista = abierto
    ? items.find((i) => i.media_type === abierto.media_type && i.tmdb_id === abierto.tmdb_id)
    : null

  return (
    <div className="app">
      <header>
        <h1>🎬 Pelis</h1>
        <button onClick={() => supabase.auth.signOut()}>Salir</button>
      </header>

      {mensaje && <p className="error">{mensaje}</p>}

      <Buscador
        key={busquedaKey}
        onAgregar={agregar}
        onAbrir={setAbierto}
        yaAgregados={yaAgregados}
      />
      <Lista
        items={items}
        onToggleVisto={toggleVisto}
        onBorrar={borrar}
        onAbrir={setAbierto}
      />

        {abierto && (
            <Detalle
                key={`${abierto.media_type}-${abierto.tmdb_id}`}
                item={abierto}
                onCerrar={() => setAbierto(null)}
                yaEnLista={yaAgregados.includes(`${abierto.media_type}-${abierto.tmdb_id}`)}
                onAgregar={agregar}
                itemLista={itemLista}
                userName={userName}
            />
        )}

        {porMarcar && (
            <MarcarVista
                item={porMarcar}
                userName={userName}
                onCerrar={() => setPorMarcar(null)}
                onListo={() => {
                setPorMarcar(null) // cerramos el cartel
                cargarItems() // y refrescamos la lista
                }}
            />
        )}

    </div>
  )
}