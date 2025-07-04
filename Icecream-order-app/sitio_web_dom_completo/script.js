
const imagenes = ['img1.jpg', 'img2.jpg', 'img3.jpg'];
let indice = 0;
setInterval(() => {
  indice = (indice + 1) % imagenes.length;
  document.getElementById('imagenCarrusel').src = imagenes[indice];
}, 5000);

function mostrarSeccion(id) {
  document.querySelectorAll('.seccion').forEach(seccion => {
    seccion.classList.remove('visible');
  });
  document.getElementById(id).classList.add('visible');
}

function enviarFormulario() {
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const mensaje = document.getElementById('mensaje').value.trim();
  const msgForm = document.getElementById('msgForm');
  if (!nombre || !email || !mensaje) {
    msgForm.textContent = 'Todos los campos son obligatorios.';
    msgForm.style.color = 'red';
    return false;
  }
  msgForm.textContent = 'Mensaje enviado correctamente.';
  msgForm.style.color = 'green';
  return false;
}

let grafico;

function actualizarGrafico() {
  const ctx = document.getElementById('grafico').getContext('2d');
  const tipo = document.getElementById('filtro').value;
  const datos = tipo === 'ventas'
    ? [100, 200, 300, 250, 400]
    : [50, 80, 120, 160, 200];
  const etiquetas = ['Ene', 'Feb', 'Mar', 'Abr', 'May'];

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        label: tipo,
        data: datos,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    }
  });
}

window.onload = () => {
  actualizarGrafico();
}
