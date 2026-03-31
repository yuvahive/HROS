// Sample HROS data initializer
// All hardcoded fake data has been removed
// Only admin IDP functionality retained

import { addToDB, getAllFromDB, STORES } from './indexedDB'

export const generateID = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const initializeSampleData = async () => {
  try {
    console.log('Initializing HROS...')
    
    // No sample data to initialize - system starts empty
    // IDP configuration is managed through Admin Settings UI
    
    console.log('✅ System initialized successfully!')
    return true
  } catch (error) {
    console.error('Error initializing system:', error)
    return false
  }
}

// Event functions removed - system now starts with empty canvas
// Users can create their own data through the UI
