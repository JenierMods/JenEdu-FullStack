// Usuario simulado
let user = JSON.parse(localStorage.getItem("user")) || {
  email: "invitado",
  plan: "free" // free | premium
};

const planText = document.getElementById("userPlan");
planText.textContent = "Plan actual: " + user.plan.toUpperCase();

// Bloqueo de contenido premium
if (user.plan === "free") {
  document.querySelectorAll(".premium").forEach(card => {
    card.addEventListener("click", () => {
      alert("🔒 Este contenido es Premium. Suscríbete para acceder.");
    });
  });
}
