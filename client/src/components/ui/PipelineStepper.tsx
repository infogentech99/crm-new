'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { CheckCircle, FileText, ReceiptText } from 'lucide-react';
import { Button } from '@components/ui/button';
import { LeadStatus } from '@customTypes/index';

const PIPELINE_STEPS = [
  { value: 'new', label: 'New', icon: FileText },
  { value: 'quotation_submitted', label: 'Quotation Issue', icon: FileText },
  { value: 'quotation_approved', label: 'Quotation Approved', icon: FileText },
  { value: 'invoice_issued', label: 'Invoice Issue', icon: ReceiptText },
  { value: 'invoice_accepted', label: 'Invoice Accepted', icon: ReceiptText },
  { value: 'processing_payments', label: 'Processing Payments', icon: ReceiptText },
  { value: 'completed', label: 'Completed', icon: CheckCircle },
];

interface PipelineStepperProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
  onCreateQuotation?: () => void; 
}

export default function PipelineStepper({ currentStatus, onStatusChange, onCreateQuotation }: PipelineStepperProps) {
  const getStatus = (stepValue: string) => {
    const activeIndex = PIPELINE_STEPS.findIndex(s => s.value === currentStatus);
    const currentIndex = PIPELINE_STEPS.findIndex(s => s.value === stepValue);
    if (currentIndex < activeIndex) return 'done';
    if (currentIndex === activeIndex) return 'active';
    return 'pending';
  };

  return (
    <div className="flex flex-col items-center py-10 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex flex-wrap justify-center gap-16 relative">
        {PIPELINE_STEPS.map((step, i) => {
          const status = getStatus(step.value);
          const Icon = step.icon;

          return (
            <div key={step.value} className="relative flex flex-col items-center">
              <div
                onClick={() => onStatusChange(step.value)}
                className={clsx(
                  'w-60 p-6 rounded-2xl border-2 cursor-pointer shadow-xl transition-all text-center group hover:scale-105 hover:shadow-2xl',
                  {
                    'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-700': status === 'active',
                    'bg-gray-50 text-gray-500 border-gray-300': status === 'pending',
                    'bg-green-50 text-green-700 border-green-500': status === 'done',
                  }
                )}
              >
                <Icon className="mx-auto mb-3 w-8 h-8" />
                <div className="font-semibold text-base leading-tight mb-2">{step.label}</div>
                {step.value === 'quotation_submitted' && currentStatus === 'quotation_submitted' && (
                  <Button className="w-full mt-2 text-white bg-green-600 hover:bg-green-700 text-sm py-2"  onClick={onCreateQuotation}>📄 Create Quotation</Button>
                )}
                {step.value === 'invoice_issued' && currentStatus === 'invoice_issued' && (
                  <Button className="w-full mt-2 text-white bg-green-600 hover:bg-green-700 text-sm py-2">🧾 Create Invoice</Button>
                )}
              </div>

              {i < PIPELINE_STEPS.length - 1 && (
                <div
                  className={clsx(
                    'absolute right-[-65px] top-[50%] h-[2px] w-[60px] rounded-full shadow-sm transition-all duration-300',
                    {
                      'bg-blue-500': getStatus(PIPELINE_STEPS[i + 1].value) !== 'pending',
                      'bg-gray-300': getStatus(PIPELINE_STEPS[i + 1].value) === 'pending',
                    }
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}