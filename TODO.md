# 📋 Goal Planner - Roadmap

> **A goal-focused calendar app** donde defines objetivos anuales y los vinculas a tareas y hábitos diarios. Rastrea tu progreso y convierte planes a largo plazo en acciones concretas.

## 📌 Leyenda

- [x] Completado
- [ ] Pendiente
- **Negrita** = Crítico / Bloqueante para release

---

## 🎯 Goal Planner Alpha 1.0

### ✅ Funcionalidad de Metas

- [x] Crear nueva meta (GoalForm + new-goal page)
- [x] Editar meta (edit-goal page con GoalForm precargado)
- [x] Eliminar meta con cascading deletes (deleteGoalWithRelatedData)
- [x] Visualización de metas en anual-goals con filtros y stats
- [x] Modal de confirmación para acciones destructivas (ConfirmModal)

### 📅 Funcionalidad del Calendario

- [x] Vista mensual con navegación (CalendarGrid + CalendarUI)
- [x] Mostrar eventos del día con sidebar (CalendarInfo + CalendarCard)
- [x] Editar eventos del día desde sidebar (CalendarInfoEdit → SidebarContent)
- [x] Marcar tareas/hábitos como completados (checkbox en CalendarCard)
- [ ] Vista semanal del calendario

### ✏️ Gestión de Tareas y Hábitos

- [x] Agregar tarea con repeat days, fecha específica o rango (AddTask)
- [x] Editar tarea desde sidebar y desde GoalCard inline
- [x] Eliminar tarea con logs futuros (deleteTaskWithFutureLogs)
- [x] Agregar hábito con repeat days y rango de fechas (AddHabit)
- [x] Editar hábito desde sidebar y desde GoalCard inline
- [x] Eliminar hábito con logs futuros (deleteHabitWithFutureLogs)
- [x] Tareas/hábitos completados aparecen tachados y al final de la lista
- [x] Editar tarea/hábito desde GoalCard con modal pre-cargado (misma animación que "Add")

### 🎨 UX/UI Esenciales

- [ ] **Sistema de toasts** - Feedback visual para acciones exitosas y errores (actualmente usa `alert()` y `window.confirm()`)
- [ ] **Estados de carga consistentes** - Skeletons/spinners en todas las páginas (anual-goals tiene spinner, pero otras no)
- [x] Estados vacíos con mensajes claros
- [ ] **Validación de formularios** - Activar validación de password en register y change-password (código comentado en ambos)
- [x] Modal de confirmación reutilizable

### 🔐 Autenticación y Usuario

- [x] Login / Register / Forgot Password / Change Password
- [x] Verificación de email con OTP
- [x] Protección de rutas (middleware en proxy.ts)
- [ ] **Logout funcional** - Implementar en navbar o settings (solo existe en debug-auth)
- [ ] **Página de Settings** - Actualmente es un stub (`<div>settings</div>`)
- [ ] **Eliminar debug-auth page** - Es una herramienta de debug que no debe ir a producción

### 🐛 Fixes Pendientes

- [x] Página 404 (not-found.tsx)
- [ ] **new-goal usa delete simple** - `deleteGoalAndRelated()` en new-goal/page.tsx no usa `deleteGoalWithRelatedData` (puede dejar datos huérfanos)
- [ ] **keepLoggedIn en SignIn** - El checkbox no afecta el comportamiento de la sesión de Supabase
- [ ] **Google Auth buttons** - Los botones de "Sign in/up with Google" existen pero no hacen nada (`onClick={() => {}}`)
- [ ] **Missing useEffect deps** - `fetchGoals` no está en dependency array en AddTask y onboarding

### 📱 Responsive Design

- [ ] **Mobile navbar** - Menú hamburguesa o navbar bottom adaptable
- [ ] **Calendario responsive** - Que funcione en pantallas pequeñas
- [ ] **GoalCards responsive** - Adaptables a diferentes tamaños
- [ ] **Sidebars responsive** - Fullscreen en mobile

### 🧪 Testing y QA

- [ ] **Probar flujo completo** - Registro → Onboarding → Crear meta → Agregar tareas → Calendario → Completar
- [ ] **Verificar persistencia** - Que todos los datos se guarden y carguen correctamente
- [ ] **Revisar consistencia visual** - Colores, tipografía, spacing
- [ ] **Performance** - Revisar queries N+1 y re-renders innecesarios

---

## 📊 Goal Planner Beta 1.0

### 🎓 Onboarding

- [x] Flujo de onboarding en 3 pasos (Welcome → Goal Config → Summary)
- [ ] **Skip onboarding** - Opción para usuarios que ya saben usar la app
- [ ] **Volver a crear metas desde summary** - Botón "Add Another Goal" en paso 3

### 📈 Estadísticas y Analytics

- [ ] **Página de estadísticas** - Actualmente es un stub (solo muestra Navbar + Top)
- [ ] **Daily analytics en sidebar** - Vista diaria con métricas (case "daily-analytics" retorna vacío)
- [ ] **Weekly stats en sidebar** - Resumen semanal (case "weekly-stats" retorna vacío)
- [ ] **Racha de hábitos** - Contador de días consecutivos

