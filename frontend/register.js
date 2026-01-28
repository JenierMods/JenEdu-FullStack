// ================================
// 🔥 Firebase SDKs (solo para auth si quieres usarlo después)
// ================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// ================================
// ⚙️ Config Firebase
// ================================
const firebaseConfig = {
  apiKey: "AIzaSyB_uFXTPAOuMqY8cG4-nMHsokNAY4V9dYI",
  authDomain: "mi-primer-proyecto-3762d.firebaseapp.com",
  projectId: "mi-primer-proyecto-3762d",
  storageBucket: "mi-primer-proyecto-3762d.firebasestorage.app",
  messagingSenderId: "221249466153",
  appId: "1:221249466153:web:2f987be3885a11c4c65138"
};

initializeApp(firebaseConfig);
getAuth();

// ================================
// 📝 REGISTRO
// ================================
window.register = async function () {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!nombre || !apellido || !email || !password) {
    Swal.fire({
      icon: "warning",
      title: "Campos incompletos",
      text: "Completa todos los campos"
    });
    return;
  }

  if (password.length < 6) {
    Swal.fire({
      icon: "warning",
      title: "Contraseña inválida",
      text: "La contraseña debe tener al menos 6 caracteres"
    });
    return;
  }

  // Guardar datos temporalmente
  localStorage.setItem("nombre", nombre);
  localStorage.setItem("apellido", apellido);
  localStorage.setItem("email", email);
  localStorage.setItem("password", password);

  try {
    // 👇 RUTA RELATIVA (CLAVE)
    const res = await fetch("/enviar-codigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, apellido, email, password })
    });

    const data = await res.json();

    if (data.ok) {
      Swal.fire({
        icon: "success",
        title: "Código enviado",
        text: "Te enviamos un código de verificación a tu correo",
        confirmButtonText: "Continuar"
      }).then(() => {
        window.location.href = "verify.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.error || "No se pudo enviar el código"
      });
    }
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor"
    });
  }
};
