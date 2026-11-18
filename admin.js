
// ========================================
// INICIO DE SESIÓN - EUGY DESIGN
// ========================================

const formularioLogin = document.getElementById("formulario-login");
const mensajeLogin = document.getElementById("mensaje");

formularioLogin.addEventListener("submit", async function(event) {
    event.preventDefault();

    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;

    mensajeLogin.textContent = "Verificando acceso...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: correo,
        password: contrasena
    });

    if (error) {
        console.error("Error de acceso:", error);
        mensajeLogin.textContent = "No fue posible iniciar sesión. Revisa tu correo y contraseña.";
        return;
    }

    mensajeLogin.style.color = "#168447";
    mensajeLogin.textContent = "¡Acceso correcto! Tu cuenta ha sido verificada.";
});


window.location.href = "panel.html"