
export const generateOtp = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  const remainingDigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return parseInt(firstDigit + remainingDigits);
};
