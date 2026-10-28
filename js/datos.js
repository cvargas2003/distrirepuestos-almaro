/*
 * Datos de Distrirepuestos Almaro: la única fuente del catálogo, los contactos, las entregas
 * y el buscador por vehículo. Los textos de las secciones viven en index.html.
 *
 * Fuente: "Plantilla_Ecommerce_final correccion.docx" (entrevista al propietario, Funza).
 * Los productos 1 a 6 y sus fotos son los del documento; los demás se agregaron para el
 * prototipo con precios de referencia y fotos de Wikimedia Commons.
 */
window.ALMARO = {
  whatsapp: '573001234567',
  telefono: '573001234567',
  ciudad: 'Funza, Cundinamarca',
  horario: ['Lunes a sábado · 8:00 a. m. – 6:00 p. m.'],

  // Contraentrega: solo domicilio en Funza y barrios cercanos, en efectivo al repartidor.
  contraentrega: { minimo: 50000, costo: 3000 },

  categorias: [
    { id: 'baterias',     nombre: 'Baterías',        dibujo: 'bateria',      color: '#E3242B', foto: 'producto-1-bateria' },
    { id: 'frenos',       nombre: 'Frenos',          dibujo: 'freno',        color: '#FF7A1A', foto: 'freno-3' },
    { id: 'suspension',   nombre: 'Suspensión',      dibujo: 'amortiguador', color: '#2F8FE8', foto: 'producto-3-amortiguador' },
    { id: 'motor',        nombre: 'Motor',           dibujo: 'aceite',       color: '#33C481', foto: 'motor-1' },
    { id: 'carburacion',  nombre: 'Carburación',     dibujo: 'filtro',       color: '#9B6BFF', foto: 'producto-6-carburador' },
    { id: 'electrica',    nombre: 'Parte eléctrica', dibujo: 'bujia',        color: '#FFC72C', foto: 'bujia-1' }
  ],

  // etiqueta: 'oferta' | 'top' | 'nuevo'. antes: precio tachado (solo en ofertas). foto: img/<foto>.webp.
  productos: [
    // ----- Los 6 del documento del cliente -----
    { id: 'mac-ns40', cat: 'baterias', marca: 'MAC', nombre: 'Batería MAC NS40', precio: 320000, etiqueta: 'top', stock: 12, grupo: 'NS40', foto: 'producto-1-bateria',
      specs: { 'Grupo': 'NS40', 'Voltaje': '12 V', 'Mantenimiento': 'Libre de mantenimiento', 'Garantía': 'Sí' }, desc: 'Para carros pequeños: Spark, Picanto, March, Kwid y similares.' },
    { id: 'pastillas-sandero', cat: 'frenos', marca: 'Incolbest', nombre: 'Pastillas de freno delanteras Renault Sandero 10243GX', precio: 65000, etiqueta: 'top', stock: 15, foto: 'producto-2-pastillas',
      specs: { 'Referencia': '10243GX', 'Eje': 'Delantero', 'Vehículo': 'Renault Sandero', 'Garantía': 'Sí' }, desc: 'Juego completo para las dos ruedas delanteras.' },
    { id: 'amortiguador-sandero', cat: 'suspension', marca: 'Gabriel', nombre: 'Amortiguador delantero Renault Sandero (unidad)', precio: 150000, stock: 8, foto: 'producto-3-amortiguador',
      specs: { 'Posición': 'Delantero', 'Vehículo': 'Renault Sandero', 'Venta': 'Por unidad', 'Garantía': 'Sí' }, desc: 'Se recomienda cambiarlos en pareja para que el carro quede parejo.' },
    { id: 'filtro-sandero', cat: 'motor', marca: 'Tecnifil', nombre: 'Filtro de aceite para motor Renault Sandero', precio: 18000, stock: 40, foto: 'producto-4-filtro',
      specs: { 'Tipo': 'Roscado', 'Vehículo': 'Renault Sandero', 'Cambio': 'Con cada cambio de aceite' }, desc: 'Cámbialo siempre junto con el aceite.' },
    { id: 'bujias-x4', cat: 'electrica', marca: 'NGK', nombre: 'Bujías (juego x4)', precio: 48000, stock: 25, foto: 'producto-5-bujias',
      specs: { 'Juego': '4 unidades', 'Garantía': 'Sí' }, desc: 'Dinos tu carro y te damos la referencia exacta.' },
    { id: 'kit-carburador', cat: 'carburacion', marca: 'Almaro', nombre: 'Kit de reparación de carburador', precio: 85000, stock: 6, foto: 'producto-6-carburador',
      specs: { 'Incluye': 'Empaques, chicleres, agujas y diafragma', 'Garantía': 'Sí' }, desc: 'Para dejar el carburador como nuevo. Confirma el modelo antes de pedirlo.' },

    // ----- Agregados para el prototipo -----
    { id: 'mac-42', cat: 'baterias', marca: 'MAC', nombre: 'Batería MAC 42', precio: 375000, antes: 410000, etiqueta: 'oferta', stock: 10, grupo: '42', foto: 'bateria-2',
      specs: { 'Grupo': '42', 'Voltaje': '12 V', 'Mantenimiento': 'Libre de mantenimiento', 'Garantía': 'Sí' }, desc: 'Para sedanes y hatchback: Logan, Sandero, Onix, Rio, Accent…' },
    { id: 'willard-24', cat: 'baterias', marca: 'Willard', nombre: 'Batería Willard 24', precio: 430000, etiqueta: 'nuevo', stock: 4, grupo: '24', foto: 'bateria-4',
      specs: { 'Grupo': '24', 'Voltaje': '12 V', 'Mantenimiento': 'Libre de mantenimiento', 'Garantía': 'Sí' }, desc: 'Para Mazda, Toyota, Nissan y camionetas medianas.' },
    { id: 'disco-freno', cat: 'frenos', marca: 'Almaro', nombre: 'Disco de freno delantero ventilado', precio: 140000, stock: 6, foto: 'freno-3',
      specs: { 'Tipo': 'Ventilado', 'Venta': 'Por unidad', 'Garantía': 'Sí' }, desc: 'Referencia según tu vehículo.' },
    { id: 'terminal-direccion', cat: 'suspension', marca: 'Almaro', nombre: 'Terminal de dirección Renault Logan / Sandero', precio: 42000, stock: 9,
      specs: { 'Vehículo': 'Renault Logan y Sandero', 'Venta': 'Por unidad' }, desc: 'Si la dirección "juega" o suena al girar, revísalo.' },
    { id: 'aceite-20w50', cat: 'motor', marca: 'Mobil', nombre: 'Aceite 20W-50 para motor · 4 L', precio: 125000, stock: 20, foto: 'aceite-2',
      specs: { 'Viscosidad': '20W-50', 'Contenido': '4 litros' }, desc: 'Para motores a gasolina con kilometraje alto.' },
    { id: 'empaques-carburador', cat: 'carburacion', marca: 'Almaro', nombre: 'Juego de empaques de carburador', precio: 22000, stock: 14,
      specs: { 'Incluye': 'Empaques de base y tapa' }, desc: 'Evita fugas de gasolina y entradas de aire.' },
    { id: 'bombillo-h4', cat: 'electrica', marca: 'Philips', nombre: 'Bombillo H4 para farola (par)', precio: 45000, antes: 55000, etiqueta: 'oferta', stock: 18, foto: 'bombillo-1',
      specs: { 'Base': 'H4', 'Potencia': '60/55 W', 'Venta': 'Par' }, desc: 'Más luz en la vía de noche.' },
    { id: 'cables-arranque', cat: 'electrica', marca: 'Almaro', nombre: 'Cables de arranque 400 A · 3 m', precio: 69000, stock: 11, foto: 'cables-1',
      specs: { 'Corriente': '400 A', 'Largo': '3 metros' }, desc: 'Para que nunca te quedes varado.' }
  ],

  // Producto estrella de la sección Oferta.
  estrella: 'mac-ns40',

  // Testimonios: el cliente quiere mostrarlos, pero aún no los ha enviado. Estos son DE EJEMPLO
  // (la página lo dice); reemplazarlos por los reales con nombre autorizado.
  testimonios: [
    { texto: 'Me dijeron exactamente qué pastillas necesitaba mi Sandero y me las llevaron el mismo día.', nombre: 'Cliente de Funza' },
    { texto: 'Compro la batería aquí hace años. Buen precio y si algo falla, responden.', nombre: 'Cliente de Mosquera' },
    { texto: 'Atención de verdad: te explican antes de venderte.', nombre: 'Cliente de Madrid (Cund.)' }
  ],

  // Buscador por vehículo: grupo de batería sugerido. Es ORIENTATIVO (cambia por año y motor):
  // la página pide confirmarlo por WhatsApp antes de comprar.
  vehiculos: {
    'Chevrolet': { 'Spark GT': 'NS40', 'Sail': '42', 'Onix': '42', 'Aveo': '42' },
    'Renault':   { 'Kwid': 'NS40', 'Logan': '42', 'Sandero': '42', 'Stepway': '42', 'Duster': '42' },
    'Kia':       { 'Picanto': 'NS40', 'Rio': '42', 'Sportage': '24' },
    'Hyundai':   { 'Grand i10': 'NS40', 'Accent': '42', 'Tucson': '24' },
    'Mazda':     { 'Mazda 2': '42', 'Mazda 3': '24', 'CX-5': '24' },
    'Toyota':    { 'Yaris': '42', 'Corolla': '24' },
    'Nissan':    { 'March': 'NS40', 'Versa': '42', 'Sentra': '24' }
  }
};
