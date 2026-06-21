<template>
  <ResumenSaldo :transacciones="transacciones" />


  <section class="seccion">
    <h2 class="titulo-seccion"><span class="numero">1</span> Nuevo movimiento</h2>
    <RegistroRapido @guardado="$emit('guardado')" />
  </section>

  <ResumenMes :transacciones="transacciones" @guardado="$emit('guardado')" />
</template>

<script setup>
import ResumenSaldo from '../components/ResumenSaldo.vue'
import RegistroRapido from '../components/RegistroRapido.vue'
import ResumenMes from '../components/ResumenMes.vue'

defineProps({ transacciones: { type: Array, default: () => [] } })
defineEmits(['guardado'])
</script>

<style scoped>
.seccion {
  max-width: 420px;
  margin: 0 auto;
  padding: 16px;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
</style>