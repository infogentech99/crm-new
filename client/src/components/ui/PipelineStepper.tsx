'use client';

import clsx from 'clsx';
import { Check, CheckCheck, CheckCircle, CheckLine, FilePen, FileText, HandCoins, ReceiptText, X } from 'lucide-react';
import { Button } from '@components/ui/button';
import { RootState } from '@store/store';
import { useSelector } from 'react-redux';

const MAIN_PIPELINE_STEPS = [
  { value: 'new', label: 'New Lead', icon: FileText },
  { value: 'quotation_submitted', label: 'Quotation Issued', icon: FileText },
  { value: 'quotation_approved', label: 'Quotation Approved', icon: CheckLine },
  { value: 'invoice_issued', label: 'Invoice Issued', icon: ReceiptText },
  { value: 'invoice_accepted', label: 'Invoice Accepted', icon: CheckCheck  },
  { value: 'processing_payments', label: 'Processing Payments', icon: HandCoins },
  { value: 'payments_complete', label: 'Payment Complete', icon: HandCoins },
  { value: 'final_invoice', label: 'Final Invoice', icon: HandCoins },
  { value: 'completed', label: 'Project Completed', icon: CheckCircle },
] as const;

const DENIED_STEP = { value: 'denied', label: 'Denied', icon: X } as const;
type Status =
  | typeof MAIN_PIPELINE_STEPS[number]['value']
  | typeof DENIED_STEP.value;

interface PipelineStepperProps {
  currentStatus: Status;
  onStatusChange: (status: Status) => void;
  onCreateQuotation?: () => void;
  onCreateInvoice?: () => void;
}

export default function PipelineStepper({
  currentStatus,
  onStatusChange,
  onCreateQuotation,
  onCreateInvoice,
}: PipelineStepperProps) {
const userRole = useSelector((state: RootState) => state.user.role || '');
  const activeIndex = MAIN_PIPELINE_STEPS.findIndex(
    (s) => s.value === currentStatus
  );

  const getStatus = (stepValue: Status) => {
    if (currentStatus === 'denied') return 'inactive';
    const idx = MAIN_PIPELINE_STEPS.findIndex((s) => s.value === stepValue);
    if (idx < activeIndex) return 'done';
    if (idx === activeIndex) return 'active';
    return 'pending';
  };

  const handleClick = async (stepValue: Status) => {
   onStatusChange(stepValue);
  };
  return (
    <div className="w-full px-4 ">
      <div className="relative flex items-start justify-start max-w-7xl mx-auto pt-8 gap-4">

        {MAIN_PIPELINE_STEPS.map((step, index) => {
          const status = getStatus(step.value);
          const Icon = step.icon;
          const isLast = index === MAIN_PIPELINE_STEPS.length - 1;
          const nextStepStatus = !isLast ? getStatus(MAIN_PIPELINE_STEPS[index + 1].value) : null;

          return (
            <div key={step.value} className="relative flex flex-col items-center w-40 z-10">
              {!isLast && (
                <div
                  className={clsx(
                    'absolute top-5 left-[50%] h-[3px] w-[100%] transition-all duration-300 z-0',
                    {
                      'bg-green-500': nextStepStatus === 'done' || nextStepStatus === 'active',
                      'bg-gray-300': nextStepStatus === 'pending',
                    }
                  )}
                />
              )}

              <div
                onClick={() => handleClick(step.value)}
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 cursor-pointer z-10',
                  {
                    'bg-green-500 text-white': status === 'done',
                    'bg-blue-600 text-white animate-pulse shadow-md shadow-blue-300': status === 'active',
                    'bg-gray-300 text-white': status === 'pending',
                  }
                )}
              >
                {status === 'done' ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              <span
                className={clsx('text-sm font-medium text-center mt-1', {
                  'text-gray-800': status !== 'pending',
                  'text-gray-400': status === 'pending',
                })}
              >
                {step.label}
              </span>            


              {step.value === 'quotation_submitted' &&
                status === 'active' &&
                onCreateQuotation && (
                  <Button
                    className="text-xs w-34 bg-green-600 hover:bg-green-700 text-white"
                    onClick={onCreateQuotation}
                  >
                   <FilePen /> Create Quotation
                  </Button>
                )}
              {step.value === 'invoice_issued' &&
                status === 'active' &&
                onCreateInvoice && (
                  <Button
                    onClick={onCreateInvoice}
                    className="mt-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                  >
                    <FilePen /> Create Invoice
                  </Button>
                )}

              
            </div>
          );
        })}

        <div className="flex flex-col items-center w-40 ml-6 z-10">
          <div
            onClick={() => onStatusChange(DENIED_STEP.value)}
            className={clsx(
              'w-10 h-10 mb-2 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300',
              {
                'bg-red-600 text-white': currentStatus === 'denied',
                'bg-gray-300 text-white': currentStatus !== 'denied',
              }
            )}
          >
            <X className="w-5 h-5" />
          </div>
          <span className="text-sm font-medium text-center text-red-600">
            {DENIED_STEP.label}
          </span>
        </div>
      </div>
    </div>
  );
}
