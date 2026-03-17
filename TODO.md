# 📋 Goal Planner - Roadmap

> **A goal-focused calendar app** donde defines objetivos anuales y los vinculas a tareas y hábitos diarios. Rastrea tu progreso y convierte planes a largo plazo en acciones concretas.

## 📌 Leyenda

- [x] Completado
- [ ] Pendiente
- **Negrita** = Crítico / Bloqueante para release

---

### 💾 Sugerencias de Optimización de Base de Datos

Las siguientes queries se ejecutan con frecuencia y se beneficiarían de índices compuestos:

```sql
-- Índice para buscar tareas sin goal (pestaña Unassigned)
CREATE INDEX IF NOT EXISTS idx_tasks_user_no_goal
ON tasks (user_id) WHERE goal_id IS NULL AND deleted_at IS NULL;

-- Índice para buscar hábitos sin goal (pestaña Unassigned)
CREATE INDEX IF NOT EXISTS idx_habits_user_no_goal
ON habits (user_id) WHERE goal_id IS NULL AND deleted_at IS NULL;

-- Índice para buscar goals activos de un usuario
CREATE INDEX IF NOT EXISTS idx_goals_user_active
ON goals (user_id) WHERE deleted_at IS NULL;

-- Índice para conteo rápido de goals (usado en OAuth callback)
CREATE INDEX IF NOT EXISTS idx_goals_user_id
ON goals (user_id);

-- Índice para task_repeat_days por task_id (join frecuente)
CREATE INDEX IF NOT EXISTS idx_task_repeat_days_task_id
ON task_repeat_days (task_id);

-- Índice para habit_repeat_days por habit_id (join frecuente)
CREATE INDEX IF NOT EXISTS idx_habit_repeat_days_habit_id
ON habit_repeat_days (habit_id);

-- Índice para task_logs por rango de fecha (calendar view)
CREATE INDEX IF NOT EXISTS idx_task_logs_date
ON task_logs (date);

-- Índice para habit_logs por rango de fecha (calendar view)
CREATE INDEX IF NOT EXISTS idx_habit_logs_date
ON habit_logs (date);
```

> **Nota (resuelta):** La función RPC `get_user_events_current_month` fue optimizada con CTEs para pre-agregar `repeat_days` (elimina subqueries correlacionadas). Se agregaron índices compuestos `task_logs(task_id, date)` y `habit_logs(habit_id, date)` para los JOINs internos, más `tasks(user_id)` y `habits(user_id)` para el filtro `WHERE user_id = auth.uid()`. PostgreSQL **NO** crea índices automáticos en columnas FK — solo en PK/UNIQUE. Ver `supabase_optimization.sql` para el SQL completo. El cliente ahora pasa rangos de ~3 meses (±1 mes) en vez de 3 años (~12x reducción de payload).

## 📊 Goal Planner Beta 1.0

### 🎓 Onboarding

- [x] Flujo de onboarding en 3 pasos (Welcome → Goal Config → Summary)
- [x] **Volver a crear metas desde summary** - Botón "Add Another Goal" en paso 3

### 📈 Estadísticas y Analytics

- [x] **Página de estadísticas** - Actualmente es un stub (solo muestra Navbar + Top)
- [x] **Daily analytics en sidebar** - Vista diaria con métricas (case "daily-analytics" retorna vacío)
- [x] **Weekly stats en sidebar** - Resumen semanal (case "weekly-stats" retorna vacío)
- [x] **Racha de hábitos** - Contador de días consecutivos

### 👤 Perfil y Navegación

- [x] **Foto de perfil en navbar** - Avatar con imagen o iniciales, reemplazó icono de settings
- [x] **Menú desplegable de perfil** - Profile, Settings, Log Out con confirmación modal
- [x] **Página de perfil** - Placeholder creado con estructura base

### 🚀 Despliegue

- [x] **Hosting** - Vercel o similar
- [x] **Dominio** - goalplanner.com.ar
- [x] **Variables de entorno** - Configurar para producción
- [x] **CI/CD** - Automatizar builds y despliegues

---

## 🎉 Goal Planner 1.0

### 📧 Sistema de Emails

- [x] **Templates de email** - Diseñar emails profesionales para verificación
- [x] **Email de bienvenida** - Al completar registro
- [x] **Recordatorios** - Para tareas y hábitos importantes

### 🔐 Autenticación Avanzada

- [x] **OAuth con Google** - Auth callback route creada, PKCE exchange, avatar download, routing inteligente (nuevo → onboarding, existente → calendar)
- [] **2FA** - Seguridad adicional (opcional)

### ✨ Pulido Final

- [x] **Sistema de diseño** - Variables CSS para tamaños, spacing, radii
- [x] **Animaciones** - Transiciones suaves y micro-interacciones
- [x] **Accesibilidad** - ARIA labels, keyboard navigation, focus management
- [ ] **Internacionalización** - Soporte para español e inglés (actualmente tiene mezcla de ambos en comentarios)

### 🌐 Lanzamiento

- [x] **SSL / HTTPS**
- [x] **SEO** - Meta tags, sitemap, robots.txt, Open Graph
- [x] **Analytics** - Google Analytics o Plausible

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
- [x] **Bulk delete** - Botones para eliminar todas las tareas, hábitos, o metas con confirmación modal en Settings
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
