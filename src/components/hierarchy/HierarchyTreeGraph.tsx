import React, { useState } from 'react';
import {
  Building2,
  Shield,
  School,
  GraduationCap,
  Briefcase,
  BookOpen,
  Users,
  UserCheck,
  Plus,
  X,
  Search,
  Filter,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { hierarchyService, HierarchyMemberInput } from '../../services/hierarchy.service';

interface HierarchyTreeGraphProps {
  data: any;
  onRefresh: () => void;
  selectedSchoolId?: string;
  onSelectSchool?: (schoolId: string) => void;
  readOnly?: boolean;
}

export const HierarchyTreeGraph: React.FC<HierarchyTreeGraphProps> = ({
  data,
  onRefresh,
  selectedSchoolId,
  onSelectSchool,
  readOnly = false,
}) => {
  const { user } = useAuthStore();
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [addingChildType, setAddingChildType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form state for creating member/student
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: 'Password@2026!',
    designation: 'Faculty Teacher',
    classId: '',
    sectionId: '',
    firstName: '',
    lastName: '',
    admissionNo: '',
  });

  const school = data?.school;
  const allSchools = data?.allSchools || [];
  const classes = data?.classes || [];
  const principals = data?.principals || [];
  const academics = data?.academics || [];
  const finances = data?.finances || [];
  const teachers = data?.teachers || [];
  const students = data?.students || [];

  // Determine current user permissions
  const isSuperAdmin = user?.userType === 'PLATFORM';
  const isSchoolAdmin = user?.role === 'SCHOOL_ADMIN';
  const isHeadMaster = user?.role === 'HEAD_MASTER';
  const isOfficeAdmin = user?.role === 'OFFICE_ADMIN';
  const isTeacher = user?.role === 'TEACHER';

  const canAddPrincipal = isSuperAdmin;
  const canAddAcademic = isSuperAdmin || isSchoolAdmin;
  const canAddFinance = isSuperAdmin || isSchoolAdmin;
  const canAddTeacher = isSuperAdmin || isSchoolAdmin || isHeadMaster;
  const canAddStudent = isSuperAdmin || isSchoolAdmin || isHeadMaster || isOfficeAdmin || isTeacher;

  // Filter students based on search query
  const filteredStudents = students.filter((s: any) =>
    searchQuery
      ? s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleOpenAdd = (type: string) => {
    setSelectedNode(null);
    setAddingChildType(type);
    setFormError(null);
    setFormSuccess(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: 'Password@2026!',
      designation: type === 'TEACHER' ? 'Faculty Teacher' : '',
      classId: classes[0]?.id || '',
      sectionId: classes[0]?.sections?.[0]?.id || '',
      firstName: '',
      lastName: '',
      admissionNo: '',
    });
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school?.id || !addingChildType) return;

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const payload: HierarchyMemberInput = {
        schoolId: school.id,
        type: addingChildType as any,
        fullName: formData.fullName,
        firstName: formData.firstName || formData.fullName.split(' ')[0],
        lastName: formData.lastName || formData.fullName.split(' ').slice(1).join(' '),
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        designation: formData.designation,
        classId: formData.classId || undefined,
        sectionId: formData.sectionId || undefined,
        admissionNo: formData.admissionNo,
      };

      await hierarchyService.createMember(payload);
      setFormSuccess(`${addingChildType.replace('_', ' ')} added successfully and synced!`);
      setTimeout(() => {
        setAddingChildType(null);
        setFormSuccess(null);
        onRefresh();
      }, 1000);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || err.message || 'Failed to create member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, type: string) => {
    if (!confirm(`Are you sure you want to remove this ${type.toLowerCase()}?`)) return;
    try {
      await hierarchyService.deleteMember(id, type);
      setSelectedNode(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  return (
    <div className="relative w-full flex flex-col xl:flex-row gap-6 min-h-[640px] select-none">
      {/* ========================================================================= */}
      {/* LEFT / CENTER: VISUAL FLOWCHART GRAPH CANVAS                              */}
      {/* ========================================================================= */}
      <div className="flex-1 rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50/60 dark:bg-[#1a1a1a] p-6 lg:p-8 overflow-x-auto relative flex flex-col items-center shadow-xs">
        {/* Subtle Canvas Dot Grid Pattern matching user attachment */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 rounded-2xl"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Canvas Toolbar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Institutional Hierarchy Tree
            </span>
            <span className="text-xs text-slate-400">
              {data?.stats?.totalStaff || 0} Staff • {data?.stats?.totalStudents || 0} Students in Sync
            </span>
          </div>

          {/* School Selector (for Super Admin) */}
          {isSuperAdmin && allSchools.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tenant:</span>
              <select
                value={school?.id || ''}
                onChange={(e) => onSelectSchool?.(e.target.value)}
                className="text-xs bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] rounded-xl px-3 py-1.5 font-semibold text-slate-800 dark:text-white shadow-xs focus:outline-none focus:ring-1 focus:ring-[#eb4438]"
              >
                {allSchools.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* TREE STRUCTURE                                                          */}
        {/* ======================================================================= */}
        <div className="flex flex-col items-center w-full max-w-4xl relative z-10 py-2">
          {/* LEVEL 0: SCHOOL TENANT NODE */}
          {!isHeadMaster && !isOfficeAdmin && !isTeacher && (
            <>
              <div
                onClick={() =>
                  setSelectedNode({
                    type: 'SCHOOL',
                    title: 'School Tenant Profile',
                    name: school?.name || 'Institution',
                    code: school?.code,
                    roleTitle: 'Institution Tenant Root',
                    schoolId: school?.schoolId,
                    typeDesc: school?.type,
                    board: school?.board,
                    status: school?.status,
                    phone: school?.profile?.primaryPhone,
                    email: school?.profile?.officialEmail,
                    address: `${school?.profile?.city || ''}, ${school?.profile?.state || ''}`,
                  })
                }
                className={`w-80 p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 group ${
                  selectedNode?.type === 'SCHOOL'
                    ? 'border-[#eb4438] ring-2 ring-[#eb4438]/20 shadow-md'
                    : 'border-slate-200 dark:border-[#383838] hover:border-slate-300 dark:hover:border-[#484848]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#eb4438] to-[#b8281d] text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#eb4438] leading-tight">
                      Level 0 • School Tenant
                    </div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {school?.name || 'School Profile'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {school?.schoolId} • {school?.board}
                    </div>
                  </div>
                </div>
                <Badge variant={school?.status === 'ACTIVE' ? 'success' : 'neutral'}>
                  {school?.status || 'ACTIVE'}
                </Badge>
              </div>

              {/* Vertical Connector Line with Circular '+' Add Button */}
              <div className="flex flex-col items-center my-1 relative">
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600" />
                {canAddPrincipal && principals.length === 0 && (
                  <button
                    type="button"
                    onClick={() => handleOpenAdd('SCHOOL_ADMIN')}
                    title="Add Admin Principal"
                    className="w-7 h-7 rounded-full bg-white dark:bg-[#2c2c2c] border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#eb4438] hover:border-[#eb4438] transition-all -my-3.5 z-20 cursor-pointer active:scale-90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-600" />
              </div>
            </>
          )}

          {/* LEVEL 1: ADMIN PRINCIPAL NODE */}
          {!isHeadMaster && !isOfficeAdmin && !isTeacher && (
            <>
              {principals.length > 0 ? (
                principals.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() =>
                      setSelectedNode({
                        ...p,
                        type: 'SCHOOL_ADMIN',
                        title: 'Admin Principal Profile',
                        roleTitle: 'School Principal & Campus Governance',
                      })
                    }
                    className={`w-80 p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 group ${
                      selectedNode?.id === p.id
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 dark:border-[#383838] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <School className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-500 leading-tight">
                          Level 1 • Principal
                        </div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {p.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">{p.email}</div>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => canAddPrincipal && handleOpenAdd('SCHOOL_ADMIN')}
                  className="w-80 p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-500 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Set Admin Principal Profile</span>
                </div>
              )}

              {/* Branching Connector Bar to Level 2 (Academic & Finance) */}
              <div className="w-full flex flex-col items-center my-1 relative">
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                {/* Horizontal T-Bar connecting the two branches */}
                <div className="w-[420px] max-w-full h-0.5 bg-slate-300 dark:bg-slate-600 relative">
                  <div className="absolute left-0 top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                  <div className="absolute right-0 top-0 w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                </div>
              </div>
            </>
          )}

          {/* LEVEL 2: DUAL BRANCHES (MASTER ACADEMIC & OFFICE FINANCE) */}
          {!isTeacher && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-2xl my-2">
              {/* BRANCH A: MASTER ACADEMIC (HEAD MASTER) */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Academic Branch</span>
                </div>

                {academics.length > 0 ? (
                  academics.map((a: any) => (
                    <div
                      key={a.id}
                      onClick={() =>
                        setSelectedNode({
                          ...a,
                          type: 'HEAD_MASTER',
                          title: 'Master Academic Profile',
                          roleTitle: 'Academic Director & Curriculum Head',
                        })
                      }
                      className={`w-full p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
                        selectedNode?.id === a.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-slate-200 dark:border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-emerald-600 uppercase">
                            Level 2 • Academic
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {a.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{a.email}</div>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => canAddAcademic && handleOpenAdd('HEAD_MASTER')}
                    className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <span>Set Master Academic</span>
                  </div>
                )}

                {/* Sub-connector from Academic to Teacher Faculty */}
                <div className="flex flex-col items-center my-2 relative">
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                  {canAddTeacher && (
                    <button
                      type="button"
                      onClick={() => handleOpenAdd('TEACHER')}
                      title="Add Teacher Faculty"
                      className="w-6 h-6 rounded-full bg-white dark:bg-[#2c2c2c] border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center text-slate-500 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-all -my-3 z-20 cursor-pointer active:scale-90"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* TEACHER FACULTY NODES */}
                <div className="w-full space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center justify-between px-1">
                    <span>Teacher Faculty ({teachers.length})</span>
                    {canAddTeacher && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd('TEACHER')}
                        className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" /> Add Teacher
                      </button>
                    )}
                  </div>

                  {teachers.map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() =>
                        setSelectedNode({
                          ...t,
                          type: 'TEACHER',
                          title: 'Faculty Teacher Profile',
                          roleTitle: 'Classroom Educator & Student Evaluator',
                        })
                      }
                      className={`w-full p-3 rounded-xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-xs hover:shadow-sm flex items-center justify-between gap-2.5 ${
                        selectedNode?.id === t.id
                          ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                          : 'border-slate-200 dark:border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {t.fullName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {t.teacherCode} • {t.designation}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 shrink-0">
                        Faculty
                      </span>
                    </div>
                  ))}

                  {teachers.length === 0 && (
                    <div
                      onClick={() => canAddTeacher && handleOpenAdd('TEACHER')}
                      className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-[11px] text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      + Add First Teacher
                    </div>
                  )}
                </div>
              </div>

              {/* BRANCH B: OFFICE FINANCE (OFFICE ADMIN) */}
              <div className="flex flex-col items-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Operations & Finance</span>
                </div>

                {finances.length > 0 ? (
                  finances.map((f: any) => (
                    <div
                      key={f.id}
                      onClick={() =>
                        setSelectedNode({
                          ...f,
                          type: 'OFFICE_ADMIN',
                          title: 'Office Finance Profile',
                          roleTitle: 'Finance, Fee Collections & Admissions',
                        })
                      }
                      className={`w-full p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
                        selectedNode?.id === f.id
                          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                          : 'border-slate-200 dark:border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-amber-600 uppercase">
                            Level 2 • Finance
                          </div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {f.fullName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{f.email}</div>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => canAddFinance && handleOpenAdd('OFFICE_ADMIN')}
                    className="w-full p-3.5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-amber-600 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>Set Office Finance</span>
                  </div>
                )}

                {/* Sub-connector from Finance to Admissions & Records */}
                <div className="flex flex-col items-center my-2 relative">
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* OPERATIONS & ADMISSION REPOSITORIES */}
                <div className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] shadow-xs space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Synchronized Responsibilities
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Student Invoicing:</span>
                    <span className="font-semibold text-emerald-600">Active</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Digital Records Archival:</span>
                    <span className="font-semibold text-blue-600">S3 Synced</span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Student Admissions:</span>
                    <span className="font-semibold text-[#eb4438]">{students.length} Enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEACHER FACULTY VIEW (WHEN LOGGED IN AS TEACHER) */}
          {isTeacher && (
            <div className="w-80 p-4 rounded-2xl border border-rose-500 bg-white dark:bg-[#262626] shadow-sm mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-rose-500">
                    Faculty Educator
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {user?.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL 4: ENROLLED STUDENTS (CONVERGENT BOTTOMLINE NODE) */}
          <div className="w-full flex flex-col items-center mt-4">
            {/* Connector into Students */}
            <div className="flex flex-col items-center my-1 relative">
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
              {canAddStudent && (
                <button
                  type="button"
                  onClick={() => handleOpenAdd('STUDENT')}
                  title="Add Enrolled Student"
                  className="w-7 h-7 rounded-full bg-white dark:bg-[#2c2c2c] border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center text-slate-500 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all -my-3.5 z-20 cursor-pointer active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
            </div>

            {/* Students Container Card */}
            <div className="w-full max-w-2xl rounded-2xl border border-indigo-200 dark:border-indigo-950/60 bg-white dark:bg-[#242424] p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Enrolled Students Roster</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold">
                        {students.length} Total
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Managed by Faculty & synchronized across Principal, Academic & Finance
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="text-xs bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#383838] rounded-xl pl-8 pr-2.5 py-1 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-44"
                    />
                  </div>

                  {canAddStudent && (
                    <Button
                      size="sm"
                      onClick={() => handleOpenAdd('STUDENT')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-7.5 px-2.5"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Student
                    </Button>
                  )}
                </div>
              </div>

              {/* Student Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {filteredStudents.map((s: any) => (
                  <div
                    key={s.id}
                    onClick={() =>
                      setSelectedNode({
                        ...s,
                        type: 'STUDENT',
                        title: 'Student Profile',
                        roleTitle: `Enrolled Student • ${s.className} (${s.sectionName})`,
                      })
                    }
                    className={`p-3 rounded-xl border transition-all duration-150 bg-slate-50/60 dark:bg-[#282828] cursor-pointer flex items-center justify-between gap-2 hover:bg-white dark:hover:bg-[#303030] ${
                      selectedNode?.id === s.id
                        ? 'border-indigo-500 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {s.fullName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {s.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {s.studentCode} • {s.className} ({s.sectionName})
                        </div>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="col-span-2 py-6 text-center text-xs text-slate-400">
                    {searchQuery
                      ? 'No students matching search filter'
                      : 'No students enrolled yet. Click "+ Add Student" above.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE: ON-SCREEN INTEGRATED DETAILS / ADD MEMBER PANEL (NO POPUP!)   */}
      {/* ========================================================================= */}
      {(selectedNode || addingChildType) && (
        <div className="w-full xl:w-96 rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] p-6 shadow-sm flex flex-col justify-between shrink-0 animate-in fade-in slide-in-from-right-4 duration-200">
          {/* 1. ADD MEMBER FORM */}
          {addingChildType && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#383838] mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add {addingChildType.replace('_', ' ')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set profile and synchronize to institutional hierarchy
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddingChildType(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#333333]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateMember} className="space-y-3.5">
                {addingChildType === 'STUDENT' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          placeholder="e.g. Aarav"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          placeholder="e.g. Sharma"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Class & Section *
                      </label>
                      <select
                        value={formData.classId}
                        onChange={(e) => {
                          const c = classes.find((cls: any) => cls.id === e.target.value);
                          setFormData({
                            ...formData,
                            classId: e.target.value,
                            sectionId: c?.sections?.[0]?.id || '',
                          });
                        }}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white mb-2"
                      >
                        {classes.map((cls: any) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name} ({cls.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Student Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="student@school.edu"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Parent Contact Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="e.g. Dr. Arthur Pendelton"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Official Institutional Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@oakridge.example.edu"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>

                    {addingChildType === 'TEACHER' && (
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                          Teaching Designation
                        </label>
                        <input
                          type="text"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          placeholder="e.g. Senior Mathematics Teacher"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Temporary Password
                      </label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#eb4438] hover:bg-[#d9382d] text-white text-xs py-2.5 rounded-xl font-bold mt-4"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>Saving & Synchronizing...</span>
                    </>
                  ) : (
                    <span>Add to Institutional Hierarchy</span>
                  )}
                </Button>
              </form>
            </div>
          )}

          {/* 2. NODE PROFILE DETAILS VIEW */}
          {selectedNode && !addingChildType && (
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#383838] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#333] flex items-center justify-center font-bold text-slate-800 dark:text-white">
                    {selectedNode.type === 'SCHOOL' ? (
                      <Building2 className="w-5 h-5 text-[#eb4438]" />
                    ) : selectedNode.type === 'SCHOOL_ADMIN' ? (
                      <School className="w-5 h-5 text-blue-500" />
                    ) : selectedNode.type === 'HEAD_MASTER' ? (
                      <GraduationCap className="w-5 h-5 text-emerald-500" />
                    ) : selectedNode.type === 'OFFICE_ADMIN' ? (
                      <Briefcase className="w-5 h-5 text-amber-500" />
                    ) : selectedNode.type === 'TEACHER' ? (
                      <BookOpen className="w-5 h-5 text-rose-500" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {selectedNode.fullName || selectedNode.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{selectedNode.roleTitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#333333]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail fields */}
              <div className="space-y-3 text-xs">
                {selectedNode.email && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedNode.email}</span>
                  </div>
                )}
                {selectedNode.phone && (
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedNode.phone}</span>
                  </div>
                )}
                {selectedNode.studentCode && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#202020]">
                    <span className="text-slate-400">Student Code:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      {selectedNode.studentCode}
                    </span>
                  </div>
                )}
                {selectedNode.className && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#202020]">
                    <span className="text-slate-400">Assigned Classroom:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedNode.className} ({selectedNode.sectionName})
                    </span>
                  </div>
                )}
                {selectedNode.designation && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#202020]">
                    <span className="text-slate-400">Designation:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedNode.designation}
                    </span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 dark:border-[#383838] space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live System Sync
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Database Synchronized across all Portals</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!readOnly && selectedNode.type !== 'SCHOOL' && (
                <div className="pt-6 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMember(selectedNode.id, selectedNode.type)}
                    className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove Profile
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-[#383838] text-center">
            <span className="text-[10px] text-slate-400">
              Smart Edu Multi-Tenant Organizational Graph
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTreeGraph;
