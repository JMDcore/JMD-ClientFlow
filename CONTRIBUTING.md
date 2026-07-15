# Contribuir a ClientFlow

Gracias por dedicar tiempo a mejorar el proyecto.

## Antes de empezar

1. Revisa los issues existentes para evitar duplicados.
2. Abre un issue si el cambio modifica comportamiento o experiencia de usuario.
3. Mantén cada pull request centrado en una única intención.

## Entorno local

```bash
npm ci
npm run dev
```

Node.js 22 o superior es obligatorio.

## Criterios de aceptación

- Respeta los tipos y patrones existentes.
- No incluyas secretos ni datos personales reales.
- Añade pruebas proporcionales al cambio.
- Comprueba desktop y móvil si modificas interfaz.
- Regenera `public/showcase` cuando cambien las capturas utilizadas en documentación.

Antes de enviar una propuesta:

```bash
npm run validate
npm run test:e2e
npm run build
```

## Commits y pull requests

- Utiliza mensajes breves en modo imperativo.
- Explica el problema, la solución y cómo se verificó.
- Incluye capturas antes/después para cambios visuales.
- Mantén fuera del pull request cualquier refactor no relacionado.
