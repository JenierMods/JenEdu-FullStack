// server.js
require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-admin.json");

const app = express();
app.use(cors());
app.use(express.json());

const axios = require("axios");

async function getPayPalToken() {
  const response = await axios({
    url: `${process.env.PAYPAL_BASE}/v1/oauth2/token`,
    method: "post",
    data: "grant_type=client_credentials",
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET
    }
  });

  return response.data.access_token;
}



// ============================
// 💳 ACTIVAR SUSCRIPCIÓN PREMIUM
// ============================
app.post("/activar-suscripcion", async (req, res) => {
  const { uid, orderID } = req.body;

  if (!uid || !orderID) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    await db.collection("usuarios").doc(uid).set({
      suscripcion_activa: true,
      plan: "Premium",
      paypal_order: orderID,
      fecha_suscripcion: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "No se pudo activar la suscripción" });
  }
});



// ============================
// 📁 FRONTEND
// ============================
const frontendPath = path.join(__dirname, "../frontend");
app.use(express.static(frontendPath));

// RUTAS HTML (CLAVE 🔑)
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/login.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/register.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "register.html"));
});

app.get("/verify.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "verify.html"));
});

app.get("/profile.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "profile.html"));
});

// ============================
// 🔥 FIREBASE ADMIN
// ============================
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ============================
// ✉️ EMAIL
// ============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jeniermodsao@gmail.com",
    pass: "zeoyvxsdkjdftfxk"
  }
});

// ============================
// 🧰 UTILIDAD
// ============================
function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================
// 1️⃣ ENVIAR CÓDIGO
// ============================
app.post("/enviar-codigo", async (req, res) => {
  const { nombre, apellido, email, password } = req.body;

  if (!nombre || !apellido || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  const codigo = generarCodigo();

  try {
    await db.collection("verificaciones").doc(email).set({
      codigo,
      nombre: `${nombre} ${apellido}`,
      password,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await transporter.sendMail({
      from: '"Plataforma JenEdu 🐾" <jeniermodsao@gmail.com>',
      to: email,
      subject: "Código de verificación",
      html: `<h2>Tu código de verificación es:</h2><h1>${codigo}</h1>`
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al enviar código" });
  }
});

// ============================
// 2️⃣ VERIFICAR CÓDIGO (con enlace oficial de Firebase)
// ============================
app.post("/verificar-codigo", async (req, res) => {
  const { email, codigo } = req.body;

  try {
    const doc = await db.collection("verificaciones").doc(email).get();
    if (!doc.exists) return res.status(400).json({ error: "No existe código" });

    if (doc.data().codigo !== codigo) {
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password: doc.data().password,
      displayName: doc.data().nombre
    });

    // 🔹 Generar enlace oficial de verificación
    const link = await admin.auth().generateEmailVerificationLink(email);

    // Enviar el enlace por correo
    await transporter.sendMail({
      from: '"Plataforma JenEdu 🐾" <jeniermodsao@gmail.com>',
      to: email,
      subject: "Verifica tu correo en JenEdu",
      html: `
        <h2>Bienvenido a JenEdu, ${doc.data().nombre}!</h2>
        <p>Haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
        <a href="${link}">Verificar correo</a>
        <p>Si no creaste esta cuenta, ignora este mensaje.</p>
      `
    });

    // Borrar documento de verificación temporal
    await db.collection("verificaciones").doc(email).delete();

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al verificar" });
  }
});


// ============================
// 3️⃣ REENVIAR CÓDIGO
// ============================
app.post("/reenviar-codigo", async (req, res) => {
  const { email } = req.body;

  try {
    const ref = db.collection("verificaciones").doc(email);
    const doc = await ref.get();
    if (!doc.exists) return res.status(400).json({ error: "No existe registro" });

    const nuevoCodigo = generarCodigo();

    await ref.update({
      codigo: nuevoCodigo,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await transporter.sendMail({
      from: '"Plataforma JenEdu 🐾" <jeniermodsao@gmail.com>',
      to: email,
      subject: "Nuevo código de verificación",
      html: `<h2>Tu nuevo código es:</h2><h1>${nuevoCodigo}</h1>`
    });

    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al reenviar" });
  }
});

// ============================
// 🔑 VERIFICAR SUSCRIPCIÓN PREMIUM
// ============================
app.get("/verificar-suscripcion/:uid", async (req, res) => {
  try {
    const uid = req.params.uid;
    const userDoc = await db.collection("usuarios").doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const user = userDoc.data();
    const activo = user.suscripcion_activa || false; // Booleano que indica si tiene suscripción

    res.json({ suscripcion_activa: activo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al verificar suscripción" });
  }
});

// ============================
// 🚀 SERVIDOR
// ============================
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Servidor activo`);
  console.log(`👉 Local: http://localhost:${PORT}`);
  console.log(`👉 Red:   http://192.168.1.18:${PORT}`);
});