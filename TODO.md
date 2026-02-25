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
- [x] Vista semanal del calendario [JUANMA]

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

- [x] **Sistema de toasts** - Feedback visual para acciones exitosas y errores (reemplazó `alert()` y `window.confirm()`) [GINO]
- [x] **Estados de carga consistentes** - Skeletons/spinners en todas las páginas (anual-goals tiene spinner, pero otras no) [GINO]
- [x] Estados vacíos con mensajes claros
- [x] **Validación de formularios** - Validación compartida desde `validation.ts` en register, change-password y SignIn [GINO/JUANMA]
- [x] Modal de confirmación reutilizable

### 🔐 Autenticación y Usuario

- [x] Login / Register / Forgot Password / Change Password
- [x] Verificación de email con OTP
- [x] Protección de rutas (middleware en proxy.ts)
- [x] **Logout funcional** - Implementado en navbar con menú desplegable y confirmación modal [JUANMA]
- [x] **Página de Settings** - Incluye Danger Zone con eliminación de cuenta y confirmación modal [JUANMA]
- [x] **Eliminar debug-auth page** - Eliminada; funcionalidad de borrar cuenta movida a Settings [JUANMA]

### 🐛 Fixes Pendientes

- [x] Página 404 (not-found.tsx)
- [x] **new-goal usa delete simple** - `deleteGoalAndRelated()` en new-goal/page.tsx no usa `deleteGoalWithRelatedData` (puede dejar datos huérfanos) [GINO]
- [x] **keepLoggedIn en SignIn** - Eliminado (era no-op, Supabase maneja sesión automáticamente) [REFACTOR]
- [x] **Google Auth buttons** - OAuth con Google funcional, redirige al calendario [REFACTOR]
- [x] **Missing useEffect deps** - `fetchGoals` no está en dependency array en AddTask y onboarding [GINO]

### 📱 Responsive Design

- [x] **Mobile navbar** - Bottom navigation bar en mobile, sidebar desktop (`md:` breakpoint) [GINO]
- [x] **Calendario responsive** - CalendarUI márgenes adaptativos, padding para mobile nav [GINO]
- [x] **GoalCards responsive** - Layout flex-col/flex-row, tamaños adaptativos [GINO]
- [x] **GoalCardSkeleton responsive** - Coincide con GoalCard responsive [GINO]
- [x] **GoalForm responsive** - Grids adaptativos (4→8 cols categorías, 1→2/3 cols campos) [GINO]
- [x] **Sidebars responsive** - Fullscreen en mobile, tamaños normales en desktop [GINO]
- [x] **TaskHabitColumn responsive** - Anchos fluidos con max-width [GINO]
- [x] **TaskHabitSimpleView responsive** - Anchos fluidos, alturas adaptativos [GINO]
- [x] **Pages responsive** - Márgenes adaptativos en anual-goals, new-goal, edit-goal, onboarding [GINO]
- [x] **StepHeader responsive** - Texto adaptativo (3xl→6xl) [GINO]
- [x] **Landing page desktop-only logic removed** - CTA unificado, login visible en mobile [GINO]
- [x] **Statistics bar responsive** - Layout flex-col en mobile, inline en desktop [GINO]

### 🔧 Refactoring & Performance (Completado)

- [x] **Extraer `goalDataUtils.ts`** - Shared data fetching/formatting (~150 líneas de duplicación eliminadas) [GINO]
- [x] **Crear `useGoalsData` hook** - Hook reutilizable para fetching/estado de metas [GINO]
- [x] **Crear `useGoalDeletion` hook** - Hook reutilizable para lógica de eliminación [GINO]
- [x] **Refactorizar `anual-goals`** - Usa hooks compartidos, ~250 líneas eliminadas [GINO]
- [x] **Refactorizar `onboarding`** - Usa hooks compartidos, ~200 líneas eliminadas [GINO]
- [x] **Extraer `EventItem` component** - Componente memoizado fuera de CalendarInfo (performance) [GINO]
- [x] **Fix SidebarContent** - Retornaba `undefined` en daily-analytics/weekly-stats, ahora retorna `null` [GINO]
- [x] **Fix Settings component name** - `settings` → `Settings` (convención React) [GINO]
- [x] **Memoizar category icon lookup** - `useMemo` en GoalCard para búsqueda O(1) [GINO]
- [x] **Centralizar rutas** - `routes.ts` con ROUTES, PUBLIC_ROUTES, AUTH_ONLY_ROUTES (elimina strings hardcodeados en 15+ archivos) [REFACTOR]
- [x] **Validación compartida** - `validateEmail()`, `validatePassword()`, `validatePasswordMatch()` en `validation.ts` [REFACTOR]
- [x] **ErrorMessage reutilizable** - Componente con 3 variantes (field/general/block), reemplaza ~12 inline error displays [REFACTOR]
- [x] **Colores consolidados** - `GOAL_COLORS`, `DEFAULT_EVENT_COLOR` en `colors.ts`; `orange-hover` en Tailwind config [REFACTOR]
- [x] **Performance CalendarCard** - `React.memo()` wrapper, `useRef` en useToggleEvent/CalendarInfo para evitar cascade re-renders [REFACTOR]
- [x] **Fix CSS white-pearl** - Valor HSL inválido 189% → 89% [REFACTOR]
- [x] **Fix sign-out on delete** - Se agrega `signOut()` antes de redirect en settings [REFACTOR]
- [x] **Eliminar términos y condiciones** - Checkbox y lógica removidos de register [REFACTOR]
- [x] **Landing page simplificada** - Eliminada lógica redundante de auth client-side (middleware se encarga) [REFACTOR]
- [x] **"use client" limpio** - Eliminado de not-found.tsx y authenticated layout [REFACTOR]

### 🧪 Testing y QA

- [x] **Probar flujo completo** - Registro → Onboarding → Crear meta → Agregar tareas → Calendario → Completar
- [ ] **Verificar persistencia** - Que todos los datos se guarden y carguen correctamente
- [x] **Revisar consistencia visual** - Colores, tipografía, spacing (refactoring: colores unificados, ErrorMessage component, empty states)
- [x] **Performance** - Re-render cascade fix (useRef pattern), CalendarCard memo, callback deps optimizadas

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

- [x] **Foto de perfil en navbar** - Avatar con imagen o iniciales, reemplazó icono de settings
- [x] **Menú desplegable de perfil** - Profile, Settings, Log Out con confirmación modal
- [x] **Página de perfil** - Placeholder creado con estructura base

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

- [x] **Borrar cuenta** - Implementado en Settings con Modal de confirmación
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
