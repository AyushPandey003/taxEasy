"use client";

import { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronUp, FileCheck, Calendar, AlertCircle } from 'lucide-react';

type UserType = 'salaried' | 'freelancer' | 'business' | 'senior';

interface Step {
  title: string;
  description: string;
  documents?: string[];
  deadline?: string;
  isImportant?: boolean;
}

// Define filing steps for different user types
const filingSteps: Record<UserType, Step[]> = {
  salaried: [
    {
      title: 'Collect Form 16',
      description: 'Obtain Form 16 from your employer(s) for the financial year.',
      documents: ['Form 16', 'Form 16A (if applicable)'],
      deadline: 'June 15',
      isImportant: true,
    },
    {
      title: 'Gather Investment Proofs',
      description: 'Collect proof of tax-saving investments under sections 80C, 80D, etc.',
      documents: ['Investment receipts', 'Insurance premium receipts', 'Housing loan interest statement'],
    },
    {
      title: 'Check Form 26AS',
      description: 'Verify your tax credit statement (Form 26AS) from the income tax portal.',
      deadline: 'Before filing ITR',
    },
    {
      title: 'Choose Correct ITR Form',
      description: 'Most salaried individuals should use ITR-1 (Sahaj) or ITR-2.',
      isImportant: true,
    },
    {
      title: 'File your Return',
      description: 'Submit your ITR on the income tax e-filing portal.',
      deadline: 'July 31',
      isImportant: true,
    },
    {
      title: 'Verify your Return',
      description: 'Verify your return using Aadhaar OTP, net banking, or other methods.',
      deadline: 'Within 30 days of filing',
      isImportant: true,
    },
  ],
  freelancer: [
    {
      title: 'Maintain Books of Accounts',
      description: 'Keep proper records of all income and expenses throughout the year.',
      isImportant: true,
    },
    {
      title: 'Calculate Advance Tax',
      description: 'Pay advance tax in four installments if tax liability exceeds ₹10,000.',
      deadline: 'Jun 15, Sep 15, Dec 15, Mar 15',
      isImportant: true,
    },
    {
      title: 'Collect Form 16A/TDS Certificates',
      description: 'Obtain TDS certificates from clients who deducted tax on your payments.',
      documents: ['Form 16A', 'Bank statements', 'Client payment receipts'],
    },
    {
      title: 'Prepare Profit & Loss Statement',
      description: 'Create a P&L statement showing your income and business expenses.',
      isImportant: true,
    },
    {
      title: 'Use ITR-4 (Sugam) or ITR-3',
      description: 'Freelancers typically use ITR-4 for presumptive taxation or ITR-3 for regular income.',
      isImportant: true,
    },
    {
      title: 'File GST Returns (if applicable)',
      description: 'If registered under GST, ensure all returns are filed before ITR.',
      deadline: 'As per GST guidelines',
    },
    {
      title: 'File your Return',
      description: 'Submit your ITR on the income tax e-filing portal.',
      deadline: 'July 31',
      isImportant: true,
    },
  ],
  business: [
    {
      title: 'Maintain Books of Accounts',
      description: 'Keep proper books of accounts and financial statements.',
      isImportant: true,
    },
    {
      title: 'Calculate Advance Tax',
      description: 'Pay advance tax in four installments throughout the year.',
      deadline: 'Jun 15, Sep 15, Dec 15, Mar 15',
      isImportant: true,
    },
    {
      title: 'Get Tax Audit (if applicable)',
      description: 'If turnover exceeds threshold, get your accounts audited by a CA.',
      deadline: 'September 30',
      isImportant: true,
    },
    {
      title: 'File GST Returns',
      description: 'Ensure all GST returns are filed and reconciled with books.',
      deadline: 'As per GST guidelines',
      isImportant: true,
    },
    {
      title: 'Prepare Financial Statements',
      description: 'Create Balance Sheet, Profit & Loss Statement, and other required statements.',
      documents: ['Balance Sheet', 'P&L Statement', 'Cash Flow Statement'],
      isImportant: true,
    },
    {
      title: 'Use ITR-3 or ITR-5',
      description: 'Businesses typically use ITR-3 (for proprietorship) or ITR-5 (for partnership firms).',
    },
    {
      title: 'File your Return',
      description: 'Submit your ITR on the income tax e-filing portal.',
      deadline: 'July 31 (or Oct 31 if tax audit applies)',
      isImportant: true,
    },
  ],
  senior: [
    {
      title: 'Collect Pension / Interest Statements',
      description: 'Gather statements for pension, interest income, and other income sources.',
      documents: ['Pension statement', 'Bank interest certificates', 'Form 16A'],
    },
    {
      title: 'Check Form 26AS',
      description: 'Verify your tax credit statement (Form 26AS) from the income tax portal.',
    },
    {
      title: 'Gather Investment Proofs',
      description: 'Collect proof of tax-saving investments and medical expenses.',
      documents: ['Investment receipts', 'Health insurance premium receipts', 'Medical bills'],
    },
    {
      title: 'Check Senior Citizen Deductions',
      description: 'Ensure you claim special deductions like 80TTB (interest income) and enhanced medical deductions.',
      isImportant: true,
    },
    {
      title: 'Choose Correct ITR Form',
      description: 'Most senior citizens should use ITR-1 (Sahaj) or ITR-2 based on income sources.',
    },
    {
      title: 'File your Return',
      description: 'Submit your ITR on the income tax e-filing portal or seek assistance.',
      deadline: 'July 31',
      isImportant: true,
    },
  ],
};

