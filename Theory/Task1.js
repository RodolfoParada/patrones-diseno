// Task 1: Module Pattern y Revealing Module Pattern (8 minutos)
// Estos patrones permiten crear módulos con encapsulamiento y interfaces claras.

// Module Pattern Básico
// Module Pattern usando IIFE (Immediately Invoked Function Expression)
const Calculadora = (function() {
  // Variables privadas (encapsuladas)
  let memoria = 0;
  let operacionesRealizadas = 0;
  const historial = [];

  // Función privada auxiliar
  function registrarOperacion(operacion, resultado) {
    operacionesRealizadas++;
    historial.push({
      operacion,
      resultado,
      timestamp: new Date(),
      id: operacionesRealizadas
    });

    // Mantener solo las últimas 10 operaciones
    if (historial.length > 10) {
      historial.shift();
    }
  }

  function validarNumeros(...numeros) {
    return numeros.every(num => typeof num === 'number' && !isNaN(num));
  }

  // API pública (interface del módulo)
  return {
    sumar: function(a, b) {
      if (!validarNumeros(a, b)) {
        throw new Error('Los operandos deben ser números válidos');
      }

      const resultado = a + b;
      registrarOperacion(`${a} + ${b}`, resultado);
      return resultado;
    },

    restar: function(a, b) {
      if (!validarNumeros(a, b)) {
        throw new Error('Los operandos deben ser números válidos');
      }

      const resultado = a - b;
      registrarOperacion(`${a} - ${b}`, resultado);
      return resultado;
    },

    multiplicar: function(a, b) {
      if (!validarNumeros(a, b)) {
        throw new Error('Los operandos deben ser números válidos');
      }

      const resultado = a * b;
      registrarOperacion(`${a} * ${b}`, resultado);
      return resultado;
    },

    dividir: function(a, b) {
      if (!validarNumeros(a, b)) {
        throw new Error('Los operandos deben ser números válidos');
      }

      if (b === 0) {
        throw new Error('No se puede dividir por cero');
      }

      const resultado = a / b;
      registrarOperacion(`${a} / ${b}`, resultado);
      return resultado;
    },

    // Métodos para interactuar con la memoria
    guardarEnMemoria: function(valor) {
      if (!validarNumeros(valor)) {
        throw new Error('El valor debe ser un número válido');
      }
      memoria = valor;
    },

    obtenerDeMemoria: function() {
      return memoria;
    },

    limpiarMemoria: function() {
      memoria = 0;
    },

    // Métodos para obtener información del módulo
    obtenerEstadisticas: function() {
      return {
        operacionesRealizadas,
        memoriaActual: memoria,
        totalOperacionesHistorial: historial.length
      };
    },

    obtenerHistorial: function() {
      // Retornar copia para evitar modificación externa
      return [...historial];
    },

    limpiarHistorial: function() {
      historial.length = 0;
      operacionesRealizadas = 0;
    }
  };
})();

// Uso del módulo
console.log(Calculadora.sumar(10, 5)); // 15
console.log(Calculadora.multiplicar(3, 4)); // 12

Calculadora.guardarEnMemoria(42);
console.log(Calculadora.obtenerDeMemoria()); // 42

console.log(Calculadora.obtenerEstadisticas());
// { operacionesRealizadas: 2, memoriaActual: 42, totalOperacionesHistorial: 2 }

// Intentar acceder a variables privadas (no funciona)
// console.log(Calculadora.memoria); // undefined
// console.log(Calculadora.historial); // undefined


// Revealing Module Pattern

// Revealing Module Pattern - revela solo lo necesario
const GestorDeTareas = (function() {
  // Estado privado
  let tareas = [];
  let siguienteId = 1;
  const categorias = new Set(['trabajo', 'personal', 'estudio']);

  // Funciones privadas
  function generarId() {
    return siguienteId++;
  }

  function validarTarea(tarea) {
    return tarea &&
           typeof tarea.titulo === 'string' &&
           tarea.titulo.trim().length > 0 &&
           (!tarea.categoria || categorias.has(tarea.categoria));
  }

  function encontrarTareaPorId(id) {
    return tareas.find(tarea => tarea.id === id);
  }

  function actualizarEstadisticas() {
    // Podría calcular estadísticas automáticamente
    return {
      total: tareas.length,
      completadas: tareas.filter(t => t.completada).length,
      pendientes: tareas.filter(t => !t.completada).length
    };
  }

  // Funciones públicas (API)
  function agregarTarea(titulo, descripcion = '', categoria = null) {
    const nuevaTarea = {
      id: generarId(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      completada: false,
      fechaCreacion: new Date(),
      fechaCompletada: null
    };

    if (!validarTarea(nuevaTarea)) {
      throw new Error('Datos de tarea inválidos');
    }

    tareas.push(nuevaTarea);
    return nuevaTarea.id;
  }

  function completarTarea(id) {
    const tarea = encontrarTareaPorId(id);
    if (!tarea) {
      throw new Error(`Tarea con ID ${id} no encontrada`);
    }

    if (tarea.completada) {
      return false; // Ya estaba completada
    }

    tarea.completada = true;
    tarea.fechaCompletada = new Date();
    return true;
  }

  function obtenerTareas(filtro = {}) {
    let resultado = [...tareas]; // Copia para no modificar original

    // Aplicar filtros
    if (filtro.completada !== undefined) {
      resultado = resultado.filter(t => t.completada === filtro.completada);
    }

    if (filtro.categoria) {
      resultado = resultado.filter(t => t.categoria === filtro.categoria);
    }

    if (filtro.busqueda) {
      const termino = filtro.busqueda.toLowerCase();
      resultado = resultado.filter(t =>
        t.titulo.toLowerCase().includes(termino) ||
        t.descripcion.toLowerCase().includes(termino)
      );
    }

    return resultado;
  }

  function eliminarTarea(id) {
    const indice = tareas.findIndex(t => t.id === id);
    if (indice === -1) {
      throw new Error(`Tarea con ID ${id} no encontrada`);
    }

    tareas.splice(indice, 1);
    return true;
  }

  function obtenerEstadisticas() {
    return actualizarEstadisticas();
  }

  function agregarCategoria(nuevaCategoria) {
    if (typeof nuevaCategoria !== 'string' || nuevaCategoria.trim().length === 0) {
      throw new Error('Nombre de categoría inválido');
    }

    categorias.add(nuevaCategoria.trim());
    return [...categorias];
  }

  // API pública (revelada)
  return {
    agregarTarea,
    completarTarea,
    obtenerTareas,
    eliminarTarea,
    obtenerEstadisticas,
    agregarCategoria
  };
})();

// Uso del módulo
GestorDeTareas.agregarTarea('Aprender JavaScript', 'Estudiar fundamentos del lenguaje', 'estudio');
GestorDeTareas.agregarTarea('Comprar víveres', 'Lista del supermercado', 'personal');
GestorDeTareas.agregarTarea('Revisar código', 'Code review del proyecto', 'trabajo');

console.log(GestorDeTareas.obtenerEstadisticas()); // { total: 3, completadas: 0, pendientes: 3 }

GestorDeTareas.completarTarea(1);
console.log(GestorDeTareas.obtenerTareas({ completada: false })); // Solo tareas pendientes

GestorDeTareas.agregarCategoria('salud');
console.log(GestorDeTareas.obtenerTareas({ categoria: 'estudio' }));