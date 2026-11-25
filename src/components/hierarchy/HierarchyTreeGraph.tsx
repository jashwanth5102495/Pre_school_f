import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  CheckCircle2,
  Phone,
  Mail,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
  ArrowRight,
  Zap,
  Layers2,
  Pause,
  Play,
  RotateCcw,
  Maximize2,
  Minimize2,
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

interface WireConnection {
  id: string; // allocation id
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  isClassTeacher: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const HierarchyTreeGraph: React.FC<HierarchyTreeGraphProps> = ({
  data,
  onRefresh,
  selectedSchoolId,
  onSelectSchool,
  readOnly = false,
}) => {
  const { user } = useAuthStore();
  const canvasRef = useRef<HTMLDivElement>(null);

  // Panels & Selection
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [addingChildType, setAddingChildType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Canvas Zoom, Pan & Motion State (n8n-style)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isMotionPaused, setIsMotionPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hasMovedRef = useRef(false);

  // Interactive Dragging Wire State (Blender / n8n Nodes style)
  const [draggingWire, setDraggingWire] = useState<{
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  } | null>(null);

  // Active click-to-connect socket (accessible alternative to dragging)
  const [activeSocket, setActiveSocket] = useState<{
    classId: string;
    className: string;
    subjectId: string;
    subjectName: string;
  } | null>(null);

  // Wire hover for disconnect
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [wireConnections, setWireConnections] = useState<WireConnection[]>([]);

  // Form state
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
    className: '',
    classCode: '',
    sections: 'Section A, Section B',
    selectedTeacherId: '',
    isClassTeacher: true,
    sectionName: '',
  });

  const school = data?.school;
  const allSchools = data?.allSchools || [];
  const classes = data?.classes || [];
  const subjects = data?.subjects || [];
  const principals = data?.principals || [];
  const academics = data?.academics || [];
  const finances = data?.finances || [];
  const teachers = data?.teachers || [];
  const students = data?.students || [];

  // Determine permissions
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

