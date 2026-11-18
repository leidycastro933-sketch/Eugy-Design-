    
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
