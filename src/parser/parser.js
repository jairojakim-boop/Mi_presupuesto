export function interpretarTexto(texto) {
    const textoLimpio = texto.toLowerCase()
  
    // 1. Detectar si es gasto o ingreso
    const palabrasIngreso = ['recib', 'transfirieron', 'deposit', 'depósit', 'pagaron', 'cobr', 'gan', 'ingreso', 'sueldo']
    const esIngreso = palabrasIngreso.some((p) => textoLimpio.includes(p))
    const tipo = esIngreso ? 'ingreso' : 'gasto'
  
    // 2. Detectar el monto (el primer número que aparezca en la frase)
    const coincidenciaMonto = textoLimpio.match(/(\d+([.,]\d+)?)/)
    const monto = coincidenciaMonto ? parseFloat(coincidenciaMonto[1].replace(',', '.')) : null
  
    // 3. Detectar categoría según palabras clave
    const categoriasGasto = {
      Comida: ['comida', 'almuerzo', 'cena', 'desayuno', 'restaurante', 'supermercado', 'super'],
      Transporte: ['gasolina', 'bencina', 'uber', 'taxi', 'bus', 'transporte', 'metro', 'pasaje'],
      Vivienda: ['arriendo', 'alquiler', 'renta', 'luz', 'agua', 'gas', 'internet', 'vivienda'],
      Salud: ['farmacia', 'medico', 'médico', 'doctor', 'remedio', 'salud'],
      Entretenimiento: ['cine', 'netflix', 'salida', 'juego', 'entretenimiento']
    }
  
    const categoriasIngreso = {
      Salario: ['sueldo', 'salario'],
      Transferencia: ['transfirieron', 'transferencia', 'deposito', 'depósito'],
      Venta: ['vendi', 'vendí', 'venta']
    }
  
    const diccionario = tipo === 'gasto' ? categoriasGasto : categoriasIngreso
    let categoria = 'Otros'
  
    for (const [nombre, palabrasClave] of Object.entries(diccionario)) {
      if (palabrasClave.some((p) => textoLimpio.includes(p))) {
        categoria = nombre
        break
      }
    }
  
    return { tipo, monto, categoria, descripcion: texto }
  }