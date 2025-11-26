# 📊 Guía de Uso para Novatos - Bot de Carry Trade en Aave

## 📋 Tabla de Contenidos

1. [Introducción al Carry Trade](#introducción-al-carry-trade)
2. [Conceptos Fundamentales](#conceptos-fundamentales)
3. [Los 4 Comandos Principales](#los-4-comandos-principales)
4. [Flujo de Trabajo Recomendado](#flujo-de-trabajo-recomendado)
5. [Guía Paso a Paso: Tu Primera Posición](#guía-paso-a-paso-tu-primera-posición)
6. [Gestión Activa de la Posición](#gestión-activa-de-la-posición)
7. [Estrategias para Principiantes](#estrategias-para-principiantes)
8. [Cuándo Operar y Cuándo NO](#cuándo-operar-y-cuándo-no)
9. [Ejemplos Prácticos con Números Reales](#ejemplos-prácticos-con-números-reales)
10. [Gestión de Riesgos Avanzada](#gestión-de-riesgos-avanzada)
11. [Preguntas Frecuentes](#preguntas-frecuentes)
12. [Escenarios de Emergencia](#escenarios-de-emergencia)

---

## Introducción al Carry Trade

### ¿Qué es el Carry Trade?

El **carry trade** es una estrategia financiera donde:

1. **Depositas** un activo que genera intereses (ej: USDC en Aave)
2. **Pides prestado** otro activo pagando menos intereses (ej: USDT)
3. **Ganas la diferencia** entre lo que recibes y lo que pagas

### Ejemplo Simple

Imagina que:
- Depositas €1,000 en USDC y recibes **5% APY** (Annual Percentage Yield)
- Pides prestado €700 en USDT y pagas **3% APY**

Tu ganancia sería:
```
Ganas:   €1,000 × 5% = €50 al año
Pagas:   €700 × 3%   = €21 al año
────────────────────────────────
PROFIT:                €29 al año
                       (2.9% de tu capital inicial)
```

### ¿Qué es el "Looping"?

El **looping** (bucle) amplifica esta estrategia:

1. Depositas €1,000 USDC
2. Pides prestado €700 USDT
3. **Conviertes** €700 USDT → €700 USDC (swap)
4. **Vuelves a depositar** esos €700 USDC
5. **Repites** el proceso 2-3 veces más

**Resultado**: Multiplicas tu exposición y tus ganancias (pero también el riesgo).

### ¿Por qué usar este Bot?

Hacer looping **manualmente** es:
- Tedioso (muchas transacciones)
- Caro (pagas gas por cada transacción)
- Propenso a errores (cálculos complejos)

El bot:
- ✅ Automatiza todo el proceso
- ✅ Hace cálculos precisos
- ✅ Aplica límites de seguridad
- ✅ Te ahorra tiempo y gas

---

## Conceptos Fundamentales

Antes de usar el bot, debes entender estos términos:

### 1. Collateral (Colateral)

**¿Qué es?** El activo que depositas como "garantía" en Aave.

**En este bot**: USDC (por defecto)

**Analogía**: Es como dar tu casa como garantía para un préstamo bancario.

### 2. Debt (Deuda)

**¿Qué es?** El activo que pides prestado de Aave.

**En este bot**: USDT (por defecto)

**Importante**: Debes devolver lo que pides prestado + intereses.

### 3. Health Factor (Factor de Salud)

**¿Qué es?** Un número que indica qué tan "saludable" es tu posición.

**Escala**:
- **> 2.0**: Muy seguro (MUY conservador)
- **1.5 - 2.0**: Seguro (conservador) ✅ Recomendado para novatos
- **1.3 - 1.5**: Moderadamente seguro (requiere monitoreo)
- **1.1 - 1.3**: Arriesgado (¡monitorea constantemente!)
- **< 1.1**: Peligro de liquidación ⚠️
- **< 1.0**: LIQUIDACIÓN 💀 (pierdes tu colateral)

**Ejemplo**:
```
Tienes:
- €2,000 de colateral en USDC
- €1,000 de deuda en USDT

Si el límite de préstamo es €1,500:
Health Factor = 1,500 / 1,000 = 1.5
```

**Regla de Oro**: NUNCA dejes que baje de 1.3

### 4. LTV (Loan-to-Value)

**¿Qué es?** El porcentaje de tu colateral que puedes pedir prestado.

**Ejemplo**: Si USDC tiene LTV del 80%:
- Depositas €1,000 USDC
- Puedes pedir prestado hasta €800 (80% de €1,000)

### 5. APY (Annual Percentage Yield)

**¿Qué es?** El interés anual que ganas (deposit APY) o pagas (borrow APY).

**Ejemplo**:
- Deposit APY de USDC: 5% → Ganas 5% al año por depositar
- Borrow APY de USDT: 3% → Pagas 3% al año por pedir prestado

### 6. Spread

**¿Qué es?** La diferencia entre deposit APY y borrow APY.

**Fórmula**: `Spread = Deposit APY - Borrow APY`

**Ejemplos**:
```
Deposit APY: 5%  |  Borrow APY: 3%  →  Spread: +2% ✅ BUENO
Deposit APY: 4%  |  Borrow APY: 5%  →  Spread: -1% ❌ MALO (pierdes dinero)
Deposit APY: 3%  |  Borrow APY: 2.9% →  Spread: +0.1% ⚠️ Apenas rentable
```

**Regla de Oro**: Solo opera si el spread es **> 0.3%** (30 bps)

### 7. Slippage

**¿Qué es?** La diferencia entre el precio esperado y el precio real de un swap.

**Ejemplo**:
- Quieres swap €1,000 USDT → USDC
- Esperas recibir €1,000 USDC
- Pero recibes €995 USDC
- Slippage = -€5 (-0.5%)

**En el bot**: Configurado en `slippageBps` (50 bps = 0.5% por defecto)

### 8. Liquidation (Liquidación)

**¿Qué es?** Cuando Aave vende automáticamente tu colateral porque tu Health Factor bajó de 1.0.

**Consecuencias**:
- Pierdes parte o todo tu colateral
- Te cobran una penalización (~10-15%)
- **Es el PEOR escenario posible**

**Cómo evitarlo**: Mantén Health Factor > 1.5 y monitorea constantemente.

---

## Los 4 Comandos Principales

El bot tiene 4 comandos esenciales:

### 1. `status` - Ver el Estado Actual

**¿Para qué sirve?** Muestra tu posición actual, APYs, y rentabilidad.

**Cuándo usarlo**:
- Antes de cualquier operación
- 1-2 veces al día para monitorear
- Después de cada operación

**Comando**:
```bash
npm run dev -- status
```

### 2. `open` - Abrir una Nueva Posición

**¿Para qué sirve?** Crea una nueva posición con looping automático.

**Cuándo usarlo**: Cuando no tienes posición abierta y el spread es bueno.

**Comando**:
```bash
npm run dev -- open <cantidad>
```

**Ejemplo**:
```bash
npm run dev -- open 1000
# Abre posición con 1000 USDC
```

### 3. `add` - Añadir Loops a Posición Existente

**¿Para qué sirve?** Añade más leverage a tu posición actual.

**Cuándo usarlo**:
- Ya tienes una posición abierta
- El spread sigue siendo bueno
- Tu Health Factor es alto (> 2.0)

**Comando**:
```bash
npm run dev -- add
```

### 4. `delever` - Reducir Leverage

**¿Para qué sirve?** Reduce tu leverage y aumenta tu Health Factor.

**Cuándo usarlo**:
- Tu Health Factor está bajando (< 1.5)
- El spread se volvió negativo
- Quieres cerrar parcial o totalmente la posición

**Comando**:
```bash
npm run dev -- delever <health_factor_objetivo>
```

**Ejemplo**:
```bash
npm run dev -- delever 2.0
# Reduce la posición hasta que HF = 2.0
```

---

## Flujo de Trabajo Recomendado

### Para Novatos - Primer Uso

```
1. Revisar mercado
   ↓
   npm run dev -- status
   ↓
2. Verificar spread > 0.3%
   ↓
   ¿Spread bueno?
   │
   ├─ SÍ → Continuar
   └─ NO → Esperar
   ↓
3. Abrir posición pequeña
   ↓
   npm run dev -- open 500
   ↓
4. Verificar resultado
   ↓
   npm run dev -- status
   ↓
5. Monitorear diariamente
   ↓
   (repetir paso 1)
```

### Flujo Diario - Usuario Experimentado

**MAÑANA** (antes de empezar el día):
```bash
npm run dev -- status
```
- Revisa Health Factor
- Revisa spread
- Decide si añadir o reducir

**TARDE** (después del trabajo):
```bash
npm run dev -- status
```
- Verifica cambios en el día
- Ajusta si es necesario

**ANTES DE DORMIR**:
```bash
npm run dev -- status
```
- Última revisión del día
- Si HF < 1.5 → Deleverage

---

## Guía Paso a Paso: Tu Primera Posición

### Pre-requisitos

Antes de abrir tu primera posición, asegúrate de:

- [x] Tienes USDC en tu wallet (ej: €1,000)
- [x] Tienes ETH para gas (ej: 0.05 ETH ≈ €150)
- [x] Has probado en `dryRun: true`
- [x] Entiendes los riesgos

### Paso 1: Revisar el Mercado

```bash
npm run dev -- status
```

**Analiza el output**:

```
╔══════════════════════════════════════╗
║     AAVE POSITION STATUS             ║
╚══════════════════════════════════════╝

Network: Ethereum Mainnet
Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb

COLLATERAL
├─ USDC Deposited: 0.00
└─ Value: $0.00

DEBT
├─ USDT Borrowed: 0.00
└─ Value: $0.00

HEALTH FACTOR: N/A (no position)

CURRENT RATES
├─ USDC Deposit APY: 4.25%      ← Esto es lo que GANAS
├─ USDT Borrow APY: 3.80%       ← Esto es lo que PAGAS
└─ Spread: +0.45% (POSITIVE ✓)  ← Tu ganancia neta

ANALYSIS
└─ Spread is POSITIVE and above minimum (0.10%)
   Opening/adding loops is profitable ✓
```

**Decisión**:
- ✅ Spread: +0.45% → **BUENO** (> 0.3%)
- ✅ Ambos APYs son razonables
- ✅ **Puedes abrir posición**

### Paso 2: Decidir la Cantidad

Para tu **primera vez**, empieza **pequeño**:

| Experiencia | Capital Recomendado |
|-------------|---------------------|
| Primera vez | €500 - €1,000       |
| 1-2 semanas | €1,000 - €2,000     |
| 1 mes       | €2,000 - €5,000     |
| Máximo      | €5,000              |

**Ejemplo**: Vas a usar €1,000 USDC

### Paso 3: Abrir la Posición

```bash
npm run dev -- open 1000
```

**El bot hará automáticamente**:

1. Deposita 1,000 USDC como colateral
2. **Loop 1**:
   - Calcula cuánto puede pedir prestado de forma segura
   - Pide prestado USDT
   - Convierte USDT → USDC (swap en Uniswap)
   - Re-deposita USDC
3. **Loop 2**:
   - Repite el proceso con el nuevo colateral
4. **Loop 3**:
   - Última iteración
5. **Verifica**:
   - Health Factor > límite configurado (1.8-2.0)
   - Todos los límites de seguridad OK

**Output esperado**:

```
[INFO] Opening position with 1000 USDC
[INFO] Current spread: +0.45% (above minimum ✓)

[INFO] === LOOP 1/3 ===
[INFO] Collateral: 1,000 USDC
[INFO] Available to borrow: 800 USDT
[INFO] Borrowing (with safety): 560 USDT (70% of max)
[INFO] Swapping 560 USDT → USDC...
[INFO] Received: 559.5 USDC (0.08% slippage)
[INFO] Depositing 559.5 USDC as collateral...
[INFO] New Health Factor: 2.1 ✓

[INFO] === LOOP 2/3 ===
[INFO] Collateral: 1,559.5 USDC
[INFO] Available to borrow: 687 USDT
[INFO] Borrowing: 391 USDT
[INFO] Swapping 391 USDT → USDC...
[INFO] Received: 390.7 USDC
[INFO] Depositing 390.7 USDC...
[INFO] New Health Factor: 1.9 ✓

[INFO] === LOOP 3/3 ===
[INFO] Collateral: 1,950.2 USDC
[INFO] Available to borrow: 610 USDT
[INFO] Borrowing: 274 USDT
[INFO] Swapping 274 USDT → USDC...
[INFO] Received: 273.8 USDC
[INFO] Depositing 273.8 USDC...
[INFO] New Health Factor: 1.8 ✓

[SUCCESS] === OPERATION COMPLETE ===
[INFO] Loops performed: 3
[INFO] Final position:
├─ Total collateral: 2,224 USDC
├─ Total debt: 1,225 USDT
├─ Health Factor: 1.8
├─ Effective leverage: 2.22x
└─ Estimated net APY: ~0.98%
```

### Paso 4: Verificar la Posición

```bash
npm run dev -- status
```

**Verifica que**:
- Health Factor esté donde esperabas (≥ 1.8)
- Los números coincidan con el output anterior
- Tu wallet muestre las transacciones

### Paso 5: Calcular tus Ganancias Esperadas

Con la posición anterior:

```
Capital inicial: €1,000
Leverage: 2.22x
Spread: 0.45%

Ganancias anuales estimadas:
= €1,000 × 0.45% × 2.22
= €9.99 al año
≈ €0.83 al mes

Menos costos de gas:
- Abrir posición: ~€50-€100
- Monitoreo y ajustes: ~€20-€50/mes

Rentabilidad neta en primer mes: ~€0.83 - €70 = -€69.17 (pérdida)
Rentabilidad neta desde mes 2+: ~€0.83 - €35 = -€34.17/mes

Punto de equilibrio:
€70 / €9.99 = 7 meses
```

**Conclusión realista**:
- Con €1,000 y spread de 0.45%, **NO es rentable** por los costos de gas
- **Necesitas más capital o mejor spread**

**Recomendación**:
- Mínimo €3,000 de capital para que valga la pena en Ethereum mainnet
- O esperar spreads > 1%
- O usar redes más baratas (Polygon, Arbitrum) cuando estén configuradas

### Paso 6: Monitoreo Post-Apertura

**Primeras 24 horas**: Revisa cada 4-6 horas
```bash
npm run dev -- status
```

**Primera semana**: Revisa 2 veces al día (mañana y noche)

**Después**: Revisa 1 vez al día

---

## Gestión Activa de la Posición

### Escenario 1: Health Factor está Bajando

**Situación**: HF empezó en 2.0, ahora está en 1.4

**Causas posibles**:
- El precio de USDC bajó ligeramente
- El precio de USDT subió
- Los APYs cambiaron y afectaron las valoraciones

**Acción**: Deleverage inmediatamente

```bash
npm run dev -- delever 2.0
```

**Qué hace**:
1. Calcula cuánta deuda necesitas pagar para llegar a HF = 2.0
2. Retira colateral necesario
3. Convierte colateral → deuda (swap)
4. Paga la deuda

### Escenario 2: Spread se Volvió Negativo

**Situación**: Spread pasó de +0.45% a -0.30%

**Significado**: Ahora estás **PERDIENDO dinero** cada día.

**Acción**: Cierra la posición parcial o totalmente

**Opción 1 - Cierre parcial** (reduce exposición):
```bash
npm run dev -- delever 3.0
```

**Opción 2 - Cierre total** (salir completamente):
```bash
npm run dev -- delever 10.0
```
(Un HF muy alto como 10.0 fuerza pagar casi toda la deuda)

### Escenario 3: Spread Mejoró Mucho

**Situación**: Spread subió de +0.45% a +1.2%

**Oportunidad**: Puedes aumentar leverage para ganar más

**Acción**: Añadir más loops

```bash
npm run dev -- add
```

**IMPORTANTE**: Solo hazlo si tu HF actual es > 2.0

### Escenario 4: Quieres Añadir Más Capital

**Situación**: Ya tienes posición abierta y quieres agregar más €

**Opción 1**: Depositar manualmente en Aave y luego:
```bash
npm run dev -- add
```

**Opción 2**: Cerrar posición actual y abrir una nueva más grande:
```bash
# Paso 1: Cerrar posición actual
npm run dev -- delever 10.0

# Paso 2: Abrir posición nueva con más capital
npm run dev -- open 3000
```

### Escenario 5: Salir Completamente

**Situación**: Quieres recuperar todo tu capital

**Acción**:
```bash
# Paso 1: Reduce leverage al máximo
npm run dev -- delever 50.0

# Paso 2: Verifica que casi no tengas deuda
npm run dev -- status

# Paso 3: Paga manualmente el resto en Aave (si queda algo)
# Paso 4: Retira tu colateral desde Aave UI
```

---

## Estrategias para Principiantes

### Estrategia 1: "Conservadora" (Recomendada para primeros 3 meses)

**Configuración**:
```typescript
// config/strategy.ts
{
  maxLoops: 2,                // Solo 2 loops
  minHealthFactor: 2.0,       // Muy conservador
  maxLtvUsage: 60,            // Solo 60% del máximo
  minSpreadBps: 30,           // Solo opera si spread > 0.3%
}
```

**Reglas**:
1. Solo opera con capital < €2,000
2. Revisa 2 veces al día (mañana y noche)
3. Si HF < 1.7 → Deleverage inmediatamente
4. Si spread < 0.2% → Cierra posición
5. NO añadas loops a menos que HF > 2.5

**Ventajas**:
- Riesgo muy bajo
- Mucho margen de error
- Perfecto para aprender

**Desventajas**:
- Ganancias muy bajas
- Puede no ser rentable por costos de gas

### Estrategia 2: "Moderada" (Después de 3 meses de experiencia)

**Configuración**:
```typescript
{
  maxLoops: 3,
  minHealthFactor: 1.8,
  maxLtvUsage: 70,
  minSpreadBps: 20,
}
```

**Reglas**:
1. Capital: €2,000 - €5,000
2. Revisa 1-2 veces al día
3. Si HF < 1.5 → Deleverage
4. Puedes añadir loops si HF > 2.0 y spread > 0.3%

**Ventajas**:
- Balance entre riesgo y ganancia
- Más rentable que conservadora

**Desventajas**:
- Requiere más atención
- Más riesgo

### Estrategia 3: "Oportunista" (Solo usuarios avanzados)

**NO recomendada para novatos** - Mencionada solo como referencia.

**Configuración**:
```typescript
{
  maxLoops: 4,
  minHealthFactor: 1.6,
  maxLtvUsage: 80,
  minSpreadBps: 10,
}
```

**Reglas**:
- Solo cuando spread > 0.5%
- Monitoreo constante (varias veces al día)
- Salir rápido si spread < 0.15%

---

## Cuándo Operar y Cuándo NO

### ✅ ABRE POSICIÓN cuando:

1. **Spread > 0.3%** (mejor si > 0.5%)
2. **Volatilidad baja** en los últimos días
3. **Tienes tiempo** para monitorear diariamente
4. **Entiendes los riesgos** completamente
5. **Tienes capital suficiente** (> €2,000 para ser rentable)
6. **Los APYs son estables** (no cambiaron mucho en la última semana)

### ❌ NO ABRAS POSICIÓN cuando:

1. **Spread < 0.3%** o negativo
2. **Volatilidad alta** (mercado inestable)
3. **No puedes monitorear** (vacaciones, viaje, etc.)
4. **No tienes ETH para gas** (necesitas al menos 0.05 ETH)
5. **Gas muy caro** (> 100 gwei)
6. **FUD en el mercado** (noticias negativas sobre Aave, USDC, USDT)

### ⚠️ CIERRA POSICIÓN inmediatamente si:

1. **Spread < 0%** (negativo)
2. **Health Factor < 1.3**
3. **Noticias negativas** sobre USDC o USDT (riesgo de depeg)
4. **Vas a estar sin acceso** a internet por varios días
5. **No te sientes cómodo** con el riesgo

### 🔄 AÑADE LOOPS cuando:

1. **Spread mejoró** (subió de 0.4% a 0.8%, por ejemplo)
2. **Health Factor > 2.0**
3. **Mercado estable**
4. **Tienes tiempo** para monitorear más frecuentemente

### 📉 HAZ DELEVERAGE cuando:

1. **Health Factor < 1.5**
2. **Spread < 0.2%**
3. **Volatilidad aumentó**
4. **Necesitas reducir tu exposición** (por cualquier razón)

---

## Ejemplos Prácticos con Números Reales

### Ejemplo 1: Posición Pequeña Conservadora

**Situación inicial**:
- Capital: €1,000 USDC
- Config: `maxLoops: 2, minHealthFactor: 2.0, maxLtvUsage: 60`
- Spread: +0.50%

**Abrir posición**:
```bash
npm run dev -- open 1000
```

**Resultado después de loops**:
```
Total collateral: 1,600 USDC (€1,600)
Total debt: 600 USDT (€600)
Health Factor: 2.0
Leverage: 1.6x
```

**Cálculo de ganancias**:
```
Deposit APY: 4.5% en €1,600 = +€72/año
Borrow APY: 4.0% en €600   = -€24/año
───────────────────────────────────────
Ganancia neta:             €48/año
                           €4/mes
```

**Menos gas**:
```
Abrir: ~€60
Gestión mensual: ~€20
───────────────────────
Primer mes: €4 - €80 = -€76
Mes 2+: €4 - €20 = -€16/mes
```

**Conclusión**: NO rentable con este capital. Necesitas más capital o mejor spread.

### Ejemplo 2: Posición Media con Buen Spread

**Situación inicial**:
- Capital: €5,000 USDC
- Config: `maxLoops: 3, minHealthFactor: 1.8, maxLtvUsage: 70`
- Spread: +0.80%

**Abrir posición**:
```bash
npm run dev -- open 5000
```

**Resultado después de loops**:
```
Total collateral: 11,120 USDC (€11,120)
Total debt: 6,120 USDT (€6,120)
Health Factor: 1.8
Leverage: 2.22x
```

**Cálculo de ganancias**:
```
Deposit APY: 5.2% en €11,120 = +€578/año
Borrow APY: 4.4% en €6,120   = -€269/año
────────────────────────────────────────
Ganancia neta:                €309/año
                              €25.75/mes
```

**Menos gas**:
```
Abrir: ~€70
Gestión mensual: ~€25
───────────────────────
Primer mes: €25.75 - €95 = -€69.25
Mes 2+: €25.75 - €25 = +€0.75/mes
Mes 4+: Ya recuperaste el gasto inicial
```

**Conclusión**: Apenas rentable. Necesitas mantener posición al menos 6 meses.

### Ejemplo 3: Posición Rentable (Caso Ideal)

**Situación inicial**:
- Capital: €10,000 USDC
- Config: `maxLoops: 3, minHealthFactor: 1.8, maxLtvUsage: 70`
- Spread: +1.20% (spread excelente, poco común)

**Abrir posición**:
```bash
npm run dev -- open 10000
```

**Resultado**:
```
Total collateral: 22,240 USDC (€22,240)
Total debt: 12,240 USDT (€12,240)
Health Factor: 1.8
Leverage: 2.22x
```

**Cálculo de ganancias**:
```
Deposit APY: 6.0% en €22,240 = +€1,334/año
Borrow APY: 4.8% en €12,240  = -€587/año
─────────────────────────────────────────
Ganancia neta:                €747/año
                              €62.25/mes
```

**Menos gas**:
```
Abrir: ~€80
Gestión mensual: ~€30
───────────────────────
Primer mes: €62.25 - €110 = -€47.75
Mes 2+: €62.25 - €30 = +€32.25/mes

ROI mensual: €32.25 / €10,000 = 0.32% al mes
ROI anual: ~3.9%
```

**Conclusión**: **RENTABLE**. Recuperas inversión inicial en gas en 2 meses, después ganas ~€32/mes.

### Ejemplo 4: Escenario de Desastre (Qué Evitar)

**Situación inicial**:
- Capital: €5,000 USDC
- Config: Agresiva `maxLoops: 5, minHealthFactor: 1.3, maxLtvUsage: 90`
- Spread: +0.30% (marginal)

**Día 1**: Abres posición
```
HF: 1.3 (peligrosamente bajo)
Leverage: 4.2x
```

**Día 3**: Mercado se mueve contra ti
- USDC baja 1%
- USDT sube 0.5%

**Nuevo HF**: 1.05 ⚠️⚠️⚠️

**Día 4**: Intentas hacer deleverage, pero gas es muy caro (200 gwei)
- No puedes permitirte el gas
- HF sigue bajando

**Día 5**: HF llega a 0.98
- **LIQUIDACIÓN**
- Pierdes ~€500-€1,000 en penalizaciones
- Capital restante: ~€4,000-€4,500

**Pérdida total**: -€500 a -€1,000 (-10% a -20%)

**Lecciones**:
1. NUNCA uses `minHealthFactor` < 1.5
2. NUNCA uses `maxLtvUsage` > 75%
3. SIEMPRE ten ETH para gas de emergencia
4. NUNCA ignores un HF < 1.4

---

## Gestión de Riesgos Avanzada

### Regla del 1.5-1.3

**Divide tu rango de HF en zonas**:

| HF Range | Estado | Acción |
|----------|--------|--------|
| > 2.0 | 🟢 SAFE | Todo bien. Puedes añadir loops si spread es bueno. |
| 1.5 - 2.0 | 🟡 CAUTION | Monitorea más frecuentemente (2x día). |
| 1.3 - 1.5 | 🟠 WARNING | Deleverage parcial. Revisa cada 4-6 horas. |
| 1.1 - 1.3 | 🔴 DANGER | Deleverage inmediato. Monitorea constantemente. |
| < 1.1 | 💀 CRITICAL | **EMERGENCIA**. Deleverage TODO. Ver [Escenarios de Emergencia](#escenarios-de-emergencia). |

### Alertas y Notificaciones

**Configura alertas** (manualmente, el bot no las incluye aún):

1. **Alerta HF < 1.6**:
   - Revisa la posición inmediatamente
   - Considera deleverage

2. **Alerta Spread < 0.2%**:
   - Evalúa cerrar posición
   - Al menos reduce leverage

3. **Alerta Gas > 150 gwei**:
   - Evita transacciones no urgentes
   - Ten más ETH disponible

### Diversificación de Riesgo

**NO pongas todo tu capital en una posición**:

| Capital Total | En Bot Aave | En Otros DeFi | En CEX/Cold Storage |
|---------------|-------------|---------------|---------------------|
| €5,000 | €1,000 (20%) | €1,500 (30%) | €2,500 (50%) |
| €10,000 | €2,000 (20%) | €3,000 (30%) | €5,000 (50%) |
| €20,000 | €5,000 (25%) | €5,000 (25%) | €10,000 (50%) |

**Regla de Oro**: Nunca más del 25% de tu capital crypto en este bot.

### Plan de Contingencia

**Ten un plan antes de que pase algo malo**:

1. **Si HF < 1.4**:
   - Acción: Deleverage a HF 2.0
   - Comando: `npm run dev -- delever 2.0`
   - ETH necesario: ~0.02 ETH

2. **Si Spread < 0%**:
   - Acción: Cerrar posición completa
   - Comando: `npm run dev -- delever 10.0`
   - Aceptar pérdidas

3. **Si noticias de depeg**:
   - Acción: Salir inmediatamente
   - No esperes, actúa rápido

4. **Si vas de vacaciones**:
   - Opción 1: Cierra posición antes de irte
   - Opción 2: Deleverage a HF > 3.0
   - Opción 3: NO vayas (o no abras posición)

---

## Preguntas Frecuentes

### 1. ¿Cuánto puedo ganar al año?

**Respuesta corta**: 2-5% anual sobre tu capital (en el mejor caso).

**Respuesta larga**:
Depende de:
- Tu capital (más capital = más rentable por gas)
- El spread (0.3% vs 1.0% hace gran diferencia)
- Tu leverage (más loops = más ganancias pero más riesgo)
- Gas costs (pueden comer todas las ganancias)

**Expectativa realista**:
- Capital €5,000, spread 0.5%, leverage 2x → ~€100-€200/año (~2-4%)
- Capital €10,000, spread 0.8%, leverage 2.2x → €300-€500/año (~3-5%)

### 2. ¿Es seguro este bot?

**Técnicamente**: El código tiene tests y usa protocolos auditados (Aave, Uniswap).

**Financieramente**: **NO**. Hay muchos riesgos:
- Liquidación si HF < 1.0
- Depeg de stablecoins
- Bugs en el código
- Errores de usuario

**Recomendación**: Solo usa capital que puedas perder.

### 3. ¿Puedo perder más de lo que invertí?

**NO**. En el peor caso (liquidación), pierdes:
- Tu colateral depositado
- Penalización (~10-15% del colateral)

Pero NO puedes perder más que eso. No hay deuda que persiga.

### 4. ¿Necesito estar monitoreando 24/7?

**NO**, pero necesitas revisar:
- **Novatos**: 2-3 veces al día (mañana, tarde, noche)
- **Experimentados**: 1-2 veces al día
- **Si HF < 1.5**: Varias veces al día

**Nunca** dejes la posición sin revisar por más de 24 horas.

### 5. ¿Qué pasa si me quedo sin ETH para gas?

**Problema serio**. Si HF está bajando y no tienes ETH, no puedes hacer deleverage.

**Solución**:
1. **Prevención**: Siempre ten al menos 0.05 ETH (€150) en la wallet
2. **Emergencia**: Compra ETH urgentemente en un CEX y transfiérelo rápido
3. **Último recurso**: Pide ayuda a alguien que pueda prestarte ETH

### 6. ¿Puedo usar este bot en otras redes?

Actualmente solo está configurado para **Ethereum Mainnet**.

Para otras redes (Polygon, Arbitrum), necesitas:
1. Añadir configuración en `config/networks.ts`
2. Cambiar `NETWORK` en `.env`
3. Asegurar que tienes tokens en esa red

**Gas es más barato** en Polygon y Arbitrum, lo que puede hacer el bot más rentable.

### 7. ¿El bot hace todo automáticamente?

**NO**. El bot ejecuta comandos que TÚ le das.

**NO** monitorea automáticamente ni rebalancea solo.

**TÚ** debes:
- Revisar el status regularmente
- Decidir cuándo añadir/reducir
- Monitorear el mercado

### 8. ¿Qué hago si el spread se vuelve negativo?

**Acción inmediata**: Cierra la posición o reduce mucho el leverage.

```bash
npm run dev -- delever 3.0
# O cierra completamente:
npm run dev -- delever 10.0
```

**Spread negativo** = Estás perdiendo dinero cada segundo.

### 9. ¿Puedo usar otros tokens que no sean USDC/USDT?

**Sí**, pero necesitas editar `config/strategy.ts`:

```typescript
{
  collateralAsset: 'DAI',  // Cambiar a DAI
  debtAsset: 'USDC',       // Cambiar a USDC
}
```

**Importante**: Verifica que ambos tokens:
- Estén soportados en Aave v3
- Tengan buena liquidez en Uniswap
- El spread sea positivo

### 10. ¿Cuánto cuesta en gas abrir una posición?

**Depende del número de loops** y el precio del gas:

| Operación | Gas (gwei) | Costo Aprox. |
|-----------|------------|--------------|
| Deposit inicial | 30-50 | ~€10-€15 |
| Loop 1 (borrow + swap + deposit) | 30-50 | ~€15-€25 |
| Loop 2 | 30-50 | ~€15-€25 |
| Loop 3 | 30-50 | ~€15-€25 |
| **Total (3 loops)** | 30-50 | **€55-€90** |

**Con gas caro (100+ gwei)**: Puede costar €150-€300.

**Recomendación**: Opera cuando gas < 50 gwei.

---

## Escenarios de Emergencia

### 🚨 Emergencia 1: Health Factor < 1.1

**PELIGRO CRÍTICO**: Estás a punto de ser liquidado.

**Acción INMEDIATA**:

```bash
# Opción 1: Deleverage máximo
npm run dev -- delever 3.0

# Opción 2: Si falla, deleverage parcial
npm run dev -- delever 1.5
```

**Si el comando falla**:
1. Ve manualmente a [Aave App](https://app.aave.com)
2. Repay parte de tu deuda usando tu wallet
3. O añade más collateral

**NO ESPERES**. Cada minuto cuenta.

### 🚨 Emergencia 2: USDC o USDT Depeg

**Señales**:
- USDC cotiza a $0.90 o menos (debería ser $1.00)
- Noticias de problemas con Circle o Tether

**Acción**:
```bash
# Sal inmediatamente
npm run dev -- delever 10.0

# Acepta las pérdidas por slippage
# Es mejor perder 2-5% que 50%
```

**NO intentes "esperar a que se recupere"**. En un depeg real, puedes perder todo.

### 🚨 Emergencia 3: Exploit/Hack en Aave

**Señales**:
- Noticias de vulnerabilidad en Aave
- Actividad sospechosa en tu wallet
- Mensajes de alerta de la comunidad

**Acción**:
```bash
# Intenta cerrar posición
npm run dev -- delever 10.0
```

**Si el protocolo está pausado**:
- Espera comunicados oficiales de Aave
- NO entres en pánico
- Aave tiene seguro y procesos de recuperación

### 🚨 Emergencia 4: Gas Price Extremo (>500 gwei)

**Situación**: Gas está carísimo (congestion de red) y necesitas hacer deleverage.

**Opciones**:

**Opción 1**: Paga el gas alto (si HF < 1.2)
```bash
# Vale la pena pagar €200-€300 en gas
# si evitas liquidación que te costaría €1000+
npm run dev -- delever 2.0
```

**Opción 2**: Espera (solo si HF > 1.3)
- Monitorea gas price cada 30 min
- Opera cuando baje < 200 gwei

**Opción 3**: Usa Aave UI directamente
- Puede ser más eficiente en gas
- [app.aave.com](https://app.aave.com)

### 🚨 Emergencia 5: No Puedes Acceder a tu Wallet

**Prevención**:
- **Siempre** ten tu private key respaldada en 2-3 lugares seguros
- Físico (papel) + digital (encriptado)

**Si perdiste acceso**:
1. Intenta recuperar usando seed phrase
2. Busca backups de tu private key
3. Si usas hardware wallet, úsalo

**Si realmente perdiste las claves**:
- **No hay recuperación posible**
- Los fondos están perdidos permanentemente
- Esta es la realidad de crypto: "Not your keys, not your crypto"

---

## Checklist de Seguridad Diaria

Usa esta checklist **TODOS LOS DÍAS**:

```
[ ] Reviso status del bot (npm run dev -- status)
[ ] Health Factor > 1.5 ✓
[ ] Spread sigue siendo positivo ✓
[ ] No hay noticias negativas sobre USDC/USDT ✓
[ ] Tengo suficiente ETH para gas (> 0.03 ETH) ✓
[ ] No hay alertas en comunidad Aave ✓
```

Si **alguno** falla: Toma acción inmediata.

---

## Resumen para Novatos

### Los 10 Mandamientos del Carry Trade

1. **Empieza pequeño** (€500-€1,000 máximo)
2. **Mantén HF > 1.5** siempre
3. **Solo opera con spread > 0.3%**
4. **Revisa tu posición 2 veces al día** mínimo
5. **Ten siempre 0.05 ETH** para gas de emergencia
6. **Usa wallet dedicada**, no tu wallet principal
7. **Nunca uses más del 25%** de tu capital crypto
8. **Si HF < 1.4**, haz deleverage INMEDIATAMENTE
9. **Si spread < 0%**, cierra la posición
10. **Solo usa capital que puedas perder** completamente

### Tu Primera Semana - Plan de Acción

**Día 1-2**: Familiarización
- Ejecuta `status` varias veces
- Prueba `dryRun: true`
- Lee toda esta guía

**Día 3-4**: Primera posición (si spread bueno)
- Abre posición pequeña (€500)
- Monitorea cada 6 horas
- Toma notas de lo que observas

**Día 5-7**: Aprendizaje
- Continúa monitoreando
- Practica interpretar los números
- Decide si continuar o cerrar

**Semana 2+**: Ajustes
- Si todo fue bien, considera aumentar capital
- Si hubo problemas, cierra y aprende de los errores

---

## Recursos Adicionales

### Para Aprender Más sobre DeFi

- **Aave Documentation**: [https://docs.aave.com](https://docs.aave.com)
- **Uniswap Learn**: [https://uniswap.org/docs](https://uniswap.org/docs)
- **DeFi Llama** (para ver APYs): [https://defillama.com](https://defillama.com)

### Tools Útiles

- **Gas Tracker**: [https://etherscan.io/gastracker](https://etherscan.io/gastracker)
- **Aave App**: [https://app.aave.com](https://app.aave.com)
- **Stablecoin Tracking**: [https://www.coingecko.com](https://www.coingecko.com)

### Comunidades

- **Aave Discord**: Para noticias y soporte
- **DeFi Twitter**: Para mantenerte actualizado
- **Reddit r/defi**: Para aprender de otros

---

## Conclusión

Este bot **democratiza** el carry trade en Aave, pero **NO elimina los riesgos**.

**Úsalo como herramienta de aprendizaje**:
- Entiende cómo funciona DeFi
- Aprende sobre leverage y riesgos
- Experimenta con capital pequeño

**NO lo uses como**:
- Fuente de ingresos principal
- Forma de hacerte rico rápido
- Inversión sin riesgo

**Recuerda**:
- Carry trade es avanzado, este bot lo hace accesible
- Accesible ≠ Libre de riesgo
- Edúcate constantemente
- Opera responsablemente

---

**¡Buena suerte y que tengas éxito en tu viaje DeFi!** 🚀📊

**Último recordatorio**: Esta es una herramienta **experimental** para **aprendizaje**. Usa solo capital que puedas perder. Los mercados son impredecibles. Los smart contracts pueden tener bugs. **Opera bajo tu propio riesgo.**
