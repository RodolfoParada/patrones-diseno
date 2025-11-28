// Sistema completo de gestión de tareas usando múltiples patrones de diseño

// Ejercicio: Extiende el sistema creando un 
// Ok patrón Command para operaciones undo/redo, 
// Ok un patrón Strategy para diferentes algoritmos de filtrado de tareas, 
// y un patrón Decorator para agregar funcionalidades como notificaciones por email o 
// integración con calendario a las tareas.

// Patrón Decorator

class TareaDecorator {
    constructor(tareaComponente) {
        this.tareaComponente = tareaComponente;
        // Copiar propiedades esenciales para que el decorador pueda ser tratado como una tarea
        this.id = tareaComponente.id;
        this.titulo = tareaComponente.titulo;
        this.completada = tareaComponente.completada;
    }

    completar() {
        return this.tareaComponente.completar();
    }


    obtenerInformacion() {
        return this.tareaComponente.obtenerInformacion();
    }
}

class NotificacionEmailDecorator extends TareaDecorator {
    constructor(tareaComponente, destinatario) {
        super(tareaComponente);
        this.destinatario = destinatario;
    }

    // Nueva funcionalidad: Simula el envío de un email
    _enviarEmail(titulo) {
        console.log(`[DECORATOR EMAIL] Enviando notificación por email a ${this.destinatario}: Tarea "${titulo}" ha sido completada.`);
    }

    // Se sobrescribe el método principal para añadir la funcionalidad ANTES de delegar
    completar() {
        const resultado = this.tareaComponente.completar();
        if (resultado) {
            this._enviarEmail(this.titulo);
        }
        return resultado;
    }
}


class RegistroCalendarioDecorator extends TareaDecorator {
    constructor(tareaComponente) {
        super(tareaComponente);
    }

    // Nueva funcionalidad: Simula la integración con un calendario
    _registrarEnCalendario(titulo) {
        const fecha = new Date().toISOString().substring(0, 10);
        console.log(`[DECORATOR CALENDARIO] Registrando en calendario: Tarea "${titulo}" completada el ${fecha}.`);
    }

    // Se sobrescribe el método principal para añadir la funcionalidad ANTES de delegar
    completar() {
        const resultado = this.tareaComponente.completar();
        if (resultado) {
            this._registrarEnCalendario(this.titulo);
        }
        return resultado;
    }
}






// Patrón Strategy
class EstrategiaFiltro {
    filtrar(tareas) { throw new Error("Método 'filtrar' debe ser implementado por la estrategia concreta."); }
}


class FiltroPorCompletada extends EstrategiaFiltro {
    constructor(completada) {
        super();
        this.completada = completada;
    }
    filtrar(tareas) {
        return tareas.filter(t => t.completada === this.completada);
    }
}


class FiltroPorPrioridad extends EstrategiaFiltro {
    constructor(prioridad) {
        super();
        this.prioridad = prioridad;
    }
    filtrar(tareas) {
        return tareas.filter(t => t.prioridad === this.prioridad);
    }
}


class FiltroPorTipo extends EstrategiaFiltro {
    constructor(tipo) {
        super();
        this.tipo = tipo;
    }
    filtrar(tareas) {
        return tareas.filter(t => t.tipo === this.tipo);
    }
}

// Patrón Command

class Command {
     constructor(gestor){
      this.gestor = gestor;
     }
     ejecutar(){
      throw new Error("Método 'ejecutar(()' debe ser implementado.");
     }
      deshacer(){
      throw new Error("Método 'deshacer()' debe ser implementado.");
      }  
}

class AgregarTareaCommand extends Command {
   constructor(gestor, tipo, datos) {
      super(gestor);
      this.tipo = tipo;
      this.datos = datos;
      this.tareaCreada = null;  
   }

   ejecutar(){
    const fabrica = new FabricaTareas();
    const newId = this.gestor.siguienteId++;
    this.tareaCreada = fabrica.crearTarea(this.tipo, {
      id: newId,
      ...this.datos,
      fechaCreacion: new Date()
    });
    this.gestor.tareas.set(this.tareaCreada.id, this.tareaCreada);
    this.gestor.notificar('tarea_creada', this.tareaCreada);
    return this.tareaCreada;
   }
   deshacer(){
    if(this.tareaCreada){
      this.gestor.tareas.delete(this.tareaCreada.id);
      this.gestor.notificar('tarea_eliminada', this.tareaCreada);
    }
    return false; 
   }
}

