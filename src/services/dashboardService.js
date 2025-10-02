import api from '@/config/api';

export const dashboardService = {
  // Fetch user dashboard data
  getUserDashboard: async () => {
    try {
      // Try GET first
      const response = await api.get('/UserDashboard');
      return response.data;
    } catch (error) {
      // If GET fails with 405, try POST
      if (error.response?.status === 405) {
        const response = await api.post('/UserDashboard');
        return response.data;
      }
      throw error;
    }
  },

  // Transform API data for components
  transformDashboardData: (data) => {
    if (!data) return null;

    return {
      // Stats cards data
      stats: {
        totalJobs: data.t_job_count || 0,
        activeJobs: data.t_active_job_count || 0,
        completedJobs: data.t_com_job_count || 0,
        inProgressJobs: data.t_in_progress_job_count || 0,
      },
      
      // Monthly data for charts
      monthlyData: Object.keys(data.data || {}).map(month => ({
        month: getMonthName(parseInt(month)),
        jobs: data.data[month]?.job || 0,
        completed: data.data[month]?.complete || 0,
      })),
      
      // Latest job lists
             latestJobs: data.latest_job_list || [],
             latestActiveJobs: data.latest_active_job_list || [],
      
      // Year
      year: data.year || new Date().getFullYear(),
    };
  }
};

// Helper function to get month name
const getMonthName = (monthNumber) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1] || 'Unknown';
};
