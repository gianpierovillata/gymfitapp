# Setup & Ejecución - GymFit App

## Instalación de Dependencias

```bash
# Instalar dependencias del proyecto
npm install

# Instalar expo-sqlite específicamente
expo install expo-sqlite
```

## Ejecutar la Aplicación

### Desarrollo Web (recomendado para empezar)
```bash
npm run web
```
- Abre http://localhost:19006
- Puedes ver los logs de console en DevTools del navegador
- Es la forma más rápida de testear cambios

### Desarrollo iOS (requiere macOS)
```bash
npm run ios
```

### Desarrollo Android
```bash
npm run android
```
- Requiere Android SDK configurado

### Versión de Expo
La aplicación está construida con **Expo v56.0.0**. 
Ver documentación completa: https://docs.expo.dev/versions/v56.0.0/

## Estructura de Carpetas Clave

```
src/
├── app/                    # Rutas principales (Expo Router)
│   ├── index.tsx          # HomeScreen
│   ├── explore.tsx        # Pantalla de exploración
│   └── _layout.tsx        # Layout general
│
├── db/                     # Base de datos SQLite
│   ├── schema.ts          # Definición de tablas e interfaces
│   ├── sqlite.ts          # Gestor de BD (transacciones, queries)
│   ├── seeder.ts          # Datos iniciales (alimentos)
│   └── services/          # Servicios por entidad
│       ├── client.service.ts
│       ├── meal.service.ts
│       ├── routine.service.ts
│       ├── food.service.ts
│       └── index.ts       # Exporta todos los servicios
│
├── components/            # Componentes reutilizables
│   ├── database-demo.tsx  # Pantalla de ejemplo (referencia)
│   ├── themed-*.tsx       # Componentes con tema
│   └── ui/
│
├── constants/             # Constantes globales
│   └── theme.ts          # Colores, espacios, etc.
│
└── hooks/                 # Custom hooks
    └── use-theme.ts
```

## Primeros Pasos de Desarrollo

1. **Revisar la documentación de BD**:
   ```bash
   # Lee el documento de referencia
   cat README_DATABASE.md
   ```

2. **Usar los servicios en tus pantallas**:
   ```typescript
   import { ClientService, MealService } from '@/db/services';
   
   // Crear cliente
   const id = await ClientService.create({...});
   
   // Obtener clientes
   const clients = await ClientService.getAll();
   ```

3. **Ver ejemplo de implementación**:
   - Abre `src/components/database-demo.tsx`
   - Es una pantalla completa que muestra CRUD básico

4. **Agregar nueva pantalla**:
   - Crea archivo en `src/app/mipantalla.tsx`
   - Usa los servicios de BD según necesites
   - Se agregará automáticamente a las rutas gracias a Expo Router

## Características Implementadas ✅

### Base de Datos
- [x] Schema completo con 9 tablas
- [x] Transacciones seguras
- [x] Queries parametrizadas (previene inyección SQL)
- [x] Seeding automático de alimentos

### Servicios (APIs)
- [x] **ClientService**: CRUD de clientes
- [x] **MealService**: Registro de comidas + cálculo automático de macros
- [x] **RoutineService**: Gestión de rutinas de entrenamiento
- [x] **ExerciseService**: Biblioteca de ejercicios
- [x] **FoodService**: Base de datos de alimentos
- [x] **DietService**: Planes de nutrición

### Cálculo Automático de Macros
- [x] Cálculo por comida (proteína, carbohidratos, grasas, calorías)
- [x] Resumen diario automático
- [x] Conversión automática por cantidad/porción

## Próximos Pasos (TODO)

- [ ] Pantalla de gestión de clientes
- [ ] Pantalla de registro de comidas (UI bonita)
- [ ] Pantalla de rutinas de entrenamiento
- [ ] Gráficos de progreso (peso, macros, etc.)
- [ ] Conectar con API remota para planes compartidos
- [ ] Sistema de notificaciones/recordatorios
- [ ] Exportar/importar datos
- [ ] Dark mode completo

## Troubleshooting

### Error: "Database is locked"
- Normal en SQLite con muchas operaciones concurrentes
- Los servicios ya manejan esto con transacciones

### Error: "Foreign key constraint failed"
- Asegúrate de que los IDs de relaciones existen
- Ejemplo: no crear meal sin que exista el client

### Logs no aparecen en web
- Abre DevTools (F12) y ve a la pestaña "Console"
- Los logs de Expo aparecen ahí

### La app se reinicia
- Revisa la consola en el terminal de Expo
- Busca errores en rojo

## Testing

```bash
# Ejecutar linter
npm run lint

# Ver errores
npx tsc --noEmit

# Reset del proyecto (limpia node_modules y cache)
npm run reset-project
```

## Seguridad - Recordatorios Importantes

1. **Nunca subas credenciales** al código
2. **Valida entrada del usuario** antes de insertar en BD
3. **Usa HTTPS** para cualquier llamada a API
4. **Sanitiza outputs** cuando muestres datos del usuario
5. **Local storage solo**: Datos del cliente NUNCA en servidor

Ver sección "Security Best Practices" en `README_DATABASE.md`
