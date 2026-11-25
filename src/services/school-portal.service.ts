import apiClient from './api';

export const schoolPortalService = {
  // 1. School Admin
  async getSchoolAdminDashboard() {
    const res = await apiClient.get('/school/admin/dashboard');
    return res.data.data;
  },
  async getStudents(params?: { search?: string; classId?: string; sectionId?: string; status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get('/school/admin/students', { params });
    return res.data;
  },
  async getStudentById(id: string) {
    const res = await apiClient.get(`/school/admin/students/${id}`);
    return res.data.data;
  },
  async createStudent(data: any) {
    const res = await apiClient.post('/school/admin/students', data);
    return res.data.data;
  },
  async updateStudent(id: string, data: any) {
    const res = await apiClient.put(`/school/admin/students/${id}`, data);
    return res.data.data;
  },
  async getStaff() {
    const res = await apiClient.get('/school/admin/staff');
    return res.data.data;
  },
  async createStaff(data: any) {
    const res = await apiClient.post('/school/admin/staff', data);
    return res.data.data;
  },
  async getClasses() {
    const res = await apiClient.get('/school/admin/classes');
    return res.data.data;
  },
  async getFeesOverview() {
    const res = await apiClient.get('/school/admin/fees/overview');
    return res.data.data;
  },
  async getAttendanceOverview(date?: string) {
    const res = await apiClient.get('/school/admin/attendance/overview', { params: { date } });
    return res.data.data;
  },
  async getSchoolProfile() {
    const res = await apiClient.get('/school/admin/profile');
    return res.data.data;
  },
  async updateSchoolProfile(data: any) {
    const res = await apiClient.put('/school/admin/profile', data);
    return res.data.data;
  },

  // 2. Head Master
  async getHeadMasterDashboard() {
    const res = await apiClient.get('/school/head-master/dashboard');
    return res.data.data;
  },
  async getLeaves(status?: string) {
    const res = await apiClient.get('/school/head-master/leaves', { params: { status } });
    return res.data.data;
  },
  async reviewLeave(id: string, data: { action: 'APPROVE' | 'REJECT'; substituteTeacherId?: string; rejectionReason?: string }) {
    const res = await apiClient.put(`/school/head-master/leaves/${id}`, data);
    return res.data.data;
  },
  async getClassesAndSections() {
    const res = await apiClient.get('/school/head-master/classes');
    return res.data.data;
  },
  async createClass(data: { name: string; code: string }) {
    const res = await apiClient.post('/school/head-master/classes', data);
    return res.data.data;
  },
  async createSection(data: { classId: string; name: string; capacity?: number }) {
    const res = await apiClient.post('/school/head-master/sections', data);
    return res.data.data;
  },
  async getAllocations() {
    const res = await apiClient.get('/school/head-master/allocations');
    return res.data.data;
  },
  async createAllocation(data: any) {
    const res = await apiClient.post('/school/head-master/allocations', data);
    return res.data.data;
  },
  async deleteAllocation(id: string) {
    const res = await apiClient.delete(`/school/head-master/allocations/${id}`);
    return res.data.data;
  },
  async getTimetable(params?: { classId?: string; sectionId?: string; teacherId?: string }) {
    const res = await apiClient.get('/school/head-master/timetable', { params });
    return res.data.data;
  },
  async createTimetablePeriod(data: any) {
    const res = await apiClient.post('/school/head-master/timetable', data);
    return res.data.data;
  },
  async deleteTimetablePeriod(id: string) {
    const res = await apiClient.delete(`/school/head-master/timetable/${id}`);
    return res.data.data;
  },
  async getAttendanceSupervision(date?: string) {
    const res = await apiClient.get('/school/head-master/attendance', { params: { date } });
    return res.data.data;
  },
  async getMarksSubmissions(status?: string) {
    const res = await apiClient.get('/school/head-master/marks-review', { params: { status } });
    return res.data.data;
  },
  async getSubmissionDetails(id: string) {
    const res = await apiClient.get(`/school/head-master/marks-review/${id}`);
    return res.data.data;
  },
  async reviewMarksSubmission(id: string, data: { action: 'APPROVE' | 'REJECT'; comments?: string }) {
    const res = await apiClient.put(`/school/head-master/marks-review/${id}`, data);
    return res.data.data;
  },

  // 3. Office Admin
  async getOfficeDashboard() {
    const res = await apiClient.get('/school/office/dashboard');
    return res.data.data;
  },
  async getAdmissions(params?: { status?: string; search?: string }) {
    const res = await apiClient.get('/school/office/admissions', { params });
    return res.data.data;
  },
  async createAdmission(data: any) {
    const res = await apiClient.post('/school/office/admissions', data);
    return res.data.data;
  },
  async updateAdmissionStatus(id: string, data: { status: string; remarks?: string }) {
    const res = await apiClient.put(`/school/office/admissions/${id}/status`, data);
    return res.data.data;
  },
  async enrollStudent(id: string, data: { classId: string; sectionId: string; feeStructureIds?: string[] }) {
    const res = await apiClient.post(`/school/office/admissions/${id}/enroll`, data);
    return res.data.data;
  },
  async getFeeStructures() {
    const res = await apiClient.get('/school/office/fees/structures');
    return res.data.data;
  },
  async createFeeStructure(data: any) {
    const res = await apiClient.post('/school/office/fees/structures', data);
    return res.data.data;
  },
  async getStudentFees(params?: { classId?: string; status?: string; isDefaulter?: boolean; search?: string }) {
    const res = await apiClient.get('/school/office/fees/students', { params });
    return res.data.data;
  },
  async collectFee(data: { studentFeeId: string; amountPaid: number; paymentMethod: string; transactionRef?: string; remarks?: string }) {
    const res = await apiClient.post('/school/office/fees/collect', data);
    return res.data.data;
  },
  async getReceipt(receiptNumber: string) {
    const res = await apiClient.get(`/school/office/fees/receipts/${receiptNumber}`);
    return res.data.data;
  },
  async getDocuments(params?: { status?: string; studentId?: string }) {
    const res = await apiClient.get('/school/office/documents', { params });
    return res.data.data;
  },
  async verifyDocument(id: string, data: { status: string; remarks?: string }) {
    const res = await apiClient.put(`/school/office/documents/${id}/verify`, data);
    return res.data.data;
  },
  async uploadDocument(data: any) {
    const res = await apiClient.post('/school/office/documents', data);
    return res.data.data;
  },
  async uploadDocumentFile(formData: FormData) {
    const res = await apiClient.post('/school/office/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
  async getDocumentViewUrl(id: string) {
    const res = await apiClient.get(`/school/office/documents/${id}/view-url`);
    return res.data.data;
  },
  async deleteDocument(id: string) {
    const res = await apiClient.delete(`/school/office/documents/${id}`);
    return res.data.data;
  },
  async getCertificates() {
    const res = await apiClient.get('/school/office/certificates');
    return res.data.data;
  },
  async generateCertificate(data: { studentId: string; certificateType: string; contentJson?: any }) {
    const res = await apiClient.post('/school/office/certificates', data);
    return res.data.data;
  },

  // 4. Teacher Portal
  async getTeacherDashboard() {
    const res = await apiClient.get('/school/teacher/dashboard');
    return res.data.data;
  },
  async getTeacherAssigned() {
    const res = await apiClient.get('/school/teacher/assigned');
    return res.data.data;
  },
  async getAttendanceSession(classId: string, sectionId: string, date?: string) {
    const res = await apiClient.get('/school/teacher/attendance/session', { params: { classId, sectionId, date } });
    return res.data.data;
  },
  async markAttendance(data: { classId: string; sectionId: string; date?: string; records: any[] }) {
    const res = await apiClient.post('/school/teacher/attendance/mark', data);
    return res.data.data;
  },
  async getExamSubjectsForTeacher() {
    const res = await apiClient.get('/school/teacher/marks/exam-subjects');
    return res.data.data;
  },
  async getMarksSheet(examSubjectId: string) {
    const res = await apiClient.get(`/school/teacher/marks/sheet/${examSubjectId}`);
    return res.data.data;
  },
  async saveMarks(data: { examSubjectId: string; marks: any[]; submitForReview?: boolean; comments?: string }) {
    const res = await apiClient.post('/school/teacher/marks/save', data);
    return res.data.data;
  },
  async getTeacherTimetable() {
    const res = await apiClient.get('/school/teacher/timetable');
    return res.data.data;
  },
  async getHomework() {
    const res = await apiClient.get('/school/teacher/homework');
    return res.data.data;
  },
  async createHomework(data: any) {
    const res = await apiClient.post('/school/teacher/homework', data);
    return res.data.data;
  },
  async getTeacherLeaves() {
    const res = await apiClient.get('/school/teacher/leaves');
    return res.data.data;
  },
  async applyTeacherLeave(data: any) {
    const res = await apiClient.post('/school/teacher/leaves', data);
    return res.data.data;
  },
};
