# Analytics Setup - MatchYa

## 📊 Métricas Implementadas

### Vercel Analytics
- **Vistas de página**: Automático
- **Tiempo en página**: Automático
- **Sesiones**: Automático
- **Dispositivos y navegadores**: Automático

### Eventos Personalizados

#### Eventos de Usuario
- `tournament_click` - Cuando un usuario hace click en un torneo
  - `tournament_id`: ID del torneo
  - `tournament_name`: Nombre del torneo

- `product_click` - Cuando un usuario hace click en un producto
  - `product_id`: ID del producto
  - `product_name`: Nombre del producto
  - `has_link`: Si el producto tiene link externo

- `tab_switch` - Cuando cambian entre tabs principales
  - `tab`: 'partidos' | 'productos'
  - `tournament_id`: ID del torneo actual

- `date_tab_switch` - Cuando cambian entre fechas
  - `date`: Fecha seleccionada (ej: 'Nov 9')
  - `tournament_id`: ID del torneo

- `match_type_tab_switch` - Cuando cambian entre próximos/finalizados
  - `type`: 'proximos' | 'finalizados'
  - `date`: Fecha actual
  - `tournament_id`: ID del torneo

#### Eventos de Admin
- `admin_login` - Cuando intentan iniciar sesión en admin
  - `success`: true | false

- `admin_action` - Para acciones del admin (puede expandirse)
  - `action`: Tipo de acción

## 🔍 Ver las Métricas

### Vercel Analytics
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona el proyecto MatchYa
3. Haz click en "Analytics"
4. Verás:
   - Vistas de página
   - Eventos personalizados
   - Tiempo en página
   - Ubicaciones geográficas
   - Dispositivos y navegadores

## 📈 Agregar Más Eventos

Para agregar tracking a nuevos elementos:

```typescript
import { trackEvent } from '@/lib/analytics';

// En un componente
const handleClick = () => {
  trackEvent('mi_evento', {
    propiedad1: 'valor1',
    propiedad2: 'valor2',
  });
};
```

## 🚀 Próximos Pasos (Opcional)

### Google Analytics 4
Si quieres agregar Google Analytics además de Vercel Analytics:

1. Crea una cuenta en [Google Analytics](https://analytics.google.com/)
2. Obtén tu Measurement ID (G-XXXXXXXXXX)
3. Agrega a `app/layout.tsx`:
```tsx
import Script from 'next/script';

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

4. Agrega `NEXT_PUBLIC_GA_ID` a las variables de entorno

### Plausible Analytics (Alternativa Privada)
```bash
npm install plausible-tracker
```

## 📝 Notas
- Los eventos se registran automáticamente en desarrollo (consola)
- Vercel Analytics es gratuito hasta cierto límite
- Los eventos personalizados aparecen en Vercel Analytics Dashboard

