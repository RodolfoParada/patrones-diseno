// Task 3: Observer Pattern (8 minutos)
// El Observer Pattern permite que objetos se suscriban a cambios en otros objetos.

// Implementación Básica del Observer Pattern
// Observer Pattern - permite comunicación desacoplada entre objetos
class Sujeto {
  constructor() {
    this.observadores = new Set();
  }

  // Suscribir un observador
  suscribir(observador) {
    if (typeof observador === 'function') {
      this.observadores.add(observador);
    } else if (typeof observador === 'object' && observador.notificar) {
      // Si es un objeto con método notificar
      this.observadores.add(observador);
    }
  }

  // Desuscribir un observador
  desuscribir(observador) {
    this.observadores.delete(observador);
  }

  // Notificar a todos los observadores
  notificar(datos) {
    this.observadores.forEach(observador => {
      try {
        if (typeof observador === 'function') {
          observador(datos);
        } else {
          observador.notificar(datos);
        }
      } catch (error) {
        console.error('Error notificando observador:', error);
      }
    });
  }

  // Limpiar todos los observadores
  limpiar() {
    this.observadores.clear();
  }
}

// Sistema de logging como observador
class Logger {
  constructor(nivel = 'info') {
    this.nivel = nivel;
  }

  notificar(datos) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${this.nivel.toUpperCase()}:`, datos);
  }
}

// Contador que usa el patrón Observer
class ContadorObservable extends Sujeto {
  constructor() {
    super();
    this.valor = 0;
  }

  incrementar() {
    this.valor++;
    this.notificar({
      tipo: 'incremento',
      valor: this.valor,
      timestamp: new Date()
    });
  }

  decrementar() {
    if (this.valor > 0) {
      this.valor--;
      this.notificar({
        tipo: 'decremento',
        valor: this.valor,
        timestamp: new Date()
      });
    }
  }

  reset() {
    const valorAnterior = this.valor;
    this.valor = 0;
    this.notificar({
      tipo: 'reset',
      valor: this.valor,
      valorAnterior,
      timestamp: new Date()
    });
  }

  obtenerValor() {
    return this.valor;
  }
}

// Observadores específicos
class DisplayContador {
  notificar(datos) {
    console.log(`📊 Display: El contador ${datos.tipo} a ${datos.valor}`);
  }
}

class HistorialContador {
  constructor() {
    this.historial = [];
  }

  notificar(datos) {
    this.historial.push(datos);
    console.log(`📝 Historial: Registro #${this.historial.length} guardado`);
  }

  obtenerHistorial() {
    return [...this.historial];
  }
}

class AlertaContador {
  constructor(limite) {
    this.limite = limite;
  }

  notificar(datos) {
    if (datos.valor >= this.limite) {
      console.log(`🚨 ALERTA: ¡El contador llegó a ${datos.valor}!`);
    }
  }
}

// Sistema de tienda usando Observer Pattern
class TiendaOnline extends Sujeto {
  constructor() {
    super();
    this.productos = new Map();
    this.pedidos = [];
  }

  agregarProducto(producto) {
    this.productos.set(producto.id, producto);
    this.notificar({
      tipo: 'producto_agregado',
      producto
    });
  }

  realizarPedido(idProducto, cantidad, cliente) {
    const producto = this.productos.get(idProducto);

    if (!producto) {
      throw new Error('Producto no encontrado');
    }

    if (producto.stock < cantidad) {
      throw new Error('Stock insuficiente');
    }

    // Reducir stock
    producto.stock -= cantidad;

    // Crear pedido
    const pedido = {
      id: Date.now(),
      producto: { ...producto },
      cantidad,
      cliente,
      total: producto.precio * cantidad,
      fecha: new Date()
    };

    this.pedidos.push(pedido);

    this.notificar({
      tipo: 'pedido_realizado',
      pedido
    });

    return pedido;
  }

  obtenerEstadisticas() {
    const totalProductos = this.productos.size;
    const totalPedidos = this.pedidos.length;
    const ingresosTotales = this.pedidos.reduce((sum, pedido) => sum + pedido.total, 0);

    return { totalProductos, totalPedidos, ingresosTotales };
  }
}

// Observadores para la tienda
class InventarioObserver {
  notificar(datos) {
    if (datos.tipo === 'pedido_realizado') {
      const stockRestante = datos.pedido.producto.stock;
      if (stockRestante < 5) {
        console.log(`⚠️  ALERTA DE INVENTARIO: ${datos.pedido.producto.nombre} tiene solo ${stockRestante} unidades`);
      }
    }
  }
}

class ContabilidadObserver {
  constructor() {
    this.ingresos = 0;
  }

  notificar(datos) {
    if (datos.tipo === 'pedido_realizado') {
      this.ingresos += datos.pedido.total;
      console.log(`💰 Contabilidad: Ingreso registrado: $${datos.pedido.total}. Total: $${this.ingresos}`);
    }
  }
}

class LogisticaObserver {
  notificar(datos) {
    if (datos.tipo === 'pedido_realizado') {
      console.log(`📦 Logística: Preparando envío de ${datos.pedido.cantidad}x ${datos.pedido.producto.nombre} para ${datos.pedido.cliente}`);
    }
  }
}

// Demostración del Observer Pattern
console.log('🎯 DEMOSTRACIÓN: OBSERVER PATTERN\n');

// 1. Contador con múltiples observadores
console.log('🔢 SISTEMA DE CONTADOR:');
const contador = new ContadorObservable();

const display = new DisplayContador();
const historial = new HistorialContador();
const alerta = new AlertaContador(5);

contador.suscribir(display);
contador.suscribir(historial);
contador.suscribir(alerta);

contador.incrementar(); // Notifica a todos los observadores
contador.incrementar();
contador.incrementar();
contador.incrementar();
contador.incrementar(); // Activa alerta (>= 5)

console.log('Historial de cambios:', historial.obtenerHistorial().length, 'registros\n');

// 2. Sistema de tienda online
console.log('🛒 SISTEMA DE TIENDA ONLINE:');
const tienda = new TiendaOnline();

const inventario = new InventarioObserver();
const contabilidad = new ContabilidadObserver();
const logistica = new LogisticaObserver();

tienda.suscribir(inventario);
tienda.suscribir(contabilidad);
tienda.suscribir(logistica);

// Agregar productos
tienda.agregarProducto({ id: 1, nombre: 'Laptop', precio: 1000, stock: 10 });
tienda.agregarProducto({ id: 2, nombre: 'Mouse', precio: 50, stock: 3 });

// Realizar pedidos
tienda.realizarPedido(1, 2, 'Ana García');
tienda.realizarPedido(2, 2, 'Carlos López'); // Activará alerta de inventario

console.log('Estadísticas finales:', tienda.obtenerEstadisticas());