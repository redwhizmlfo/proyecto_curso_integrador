const regexPatterns = {
	login: {
		username: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9](?:[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9._-]{1,78}[a-zA-Z0-9])?$/ // Alfabeto español, números, puntos, guíones medios y bajos.
	},
	registerEmployee: {
		name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ' -]{3,180}$/, // Alfabeto español y espacios en blanco
		initials: /^[A-Z]{2,4}$/, // Solo letras mayúsculas, entre 2 y 5 caracteres
		dni: /^\d{8}$/, // DNI peruano: 8 dígitos
		role: /^[a-zA-Z\s]{3,50}$/, // Solo letras y espacios, entre 3 y 50 caracteres
		payPerDay: /^\d+(\.\d{1,2})?$/ // Número entero o decimal con hasta 2 decimales
	},
	email: /^([a-zA-Z0-9._%-+]+@mepsgroup.pe)$/, // https://saturncloud.io/blog/how-can-i-validate-an-email-address-using-a-regular-expression/
	alphabet: /^[a-zA-Zá-úÁ-Ú\s]{3,50}$/,
	employeeSlip: {
		period: /^(Enero|Febrero|Marzo|Abril|Mayo|Junio|Julio|Agosto|Septiembre|Octubre|Noviembre|Diciembre)-\d{4}-(Quincena|Fin-de-mes)-\d+$/,
		workDays: /^[1-9]\d+$/
	},
	dni: /^\d{8}$/,
	ruc: /^(10|20)\d{9}$/,
	docNumber: /^\d{8}|(10|20)\d{9}$/,
	phone: /^\d{9}$/,
	name: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ' \-]{3,180}$/,
	address: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s.,#°\-\/]{3,500}$/,
	email: /^([a-zA-Z0-9._%-+]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
	preferredDiscount: /^(0|[1-9]\d?)$/,
	contact: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ.' \-]{3,180}$/
};

// regex generales: dni, telefono, correo, nombre completo, dirección, ruc

export const validateField = (validators, field, value) => {
	const validator = validators[field];
	if(!validator) {
		return '';
	} else {
		return validator.isValid(value) ? '' : validator.errorMessage;
	}
};

export const loginValidators = {
  username: {
    isValid: (value) => value.trim().length > 0 && value.length <= 80 && regexPatterns.login.username.test(value),
    errorMessage: 'Ingrese un usuario válido de hasta 80 caracteres.',
  },
  password: {
    isValid: (value) => value.trim().length > 0,
    errorMessage: 'Ingrese su contraseña.',
  },
};

export const registerEmployeeValidators = {
  name: {	
    isValid: (value) => value.trim().length > 0 && regexPatterns.registerEmployee.name.test(value),
    errorMessage: 'Ingrese el nombre completo sin números ni caractéres especiales, de 3 hasta 180 caracteres.',
  },
  initials: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.registerEmployee.initials.test(value),
    errorMessage: 'Ingrese iniciales sin números ni espacios ni caractéres especiales, de 2 a 4 caracteres',
  },
  dni: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.registerEmployee.dni.test(value),
    errorMessage: 'Ingrese dni de 8 digitos.',
  },
  role: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.registerEmployee.role.test(value),
    errorMessage: 'Ingrese un rol solo con letras y opcionalmente espacios, de 3 hasta 50 caracteres.',
  },
  payPerDay: {
    isValid: (value) => value.trim().length > 0 && regexPatterns.registerEmployee.payPerDay.test(value),
    errorMessage: 'Ingrese un número entero o decimal positivo con hasta 2 decimales.',
  }
};

export const employeeSlipValidators = {
	period: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.employeeSlip.period.test(value),
		errorMessage: 'Ingrese un periodo con formato: <Mes>-<año>-<Quincena|Fin-de-mes>-<número>'
	},
	workDays: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.employeeSlip.workDays.test(value),
		errorMessage: 'Ingrese un número entero positivo.'
	}
};

export const commonValidators = {
	dni: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.dni.test(value),
		errorMessage: 'Ingrese dni de 8 digitos.'
	},
	ruc: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.ruc.test(value),
		errorMessage: 'Ingrese ruc de 11 digitos, debe empezar con 10 o 20.'
	},
	docNumber: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.dni.test(value),
		errorMessage: 'RUC o DNI inválido.'
	},
	phone: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.phone.test(value),
		errorMessage: 'Número de celular o teléfono fijo inválido.'
	},
	name: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.name.test(value),
		errorMessage: 'El nombre no debe contener números ni símbolos especiales.'
	},
	address: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.address.test(value),
		errorMessage: 'Dirección inválida.'
	},
	email: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.email.test(value),
		errorMessage: 'Correo inválido.'
	},
	preferredDiscount: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.preferredDiscount.test(value),
		errorMessage: 'Descuento inválido.'
	},
	contact: {
		isValid: (value) => value.trim().length > 0 && regexPatterns.contact.test(value),
		errorMessage: 'Contacto inválido.'
	},
}
