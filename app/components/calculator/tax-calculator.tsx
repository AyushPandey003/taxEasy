"use client";

import { useState } from "react";
import { calculateTaxOldRegime, calculateTaxNewRegime, formatCurrency } from "../../lib/utils";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TaxRegime = "old" | "new";

interface TaxInput {
  income: number;
  deductions: {
    section80C: number;
    section80D: number;
    housingLoan: number;
    others: number;
  };
}

export default function TaxCalculator() {
  const [taxInput, setTaxInput] = useState<TaxInput>({
    income: 1000000,
    deductions: {
      section80C: 0,
      section80D: 0,
      housingLoan: 0,
      others: 0,
    },
  });

  const [selectedRegime, setSelectedRegime] = useState<TaxRegime>("new");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === "income") {
      setTaxInput((prev) => ({
        ...prev,
        income: parseFloat(value) || 0,
      }));
    } else {
      setTaxInput((prev) => ({
        ...prev,
        deductions: {
          ...prev.deductions,
          [name]: parseFloat(value) || 0,
        },
      }));
    }
  };

  const toggleRegime = () => {
    setSelectedRegime((prev) => (prev === "old" ? "new" : "old"));
  };

  // Calculate total deductions
  const totalDeductions = 
    Object.values(taxInput.deductions).reduce((sum, value) => sum + value, 0);

  // Calculate taxable income based on regime
  const taxableIncome = selectedRegime === "old" 
    ? Math.max(0, taxInput.income - totalDeductions)
    : taxInput.income;

  // Calculate tax amounts
  const oldRegimeTax = calculateTaxOldRegime(
    Math.max(0, taxInput.income - totalDeductions)
  );
  
  const newRegimeTax = calculateTaxNewRegime(taxInput.income);

  // Prepare chart data
  const regimeComparisonData = {
    labels: ["Old Regime", "New Regime"],
    datasets: [
      {
        label: "Tax Amount",
        data: [oldRegimeTax, newRegimeTax],
        backgroundColor: ["rgba(54, 162, 235, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(54, 162, 235, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  };
  
  // Income breakdown chart
  const incomeBreakdownData = {
    labels: ["Tax", "Net Income"],
    datasets: [
      {
        label: "Amount",
        data: [
          selectedRegime === "old" ? oldRegimeTax : newRegimeTax,
          taxInput.income - (selectedRegime === "old" ? oldRegimeTax : newRegimeTax),
        ],
        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(75, 192, 192, 0.6)"],
        borderColor: ["rgba(255, 99, 132, 1)", "rgba(75, 192, 192, 1)"],
        borderWidth: 1,
      },
    ],
  };
  
  // Recommendation based on calculations
  const recommendation = oldRegimeTax <= newRegimeTax ? "old" : "new";

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
        Personal Tax Calculator - FY 2024-25
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Your Income Details
            </h3>
            
            <div className="space-y-4">
              <div>
                <label 
                  htmlFor="income" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Annual Income (₹)
                </label>
                <input
                  type="number"
                  id="income"
                  name="income"
                  value={taxInput.income}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="section80C" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Section 80C (₹)
                </label>
                <input
                  type="number"
                  id="section80C"
                  name="section80C"
                  value={taxInput.deductions.section80C}
                  onChange={handleInputChange}
                  max={150000}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Max: ₹1,50,000 (PPF, ELSS, LIC, etc.)
                </p>
              </div>
              
              <div>
                <label 
                  htmlFor="section80D" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Section 80D - Health Insurance (₹)
                </label>
                <input
                  type="number"
                  id="section80D"
                  name="section80D"
                  value={taxInput.deductions.section80D}
                  onChange={handleInputChange}
                  max={50000}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Max: ₹25,000 (₹50,000 for senior citizens)
                </p>
              </div>
              
              <div>
                <label 
                  htmlFor="housingLoan" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Housing Loan Interest (₹)
                </label>
                <input
                  type="number"
                  id="housingLoan"
                  name="housingLoan"
                  value={taxInput.deductions.housingLoan}
                  onChange={handleInputChange}
                  max={200000}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Max: ₹2,00,000
                </p>
              </div>
              
              <div>
                <label 
                  htmlFor="others" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Other Deductions (₹)
                </label>
                <input
                  type="number"
                  id="others"
                  name="others"
                  value={taxInput.deductions.others}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Tax Regime
            </h3>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleRegime}
                className={`flex-1 py-3 px-4 rounded-md font-medium focus:outline-none ${
                  selectedRegime === "old"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white"
                }`}
              >
                Old Regime
              </button>
              
              <button
                onClick={toggleRegime}
                className={`flex-1 py-3 px-4 rounded-md font-medium focus:outline-none ${
                  selectedRegime === "new"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white"
                }`}
              >
                New Regime
              </button>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {selectedRegime === "old"
                ? "Old regime allows deductions but has higher tax rates"
                : "New regime has lower tax rates but no major deductions"}
            </p>
          </div>
        </div>
        
        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Tax Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-md">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Income</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(taxInput.income)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-4 rounded-md">
                <p className="text-sm text-slate-500 dark:text-slate-400">Taxable Income</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(taxableIncome)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-4 rounded-md">
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Deductions</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(selectedRegime === "old" ? totalDeductions : 0)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 p-4 rounded-md">
                <p className="text-sm text-slate-500 dark:text-slate-400">Tax Amount</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(selectedRegime === "old" ? oldRegimeTax : newRegimeTax)}
                </p>
              </div>
            </div>
            
            {/* Recommendation */}
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-md">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Recommendation
              </h4>
              <p className="text-blue-700 dark:text-blue-200">
                Based on your inputs, the {recommendation === "old" ? "Old" : "New"} Regime would save you{" "}
                <span className="font-semibold">
                  {formatCurrency(Math.abs(oldRegimeTax - newRegimeTax))}
                </span>{" "}
                in taxes.
              </p>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Regime Comparison
              </h3>
              <div className="h-64">
                <Bar 
                  data={regimeComparisonData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `₹${context.raw}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return `₹${value}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                Income Breakdown
              </h3>
              <div className="h-64 flex items-center justify-center">
                <Pie 
                  data={incomeBreakdownData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `₹${context.raw}`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 