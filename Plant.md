Revisando la aplicación y el flujo actual para convertir el diagrama en un plan de modificación.

Leer [](file:///workspaces/POO_ojitos/index.html)

Leer [](file:///workspaces/POO_ojitos/sketch.js)

Leer [](file:///workspaces/POO_ojitos/style.css)

He identificado la versión actual del juego y la lógica básica que hay que extender. Ahora organizo un plan claro y guardo la ruta de implementación.

Archivo de memoria creado[](file:///home/codespace/.vscode-remote/data/User/workspaceStorage/1d68a0ac/GitHub.copilot-chat/memory-tool/memories/ZTYyZmM1MDUtZGE0Mi00ZjljLThlNGQtOGM3YzI1NTI3MDUx/plan.md)

## Plan para convertir la lógica del diagrama en un prompt

### Objetivo
Crear un prompt en español que describa cómo modificar la aplicación actual para que funcione como un juego con:
- detección de boca abierta/cerrada,
- caída de frutas,
- sistema de puntaje,
- sistema de vidas,
- desbloqueo de nivel al llegar a 100 puntos,
- avisos y reinicio cuando se pierde una vida.

### Qué hacer
1. Usar el código actual de sketch.js como base: actualmente dibuja ojos que siguen el rostro con MediaPipe FaceMesh.
2. Añadir detección de boca abierta/cerrada usando landmarks de la cara.
3. Crear lógica de juego:
   - boca abierta → caer fruta y ganar score,
   - boca cerrada → mostrar aviso y/o perder vidas,
   - score >= 100 → desbloquear nivel 2,
   - vidas = 0 → mostrar “game over” y reiniciar al abrir la boca.
4. Agregar UI mínima en index.html y style.css para puntaje, vidas y mensajes.
5. Generar el prompt final para que un desarrollador o IA modifique la app según ese diagrama.

### Prompt sugerido
Usa este prompt como guía para modificar la aplicación:

- La aplicación usa p5.js y `@mediapipe/face_mesh` y actualmente dibuja una figura de ojos (`FiguraOjos`) siguiendo la posición del rostro.
- Mantén la detección facial con `faceMesh` y añade detección de apertura de boca.
- Usa landmarks de MediaPipe para determinar si la boca está abierta o cerrada.
- Cuando la boca se abre:
  - genera frutas que caen desde arriba,
  - suma puntaje cada vez que la fruta es “capturada” por la boca,
  - muestra el score en pantalla.
- Cuando la boca se cierra:
  - activa una advertencia si el jugador no la abre pronto,
  - resta una vida si se cierra demasiado tiempo o falla la captura,
  - muestra las vidas restantes en pantalla.
- Si el score alcanza 100 puntos:
  - muestra un mensaje de desbloqueo de nivel 2.
- Si el jugador pierde todas las vidas:
  - entra en estado de “game over”
  - pide abrir la boca para reiniciar.
- Añade estilos simples en style.css para que la información en pantalla sea legible.

### Archivo de referencia
- sketch.js — principal foco del cambio.
- index.html — añadir información de HUD.
- style.css — estilo del HUD.

Si quieres, puedo seguir y convertir esto en un prompt listo para copiar/pegar exactamente en una tarea de IA o en una especificación para desarrollo.