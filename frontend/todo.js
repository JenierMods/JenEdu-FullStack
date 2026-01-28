import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-firestore.js";

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

const loginBtn = document.getElementById("loginBtn");
const userMenu = document.getElementById("userMenu");
const avatar = document.getElementById("avatar");
const dropdown = document.getElementById("dropdown");

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.style.display = "none";
    userMenu.style.display = "block";
    avatar.textContent = user.email.charAt(0).toUpperCase();
  }
});

avatar.onclick = () => {
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
};

window.onclick = e => {
  if (!userMenu.contains(e.target)) dropdown.style.display = "none";
};

// ============================
// 🔒 FUNCIÓN PARA PREMIUM
// ============================
window.verificarPremium = async function (pagina) {
  const user = auth.currentUser;

  if (!user) {
    Swal.fire({
      icon: "warning",
      title: "Inicia sesión",
      text: "Debes iniciar sesión para acceder a contenido premium",
      confirmButtonText: "Iniciar sesión"
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  try {
    const response = await fetch(`http://192.168.1.18:3000/verificar-suscripcion/${user.uid}`)
    const data = await response.json();

    if (data.suscripcion_activa) {
      window.location.href = pagina;
    } else {
Swal.fire({
  title: "🔓 Desbloquea todo el contenido Premium",
  html: `
    <p style="margin-bottom:10px;">
      Accede a <strong>todos los cursos profesionales</strong> de JenEdu y aprende
      técnicas reales para el manejo y cuidado de animales.
    </p>




    <p style="font-size:13px; color:#666;">
      Invierte en conocimiento y mejora tus resultados
    </p>
  `,
  showCancelButton: true,
  confirmButtonText: "Quiero ser Premium",
  cancelButtonText: "Tal vez después",
  confirmButtonColor: "#2ecc71",
  cancelButtonColor: "#4b4b4b"
}).then((result) => {
  if (result.isConfirmed) {
    window.location.href = "suscripcion.html";
  }
});


    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo verificar tu suscripción. Intenta nuevamente."
    });
  }
};

// ============================
// 📚 GUARDAR CURSOS VISITADOS POR USUARIO
// ============================
export async function guardarCursoVisto(uid, curso) {
  if (!uid) return;
  const userRef = doc(db, "usuarios", uid);

  try {
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Si el usuario no tiene documento, crearlo con cursos_vistos
      await setDoc(userRef, { cursos_vistos: [curso] });
    } else {
      // Si existe, verificar que cursos_vistos sea un array
      const data = userSnap.data();
      if (!Array.isArray(data.cursos_vistos)) {
        await updateDoc(userRef, { cursos_vistos: [curso] });
      } else if (!data.cursos_vistos.includes(curso)) {
        await updateDoc(userRef, { cursos_vistos: arrayUnion(curso) });
      }
    }
  } catch (err) {
    console.error("Error guardando curso:", err);
  }

};

// ============================
// 📘 OBTENER CURSOS VISTOS
// ============================
export async function obtenerCursosVistos(uid) {
  const userDocRef = doc(db, "usuarios", uid);
  const userSnap = await getDoc(userDocRef);
  if (userSnap.exists()) {
    return userSnap.data().cursos_vistos || [];
  }
  return [];
}


async function obtenerPlanUsuario(uid) {
  const ref = doc(db, "usuarios", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return { plan: "Gratis", suscripcion_activa: false };
  }

  return snap.data();
}




const verifyWarning = document.getElementById("verifyWarning");

// Detectar si la página requiere login
const paginasPrivadas = ['bovinos.html','gatos.html','profile.html'];
const paginaActual = window.location.pathname.split("/").pop();

onAuthStateChanged(auth, async (user) => {
  if (!user && paginasPrivadas.includes(paginaActual)) {
    // Solo redirigir si es una página privada
    window.location.href = "login.html";
    return;
  }

  // Si hay usuario logueado, mostrar mensaje de verificación de correo
  if (user) {
    await user.reload();
    if (verifyWarning) {
      verifyWarning.style.display = user.emailVerified ? "none" : "block";
    }
  }
});
