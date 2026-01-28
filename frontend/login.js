import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Config Firebase
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

window.login = function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("⚠️ Completa todos los campos.");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      if (!user.emailVerified) {
        alert("📩 Debes verificar tu correo antes de iniciar sesión.");
        signOut(auth);
        return;
      }

      window.location.href = "index.html";
    })
    .catch((error) => {
      let mensaje = "Ocurrió un error. Inténtalo nuevamente.";
      switch (error.code) {
        case "auth/user-not-found":
          mensaje = "📧 Este correo no está registrado.";
          break;
        case "auth/wrong-password":
          mensaje = "🔑 La contraseña es incorrecta.";
          break;
        case "auth/too-many-requests":
          mensaje = "⏳ Demasiados intentos fallidos. Intenta más tarde.";
          break;
      }
      alert(mensaje);
    });
};
