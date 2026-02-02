import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-storage.js";

import { updateProfile } 
from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

import { addDoc } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { 
  getFirestore, collection, getDocs, query, where, 
  doc, getDoc, setDoc, updateDoc, arrayUnion, deleteDoc 
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_uFXTPAOuMqY8cG4-nMHsokNAY4V9dYI",
  authDomain: "mi-primer-proyecto-3762d.firebaseapp.com",
  projectId: "mi-primer-proyecto-3762d",
  storageBucket: "mi-primer-proyecto-3762d.firebasestorage.app",
  messagingSenderId: "221249466153",
  appId: "1:221249466153:web:2f987be3885a11c4c65138"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ======================
   AVATAR
====================== */
const avatar = document.getElementById("avatar");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");
const avatarHint = document.getElementById("avatarHint");
const deleteAvatarBtn = document.getElementById("deleteAvatarBtn");
const avatarInitial = document.getElementById("avatarInitial");




avatar.addEventListener("click", () => {
  avatarInput.click();
});
avatarHint.addEventListener("click", () => {
  avatarInput.click();
});


avatarInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const user = auth.currentUser;
  if (!file || !user) return;

  try {
    Swal.fire({
      title: "Subiendo foto...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    deleteAvatarBtn.style.display = "inline-block";
avatarInitial.style.display = "none";
avatarHint.style.display = "none";


    const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
    await uploadBytes(avatarRef, file);

    const photoURL = await getDownloadURL(avatarRef);
    await updateProfile(user, { photoURL });

    avatarImg.onload = () => {
      avatar.style.background = "transparent";
    };

    avatarImg.src = photoURL;
    avatarImg.hidden = false;
    avatar.textContent = "";

    Swal.fire({
      icon: "success",
      title: "Foto actualizada",
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo subir la imagen", "error");
  }
});

/* ======================
   ELEMENTOS UI
====================== */
const asesoriaPremium = document.getElementById("asesoriaPremium");
const consultaInput = document.getElementById("consultaInput");
const enviarConsultaBtn = document.getElementById("enviarConsultaBtn");
const listaConsultas = document.getElementById("listaConsultas");

const userEmail = document.getElementById("userEmail");
const createdAt = document.getElementById("createdAt");
const logoutBtn = document.getElementById("logoutBtn");
const verified = document.getElementById("verified");
const plan = document.getElementById("plan");
const freeCount = document.getElementById("freeCount");
const premiumCount = document.getElementById("premiumCount");
const coursesList = document.getElementById("coursesList");

/* ======================
   CURSOS
====================== */
const cursos = [
  { nombre: "Caprinos", tipo: "free" },
  { nombre: "Gatos", tipo: "free" },
  { nombre: "Bovinos", tipo: "premium" },
  { nombre: "Gallinas", tipo: "premium" },
  { nombre: "Perros", tipo: "premium" },
  { nombre: "Conejos", tipo: "premium" },
  { nombre: "Porcinos", tipo: "premium" },
  { nombre: "Equinos", tipo: "premium" }
];

async function obtenerCursosVistos(uid) {
  const refDoc = doc(db, "usuarios", uid);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) {
    await setDoc(refDoc, { cursos_vistos: [] });
    return [];
  }
  return snap.data().cursos_vistos || [];
}

/* ======================
   AUTH
====================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  await user.reload();

if (user.photoURL) {
  avatarImg.src = user.photoURL;
  avatarImg.style.display = "block";


  avatarHint.style.display = "none";
  deleteAvatarBtn.style.display = "inline-block";

} else {
  avatarImg.src = "";
  avatarImg.style.display = "none";

  avatarInitial.style.display = "block";
  avatarInitial.textContent = "Agrega tu foto";

  avatarHint.style.display = "block";
  deleteAvatarBtn.style.display = "none";
}



  userEmail.textContent = user.email;
  createdAt.textContent = new Date(user.metadata.creationTime).toLocaleDateString();
  verified.textContent = user.emailVerified ? "Sí " : "No ";

  const datosUsuario = await obtenerPlanUsuario(user.uid);

  if (datosUsuario.suscripcion_activa) {
    plan.textContent = "Premium";
    asesoriaPremium.style.display = "block";
    cargarConsultas(user.uid);
  } else {
    plan.textContent = "Gratis";
    asesoriaPremium.style.display = "none";
  }

  freeCount.textContent = cursos.filter(c => c.tipo === "free").length;
  premiumCount.textContent = cursos.filter(c => c.tipo === "premium").length;

  const vistos = await obtenerCursosVistos(user.uid);
  coursesList.innerHTML = vistos.length
    ? vistos.map(c => `<li>${c}</li>`).join("")
    : "<li>Aún no has visitado cursos</li>";
});

/* ======================
   LOGOUT
====================== */
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => window.location.href = "login.html");
});

