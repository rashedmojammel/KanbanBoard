'use client';

import { useState, type FormEvent } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { PasswordInput } from './PasswordInput';
import { getErrorMessage } from '@/lib/error';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const PASSWORD_RULE = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'Enter a valid email address';

  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (!PASSWORD_RULE.test(values.password))
    errors.password = 'Include an uppercase letter, a lowercase letter, and a number';

  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match';

  return errors;
}

export function RegisterForm() {
  const { register } = useAuth();
  const [values, setValues] = useState<FormValues>({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function updateField<K extends keyof FormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    setFormError(null);
    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    try {
      await register(values.name.trim(), values.email.trim(), values.password);
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <FiAlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <FormField label="Full name" htmlFor="name" error={errors.name}>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Jane Doe"
          value={values.name}
          hasError={Boolean(errors.name)}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </FormField>

      <FormField label="Email" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          hasError={Boolean(errors.email)}
          onChange={(e) => updateField('email', e.target.value)}
        />
      </FormField>

      <FormField label="Password" htmlFor="password" error={errors.password}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.password}
          hasError={Boolean(errors.password)}
          onChange={(e) => updateField('password', e.target.value)}
        />
      </FormField>

      <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword}>
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          value={values.confirmPassword}
          hasError={Boolean(errors.confirmPassword)}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
        />
      </FormField>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Create account
      </Button>
    </form>
  );
}
