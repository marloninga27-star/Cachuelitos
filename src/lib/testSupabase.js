import { supabase } from "./supabaseClient";

export async function testSupabaseConnection() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error de Supabase:", error.message);
    return;
  }

  console.log("Cliente de Supabase inicializado correctamente.");
  console.log("Sesión actual:", data.session ? "Activa" : "Sin sesión");
}
