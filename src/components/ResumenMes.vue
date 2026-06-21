<template>
  <section class="seccion">
    <h2 class="titulo-seccion"><span class="numero">2</span> Movimientos recientes</h2>

    <div class="tarjeta">
      <p v-if="!transaccionesOrdenadas.length" class="vacio">
        Aún no hay movimientos registrados.<br />Agrega el primero arriba.
      </p>
      <div v-else class="item" v-for="t in transaccionesOrdenadas" :key="t.id" :class="t.tipo">
        <div class="info">
          <span class="categoria">{{ t.categoria }}</span>
          <span v-if="t.descripcion" class="descripcion">{{ t.descripcion }}</span>
          <span class="fecha">{{ formatearFecha(t.fecha) }}</span>
        </div>
        <span class="monto">{{ t.tipo === 'gasto' ? '-' : '+' }}{{ formatear(t.monto) }}</span>
        <button class="eliminar" @click="eliminar(t.id)">✕</button>
      </div>
    </div>
  </section>

  <section class="seccion">
    <h2 class="titulo-seccion"><span class="numero">3</span> Gastos por categoría</h2>

    <div class="tarjeta">
      <p v-if="!gastosPorCategoria.length" class="vacio">Sin gastos registrados todavía.</p>
      <div v-else class="item" v-for="c in gastosPorCategoria" :key="c.categoria">
        <span class="categoria">{{ c.categoria }}</span>
        <span class="monto gasto">{{ formatear(c.total) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { db } from '../db/db.js'
import { config, MONEDAS } from '../store/config.js'

const props = defineProps({
  transacciones: { type: Array, default: () => [] }
})

const emit = defineEmits(['guardado'])

const transaccionesDelMes = computed(() => {
  const ahora = new Date()
  return props.transacciones.filter((t) => {
    const fecha = new Date(t.fecha)
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
  })
})

const transaccionesOrdenadas = computed(() =>
  [...transaccionesDelMes.value].sort((a, b) => b.creadoEn - a.creadoEn)
)

const gastosPorCategoria = computed(() => {
  const mapa = {}
  transaccionesDelMes.value
    .filter((t) => t.tipo === 'gasto')
    .forEach((t) => {
      mapa[t.categoria] = (mapa[t.categoria] || 0) + t.monto
    })
  return Object.entries(mapa)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
})

function formatear(valor) {
  const simbolo = MONEDAS[config.moneda]?.simbolo || '$'
  const esEntero = Number.isInteger(valor)
  return simbolo + valor.toFixed(esEntero ? 0 : 2)
}

function formatearFecha(fechaIso) {
  const f = new Date(fechaIso)
  return f.toLocaleDateString('es', { day: '2-digit', month: '2-digit' })
}

async function eliminar(id) {
  const confirmar = window.confirm('¿Eliminar este movimiento?')
  if (!confirmar) return

  await db.transacciones.delete(id)
  emit('guardado')
}
</script>

<style scoped>
.seccion {
  max-width: 420px;
  margin: 0 auto;
  padding: 8px 16px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.titulo-seccion {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--fuente-titulo);
  font-size: 18px;
  color: var(--color-texto);
  margin: 0 0 12px;
}

.numero {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid var(--color-acento);
  color: var(--color-acento);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.tarjeta {
  background: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  overflow: hidden;
}

.vacio {
  text-align: center;
  font-style: italic;
  color: var(--color-texto-suave);
  padding: 24px 16px;
  margin: 0;
}

.item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-borde);
}

.item:last-child {
  border-bottom: none;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.categoria {
  font-size: 14px;
}

.fecha {
  font-size: 12px;
  color: var(--color-texto-suave);
}
.descripcion {
  font-size: 13px;
  color: var(--color-texto-suave);
  font-style: italic;
}

.item.gasto .monto   { color: var(--color-error); }
.item.ingreso .monto { color: var(--color-primario); }

.eliminar {
  background: none;
  border: none;
  color: var(--color-texto-suave);
  font-size: 15px;
  padding: 4px 6px;
  cursor: pointer;
}

.eliminar:hover { color: var(--color-error); }
</style>