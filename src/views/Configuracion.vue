<template>
  <div class="ajustes">
    <section class="seccion">
      <h2 class="titulo-seccion"><span class="numero">1</span> Moneda</h2>
      <p class="ayuda">Elige la moneda que vas a usar en todos tus registros.</p>
      <div class="tarjeta">
        <button
          v-for="(datos, codigo) in MONEDAS"
          :key="codigo"
          class="opcion"
          :class="{ activo: config.moneda === codigo }"
          @click="elegirMoneda(codigo)"
        >
          {{ datos.etiqueta }}
        </button>
      </div>
    </section>

    <section class="seccion">
      <h2 class="titulo-seccion"><span class="numero">2</span> Color de la app</h2>
      <p class="ayuda">Elige el color que más te guste.</p>
      <div class="tarjeta">
        <button
          v-for="(datos, codigo) in TEMAS"
          :key="codigo"
          class="opcion"
          :class="{ activo: config.tema === codigo }"
          @click="elegirTema(codigo)"
        >
          <span class="muestra" :style="{ background: datos.primario }"></span>
          {{ datos.etiqueta }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { config, guardarConfig, MONEDAS, TEMAS, aplicarTema } from '../store/config.js'

function elegirMoneda(codigo) {
  config.moneda = codigo
  guardarConfig()
}

function elegirTema(codigo) {
  config.tema = codigo
  aplicarTema(codigo)
  guardarConfig()
}
</script>

<style scoped>
.ajustes {
  max-width: 420px;
  margin: 0 auto;
  padding: 8px 16px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.seccion {
  margin-bottom: 20px;
}

.titulo-seccion {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--fuente-titulo);
  font-size: 18px;
  color: var(--color-texto);
  margin: 0 0 6px;
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

.ayuda {
  color: var(--color-texto-suave);
  font-size: 13px;
  margin: 0 0 12px;
}

.tarjeta {
  background: var(--color-superficie);
  border: 1px solid var(--color-borde);
  border-radius: 14px;
  overflow: hidden;
}

.opcion {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  border: none;
  border-bottom: 1px solid var(--color-borde);
  background: var(--color-superficie);
  font-size: 15px;
  color: var(--color-texto);
  text-align: left;
}

.opcion:last-child {
  border-bottom: none;
}

.opcion.activo {
  background: var(--color-primario-suave);
  font-weight: bold;
}

.muestra {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>