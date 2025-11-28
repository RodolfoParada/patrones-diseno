// Task 4: Singleton Pattern (6 minutos)
// El Singleton Pattern asegura que una clase tenga solo una instancia y proporciona un punto de acceso global.

// Implementación del Singleton Pattern
// Singleton Pattern - una sola instancia global
class AdministradorConfiguracion {
  constructor() {
    if (AdministradorConfiguracion.instancia) {
      return AdministradorConfiguracion.instancia;
    }

    // Inicialización de la única instancia
    this.configuraciones = new Map();
    this.observadores = new Set();

    // Configuraciones por defecto
    this.establecer('app.nombre', 'Mi Aplicación');
    this.establecer('app.version', '1.0.0');
    this.establecer('api.url', 'https://api.example.com');
    this.establecer('api.timeout', 5000);

    AdministradorConfiguracion.instancia = this;
  }

  // Obtener configuración
  obtener(clave) {
    return this.configuraciones.get(clave);
  }

  // Establecer configuración
  establecer(clave, valor) {
    const valorAnterior = this.configuraciones.get(clave);
    this.configuraciones.set(clave, valor);

    // Notificar cambio si el valor cambió
    if (valorAnterior !== valor) {
      this.notificarObservadores({
        tipo: 'configuracion_cambiada',
        clave,
        valorAnterior,
        valorNuevo: valor
      });
    }
  }

  // Verificar si existe configuración
  tiene(clave) {
    return this.configuraciones.has(clave);
  }

  // Eliminar configuración
  eliminar(clave) {
    if (this.configuraciones.delete(clave)) {
      this.notificarObservadores({
        tipo: 'configuracion_eliminada',
        clave
      });
      return true;
    }
    return false;
  }

  // Obtener todas las configuraciones
  obtenerTodas() {
    return Object.fromEntries(this.configuraciones);
  }

  // Sistema de observadores
  suscribirObservador(observador) {
    this.observadores.add(observador);
  }

  desuscribirObservador(observador) {
    this.observadores.delete(observador);
  }

  notificarObservadores(datos) {
    this.observadores.forEach(observador => {
      try {
        observador(datos);
      } catch (error) {
        console.error('Error en observador de configuración:', error);
      }
    });
  }

  // Cargar configuraciones desde objeto
  cargarConfiguraciones(configs) {
    Object.entries(configs).forEach(([clave, valor]) => {
      this.establecer(clave, valor);
    });
  }

  // Exportar configuraciones
  exportarConfiguraciones() {
    return {
      timestamp: new Date().toISOString(),
      configuraciones: this.obtenerTodas()
    };
  }

  // Reset a valores por defecto
  reset() {
    this.configuraciones.clear();
    this.establecer('app.nombre', 'Mi Aplicación');
    this.establecer('app.version', '1.0.0');
    this.establecer('api.url', 'https://api.example.com');
    this.establecer('api.timeout', 5000);

    this.notificarObservadores({ tipo: 'configuracion_reseteada' });
  }
}

// Función factory para obtener la instancia singleton
function obtenerAdministradorConfiguracion() {
  return new AdministradorConfiguracion();
}

// Singleton para gestión de base de datos
class ConexionBaseDatos {
  constructor() {
    if (ConexionBaseDatos.instancia) {
      return ConexionBaseDatos.instancia;
    }

    this.conectado = false;
    this.config = null;
    ConexionBaseDatos.instancia = this;
  }

  conectar(config) {
    if (this.conectado) {
      console.log('Ya hay una conexión activa');
      return true;
    }

    // Simulación de conexión
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.conectado = true;
        this.config = config;
        console.log(`✅ Conectado a ${config.host}:${config.port}/${config.database}`);
        resolve(true);
      }, 1000);
    });
  }

  desconectar() {
    if (this.conectado) {
      this.conectado = false;
      console.log('❌ Desconectado de la base de datos');
      return true;
    }
    return false;
  }

  ejecutarConsulta(sql, parametros = []) {
    if (!this.conectado) {
      throw new Error('No hay conexión a la base de datos');
    }

    // Simulación de consulta
    return new Promise((resolve) => {
      setTimeout(() => {
        const resultado = {
          sql,
          parametros,
          filas: Math.floor(Math.random() * 10) + 1,
          tiempoEjecucion: Math.random() * 100 + 10
        };
        console.log(`📊 Consulta ejecutada: ${resultado.filas} filas en ${resultado.tiempoEjecucion.toFixed(2)}ms`);
        resolve(resultado);
      }, Math.random() * 500 + 100);
    });
  }

  obtenerEstado() {
    return {
      conectado: this.conectado,
      config: this.config
    };
  }
}

// Demostración del Singleton Pattern
console.log('🎯 DEMOSTRACIÓN: SINGLETON PATTERN\n');

// 1. Administrador de configuración
console.log('⚙️  ADMINISTRADOR DE CONFIGURACIÓN:');
const config1 = obtenerAdministradorConfiguracion();
const config2 = obtenerAdministradorConfiguracion();

console.log('¿Son la misma instancia?', config1 === config2); // true

// Configurar observador
config1.suscribirObservador((cambio) => {
  console.log('🔄 Configuración cambió:', cambio);
});

// Cambiar configuraciones
config1.establecer('app.version', '1.1.0');
config1.establecer('api.timeout', 10000);

// Cargar configuraciones desde objeto
config1.cargarConfiguraciones({
  'ui.theme': 'dark',
  'ui.language': 'es',
  'features.logging': true
});

console.log('Configuraciones actuales:', config1.obtenerTodas());

// 2. Conexión a base de datos
console.log('\n🗄️  CONEXIÓN A BASE DE DATOS:');
const db1 = new ConexionBaseDatos();
const db2 = new ConexionBaseDatos();

console.log('¿Son la misma instancia?', db1 === db2); // true

// Conectar y ejecutar consultas
db1.conectar({
  host: 'localhost',
  port: 5432,
  database: 'mi_app',
  user: 'admin',
  password: 'secret'
}).then(async () => {
  await db1.ejecutarConsulta('SELECT * FROM usuarios');
  await db1.ejecutarConsulta('SELECT COUNT(*) FROM pedidos WHERE estado = $1', ['pendiente']);

  console.log('Estado de conexión:', db1.obtenerEstado());

  // Intentar crear otra "instancia" (devuelve la misma)
  const db3 = new ConexionBaseDatos();
  console.log('¿db3 es igual a db1?', db3 === db1); // true
});

// Demostrar que los singletons mantienen estado global
setTimeout(() => {
  console.log('\n🔍 VERIFICACIÓN DE ESTADO GLOBAL:');
  console.log('Configuración desde instancia diferente:', config2.obtener('app.version'));
  console.log('Base de datos desde instancia diferente:', db2.obtenerEstado().conectado);
}, 1500);