/**
 * 📊 HiveLab Cloud Sync Service - Multi-Sheet Integration
 * Tabs: Team_resource_planning | Project_tasks
 */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbw5oi09z1f621Mn1SVCa6g1PKfYk3fy6s-grXVACLm4ziucjTotPla3nJXlw_SqK95OXA/exec';

export const HiveLabStorage = {
  /**
   * Fetch all team member and mission data
   * Returns: { team: [], tasks: [] }
   */
  async fetchData() {
    try {
      const response = await fetch(GAS_URL);
      if (!response.ok) throw new Error('Cloud sync failed');
      const data = await response.json();
      return {
        team: Array.isArray(data.team) ? data.team : [],
        tasks: Array.isArray(data.tasks) ? data.tasks : []
      };
    } catch (error) {
      console.error('Error fetching data:', error);
      return { team: [], tasks: [] };
    }
  },

  /**
   * Update or Submit a record
   * @param {string} type - 'team' or 'tasks'
   * @param {Object} rowData - The data object containing details
   */
  async submitData(type, rowData) {
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'submit', type, rowData })
      });
      return true;
    } catch (error) {
      console.error('Error submitting data:', error);
      return false;
    }
  },

  /**
   * Delete a record permanently
   */
  async deleteData(type, rowData) {
    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'delete', type, rowData })
      });
      return true;
    } catch (error) {
      console.error('Error deleting data:', error);
      return false;
    }
  }
};
