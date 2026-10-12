
/* =========================================
   GEONORTE - SEGURIDAD GENERAL
   Requiere clienteSupabase de Supabase JS
========================================= */

(() => {
    "use strict";

    const TIEMPO_INACTIVIDAD = 15 * 60 * 1000;
    const PAGINA_LOGIN = "LOGIN.html";

    let temporizador = null;
    let cerrandoSesion = false;

    function irAlLogin() {
        window.location.replace(PAGINA_LOGIN);
    }

    async function cerrarSesion(mensaje = "") {
        if (cerrandoSesion) return;

        cerrandoSesion = true;
        clearTimeout(temporizador);

        try {
            if (mensaje) {
                sessionStorage.setItem(
                    "geonorte_mensaje",
                    mensaje
                );
            }

            const { error } =
                await clienteSupabase.auth.signOut();

            if (error) {
                console.error(
                    "Error al cerrar sesión:",
                    error.message
                );
            }
        } catch (error) {
            console.error(
                "No se pudo cerrar la sesión:",
                error
            );
        } finally {
            irAlLogin();
        }
    }

    function reiniciarTemporizador() {
        if (cerrandoSesion) return;

        clearTimeout(temporizador);

        temporizador = setTimeout(() => {
            cerrarSesion(
                "Tu sesión se cerró por inactividad."
            );
        }, TIEMPO_INACTIVIDAD);
    }

    async function protegerPagina() {
        // Evita mostrar contenido privado antes de
        // comprobar la sesión.
        document.documentElement.style.visibility =
            "hidden";

        try {
            const { data, error } =
                await clienteSupabase.auth.getUser();

            if (error || !data.user) {
                irAlLogin();
                return;
            }

            document.documentElement.style.visibility =
                "visible";

            reiniciarTemporizador();

        } catch (error) {
            console.error(
                "No se pudo verificar la sesión:",
                error
            );

            irAlLogin();
        }
    }

    // Detectar actividad del usuario.
    [
        "pointerdown",
        "keydown",
        "scroll",
        "touchstart"
    ].forEach(evento => {
        document.addEventListener(
            evento,
            reiniciarTemporizador,
            { passive: true }
        );
    });

    // Detectar cierre de sesión desde otra pestaña
    // o desde otro componente de la aplicación.
    clienteSupabase.auth.onAuthStateChange(
        (evento, sesion) => {
            if (
                evento === "SIGNED_OUT" ||
                !sesion
            ) {
                irAlLogin();
            }
        }
    );

    // Volver a comprobar la sesión al regresar
    // a una página desde la caché del navegador.
    window.addEventListener("pageshow", () => {
        if (!cerrandoSesion) {
            protegerPagina();
        }
    });

    // Protección inicial.
    protegerPagina();

    // Permite reutilizar el cierre desde otros scripts.
    window.GeoNorteSeguridad = {
        cerrarSesion,
        reiniciarTemporizador
    };

})();