class EliminarTareaCommnand extends Command {

    constructor(gestor, id){
      super(gestor);
      this.id = id;
      this.tareaEliminada = null;
    }
     
    ejecutar(){
      this.tareaEliminada = this.gestor.tareas.get(this.id);
      if(this.tareaEliminada){
        this.gestor.tareas.delete(this.id);
        this.gestor.notificar('tarea_eliminada', this.tareaEliminada);
        return true;
      }
      return false;
    }
    deshacer(){
      if(this.tareaEliminada){
        this.gestor.tareas.set(this.tareaEliminada.id, this.tareaEliminada);
        this.gestor.notificar('tarea_creada', this.tareaEliminada);
        return true;      
      }
      return false;
    }
}

class CompletarTareaCommand extends Command {

    constructor(gestor, id, estadoDeseado = true){
      super(gestor);
      this.id = id;
      this.estadoDeseado = estadoDeseado;
      this.estadoAnterior = null;
      this.tarea = null;
    }
    ejecutar(){
      this.tarea = this.gestor.tareas.get(this.id);
      if(this.tarea){
        this.estadoAnterior = this.tarea.completada;
        this.tarea.completada = this.estadoDeseado;
        this.gestor.notificar('tarea_actualizada', this.tarea);
        return true;
      }
      return false;
    }
    deshacer(){
      if(this.tarea && this.estadoAnterior !== null){
        this.tarea.completada = this.estadoAnterior;
        this.gestor.notificar('tarea_actualizada', this.tarea);
        return true;
      }
      return false;
    }

  }

  class HistorialComandos {
    constructor() {
      this.undoStack = [];
      this.redoStack = [];
      this.MAX_HISTORY = 20; // Limitar el tamaño del historial
    }
    ejecutarComando(command) {

      this.undoStack.push(command);
      this.redoStack = []; // Limpiar redo al ejecutar nuevo comando
 
       if(this.undoStack.length > this.MAX_HISTORY){
        this.undoStack.shift(); // Eliminar el comando más antiguo
       } 
    }
    deshacer() {
      if(this.undoStack.length > 0){
        const command = this.undoStack.pop();
        command.deshacer();
        this.redoStack.push(command);
        return true;
      }
      console.log("No hay comandos para deshacer.");
      return false;
    }
    rehacer() {
      if(this.redoStack.length > 0){
        const command = this.redoStack.pop();
        command.ejecutar();
        this.undoStack.push(command);
        return true;
      }
      console.log("No hay comandos para rehacer.");
      return false;
    }

}

// 1. Singleton para el gestor principal
class GestorTareas {
  constructor() {
    if (GestorTareas.instancia) {
      return GestorTareas.instancia;
    }

    this.tareas = new Map();
    this.siguienteId = 1;
    this.observadores = new Set();
    GestorTareas.instancia = this;
  }

  // Observer Pattern: notificar cambios
  suscribir(observador) {
    this.observadores.add(observador);
  }

  desuscribir(observador) {
    this.observadores.delete(observador);
  }

  notificar(evento, datos) {
    this.observadores.forEach(observador => {
      try {
        observador.notificar(evento, datos);
      } catch (error) {
        console.error('Error en observador:', error);
      }
    });
  }

  // Factory Pattern: crear tareas de diferentes tipos
  crearTarea(tipo, datos) {
    const fabrica = new FabricaTareas();
    const tarea = fabrica.crearTarea(tipo, {
      id: this.siguienteId++,
      ...datos,
      fechaCreacion: new Date()
    });

    this.tareas.set(tarea.id, tarea);
    this.notificar('tarea_creada', tarea);
    return tarea;
  }

  obtenerTarea(id) {
    return this.tareas.get(id);
  }

  actualizarTarea(id, cambios) {
    const tarea = this.tareas.get(id);
    if (tarea) {
      Object.assign(tarea, cambios);
      this.notificar('tarea_actualizada', tarea);
      return true;
    }
    return false;
  }

  eliminarTarea(id) {
    const tarea = this.tareas.get(id);
    if (tarea) {
      this.tareas.delete(id);
      this.notificar('tarea_eliminada', tarea);
      return true;
    }
    return false;
  }

