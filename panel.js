
// ========================================
// ADMINISTRACIÓN DE PRODUCTOS - EUGY DESIGN
// ========================================

const listaAdmin = document.getElementById("lista-admin");
const mensajePanel = document.getElementById("mensaje-panel");
const botonNuevo = document.getElementById("nuevo-producto");
const botonCerrar = document.getElementById("cerrar-sesion");

let usuarioAdmin = null;

// Comprobar que exista una sesión iniciada
async function iniciarPanel() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        window.location.href = "admin.html";
        return;
    }

    usuarioAdmin = data.session.user;
    cargarProductosAdmin();
}

// Crear el formulario para agregar o editar
function mostrarFormulario(producto = null) {
    let formulario = document.getElementById("formulario-producto");

    if (formulario) {
        formulario.remove();
    }

    formulario = document.createElement("form");
    formulario.id = "formulario-producto";
    formulario.style.cssText =
        "display:grid;gap:12px;margin:25px 0;padding:20px;border:1px solid #e0ad32;border-radius:12px;";

    formulario.innerHTML = `
        <h2>${producto ? "Editar producto" : "Agregar producto"}</h2>

        <label>Nombre de la prenda</label>
        <input name="nombre" type="text" required>

        <label>Descripción</label>
        <textarea name="descripcion" required rows="3"></textarea>

        <label>Precio en pesos colombianos</label>
        <input name="precio" type="number" min="0" step="1" required>

        <label>Tallas o indicación de consulta</label>
        <input name="tallas" type="text" required>

        <label>Primera fotografía</label>
        <input name="foto1" type="file" accept="image/jpeg,image/png,image/webp">

        <label>Segunda fotografía</label>
        <input name="foto2" type="file" accept="image/jpeg,image/png,image/webp">

        <label>Disponibilidad</label>
        <select name="estado">
            <option value="disponible">Disponible</option>
            <option value="agotada">Agotada</option>
        </select>

        <button class="boton-panel" type="submit">
            Guardar producto
        </button>

        <button class="boton-panel" type="button" id="cancelar-formulario">
            Cancelar
        </button>

        <p id="mensaje-formulario"></p>
    `;

    listaAdmin.before(formulario);

    formulario.elements.nombre.value = producto?.nombre || "";
    formulario.elements.descripcion.value = producto?.descripcion || "";
    formulario.elements.precio.value = producto?.precio ?? "";
    formulario.elements.tallas.value = producto?.tallas || "";
    formulario.elements.estado.value = producto?.estado || "disponible";

    formulario.querySelector("#cancelar-formulario").addEventListener("click", () => {
        formulario.remove();
    });

    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();

        const botonGuardar = formulario.querySelector('button[type="submit"]');
        const mensaje = document.getElementById("mensaje-formulario");
        botonGuardar.disabled = true;
        mensaje.textContent = "Guardando producto...";

        try {
            const archivo1 = formulario.elements.foto1.files[0];
            const archivo2 = formulario.elements.foto2.files[0];

            let imagen1 = producto?.imagen_url || "";
            let imagen2 = producto?.imagen_url_2 || "";

            if (archivo1) {
                imagen1 = await subirFotografia(archivo1);
            }

            if (archivo2) {
                imagen2 = await subirFotografia(archivo2);
            }

            if (!producto && !archivo1) {
                throw new Error("Selecciona la primera fotografía.");
            }

            const datosProducto = {
                nombre: formulario.elements.nombre.value.trim(),
                descripcion: formulario.elements.descripcion.value.trim(),
                precio: Number(formulario.elements.precio.value),
                tallas: formulario.elements.tallas.value.trim(),
                imagen_url: imagen1,
                imagen_url_2: imagen2,
                estado: formulario.elements.estado.value
            };

            const resultado = producto
                ? await supabaseClient
                    .from("productos")
                    .update(datosProducto)
                    .eq("id", producto.id)
                : await supabaseClient
                    .from("productos")
                    .insert([datosProducto]);

            if (resultado.error) {
                throw resultado.error;
            }

            formulario.remove();
            mensajePanel.textContent = "Producto guardado correctamente.";
            cargarProductosAdmin();

        } catch (error) {
            console.error(error);
            mensaje.textContent = error.message || "No se pudo guardar el producto.";
            botonGuardar.disabled = false;
        }
    });
}

