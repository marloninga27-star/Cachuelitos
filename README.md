# Cachuelitos — PMV móvil (diseño guinda y dorado)

Proyecto React + Vite rediseñado a partir de la imagen proporcionada por el usuario. Incluye diez pantallas: bienvenida, inicio de sesión, registro, verificación, inicio estudiante, detalle de oferta, publicación, gestión de postulantes, mis postulaciones y panel administrador.

## Ejecutar

1. Instala Node.js 20.19+ o 22+.
2. Abre esta carpeta en Visual Studio Code.
3. En la terminal ejecuta `npm install` y después `npm run dev`.
4. Abre la dirección que muestra Vite en un celular o en el modo dispositivo de tu navegador.
5. Para probar desde un celular conectado a la misma Wi-Fi, utiliza la dirección de red que muestra Vite y permite el acceso en el firewall si es necesario.

## Cuentas de demostración

- Estudiante: `ana@demo.local` (rol Estudiante)
- Contratante: `tienda@demo.local` (rol Contratante)
- Administrador: botón «Entrar como administrador» en inicio de sesión.

La pantalla de acceso permite cualquier contraseña no vacía **solo en esta demostración**. No se almacenan contraseñas. Los datos se guardan en `localStorage` del dispositivo y no se sincronizan entre celulares. Los documentos no se suben: solo se registra su nombre. El panel administrador simula aprobaciones sin inspeccionar el documento. El enlace WhatsApp abre un mensaje preparado y no verifica su entrega.

**No uses datos personales reales ni publiques este prototipo como servicio funcional.** Para el piloto real falta integrar Supabase Auth, base de datos, almacenamiento privado de carnés, controles de acceso por rol y validaciones del lado servidor.

## Flujo de prueba

1. Ingresar como estudiante con `ana@demo.local`.
2. Revisar ofertas y postular a «Apoyo en inventario».
3. Cerrar sesión y entrar como contratante con `tienda@demo.local`.
4. Abrir «Postulantes» y confirmar la solicitud; se abrirá WhatsApp si hay teléfono.
5. Publicar otra oferta desde Perfil → Publicar nuevo cachuelo.
6. Ingresar como administrador para ver el resumen y los estados de verificación.

## Archivos

- `src/main.jsx`: pantallas y lógica del prototipo.
- `src/style.css`: diseño responsive móvil guinda, crema y dorado.
- `vite.config.js`: configuración de Vite y PWA.
