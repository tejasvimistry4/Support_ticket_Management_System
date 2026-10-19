import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  UserPlus,
  AlertCircle,
  ShieldCheck,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, Alert } from '../../components/common';
import { validateRegisterForm } from '../../utils';
import { ROUTES } from '../../routes/RouteConstants';
import type { Role } from '../../types/auth';

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'SUPPORT_AGENT' as Role,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (error) {
      clearAuthError();
    }
  };

  const handleRoleSelect = (role: Role) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const res = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      toast.success(`Account registered! Welcome, ${res.user.name}`);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create Account
        </h2>
        <p className="text-sm text-slate-500">
          Sign up to begin resolving tickets or managing team operations.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Registration failed:">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Full Name"
          type="text"
          name="name"
          placeholder="e.g. Jane Doe"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          leftIcon={<UserIcon className="h-4 w-4" />}
          error={formErrors.name}
          disabled={isLoading}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="jane@company.com"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          leftIcon={<Mail className="h-4 w-4" />}
          error={formErrors.email}
          disabled={isLoading}
        />

        <Input
          label="Password"
          isPassword
          name="password"
          placeholder="At least 6 characters"
          autoComplete="new-password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          error={formErrors.password}
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          isPassword
          name="confirmPassword"
          placeholder="Re-enter password"
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          error={formErrors.confirmPassword}
          disabled={isLoading}
        />

        <div className="space-y-2 pt-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Account Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              type="button"
              variant="unstyled"
              onClick={() => handleRoleSelect('SUPPORT_AGENT')}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer ${formData.role === 'SUPPORT_AGENT'
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${formData.role === 'SUPPORT_AGENT'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                  }`}
              >
                <Headphones className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Support Agent</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Handles assigned tickets and customer updates.
                </p>
              </div>
            </Button>

            <Button
              type="button"
              variant="unstyled"
              onClick={() => handleRoleSelect('ADMIN')}
              className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition cursor-pointer ${formData.role === 'ADMIN'
                  ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-200 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${formData.role === 'ADMIN'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                  }`}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Administrator</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Full system control and user management.
                </p>
              </div>
            </Button>
          </div>
        </div>

        <div className="pt-3">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<UserPlus className="h-4 w-4" />}
            className="w-full"
          >
            Create Account & Sign In
          </Button>
        </div>
      </form>

      <div className="pt-2 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
