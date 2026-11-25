import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schoolPortalService } from '../../services/school-portal.service';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { FileSpreadsheet, Send, Save, CheckCircle2, Award, AlertCircle } from 'lucide-react';

export const InternalMarksEntryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedExamSubjectId, setSelectedExamSubjectId] = useState('');
  const [marksState, setMarksState] = useState<any[]>([]);
  const [comments, setComments] = useState('');
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  // Get exam subjects matching teacher's subjects
  const { data: examSubjects, isLoading: isSubjectsLoading } = useQuery({
    queryKey: ['teacher-exam-subjects'],
    queryFn: () => schoolPortalService.getExamSubjectsForTeacher(),
  });

  // Default first exam subject
  useEffect(() => {
    if (examSubjects && examSubjects.length > 0 && !selectedExamSubjectId) {
      setSelectedExamSubjectId(examSubjects[0].id);
    }
  }, [examSubjects, selectedExamSubjectId]);

  // Fetch marks sheet
  const { data: sheetData, isLoading: isSheetLoading } = useQuery({
    queryKey: ['teacher-marks-sheet', selectedExamSubjectId],
    queryFn: () => schoolPortalService.getMarksSheet(selectedExamSubjectId),
    enabled: !!selectedExamSubjectId,
  });

  // Sync marksState
  useEffect(() => {
    if (sheetData?.roster) {
      setMarksState(
        sheetData.roster.map((s: any) => ({
          studentId: s.studentId,
          studentCode: s.studentCode,
          studentName: s.studentName,
          sectionName: s.sectionName,
          marksObtained: s.marksObtained !== undefined && s.marksObtained !== '' ? s.marksObtained : '',
          grade: s.grade || '',
          remarks: s.remarks || '',
        }))
      );
    }
  }, [sheetData]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => schoolPortalService.saveMarks(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-marks-sheet'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      const msg = res.submittedForReview
        ? 'Marks successfully submitted to Head Master for official review!'
        : 'Draft marks saved successfully!';
      setIsSuccessMessage(msg);
      setTimeout(() => setIsSuccessMessage(null), 5000);
    },
  });

  const handleScoreChange = (studentId: string, val: string) => {
    const maxMarks = sheetData?.examSubject?.maxMarks || 100;
    const score = parseFloat(val);
    let grade = '';
    if (!isNaN(score)) {
      const pct = (score / maxMarks) * 100;
      if (pct >= 90) grade = 'A+';
      else if (pct >= 80) grade = 'A';
      else if (pct >= 70) grade = 'B+';
      else if (pct >= 60) grade = 'B';
      else if (pct >= 50) grade = 'C';
      else if (pct >= 35) grade = 'D';
      else grade = 'F';
    }

    setMarksState((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, marksObtained: val, grade } : s))
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setMarksState((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, remarks } : s))
    );
  };

  const handleSave = (submitForReview: boolean) => {
    const validMarks = marksState.filter((s) => s.marksObtained !== '');
    if (validMarks.length === 0) {
      alert('Please enter at least one student score.');
      return;
    }

    saveMutation.mutate({
      examSubjectId: selectedExamSubjectId,
      marks: validMarks.map((m) => ({
        studentId: m.studentId,
        marksObtained: Number(m.marksObtained),
        remarks: m.remarks || undefined,
      })),
      submitForReview,
      comments: comments || undefined,
    });
  };

  const currentExamSub = sheetData?.examSubject;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> Internal Marks Entry &amp; Exam Grading Sheet
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Input assessment marks, auto-compute letter grades, and submit to Head Master for official publication
          </p>
        </div>
      </div>

      {isSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{isSuccessMessage}</span>
        </div>
      )}

      {/* Exam Subject Selector Bar */}
      <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700">Exam Subject:</span>
          <select
            value={selectedExamSubjectId}
            onChange={(e) => setSelectedExamSubjectId(e.target.value)}
            className="p-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          >
            {examSubjects?.map((es: any) => (
              <option key={es.id} value={es.id}>
                {es.exam?.name} &middot; {es.class?.name} - {es.subject?.name}
              </option>
            ))}
          </select>
        </div>

        {currentExamSub && (
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>
              Max Marks: <strong className="text-slate-900">{currentExamSub.maxMarks}</strong>
            </span>
            <span>
              Pass Marks: <strong className="text-slate-900">{currentExamSub.passMarks}</strong>
            </span>
            {sheetData?.submission && (
              <Badge variant="brand" className="text-[10px] font-semibold">
                Submission: {sheetData.submission.status}
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Marks Entry Roster */}
      <Card className="overflow-hidden">
        {isSheetLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : marksState.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-3 px-4 font-semibold">Student Code</th>
                  <th className="py-3 px-4 font-semibold">Student Name</th>
                  <th className="py-3 px-4 font-semibold">Section</th>
                  <th className="py-3 px-4 font-semibold w-32">Marks Obtained</th>
                  <th className="py-3 px-4 font-semibold">Calculated Grade</th>
                  <th className="py-3 px-4 font-semibold">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {marksState.map((stu) => (
                  <tr key={stu.studentId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                      {stu.studentCode}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {stu.studentName}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      Section {stu.sectionName}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max={currentExamSub?.maxMarks || 100}
                        value={stu.marksObtained}
                        onChange={(e) => handleScoreChange(stu.studentId, e.target.value)}
                        placeholder={`0-${currentExamSub?.maxMarks || 100}`}
                        className="w-24 p-1.5 rounded-lg border border-slate-200 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                        stu.grade === 'A+' || stu.grade === 'A'
                          ? 'bg-emerald-100 text-emerald-700'
                          : stu.grade === 'B+' || stu.grade === 'B'
                          ? 'bg-blue-100 text-blue-700'
                          : stu.grade === 'C' || stu.grade === 'D'
                          ? 'bg-amber-100 text-amber-700'
                          : stu.grade === 'F'
                          ? 'bg-rose-100 text-rose-700'
                          : 'text-slate-300'
                      }`}>
                        {stu.grade || '--'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        value={stu.remarks}
                        onChange={(e) => handleRemarksChange(stu.studentId, e.target.value)}
                        placeholder="e.g. Excellent analytical steps"
                        className="w-full p-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No students found for this examination subject.
          </div>
        )}
      </Card>

      {/* Submission Actions */}
      <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/2">
          <input
            type="text"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Notes / Moderation comments for Head Master..."
            className="w-full p-2 rounded-xl border border-slate-200 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSave(false)}
            isLoading={saveMutation.isPending}
            className="text-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Draft
          </Button>

          <Button
            type="button"
            onClick={() => handleSave(true)}
            isLoading={saveMutation.isPending}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Submit for Head Master Review
          </Button>
        </div>
      </Card>
    </div>
  );
};
