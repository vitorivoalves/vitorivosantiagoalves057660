// src/utils/masks.ts

export const maskPhone = (value: string) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "");
  if (v.length > 10) { // Celular (11) 91234-5678
    return v.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  } else if (v.length > 5) { // Fixo (11) 1234-5678
    return v.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  } else if (v.length > 2) {
    return v.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
  }
  return v;
};

export const maskCPF = (value: string) => {
  if (!value) return "";
  const v = value.replace(/\D/g, ""); // Remove tudo que não é dígito
  return v
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
    .slice(0, 14); // Limita tamanho
};

// Remove formatação para enviar à API (que espera apenas números)
export const unmask = (value: string) => {
  return value.replace(/\D/g, "");
};