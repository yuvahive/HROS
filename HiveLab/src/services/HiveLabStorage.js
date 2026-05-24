/**
 * 📊 HiveLab Cloud Sync Service
 * Connects the Management System to Google Sheets via GAS Bridge
 */

// Replace with the URL provided after deployment
let GAS_URL = '';

export const setGasUrl = (url) => {
  GAS_URL = url;
};

export const HiveLabStorage = {
  /**
   * Fetch all team member and mission data
   */
  async fetchData() {
    if (!GAS_URL) return [];
    try {
      const response = await fetch(GAS_URL);
      if (!response.ok) throw new Error('Cloud sync failed');
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  },

  /**
   * Update or Submit a record
   * @param {Object} rowData - The data object containing member/mission details
   */
  async submitData(rowData) {
    if (!GAS_URL) {
      console.warn('GAS URL not set. Data will not be synced.');
      return false;
    }
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'submit', rowData })
      });
      return true;
    } catch (error) {
      console.error('Error submitting data:', error);
      return false;
    }
  }
};
