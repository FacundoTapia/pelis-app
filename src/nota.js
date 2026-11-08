// Según la nota devuelve el color y el texto del rango
export function clasificar(nota) {
  if (nota < 4) return { color: '#e5484d', etiqueta: 'Desaprobado' }
  if (nota < 6) return { color: '#f5a524', etiqueta: 'Apenas aprobado' }
  if (nota < 8) return { color: '#3b82f6', etiqueta: 'Buena peli' }
  return { color: '#30a46c', etiqueta: 'Peliculón' }
}