  obtenerTareas(filtro = {}) {
    let tareas = Array.from(this.tareas.values());

    if (filtro.completada !== undefined) {
      tareas = tareas.filter(t => t.completada === filtro.completada);
    }

    if (filtro.prioridad) {
      tareas = tareas.filter(t => t.prioridad === filtro.prioridad);
    }

    if (filtro.tipo) {
      tareas = tareas.filter(t => t.tipo === filtro.tipo);
    }

    return tareas;
  }

  obtenerEstadisticas() {
    const tareas = Array.from(this.tareas.values());
    return {
      total: tareas.length,
      completadas: tareas.filter(t => t.completada).length,
      pendientes: tareas.filter(t => !t.completada).length,
      porTipo: tareas.reduce((acc, t) => {
        acc[t.tipo] = (acc[t.tipo] || 0) + 1;
        return acc;
      }, {}),
      porPrioridad: tareas.reduce((acc, t) => {
        acc[t.prioridad] = (acc[t.prioridad] || 0) + 1;
        return acc;
      }, {})
    };
  }

  // Método para aplicar decoradores (integración del Decorator)
    aplicarDecorador(id, tipoDecorador, ...args) {
        let tarea = this.tareas.get(id);
        if (!tarea) {
            console.error(`Tarea con ID ${id} no encontrada.`);
            return false;
        }

        let decorador;
        switch (tipoDecorador.toLowerCase()) {
            case 'email':
                // Requiere el destinatario, que se pasa como primer argumento en args[0]
                decorador = new NotificacionEmailDecorator(tarea, args[0]);
                break;
            case 'calendario':
                // No requiere argumentos adicionales
                decorador = new RegistroCalendarioDecorator(tarea);
                break;
            default:
                console.error(`Decorador '${tipoDecorador}' no soportado.`);
                return false;
        }

        // ¡Paso clave! Reemplazamos la tarea original en el mapa con la versión decorada.
        // Si la tarea ya estaba decorada, el nuevo decorador la envuelve.
        this.tareas.set(id, decorador);
        console.log(`[GESTOR] Tarea ${id} decorada con ${tipoDecorador}.`);
        return decorador;
    }
}

// 2. Factory Pattern para crear diferentes tipos de tareas
class FabricaTareas {
  crearTarea(tipo, datosBase) {
    switch (tipo.toLowerCase()) {
      case 'basica':
        return new TareaBasica(datosBase);
      case 'con-fecha-limite':
        return new TareaConFechaLimite(datosBase);
      case 'recurrente':
        return new TareaRecurrente(datosBase);
      case 'con-subtareas':
        return new TareaConSubtareas(datosBase);
      default:
        throw new Error(`Tipo de tarea '${tipo}' no soportado`);
    }
  }
}

// 3. Clases para diferentes tipos de tareas (usando herencia)
class TareaBasica {
  constructor({ id, titulo, descripcion = '', prioridad = 'media' }) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.prioridad = prioridad;
    this.completada = false;
    this.fechaCreacion = new Date();
    this.tipo = 'basica';
  }

  completar() {
    this.completada = true;
    return true;
  }

  obtenerInformacion() {
    return {
      id: this.id,
      titulo: this.titulo,
      descripcion: this.descripcion,
      prioridad: this.prioridad,
      completada: this.completada,
      tipo: this.tipo,
      fechaCreacion: this.fechaCreacion
    };
  }
}

class TareaConFechaLimite extends TareaBasica {
  constructor(datos) {
    super(datos);
    this.fechaLimite = datos.fechaLimite;
    this.tipo = 'con-fecha-limite';
  }

  estaVencida() {
    return new Date() > this.fechaLimite && !this.completada;
  }

  diasRestantes() {
    const diferencia = this.fechaLimite - new Date();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  obtenerInformacion() {
    return {
      ...super.obtenerInformacion(),
      fechaLimite: this.fechaLimite,
      estaVencida: this.estaVencida(),
      diasRestantes: this.diasRestantes()
    };
  }
}

class TareaRecurrente extends TareaBasica {
  constructor(datos) {
    super(datos);
    this.intervalo = datos.intervalo || 'diario'; // diario, semanal, mensual
    this.ocurrencias = datos.ocurrencias || 1;
    this.ocurrenciaActual = 1;
    this.tipo = 'recurrente';
  }

  completar() {
    this.ocurrenciaActual++;
    if (this.ocurrenciaActual > this.ocurrencias) {
      this.completada = true;
    }
    return this.ocurrenciaActual <= this.ocurrencias;
  }

