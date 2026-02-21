# 📋 Goal Planner - Roadmap

> **A goal-focused calendar app** donde defines objetivos anuales y los vinculas a tareas y hábitos diarios. Rastrea tu progreso y convierte planes a largo plazo en acciones concretas.

## 📌 Leyenda de Progreso

- [x] Completado
- [ ] Pendiente
- **Negrita** = Crítico/Bloqueante para el release

---

## 🎯 Goal Planner Alpha 1.0

### ✅ Funcionalidad Básica de Metas

- [x] Crear nueva meta (componentes implementados)
- [x] **Editar meta** - Implementar funcionalidad completa de edición
- [ ] **Eliminar meta** - Implementar confirmación y eliminación
- [ ] Visualización de metas en anual-goals page

### 📅 Funcionalidad del Calendario

- [x] Vista de calendario con navegación mensual
- [x] Mostrar información del día (CalendarInfo)
- [ ] **Calendar info edit sidebar** - Implementar edición de eventos del día
- [ ] Vista semanal del calendario (opcional para Alpha)

### ✏️ Gestión de Tareas y Hábitos

- [x] Agregar nueva tarea (sidebar funcional)
- [ ] **Editar tarea** - Hacer que el sidebar de agregar sirva para editar
- [ ] **Eliminar tarea** - Implementar confirmación y eliminación
- [x] Agregar nuevo hábito (sidebar funcional)
- [ ] **Editar hábito** - Hacer que el sidebar de agregar sirva para editar
- [ ] **Eliminar hábito** - Implementar confirmación y eliminación

### 🎨 UX/UI Esenciales

- [ ] **Sistema de notificaciones/toasts** - Feedback de acciones exitosas/errores
- [ ] **Estados de carga** - Skeletons o spinners en todas las páginas
- [ ] **Estados vacíos** - Mensajes cuando no hay metas/tareas/hábitos
- [ ] **Validación de formularios** - Mensajes de error claros en inputs
- [ ] **Modal de confirmación** - Para acciones destructivas (borrar)

### 🔐 Autenticación y Usuario

- [x] Login / Register / Forgot Password
- [x] Verificación de email
- [ ] **Funcionalidad de logout** - Botón funcional en navbar/settings
- [ ] **Página de Settings básica** - Cambiar contraseña, datos de usuario
- [ ] **Protección de rutas** - Redireccionar si no está autenticado

### 🐛 Manejo de Errores

- [ ] **Página 404** - Para rutas no encontradas
- [ ] **Manejo de errores de red** - Mensajes claros cuando falla la API
- [ ] **Validación de datos** - Verificar que los datos sean correctos antes de guardar

### 📱 Responsive Design

- [ ] **Mobile navbar** - Menú hamburguesa o navbar adaptable
- [ ] **Diseño responsive del calendario** - Que funcione en pantallas pequeñas
- [ ] **Tarjetas de metas responsive** - Adaptables a diferentes tamaños
- [ ] **Sidebars responsive** - Que funcionen bien en mobile

### 🧪 Testing y Pulido

- [ ] **Probar flujo completo** - Desde registro hasta crear meta con tareas
- [ ] **Verificar persistencia de datos** - Que todo se guarde correctamente
- [ ] **Revisar colores y tipografía** - Consistencia en toda la app
- [ ] **Optimizar performance** - Revisar queries lentas o re-renders innecesarios

---

## 📊 Goal Planner Beta 1.0

### 🎓 Onboarding Mejorado

- [ ] **Corregir flujo de Onboarding** - Mejorar experiencia del primer uso
- [ ] **Skip onboarding** - Opción para usuarios avanzados

### 📈 Estadísticas y Analytics

- [ ] **Página de estadísticas completa** - Gráficos de progreso de metas
- [ ] **Pestaña daily analytics** - Vista diaria con métricas del día
- [ ] **Weekly/Monthly analytics** - Resúmenes de períodos más largos
- [ ] **Racha de hábitos** - Contador de días consecutivos

