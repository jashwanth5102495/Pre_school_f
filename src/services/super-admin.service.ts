import apiClient from './api';

export const superAdminService = {
  // 1. Dashboard
  async getDashboardMetrics() {
    const res = await apiClient.get('/super-admin/dashboard');
    return res.data.data;
  },

  async getRevenueChart() {
    const res = await apiClient.get('/super-admin/dashboard/revenue');
    return res.data.data;
  },

  async getSchoolGrowthChart() {
    const res = await apiClient.get('/super-admin/dashboard/school-growth');
    return res.data.data;
  },

  // 2. Schools
  async listSchools(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    planId?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const res = await apiClient.get('/super-admin/schools', { params });
    return res.data;
  },

  async getSchoolById(id: string) {
    const res = await apiClient.get(`/super-admin/schools/${id}`);
    return res.data.data;
  },

  async provisionSchool(data: any) {
    const res = await apiClient.post('/super-admin/schools', data);
    return res.data;
  },

  async updateSchool(id: string, data: any) {
    const res = await apiClient.patch(`/super-admin/schools/${id}`, data);
    return res.data;
  },

  async updateSchoolStatus(id: string, status: string, reason?: string) {
    const res = await apiClient.patch(`/super-admin/schools/${id}/status`, { status, reason });
    return res.data;
  },

  async resendSchoolInvitation(schoolId: string) {
    const res = await apiClient.post(`/super-admin/schools/${schoolId}/invitations`);
    return res.data;
  },

  async archiveSchool(id: string) {
    const res = await apiClient.delete(`/super-admin/schools/${id}`);
    return res.data;
  },

  // 3. Plans & Subscriptions
  async listPlans() {
    const res = await apiClient.get('/super-admin/plans');
    return res.data.data;
  },

  async createPlan(data: any) {
    const res = await apiClient.post('/super-admin/plans', data);
    return res.data;
  },

  async updatePlan(id: string, data: any) {
    const res = await apiClient.patch(`/super-admin/plans/${id}`, data);
    return res.data;
  },

  async listSubscriptions(params?: any) {
    const res = await apiClient.get('/super-admin/subscriptions', { params });
    return res.data;
  },

  async renewSubscription(id: string, data: any) {
    const res = await apiClient.post(`/super-admin/subscriptions/${id}/renew`, data);
    return res.data;
  },

  // 4. Payments & Invoices
  async listPayments(params?: any) {
    const res = await apiClient.get('/super-admin/payments', { params });
    return res.data;
  },

  async listInvoices(params?: any) {
    const res = await apiClient.get('/super-admin/payments/invoices', { params });
    return res.data;
  },

  async createPaymentOrder(data: any) {
    const res = await apiClient.post('/super-admin/payments/create-order', data);
    return res.data.data;
  },

  async verifyPayment(data: any) {
    const res = await apiClient.post('/super-admin/payments/verify', data);
    return res.data;
  },

  // 5. Operations: Platform Users, Features, Notifications, Audits
  async listPlatformUsers() {
    const res = await apiClient.get('/super-admin/users');
    return res.data.data;
  },

  async createPlatformUser(data: any) {
    const res = await apiClient.post('/super-admin/users', data);
    return res.data;
  },

  async updatePlatformUserStatus(userId: string, status: string) {
    const res = await apiClient.patch(`/super-admin/users/${userId}/status`, { status });
    return res.data;
  },

  async listFeatures() {
    const res = await apiClient.get('/super-admin/features');
    return res.data.data;
  },

  async createFeature(data: any) {
    const res = await apiClient.post('/super-admin/features', data);
    return res.data;
  },

  async overrideSchoolFeature(data: any) {
    const res = await apiClient.post('/super-admin/features/override', data);
    return res.data;
  },

  async listNotifications() {
    const res = await apiClient.get('/super-admin/notifications');
    return res.data.data;
  },

  async createNotification(data: any) {
    const res = await apiClient.post('/super-admin/notifications', data);
    return res.data;
  },

  async listAuditLogs(params?: any) {
    const res = await apiClient.get('/super-admin/audit-logs', { params });
    return res.data;
  },
};
