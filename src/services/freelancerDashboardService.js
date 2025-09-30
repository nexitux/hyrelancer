import api from '@/config/api';

export const freelancerDashboardService = {
  async getFreelancerDashboard() {
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

  transformFreelancerDashboardData(data) {
    if (!data) return null;

    return {
      user: data.user || {},
      stats: {
        sentProposals: data.sendReCount || 0,
        assignedJobs: data.AssignJobCount || 0,
        completedJobs: data.comJobCount || 0,
        startedJobs: data.startJobCount || 0,
        pendingJobs: data.penJobCount || 0,
      },
      monthlyStats: {
        sentProposals: data.MosendReCount || 0,
        assignedJobs: data.MoAssignJobCount || 0,
        completedJobs: data.MocomJobCount || 0,
        startedJobs: data.MostartJobCount || 0,
        pendingJobs: data.MopenJobCount || 0,
      },
      badges: data.fe_badges || [],
    };
  }
};
