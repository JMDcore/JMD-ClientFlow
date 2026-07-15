# Recursos visuales de ClientFlow

## Objetivo

Los recursos de presentación se generan a partir de capturas reales de la aplicación. Así, el README y las publicaciones muestran el producto que existe en el repositorio y pueden actualizarse sin reconstruir composiciones manualmente.

## Inventario

| Recurso                     | Formato     | Uso recomendado                                           |
| --------------------------- | ----------- | --------------------------------------------------------- |
| `github-hero.png`           | 1600 × 900  | Cabecera principal del README y presentación del proyecto |
| `github-social-preview.png` | 1280 × 640  | Vista previa del enlace del repositorio en redes sociales |
| `github-product-tour.png`   | 1600 × 900  | Resumen visual de clientes, oportunidades y tareas        |
| `feature-*.png`             | 1600 × 900  | Explicación individual de cada funcionalidad              |
| `linkedin-pipeline.png`     | 1200 × 1200 | Publicación cuadrada centrada en el Kanban                |
| `linkedin-relations.png`    | 1200 × 1200 | Publicación cuadrada centrada en clientes y seguimiento   |
| `screenshots/*.png`         | 1440 × 900  | Capturas originales sin overlays                          |

## Regenerar los recursos

Inicia la aplicación:

```bash
npm run dev
```

Desde otra terminal, captura las vistas y genera las composiciones:

```bash
npm run screenshots
npm run showcase
```

`CLIENTFLOW_URL` permite capturar otra instancia compatible:

```bash
CLIENTFLOW_URL=https://example.com npm run screenshots
```

## Criterios visuales

- Las capturas se realizan a 1440 × 900 para mantener una escala consistente.
- Las composiciones utilizan el logotipo oficial desde `public/brand`.
- Los datos pertenecen al modo demo y no contienen información comercial real.
- Cada recurso debe conservar texto legible, márgenes seguros y contraste suficiente.
- Un cambio visible en la interfaz requiere regenerar capturas y composiciones antes de publicar.
