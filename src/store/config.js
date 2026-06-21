import { reactive } from 'vue'
import { db } from '../db/db.js'

export const MONEDAS = {
  USD: { simbolo: '$', etiqueta: 'Dólar (USD)' },
  EUR: { simbolo: '€', etiqueta: 'Euro (EUR)' },
  PESO: { simbolo: '$', etiqueta: 'Peso' }
}

export const TEMAS = {
  verde:   { etiqueta: 'Verde',   primario: '#1B6B3C', suave: '#C8E6D0', fondo: '#EDF5EE' },
  azul:    { etiqueta: 'Azul',    primario: '#15639E', suave: '#C9DEF0', fondo: '#E9F1F7' },
  morado:  { etiqueta: 'Morado',  primario: '#7B2D8E', suave: '#E3CCEA', fondo: '#F3EAF5' },
  naranja: { etiqueta: 'Naranja', primario: '#C1440E', suave: '#F5D3B0', fondo: '#F8EDE0' }
}

export const config = reactive({
  moneda: 'USD',
  tema: 'verde'
})

export function aplicarTema(codigoTema) {
  const tema = TEMAS[codigoTema] || TEMAS.verde
  document.documentElement.style.setProperty('--color-primario', tema.primario)
  document.documentElement.style.setProperty('--color-primario-suave', tema.suave)
  document.documentElement.style.setProperty('--color-fondo', tema.fondo)
}

export async function cargarConfig() {
  const guardada = await db.config.get(1)
  if (guardada) {
    config.moneda = guardada.moneda || 'USD'
    config.tema   = guardada.tema   || 'verde'
  }
  aplicarTema(config.tema)
}

export async function guardarConfig() {
  await db.config.put({ id: 1, moneda: config.moneda, tema: config.tema })
}