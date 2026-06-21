<template>
  <div class="voz">
    <button
      class="boton-voz"
      :class="{ escuchando: escuchando }"
      @click="escuchando ? detener() : iniciar()"
      :aria-label="escuchando ? 'Escuchando' : 'Hablar'"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" y1="18" x2="12" y2="22" />
        <line x1="8" y1="22" x2="16" y2="22" />
      </svg>
    </button>
    <p class="etiqueta-boton">{{ escuchando ? 'Escuchando...' : 'Toca para hablar' }}</p>

    <p v-if="textoReconocido && !resultado" class="texto-reconocido">"{{ textoReconocido }}"</p>
    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="resultado" class="confirmacion">
      <p class="frase-original">"{{ textoReconocido }}"</p>

      <div class="tipo-selector">
        <button :class="{ activo: resultado.tipo === 'ingreso' }" @click="resultado.tipo = 'ingreso'">Ingreso</button>
        <button :class="{ activo: resultado.tipo === 'gasto' }" @click="resultado.tipo = 'gasto'">Gasto</button>
      </div>

      <input
        type="number"
        v-model="resultado.monto"
        class="input-confirmacion"
        inputmode="decimal"
      />
      <p v-if="!resultado.monto" class="aviso">No detecté el monto, escríbelo arriba.</p>

      <select v-model="resultado.categoria" class="select-categoria">
        <option v-for="cat in categoriasActuales" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <div class="botones-confirmacion">
        <button class="cancelar" @click="cancelar">Cancelar</button>
        <button class="confirmar" @click="confirmarGuardado" :disabled="!resultado.monto">Guardar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { db } from '../db/db.js'
import { interpretarTexto } from '../parser/parser.js'
import { config } from '../store/config.js'

const emit = defineEmits(['guardado'])

const escuchando = ref(false)
const textoReconocido = ref('')
const error = ref('')
const resultado = ref(null)

const categoriasGasto = ['Comida', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Otros']
const categoriasIngreso = ['Salario', 'Transferencia', 'Venta', 'Otros']

const categoriasActuales = computed(() =>
  resultado.value?.tipo === 'ingreso' ? categoriasIngreso : categoriasGasto
)

let reconocimiento = null

function crearReconocimiento() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    error.value = 'Tu navegador no soporta reconocimiento de voz. Prueba con Chrome.'
    return null
  }

  const r = new SpeechRecognition()
  r.lang = 'es-ES'
  r.continuous = false
  r.interimResults = false

  r.onresult = (evento) => {
    const texto = evento.results[0][0].transcript
    textoReconocido.value = texto
    resultado.value = interpretarTexto(texto)
  }

  r.onerror = (evento) => {
    error.value = 'No se pudo escuchar: ' + evento.error
    escuchando.value = false
  }

  r.onend = () => {
    escuchando.value = false
  }

  return r
}

function iniciar() {
  error.value = ''
  textoReconocido.value = ''
  resultado.value = null
  reconocimiento = crearReconocimiento()
  if (!reconocimiento) return

  escuchando.value = true
  reconocimiento.start()
}

function detener() {
  if (reconocimiento) reconocimiento.stop()
  escuchando.value = false
}

function cancelar() {
  resultado.value = null
  textoReconocido.value = ''
}

async function confirmarGuardado() {
  await db.transacciones.add({
    tipo: resultado.value.tipo,
    monto: parseFloat(resultado.value.monto),
    moneda: config.moneda,
    categoria: resultado.value.categoria,
    descripcion: textoReconocido.value,
    fecha: new Date().toISOString(),
    creadoEn: Date.now(),
    origen: 'voz'
  })

  resultado.value = null
  textoReconocido.value = ''
  emit('guardado')
}
</script>

<style scoped>
.voz {
  max-width: 420px;
  margin: 0 auto;
  padding: 16px 16px 8px;
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.boton-voz {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: var(--color-primario);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.boton-voz.escuchando {
  background: var(--color-error);
  animation: pulso 1s infinite;
}

@keyframes pulso {
  0%   { box-shadow: 0 0 0 0 rgba(179, 38, 30, 0.5); }
  70%  { box-shadow: 0 0 0 14px rgba(179, 38, 30, 0); }
  100% { box-shadow: 0 0 0 0 rgba(179, 38, 30, 0); }
}

.etiqueta-boton {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-texto-suave);
}

.texto-reconocido {
  margin-top: 12px;
  font-style: italic;
  color: var(--color-texto);
}

.error {
  margin-top: 12px;
  color: var(--color-error);
  font-size: 14px;
}

.confirmacion {
  margin-top: 16px;
  padding: 16px;
  background: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  text-align: left;
}

.frase-original {
  font-style: italic;
  color: var(--color-texto-suave);
  text-align: center;
  margin-bottom: 12px;
}

.confirmacion .tipo-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.confirmacion .tipo-selector button {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--color-borde);
  border-radius: 10px;
  background: var(--color-fondo);
  color: var(--color-texto);
}

.confirmacion .tipo-selector button.activo {
  border-color: var(--color-primario);
  background: var(--color-primario-suave);
  font-weight: bold;
}

.input-confirmacion {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  font-size: 20px;
  text-align: center;
  border: 1px solid var(--color-borde);
  border-radius: 10px;
  background: var(--color-fondo);
  color: var(--color-texto);
  margin-bottom: 8px;
}

.aviso {
  color: var(--color-error);
  font-size: 13px;
  margin-bottom: 8px;
}

.select-categoria {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  font-size: 15px;
  border: 1px solid var(--color-borde);
  border-radius: 10px;
  background: var(--color-fondo);
  color: var(--color-texto);
  margin-bottom: 12px;
}

.botones-confirmacion {
  display: flex;
  gap: 8px;
}

.botones-confirmacion button {
  flex: 1;
  padding: 13px;
  border-radius: 10px;
  border: none;
  font-weight: bold;
  font-size: 15px;
}

.cancelar {
  background: var(--color-fondo);
  color: var(--color-texto);
  border: 1px solid var(--color-borde);
}

.confirmar {
  background: var(--color-primario);
  color: white;
}

.confirmar:disabled {
  background: #B8B2A0;
}
</style>