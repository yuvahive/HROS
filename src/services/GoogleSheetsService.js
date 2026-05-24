/**
 * 📊 Google Sheets Cloud Storage Service
 * Handles communication with the Google Apps Script Web App Bridge
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbznvk7k0-p7mGqujewnISULAQhvMP65gwSX8vDtI0PQF-vCKuaYaw4IMnUaKbFwSdESSg/exec';

export const CloudStorage = {
  /**
   * Fetch all system data from the cloud sheet
   */
  async fetchAll() {
    try {
      const response = await fetch(GAS_URL);
      if (!response.ok) throw new Error('Cloud sync failed');
      return await response.json();
    } catch (error) {
      console.error('Error fetching from cloud:', error);
      return null;
    }
  },

  /**
   * Update or delete a record in the cloud
   * @param {string} type - Tab name
   * @param {Array} data - Full list (for updates)
   * @param {string} action - 'update' | 'delete'
   * @param {string} id - Record ID (for deletes)
   */
  async update(type, data, action = 'update', id = null) {
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ type, data, action, id })
      });
      console.log(`[CLOUD ${action.toUpperCase()}] ${type} ${id || ''}`);
      return true;
    } catch (error) {
      console.error(`Error ${action} cloud ${type}:`, error);
      return false;
    }
  }
};
