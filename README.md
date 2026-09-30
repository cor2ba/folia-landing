# 🌿 Folia · Landing de descarga para Android

Página para descargar el APK de **Folia**. Es un sitio estático (HTML + CSS + JS), sin compilación: se publica tal cual.

## Estructura
```
index.html      Contenido de la página
styles.css      Diseño y animaciones (mismo sistema de diseño que la app, modo claro/oscuro)
main.js         Animaciones, detección de dispositivo, botón de descarga y QR
config.js       ⚙️ Enlace del APK, versión y tamaño  ← lo único que se edita al publicar
assets/         Ícono de la app y favicon
downloads/      Aquí va folia.apk
```

## Publicar una versión nueva
1. Compila el APK en el proyecto de la app: `npx eas-cli@latest build --platform android --profile preview`.
2. Descárgalo, renómbralo a **`folia.apk`** y cópialo a `downloads/`.
3. En `config.js` actualiza `version` (y `size`, opcional).
4. Sube la carpeta completa a tu hosting.

Mientras no exista `downloads/folia.apk`, el botón muestra **"Muy pronto en Android"** en vez de dar error.

## Verla en tu computadora
```bash
npx serve .        # o: python -m http.server 8080
```
y abre http://localhost:3000 (o el puerto que indique).

## Hosting gratuito
- **Netlify Drop**: arrastra la carpeta a https://app.netlify.com/drop.
- **Cloudflare Pages** o **Vercel**: conecta el repositorio o sube la carpeta.
- Si el hosting limita el tamaño del archivo, sube el APK a **GitHub Releases** y pon esa URL en `apkUrl` de `config.js`.
