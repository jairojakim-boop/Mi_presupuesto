<template>
  <div class="resumen-saldo">
    <div class="tarjeta-saldo">
      <div class="texto-saldo">
        <span class="etiqueta">Saldo disponible</span>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { config, MONEDAS } from '../store/config.js'

const props = defineProps({
  transacciones: { type: Array, default: () => [] }
})

const transaccionesDelMes = computed(() => {
  const ahora = new Date()
  return props.transacciones.filter((t) => {
    const fecha = new Date(t.fecha)
    return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
  })
})

const totalIngresos = computed(() =>
  transaccionesDelMes.value.filter((t) => t.tipo === 'ingreso').reduce((s, t) => s + t.monto, 0)
)

const totalGastos = computed(() =>
  transaccionesDelMes.value.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.monto, 0)
)

const balance = computed(() => totalIngresos.value - totalGastos.value)

function formatear(valor) {
  const simbolo = MONEDAS[config.moneda]?.simbolo || '$'
  const esEntero = Number.isInteger(valor)
  return simbolo + valor.toFixed(esEntero ? 0 : 2)
}
</script>

<style scoped>
.resumen-saldo {
  max-width: 420px;
  margin: 0 auto;
  padding: 0 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

.etiqueta {
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-texto-suave);
  margin-bottom: 6px;
}

.monto-saldo {
  font-size: 32px;
  font-weight: bold;
  font-family: var(--fuente-titulo);
  color: var(--color-primario);
}

.monto-saldo.negativo {
  color: var(--color-error);
}

.insignia {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid var(--color-primario);
  color: var(--color-primario);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
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
  margin-bottom: 20px;
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
</style>