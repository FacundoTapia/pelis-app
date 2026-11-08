import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Login from './Login'

function App() {
  const [session, setSession] = useState(null) // null = nadie logueado
  const [cargando, setCargando] = useState(true)

  // useEffect con [] al final: se ejecuta una sola vez, cuando la app arranca
  useEffect(() => {
    // 1) al abrir la app, vemos si ya había una sesión guardada
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })

    // 2) nos "suscribimos" a cambios: cuando alguien entra o sale, se actualiza solo
    const { data: listener } = supabase.auth.onAuthStateChange((_evento, nuevaSession) => {
      setSession(nuevaSession)
    })

    // 3) al cerrar la app, cancelamos la suscripción (limpieza)
    return () => listener.subscription.unsubscribe()
  }, [])

  if (cargando) return <p>Cargando...</p>
  if (!session) return <Login /> // sin sesión → pantalla de login

  return (
    <div className="app">
      <header>
        <h1>🎬 Pelis</h1>
        <button onClick={() => supabase.auth.signOut()}>Salir</button>
      </header>
      <p>Hola, {session.user.email}</p>
    </div>
  )
}

export default App