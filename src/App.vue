<script setup>
import { ref, onMounted, computed } from 'vue'
import { db } from './db/db.js'
import { cargarConfig } from './store/config.js'
import Inicio from './views/Inicio.vue'
import Historial from './views/Historial.vue'
import Configuracion from './views/Configuracion.vue'

const transacciones = ref([])
const vistaActual = ref('inicio')

async function cargarTransacciones() {
  transacciones.value = await db.transacciones.toArray()
}

onMounted(async () => {
  await cargarConfig()
  await cargarTransacciones()
})

const mesActual = computed(() => {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const ahora = new Date()
  return `${meses[ahora.getMonth()]} ${ahora.getFullYear()}`
})
</script>

<template>
  <header class="encabezado">
    <span class="kicker">Libro de cuentas · personal</span>
    <h1>Mi Presupuesto</h1>
    <span class="fecha-actual">{{ mesActual }}</span>
  </header>

  <div class="contenido">
    <Inicio
      v-if="vistaActual === 'inicio'"
      :transacciones="transacciones"
      @guardado="cargarTransacciones"
    />
<Historial v-else-if="vistaActual === 'historial'" :transacciones="transacciones" @guardado="cargarTransacciones" />
    <Configuracion v-else-if="vistaActual === 'configuracion'" />
  </div>

  <nav class="tabs">
    <button :class="{ activo: vistaActual === 'inicio' }" @click="vistaActual = 'inicio'">Inicio</button>
    <button :class="{ activo: vistaActual === 'historial' }" @click="vistaActual = 'historial'">Historial</button>
    <button :class="{ activo: vistaActual === 'configuracion' }" @click="vistaActual = 'configuracion'">Ajustes</button>
  </nav>
</template>

<style>
:root {
  --color-primario: #1B4332;
  --color-primario-suave: #D8E6D9;
  --color-fondo: #FAF6EE;
  --color-superficie: #FFFFFF;
  --color-texto: #2C2620;
  --color-texto-suave: #8A8270;
  --color-borde: #E5DCC8;
  --color-acento: #A98C5D;
  --color-error: #B3261E;
  --fuente-titulo: Georgia, 'Times New Roman', serif;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--color-fondo);
  color: var(--color-texto);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>

<style scoped>
.encabezado {
  max-width: 420px;
  margin: 0 auto;
  padding: 24px 16px 16px;
}

.kicker {
  display: block;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-texto-suave);
  margin-bottom: 4px;
}

.encabezado h1 {
  font-family: var(--fuente-titulo);
  font-size: 28px;
  margin: 0;
  color: var(--color-texto);
}

.fecha-actual {
  display: block;
  font-size: 13px;
  color: var(--color-texto-suave);
  margin-top: 4px;
  text-transform: capitalize;
}

.contenido {
  padding-bottom: 70px;
}

.tabs {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: var(--color-superficie);
  border-top: 1px solid var(--color-borde);
}

.tabs button {
  flex: 1;
  padding: 14px;
  border: none;
  background: none;
  font-size: 13px;
  color: var(--color-texto-suave);
}

.tabs button.activo {
  color: var(--color-primario);
  font-weight: bold;
}
</style>