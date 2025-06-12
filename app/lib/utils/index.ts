import bcrypt from 'bcryptjs';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateTaxOldRegime = (income: number) => {
  if (income <= 250000) return 0;
  if (income <= 500000) return (income - 250000) * 0.05;
  if (income <= 750000) return 12500 + (income - 500000) * 0.1;
  if (income <= 1000000) return 37500 + (income - 750000) * 0.15;
  if (income <= 1250000) return 75000 + (income - 1000000) * 0.2;
  if (income <= 1500000) return 125000 + (income - 1250000) * 0.25;
  return 187500 + (income - 1500000) * 0.3;
};

export const calculateTaxNewRegime = (income: number) => {
  if (income <= 300000) return 0;
  if (income <= 600000) return (income - 300000) * 0.05;
  if (income <= 900000) return 15000 + (income - 600000) * 0.1;
  if (income <= 1200000) return 45000 + (income - 900000) * 0.15;
  if (income <= 1500000) return 90000 + (income - 1200000) * 0.2;
  return 150000 + (income - 1500000) * 0.3;
};

export const getMaxDeductionsBySection = () => {
  return {
    '80C': 150000,
    '80D': 25000,
    '80G': 'No Limit (For Certain Donations)',
    '80E': 'No Limit (for Education Loan Interest)',
    '80TTA': 10000,
    '80TTB': 50000,
  };
}; 

const SALT_ROUNDS = 12;

// Hash the password
export const saltAndHashPassword = async (password: string): Promise<string> => {
  const salt: string = await bcrypt.genSalt(SALT_ROUNDS);
  const hash: string = await bcrypt.hash(password, salt);
  return hash;
};

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const isMatch: boolean = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};