  // Filter students
  const filteredStudents = students.filter((s: any) =>
    searchQuery
      ? s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Zoom handlers (matching n8n bottom-left bar)
  const handleZoomIn = () => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.4, +(z - 0.15).toFixed(2)));
  const handleFitAll = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Re-calculate wire positions between sockets
  const updateWirePositions = useCallback(() => {
    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const newWires: WireConnection[] = [];

    classes.forEach((cls: any) => {
      (cls.teacherAllocations || []).forEach((alloc: any) => {
        const subjectId = alloc.subjectId || alloc.subject?.id;
        const teacherId = alloc.teacherId || alloc.teacher?.id;

        const sourceEl =
          document.getElementById(`socket-out-${cls.id}-${subjectId}`) ||
          document.getElementById(`socket-out-${cls.id}`);

        const targetEl =
          document.getElementById(`socket-in-${teacherId}-${subjectId}`) ||
          document.getElementById(`socket-in-${teacherId}`);

        if (sourceEl && targetEl) {
          const sRect = sourceEl.getBoundingClientRect();
          const tRect = targetEl.getBoundingClientRect();

          newWires.push({
            id: alloc.id,
            classId: cls.id,
            className: cls.name,
            subjectId,
            subjectName: alloc.subject?.name || 'Subject',
            teacherId,
            teacherName: alloc.teacher
              ? `${alloc.teacher.firstName} ${alloc.teacher.lastName}`.trim()
              : 'Faculty',
            isClassTeacher: !!alloc.isClassTeacher,
            startX: sRect.left + sRect.width / 2 - canvasRect.left,
            startY: sRect.top + sRect.height / 2 - canvasRect.top,
            endX: tRect.left + tRect.width / 2 - canvasRect.left,
            endY: tRect.top + tRect.height / 2 - canvasRect.top,
          });
        }
      });
    });

    setWireConnections(newWires);
  }, [classes, teachers, zoom, pan]);

  useEffect(() => {
    updateWirePositions();
    const timer = setTimeout(updateWirePositions, 100);
    const handleResize = () => updateWirePositions();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateWirePositions, classes, teachers, zoom, pan]);

  // Smooth Cubic Bezier generator for Blender/n8n style wires
  const calculateBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.max(50, Math.abs(x2 - x1) * 0.45);
    return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
  };

  // Wire Dragging Handlers
  const handleStartDrag = (cls: any, sub: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAllocateTeachers || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const startX = e.clientX - canvasRect.left;
    const startY = e.clientY - canvasRect.top;

    setDraggingWire({
      classId: cls.id,
      className: cls.name,
      subjectId: sub.id,
      subjectName: sub.name,
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
    setActiveSocket(null);
  };

  const handleSocketClick = (cls: any, sub: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canAllocateTeachers) return;
    if (activeSocket?.classId === cls.id && activeSocket?.subjectId === sub.id) {
      setActiveSocket(null);
    } else {
      setActiveSocket({
        classId: cls.id,
        className: cls.name,
        subjectId: sub.id,
        subjectName: sub.name,
      });
    }
  };

  const handleTeacherDrop = (teacher: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const active = draggingWire || activeSocket;
    if (!active || !school?.id) return;

    handleQuickAllocate(active.classId, teacher.id, undefined, active.subjectId, false);
    setDraggingWire(null);
    setActiveSocket(null);
  };

  // Canvas Pointer Handlers (Smooth click-and-drag panning anywhere on canvas)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only accept primary button (left click) or auxiliary (middle click)
    if (e.button !== 0 && e.button !== 1) return;

    const target = e.target as HTMLElement;
    // Don't initiate panning if clicking an interactive control or wire socket
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('textarea') ||
      target.closest('a') ||
      target.closest('[id^="socket-"]') ||
      target.closest('.interactive-action')
    ) {
      return;
    }

    setIsPanning(true);
    hasMovedRef.current = false;
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingWire && canvasRef.current) {
      const canvasRect = canvasRef.current.getBoundingClientRect();
      setDraggingWire((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX - canvasRect.left,
              currentY: e.clientY - canvasRect.top,
            }
          : null
      );
    } else if (isPanning) {
      hasMovedRef.current = true;
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      requestAnimationFrame(updateWirePositions);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isPanning) {
      setIsPanning(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
    if (draggingWire) {
      setDraggingWire(null);
    }
  };

  // Canvas Trackpad / Mouse Wheel Zoom & Pan
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.0015;
      setZoom((z) => Math.min(2.0, Math.max(0.4, +(z + zoomDelta).toFixed(2))));
    } else {
      setPan((prev) => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8,
      }));
    }
  };

  // Quick 1-click Allotment from Wire Drop
  const handleQuickAllocate = async (
    classId: string,
    teacherId: string,
    sectionId?: string,
    subjectId?: string,
    isClassTeacher = false
  ) => {
    if (!school?.id) return;
    try {
      await hierarchyService.allocateTeacher({
        schoolId: school.id,
        classId,
        sectionId,
        teacherId,
        subjectId,
        isClassTeacher,
      });
      onRefresh();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || 'Failed to map teacher to subject');
    }
  };

  // Remove teacher allocation
  const handleRemoveAllocation = async (allocationId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Are you sure you want to unmap this subject allotment wire?')) return;
    try {
      await hierarchyService.deleteAllocation(allocationId, school?.id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect wire');
    }
  };

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

  // Create Staff / Class / Section
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school?.id || !addingChildType) return;

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      if (addingChildType === 'CLASS') {
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

        setFormSuccess(`Class ${formData.className} created with subject endpoints!`);
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
      setFormSuccess(`${addingChildType.replace('_', ' ')} created and synced!`);
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

  // Delete Class
  const handleDeleteClass = async (classId: string, className: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm(`Are you sure you want to delete class ${className}? All endpoints and allotments will be removed.`))
      return;
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

  return (
    <div
      className={`relative w-full select-none transition-all duration-200 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#141414] w-screen h-screen m-0 p-0'
          : 'h-[calc(100vh-215px)] min-h-[800px]'
      }`}
    >
      {/* ========================================================================= */}
      {/* EXPANSIVE INTERACTIVE FLOWCHART CANVAS (OUT-OF-BOX, FREELY MOVABLE)       */}
      {/* ========================================================================= */}
      <div
        ref={canvasRef}
        id="grid-background"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        className={`w-full h-full ${
          isFullscreen ? 'rounded-none border-0' : 'rounded-2xl border border-neutral-800'
        } bg-[#141414] overflow-hidden relative flex flex-col items-center shadow-2xl ${
          isPanning ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Subtle Canvas Dot Grid Pattern matching n8n / user attachment */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 rounded-2xl"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1.2px, transparent 1.2px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Canvas Toolbar */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 relative z-30 pointer-events-auto">
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
            {/* Active wire drag/click helper banner */}
            {(draggingWire || activeSocket) && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 animate-pulse">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  Drop or click on any Teacher node to connect wire!
                </span>
                <button
                  onClick={() => {
                    setDraggingWire(null);
                    setActiveSocket(null);
                  }}
                  className="ml-1 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* School Selector (for Super Admin) */}
            {isSuperAdmin && allSchools.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Tenant:</span>
                <select
                  value={school?.id || ''}
                  onChange={(e) => onSelectSchool?.(e.target.value)}
                  className="text-xs bg-[#242424] border border-[#383838] rounded-xl px-2.5 py-1.5 font-semibold text-white shadow-xs focus:outline-none focus:ring-1 focus:ring-[#eb4438]"
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

        {/* ======================================================================= */}
        {/* SVG BEZIER CABLE OVERLAY (BLENDER / N8N STYLE WIRES)                    */}
        {/* ======================================================================= */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-20 overflow-visible">
          <defs>
            <style>{`
              @keyframes cableFlow {
                from { stroke-dashoffset: 24; }
                to { stroke-dashoffset: 0; }
              }
              .flowing-cable {
                animation: cableFlow 1.2s linear infinite;
              }
            `}</style>
            <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render All Established Connection Wires */}
          {wireConnections.map((wire) => {
            const isHovered = hoveredWireId === wire.id;
            const pathD = calculateBezierPath(wire.startX, wire.startY, wire.endX, wire.endY);
            const midX = (wire.startX + wire.endX) / 2;
            const midY = (wire.startY + wire.endY) / 2;

            return (
              <g key={wire.id} className="pointer-events-auto group/wire">
                {/* Thick invisible hit area for easy hovering */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  onMouseEnter={() => setHoveredWireId(wire.id)}
                  onMouseLeave={() => setHoveredWireId(null)}
                  className="cursor-pointer"
                />

                {/* Outer Glow Highlight */}
                {isHovered && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="6"
                    opacity="0.5"
                    filter="url(#wire-glow)"
                  />
                )}

                {/* Solid Core Cable */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHovered ? '#10b981' : '#eab308'}
                  strokeWidth="2.5"
                  className="transition-colors duration-150"
                />

                {/* Flowing Motion Dashes (Paused when isMotionPaused is true) */}
                {!isMotionPaused && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeDasharray="4 10"
                    opacity="0.85"
                    className="flowing-cable"
                  />
                )}

                {/* Sockets Dots firmly seated on node borders */}
                <circle cx={wire.startX} cy={wire.startY} r="4" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx={wire.endX} cy={wire.endY} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />

                {/* Hover Unlink Midpoint Pill */}
                {isHovered && (
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    onClick={(e) => handleRemoveAllocation(wire.id, e as any)}
                    className="cursor-pointer"
                  >
                    <rect
                      x="-70"
                      y="-12"
                      width="140"
                      height="24"
                      rx="12"
                      fill="#1e1e1e"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      filter="drop-shadow(0 3px 6px rgba(0,0,0,0.5))"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="#f87171"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      ✕ Unlink {wire.subjectName}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Active Live Dragging Wire following Cursor */}
          {draggingWire && (
            <g className="pointer-events-none">
              <path
                d={calculateBezierPath(
                  draggingWire.startX,
                  draggingWire.startY,
                  draggingWire.currentX,
                  draggingWire.currentY
                )}
                fill="none"
                stroke="#eab308"
                strokeWidth="3"
                strokeDasharray="6 6"
                className="flowing-cable"
                filter="url(#wire-glow)"
              />
              <circle cx={draggingWire.startX} cy={draggingWire.startY} r="5" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
              <circle cx={draggingWire.currentX} cy={draggingWire.currentY} r="6" fill="#eab308" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}
        </svg>

        {/* ======================================================================= */}
        {/* ZOOMABLE / PANNABLE HIERARCHY TREE CONTENT CONTAINER                    */}
        {/* ======================================================================= */}
        <div
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: '50% 0',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
          }}
          className="w-full max-w-[1360px] min-w-[1100px] flex flex-col items-center relative z-10 py-2 pointer-events-auto"
        >
          {/* LEVEL 0: SCHOOL TENANT NODE */}
          {!isHeadMaster && !isOfficeAdmin && !isTeacher && (
            <>
              <div
                onClick={() => {
                  if (hasMovedRef.current) return;
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
                  });
                }}
                className={`w-80 p-4 rounded-2xl border transition-all duration-200 bg-[#242424] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 group ${
                  selectedNode?.type === 'SCHOOL'
                    ? 'border-[#eb4438] ring-2 ring-[#eb4438]/20 shadow-md'
                    : 'border-[#383838] hover:border-[#484848]'
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
                    <div className="font-bold text-sm text-white truncate">
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

              {/* Connector line down to Principal with interactive + button */}
              <div className="flex flex-col items-center my-1 relative">
                <div className="w-0.5 h-6 bg-slate-600" />
                {canAddPrincipal && (
                  <button
                    type="button"
                    onClick={() => handleOpenAdd('SCHOOL_ADMIN')}
                    title="Add Admin Principal"
                    className="w-6 h-6 rounded-full bg-[#2c2c2c] border border-slate-500 shadow-sm flex items-center justify-center text-slate-300 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all -my-3 z-20 cursor-pointer active:scale-90"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="w-0.5 h-6 bg-slate-600" />
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
                    onClick={() => {
                      if (hasMovedRef.current) return;
                      setSelectedNode({
                        ...p,
                        type: 'SCHOOL_ADMIN',
                        title: 'Admin Principal Profile',
                        roleTitle: 'Institution Executive Head',
                      });
                    }}
                    className={`w-80 p-4 rounded-2xl border transition-all duration-200 bg-[#242424] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
                      selectedNode?.id === p.id
                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                        : 'border-[#383838]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <School className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold text-blue-400 uppercase">Level 1 • Principal</div>
                        <div className="font-bold text-sm text-white truncate">{p.fullName}</div>
                        <div className="text-[11px] text-slate-400 truncate">{p.email}</div>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))
              ) : (
                <div
                  onClick={() => canAddPrincipal && handleOpenAdd('SCHOOL_ADMIN')}
                  className="w-80 p-4 rounded-2xl border border-dashed border-slate-600 bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>Set Admin Principal</span>
                </div>
              )}

              {/* 3-Pillar Branching Rail: Classes, Faculty, Operations */}
              <div className="w-full flex flex-col items-center my-3 relative">
                <div className="w-0.5 h-6 bg-slate-600" />
                <div className="w-4/5 h-0.5 bg-slate-600" />
                <div className="w-4/5 flex justify-between">
                  <div className="w-0.5 h-6 bg-slate-600" />
                  <div className="w-0.5 h-6 bg-slate-600" />
                  <div className="w-0.5 h-6 bg-slate-600" />
                </div>
              </div>
            </>
          )}

          {/* ===================================================================== */}
          {/* LEVEL 2: 3-PILLAR DECENTRALIZED ARCHITECTURE (CLASSES, TEACHERS, OPS) */}
          {/* ===================================================================== */}
          {!isTeacher && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* ----------------------------------------------------------------- */}
              {/* PILLAR 1: ACADEMIC DIRECTORATE & CLASS NODES (COLS 5/12)           */}
              {/* ----------------------------------------------------------------- */}
              <div className="lg:col-span-5 flex flex-col items-center">
                {/* Academic Directorate Leader Card */}
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Academic Directorate & Curriculum</span>
                </div>

                {academics.length > 0 ? (
                  academics.map((a: any) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        if (hasMovedRef.current) return;
                        setSelectedNode({
                          ...a,
                          type: 'HEAD_MASTER',
                          title: 'Master Academic Profile',
                          roleTitle: 'Academic Director & Curriculum Head',
                        });
                      }}
                      className={`w-full max-w-sm p-3.5 rounded-2xl border transition-all duration-200 bg-[#242424] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
                        selectedNode?.id === a.id
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                          : 'border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-emerald-400 uppercase">Level 2 • Academic Head</div>
                          <div className="font-bold text-xs sm:text-sm text-white truncate">{a.fullName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{a.email}</div>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => canAddAcademic && handleOpenAdd('HEAD_MASTER')}
                    className="w-full max-w-sm p-3 rounded-2xl border border-dashed border-slate-600 bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 hover:border-emerald-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-emerald-500" />
                    <span>Set Master Academic</span>
                  </div>
                )}

                {/* Vertical Rail connecting Academic Head to Class Nodes */}
                <div className="flex flex-col items-center my-2 relative">
                  <div className="w-0.5 h-6 bg-slate-600" />
                </div>

                {/* INDEPENDENT CLASS GRADE NODES (NO OUTER WRAPPER BOX) */}
                <div className="w-full space-y-3.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Class Grade Nodes ({classes.length})</span>
                    </span>
                    {canManageClasses && (
                      <button
                        type="button"
                        onClick={() => handleOpenAdd('CLASS')}
                        className="px-2.5 py-1 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 shadow-xs transition-colors interactive-action"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Class</span>
                      </button>
                    )}
                  </div>

                  {classes.map((cls: any) => {
                    const isSelected = selectedNode?.id === cls.id;
                    const classAllocs = cls.teacherAllocations || [];

                    const classSubs =
                      cls.classSubjects?.length > 0
                        ? cls.classSubjects.map((cs: any) => cs.subject)
                        : subjects.length > 0
                        ? subjects.slice(0, 6)
                        : [
                            { id: 'math', name: 'Mathematics', code: 'MATH-101' },
                            { id: 'phy', name: 'Physics', code: 'PHY-101' },
                            { id: 'eng', name: 'English Literature', code: 'ENG-101' },
                            { id: 'chem', name: 'Chemistry', code: 'CHEM-101' },
                            { id: 'cs', name: 'Computer Science', code: 'CS-101' },
                            { id: 'sst', name: 'Social Studies', code: 'SST-101' },
                          ];

                    return (
                      <div
                        key={cls.id}
                        id={`node-class-${cls.id}`}
                        className={`rounded-2xl border transition-all duration-200 bg-[#252525] p-4 shadow-md relative ${
                          isSelected
                            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                            : 'border-[#383838] hover:border-slate-500'
                        }`}
                      >
                        {/* Class Header */}
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#333]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {cls.code?.slice(0, 3) || 'C'}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-sm text-white truncate">{cls.name}</div>
                              <div className="text-[11px] text-slate-400">
                                {cls.sections?.reduce(
                                  (acc: number, s: any) => acc + (s._count?.students || 0),
                                  0
                                )}{' '}
                                Students • {classSubs.length} Subject Endpoints
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-900/50">
                              {cls.code}
                            </span>
                            {canManageClasses && (
                              <button
                                type="button"
                                onClick={(e) => handleDeleteClass(cls.id, cls.name, e)}
                                title="Delete Class"
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors interactive-action"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Section Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-3">
                          {cls.sections?.map((sec: any) => (
                            <span
                              key={sec.id}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-[#1d1d1d] border border-[#3c3c3c] text-slate-300 font-medium flex items-center gap-1"
                            >
                              <span>{sec.name}</span>
                              <span className="text-[9px] text-slate-500">
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
                              className="text-[10px] px-1.5 py-0.5 rounded-md border border-dashed border-blue-500 text-blue-400 hover:bg-blue-950/30 flex items-center gap-0.5 font-semibold interactive-action"
                            >
                              <Plus className="w-2.5 h-2.5" /> Sec
                            </button>
                          )}
                        </div>

                        {/* Output Sockets (6 Subject Endpoints with right edge sockets) */}
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1">
                            Output Sockets ({classSubs.length})
                          </div>

                          {classSubs.map((sub: any) => {
                            const alloc = classAllocs.find(
                              (a: any) => a.subjectId === sub.id || a.subject?.id === sub.id
                            );
                            const isSocketActive =
                              activeSocket?.classId === cls.id && activeSocket?.subjectId === sub.id;
                            const teacherName = alloc?.teacher
                              ? `${alloc.teacher.firstName} ${alloc.teacher.lastName}`.trim()
                              : 'Faculty';

                            return (
                              <div
                                key={sub.id}
                                className="group/sub flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#1d1d1d] border border-[#363636] hover:border-amber-500/60 transition-colors relative"
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-3">
                                  <span
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                      alloc ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`}
                                  />
                                  <span className="text-[11px] font-medium text-slate-200 truncate">
                                    {sub.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0 pr-3">
                                  {alloc ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 flex items-center gap-1 font-semibold">
                                      <span>{teacherName}</span>
                                      {canAllocateTeachers && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleRemoveAllocation(alloc.id, e)}
                                          title="Disconnect cable"
                                          className="hover:text-red-400 interactive-action"
                                        >
                                          <X className="w-2.5 h-2.5" />
                                        </button>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-[9px] text-slate-500 italic">Drag to map</span>
                                  )}
                                </div>

                                {/* CIRCULAR OUTPUT SOCKET ON RIGHT EDGE */}
                                <div
                                  id={`socket-out-${cls.id}-${sub.id}`}
                                  title="Drag this endpoint dot to connect a wire to a teacher"
                                  onMouseDown={(e) => handleStartDrag(cls, sub, e)}
                                  onClick={(e) => handleSocketClick(cls, sub, e)}
                                  className={`absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#1d1d1d] cursor-crosshair transition-all hover:scale-135 shadow-sm z-30 flex items-center justify-center ${
                                    alloc
                                      ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                                      : isSocketActive
                                      ? 'bg-amber-400 ring-4 ring-amber-400/70 scale-125 animate-pulse'
                                      : 'bg-yellow-400 hover:bg-yellow-300 ring-2 ring-yellow-400/40 animate-pulse'
                                  }`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {classes.length === 0 && (
                    <div
                      onClick={() => canManageClasses && handleOpenAdd('CLASS')}
                      className="p-6 rounded-2xl border border-dashed border-slate-600 text-center text-xs text-slate-400 hover:text-blue-400 hover:border-blue-400 cursor-pointer"
                    >
                      + Create First Academic Class
                    </div>
                  )}
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* PILLAR 2: TEACHING FACULTY STAFF NODES (COLS 4/12)                */}
              {/* ----------------------------------------------------------------- */}
              <div className="lg:col-span-4 flex flex-col items-center">
                {/* Faculty Directorate Header */}
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-400 mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Teaching Faculty Staff</span>
                </div>

                <div className="w-full flex items-center justify-between px-1 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Faculty Teachers ({teachers.length})</span>
                  </span>
                  {canAddTeacher && (
                    <button
                      type="button"
                      onClick={() => handleOpenAdd('TEACHER')}
                      className="px-2.5 py-1 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1 shadow-xs transition-colors interactive-action"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Teacher</span>
                    </button>
                  )}
                </div>

                {/* INDEPENDENT TEACHER NODES (NO OUTER WRAPPER BOX) */}
                <div className="w-full space-y-3.5">
                  {teachers.map((t: any) => {
                    const isSelected = selectedNode?.id === t.id;
                    const isTargetHovered = draggingWire || activeSocket;

                    return (
                      <div
                        key={t.id}
                        id={`node-teacher-${t.id}`}
                        onMouseUp={(e) => handleTeacherDrop(t, e)}
                        onClick={(e) => {
                          if (hasMovedRef.current) return;
                          if (activeSocket || draggingWire) {
                            handleTeacherDrop(t, e);
                          } else {
                            setSelectedNode({
                              ...t,
                              type: 'TEACHER',
                              title: 'Faculty Teacher Profile',
                              roleTitle: 'Classroom Educator & Student Evaluator',
                            });
                          }
                        }}
                        className={`rounded-2xl border transition-all duration-200 bg-[#252525] p-4 shadow-md relative ${
                          isSelected
                            ? 'border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                            : isTargetHovered
                            ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-950/20'
                            : 'border-[#383838] hover:border-slate-500'
                        }`}
                      >
                        {/* CIRCULAR RECEIVING INPUT SOCKET ON LEFT EDGE */}
                        <div
                          id={`socket-in-${t.id}`}
                          title="Drop wire here to allot subject to this teacher"
                          onMouseUp={(e) => handleTeacherDrop(t, e)}
                          className={`absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#252525] cursor-pointer transition-all hover:scale-135 shadow-sm z-30 flex items-center justify-center ${
                            isTargetHovered
                              ? 'bg-amber-400 ring-4 ring-amber-400/80 scale-125 animate-pulse'
                              : t.allocations?.length > 0
                              ? 'bg-emerald-400 ring-2 ring-emerald-400/40'
                              : 'bg-slate-400 hover:bg-amber-400 ring-1 ring-slate-400/40'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a]" />
                        </div>

                        {/* Teacher Header */}
                        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-[#333]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                              {t.fullName?.[0] || 'T'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white truncate">{t.fullName}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {t.teacherCode} • {t.designation || 'Faculty'}
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 shrink-0 border border-rose-900/60">
                            Faculty
                          </span>
                        </div>

                        {/* Connected Subject Wires / Badges */}
                        <div className="space-y-1.5">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            Allotted Subjects ({t.allocations?.length || 0})
                          </div>

                          {t.allocations?.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {t.allocations.map((alloc: any) => (
                                <span
                                  key={alloc.id}
                                  className="text-[10px] pl-2 pr-1.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-semibold flex items-center gap-1.5"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                  <span>
                                    {alloc.class?.name || 'Class'} • {alloc.subject?.name || 'Subject'}
                                  </span>
                                  {canAllocateTeachers && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleRemoveAllocation(alloc.id, e)}
                                      title="Unlink subject wire"
                                      className="hover:text-red-400 p-0.5 interactive-action"
                                    >
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 italic py-1">
                              Drop any class subject wire here to allot
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {teachers.length === 0 && (
                    <div
                      onClick={() => canAddTeacher && handleOpenAdd('TEACHER')}
                      className="p-6 rounded-2xl border border-dashed border-slate-600 text-center text-xs text-slate-400 hover:text-rose-400 hover:border-rose-400 cursor-pointer"
                    >
                      + Add First Teacher Faculty
                    </div>
                  )}
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* PILLAR 3: OPERATIONS & FINANCE (COLS 3/12)                         */}
              {/* ----------------------------------------------------------------- */}
              <div className="lg:col-span-3 flex flex-col items-center">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" />
                  <span>Operations & Finance</span>
                </div>

                {finances.length > 0 ? (
                  finances.map((f: any) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        if (hasMovedRef.current) return;
                        setSelectedNode({
                          ...f,
                          type: 'OFFICE_ADMIN',
                          title: 'Office Finance Profile',
                          roleTitle: 'Finance, Fee Collections & Admissions',
                        });
                      }}
                      className={`w-full p-3.5 rounded-2xl border transition-all duration-200 bg-[#242424] cursor-pointer shadow-sm hover:shadow-md flex items-center justify-between gap-3 ${
                        selectedNode?.id === f.id
                          ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                          : 'border-[#383838]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <Briefcase className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-amber-400 uppercase">Level 2 • Finance</div>
                          <div className="font-bold text-xs sm:text-sm text-white truncate">{f.fullName}</div>
                          <div className="text-[11px] text-slate-400 truncate">{f.email}</div>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => canAddFinance && handleOpenAdd('OFFICE_ADMIN')}
                    className="w-full p-3 rounded-2xl border border-dashed border-slate-600 bg-[#242424] flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 hover:border-amber-400 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-amber-500" />
                    <span>Set Office Finance</span>
                  </div>
                )}

                {/* Sub-connector down into responsibilities */}
                <div className="flex flex-col items-center my-2 relative">
                  <div className="w-0.5 h-6 bg-slate-600" />
                </div>

                {/* SYNCHRONIZED RESPONSIBILITIES CARD */}
                <div className="w-full p-4 rounded-2xl border border-[#383838] bg-[#242424] shadow-xs space-y-2.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Synchronized Responsibilities</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>Student Invoicing:</span>
                    <span className="font-semibold text-emerald-400">Active</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>Digital Records Archival:</span>
                    <span className="font-semibold text-blue-400">S3 Synced</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>Total Classes Managed:</span>
                    <span className="font-semibold text-indigo-400">{classes.length} Classes</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center justify-between">
                    <span>Student Admissions:</span>
                    <span className="font-semibold text-[#eb4438]">{students.length} Enrolled</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEACHER FACULTY VIEW (WHEN LOGGED IN AS TEACHER) */}
          {isTeacher && (
            <div className="w-80 p-4 rounded-2xl border border-rose-500 bg-[#242424] shadow-sm mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-rose-400">Faculty Educator</div>
                  <div className="font-bold text-sm text-white">{user?.fullName}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* LEVEL 4: ENROLLED STUDENTS (CONVERGENT BOTTOMLINE NODE)                */}
          {/* ===================================================================== */}
          <div className="w-full flex flex-col items-center mt-6">
            <div className="flex flex-col items-center my-1 relative">
              <div className="w-0.5 h-6 bg-slate-600" />
              {canAddStudent && (
                <button
                  type="button"
                  onClick={() => handleOpenAdd('STUDENT')}
                  title="Add Enrolled Student"
                  className="w-7 h-7 rounded-full bg-[#2c2c2c] border border-slate-500 shadow-sm flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all -my-3.5 z-20 cursor-pointer active:scale-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <div className="w-0.5 h-6 bg-slate-600" />
            </div>

            {/* Students Container Card */}
            <div className="w-full max-w-4xl rounded-2xl border border-indigo-950/60 bg-[#242424] p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-sm">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Enrolled Students Roster</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-950/50 text-indigo-400 font-semibold border border-indigo-900/60">
                        {students.length} Total
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Synchronized across Principal, Academic, Finance & Faculty
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
                      className="text-xs bg-[#1f1f1f] border border-[#383838] rounded-xl pl-8 pr-2.5 py-1 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36 sm:w-48"
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
                    onClick={() => {
                      if (hasMovedRef.current) return;
                      setSelectedNode({
                        ...s,
                        type: 'STUDENT',
                        title: 'Student Profile',
                        roleTitle: `Enrolled Student • ${s.className} (${s.sectionName})`,
                      });
                    }}
                    className={`p-2.5 rounded-xl border transition-all duration-200 bg-[#292929] cursor-pointer flex items-center justify-between gap-2 ${
                      selectedNode?.id === s.id
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-[#383838] hover:border-indigo-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-950 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {s.fullName?.[0] || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-white truncate">{s.fullName}</div>
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

        {/* ========================================================================= */}
        {/* N8N-STYLE FLOATING CANVAS CONTROLS (EXACTLY MATCHING ATTACHED IMAGE)      */}
        {/* ========================================================================= */}
        <div className="absolute bottom-6 left-6 z-30 flex items-center rounded-2xl bg-[#1c1c1c]/95 backdrop-blur-md border border-[#383838] shadow-2xl px-2 py-1 text-slate-300 select-none">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            className="w-8 h-8 flex items-center justify-center font-bold text-base hover:text-white hover:bg-[#2c2c2c] rounded-xl transition-colors active:scale-95"
          >
            -
          </button>

          <button
            type="button"
            onClick={handleFitAll}
            title="Fit all nodes in view"
            className="px-3 py-1.5 font-semibold text-xs hover:text-white hover:bg-[#2c2c2c] rounded-xl transition-colors border-x border-[#333333] mx-1 active:scale-95 flex items-center gap-1.5"
          >
            <span>Fit all</span>
            <span className="text-[10px] text-slate-500 font-mono">
              {Math.round(zoom * 100)}%
            </span>
          </button>

          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            className="w-8 h-8 flex items-center justify-center font-bold text-base hover:text-white hover:bg-[#2c2c2c] rounded-xl transition-colors active:scale-95"
          >
            +
          </button>

          <div className="w-px h-5 bg-[#333333] mx-1" />

          <button
            type="button"
            onClick={() => setIsMotionPaused(!isMotionPaused)}
            title={isMotionPaused ? 'Resume flowing cable motion' : 'Pause flowing cable motion'}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs hover:text-white hover:bg-[#2c2c2c] rounded-xl transition-colors active:scale-95 text-slate-200"
          >
            {isMotionPaused ? (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                <span>Play motion</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Pause motion</span>
              </>
            )}
          </button>

          <div className="w-px h-5 bg-[#333333] mx-1" />

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Full Screen' : 'Toggle Full Screen Workspace'}
            className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-xs hover:text-white hover:bg-[#2c2c2c] rounded-xl transition-colors active:scale-95 text-slate-200"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT SIDE FLOATING DRAWER: DETAILS & ACTIONS                             */}
      {/* ========================================================================= */}
      {(selectedNode || addingChildType) && (
        <div className="absolute top-4 right-4 bottom-4 w-96 rounded-2xl border border-[#383838] bg-[#1c1c1c]/98 backdrop-blur-md p-5 shadow-2xl z-40 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          {/* 1. ADD MEMBER / CLASS / SECTION FORM VIEW */}
          {addingChildType && (
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-[#383838] mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">
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
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#333333]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-900 text-xs text-red-400">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-900 text-xs text-emerald-400 flex items-center gap-2">
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
                            classCode:
                              formData.classCode ||
                              e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 5),
                          })
                        }
                        placeholder="e.g. Grade 11, Class 6, KG 2"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white font-mono"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
                      />
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white mb-2"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white mb-2"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white"
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
                        className="w-full text-xs px-3 py-2 rounded-xl border border-[#383838] bg-[#1f1f1f] text-white font-mono"
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
              <div className="flex items-center justify-between pb-4 border-b border-[#383838] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#333] flex items-center justify-center font-bold text-white">
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
                      <Layers className="w-5 h-5 text-blue-500" />
                    ) : (
                      <UserCheck className="w-5 h-5 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {selectedNode.fullName || selectedNode.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{selectedNode.roleTitle}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#333333]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detail fields */}
              <div className="space-y-3 text-xs">
                {selectedNode.email && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedNode.email}</span>
                  </div>
                )}
                {selectedNode.phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{selectedNode.phone}</span>
                  </div>
                )}
                {selectedNode.code && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202020]">
                    <span className="text-slate-400">Code / Identifier:</span>
                    <span className="font-mono font-bold text-white">{selectedNode.code}</span>
                  </div>
                )}
                {selectedNode.sections && (
                  <div className="p-2.5 rounded-xl bg-[#202020] space-y-1.5">
                    <span className="text-slate-400 font-semibold block text-[11px]">Enrolled Sections:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedNode.sections.map((sec: any) => (
                        <span
                          key={sec.id}
                          className="px-2 py-0.5 rounded bg-[#333] border border-[#404040] text-[10px] font-medium text-slate-300"
                        >
                          {sec.name} ({sec._count?.students || 0} students)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNode.studentCode && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202020]">
                    <span className="text-slate-400">Student Code:</span>
                    <span className="font-mono font-bold text-white">{selectedNode.studentCode}</span>
                  </div>
                )}
                {selectedNode.className && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202020]">
                    <span className="text-slate-400">Assigned Classroom:</span>
                    <span className="font-semibold text-white">
                      {selectedNode.className} ({selectedNode.sectionName})
                    </span>
                  </div>
                )}
                {selectedNode.designation && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#202020]">
                    <span className="text-slate-400">Designation:</span>
                    <span className="font-semibold text-white">{selectedNode.designation}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[#383838] space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Live System Sync
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
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
                        className="w-full text-red-500 hover:bg-red-950/40 border-red-900/60"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete Class
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteMember(selectedNode.id, selectedNode.type)}
                      className="w-full text-red-500 hover:bg-red-950/40 border-red-900/60"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove Profile
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 border-t border-[#383838] text-center">
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
