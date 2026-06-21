<template>
  <div class="registro">
    <div class="tipo-selector">
      <button :class="{ activo: tipo === 'ingreso' }" @click="tipo = 'ingreso'">Ingreso</button>
      <button :class="{ activo: tipo === 'gasto' }" @click="tipo = 'gasto'">Gasto</button>
    </div>

    <div class="fila">
      <label class="campo">
        <span class="etiqueta">Monto ({{ config.moneda }})</span>
        <input type="number" v-model="monto" placeholder="0" inputmode="decimal" />
      </label>

      <label class="campo">
        <span class="etiqueta">Fecha</span>
        <input type="date" v-model="fecha" />
      </label>
    </div>

    <label class="campo">
      <span class="etiqueta">Descripción</span>
      <input type="text" v-model="descripcion" placeholder="Ej: Supermercado, Sueldo, Luz..." />
    </label>

    <span class="etiqueta etiqueta-categoria">Categoría</span>
    <div class="categorias">
      <button
        v-for="cat in categoriasActuales"
        :key="cat"
        :class="{ activo: categoria === cat }"
        @click="categoria = cat"
      >
        {{ cat }}
      </button>
    </div>

    <button class="guardar" @click="guardar" :disabled="!monto">
      Agregar {{ tipo === 'ingreso' ? 'ingreso' : 'gasto' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { db } from '../db/db.js'
import { config } from '../store/config.js'

const emit = defineEmits(['guardado'])

function hoyISO() {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d - tz).toISOString().slice(0, 10)
}

const tipo = ref('gasto')
const monto = ref('')
const descripcion = ref('')
const fecha = ref(hoyISO())
const categoria = ref('')

const categoriasGasto = ['Comida', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Otros']
const categoriasIngreso = ['Salario', 'Transferencia', 'Venta', 'Otros']

const categoriasActuales = computed(() =>
  tipo.value === 'gasto' ? categoriasGasto : categoriasIngreso
)

categoria.value = categoriasActuales.value[0]

watch(tipo, () => {
  categoria.value = categoriasActuales.value[0]
})

async function guardar() {
  await db.transacciones.add({
    tipo: tipo.value,
    monto: parseFloat(monto.value),
    moneda: config.moneda,
    categoria: categoria.value || 'Otros',
    descripcion: descripcion.value,
    fecha: new Date(fecha.value + 'T12:00:00').toISOString(),
    creadoEn: Date.now(),
    origen: 'manual'
  })

  monto.value = ''
  descripcion.value = ''
  fecha.value = hoyISO()
  emit('guardado')
}
</script>

<style scoped>
.registro {
  background: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.tipo-selector {
  display: flex;
  background: var(--color-fondo);
  border: 1px solid var(--color-borde);
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 16px;
}

.tipo-selector button {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: none;
  font-size: 14px;
  color: var(--color-texto-suave);
}

.tipo-selector button.activo {
  background: var(--color-primario-suave);
  color: var(--color-texto);
  font-weight: bold;
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
  margin-bottom: 14px;
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
  font-size: 16px;
  background: var(--color-fondo);
  border: 1px solid var(--color-borde);
  border-radius: 10px;
  color: var(--color-texto);
  font-family: inherit;
}

.categorias {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.categorias button {
  padding: 9px 14px;
  border: 1px solid var(--color-borde);
  border-radius: 20px;
  background: var(--color-fondo);
  font-size: 13px;
  color: var(--color-texto);
}

.categorias button.activo {
  background: var(--color-primario-suave);
  border-color: var(--color-primario);
  font-weight: bold;
}

.guardar {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  background: var(--color-primario);
  color: white;
  margin-top: 4px;
}

.guardar:disabled {
  background: #B8B2A0;
}
</style>