/*
 * Tienda de Distri Repuestos Almaro.
 * Sin servidor: el catálogo sale de datos.js, el carrito se guarda en el navegador
 * (localStorage, si se puede) y el pedido se arma como mensaje y abre WhatsApp.
 * Misma base de navegación que bogota/js/principal.js, sin GSAP: el carro anima con CSS.
 */
(function () {
  'use strict';

  var D = window.ALMARO;
  var raiz = document.documentElement;
  var movimiento = window.matchMedia('(prefers-reduced-motion: no-preference)');
  var pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function precio(n) { return pesos.format(n).replace(/\s/g, ' '); }
  function porId(id) { return D.productos.filter(function (p) { return p.id === id; })[0]; }
  function categoria(id) { return D.categorias.filter(function (c) { return c.id === id; })[0]; }
  function sinTildes(s) { return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* ---------- Contactos ---------- */
  function enlaceWhatsapp(texto) { return 'https://wa.me/' + D.whatsapp + '?text=' + encodeURIComponent(texto); }
  function prepararWhatsapp(a, texto) { a.href = enlaceWhatsapp(texto); a.target = '_blank'; a.rel = 'noopener'; }
  $$('[data-whatsapp]').forEach(function (a) { prepararWhatsapp(a, a.getAttribute('data-whatsapp')); });
  $$('[data-telefono]').forEach(function (a) { a.href = 'tel:+' + D.telefono; });
  $('#direccion').textContent = D.ciudad;
  D.horario.forEach(function (h) { var li = document.createElement('li'); li.textContent = h; $('#horario').appendChild(li); });
  $('#anio').textContent = new Date().getFullYear();

  /* ---------- Navegación ---------- */
  var nav = $('#nav');
  var botonMenu = $('.nav__menu');
  function navSegunScroll() { nav.classList.toggle('nav--solida', window.scrollY > 40); }
  window.addEventListener('scroll', navSegunScroll, { passive: true });
  navSegunScroll();
  function menu(abrir) {
    nav.classList.toggle('nav--abierta', abrir);
    botonMenu.setAttribute('aria-expanded', String(abrir));
    botonMenu.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
    $('use', botonMenu).setAttribute('href', abrir ? '#i-cerrar' : '#i-menu');
    document.body.style.overflow = abrir ? 'hidden' : '';
  }
  botonMenu.addEventListener('click', function () { menu(!nav.classList.contains('nav--abierta')); });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', function () { menu(false); }); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('nav--abierta')) { menu(false); botonMenu.focus(); }
  });

  /* ---------- Entrada del inicio ---------- */
  requestAnimationFrame(function () { raiz.classList.add('listo'); });

  /* ---------- Revelar al bajar ---------- */
  if ('IntersectionObserver' in window) {
    var revelar = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('visto'); revelar.unobserve(e.target); } });
    }, { threshold: .15, rootMargin: '0px 0px -40px 0px' });
    $$('[data-revelar]').forEach(function (el) { revelar.observe(el); });
  } else {
    $$('[data-revelar]').forEach(function (el) { el.classList.add('visto'); });
  }

  /* ---------- Imagen de un producto: foto o, si no hay, su dibujo ---------- */
  function media(p, cargaPerezosa) {
    var foto = p.foto;
    var cat = categoria(p.cat);
    if (foto) {
      return '<img src="img/' + foto + '.webp" alt="' + p.nombre + '"' + (cargaPerezosa ? ' loading="lazy"' : '') + '>';
    }
    return '<svg viewBox="0 0 120 120" role="img" aria-label="' + p.nombre + '" style="color:' + cat.color + '"><use href="#p-' + cat.dibujo + '"/></svg>';
  }
  function precioHtml(p) { return (p.antes ? '<s>' + precio(p.antes) + '</s>' : '') + precio(p.precio); }

  /* ---------- Categorías ---------- */
  var listaCat = $('#lista-categorias');
  D.categorias.forEach(function (c, i) {
    var cuantos = D.productos.filter(function (p) { return p.cat === c.id; }).length;
    var li = document.createElement('li');
    li.setAttribute('data-revelar', '');
    li.style.setProperty('--retraso', (i % 4) * .07 + 's');
    li.innerHTML = '<button class="categoria" type="button" data-cat="' + c.id + '" style="--c:' + c.color + '">' +
      '<img src="img/' + c.foto + '.webp" alt="" loading="lazy">' +
      '<strong>' + c.nombre + '</strong><span>' + cuantos + ' productos <svg class="icono" aria-hidden="true"><use href="#i-flecha"/></svg></span></button>';
    listaCat.appendChild(li);
    if (revelar) revelar.observe(li);
  });

  /* ---------- Tienda: filtros ---------- */
  var estado = { cat: 'todas', q: '', orden: 'destacados', grupo: null, carro: '' };
  var chips = $('#chips');
  var entradaQ = $('#q');
  var selectOrden = $('#orden');

  function chip(id, nombre, color, cuantos) {
    return '<button class="chip" type="button" data-chip="' + id + '" aria-pressed="false" style="--c:' + color + '"><i></i>' + nombre + ' <small>' + cuantos + '</small></button>';
  }
  chips.innerHTML = chip('todas', 'Todo', '#111315', D.productos.length) + D.categorias.map(function (c) {
    return chip(c.id, c.nombre, c.color, D.productos.filter(function (p) { return p.cat === c.id; }).length);
  }).join('');
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('[data-chip]');
    if (b) { estado.cat = b.getAttribute('data-chip'); pintar(); }
  });
  entradaQ.addEventListener('input', function () { estado.q = entradaQ.value; pintar(); });
  selectOrden.addEventListener('change', function () { estado.orden = selectOrden.value; pintar(); });
  $('#limpiar').addEventListener('click', function () { quitarFiltros(); });

  function quitarFiltros() {
    estado.cat = 'todas'; estado.q = ''; estado.grupo = null;
    entradaQ.value = '';
    pintar();
  }

  // Lleva a la tienda con un filtro puesto (desde el carro, las categorías o el buscador del inicio).
  function irATienda(cambios) {
    estado.grupo = null;
    Object.keys(cambios).forEach(function (k) { estado[k] = cambios[k]; });
    entradaQ.value = estado.q;
    pintar();
    $('#tienda').scrollIntoView({ behavior: movimiento.matches ? 'smooth' : 'auto' });
  }
  $$('.punto, .categoria').forEach(function (b) {
    b.addEventListener('click', function () { irATienda({ cat: b.getAttribute('data-cat'), q: '' }); });
  });
  $('#buscador-hero').addEventListener('submit', function (e) {
    e.preventDefault();
    irATienda({ cat: 'todas', q: $('#q-hero').value.trim() });
  });

  /* ---------- Tienda: lista ---------- */
  var listaProductos = $('#productos');
  var orden = {
    destacados: function (a, b) { return peso(b) - peso(a); },
    menor: function (a, b) { return a.precio - b.precio; },
    mayor: function (a, b) { return b.precio - a.precio; },
    nombre: function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }
  };
  function peso(p) { return { top: 3, oferta: 2, nuevo: 1 }[p.etiqueta] || 0; }
  var nombresEtiqueta = { oferta: 'Oferta', top: 'Más vendido', nuevo: 'Nuevo' };

  function filtrados() {
    var palabras = sinTildes(estado.q).split(/\s+/).filter(Boolean);
    return D.productos.filter(function (p) {
      if (estado.grupo) return p.cat === 'baterias' && p.grupo === estado.grupo;
      if (estado.cat !== 'todas' && p.cat !== estado.cat) return false;
      var texto = sinTildes([p.nombre, p.marca, p.grupo || '', categoria(p.cat).nombre, p.desc].join(' '));
      return palabras.every(function (w) { return texto.indexOf(w) > -1; });
    }).sort(orden[estado.orden]);
  }

  function pintar() {
    $$('[data-chip]', chips).forEach(function (b) {
      b.setAttribute('aria-pressed', String(!estado.grupo && b.getAttribute('data-chip') === estado.cat));
    });
    var aviso = $('#filtro-vehiculo');
    aviso.hidden = !estado.grupo;
    if (estado.grupo) {
      aviso.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-carro"/></svg> Baterías grupo <strong>' + estado.grupo + '</strong> para tu ' + estado.carro +
        '<button type="button" id="quitar-vehiculo"><svg class="icono" aria-hidden="true"><use href="#i-cerrar"/></svg>Quitar</button>';
      $('#quitar-vehiculo').addEventListener('click', quitarFiltros);
    }

    var lista = filtrados();
    $('#resultados').textContent = lista.length === 1 ? '1 producto' : lista.length + ' productos';
    $('#vacio').hidden = lista.length > 0;
    listaProductos.innerHTML = lista.map(function (p, i) {
      var cat = categoria(p.cat);
      var stock = p.stock <= 5 ? '<p class="producto__stock producto__stock--poco">Últimas ' + p.stock + ' unidades</p>' : '<p class="producto__stock">Disponible</p>';
      return '<li class="producto" style="--c:' + cat.color + ';--retraso:' + Math.min(i, 8) * .04 + 's">' +
        (p.etiqueta ? '<span class="sello sello--' + p.etiqueta + '">' + nombresEtiqueta[p.etiqueta] + (p.antes ? ' −' + Math.round((1 - p.precio / p.antes) * 100) + '%' : '') + '</span>' : '') +
        '<button class="producto__media" type="button" data-ver="' + p.id + '" tabindex="-1" aria-hidden="true">' + media(p, true) + '</button>' +
        '<div class="producto__cuerpo"><p class="producto__marca">' + p.marca + (p.grupo ? ' · Grupo ' + p.grupo : '') + '</p>' +
        '<h3 class="producto__nombre"><button type="button" data-ver="' + p.id + '">' + p.nombre + '</button></h3>' + stock +
        '<div class="producto__pie"><p class="precio">' + precioHtml(p) + '</p>' +
        '<button class="agregar" type="button" data-agregar="' + p.id + '" aria-label="Agregar ' + p.nombre + ' al carrito"><svg class="icono" aria-hidden="true"><use href="#i-mas"/></svg></button></div></div></li>';
    }).join('');
  }
  listaProductos.addEventListener('click', function (e) {
    var ver = e.target.closest('[data-ver]');
    var agregarBtn = e.target.closest('[data-agregar]');
    if (agregarBtn) {
      agregar(agregarBtn.getAttribute('data-agregar'), 1, agregarBtn.closest('.producto').querySelector('.producto__media'));
      agregarBtn.classList.add('listo');
      $('use', agregarBtn).setAttribute('href', '#i-check');
      setTimeout(function () { agregarBtn.classList.remove('listo'); $('use', agregarBtn).setAttribute('href', '#i-mas'); }, 1200);
    } else if (ver) {
      abrirFicha(ver.getAttribute('data-ver'));
    }
  });

  /* ---------- Oferta (producto estrella) ---------- */
  var estrella = porId(D.estrella);
  $('#oferta-precio').innerHTML = precio(estrella.precio);
  $('#oferta-img').src = 'img/' + estrella.foto + '.webp';
  $('#oferta-img').alt = estrella.nombre;
  $('#oferta-nombre').textContent = estrella.nombre;
  $('[data-comprar]').addEventListener('click', function () {
    agregar(estrella.id, 1, $('.oferta__foto'));
    setTimeout(abrirCarrito, movimiento.matches ? 750 : 0);
  });

  /* ---------- Testimonios ---------- */
  $('#testimonios').innerHTML = D.testimonios.map(function (t, i) {
    return '<li class="testimonio" data-revelar style="--retraso:' + i * .1 + 's"><p>“' + t.texto + '”</p><span>' + t.nombre + '</span></li>';
  }).join('');
  $$('#testimonios [data-revelar]').forEach(function (el) { if (revelar) revelar.observe(el); else el.classList.add('visto'); });

  /* ---------- Ficha del producto ---------- */
  var ficha = $('#ficha');
  var fichaProducto = null;
  var fichaCantidad = 1;
  function abrirFicha(id) {
    var p = porId(id);
    var cat = categoria(p.cat);
    fichaProducto = p;
    fichaCantidad = 1;
    ficha.style.setProperty('--c', cat.color);
    $('#ficha-media').innerHTML = media(p, false);
    $('#ficha-marca').textContent = p.marca + ' · ' + cat.nombre;
    $('#ficha-nombre').textContent = p.nombre;
    $('#ficha-precio').innerHTML = precio(p.precio) + (p.antes ? '<s>' + precio(p.antes) + '</s>' : '');
    $('#ficha-desc').textContent = p.desc;
    $('#ficha-specs').innerHTML = Object.keys(p.specs).map(function (k) { return '<dt>' + k + '</dt><dd>' + p.specs[k] + '</dd>'; }).join('');
    $('#ficha-stock').textContent = p.stock <= 5 ? 'Quedan ' + p.stock + ' unidades' : 'Disponible para entrega inmediata';
    prepararWhatsapp($('#ficha-preguntar'), 'Hola, ¿el producto "' + p.nombre + '" le sirve a mi carro? Es un…');
    cantidadFicha(0);
    ficha.showModal();
  }
  function cantidadFicha(paso) {
    fichaCantidad = Math.max(1, Math.min(fichaProducto.stock, fichaCantidad + paso));
    $('#ficha-cantidad').textContent = fichaCantidad;
    $('[data-paso="-1"]', ficha).disabled = fichaCantidad <= 1;
    $('[data-paso="1"]', ficha).disabled = fichaCantidad >= fichaProducto.stock;
  }
  $$('[data-paso]', ficha).forEach(function (b) { b.addEventListener('click', function () { cantidadFicha(+b.getAttribute('data-paso')); }); });
  $('#ficha-agregar').addEventListener('click', function () {
    var origen = $('#ficha-media');
    agregar(fichaProducto.id, fichaCantidad, origen);
    ficha.close();
  });

  // Cerrar diálogos: botón, clic en el fondo y Escape (el navegador ya lo hace).
  $$('dialog').forEach(function (d) {
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-cerrar]')) d.close();
    });
  });

  /* ---------- Carrito ---------- */
  var CLAVE = 'almaro-carrito';
  var carrito = leer();
  function leer() {
    try {
      var c = JSON.parse(localStorage.getItem(CLAVE)) || {};
      Object.keys(c).forEach(function (id) { if (!porId(id)) delete c[id]; });
      return c;
    } catch (e) { return {}; }
  }
  function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento: vive mientras la página esté abierta */ } }
  function unidades() { return Object.keys(carrito).reduce(function (s, id) { return s + carrito[id]; }, 0); }
  function subtotal() { return Object.keys(carrito).reduce(function (s, id) { return s + porId(id).precio * carrito[id]; }, 0); }

  function agregar(id, cantidad, origen) {
    var p = porId(id);
    carrito[id] = Math.min(p.stock, (carrito[id] || 0) + cantidad);
    guardar();
    volar(origen);
    actualizarContador(true);
    pintarCarrito();
    avisar(p.nombre);
  }

  var botonCarrito = $('#abrir-carrito');
  function actualizarContador(saltar) {
    var n = unidades();
    var c = $('#contador');
    c.textContent = n;
    c.classList.toggle('hay', n > 0);
    botonCarrito.setAttribute('aria-label', 'Abrir carrito (' + n + (n === 1 ? ' producto)' : ' productos)'));
    if (saltar && movimiento.matches) {
      botonCarrito.classList.remove('salta');
      void botonCarrito.offsetWidth;
      botonCarrito.classList.add('salta');
    }
  }

  // La imagen del producto vuela hasta el botón del carrito.
  function volar(origen) {
    if (!origen || !movimiento.matches || !origen.animate) return;
    var a = origen.getBoundingClientRect();
    var b = botonCarrito.getBoundingClientRect();
    var lado = Math.min(a.width, a.height, 160);
    var copia = document.createElement('div');
    copia.className = 'volando';
    copia.innerHTML = origen.innerHTML;
    copia.style.cssText = 'left:' + (a.left + a.width / 2 - lado / 2) + 'px;top:' + (a.top + a.height / 2 - lado / 2) + 'px;width:' + lado + 'px;height:' + lado + 'px;color:' + getComputedStyle(origen).color;
    document.body.appendChild(copia);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2);
    var dy = b.top + b.height / 2 - (a.top + a.height / 2);
    copia.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * .5 + 'px,' + (dy * .5 - 80) + 'px) scale(.6) rotate(-10deg)', opacity: 1, offset: .55 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.12)', opacity: .4 }
    ], { duration: 700, easing: 'cubic-bezier(.5,0,.6,1)' }).onfinish = function () { copia.remove(); };
  }

  var aviso = $('#aviso');
  var esperaAviso;
  function avisar(nombre) {
    aviso.innerHTML = '<svg class="icono" aria-hidden="true"><use href="#i-check"/></svg><span>Agregado: ' + nombre + '</span><button type="button">Ver carrito</button>';
    $('button', aviso).addEventListener('click', abrirCarrito);
    aviso.classList.add('visible');
    clearTimeout(esperaAviso);
    esperaAviso = setTimeout(function () { aviso.classList.remove('visible'); }, 3200);
  }

  var dialogoCarrito = $('#carrito');
  var lista = $('#carrito-lista');
  function pintarCarrito() {
    var ids = Object.keys(carrito);
    var vacio = ids.length === 0;
    $('#carrito-vacio').hidden = !vacio;
    $('#carrito-pie').hidden = vacio;
    $('#envio-gratis').hidden = vacio;
    lista.hidden = vacio;
    lista.innerHTML = ids.map(function (id) {
      var p = porId(id);
      var n = carrito[id];
      return '<li class="linea" style="--c:' + categoria(p.cat).color + '"><div class="linea__media">' + media(p, false) + '</div>' +
        '<div><p class="linea__nombre">' + p.nombre + '</p><p class="linea__precio">' + precio(p.precio) + ' c/u</p></div>' +
        '<div class="linea__lado"><p class="linea__total">' + precio(p.precio * n) + '</p>' +
        '<div class="cantidad cantidad--chica" role="group" aria-label="Cantidad de ' + p.nombre + '">' +
        '<button type="button" data-cambiar="' + id + '" data-n="-1" aria-label="Quitar uno">' + (n === 1 ? '<svg class="icono" aria-hidden="true"><use href="#i-basura"/></svg>' : '<svg class="icono" aria-hidden="true"><use href="#i-menos"/></svg>') + '</button>' +
        '<output>' + n + '</output>' +
        '<button type="button" data-cambiar="' + id + '" data-n="1" aria-label="Agregar uno"' + (n >= p.stock ? ' disabled' : '') + '><svg class="icono" aria-hidden="true"><use href="#i-mas"/></svg></button></div></div></li>';
    }).join('');

    var total = subtotal();
    $('#subtotal').textContent = precio(total);
    // La barra muestra cuánto falta para el mínimo de la contraentrega.
    var falta = D.contraentrega.minimo - total;
    $('#envio-texto').innerHTML = falta > 0 ? 'Te faltan <strong>' + precio(falta) + '</strong> para pagar contraentrega en Funza' : '<strong>Puedes pagar contraentrega</strong> en Funza y barrios cercanos';
    $('#envio-barra').style.width = Math.min(100, total / D.contraentrega.minimo * 100) + '%';
    actualizarPedido();
  }
  lista.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cambiar]');
    if (!b) return;
    var id = b.getAttribute('data-cambiar');
    carrito[id] += +b.getAttribute('data-n');
    if (carrito[id] <= 0) delete carrito[id];
    guardar();
    actualizarContador(false);
    pintarCarrito();
  });
  $('#vaciar').addEventListener('click', function () {
    carrito = {};
    guardar();
    actualizarContador(false);
    pintarCarrito();
  });

  function abrirCarrito() {
    aviso.classList.remove('visible');
    pasoCarrito('productos');
    if (!dialogoCarrito.open) dialogoCarrito.showModal();
  }
  botonCarrito.addEventListener('click', abrirCarrito);

  /* ---------- Pedido ---------- */
  var formPedido = $('#paso-pedido');
  function pasoCarrito(cual) {
    var enPedido = cual === 'pedido';
    $('#paso-productos').hidden = enPedido;
    formPedido.hidden = !enPedido;
    $('#volver-carrito').hidden = !enPedido;
    $('#carrito-titulo').textContent = enPedido ? 'Datos del pedido' : 'Tu carrito';
    if (enPedido) $('#p-nombre').focus();
  }
  $('#ir-pedido').addEventListener('click', function () { pasoCarrito('pedido'); });
  $('#volver-carrito').addEventListener('click', function () { pasoCarrito('productos'); });

  var notasEntrega = {
    domicilio: 'Domicilio en Funza el mismo día. El valor del domicilio te lo confirmamos por WhatsApp.',
    nacional: 'Envío por transportadora: de 2 a 4 días hábiles. El flete te lo confirmamos por WhatsApp.',
    tienda: 'Recoges en el almacén: sin costo de envío.'
  };
  // Contraentrega: solo domicilio en Funza y desde el mínimo. Datáfono: solo en el almacén.
  function pagosPermitidos(entrega, total) {
    return {
      contraentrega: entrega === 'domicilio' && total >= D.contraentrega.minimo,
      datafono: entrega === 'tienda'
    };
  }
  function actualizarPedido() {
    var entrega = formPedido.entrega.value;
    var total = subtotal();
    $('#campo-direccion').hidden = entrega === 'tienda';
    $('#p-direccion').required = entrega !== 'tienda';
    $('#etiqueta-direccion').textContent = entrega === 'nacional' ? 'Ciudad, dirección y barrio' : 'Dirección y barrio';

    var permitidos = pagosPermitidos(entrega, total);
    $$('input[name="pago"]', formPedido).forEach(function (r) {
      var clave = r.getAttribute('data-pago');
      r.disabled = clave ? !permitidos[clave] : false;
      if (r.disabled && r.checked) $('input[name="pago"][value="Nequi"]', formPedido).checked = true;
    });

    var recargo = formPedido.pago.value === 'Contraentrega (efectivo)' ? D.contraentrega.costo : 0;
    $('#total-pedido').textContent = precio(total + recargo);
    $('#nota-envio').textContent = notasEntrega[entrega] + (recargo ? ' Incluye ' + precio(recargo) + ' de la contraentrega.' : '');
  }
  formPedido.addEventListener('change', actualizarPedido);

  formPedido.addEventListener('submit', function (e) {
    e.preventDefault();
    var error = $('#error-pedido');
    var invalidos = $$('input[required]', formPedido).filter(function (i) {
      var malo = !i.closest('[hidden]') && !i.checkValidity();
      i.setAttribute('aria-invalid', String(malo));
      return malo;
    });
    if (invalidos.length) {
      error.textContent = 'Revisa ' + invalidos.map(function (i) { return $('label[for="' + i.id + '"]').firstChild.textContent.trim().toLowerCase(); }).join(', ') + '.';
      invalidos[0].focus();
      return;
    }
    error.textContent = '';
    var f = formPedido;
    var entrega = f.entrega.value;
    var recargo = f.pago.value === 'Contraentrega (efectivo)' ? D.contraentrega.costo : 0;
    var lineas = Object.keys(carrito).map(function (id) {
      var p = porId(id);
      return '• ' + carrito[id] + ' × ' + p.nombre + ' — ' + precio(p.precio * carrito[id]);
    });
    var texto = [
      '🔧 *Pedido · Distrirepuestos Almaro*',
      '',
      lineas.join('\n'),
      '',
      recargo ? 'Contraentrega: ' + precio(recargo) : null,
      '*Total: ' + precio(subtotal() + recargo) + '*',
      '',
      '*Entrega:* ' + ({ domicilio: 'Domicilio en Funza — ', nacional: 'Envío nacional por transportadora — ', tienda: 'Recojo en el almacén' })[entrega] + (entrega === 'tienda' ? '' : f.direccion.value.trim()),
      '*Pago:* ' + f.pago.value,
      '*Nombre:* ' + f.nombre.value.trim(),
      '*Celular:* ' + f.telefono.value.trim()
    ];
    if (f.carro.value.trim()) texto.push('*Carro:* ' + f.carro.value.trim());
    window.open(enlaceWhatsapp(texto.filter(function (l) { return l !== null; }).join('\n')), '_blank', 'noopener');
  });

  /* ---------- Buscador por vehículo ---------- */
  var selMarca = $('#marca-carro');
  var selModelo = $('#modelo-carro');
  var medidor = $('#medidor');
  Object.keys(D.vehiculos).forEach(function (m) { selMarca.add(new Option(m, m)); });
  selMarca.addEventListener('change', function () {
    selModelo.innerHTML = '';
    selModelo.add(new Option(selMarca.value ? 'Escoge el modelo' : 'Primero la marca', ''));
    if (selMarca.value) Object.keys(D.vehiculos[selMarca.value]).forEach(function (m) { selModelo.add(new Option(m, m)); });
    selModelo.disabled = !selMarca.value;
    mostrarGrupo();
  });
  selModelo.addEventListener('change', mostrarGrupo);
  function grupoElegido() { return selMarca.value && selModelo.value ? D.vehiculos[selMarca.value][selModelo.value] : null; }
  function mostrarGrupo() {
    var g = grupoElegido();
    $('#grupo-texto').textContent = g || '—';
    medidor.classList.remove('lleno');
    if (g) { void medidor.offsetWidth; medidor.classList.add('lleno'); }
  }
  $('#form-vehiculo').addEventListener('submit', function (e) {
    e.preventDefault();
    var g = grupoElegido();
    if (!g) return;
    var carro = selMarca.value + ' ' + selModelo.value;
    $('#p-carro').value = carro;
    irATienda({ cat: 'baterias', q: '' });
    estado.grupo = g;
    estado.carro = carro;
    pintar();
  });

  pintar();
  pintarCarrito();
  actualizarContador(false);
})();
