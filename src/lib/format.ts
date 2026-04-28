export const fmtARS = (n: number | string): string => {
  const num = parseFloat(n.toString());
  if (isNaN(num)) return '$0,00';
  return '$' + num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