export default function FilingSteps() {
  const [selectedUserType, setSelectedUserType] = useState<UserType>('salaried');
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    setExpandedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <label 
          htmlFor="userType" 
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          I am a:
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedUserType('salaried')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center transition-colors ${
              selectedUserType === 'salaried'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-sm md:text-base font-medium">Salaried Person</span>
          </button>
          
          <button
            onClick={() => setSelectedUserType('freelancer')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center transition-colors ${
              selectedUserType === 'freelancer'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-sm md:text-base font-medium">Freelancer</span>
          </button>
          
          <button
            onClick={() => setSelectedUserType('business')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center transition-colors ${
              selectedUserType === 'business'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-sm md:text-base font-medium">Business Owner</span>
          </button>
          
          <button
            onClick={() => setSelectedUserType('senior')}
            className={`py-3 px-4 rounded-lg flex flex-col items-center transition-colors ${
              selectedUserType === 'senior'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span className="text-sm md:text-base font-medium">Senior Citizen</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filingSteps[selectedUserType].map((step, index) => (
          <div 
            key={index} 
            className={`bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-all ${
              step.isImportant ? 'border-l-4 border-blue-600 dark:border-blue-500' : ''
            }`}
          >
            <button
              onClick={() => toggleStep(index)}
              className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className={`h-5 w-5 ${
                  expandedSteps.includes(index) 
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 dark:text-slate-500'
                }`} />
                <span className="font-medium text-slate-900 dark:text-white text-left">
                  {step.title}
                  {step.deadline && (
                    <span className="ml-2 text-sm text-blue-600 dark:text-blue-400 font-normal">
                      (Due: {step.deadline})
                    </span>
                  )}
                </span>
              </div>
              {expandedSteps.includes(index) ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </button>
            
            {expandedSteps.includes(index) && (
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700">
                <p className="text-slate-700 dark:text-slate-300 mb-4">
                  {step.description}
                </p>
                
                {step.documents && step.documents.length > 0 && (
                  <div className="mb-3">
                    <div className="flex gap-2 text-slate-700 dark:text-slate-300 text-sm mb-1">
                      <FileCheck className="h-4 w-4 text-green-600 dark:text-green-500" />
                      <span className="font-medium">Required Documents:</span>
                    </div>
                    <ul className="list-disc pl-8 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {step.documents.map((doc, i) => (
                        <li key={i}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {step.deadline && (
                  <div className="flex gap-2 text-slate-700 dark:text-slate-300 text-sm">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span><span className="font-medium">Deadline:</span> {step.deadline}</span>
                  </div>
                )}
                
                {step.isImportant && (
                  <div className="flex gap-2 text-slate-700 dark:text-slate-300 text-sm mt-3 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>This is an important step that cannot be skipped.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 