  obtenerInformacion() {
    return {
      ...super.obtenerInformacion(),
      intervalo: this.intervalo,
      ocurrencias: this.ocurrencias,
      ocurrenciaActual: this.ocurrenciaActual,
      progreso: `${this.ocurrenciaActual}/${this.ocurrencias}`
    };
  }
}

class TareaConSubtareas extends TareaBasica {
  constructor(datos) {
    super(datos);
    this.subtareas = datos.subtareas || [];
    this.tipo = 'con-subtareas';
  }

  agregarSubtarea(titulo, descripcion = '') {
    this.subtareas.push({
      id: Date.now(),
      titulo,
      descripcion,
      completada: false
    });
  }

  completarSubtarea(idSubtarea) {
    const subtarea = this.subtareas.find(st => st.id === idSubtarea);
    if (subtarea) {
      subtarea.completada = true;

      // Si todas las subtareas están completas, completar la tarea principal
      const todasCompletas = this.subtareas.every(st => st.completada);
      if (todasCompletas) {
        this.completada = true;
      }

      return true;
    }
    return false;
  }

  obtenerInformacion() {
    const subtareasCompletas = this.subtareas.filter(st => st.completada).length;
    return {
      ...super.obtenerInformacion(),
      subtareas: this.subtareas,
      progresoSubtareas: `${subtareasCompletas}/${this.subtareas.length}`
    };
  }
}

// 4. Observadores (Observer Pattern)
class ObservadorConsola {
  notificar(evento, datos) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${evento}:`, datos.titulo || datos.id);
  }
}

class ObservadorEstadisticas {
  constructor() {
    this.eventos = [];
  }

  notificar(evento, datos) {
    this.eventos.push({ evento, datos, timestamp: new Date() });
  }

  obtenerEstadisticas() {
    return {
      totalEventos: this.eventos.length,
      eventosPorTipo: this.eventos.reduce((acc, e) => {
        acc[e.evento] = (acc[e.evento] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

// Demostración completa del sistema
console.log('🚀 DEMOSTRACIÓN: SISTEMA COMPLETO DE GESTIÓN DE TAREAS\n');

// Crear instancia singleton
const gestor = new GestorTareas();

// Configurar observadores
const observadorConsola = new ObservadorConsola();
const observadorEstadisticas = new ObservadorEstadisticas();

gestor.suscribir(observadorConsola);
gestor.suscribir(observadorEstadisticas);

// Crear diferentes tipos de tareas
console.log('📝 Creando tareas de diferentes tipos...');

const tareaBasica = gestor.crearTarea('basica', {
  titulo: 'Aprender JavaScript',
  descripcion: 'Completar el curso de fundamentos',
  prioridad: 'alta'
});

const tareaConFecha = gestor.crearTarea('con-fecha-limite', {
  titulo: 'Entregar proyecto',
  descripcion: 'Proyecto final del módulo',
  prioridad: 'alta',
  fechaLimite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
});

const tareaRecurrente = gestor.crearTarea('recurrente', {
  titulo: 'Hacer ejercicio',
  descripcion: '30 minutos de ejercicio diario',
  prioridad: 'media',
  intervalo: 'diario',
  ocurrencias: 7
});

const tareaConSubtareas = gestor.crearTarea('con-subtareas', {
  titulo: 'Preparar presentación',
  descripcion: 'Presentación para el cliente',
  prioridad: 'alta'
});

// Agregar subtareas
tareaConSubtareas.agregarSubtarea('Investigar cliente', 'Revisar información del cliente');
tareaConSubtareas.agregarSubtarea('Crear slides', 'Diseñar presentación');
tareaConSubtareas.agregarSubtarea('Practicar presentación', 'Ensayar ante el equipo');

console.log('\n📊 ESTADÍSTICAS INICIALES:');
console.log(gestor.obtenerEstadisticas());

console.log('\n✅ COMPLETANDO TAREAS...');

// Completar algunas tareas
gestor.actualizarTarea(tareaBasica.id, { completada: true });

for (let i = 0; i < 3; i++) {
  tareaRecurrente.completar();
}

tareaConSubtareas.completarSubtarea(tareaConSubtareas.subtareas[0].id);
tareaConSubtareas.completarSubtarea(tareaConSubtareas.subtareas[1].id);

console.log('\n📊 ESTADÍSTICAS FINALES:');
console.log(gestor.obtenerEstadisticas());

console.log('\n📋 TAREAS PENDIENTES:');
const pendientes = gestor.obtenerTareas({ completada: false });
pendientes.forEach(tarea => {
  console.log(`- ${tarea.titulo} (${tarea.tipo})`);
});

console.log('\n📈 ESTADÍSTICAS DE EVENTOS:');
console.log(observadorEstadisticas.obtenerEstadisticas());

console.log('\n🎯 Sistema de gestión de tareas completado exitosamente!');


// 2. Crear datos de ejemplo
console.log('📝 Creando tareas de ejemplo...');
gestor.crearTarea('basica', { titulo: 'T1: Comprar café', prioridad: 'alta' }); // ID 1
gestor.crearTarea('basica', { titulo: 'T2: Pagar factura', prioridad: 'media' }); // ID 2
gestor.crearTarea('con-fecha-limite', { titulo: 'T3: Entregar reporte', prioridad: 'alta', fechaLimite: new Date(Date.now() + 10000000) }); // ID 3
gestor.crearTarea('recurrente', { titulo: 'T4: Revisar email', prioridad: 'baja' }); // ID 4

// 3. Modificar estado
gestor.actualizarTarea(1, { completada: true }); // T1: Completada

console.log('-------------------------------------------');
console.log('Tareas totales:', gestor.obtenerEstadisticas().total);

// --- DEMOSTRACIÓN STRATEGY ---
console.log('\n🔍 DEMOSTRACIÓN STRATEGY: APLICANDO FILTROS COMBINADOS');

// Estrategia 1: Filtrar por Tareas Pendientes (completada = false)
const filtroPendiente = new FiltroPorCompletada(false);

// Estrategia 2: Filtrar por Prioridad Alta
const filtroAlta = new FiltroPorPrioridad('alta');

// Estrategia 3: Filtrar por Tipo 'con-fecha-limite'
const filtroTipoFecha = new FiltroPorTipo('con-fecha-limite');


// Combinación A: Pendientes (Filtro 1)
let resultadoA = gestor.obtenerTareas([filtroPendiente]);
console.log(`\nResultado A: Solo Tareas Pendientes (${resultadoA.length})`);
resultadoA.forEach(t => console.log(`- ID ${t.id}: ${t.titulo}, Completada: ${t.completada}`));
// Esperado: T2, T3, T4 (3 tareas)

// Combinación B: Pendientes Y Prioridad Alta (Filtro 1 y 2)
let resultadoB = gestor.obtenerTareas([filtroPendiente, filtroAlta]);
console.log(`\nResultado B: Pendientes Y Prioridad Alta (${resultadoB.length})`);
resultadoB.forEach(t => console.log(`- ID ${t.id}: ${t.titulo}, Prioridad: ${t.prioridad}`));
// Esperado: T3 (1 tarea)

// Combinación C: Solo Tareas con Fecha Límite (Filtro 3)
let resultadoC = gestor.obtenerTareas([filtroTipoFecha]);
console.log(`\nResultado C: Solo Tareas con Fecha Límite (${resultadoC.length})`);
resultadoC.forEach(t => console.log(`- ID ${t.id}: ${t.titulo}, Tipo: ${t.tipo}`));
// Esperado: T3 (1 tarea)


console.log('📝 Creando tareas de ejemplo...');
const tareaID1 = gestor.crearTarea('basica', { titulo: 'T1: Desarrollar Feature X', prioridad: 'alta' }).id; 
const tareaID2 = gestor.crearTarea('con-fecha-limite', { titulo: 'T2: Enviar informe final', prioridad: 'media', fechaLimite: new Date(Date.now() + 10000000) }).id;

// 3. Aplicar Decoradores a Tarea 1 y Tarea 2
console.log('\n✨ Aplicando Decoradores (Email y Calendario)...');

// Tarea 1: Email
const tareaDecoradaEmail = gestor.aplicarDecorador(tareaID1, 'email', 'juan.perez@empresa.com');

// Tarea 2: Email + Calendario (Encadenamiento de Decoradores)
const tareaDecoradaCalendario = gestor.aplicarDecorador(tareaID2, 'calendario');
// Ahora decoramos la tarea Calendario con Email
const tareaDobleDecorada = gestor.aplicarDecorador(tareaID2, 'email', 'gerente@empresa.com');



console.log('\n✅ Patrón Strategy implementado exitosamente para la funcionalidad de filtrado.');


