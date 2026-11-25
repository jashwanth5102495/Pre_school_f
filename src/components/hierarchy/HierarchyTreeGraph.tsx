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
  Link2,
  Unlink,
  ArrowRight,
  Zap,
  Check,
  AlertCircle,
  Info,
  ChevronDown,
  Award,
  Layers2,
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

  // Interactive Line / Allotment Connection State
  const [connectionMode, setConnectionMode] = useState(false);
  const [activeConnectorSource, setActiveConnectorSource] = useState<{
    type: 'CLASS' | 'TEACHER';
    id: string;
    name: string;
    classId?: string;
    sectionId?: string;
    teacherId?: string;
  } | null>(null);

  const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);
  const [hoveredTeacherId, setHoveredTeacherId] = useState<string | null>(null);
  const [quickAllotClassId, setQuickAllotClassId] = useState<string | null>(null);
  const [quickAllotTeacherId, setQuickAllotTeacherId] = useState<string | null>(null);

  // Form state for creating member / student / class / section
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
    // Class specific
    className: '',
    classCode: '',
    sections: 'Section A, Section B',
    selectedTeacherId: '',
    isClassTeacher: true,
    // Section specific
    sectionName: '',
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
  const canManageClasses = isSuperAdmin || isSchoolAdmin || isHeadMaster || isOfficeAdmin;
  const canAddTeacher = isSuperAdmin || isSchoolAdmin || isHeadMaster;
  const canAllocateTeachers = isSuperAdmin || isSchoolAdmin || isHeadMaster || isOfficeAdmin;
  const canAddStudent = isSuperAdmin || isSchoolAdmin || isHeadMaster || isOfficeAdmin || isTeacher;

  // Filter students based on search query
  const filteredStudents = students.filter((s: any) =>
    searchQuery
      ? s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Open add drawer
  const handleOpenAdd = (type: string, initialClassId?: string) => {
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
      classId: initialClassId || classes[0]?.id || '',
      sectionId: classes.find((c: any) => c.id === (initialClassId || classes[0]?.id))?.sections?.[0]?.id || '',
      firstName: '',
      lastName: '',
      admissionNo: '',
      className: '',
      classCode: '',
      sections: 'Section A, Section B',
      selectedTeacherId: teachers[0]?.id || '',
      isClassTeacher: true,
      sectionName: '',
    });
  };

  // Create Staff / Student
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school?.id || !addingChildType) return;

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (addingChildType === 'CLASS') {
        // Create Class
        const secList = formData.sections
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        const newClass = await hierarchyService.createClass({
          schoolId: school.id,
          name: formData.className,
          code: formData.classCode,
          sections: secList.length > 0 ? secList : ['Section A'],
        });

        // If teacher selected, map them as initial teacher
        if (formData.selectedTeacherId && newClass?.id) {
          const firstSection = newClass.sections?.[0];
          await hierarchyService.allocateTeacher({
            schoolId: school.id,
            classId: newClass.id,
            sectionId: firstSection?.id,
            teacherId: formData.selectedTeacherId,
            isClassTeacher: formData.isClassTeacher,
          });
        }

        setFormSuccess(`Class ${formData.className} created and synchronized!`);
        setTimeout(() => {
          setAddingChildType(null);
          setFormSuccess(null);
          onRefresh();
        }, 800);
        return;
      }

      if (addingChildType === 'SECTION') {
        if (!formData.classId) throw new Error('Please select a class');
        await hierarchyService.createSection({
          schoolId: school.id,
          classId: formData.classId,
          name: formData.sectionName || 'New Section',
        });
        setFormSuccess(`Section ${formData.sectionName} added!`);
        setTimeout(() => {
          setAddingChildType(null);
          setFormSuccess(null);
          onRefresh();
        }, 800);
        return;
      }

      if (addingChildType === 'ALLOCATE') {
        if (!formData.classId || !formData.selectedTeacherId) {
          throw new Error('Please select both a class and a teacher');
        }
        await hierarchyService.allocateTeacher({
          schoolId: school.id,
          classId: formData.classId,
          sectionId: formData.sectionId || undefined,
          teacherId: formData.selectedTeacherId,
          isClassTeacher: formData.isClassTeacher,
        });
        setFormSuccess('Faculty connected to class successfully!');
        setTimeout(() => {
          setAddingChildType(null);
          setFormSuccess(null);
          onRefresh();
        }, 800);
        return;
      }

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
      }, 800);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick 1-click Allotment from Tree
  const handleQuickAllocate = async (classId: string, teacherId: string, sectionId?: string, isClassTeacher = false) => {
    if (!school?.id) return;
    try {
      await hierarchyService.allocateTeacher({
        schoolId: school.id,
        classId,
        sectionId,
        teacherId,
        isClassTeacher,
      });
      setQuickAllotClassId(null);
      setQuickAllotTeacherId(null);
      setActiveConnectorSource(null);
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to map teacher to class');
    }
  };

  // Remove teacher allocation
  const handleRemoveAllocation = async (allocationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to unmap this faculty allotment?')) return;
    try {
      await hierarchyService.deleteAllocation(allocationId, school?.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to unmap allocation');
    }
  };

  // Delete Class
  const handleDeleteClass = async (classId: string, className: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to delete class ${className}? All allotments and sections will be removed.`)) return;
    try {
      await hierarchyService.deleteClass(classId, school?.id);
      if (selectedNode?.id === classId) setSelectedNode(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete class');
    }
  };

  // Delete Member
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

  // Connector click handler (Click-to-Connect feature)
  const handleNodeConnectorClick = (type: 'CLASS' | 'TEACHER', item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAllocateTeachers) return;

    if (!activeConnectorSource) {
      // Start connection
      setActiveConnectorSource({
        type,
        id: item.id,
        name: type === 'CLASS' ? item.name : item.fullName,
        classId: type === 'CLASS' ? item.id : undefined,
        teacherId: type === 'TEACHER' ? item.id : undefined,
      });
      setConnectionMode(true);
    } else if (activeConnectorSource.type !== type) {
      // Complete connection between Class & Teacher!
      const classId = activeConnectorSource.type === 'CLASS' ? activeConnectorSource.id : item.id;
      const teacherId = activeConnectorSource.type === 'TEACHER' ? activeConnectorSource.id : item.id;
      handleQuickAllocate(classId, teacherId, undefined, true);
    } else {
      // Switched selected source to another of same type
      setActiveConnectorSource({
        type,
        id: item.id,
        name: type === 'CLASS' ? item.name : item.fullName,
        classId: type === 'CLASS' ? item.id : undefined,
        teacherId: type === 'TEACHER' ? item.id : undefined,
      });
    }
  };

  // Check if a class and teacher are currently linked
  const isClassConnectedToTeacher = (classItem: any, teacherItem: any) => {
    const classAllocs = classItem?.teacherAllocations || [];
    const teacherAllocs = teacherItem?.allocations || [];
    return (
      classAllocs.some((a: any) => a.teacherId === teacherItem.id || a.teacher?.id === teacherItem.id) ||
      teacherAllocs.some((a: any) => a.classId === classItem.id || a.class?.id === classItem.id)
    );
  };

  return (
    <div className="relative w-full flex flex-col xl:flex-row gap-6 min-h-[680px] select-none">
      {/* ========================================================================= */}
      {/* LEFT / CENTER: VISUAL FLOWCHART GRAPH CANVAS                              */}
      {/* ========================================================================= */}
      <div className="flex-1 rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50/60 dark:bg-[#1a1a1a] p-4 sm:p-6 lg:p-8 overflow-x-auto relative flex flex-col items-center shadow-xs">
        {/* Subtle Canvas Dot Grid Pattern matching user attachment */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20 rounded-2xl"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Canvas Toolbar & Connection Banner */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Institutional Hierarchy Tree
            </span>
            <span className="text-xs text-slate-400">
              {classes.length} Classes • {teachers.length} Faculty • {students.length} Students in Live Sync
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Connector Mode Toggle */}
            {canAllocateTeachers && (
              <button
                type="button"
                onClick={() => {
                  setConnectionMode(!connectionMode);
                  if (connectionMode) setActiveConnectorSource(null);
                }}
                className={`text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                  connectionMode || activeConnectorSource
                    ? 'bg-amber-500 text-white ring-2 ring-amber-500/30'
                    : 'bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] text-slate-700 dark:text-slate-300 hover:text-amber-500'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{connectionMode || activeConnectorSource ? 'Connection Mode Active' : 'Line Connect Mode'}</span>
              </button>
            )}

            {/* School Selector (for Super Admin) */}
            {isSuperAdmin && allSchools.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tenant:</span>
                <select
                  value={school?.id || ''}
                  onChange={(e) => onSelectSchool?.(e.target.value)}
                  className="text-xs bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] rounded-xl px-2.5 py-1.5 font-semibold text-slate-800 dark:text-white shadow-xs focus:outline-none focus:ring-1 focus:ring-[#eb4438]"
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
        </div>

        {/* Live Line Connection Instruction Prompt when active */}
        {activeConnectorSource && (
          <div className="w-full max-w-2xl mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-orange-500/10 border border-amber-400 dark:border-amber-600/50 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 relative z-20 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
              <span className="font-bold">Connecting:</span>
              <span className="font-semibold underline decoration-amber-500 truncate">
                {activeConnectorSource.name} ({activeConnectorSource.type})
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-amber-700 dark:text-amber-300">
                Click any {activeConnectorSource.type === 'CLASS' ? 'Teacher' : 'Class'} to draw line & allot
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveConnectorSource(null)}
              className="p-1 rounded-lg hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[11px] font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* TREE STRUCTURE GRAPH                                                    */}
        {/* ======================================================================= */}
        <div className="flex flex-col items-center w-full max-w-5xl relative z-10 py-2">
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
                      {school?.name || 'Oakridge International'}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {school?.code || 'OAK-2026'} • {school?.board || 'CBSE'}
                    </div>
                  </div>
                </div>
                <Badge variant={school?.status === 'ACTIVE' ? 'success' : 'neutral'} className="uppercase text-[10px]">
                  {school?.status || 'Active'}
                </Badge>
              </div>

              {/* Connector line from School down to Principal with interactive + button */}
              <div className="flex flex-col items-center my-1 relative">
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                {canAddPrincipal && (
                  <button
                    type="button"
                    onClick={() => handleOpenAdd('SCHOOL_ADMIN')}
                    title="Add Admin Principal"
                    className="w-6 h-6 rounded-full bg-white dark:bg-[#2c2c2c] border border-slate-300 dark:border-slate-500 shadow-sm flex items-center justify-center text-slate-500 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all -my-3 z-20 cursor-pointer active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
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
                        roleTitle: 'Institution Executive Head',
                      })
                    }
                    className={`w-80 p-4 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
                      selectedNode?.id === p.id
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-slate-200 dark:border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <School className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-blue-600 uppercase">Level 1 • Principal</div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{p.email}</div>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => canAddPrincipal && handleOpenAdd('SCHOOL_ADMIN')}
                  className="w-80 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Set Admin Principal</span>
                </div>
              )}

              {/* Dual Branching Rail into Academic & Operations */}
              <div className="w-full flex flex-col items-center my-2 relative">
                <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                <div className="w-2/3 h-0.5 bg-slate-300 dark:bg-slate-600" />
                <div className="w-2/3 flex justify-between">
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                </div>
              </div>
            </>
          )}

          {/* ===================================================================== */}
          {/* LEVEL 2: DUAL BRANCHING ARCHITECTURE                                  */}
          {/* ===================================================================== */}
          {!isTeacher && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ----------------------------------------------------------------- */}
              {/* BRANCH A: ACADEMIC LEADERSHIP, CLASSES & FACULTY (COLS 8/12)       */}
              {/* ----------------------------------------------------------------- */}
              <div className="lg:col-span-8 flex flex-col items-center">
                {/* Academic Header & Leader Card */}
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Directorate & Curriculum Leadership</span>
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
                      className={`w-full max-w-md p-3.5 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
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
                          <div className="text-[10px] font-bold text-emerald-600 uppercase">Level 2 • Academic Head</div>
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
                    className="w-full max-w-md p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-emerald-600 hover:border-emerald-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <span>Set Master Academic</span>
                  </div>
                )}

                {/* Sub-connector from Academic to Classes & Teachers */}
                <div className="flex flex-col items-center my-2 relative">
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* --------------------------------------------------------------- */}
                {/* INTERACTIVE ACADEMIC CLASSES & FACULTY ALLOTMENT TIER           */}
                {/* --------------------------------------------------------------- */}
                <div className="w-full rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#232323] p-4 shadow-xs">
                  {/* Tier Subheader with Live Connection instructions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-[#333] mb-4 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                        <Layers2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Classes, Sections & Teacher Allotment Hub</span>
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Create academic classes and connect them with faculty educators directly via lines
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {canManageClasses && (
                        <button
                          type="button"
                          onClick={() => handleOpenAdd('CLASS')}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Class</span>
                        </button>
                      )}
                      {canAddTeacher && (
                        <button
                          type="button"
                          onClick={() => handleOpenAdd('TEACHER')}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Teacher</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dual Grid: Left = Classes & Sections, Right = Teachers with live connectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SUB-COLUMN 1: CLASSES & SECTIONS */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>Classes & Sections ({classes.length})</span>
                        </span>
                        {canManageClasses && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd('CLASS')}
                            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> + New Class
                          </button>
                        )}
                      </div>

                      {classes.map((cls: any) => {
                        const isHovered = hoveredClassId === cls.id;
                        const isSelected = selectedNode?.id === cls.id;
                        const isSourceSelected =
                          activeConnectorSource?.type === 'CLASS' && activeConnectorSource.id === cls.id;
                        const isTargetMatch =
                          activeConnectorSource?.type === 'TEACHER' &&
                          teachers.find((t: any) => t.id === activeConnectorSource.id)?.allocations?.some(
                            (a: any) => a.classId === cls.id
                          );
                        const isConnectedToHoveredTeacher =
                          hoveredTeacherId &&
                          teachers.find((t: any) => t.id === hoveredTeacherId)?.allocations?.some(
                            (a: any) => a.classId === cls.id
                          );

                        // All allocations for this class
                        const classAllocs = cls.teacherAllocations || [];

                        return (
                          <div
                            key={cls.id}
                            onMouseEnter={() => setHoveredClassId(cls.id)}
                            onMouseLeave={() => setHoveredClassId(null)}
                            onClick={() =>
                              setSelectedNode({
                                ...cls,
                                type: 'CLASS',
                                title: `Class Profile: ${cls.name}`,
                                roleTitle: `Academic Grade Level • Code: ${cls.code}`,
                              })
                            }
                            className={`p-3 rounded-xl border transition-all duration-200 bg-slate-50/70 dark:bg-[#282828] cursor-pointer relative group ${
                              isSelected
                                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                                : isSourceSelected
                                ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/5'
                                : isConnectedToHoveredTeacher
                                ? 'border-amber-500 ring-2 ring-amber-500/30'
                                : 'border-slate-200 dark:border-[#383838] hover:border-blue-400'
                            }`}
                          >
                            {/* Class Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {cls.code?.slice(0, 3) || 'C'}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                    {cls.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {cls.sections?.reduce(
                                      (acc: number, s: any) => acc + (s._count?.students || 0),
                                      0
                                    )}{' '}
                                    Students enrolled
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
                                  {cls.code}
                                </span>
                                {canManageClasses && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteClass(cls.id, cls.name, e)}
                                    title="Delete Class"
                                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Section Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                              {cls.sections?.map((sec: any) => (
                                <span
                                  key={sec.id}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-white dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#404040] text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1"
                                >
                                  <span>{sec.name}</span>
                                  <span className="text-[9px] text-slate-400 font-normal">
                                    ({sec._count?.students || 0})
                                  </span>
                                </span>
                              ))}
                              {canManageClasses && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenAdd('SECTION', cls.id);
                                  }}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 flex items-center gap-0.5 font-semibold"
                                >
                                  <Plus className="w-2.5 h-2.5" /> Sec
                                </button>
                              )}
                            </div>

                            {/* Mapped Faculty Badges & Connector Link */}
                            <div className="pt-2 border-t border-slate-200/80 dark:border-[#383838] flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex flex-wrap items-center gap-1 min-w-0">
                                {classAllocs.length > 0 ? (
                                  classAllocs.map((alloc: any) => {
                                    const teacherName = alloc.teacher
                                      ? `${alloc.teacher.firstName} ${alloc.teacher.lastName}`.trim()
                                      : 'Teacher';
                                    return (
                                      <span
                                        key={alloc.id}
                                        title={`${teacherName} (${alloc.section?.name || 'All'} - ${alloc.isClassTeacher ? 'Class Teacher' : 'Teacher'})`}
                                        className="text-[10px] pl-1.5 pr-1 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-medium flex items-center gap-1"
                                      >
                                        <BookOpen className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                        <span className="truncate max-w-[90px]">{teacherName}</span>
                                        {alloc.isClassTeacher && <span className="text-[9px]">★</span>}
                                        {canAllocateTeachers && (
                                          <button
                                            type="button"
                                            onClick={(e) => handleRemoveAllocation(alloc.id, e)}
                                            className="hover:text-red-500 rounded p-0.5"
                                            title="Unmap teacher"
                                          >
                                            <X className="w-2.5 h-2.5" />
                                          </button>
                                        )}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No faculty mapped</span>
                                )}
                              </div>

                              {/* Connect / Map Action Button */}
                              {canAllocateTeachers && (
                                <button
                                  type="button"
                                  onClick={(e) => handleNodeConnectorClick('CLASS', cls, e)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                                    isSourceSelected
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-white dark:bg-[#333] border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:border-amber-400'
                                  }`}
                                >
                                  <Zap className="w-2.5 h-2.5" />
                                  <span>{isSourceSelected ? 'Selected' : 'Map'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {classes.length === 0 && (
                        <div
                          onClick={() => canManageClasses && handleOpenAdd('CLASS')}
                          className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-xs text-slate-400 hover:text-blue-500 hover:border-blue-400 cursor-pointer"
                        >
                          + Create First Academic Class
                        </div>
                      )}
                    </div>

                    {/* SUB-COLUMN 2: TEACHER FACULTY */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>Teaching Faculty ({teachers.length})</span>
                        </span>
                        {canAddTeacher && (
                          <button
                            type="button"
                            onClick={() => handleOpenAdd('TEACHER')}
                            className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-0.5"
                          >
                            <Plus className="w-3 h-3" /> + Add Teacher
                          </button>
                        )}
                      </div>

                      {teachers.map((t: any) => {
                        const isHovered = hoveredTeacherId === t.id;
                        const isSelected = selectedNode?.id === t.id;
                        const isSourceSelected =
                          activeConnectorSource?.type === 'TEACHER' && activeConnectorSource.id === t.id;
                        const isConnectedToHoveredClass =
                          hoveredClassId && t.allocations?.some((a: any) => a.classId === hoveredClassId);

                        return (
                          <div
                            key={t.id}
                            onMouseEnter={() => setHoveredTeacherId(t.id)}
                            onMouseLeave={() => setHoveredTeacherId(null)}
                            onClick={() =>
                              setSelectedNode({
                                ...t,
                                type: 'TEACHER',
                                title: 'Faculty Teacher Profile',
                                roleTitle: 'Classroom Educator & Student Evaluator',
                              })
                            }
                            className={`p-3 rounded-xl border transition-all duration-200 bg-slate-50/70 dark:bg-[#282828] cursor-pointer relative group ${
                              isSelected
                                ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                                : isSourceSelected
                                ? 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/5'
                                : isConnectedToHoveredClass
                                ? 'border-amber-500 ring-2 ring-amber-500/30'
                                : 'border-slate-200 dark:border-[#383838] hover:border-rose-400'
                            }`}
                          >
                            {/* Teacher Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                  {t.fullName?.[0] || 'T'}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                    {t.fullName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 truncate">
                                    {t.teacherCode} • {t.designation || 'Faculty'}
                                  </div>
                                </div>
                              </div>

                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 shrink-0">
                                Faculty
                              </span>
                            </div>

                            {/* Mapped Classes Tags */}
                            <div className="pt-2 border-t border-slate-200/80 dark:border-[#383838] flex flex-wrap items-center justify-between gap-1.5">
                              <div className="flex flex-wrap items-center gap-1 min-w-0">
                                {t.allocations?.length > 0 ? (
                                  t.allocations.map((alloc: any) => (
                                    <span
                                      key={alloc.id}
                                      className="text-[10px] pl-1.5 pr-1 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1"
                                    >
                                      <span>
                                        {alloc.class?.name || 'Class'} ({alloc.section?.name || 'Sec'})
                                      </span>
                                      {canAllocateTeachers && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleRemoveAllocation(alloc.id, e)}
                                          className="hover:text-red-500 rounded p-0.5"
                                          title="Unmap class"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No class allotted</span>
                                )}
                              </div>

                              {/* Connect / Map Action Button */}
                              {canAllocateTeachers && (
                                <button
                                  type="button"
                                  onClick={(e) => handleNodeConnectorClick('TEACHER', t, e)}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors ${
                                    isSourceSelected
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-white dark:bg-[#333] border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:text-amber-600 hover:border-amber-400'
                                  }`}
                                >
                                  <Zap className="w-2.5 h-2.5" />
                                  <span>{isSourceSelected ? 'Selected' : 'Allot'}</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {teachers.length === 0 && (
                        <div
                          onClick={() => canAddTeacher && handleOpenAdd('TEACHER')}
                          className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center text-xs text-slate-400 hover:text-rose-500 hover:border-rose-400 cursor-pointer"
                        >
                          + Add First Teacher Faculty
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* BRANCH B: OPERATIONS & FINANCE (COLS 4/12)                         */}
              {/* ----------------------------------------------------------------- */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
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
                      className={`w-full p-3.5 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#262626] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
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
                          <div className="text-[10px] font-bold text-amber-600 uppercase">Level 2 • Finance</div>
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
                    className="w-full p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-500 hover:text-amber-600 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>Set Office Finance</span>
                  </div>
                )}

                {/* Sub-connector down into responsibilities */}
                <div className="flex flex-col items-center my-2 relative">
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* SYNCHRONIZED RESPONSIBILITIES CARD */}
                <div className="w-full p-4 rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] shadow-xs space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Synchronized Responsibilities</span>
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
                    <span>Total Classes Managed:</span>
                    <span className="font-semibold text-indigo-600">{classes.length} Classes</span>
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
                  <div className="text-[10px] font-bold uppercase text-rose-500">Faculty Educator</div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{user?.fullName}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* LEVEL 4: ENROLLED STUDENTS (CONVERGENT BOTTOMLINE NODE)                */}
          {/* ===================================================================== */}
          <div className="w-full flex flex-col items-center mt-6">
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
            <div className="w-full max-w-4xl rounded-2xl border border-indigo-200 dark:border-indigo-950/60 bg-white dark:bg-[#242424] p-5 shadow-xs">
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
                      className="text-xs bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#383838] rounded-xl pl-8 pr-2.5 py-1 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-48"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
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
                    className={`p-2.5 rounded-xl border transition-all duration-200 bg-slate-50/70 dark:bg-[#292929] cursor-pointer flex items-center justify-between gap-2 ${
                      selectedNode?.id === s.id
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-[#383838] hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {s.fullName?.[0] || 'S'}
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
                    <Badge variant="success" className="text-[9px] px-1.5 py-0.2">
                      Active
                    </Badge>
                  </div>
                ))}

                {filteredStudents.length === 0 && (
                  <div className="col-span-full py-6 text-center text-xs text-slate-400">
                    No enrolled students found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE PANEL: NODE DETAILS & ADD ACTIONS (NON-POPUP SPLIT SCREEN)     */}
      {/* ========================================================================= */}
      {(selectedNode || addingChildType) && (
        <div className="w-full xl:w-96 rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#262626] p-5 shadow-sm shrink-0 flex flex-col justify-between animate-in slide-in-from-right duration-200">
          {/* 1. ADD MEMBER / CLASS / SECTION FORM VIEW */}
          {addingChildType && (
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-[#383838] mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {addingChildType === 'CLASS'
                      ? 'Add Academic Class'
                      : addingChildType === 'SECTION'
                      ? 'Add Section to Class'
                      : `Add ${addingChildType.replace('_', ' ')}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure profile and live synchronize to institutional tree
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
                {/* A. CLASS CREATION FORM */}
                {addingChildType === 'CLASS' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Class Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.className}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            className: e.target.value,
                            classCode: formData.classCode || e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5),
                          })
                        }
                        placeholder="e.g. Grade 11, Class 6, KG 2"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Class Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.classCode}
                        onChange={(e) => setFormData({ ...formData, classCode: e.target.value })}
                        placeholder="e.g. G11, C6, KG2"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Initial Sections (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={formData.sections}
                        onChange={(e) => setFormData({ ...formData, sections: e.target.value })}
                        placeholder="Section A, Section B"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Initial Class Teacher (Optional)
                      </label>
                      <select
                        value={formData.selectedTeacherId}
                        onChange={(e) => setFormData({ ...formData, selectedTeacherId: e.target.value })}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      >
                        <option value="">-- No initial teacher --</option>
                        {teachers.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} ({t.teacherCode})
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : addingChildType === 'SECTION' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Target Class *
                      </label>
                      <select
                        value={formData.classId}
                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
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
                        Section Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.sectionName}
                        onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                        placeholder="e.g. Section C"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#1f1f1f] text-slate-900 dark:text-white"
                      />
                    </div>
                  </>
                ) : addingChildType === 'STUDENT' ? (
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
                  className="w-full bg-[#eb4438] hover:bg-[#d9382d] text-white text-xs py-2.5 rounded-xl font-bold mt-4 shadow-sm"
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
                    ) : selectedNode.type === 'CLASS' ? (
                      <Layers className="w-5 h-5 text-blue-600" />
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
                {selectedNode.code && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-[#202020]">
                    <span className="text-slate-400">Code / Identifier:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      {selectedNode.code}
                    </span>
                  </div>
                )}
                {selectedNode.sections && (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#202020] space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Enrolled Sections:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.sections.map((sec: any) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 rounded bg-white dark:bg-[#333] border border-slate-200 dark:border-[#404040] text-[10px] font-medium"
                        >
                          {sec.name} ({sec._count?.students || 0} students)
                        </span>
                      ))}
                    </div>
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
                <div className="pt-6 flex flex-col gap-2">
                  {selectedNode.type === 'CLASS' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleOpenAdd('SECTION', selectedNode.id)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Section to {selectedNode.name}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDeleteClass(selectedNode.id, selectedNode.name, e)}
                        className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Class
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMember(selectedNode.id, selectedNode.type)}
                      className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove Profile
                    </Button>
                  )}
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