### 👤 Perfil y Navegación

- [ ] **Foto de perfil en navbar** - Reemplazar icono de settings
- [ ] **Menú desplegable de perfil** - Ver perfil, settings, cerrar sesión
- [ ] **Página de perfil** - Info del usuario, estadísticas personales

### 🚀 Despliegue

- [ ] **Hosting** - Vercel o similar
- [ ] **Dominio** - goalplanner.com.ar
- [ ] **Variables de entorno** - Configurar para producción
- [ ] **CI/CD** - Automatizar builds y despliegues

---

## 🎉 Goal Planner 1.0

### 📧 Sistema de Emails

- [ ] **Templates de email** - Diseñar emails profesionales para verificación
- [ ] **Email de bienvenida** - Al completar registro
- [ ] **Recordatorios** - Para tareas y hábitos importantes

### 🔐 Autenticación Avanzada

- [ ] **OAuth con Google** - Integrar (buttons ya existen en UI)
- [ ] **2FA** - Seguridad adicional (opcional)

### ✨ Pulido Final

- [ ] **Sistema de diseño** - Variables CSS para tamaños, spacing, radii
- [ ] **Animaciones** - Transiciones suaves y micro-interacciones
- [ ] **Accesibilidad** - ARIA labels, keyboard navigation, focus management
- [ ] **Internacionalización** - Soporte para español e inglés (actualmente tiene mezcla de ambos en comentarios)

### 🌐 Lanzamiento

- [ ] **SSL / HTTPS**
- [ ] **SEO** - Meta tags, sitemap, robots.txt, Open Graph
- [ ] **Analytics** - Google Analytics o Plausible
- [ ] **Error monitoring** - Sentry para errores en producción

---

## 🚀 Goal Planner 2.0

### 📱 Nuevas Vistas

- [ ] **Habit View** - Vista estilo Excel para completar hábitos masivamente
- [ ] **Vista Kanban** - Drag & drop para tareas
- [ ] **Timeline** - Línea de tiempo de metas y progreso

### 👥 Social

- [ ] **Perfil público** - Mostrar logros y progreso
- [ ] **Buscar usuarios**
- [ ] **Sistema de logros** - Badges y achievements
- [ ] **Compartir progreso** - En redes sociales

### 🎭 Modo Invitado

- [ ] **Demo mode** - Datos de ejemplo sin registro
- [ ] **Tour guiado** - Para empresas/demos
- [ ] **Exportar datos de invitado** - Convertir a cuenta real

### ⚙️ Configuración Avanzada

- [ ] **Borrar cuenta** - Con confirmación múltiple
- [ ] **Exportar/importar datos** - Backup y migración
- [ ] **Preferencias de privacidad**

### ⏰ Gestión de Tiempo

- [ ] **Múltiples horarios por tarea**
- [ ] **Recordatorios personalizados**
- [ ] **Time blocking** - Bloques de tiempo visual en calendario
- [ ] **Pomodoro timer**

---

## 🌟 Goal Planner 3.0

### 🤝 Metas Colaborativas

- [ ] **Metas compartidas** - Con amigos/equipo
- [ ] **Dashboard grupal**
- [ ] **Comentarios en metas**
- [ ] **Notificaciones de equipo**

### 🎨 Personalización

- [ ] **Temas** - Oscuro/claro toggle (actualmente solo dark)
- [ ] **Colores del calendario** - Paleta personalizable
- [ ] **Fondos e iconos custom**

### 🔔 Notificaciones

- [ ] **Push notifications** - Web y mobile
- [ ] **Centro de notificaciones**
- [ ] **Notificaciones inteligentes** - Basadas en patrones de uso

### 📊 Analytics Avanzados

- [ ] **Reportes mensuales** - Email con resumen
- [ ] **Predicción con IA** - Probabilidad de cumplimiento
- [ ] **Insights personalizados**
- [ ] **Comparativas históricas** - Año a año

---

## 📱 Goal Planner Mobile

### 📲 Apps Nativas

- [ ] **App Android / iOS** - React Native o Flutter
- [ ] **Sincronización web ↔ mobile**
- [ ] **Push notifications nativas**
- [ ] **Widget de home screen** - Tareas del día
- [ ] **Modo offline**

### ⌚ Wearables

- [ ] **Apple Watch / Wear OS** - Vista rápida de tareas
- [ ] **Notificaciones en wearables**

---

## 🛠️ Infraestructura y DevOps

### 🔧 Testing

- [ ] **Tests unitarios** - Cobertura mínima 70%
- [ ] **Tests de integración** - Flujos críticos
- [ ] **E2E tests** - Playwright o Cypress
- [ ] **Performance** - Lighthouse CI

### 📚 Documentación

- [ ] **README completo** - Setup, arquitectura, guías
- [ ] **API docs** - Si se expone API pública
- [ ] **Contributing guidelines**

### 🔒 Seguridad

- [ ] **Security audit**
- [ ] **Rate limiting**
- [ ] **GDPR compliance**
- [ ] **Privacy policy / ToS**
