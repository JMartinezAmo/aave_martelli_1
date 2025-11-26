# 🚀 Guía de Deployment para Novatos

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación Paso a Paso](#instalación-paso-a-paso)
4. [Configuración del Proyecto](#configuración-del-proyecto)
5. [Verificación de la Instalación](#verificación-de-la-instalación)
6. [Seguridad y Mejores Prácticas](#seguridad-y-mejores-prácticas)
7. [Solución de Problemas Comunes](#solución-de-problemas-comunes)
8. [Siguientes Pasos](#siguientes-pasos)

---

## Introducción

Bienvenido a la guía de deployment del **Bot de Carry Trade para Aave v3**. Esta guía está diseñada para personas **sin experiencia técnica previa** en programación o blockchain.

### ¿Qué vas a hacer en esta guía?

- Instalar las herramientas necesarias en tu computadora
- Descargar el código del proyecto
- Configurar tu conexión a la blockchain de Ethereum
- Configurar tu wallet (billetera digital)
- Verificar que todo funciona correctamente

### ¿Cuánto tiempo tomará?

Aproximadamente **30-60 minutos** si sigues todos los pasos cuidadosamente.

---

## Requisitos Previos

### 1. Sistema Operativo

Este proyecto funciona en:
- ✅ **Windows 10 o 11**
- ✅ **macOS** (cualquier versión reciente)
- ✅ **Linux** (Ubuntu, Fedora, etc.)

### 2. Conocimientos Necesarios

**NO necesitas saber programar**, pero sí necesitas:
- Saber usar la terminal/línea de comandos básica
- Entender conceptos básicos de blockchain y Ethereum
- Tener una wallet de Ethereum con algo de fondos

### 3. Capital Inicial

**⚠️ IMPORTANTE**: Este bot es **EXPERIMENTAL** y solo para aprendizaje.

- **Recomendado**: €500 - €1,000 para empezar
- **Mínimo**: €100 (pero los costos de gas pueden no ser rentables)
- **Máximo**: NO uses más de €5,000

---

## Instalación Paso a Paso

### Paso 1: Instalar Node.js

**¿Qué es Node.js?** Es un programa que permite ejecutar código JavaScript en tu computadora (necesario para este proyecto).

#### En Windows:

1. Ve a [https://nodejs.org](https://nodejs.org)
2. Descarga la versión **LTS** (versión estable recomendada)
3. Ejecuta el instalador descargado
4. Haz clic en "Next" en todas las pantallas (deja las opciones por defecto)
5. Haz clic en "Install" y espera a que termine

#### En macOS:

```bash
# Opción 1: Descarga desde el sitio web
# Ve a https://nodejs.org y descarga la versión LTS

# Opción 2: Usando Homebrew (si lo tienes instalado)
brew install node
```

#### En Linux (Ubuntu/Debian):

```bash
# Actualiza el sistema
sudo apt update

# Instala Node.js
sudo apt install nodejs npm

# Verifica la versión
node --version
```

#### Verificar la instalación:

Abre una terminal (Command Prompt en Windows, Terminal en macOS/Linux) y ejecuta:

```bash
node --version
npm --version
```

Deberías ver algo como:
```
v20.10.0
10.2.3
```

### Paso 2: Instalar Git

**¿Qué es Git?** Es una herramienta para descargar y gestionar código.

#### En Windows:

1. Ve a [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Descarga el instalador
3. Ejecuta el instalador con las opciones por defecto

#### En macOS:

```bash
# Git suele venir preinstalado. Verifica con:
git --version

# Si no está instalado, macOS te pedirá instalarlo automáticamente
```

#### En Linux:

```bash
sudo apt install git
```

#### Verificar la instalación:

```bash
git --version
```

Deberías ver algo como: `git version 2.40.0`

### Paso 3: Descargar el Proyecto

Ahora vamos a descargar el código del bot a tu computadora.

1. **Abre una terminal**
2. **Navega a la carpeta donde quieres guardar el proyecto**:

```bash
# En Windows, puedes usar:
cd C:\Users\TuNombre\Documentos

# En macOS/Linux:
cd ~/Documents
```

3. **Clona el repositorio** (descarga el código):

```bash
git clone [URL_DEL_REPOSITORIO]
cd aave_martelli_1
```

> **Nota**: Reemplaza `[URL_DEL_REPOSITORIO]` con la URL real de tu repositorio de GitHub.

### Paso 4: Instalar Dependencias del Proyecto

Las dependencias son librerías de código que el proyecto necesita para funcionar.

```bash
npm install
```

Este comando:
- Descargará automáticamente todas las librerías necesarias
- Puede tomar 2-5 minutos dependiendo de tu conexión a internet
- Verás mucho texto pasando por la pantalla (es normal)

**Espera hasta ver** algo como:
```
added 523 packages in 2m
```

---

## Configuración del Proyecto

### Paso 1: Crear el Archivo de Configuración

El archivo `.env` contiene tu configuración privada (claves, URLs, etc.).

```bash
# Copia el archivo de ejemplo
cp .env.example .env
```

En Windows, si el comando anterior no funciona, usa:
```bash
copy .env.example .env
```

### Paso 2: Obtener una URL de RPC

**¿Qué es un RPC?** Es como una "puerta de entrada" para conectarte a la blockchain de Ethereum.

#### Opción Recomendada: Alchemy (GRATIS)

1. **Ve a** [https://www.alchemy.com](https://www.alchemy.com)
2. **Regístrate** con tu email (es gratis)
3. **Crea una nueva app**:
   - Haz clic en "Create new app"
   - Nombre: `Aave Carry Trade Bot`
   - Chain: `Ethereum`
   - Network: `Ethereum Mainnet`
4. **Copia la URL**:
   - Haz clic en tu app
   - Haz clic en "View Key"
   - Copia la **HTTPS URL** (se ve así: `https://eth-mainnet.g.alchemy.com/v2/tu-clave-aqui`)

#### Alternativa: Infura (también GRATIS)

1. Ve a [https://infura.io](https://infura.io)
2. Regístrate
3. Crea un proyecto nuevo
4. Selecciona Ethereum Mainnet
5. Copia el endpoint HTTPS

### Paso 3: Obtener tu Private Key (Clave Privada)

**⚠️ EXTREMADAMENTE IMPORTANTE**: Tu private key es como la contraseña de tu banco. **NUNCA** la compartas con nadie.

#### ¿Qué es una Private Key?

Es un código secreto que controla tu wallet (billetera) de Ethereum. Con ella puedes:
- Enviar transacciones
- Gastar tus fondos
- Usar tus criptomonedas

#### Cómo obtenerla de MetaMask:

1. Abre MetaMask en tu navegador
2. Haz clic en los tres puntos (⋮) en la esquina superior derecha
3. Ve a "Account Details"
4. Haz clic en "Show Private Key"
5. Ingresa tu contraseña de MetaMask
6. **Copia la clave** (empieza con `0x` y tiene 64 caracteres hexadecimales)

**🔒 CONSEJOS DE SEGURIDAD**:
- **USA UNA WALLET DEDICADA**: Crea una wallet nueva SOLO para este bot
- **NO uses tu wallet principal** donde guardas tus ahorros
- **Solo pon la cantidad que estás dispuesto a perder**

#### Cómo crear una wallet dedicada:

1. En MetaMask, haz clic en el icono de tu cuenta
2. Selecciona "Create Account"
3. Ponle un nombre como "Bot Aave - Experimentación"
4. Transfiere una pequeña cantidad (€500-€1000) a esta wallet
5. Usa la private key de ESTA wallet nueva

### Paso 4: Editar el Archivo .env

Ahora abre el archivo `.env` con cualquier editor de texto (Notepad, TextEdit, VS Code, etc.).

**Busca estas líneas y reemplázalas**:

```env
# ===== REEMPLAZA ESTOS VALORES =====

# Tu URL de RPC de Alchemy/Infura
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_CLAVE_AQUI

# Tu clave privada (debe empezar con 0x)
PRIVATE_KEY=0xTU_CLAVE_PRIVADA_DE_64_CARACTERES_AQUI

# Red a usar (déjalo como mainnet)
NETWORK=mainnet

# Logs de debug (déjalo en false por ahora)
DEBUG=false

# ===== PARA TESTING (OPCIONAL) =====

# Usa la misma URL que RPC_URL
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_CLAVE_AQUI

# Habilitar testing en fork (déjalo en true si quieres probar sin gastar dinero real)
FORK=true
```

**Guarda el archivo** después de editarlo.

### Paso 5: Configurar los Parámetros de Trading

Ahora vamos a configurar **cómo va a operar el bot**.

Abre el archivo `config/strategy.ts` en un editor de texto.

Encontrarás estos parámetros (con las explicaciones):

```typescript
export const defaultStrategyConfig: StrategyConfig = {
  network: 'mainnet',

  // ¿Qué tokens usar?
  collateralAsset: 'USDC',  // Token que depositas (recomendado: USDC)
  debtAsset: 'USDT',        // Token que pides prestado (recomendado: USDT)

  // ¿Cuántos "loops" hacer?
  maxLoops: 3,              // NOVATOS: Dejar en 3

  // Seguridad: ¿Qué tan cerca de la liquidación quieres estar?
  minHealthFactor: 1.8,     // NOVATOS: Dejar en 1.8 (más seguro)
                            // 1.0 = liquidación inmediata
                            // 1.5 = algo arriesgado
                            // 1.8 = conservador (RECOMENDADO)
                            // 2.0 = muy conservador

  // ¿Cuánto del máximo préstamo disponible usar?
  maxLtvUsage: 70,          // NOVATOS: Usar 70% (conservador)
                            // 70 = usar solo 70% del préstamo máximo
                            // 80 = más agresivo
                            // 90 = muy agresivo (NO recomendado)

  // ¿Cuánta diferencia de APY necesitas para que valga la pena?
  minSpreadBps: 10,         // 10 bps = 0.1%
                            // Si deposit APY - borrow APY < 0.1%, no opera

  // ¿Cuánto slippage aceptar en los swaps?
  slippageBps: 50,          // 50 bps = 0.5%
                            // Cuanto más bajo, menos pérdidas por slippage
                            // Pero puede fallar si el mercado es muy volátil

  // Margen de seguridad adicional
  borrowSafetyMargin: 0.90, // Usa solo 90% del cálculo teórico
                            // NOVATOS: Dejar en 0.90

  // Modo de prueba (muy importante para novatos)
  dryRun: false,            // false = transacciones reales
                            // true = solo simula (NO gasta gas ni fondos)
};
```

**Para NOVATOS, se recomienda**:
- `minHealthFactor: 2.0` (más seguro que 1.8)
- `maxLtvUsage: 60` (más conservador que 70)
- `maxLoops: 2` (menos loops = menos complejo)
- `dryRun: true` (primero prueba sin gastar dinero real)

### Paso 6: Compilar el Proyecto

Antes de usar el bot, necesitas "compilar" el código (convertir TypeScript a JavaScript).

```bash
npm run build
```

Si todo va bien, verás:
```
Successfully compiled 15 files with TypeScript
```

---

## Verificación de la Instalación

Antes de usar dinero real, vamos a verificar que todo funciona.

### Paso 1: Verificar la Conexión

```bash
npm run dev -- status
```

**Si funciona correctamente**, verás algo como:

```
╔══════════════════════════════════════╗
║     AAVE POSITION STATUS             ║
╚══════════════════════════════════════╝

Network: Ethereum Mainnet
Wallet: 0x1234...5678

COLLATERAL
├─ USDC Deposited: 0.00
└─ Value: $0.00

DEBT
├─ USDT Borrowed: 0.00
└─ Value: $0.00

HEALTH FACTOR: N/A (no position)
Available to Borrow: (depends on deposits)

CURRENT RATES
├─ USDC Deposit APY: 3.45%
├─ USDT Borrow APY: 4.20%
└─ Spread: -0.75% (NEGATIVE - NOT PROFITABLE)
```

Si ves esto, **¡enhorabuena! La instalación funciona correctamente.**

### Paso 2: Probar en Modo Dry Run

Antes de gastar dinero real, puedes simular operaciones.

1. Abre `config/strategy.ts`
2. Cambia `dryRun: false` a `dryRun: true`
3. Guarda el archivo

Ahora ejecuta:

```bash
npm run dev -- open 100
```

Verás una simulación de qué haría el bot con 100 USDC, **sin gastar gas ni fondos reales**.

### Paso 3: Ejecutar Tests (Opcional pero Recomendado)

El proyecto incluye tests automáticos para verificar que todo funcione:

```bash
# Tests unitarios (no requieren blockchain)
npm run test:unit

# Tests de integración (usan un fork de mainnet)
npm run test:integration

# Todos los tests
npm test
```

Si los tests pasan, verás:
```
✓ Should calculate correct borrow amount
✓ Should maintain health factor above minimum
✓ Should not loop when spread is negative
...
15 passing (5s)
```

---

## Seguridad y Mejores Prácticas

### 🔒 Seguridad de tu Private Key

1. **NUNCA subas tu `.env` a GitHub o lo compartas**
   - El archivo `.gitignore` ya está configurado para evitar esto
   - Verifica con: `git status` (no debería aparecer `.env`)

2. **Usa una wallet dedicada**
   - Crea una wallet nueva solo para el bot
   - NO uses tu wallet principal

3. **Limita los fondos**
   - Solo transfiere lo que estás dispuesto a perder
   - Empieza con cantidades pequeñas (€500-€1,000)

4. **Haz backups**
   - Guarda tu private key en un lugar seguro (offline)
   - Escríbela en papel y guárdala en un lugar seguro

### 💰 Seguridad Financiera

1. **Entiende los riesgos**:
   - **Liquidación**: Si el Health Factor baja de 1.0, pierdes tu colateral
   - **Depeg**: Si USDC o USDT pierden su valor de $1, puedes perder mucho
   - **Gas costs**: Las transacciones en Ethereum cuestan dinero (gas)
   - **Spread negativo**: Si borrow APY > deposit APY, pierdes dinero

2. **Monitorea tu posición**:
   ```bash
   # Revisa tu posición regularmente
   npm run dev -- status
   ```

3. **Ten ETH para gas**:
   - Necesitas ETH en tu wallet para pagar las transacciones
   - Mantén al menos 0.05 ETH (~€100) para gas

4. **Establece alertas**:
   - Revisa tu posición al menos 1-2 veces al día
   - Si el Health Factor baja de 1.3, considera deleverage inmediatamente

### 🛡️ Protección contra Errores

1. **Siempre prueba con `dryRun: true` primero**
2. **Empieza con cantidades pequeñas** (€100-€500)
3. **Aumenta gradualmente** a medida que ganas confianza
4. **Nunca uses más de €5,000** con este bot experimental

### 📊 Monitoreo

**Crea un hábito de revisar diariamente**:

```bash
# Mañana (antes de trabajar)
npm run dev -- status

# Tarde (después del trabajo)
npm run dev -- status
```

Si ves:
- ❌ **Health Factor < 1.3**: Deleverage inmediatamente
- ⚠️ **Spread negativo**: Considera cerrar la posición
- ✅ **Health Factor > 1.5**: Todo bien

---

## Solución de Problemas Comunes

### Problema 1: "Command not found: npm"

**Causa**: Node.js no está instalado o no está en el PATH.

**Solución**:
1. Re-instala Node.js desde [nodejs.org](https://nodejs.org)
2. Reinicia tu terminal
3. Verifica con: `node --version`

### Problema 2: "Module not found" al ejecutar comandos

**Causa**: Las dependencias no se instalaron correctamente.

**Solución**:
```bash
# Borra la carpeta node_modules
rm -rf node_modules

# Borra el archivo de lock
rm package-lock.json

# Re-instala
npm install
```

### Problema 3: "Cannot connect to RPC"

**Causa**: La URL de RPC en `.env` es incorrecta o el servicio está caído.

**Solución**:
1. Verifica que `RPC_URL` en `.env` esté correcta
2. Asegúrate de que copiaste la URL completa de Alchemy/Infura
3. Prueba la URL en un navegador (debería responder algo)

### Problema 4: "Invalid private key"

**Causa**: La private key en `.env` no es válida.

**Solución**:
1. Asegúrate de que empieza con `0x`
2. Debe tener 66 caracteres totales (0x + 64 caracteres hexadecimales)
3. Copia de nuevo desde MetaMask cuidadosamente

### Problema 5: "Insufficient funds for gas"

**Causa**: No tienes suficiente ETH en tu wallet para pagar el gas.

**Solución**:
1. Transfiere ETH a tu wallet (al menos 0.05 ETH)
2. Verifica con `npm run dev -- status`

### Problema 6: "Transaction reverted"

**Causa**: La transacción falló (puede haber muchas razones).

**Solución**:
1. Activa debug logs en `.env`: `DEBUG=true`
2. Ejecuta de nuevo el comando
3. Lee el mensaje de error completo
4. Causas comunes:
   - Slippage muy bajo (aumenta `slippageBps` en config)
   - Health Factor muy bajo (aumenta `minHealthFactor`)
   - Liquidez insuficiente en el DEX

### Problema 7: Tests fallan

**Causa**: No tienes configurado el RPC para testing.

**Solución**:
```bash
# Asegúrate de tener MAINNET_RPC_URL en .env
export MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_CLAVE
export FORK=true

npm test
```

### Problema 8: "Permission denied" al ejecutar comandos

**Causa**: En Linux/macOS, puede que necesites permisos.

**Solución**:
```bash
# Dale permisos de ejecución
chmod +x src/cli.ts

# O ejecuta con node directamente
node dist/cli.js status
```

### Problema 9: El bot no hace loops

**Causa**: El spread APY es negativo o muy bajo.

**Solución**:
1. Revisa los APYs actuales: `npm run dev -- status`
2. Si el spread es negativo, **NO abras posición** (perderías dinero)
3. Espera a que los rates mejoren o prueba otro par de tokens

### Problema 10: Build falla con errores de TypeScript

**Causa**: Hay errores en el código o falta alguna dependencia.

**Solución**:
```bash
# Re-instala dependencias de desarrollo
npm install --save-dev typescript ts-node @types/node

# Intenta build de nuevo
npm run build
```

---

## Siguientes Pasos

**¡Felicitaciones!** Has completado la instalación y configuración del bot.

### ¿Qué hacer ahora?

1. **Lee la Guía de Uso** (`GUIA_USO.md`) para aprender a:
   - Interpretar los APYs y el spread
   - Abrir tu primera posición
   - Añadir loops
   - Hacer deleverage
   - Cerrar posiciones

2. **Practica en Dry Run**:
   - Mantén `dryRun: true` en la config
   - Simula varias operaciones
   - Familiarízate con los comandos

3. **Monitorea los mercados**:
   - Revisa los APYs diariamente
   - Espera un spread positivo de al menos 0.3-0.5%
   - No tengas prisa en abrir posición

4. **Empieza pequeño**:
   - Primera posición: €100-€500
   - Solo aumenta si todo va bien después de 1-2 semanas

### Recursos Adicionales

- **README.md**: Documentación técnica completa
- **Aave Documentation**: [https://docs.aave.com](https://docs.aave.com)
- **DeFi Safety**: [https://www.defisafety.com](https://www.defisafety.com)

### Comunidad y Soporte

Si tienes problemas:
1. Revisa esta guía de troubleshooting
2. Lee el README.md para detalles técnicos
3. Busca el error específico en Google

---

## ⚠️ Recordatorio Final de Riesgos

Este bot es **EXPERIMENTAL** y solo para:
- ✅ Aprendizaje sobre DeFi
- ✅ Experimentación con capital pequeño (€500-€5,000 máximo)
- ✅ Usuarios que entienden los riesgos

**NO es para**:
- ❌ Generar ingresos pasivos confiables
- ❌ Invertir grandes cantidades de capital
- ❌ Usuarios sin conocimientos básicos de DeFi

**Los riesgos incluyen**:
- Pérdida total de tu capital por liquidación
- Pérdidas por depeg de stablecoins
- Pérdidas por spreads negativos
- Bugs en el código
- Problemas con contratos inteligentes de Aave o Uniswap

**USA SOLO CAPITAL QUE PUEDAS PERMITIRTE PERDER.**

---

**¡Buena suerte y opera con responsabilidad!** 🚀
