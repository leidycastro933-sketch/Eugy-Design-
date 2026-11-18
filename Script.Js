    
// ========================================
// CONEXION DE EUGY DESIGN CON SUPABASE
// ========================================

// Direccion API de nuestro proyecto
const SUPABASE_URL = "https://ygmakcavusftaekgxnkc.supabase.co/rest/v1/";

// Clave publica de Supabase
const SUPABASE_ANON_KEY = "sb_publishable_e_kcsm0bEcQv0dz5hON4BA__4vch76R";

// Crear conexion
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("EUGY DESIGN: conexion con Supabase preparada");



// ========================================
// MOSTRAR PRODUCTOS EN EL CATÁLOGO
// ========================================

async function cargarProductos() {
    const contenedor = document.getElementById("lista-productos");

    if (!contenedor) return;

    contenedor.textContent = "Cargando nuestros productos...";

    const { data: productos, error } = await supabaseClient
        .from("productos")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error al cargar productos:", error);
        contenedor.textContent = "No fue posible cargar el catálogo.";
        return;
    }

    contenedor.innerHTML = "";

    if (!productos || productos.length === 0) {
        contenedor.textContent = "Próximamente encontrarás aquí nuestras prendas.";
        return;
    }

    productos.forEach((producto) => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "producto-card";

      [producto.imagen_url, producto.imagen_url_2]
    .filter(url => url && url.trim() !== "")
    .forEach((url, indice) => {
        const imagen = document.createElement("img");
        imagen.src = url;
        imagen.alt = (producto.nombre || "Prenda EUGY DESIGN") +
            " - fotografía " + (indice + 1);
        tarjeta.appendChild(imagen);
    });

        const nombre = document.createElement("h3");
        nombre.textContent = producto.nombre || "Producto";
        tarjeta.appendChild(nombre);

        const descripcion = document.createElement("p");
        descripcion.textContent = producto.descripcion || "";
        tarjeta.appendChild(descripcion);

        const precio = document.createElement("p");
        precio.className = "producto-precio";
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
        estado.textContent = producto.estado === "agotada"
            ? "AGOTADA"
            : "DISPONIBLE";
        tarjeta.appendChild(estado);

        contenedor.appendChild(tarjeta);
    });
}

cargarProductos();
