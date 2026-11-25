import apiClient from './api';

export interface HierarchyMemberInput {
  schoolId: string;
  type: 'SCHOOL_ADMIN' | 'HEAD_MASTER' | 'OFFICE_ADMIN' | 'TEACHER' | 'STUDENT';
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  designation?: string;
  classId?: string;
  sectionId?: string;
  admissionNo?: string;
  studentCode?: string;
  teacherCode?: string;
}

export const hierarchyService = {
  async getTree(schoolId?: string) {
    const params = schoolId ? { schoolId } : {};
    const res = await apiClient.get('/hierarchy/tree', { params });
    return res.data.data;
  },

  async createMember(data: HierarchyMemberInput) {
    const res = await apiClient.post('/hierarchy/members', data);
    return res.data.data;
  },

  async updateMember(id: string, type: string, data: any) {
    const res = await apiClient.patch(`/hierarchy/members/${id}?type=${type}`, data);
    return res.data.data;
  },

  async deleteMember(id: string, type: string) {
    const res = await apiClient.delete(`/hierarchy/members/${id}?type=${type}`);
    return res.data.data;
  },

  async createClass(data: { schoolId: string; name: string; code?: string; sections?: string[] }) {
    const res = await apiClient.post('/hierarchy/classes', data);
    return res.data.data;
  },

  async createSection(data: { schoolId: string; classId: string; name: string; capacity?: number }) {
    const res = await apiClient.post('/hierarchy/sections', data);
    return res.data.data;
  },

  async deleteClass(classId: string, schoolId?: string) {
    const params = schoolId ? { schoolId } : {};
    const res = await apiClient.delete(`/hierarchy/classes/${classId}`, { params });
    return res.data.data;
  },

  async allocateTeacher(data: {
    schoolId: string;
    teacherId: string;
    classId: string;
    sectionId?: string;
    subjectId?: string;
    isClassTeacher?: boolean;
  }) {
    const res = await apiClient.post('/hierarchy/allocate', data);
    return res.data.data;
  },

  async deleteAllocation(allocationId: string, schoolId?: string) {
    const params = schoolId ? { schoolId } : {};
    const res = await apiClient.delete(`/hierarchy/allocate/${allocationId}`, { params });
    return res.data.data;
  },

  async addSubjectToClass(classId: string, subjectId: string, schoolId?: string) {
    const res = await apiClient.post(`/hierarchy/classes/${classId}/subjects`, { subjectId, schoolId });
    return res.data.data;
  },

  async removeSubjectFromClass(classId: string, subjectId: string, schoolId?: string) {
    const params = schoolId ? { schoolId } : {};
    const res = await apiClient.delete(`/hierarchy/classes/${classId}/subjects/${subjectId}`, { params });
    return res.data.data;
  },
};
