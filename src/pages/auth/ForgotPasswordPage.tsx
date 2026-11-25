import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [tokenGenerated, setTokenGenerated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
      setTokenGenerated(res.data?.data?.token || null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
          Reset Platform Password
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter your registered institutional or platform email address
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">Reset Link Dispatched</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Password recovery instructions have been recorded for <strong className="text-slate-700">{email}</strong>.
              </p>
              {tokenGenerated && (
                <div className="p-3 bg-slate-50 rounded-lg text-left text-xs font-mono text-slate-600 border border-slate-200 break-all mb-4">
                  Token: {tokenGenerated}
                </div>
              )}
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Return to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-md">{error}</div>}
              <Input
                label="Registered Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
              />
              <Button type="submit" className="w-full" isLoading={loading}>
                Send Recovery Instructions
              </Button>
              <div className="text-center mt-3">
                <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