// Subir una fotografía al almacenamiento de Supabase
async function subirFotografia(archivo) {
    const extension = archivo.name.split(".").pop().toLowerCase();
    const nombreArchivo = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
        .from("productos")
        .upload(nombreArchivo, archivo, {
            contentType: archivo.type,
            upsert: false
        });

    if (error) {
        throw error;
    }

    const { data } = supabaseClient.storage
        .from("productos")
        .getPublicUrl(nombreArchivo);

    return data.publicUrl;
}

// Mostrar los productos existentes
async function cargarProductosAdmin() {
    mensajePanel.textContent = "Cargando productos...";

    const { data: productos, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        mensajePanel.textContent = "No se pudieron cargar los productos. Revisa los permisos.";
        return;
    }

    listaAdmin.innerHTML = "";

    if (!productos || productos.length === 0) {
        mensajePanel.textContent = "Todavía no hay productos registrados.";
        return;
    }

    mensajePanel.textContent = `Productos registrados: ${productos.length}`;

    productos.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto-admin";

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre;
        tarjeta.appendChild(nombre);

        [producto.imagen_url, producto.imagen_url_2].forEach((url) => {
            if (url) {
                const imagen = document.createElement("img");
                imagen.src = url;
                imagen.alt = producto.nombre;
                tarjeta.appendChild(imagen);
            }
        });

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.descripcion || "";
        tarjeta.appendChild(descripcion);

        const precio = document.createElement("p");
        precio.textContent = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(Number(producto.precio) || 0);
        tarjeta.appendChild(precio);

        const tallas = document.createElement("p");
        tallas.textContent = "Tallas: " + (producto.tallas || "Consultar");
        tarjeta.appendChild(tallas);

        const estado = document.createElement("p");
        estado.textContent = producto.estado === "agotada" ? "AGOTADA" : "DISPONIBLE";
        tarjeta.appendChild(estado);

        const botonEditar = document.createElement("button");
        botonEditar.className = "boton-panel";
        botonEditar.textContent = "Editar";
        botonEditar.addEventListener("click", () => mostrarFormulario(producto));
        tarjeta.appendChild(botonEditar);

        const botonEstado = document.createElement("button");
        botonEstado.className = "boton-panel";
        botonEstado.textContent = producto.estado === "agotada"
            ? "Marcar disponible"
            : "Marcar agotada";

        botonEstado.addEventListener("click", async () => {
            const nuevoEstado = producto.estado === "agotada" ? "disponible" : "agotada";

            const { error } = await supabaseClient
                .from("productos")
                .update({ estado: nuevoEstado })
                .eq("id", producto.id);

            if (error) {
                alert("No se pudo cambiar el estado: " + error.message);
                return;
            }

            cargarProductosAdmin();
        });

        tarjeta.appendChild(botonEstado);

        const botonEliminar = document.createElement("button");
        botonEliminar.className = "boton-panel";
        botonEliminar.textContent = "Eliminar";

        botonEliminar.addEventListener("click", async () => {
            if (!confirm(`¿Seguro que deseas eliminar "${producto.nombre}"?`)) {
                return;
            }

            const { error } = await supabaseClient
                .from("productos")
                .delete()
                .eq("id", producto.id);

            if (error) {
                alert("No se pudo eliminar: " + error.message);
                return;
            }

            cargarProductosAdmin();
        });

        tarjeta.appendChild(botonEliminar);
        listaAdmin.appendChild(tarjeta);
    });
}

// Abrir formulario de nuevo producto
botonNuevo.addEventListener("click", () => mostrarFormulario());

// Cerrar sesión
botonCerrar.addEventListener("click", async () => {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("No se pudo cerrar la sesión: " + error.message);
        return;
    }

    window.location.href = "admin.html";
});

// Iniciar el panel
iniciarPanel();
