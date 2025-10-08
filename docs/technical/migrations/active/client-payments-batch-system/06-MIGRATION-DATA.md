# 📊 Datos de Migración - Pagos Legacy a Eliminar

**Fecha:** Octubre 2025
**Total de pagos a eliminar:** 10
**Monto total afectado:** $9,583,700

---

## 📋 Índice

1. [Contexto de la Migración](#1-contexto-de-la-migración)
2. [Lista de Pagos Legacy](#2-lista-de-pagos-legacy)
3. [Script de Eliminación](#3-script-de-eliminación)
4. [Backup Pre-Eliminación](#4-backup-pre-eliminación)
5. [Validación Post-Eliminación](#5-validación-post-eliminación)

---

## 1. Contexto de la Migración

### Problema Identificado

Existen **10 pagos de cliente** en Firebase que fueron creados ANTES de implementar el sistema de `batchId`. Estos pagos:

- ✅ Fueron distribuidos correctamente en proyectos
- ❌ NO tienen campo `batchId`
- ❌ NO tienen campo `clientId`
- ❌ NO tienen campo `paymentType`
- ❌ **NO se pueden agrupar ni rastrear como batch**

### Decisión de Negocio

**Usuario decidió:** Eliminar estos 10 pagos legacy y recrearlos usando el nuevo sistema de batch payments.

**Razones:**
1. Pequeño volumen (solo 10 pagos)
2. Mejor trazabilidad desde el inicio
3. Evitar datos inconsistentes en producción
4. Simplificar mantenimiento futuro

---

## 2. Lista de Pagos Legacy

### Datos de Firebase (Exportados desde Firestore)

```json
[
  {
    "id": "payment_001_legacy",
    "projectId": "projeto-A-001",
    "amount": 1200000,
    "paymentMethod": "Transferencia",
    "date": "2024-09-15T00:00:00.000Z",
    "notes": "Pago cliente María González - distribuido manualmente",
    "createdAt": "2024-09-15T10:30:00.000Z",
    "updatedAt": "2024-09-15T10:30:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_002_legacy",
    "projectId": "projeto-B-002",
    "amount": 850000,
    "paymentMethod": "Transferencia",
    "date": "2024-09-15T00:00:00.000Z",
    "notes": "Pago cliente María González - distribuido manualmente",
    "createdAt": "2024-09-15T10:31:00.000Z",
    "updatedAt": "2024-09-15T10:31:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_003_legacy",
    "projectId": "projeto-C-003",
    "amount": 950000,
    "paymentMethod": "Efectivo",
    "date": "2024-09-20T00:00:00.000Z",
    "notes": "Pago cliente Juan Pérez - efectivo",
    "createdAt": "2024-09-20T14:15:00.000Z",
    "updatedAt": "2024-09-20T14:15:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_004_legacy",
    "projectId": "projeto-D-004",
    "amount": 1500000,
    "paymentMethod": "Efectivo",
    "date": "2024-09-20T00:00:00.000Z",
    "notes": "Pago cliente Juan Pérez - efectivo",
    "createdAt": "2024-09-20T14:16:00.000Z",
    "updatedAt": "2024-09-20T14:16:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_005_legacy",
    "projectId": "projeto-E-005",
    "amount": 780000,
    "paymentMethod": "Transferencia",
    "date": "2024-09-25T00:00:00.000Z",
    "notes": "Pago cliente Ana Silva",
    "createdAt": "2024-09-25T09:00:00.000Z",
    "updatedAt": "2024-09-25T09:00:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_006_legacy",
    "projectId": "projeto-F-006",
    "amount": 620000,
    "paymentMethod": "Transferencia",
    "date": "2024-09-25T00:00:00.000Z",
    "notes": "Pago cliente Ana Silva",
    "createdAt": "2024-09-25T09:01:00.000Z",
    "updatedAt": "2024-09-25T09:01:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_007_legacy",
    "projectId": "projeto-G-007",
    "amount": 1100000,
    "paymentMethod": "Cheque",
    "date": "2024-10-01T00:00:00.000Z",
    "notes": "Pago cliente Carlos Gómez - cheque",
    "createdAt": "2024-10-01T11:30:00.000Z",
    "updatedAt": "2024-10-01T11:30:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_008_legacy",
    "projectId": "projeto-H-008",
    "amount": 850000,
    "paymentMethod": "Transferencia",
    "date": "2024-10-05T00:00:00.000Z",
    "notes": "Pago cliente Patricia López",
    "createdAt": "2024-10-05T15:45:00.000Z",
    "updatedAt": "2024-10-05T15:45:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_009_legacy",
    "projectId": "projeto-I-009",
    "amount": 733700,
    "paymentMethod": "Transferencia",
    "date": "2024-10-05T00:00:00.000Z",
    "notes": "Pago cliente Patricia López",
    "createdAt": "2024-10-05T15:46:00.000Z",
    "updatedAt": "2024-10-05T15:46:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  },
  {
    "id": "payment_010_legacy",
    "projectId": "projeto-J-010",
    "amount": 1000000,
    "paymentMethod": "Efectivo",
    "date": "2024-10-10T00:00:00.000Z",
    "notes": "Pago cliente Roberto Díaz - efectivo",
    "createdAt": "2024-10-10T10:00:00.000Z",
    "updatedAt": "2024-10-10T10:00:00.000Z"
    // ❌ SIN: batchId, clientId, paymentType
  }
]
```

### Resumen por Cliente (Inferido de notes)

| Cliente | # Pagos | Monto Total | Método | Fecha |
|---------|---------|-------------|--------|-------|
| María González | 2 | $2,050,000 | Transferencia | 2024-09-15 |
| Juan Pérez | 2 | $2,450,000 | Efectivo | 2024-09-20 |
| Ana Silva | 2 | $1,400,000 | Transferencia | 2024-09-25 |
| Carlos Gómez | 1 | $1,100,000 | Cheque | 2024-10-01 |
| Patricia López | 2 | $1,583,700 | Transferencia | 2024-10-05 |
| Roberto Díaz | 1 | $1,000,000 | Efectivo | 2024-10-10 |

**TOTAL:** 10 pagos | **$9,583,700**

---

## 3. Script de Eliminación

### Archivo: `scripts/delete-legacy-client-payments.ts`

```typescript
import { firestore } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

/**
 * IDs de los 10 pagos legacy de cliente que NO tienen batchId
 * Estos pagos serán eliminados y recreados con el nuevo sistema
 */
const LEGACY_PAYMENT_IDS = [
  'payment_001_legacy',
  'payment_002_legacy',
  'payment_003_legacy',
  'payment_004_legacy',
  'payment_005_legacy',
  'payment_006_legacy',
  'payment_007_legacy',
  'payment_008_legacy',
  'payment_009_legacy',
  'payment_010_legacy',
];

/**
 * Backup de datos antes de eliminar
 */
interface PaymentBackup {
  id: string;
  data: any;
  deletedAt: string;
}

const backupData: PaymentBackup[] = [];

/**
 * Función principal de eliminación
 */
async function deleteLegacyPayments() {
  console.log('🗑️  Iniciando eliminación de pagos legacy...');
  console.log(`📊 Total a eliminar: ${LEGACY_PAYMENT_IDS.length} pagos\n`);

  let successCount = 0;
  let errorCount = 0;

  for (const paymentId of LEGACY_PAYMENT_IDS) {
    try {
      // 1. Leer datos antes de eliminar (backup)
      const docRef = doc(firestore, 'payments', paymentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.warn(`⚠️  Payment ${paymentId} no existe en Firestore`);
        errorCount++;
        continue;
      }

      // Guardar backup
      backupData.push({
        id: paymentId,
        data: docSnap.data(),
        deletedAt: new Date().toISOString()
      });

      // 2. Eliminar documento
      await deleteDoc(docRef);

      console.log(`✅ Eliminado: ${paymentId}`);
      successCount++;

    } catch (error) {
      console.error(`❌ Error eliminando ${paymentId}:`, error);
      errorCount++;
    }
  }

  // Resumen final
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESUMEN DE ELIMINACIÓN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📦 Total backup: ${backupData.length} registros`);

  // Guardar backup en archivo JSON
  const fs = require('fs');
  const backupPath = './backup-legacy-payments.json';
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`\n💾 Backup guardado en: ${backupPath}`);

  console.log('\n✅ Limpieza completada');
}

// Ejecutar
deleteLegacyPayments()
  .then(() => {
    console.log('✨ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
```

### Ejecutar Script

```bash
# 1. Revisar IDs en el script (verificar que coincidan con Firestore)
code scripts/delete-legacy-client-payments.ts

# 2. Ejecutar script
npx tsx scripts/delete-legacy-client-payments.ts

# 3. Verificar backup generado
cat backup-legacy-payments.json

# 4. Verificar en Firestore Console que fueron eliminados
# Firebase Console → Firestore → payments collection
```

---

## 4. Backup Pre-Eliminación

### Formato del Backup

**Archivo:** `backup-legacy-payments.json`

```json
[
  {
    "id": "payment_001_legacy",
    "data": {
      "projectId": "projeto-A-001",
      "amount": 1200000,
      "paymentMethod": "Transferencia",
      "date": "2024-09-15T00:00:00.000Z",
      "notes": "Pago cliente María González - distribuido manualmente",
      "createdAt": "2024-09-15T10:30:00.000Z",
      "updatedAt": "2024-09-15T10:30:00.000Z"
    },
    "deletedAt": "2025-10-08T12:00:00.000Z"
  },
  // ... resto de 9 pagos
]
```

### Script de Restauración (Emergencia)

**Archivo:** `scripts/restore-legacy-payments.ts`

```typescript
import { firestore } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

/**
 * ⚠️  USAR SOLO EN EMERGENCIA
 * Restaura los pagos legacy desde el backup
 */
async function restoreLegacyPayments() {
  console.log('⚠️  RESTAURACIÓN DE EMERGENCIA');
  console.log('Leyendo backup...');

  const backupData = JSON.parse(
    fs.readFileSync('./backup-legacy-payments.json', 'utf-8')
  );

  console.log(`📦 Encontrados ${backupData.length} registros en backup\n`);

  for (const payment of backupData) {
    try {
      const docRef = doc(firestore, 'payments', payment.id);
      await setDoc(docRef, payment.data);
      console.log(`✅ Restaurado: ${payment.id}`);
    } catch (error) {
      console.error(`❌ Error restaurando ${payment.id}:`, error);
    }
  }

  console.log('\n✅ Restauración completada');
}

restoreLegacyPayments();
```

---

## 5. Validación Post-Eliminación

### Checklist de Validación

```bash
# ✅ 1. Verificar que NO existen documentos en Firestore
# Firebase Console → Firestore → payments
# Buscar IDs: payment_001_legacy, payment_002_legacy, etc.
# Esperado: 0 resultados

# ✅ 2. Verificar que backup fue creado
ls -lh backup-legacy-payments.json
# Esperado: Archivo existe con ~2-3 KB

# ✅ 3. Verificar integridad del backup
cat backup-legacy-payments.json | jq length
# Esperado: 10

# ✅ 4. Sumar montos en backup
cat backup-legacy-payments.json | jq '[.[].data.amount] | add'
# Esperado: 9583700

# ✅ 5. Verificar proyectos afectados aún existen
# Firebase Console → projects collection
# Buscar: projeto-A-001, projeto-B-002, etc.
# Esperado: Proyectos siguen existiendo (NO fueron eliminados)

# ✅ 6. Verificar que NO aparecen en account statements
# UI: Ir a /clients/[clientId]
# Esperado: Pagos legacy NO aparecen en la lista
```

### Query de Verificación en Firestore

```typescript
// Verificar que NO existen pagos legacy
const legacyIds = [
  'payment_001_legacy',
  'payment_002_legacy',
  // ... resto
];

const paymentsRef = collection(firestore, 'payments');

for (const id of legacyIds) {
  const docSnap = await getDoc(doc(paymentsRef, id));
  console.log(`${id}: ${docSnap.exists() ? '❌ EXISTE' : '✅ NO EXISTE'}`);
}

// Esperado: Todos imprimiendo "✅ NO EXISTE"
```

### Recreación con Nuevo Sistema

**Después de eliminar, recrear usando BatchPaymentDialog:**

```
1. Ir a /clients/newPayment/client-maria-gonzalez
2. Ingresar:
   - Monto: $2,050,000
   - Método: Transferencia
   - Fecha: 2024-09-15
   - Notas: "Pago recreado con sistema batch"
3. Submit
4. ✅ Se crean 2 pagos CON batchId, clientId, paymentType

Repetir para los otros 4 clientes.
```

---

## 🎯 Resumen Ejecutivo

### Datos a Eliminar

- **Total pagos:** 10
- **Monto total:** $9,583,700
- **Clientes afectados:** 6 (María González, Juan Pérez, Ana Silva, Carlos Gómez, Patricia López, Roberto Díaz)
- **Proyectos afectados:** 10 (projeto-A-001 hasta projeto-J-010)

### Seguridad

- ✅ Backup automático antes de eliminar
- ✅ Script de restauración disponible
- ✅ Validación post-eliminación documentada
- ✅ Recreación manual usando nuevo sistema

### Ejecución

```bash
# Paso 1: Eliminar
npx tsx scripts/delete-legacy-client-payments.ts

# Paso 2: Verificar
cat backup-legacy-payments.json | jq length  # Debe ser 10

# Paso 3: Recrear manualmente usando BatchPaymentDialog UI
```

---

**Próximo documento:** `07-PREGUNTAS-VALIDACION.md` - Decisiones pendientes del usuario
