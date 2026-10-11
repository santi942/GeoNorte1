
/* =========================================
   CAMPUS - CONEXIÓN CON SUPABASE
========================================= */

// Escribe aquí las credenciales reales de tu proyecto.
const SUPABASE_URL = "https://jlhmojfiocyyponpkttt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_2To6Y5AD7cKcf0QNDwzmrQ_OabWRX26";

const clienteSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("CAMPUS: cliente de Supabase inicializado.");
async function crearUsuarioGeoNorte(nombre, correo, contrasena) {
  const { data: sesion } = await clienteSupabase.auth.getSession();

  if (!sesion.session) {
    throw new Error("Debes iniciar sesión como administrador.");
  }

  const { data, error } = await clienteSupabase.functions.invoke(
    "smart-worker",
    {
      body: { nombre, correo, contrasena },
    }
  );

  if (error) {
    throw new Error(error.message || "No se pudo crear la cuenta.");
  }

  return data;
}