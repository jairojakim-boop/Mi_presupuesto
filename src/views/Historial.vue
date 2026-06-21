<template>
  <div class="historial">
    <section class="seccion">
      <h2 class="titulo-seccion"><span class="numero">1</span> Rango de fechas</h2>
      <div class="tarjeta tarjeta-fechas">
        <div class="fila">
          <label class="campo">
            <span class="etiqueta">Desde</span>
            <input type="date" v-model="desde" :max="hasta" />
          </label>
          <label class="campo">
            <span class="etiqueta">Hasta</span>
            <input type="date" v-model="hasta" :min="desde" />
          </label>
        </div>

        <div class="atajos">
          <button @click="usarEsteMes">Este mes</button>
          <button @click="usarMesPasado">Mes pasado</button>
          <button @click="usarUltimos30">Últimos 30 días</button>
        </div>
      </div>
    </section>

    <section class="seccion">
      <h2 class="titulo-seccion"><span class="numero">2</span> Balance del período</h2>

      <div class="tarjeta-saldo">
        <div class="texto-saldo">
          <span class="etiqueta">Saldo del período</span>
          <span class="monto-saldo" :class="{ negativo: balance < 0 }">{{ formatear(balance) }}</span>
        </div>
        <div class="insignia" :class="{ negativo: balance < 0 }">
          <span>EN</span>
          <span>{{ balance < 0 ? 'ROJO' : 'VERDE' }}</span>
        </div>
      </div>

      <div class="totales">
        <div class="total">
          <span class="etiqueta">Ingresos</span>
          <strong class="ingreso">{{ formatear(totalIngresos) }}</strong>
        </div>
        <div class="total">
          <span class="etiqueta">Gastos</span>
          <strong class="gasto">{{ formatear(totalGastos) }}</strong>
        </div>
      </div>
    </section>

    <section class="seccion">
      <h2 class="titulo-seccion"><span class="numero">3</span> Movimientos del período</h2>

      <div class="tarjeta">
        <p v-if="!movimientosOrdenados.length" class="vacio">
          No hay movimientos en este rango de fechas.
        </p>
        <div v-else class="item" v-for="t in movimientosOrdenados" :key="t.id" :class="t.tipo">
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db } from '../db/db.js'
import { config, MONEDAS } from '../store/config.js'

const props = defineProps({
  transacciones: { type: Array, default: () => [] }
})

const emit = defineEmits(['guardado'])

function hoyISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

function primerDiaDelMesISO() {
  return hoyISO().slice(0, 8) + '01'
}

const desde = ref(primerDiaDelMesISO())
const hasta = ref(hoyISO())

function usarEsteMes() {
  desde.value = primerDiaDelMesISO()
  hasta.value = hoyISO()
}

function usarMesPasado() {
  const ahora = new Date()
  const primerDiaMesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
  const ultimoDiaMesPasado = new Date(ahora.getFullYear(), ahora.getMonth(), 0)
  desde.value = primerDiaMesPasado.toISOString().slice(0, 10)
  hasta.value = ultimoDiaMesPasado.toISOString().slice(0, 10)
}

function usarUltimos30() {
  const ahora = new Date()
  const hace30 = new Date(ahora)
  hace30.setDate(hace30.getDate() - 30)
  desde.value = hace30.toISOString().slice(0, 10)
  hasta.value = hoyISO()
}

const movimientosDelRango = computed(() => {
  const inicio = new Date(desde.value + 'T00:00:00')
  const fin = new Date(hasta.value + 'T23:59:59')

  return props.transacciones.filter((t) => {
    const fecha = new Date(t.fecha)
    return fecha >= inicio && fecha <= fin
  })
})

const movimientosOrdenados = computed(() =>
  [...movimientosDelRango.value].sort((a, b) => b.creadoEn - a.creadoEn)
)

const totalIngresos = computed(() =>
  movimientosDelRango.value.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
)

const totalGastos = computed(() =>
  movimientosDelRango.value.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
)

const balance = computed(() => totalIngresos.value - totalGastos.value)

function formatear(valor) {
  const simbolo = MONEDAS[config.moneda]?.simbolo || '$'
  const esEntero = Number.isInteger(valor)
  return simbolo + valor.toFixed(esEntero ? 0 : 2)
}

function formatearFecha(fechaIso) {
  const f = new Date(fechaIso)
  return f.toLocaleDateString('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function eliminar(id) {
  const confirmar = window.confirm('¿Eliminar este movimiento?')
  if (!confirmar) return

  await db.transacciones.delete(id)
  emit('guardado')
}
</script>

<style scoped>
.historial {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.seccion {
  max-width: 420px;
  margin: 0 auto;
  padding: 8px 16px 16px;
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

.tarjeta-fechas {
  padding: 16px;
  overflow: visible;
}

.fila {
  display: flex;
  gap: 10px;
}

.fila .campo {
  flex: 1;
}

.campo {
  display: block;
}

.etiqueta {
  display: block;
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-texto-suave);
  margin-bottom: 6px;
}

.campo input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  font-size: 15px;
  background: var(--color-fondo);
  border: 1px solid var(--color-borde);
  border-radius: 10px;
  color: var(--color-texto);
  font-family: inherit;
}

.atajos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.atajos button {
  padding: 8px 12px;
  border: 1px solid var(--color-borde);
  border-radius: 20px;
  background: var(--color-fondo);
  font-size: 12px;
  color: var(--color-texto);
}

.tarjeta-saldo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 12px;
}

.texto-saldo {
  display: flex;
  flex-direction: column;
}

.monto-saldo {
  font-size: 28px;
  font-weight: bold;
  font-family: var(--fuente-titulo);
  color: var(--color-primario);
}

.monto-saldo.negativo {
  color: var(--color-error);
}

.insignia {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 1px solid var(--color-primario);
  color: var(--color-primario);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: bold;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.insignia.negativo {
  border-color: var(--color-error);
  color: var(--color-error);
}

.totales {
  display: flex;
  gap: 10px;
}

.total {
  flex: 1;
  background: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  padding: 14px;
}

.total strong {
  display: block;
  font-size: 18px;
  margin-top: 2px;
}

.total strong.ingreso { color: var(--color-primario); }
.total strong.gasto   { color: var(--color-error); }

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

.descripcion {
  font-size: 13px;
  color: var(--color-texto-suave);
  font-style: italic;
}

.fecha {
  font-size: 12px;
  color: var(--color-texto-suave);
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