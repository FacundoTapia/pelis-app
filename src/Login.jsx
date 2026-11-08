import { useState } from 'react'
import { supabase } from './supabase'

export default function Login() {
  // useState guarda un valor que, al cambiar, vuelve a dibujar la pantalla
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // evita que el navegador recargue la página al enviar el formulario
    setError('')

    // le pedimos a Supabase que verifique email y contraseña
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) setError('Email o contraseña incorrectos')
    // si salió bien no hacemos nada acá: App.jsx se entera solo (ver abajo)
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>🎬 Pelis</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // cada vez que escribís, actualiza el estado
        required
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Entrar</button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}