### 👤 Perfil y Navegación

- [ ] **Foto de perfil en navbar** - Reemplazar icono de settings
- [ ] **Menú desplegable de perfil** - Ver perfil, Settings, Cerrar sesión
- [ ] **Página de perfil básica** - Mostrar información del usuario

### 🚀 Despliegue

- [ ] **Configurar hosting** - Vercel, Netlify o similar
- [ ] **Setup de dominio** - Preparar para goalplanner.com.ar
- [ ] **Variables de entorno** - Configurar para producción
- [ ] **CI/CD pipeline** - Automatizar despliegues

---

## 🎉 Goal Planner 1.0

### 📧 Sistema de Emails

- [ ] **Corregir envío de mails** - Verificar que funcionen las notificaciones
- [ ] **Templates de email** - Diseñar emails bonitos y profesionales
- [ ] **Email de bienvenida** - Enviar al registrarse
- [ ] **Recordatorios por email** - Para tareas y hábitos importantes

### 🔐 Autenticación Avanzada

- [ ] **Crear cuenta con Google** - OAuth integration
- [ ] **Crear cuenta con Apple** - OAuth integration (opcional)
- [ ] **Two-factor authentication** - Seguridad adicional (opcional)

### ✨ Pulido Final

- [ ] **Pulir todas las pestañas** - Revisar cada página en detalle
- [ ] **Crear sistema de diseño** - Variables para tamaños de letra exactos
- [ ] **Colores consistentes** - Paleta de colores definida en CSS
- [ ] **Animaciones suaves** - Transiciones y micro-interacciones
- [ ] **Accesibilidad** - ARIA labels, keyboard navigation

### 🌐 Lanzamiento

- [ ] **Hostear en goalplanner.com.ar** - Dominio definitivo
- [ ] **SSL certificate** - HTTPS configurado
- [ ] **SEO básico** - Meta tags, sitemap, robots.txt
- [ ] **Analytics** - Google Analytics o alternativa
- [ ] **Monitoring** - Sentry o similar para errores

---

## 🚀 Goal Planner 2.0

### 📱 Nuevas Vistas

- [ ] **Habit View especial** - Vista estilo Excel para completar hábitos masivamente
- [ ] **Vista Kanban** - Drag & drop para tareas (opcional)
- [ ] **Vista Timeline** - Línea de tiempo de metas y progreso

### 👥 Funcionalidad Social

- [ ] **Página de perfil pública** - Mostrar logros y progreso
- [ ] **Buscar usuario** - Navbar con búsqueda de otros usuarios
- [ ] **Sistema de logros** - Badges y achievements
- [ ] **Compartir progreso** - En redes sociales

### 🎭 Modo Invitado

- [ ] **Demo mode** - Modo invitado con datos de ejemplo
- [ ] **Tour guiado** - Para empresas que quieran ver el producto
- [ ] **Exportar datos** - Convertir datos de invitado a cuenta real

### ⚙️ Configuración Avanzada

- [ ] **Borrar cuenta** - Con confirmación múltiple
- [ ] **Exportar datos** - Backup de información del usuario
- [ ] **Importar datos** - Desde otros calendarios
- [ ] **Preferencias de privacidad** - Control de qué compartir

### ⏰ Gestión de Tiempo Avanzada

- [ ] **Múltiples horarios por tarea** - Una tarea en varios momentos del día
- [ ] **Recordatorios personalizados** - Timing específico por tarea
- [ ] **Time blocking** - Bloques de tiempo en el calendario
- [ ] **Pomodoro timer** - Integrado en la app

---

## 🌟 Goal Planner 3.0

### 🤝 Metas Colaborativas

- [ ] **Metas anuales en conjunto** - Compartir metas con amigos/equipo
- [ ] **Dashboard compartido** - Estadísticas grupales
- [ ] **Sistema de comentarios** - En metas compartidas
- [ ] **Notificaciones de equipo** - Updates de progreso grupal
- [ ] **Logros en conjunto** - Achievements compartidos

