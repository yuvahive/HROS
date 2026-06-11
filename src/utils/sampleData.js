// Sample HROS data initializer
// Seeds the system with demo data for a realistic experience

import { addToDB, getAllFromDB, STORES } from './indexedDB'
import { CloudStorage } from '../services/GoogleSheetsService'

export const generateID = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ==================== SAMPLE USER ACCOUNTS ====================
// Empty — admin creates accounts via Admin Settings or bulk CSV import.

const sampleUsers = []

// ==================== SAMPLE ORG DATA ====================

const samplePeople = []

const sampleWorkLogs = []
const sampleOneOnOnes = []
const sampleTasks = []
const sampleActionItems = []

// ==================== INITIALIZATION ====================

export const initializeSampleData = async () => {
  try {
    console.log('Initializing HROS...')
    // No demo data seeded — admin creates accounts via Admin Settings or bulk CSV import.
    return true
  } catch (error) {
    console.error('Error initializing system:', error)
    return false
  }
}