/* ======================
   PLAN
====================== */
async function obtenerPlanUsuario(uid) {
  const refDoc = doc(db, "usuarios", uid);
  const snap = await getDoc(refDoc);
  if (!snap.exists()) {
    return { plan: "Gratis", suscripcion_activa: false };
  }
  return snap.data();
}

/* ======================
   CONSULTAS
====================== */
enviarConsultaBtn.addEventListener("click", async () => {
  const mensaje = consultaInput.value.trim();
  const user = auth.currentUser;

  if (!mensaje) {
    Swal.fire({
      icon: "warning",
      title: "Consulta vacía",
      text: "Escribe tu consulta antes de enviarla"
    });
    return;
  }

  try {
    await addDoc(collection(db, "consultas"), {
      uid: user.uid,
      email: user.email,
      mensaje,
      estado: "pendiente",
      respuesta: "",
      fecha: new Date()
    });

    consultaInput.value = "";

    Swal.fire({
      icon: "success",
      title: "Consulta enviada",
      timer: 2500,
      showConfirmButton: false
    });

    cargarConsultas(user.uid);

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo enviar tu consulta", "error");
  }
});

async function cargarConsultas(uid) {
  listaConsultas.innerHTML = "";

  const q = query(collection(db, "consultas"), where("uid", "==", uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    listaConsultas.innerHTML = "<li>Aún no has enviado consultas</li>";
    return;
  }

  snap.forEach(docSnap => {
    const c = docSnap.data();
    const consultaId = docSnap.id;

    listaConsultas.innerHTML += `
      <li class="consulta-item">
        <strong>Estado:</strong> ${c.estado === "pendiente" ? "Pendiente" : "Respondida"}<br><br>
        <strong>Tu consulta:</strong><br>${c.mensaje}<br><br>
        ${
          c.estado === "ya" && c.respuesta
            ? `<strong>Respuesta:</strong><br>${c.respuesta}`
            : `<em>Aún no ha sido respondida</em>`
        }
        <br><br>
        <button class="btn-borrar" data-id="${consultaId}">Borrar consulta</button>
      </li>
    `;
  });

  document.querySelectorAll(".btn-borrar").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const confirm = await Swal.fire({
        title: "¿Eliminar esta consulta?",
        icon: "warning",
        showCancelButton: true
      });

      if (!confirm.isConfirmed) return;
      await deleteDoc(doc(db, "consultas", id));
      cargarConsultas(uid);
    });
  });
}


/* ======================
   ELIMINAR FOTO
====================== */
/* ======================
   ELIMINAR FOTO (REAL)
====================== */
deleteAvatarBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const confirm = await Swal.fire({
    title: "¿Eliminar foto de perfil?",
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    confirmButtonText: "Eliminar"
  });

  if (!confirm.isConfirmed) return;

  try {
    // 1️⃣ borrar archivo del storage
    const avatarRef = ref(storage, `avatars/${user.uid}.jpg`);
    await deleteObject(avatarRef);

    // 2️⃣ borrar foto del auth
    await updateProfile(user, { photoURL: null });

    // 3️⃣ reset UI
    avatarImg.src = "";
    avatarImg.style.display = "none";
    avatarInitial.style.display = "block";
    avatarInitial.textContent = "Agrega tu foto";
    avatarHint.style.display = "block";
    deleteAvatarBtn.style.display = "none";

    Swal.fire("Listo", "Tu foto fue eliminada", "success");

  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo eliminar la foto", "error");
  }
});
