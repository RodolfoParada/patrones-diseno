// Task 2: Factory Pattern y Constructor Pattern (8 minutos)
// Estos patrones ayudan a crear objetos de manera flexible y organizada.

// Factory Pattern
// Factory Pattern - crea objetos sin especificar la clase exacta
function crearVehiculo(tipo, marca, modelo, año) {
  // Lógica común de validación
  if (!marca || !modelo || !año) {
    throw new Error('Marca, modelo y año son requeridos');
  }

  if (typeof año !== 'number' || año < 1900 || año > new Date().getFullYear() + 1) {
    throw new Error('Año inválido');
  }

  // Crear objeto base
  const vehiculo = {
    marca,
    modelo,
    año,
    obtenerDescripcion: function() {
      return `${this.marca} ${this.modelo} (${this.año})`;
    }
  };

  // Personalizar según el tipo
  switch (tipo.toLowerCase()) {
    case 'coche':
      return {
        ...vehiculo,
        tipo: 'Coche',
        puertas: 4,
        combustible: 'Gasolina',
        arrancar: function() {
          console.log(`${this.obtenerDescripcion()} está arrancando...`);
        },
        conducir: function() {
          console.log(`${this.obtenerDescripcion()} está en marcha`);
        }
      };

    case 'moto':
      return {
        ...vehiculo,
        tipo: 'Motocicleta',
        cilindrada: 125,
        arrancar: function() {
          console.log(`${this.obtenerDescripcion()} está arrancando con fuerza...`);
        },
        acelerar: function() {
          console.log(`¡${this.obtenerDescripcion()} acelera rápidamente!`);
        }
      };

    case 'camion':
      return {
        ...vehiculo,
        tipo: 'Camión',
        capacidadCarga: 5000,
        arrancar: function() {
          console.log(`${this.obtenerDescripcion()} enciende su motor potente...`);
        },
        cargar: function() {
          console.log(`${this.obtenerDescripcion()} está siendo cargado`);
        }
      };

    default:
      throw new Error(`Tipo de vehículo '${tipo}' no soportado`);
  }
}

// Uso del factory
const coche = crearVehiculo('coche', 'Toyota', 'Corolla', 2020);
const moto = crearVehiculo('moto', 'Honda', 'CBR', 2019);
const camion = crearVehiculo('camion', 'Volvo', 'FH', 2021);

coche.arrancar(); // "Toyota Corolla (2020) está arrancando..."
moto.acelerar(); // "¡Honda CBR (2019) acelera rápidamente!"
camion.cargar(); // "Volvo FH (2021) está siendo cargado"

// Constructor Pattern con Clases

// Constructor Pattern usando clases
class Producto {
  constructor(nombre, precio, categoria) {
    this.nombre = nombre;
    this.precio = precio;
    this.categoria = categoria;
    this.id = Math.random().toString(36).substr(2, 9);
    this.fechaCreacion = new Date();
    this.activo = true;
  }

  // Método de instancia
  obtenerPrecioConIVA(iva = 0.21) {
    return this.precio * (1 + iva);
  }

  // Método de instancia
  aplicarDescuento(porcentaje) {
    if (porcentaje < 0 || porcentaje > 100) {
      throw new Error('Porcentaje de descuento inválido');
    }
    this.precio = this.precio * (1 - porcentaje / 100);
    return this.precio;
  }

  // Método de instancia
  obtenerDescripcion() {
    return `${this.nombre} - $${this.precio} (${this.categoria})`;
  }

  // Método estático (pertenece a la clase, no a instancias)
  static crearProductoBasico(nombre) {
    return new Producto(nombre, 0, 'Sin categoría');
  }

  // Método estático para validar datos
  static validarDatos(nombre, precio, categoria) {
    const errores = [];

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      errores.push('Nombre es requerido y debe ser un string no vacío');
    }

    if (typeof precio !== 'number' || precio < 0) {
      errores.push('Precio debe ser un número positivo');
    }

    if (!categoria || typeof categoria !== 'string') {
      errores.push('Categoría es requerida');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }
}

// Factory que usa el constructor
class FabricaProductos {
  static crearProducto(tipo, ...args) {
    switch (tipo.toLowerCase()) {
      case 'electronico':
        const [nombre, precio, marca] = args;
        const productoElectronico = new Producto(nombre, precio, 'Electrónicos');
        productoElectronico.marca = marca;
        productoElectronico.garantia = 2; // años
        return productoElectronico;

      case 'ropa':
        const [nombreRopa, precioRopa, talla] = args;
        const productoRopa = new Producto(nombreRopa, precioRopa, 'Ropa');
        productoRopa.talla = talla;
        productoRopa.material = 'Algodón';
        return productoRopa;

      case 'libro':
        const [titulo, precioLibro, autor] = args;
        const libro = new Producto(titulo, precioLibro, 'Libros');
        libro.autor = autor;
        libro.paginas = 0;
        return libro;

      default:
        throw new Error(`Tipo de producto '${tipo}' no soportado`);
    }
  }
}

// Uso del patrón
// Validación antes de crear
const validacion = Producto.validarDatos('iPhone 15', 1200, 'Electrónicos');
if (validacion.esValido) {
  const telefono = FabricaProductos.crearProducto('electronico', 'iPhone 15', 1200, 'Apple');
  console.log(telefono.obtenerDescripcion()); // "iPhone 15 - $1200 (Electrónicos)"
  console.log(`Precio con IVA: $${telefono.obtenerPrecioConIVA().toFixed(2)}`);
} else {
  console.log('Errores de validación:', validacion.errores);
}

const camisa = FabricaProductos.crearProducto('ropa', 'Camisa Azul', 45, 'M');
camisa.aplicarDescuento(10); // 10% descuento
console.log(camisa.obtenerDescripcion()); // "Camisa Azul - $40.5 (Ropa)"

// Producto básico usando método estático
const productoBasico = Producto.crearProductoBasico('Producto Genérico');
console.log(productoBasico.obtenerDescripcion()); // "Producto Genérico - $0 (Sin categoría)"