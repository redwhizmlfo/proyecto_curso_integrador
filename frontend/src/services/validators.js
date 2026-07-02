const regexPatterns = {
	name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,180}$/, // Alfabeto español y espacios en blanco
	initials: /^[A-Z]{2,4}$/, // Solo letras mayúsculas, entre 2 y 5 caracteres
	dni: /^\d{8}$/, // DNI peruano: 8 dígitos
	role: /^[a-zA-Z\s]{3,50}$/, // Solo letras y espacios, entre 3 y 50 caracteres
	payPerDay: /^\d+(\.\d{1,2})?$/ // Número entero o decimal con hasta 2 decimales
};
	

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

export const registerEmployeeValidators = {
  name: {	
    isValid: (value) => value.trim().length > 0 && regexPatterns.name.test(value),
    errorMessage: 'Ingrese el nombre completo sin números ni caractéres especiales, de 3 hasta 180 caracteres.',
  },
  initials: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.initials.test(value),
    errorMessage: 'Ingrese iniciales sin números ni espacios ni caractéres especiales, de 2 a 4 caracteres',
  },
  dni: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.dni.test(value),
    errorMessage: 'Ingrese dni de 8 digitos.',
  },
  role: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.role.test(value),
    errorMessage: 'Ingrese un rol solo con letras y opcionalmente espacios, de 3 hasta 50 caracteres.',
  },
  payPerDay: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.payPerDay.test(value),
    errorMessage: 'Ingrese un número entero o decimal con hasta 2 decimales.',
  },
};
