import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_uFXTPAOuMqY8cG4-nMHsokNAY4V9dYI",
  authDomain: "mi-primer-proyecto-3762d.firebaseapp.com",
  projectId: "mi-primer-proyecto-3762d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contenedor = document.getElementById("consultas");

// 🔹 CARGAR CONSULTAS
async function cargarConsultas() {
  contenedor.innerHTML = "";

  const snap = await getDocs(collection(db, "consultas"));

  snap.forEach(docSnap => {
    const c = docSnap.data();

    contenedor.innerHTML += `
      <div class="card">
        <strong>${c.email}</strong><br>
        <small>Estado: ${c.estado}</small>

        <p><b>Consulta:</b> ${c.mensaje}</p>

        <textarea id="resp-${docSnap.id}"
          placeholder="Escribe la respuesta aquí...">${c.respuesta || ""}</textarea>

        <button onclick="responder('${docSnap.id}')">
          💬 Responder
        </button>
      </div>
    `;
  });listaConsultas.innerHTML += `
  <li>
    <strong>Estado:</strong>
    ${c.estado === "respondida"
      ? "✅ Respondida"
      : "⏳ Aún no ha sido respondida"}<br><br>

    <strong>Tu consulta:</strong><br>
    ${c.mensaje}<br><br>

    ${
      c.respuesta
        ? `<strong>Respuesta:</strong><br>${c.respuesta}`
        : ""
    }
  </li>
`;

}

window.responder = async function(id) {
  const texto = document.getElementById(`resp-${id}`).value.trim();

  if (!texto) {
    Swal.fire("Escribe una respuesta");
    return;
  }

  await updateDoc(doc(db, "consultas", id), {
    respuesta: texto,
    estado: "respondida"
  });

  Swal.fire("Respondido ✅");
  cargarConsultas();
};

cargarConsultas();
