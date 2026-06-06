'use client';

import { useEffect, useState } from 'react';
import { X, Users, Clock, Tag, Phone, User } from 'lucide-react';

interface AddPartyModalProps {
  isOpen: boolean;
  mode?: 'add' | 'edit';
  initialValues?: {
    name: string;
    partySize: string;
    waitTime: string;
    type: string;
    phone: string;
  };
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    partySize: number;
    waitTime: number;
    type: string;
    phone?: string;
  }) => Promise<void>;
}

const defaultFormData = {
  name: '',
  partySize: '2',
  waitTime: '15',
  type: 'Walk-in',
  phone: '',
};

const formatIndianPhone = (value: string) => {
  let digits = value.replace(/\D/g, '');

  if (value.trimStart().startsWith('+91') || (digits.startsWith('91') && digits.length > 10)) {
    digits = digits.slice(2);
  }

  digits = digits.slice(0, 10);

  if (!digits) return '';

  return `+91 ${digits.slice(0, 5)}${digits.length > 5 ? ` ${digits.slice(5)}` : ''}`;
};

export default function AddPartyModal({
  isOpen,
  mode = 'add',
  initialValues,
  onClose,
  onSubmit,
}: AddPartyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialValues
          ? { ...initialValues, phone: formatIndianPhone(initialValues.phone) }
          : defaultFormData
      );
      setSubmissionError('');
    }
  }, [initialValues, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'phone' ? formatIndianPhone(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void (async () => {
      setIsSubmitting(true);
      setSubmissionError('');

      try {
        await onSubmit({
          name: formData.name,
          partySize: Number(formData.partySize),
          waitTime: Number(formData.waitTime),
          type: formData.type,
          phone: formData.phone || undefined,
        });
        setFormData(defaultFormData);
        onClose();
      } catch {
        setSubmissionError('Unable to add the party. Check the database connection and try again.');
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">New Party</h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              {mode === 'edit' ? 'Update the party details.' : 'Add a customer to the waitlist.'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} className="sm:size-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Guest Name */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground mb-2">
              <User size={16} className="sm:size-[18px]" />
              Guest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              required
              className="w-full rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Party Size and Wait Time */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground mb-2">
                <Users size={16} className="sm:size-[18px]" />
                <span className="hidden sm:inline">Party Size</span>
                <span className="sm:hidden">Size</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                min="1"
                max="20"
                required
                className="w-full rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground mb-2">
                <Clock size={16} className="sm:size-[18px]" />
                <span className="hidden sm:inline">Wait (min)</span>
                <span className="sm:hidden">Wait</span>
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="waitTime"
                value={formData.waitTime}
                onChange={handleChange}
                min="5"
                max="120"
                required
                className="w-full rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground mb-2">
              <Tag size={16} className="sm:size-[18px]" />
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm text-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option>Walk-in</option>
              <option>Easy Diner</option>
              <option>Zomato</option>
              <option>Swiggy Diner</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground mb-2">
              <Phone size={16} className="sm:size-[18px]" />
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +91 12345 67898"
              pattern="\+91 [6-9][0-9]{4} [0-9]{5}"
              title="Enter a valid 10-digit Indian mobile number"
              maxLength={16}
              required={mode === 'add'}
              className="w-full rounded-lg border border-border px-3 sm:px-4 py-2 sm:py-3 text-sm text-foreground placeholder-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {submissionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {submissionError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 py-2.5 sm:py-3 text-center text-white font-semibold text-sm sm:text-base hover:bg-blue-700 transition-colors mt-4 sm:mt-6 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Add to Queue'}
          </button>
        </form>
      </div>
    </div>
  );
}
