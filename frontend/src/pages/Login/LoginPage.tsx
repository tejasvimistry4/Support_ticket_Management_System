import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { Input, Button, Alert } from '../../components/common';
import { validateLoginForm } from '../../utils';
import { ROUTES } from '../../routes/RouteConstants';

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    ROUTES.DASHBOARD;

  const stateEmail =
    (location.state as { registeredEmail?: string; email?: string })
      ?.registeredEmail ||
    (location.state as { registeredEmail?: string; email?: string })?.email ||
    '';

  const [formData, setFormData] = useState({
    email: stateEmail,
    password: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (stateEmail) {
      setFormData((prev) => ({ ...prev, email: stateEmail }));
    }
  }, [stateEmail]);

  const handleInputChange = (field: 'email' | 'password', value: string) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateLoginForm(formData);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    try {
      const res = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      toast.success(`Welcome back, ${res.user.name}!`);
      navigate(from, { replace: true });
    } catch {
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-left">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Sign In
        </h2>
        <p className="text-sm text-slate-500">
          Enter your registered credentials to access your support dashboard.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Authentication failed:">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="name@example.com"
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
          placeholder="••••••••"
          autoComplete="current-password"
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          leftIcon={<Lock className="h-4 w-4" />}
          error={formErrors.password}
          disabled={isLoading}
        />

        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<LogIn className="h-4 w-4" />}
            className="w-full"
          >
            Sign In to Dashboard
          </Button>
        </div>
      </form>

      <div className="pt-2 text-center text-sm text-slate-500">
        Don&apos;t have an account yet?{' '}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