### 🎨 Personalización

- [ ] **Cambiar color del calendario** - Temas personalizables
- [ ] **Temas oscuro/claro** - Toggle en settings
- [ ] **Fondos personalizados** - Para el calendario
- [ ] **Iconos custom** - Para categorías de metas

### 🔔 Sistema de Notificaciones

- [ ] **Notificaciones push** - Para la web app
- [ ] **Centro de notificaciones** - Ver todas las notificaciones
- [ ] **Preferencias de notificación** - Qué recibir y cuándo
- [ ] **Notificaciones inteligentes** - Basadas en patrones de uso

### 📊 Analytics Avanzados

- [ ] **Reportes mensuales** - Email con resumen del mes
- [ ] **Predicción de cumplimiento** - IA para predecir probabilidad de logro
- [ ] **Insights personalizados** - Recomendaciones basadas en datos
- [ ] **Comparativas históricas** - Progreso año a año

---

## 📱 Goal Planner Mobile

### 📲 Aplicaciones Nativas

- [ ] **App Android** - React Native o Flutter
- [ ] **App iOS** - React Native o Flutter
- [ ] **Sincronización** - Entre web y mobile
- [ ] **Notificaciones push nativas** - En dispositivos móviles
- [ ] **Widget de home screen** - Resumen de tareas del día
- [ ] **Modo offline** - Funcionalidad sin conexión

### ⌚ Wearables (Futuro)

- [ ] **Apple Watch app** - Vista rápida de tareas
- [ ] **Android Wear** - Integración con smartwatches
- [ ] **Notificaciones en wearables** - Recordatorios en la muñeca

---

## 🛠️ Infraestructura y DevOps

### 🔧 Técnico

- [ ] **Tests unitarios** - Cobertura mínima del 70%
- [ ] **Tests de integración** - Flujos críticos cubiertos
- [ ] **E2E tests** - Con Playwright o Cypress
- [ ] **Performance monitoring** - Lighthouse CI
- [ ] **Database optimization** - Índices y queries optimizadas

### 📚 Documentación

- [ ] **README completo** - Setup y guías de desarrollo
- [ ] **API documentation** - Si se expone API pública
- [ ] **Guías de usuario** - Help center en la app
- [ ] **Contributing guidelines** - Para colaboradores

### 🔒 Seguridad

- [ ] **Security audit** - Revisar vulnerabilidades
- [ ] **Rate limiting** - Prevenir abuso de API
- [ ] **GDPR compliance** - Si se opera en EU
- [ ] **Privacy policy** - Términos y condiciones claros

---

## 📊 Resumen de Prioridades

### 🚨 Crítico para Alpha 1.0 (MVP)

**Funcionalidad Core:** 5 items

- Editar meta
- Eliminar meta
- Editar/eliminar tareas y hábitos (4 items total, contando como 1)
- Calendar info edit sidebar

**UX/UI Esencial:** 5 items

- Sistema de notificaciones/toasts
- Estados de carga
- Estados vacíos
- Validación de formularios
- Modal de confirmación

**Autenticación:** 3 items

- Funcionalidad de logout
- Página de Settings básica
- Protección de rutas

**Total Crítico para Alpha 1.0:** ~13-15 items bloqueantes

### ⏱️ Estimación

- **Alpha 1.0:** 2-3 semanas (con los items críticos)
- **Beta 1.0:** +2-3 semanas
- **Version 1.0:** +4-6 semanas
- **Version 2.0+:** Roadmap a largo plazo (3-6 meses)

### 🎯 Próximos Pasos Inmediatos

1. Implementar sistema de toasts/notificaciones (base para todo)
2. Agregar estados de carga (mejora UX inmediata)
3. Implementar edición de metas (funcionalidad crítica)
4. Agregar eliminación con confirmación (funcionalidad crítica)
5. Implementar edición de tareas/hábitos (reutilizar sidebars existentes)
