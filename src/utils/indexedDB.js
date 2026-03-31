// IndexedDB utility - Full HR System Database
// HROS (Human Resources Operating System)
// 16 tables for complete HR + Execution tracking
// Data persists even after clearing site data
// Much larger storage capacity (50MB+)

const DB_NAME = 'HROS_Calendar'
const DB_VERSION = 2
const STORES = {
  // Calendar & Events (legacy)
  events: 'events',
  
  // HR Tables
  people: 'people',
  hiringPipeline: 'hiringPipeline',
  onboarding: 'onboarding',
  exits: 'exits',
  
  // Execution Tables
  workLogs: 'workLogs',
  projects: 'projects',
  tasks: 'tasks',
  taskComments: 'taskComments',
  
  // Support & Strategy Tables
  checkIns: 'checkIns',
  oneOnOnes: 'oneOnOnes',
  decisions: 'decisions',
  actionItems: 'actionItems',
  skills: 'skills',
  timeOff: 'timeOff',
  compensationHistory: 'compensationHistory',
  teamDynamics: 'teamDynamics',
  redFlags: 'redFlags'
}

let db = null

// Initialize IndexedDB with all 16 tables
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('IndexedDB error:', request.error)
      reject(request.error)
    }

    request.onsuccess = () => {
      db = request.result
      console.log('IndexedDB initialized successfully with 16 tables')
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      db = event.target.result
      const { oldVersion } = event
      
      // Create or upgrade object stores
      const storeNames = [
        // Existing
        STORES.events,
        // New HR Tables
        STORES.people,
        STORES.hiringPipeline,
        STORES.onboarding,
        STORES.exits,
        STORES.workLogs,
        STORES.projects,
        STORES.tasks,
        STORES.taskComments,
        STORES.checkIns,
        STORES.oneOnOnes,
        STORES.decisions,
        STORES.actionItems,
        STORES.skills,
        STORES.timeOff,
        STORES.compensationHistory,
        STORES.teamDynamics,
        STORES.redFlags
      ]

      storeNames.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' })
          console.log(`Created ${storeName} object store`)
        }
      })
    }
  })
}

// ==================== GENERIC CRUD FUNCTIONS ====================
// These work with any table/store in the database

// Generic: Get all records from a table
export const getAllFromDB = (tableName) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readonly')
    const store = transaction.objectStore(tableName)
    const request = store.getAll()

    request.onsuccess = () => {
      resolve(request.result || [])
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Generic: Get single record by ID
export const getFromDB = (tableName, id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readonly')
    const store = transaction.objectStore(tableName)
    const request = store.get(id)

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Generic: Add record to table
export const addToDB = (tableName, record) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readwrite')
    const store = transaction.objectStore(tableName)
    const request = store.add(record)

    request.onsuccess = () => {
      resolve(record)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Generic: Update record in table
export const updateInDB = (tableName, record) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readwrite')
    const store = transaction.objectStore(tableName)
    const request = store.put(record)

    request.onsuccess = () => {
      resolve(record)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Generic: Delete record from table
export const deleteFromDB = (tableName, id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readwrite')
    const store = transaction.objectStore(tableName)
    const request = store.delete(id)

    request.onsuccess = () => {
      resolve(true)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Generic: Clear entire table
export const clearTableDB = (tableName) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readwrite')
    const store = transaction.objectStore(tableName)
    const request = store.clear()

    request.onsuccess = () => {
      console.log(`Cleared ${tableName} from IndexedDB`)
      resolve(true)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// ==================== EVENTS TABLE (Backwards Compatible) ====================

// Save all events to IndexedDB
export const saveEventsDB = (events) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORES.events], 'readwrite')
    const store = transaction.objectStore(STORES.events)

    // Clear existing and add new
    store.clear()
    
    events.forEach(event => {
      store.add(event)
    })

    transaction.oncomplete = () => {
      console.log(`Saved ${events.length} events to IndexedDB`)
      resolve(true)
    }

    transaction.onerror = () => {
      console.error('Failed to save to IndexedDB:', transaction.error)
      reject(transaction.error)
    }
  })
}

// Load all events from IndexedDB
export const loadEventsDB = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([STORES.events], 'readonly')
    const store = transaction.objectStore(STORES.events)
    const request = store.getAll()

    request.onsuccess = () => {
      console.log(`Loaded ${request.result.length} events from IndexedDB`)
      resolve(request.result)
    }

    request.onerror = () => {
      console.error('Failed to load from IndexedDB:', request.error)
      reject(request.error)
    }
  })
}

// Delete event from IndexedDB
export const deleteEventDB = (eventId) => {
  return deleteFromDB(STORES.events, eventId)
}

// Update event in IndexedDB
export const updateEventDB = (event) => {
  return updateInDB(STORES.events, event)
}

// Add single event to IndexedDB
export const addEventDB = (event) => {
  return addToDB(STORES.events, event)
}

// Clear all events (for resetting)
export const clearAllEventsDB = () => {
  return clearTableDB(STORES.events)
}

// ==================== DATABASE UTILITIES ====================

// Get count of records in a table
export const getCountFromDB = (tableName) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    const transaction = db.transaction([tableName], 'readonly')
    const store = transaction.objectStore(tableName)
    const request = store.count()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(request.error)
    }
  })
}

// Get database stats for all tables
export const getDBStats = () => {
  return new Promise(async (resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'))
      return
    }

    try {
      const stats = {
        dbName: DB_NAME,
        version: DB_VERSION,
        tables: {}
      }

      // Get count for each table
      for (const [key, tableName] of Object.entries(STORES)) {
        const count = await getCountFromDB(tableName)
        stats.tables[key] = count
      }

      resolve(stats)
    } catch (error) {
      reject(error)
    }
  })
}

// Export stores for reference
export { STORES }
