export const loginValidators = {
  username: {
    isValid: (value) => value.trim().length > 0 && value.length <= 80,
    errorMessage: 'Ingrese un usuario válido de hasta 80 caracteres.',
  },
  password: {
    isValid: (value) => value.trim().length > 0,
    errorMessage: 'Ingrese su contraseña.',
  },
};
