'use client';

import clsx from 'clsx';
import { Check, CheckCircle, FileText, ReceiptText } from 'lucide-react';
import { Button } from '@components/ui/button';

const PIPELINE_STEPS = [
  { value: 'new', label: 'New Lead', icon: FileText },
  { value: 'quotation_submitted', label: 'Quotation Issued', icon: FileText },
  { value: 'quotation_approved', label: 'Quotation Approved', icon: FileText },
  { value: 'invoice_issued', label: 'Invoice Issued', icon: ReceiptText },
  { value: 'invoice_accepted', label: 'Invoice Accepted', icon: ReceiptText },
  { value: 'processing_payments', label: 'Processing Payments', icon: ReceiptText },
  { value: 'completed', label: 'Project Completed', icon: CheckCircle },
];

interface PipelineStepperProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  onCreateQuotation?: () => void;
  onCreateInvoice?: () => void;
}

export default function PipelineStepper({
  currentStatus,
  onStatusChange,
  onCreateQuotation,
  onCreateInvoice,
}: PipelineStepperProps) {
  const getStatus = (stepValue: string) => {
    const activeIndex = PIPELINE_STEPS.findIndex((s) => s.value === currentStatus);
    const currentIndex = PIPELINE_STEPS.findIndex((s) => s.value === stepValue);
    if (currentIndex < activeIndex) return 'done';
    if (currentIndex === activeIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full py-12 px-4 bg-white border rounded-xl shadow-sm overflow-x-auto">
      <div className="flex items-center justify-between relative max-w-7xl mx-auto">

        {PIPELINE_STEPS.map((step, index) => {
          const status = getStatus(step.value);
          const Icon = step.icon;
          const isLast = index === PIPELINE_STEPS.length - 1;
          const nextStatus = !isLast ? getStatus(PIPELINE_STEPS[index + 1].value) : null;

          return (
            <div key={step.value} className="relative flex flex-col items-center w-40 z-10">
              {/* Connector line to next step */}
              {!isLast && (
                <div
                  className={clsx(
                    'absolute top-5 left-[50%] translate-x-0 h-[3px] w-full transition-all duration-300 z-0',
                    {
                      'bg-green-500': nextStatus === 'done' || nextStatus === 'active',
                      'bg-gray-300': nextStatus === 'pending',
                    }
                  )}
                />
              )}

              {/* Step Circle */}
              <div
                onClick={() => onStatusChange(step.value)}
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all cursor-pointer z-10',
                  {
                    'bg-green-500 text-white': status === 'done',
                    'bg-blue-600 text-white animate-pulse shadow-md shadow-blue-300': status === 'active',
                    'bg-gray-300 text-white': status === 'pending',
                  }
                )}
              >
                {status === 'done' ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              {/* Step Label */}
              <span
                className={clsx('text-sm font-medium text-center', {
                  'text-gray-800': status !== 'pending',
                  'text-gray-400': status === 'pending',
                })}
              >
                {step.label}
              </span>

              {/* Quotation Button */}
              {step.value === 'quotation_submitted' && currentStatus === 'quotation_submitted' && (
                <Button
                  className="mt-2 w-full text-xs bg-green-600 hover:bg-green-700 text-white"
                  onClick={onCreateQuotation}
                >
                  📄 Create Quotation
                </Button>
              )}

              {/* Invoice Button */}
              {step.value === 'invoice_issued' && currentStatus === 'invoice_issued' && (
                <Button
                  className="mt-2 w-full text-xs bg-green-600 hover:bg-green-700 text-white"
                  onClick={onCreateInvoice}
                >
                  🧾 Create Invoice
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
