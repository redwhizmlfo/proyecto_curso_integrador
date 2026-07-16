const regexPatterns = {
	loginUsername: /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{0,78}[a-zA-Z0-9])?$/,
	email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	dni: /^\d{8}$/,
	ruc: /^(10|20)\d{9}$/,
	docNumber: /^(\d{8}|(10|20)\d{9})$/,
	phone: /^\d{7,15}$/,
	name: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,'&()/-]{3,180}$/,
	personName: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .'-]{3,180}$/,
	initials: /^[A-ZÑ]{2,4}$/,
	role: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,80}$/,
	address: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,#[\]°ºª()/-]{3,500}$/,
	technicalText: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .,_+/#°ºª()/-]{2,180}$/,
	sku: /^[A-Za-z0-9._-]{3,80}$/,
	decimal: /^\d+(\.\d{1,2})?$/,
	period: /^.{3,120}$/,
};

export const onlyDigits = (value = '') => String(value || '').replace(/\D+/g, '');

export const isRequiredText = (value, minLength = 1) =>
	String(value || '').trim().length >= minLength;

export const validateField = (validatorMap, field, value) => {
	const validator = validatorMap?.[field];
	return validator && !validator.isValid(value) ? validator.errorMessage : '';
};

export const validators = {
	alphabet: {
		id: 'alphabet',
		regex: /^[A-Za-z ]{3,50}$/,
		errorMsg: 'Solo se permiten caracteres del alfabeto',
	},
	email: {
		id: 'email',
		regex: regexPatterns.email,
		errorMsg: 'Correo invalido',
	},
	username: {
		id: 'username',
		regex: regexPatterns.loginUsername,
		errorMsg: 'Codigo de usuario invalido',
	},
	registerPassword: {
		id: 'registerPassword',
		regex: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
		errorMsg: 'Contrasena invalida',
	},
	loginPassword: {
		id: 'loginPassword',
		errorMsg: 'Ingrese su contrasena',
	},
};

export const loginValidators = {
	username: {
		isValid: (value) => isRequiredText(value) && String(value).length <= 80 && regexPatterns.loginUsername.test(String(value).trim()),
		errorMessage: 'Ingrese un usuario valido de hasta 80 caracteres.',
	},
	password: {
		isValid: (value) => isRequiredText(value),
		errorMessage: 'Ingrese su contrasena.',
	},
};

export const commonValidators = {
	dni: {
		isValid: (value) => regexPatterns.dni.test(onlyDigits(value)),
		errorMessage: 'Ingrese DNI de 8 digitos.',
	},
	ruc: {
		isValid: (value) => regexPatterns.ruc.test(onlyDigits(value)),
		errorMessage: 'Ingrese RUC de 11 digitos que empiece con 10 o 20.',
	},
	docNumber: {
		isValid: (value) => regexPatterns.docNumber.test(onlyDigits(value)),
		errorMessage: 'Ingrese DNI de 8 digitos o RUC de 11 digitos.',
	},
	phone: {
		isValid: (value) => !String(value || '').trim() || regexPatterns.phone.test(onlyDigits(value)),
		errorMessage: 'El telefono debe tener entre 7 y 15 digitos.',
	},
	name: {
		isValid: (value) => regexPatterns.name.test(String(value || '').trim()),
		errorMessage: 'Use al menos 3 caracteres validos. Se permiten letras, numeros, espacios y signos basicos.',
	},
	address: {
		isValid: (value) => regexPatterns.address.test(String(value || '').trim()),
		errorMessage: 'Ingrese una direccion valida. Puede usar letras, numeros, #, -, /, parentesis y punto.',
	},
	email: {
		isValid: (value) => !String(value || '').trim() || regexPatterns.email.test(String(value).trim()),
		errorMessage: 'Ingrese un correo electronico valido.',
	},
	preferredDiscount: {
		isValid: (value) => {
			const numberValue = Number(value);
			return Number.isFinite(numberValue) && numberValue >= 0 && numberValue <= 100;
		},
		errorMessage: 'El descuento debe estar entre 0 y 100.',
	},
	contact: {
		isValid: (value) => !String(value || '').trim() || regexPatterns.personName.test(String(value).trim()),
		errorMessage: 'Ingrese un contacto valido. Solo letras, espacios, apostrofe o guion.',
	},
};

export const registerEmployeeValidators = {
	name: {
		isValid: (value) => regexPatterns.personName.test(String(value || '').trim()),
		errorMessage: 'Ingrese el nombre completo. Solo letras, espacios, apostrofe o guion.',
	},
	initials: {
		isValid: (value) => regexPatterns.initials.test(String(value || '').trim()),
		errorMessage: 'Ingrese iniciales de 2 a 4 letras mayusculas.',
	},
	dni: commonValidators.dni,
	role: {
		isValid: (value) => regexPatterns.role.test(String(value || '').trim()),
		errorMessage: 'Ingrese un cargo valido. Solo letras y espacios.',
	},
	payPerDay: {
		isValid: (value) => regexPatterns.decimal.test(String(value || '').trim()) && Number(value) > 0,
		errorMessage: 'Ingrese una tarifa diaria positiva.',
	},
};

export const employeeSlipValidators = {
	period: {
		isValid: (value) => regexPatterns.period.test(String(value || '').trim()),
		errorMessage: 'Ingrese un periodo valido.',
	},
	periodLabel: {
		isValid: (value) => regexPatterns.period.test(String(value || '').trim()),
		errorMessage: 'Ingrese un periodo valido.',
	},
	workDays: {
		isValid: (value) => Number.isFinite(Number(value)) && Number(value) > 0,
		errorMessage: 'Ingrese dias trabajados mayores a cero.',
	},
};

export const validateCustomerForm = (form = {}, existingCustomers = [], editingId = null) => {
	const errors = {};
	const cleanDocNumber = onlyDigits(form.docNumber);
	const expectedLength = form.docType === 'RUC' ? 11 : 8;

	if (!commonValidators.name.isValid(form.name)) {
		errors.name = 'Ingrese el nombre del cliente.';
	}
	if (cleanDocNumber.length !== expectedLength || (form.docType === 'RUC' && !regexPatterns.ruc.test(cleanDocNumber))) {
		errors.docNumber = form.docType === 'RUC'
			? 'Ingrese un RUC valido de 11 digitos que empiece con 10 o 20.'
			: 'Ingrese un DNI valido de 8 digitos.';
	}
	if (existingCustomers.some((customer) =>
		customer.id !== editingId && onlyDigits(customer.docNumber) === cleanDocNumber
	)) {
		errors.docNumber = 'Ya existe un cliente con este documento.';
	}
	if (!commonValidators.phone.isValid(form.phone)) {
		errors.phone = commonValidators.phone.errorMessage;
	}
	if (!commonValidators.email.isValid(form.email)) {
		errors.email = commonValidators.email.errorMessage;
	}
	if (!commonValidators.preferredDiscount.isValid(form.preferredDiscount)) {
		errors.preferredDiscount = commonValidators.preferredDiscount.errorMessage;
	}
	if (!commonValidators.address.isValid(form.address)) {
		errors.address = commonValidators.address.errorMessage;
	}

	return errors;
};

export const validateSupplierForm = (form = {}, existingSuppliers = [], editingId = null) => {
	const errors = {};
	const cleanRuc = onlyDigits(form.ruc);

	if (!commonValidators.name.isValid(form.name)) {
		errors.name = 'Ingrese el nombre del proveedor.';
	}
	if (!commonValidators.ruc.isValid(cleanRuc)) {
		errors.ruc = commonValidators.ruc.errorMessage;
	}
	if (existingSuppliers.some((supplier) =>
		supplier.id !== editingId && onlyDigits(supplier.ruc) === cleanRuc
	)) {
		errors.ruc = 'Ya existe un proveedor con este RUC.';
	}
	if (!commonValidators.contact.isValid(form.contact)) {
		errors.contact = commonValidators.contact.errorMessage;
	}
	if (!commonValidators.phone.isValid(form.phone)) {
		errors.phone = commonValidators.phone.errorMessage;
	}
	if (!commonValidators.email.isValid(form.email)) {
		errors.email = commonValidators.email.errorMessage;
	}

	return errors;
};

export const validateEmployeeForm = (form = {}, existingEmployees = [], editingId = null) => {
	const errors = {};
	const cleanDni = onlyDigits(form.dni);

	Object.entries(registerEmployeeValidators).forEach(([field, validator]) => {
		if (!validator.isValid(form[field])) {
			errors[field] = validator.errorMessage;
		}
	});
	if (existingEmployees.some((employee) =>
		employee.id !== editingId && onlyDigits(employee.dni) === cleanDni
	)) {
		errors.dni = 'Ya existe un empleado con este DNI.';
	}

	return errors;
};

export const validateProductModelForm = (form = {}, context = {}) => {
	const errors = {};
	if (!form.id_categoria) errors.id_categoria = 'Seleccione una categoria.';
	if (form.id_categoria === 'NEW_CAT' && !regexPatterns.technicalText.test(String(context.newCategoryName || '').trim())) {
		errors.newCategoryName = 'Ingrese una categoria valida. Evite simbolos no permitidos.';
	}
	if (!form.id_marca) errors.id_marca = 'Seleccione una marca.';
	if (form.id_marca === 'NEW_BRAND' && !regexPatterns.technicalText.test(String(context.newBrandName || '').trim())) {
		errors.newBrandName = 'Ingrese una marca valida. Evite simbolos no permitidos.';
	}
	if (!regexPatterns.technicalText.test(String(form.modelo || '').trim())) errors.modelo = 'Ingrese un modelo valido. Evite simbolos no permitidos.';
	if (!regexPatterns.technicalText.test(String(form.codigoModelo || '').trim())) errors.codigoModelo = 'Ingrese un codigo tecnico valido.';
	if (!regexPatterns.sku.test(String(form.sku || '').trim())) errors.sku = 'El SKU debe tener 3 a 80 caracteres: letras, numeros, punto, guion o guion bajo.';
	if ((context.models || []).some((model) =>
		model.id !== form.id && String(model.sku || '').trim().toLowerCase() === String(form.sku || '').trim().toLowerCase()
	)) {
		errors.sku = 'Ya existe un producto con este SKU.';
	}
	if (!(Number(form.precio) > 0)) errors.precio = 'El precio debe ser mayor a cero.';
	if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
		errors.stock = 'El stock debe ser un entero mayor o igual a cero.';
	}
	if (form.imageUrl) {
		try {
			const cleanUrl = String(form.imageUrl).trim();
			if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('./')) new URL(cleanUrl);
		} catch {
			errors.imageUrl = 'Use una URL valida o una ruta local.';
		}
	}
	if ((form.specs || []).some((spec) =>
		Boolean(String(spec.atributo || '').trim()) !== Boolean(String(spec.valor || '').trim())
	)) {
		errors.specs = 'Complete atributo y valor, o deje ambos vacios.';
	}
	return errors;
};

export const validatePurchaseOrderForm = ({ selectedSupplierId, orderItems, tempQty, note } = {}) => {
	const errors = {};
	if (!selectedSupplierId) errors.selectedSupplierId = 'Seleccione un proveedor.';
	if (!orderItems || orderItems.length === 0) errors.orderItems = 'Agregue al menos un producto.';
	if (tempQty !== undefined && !(Number(tempQty) > 0)) errors.tempQty = 'La cantidad debe ser mayor a cero.';
	if (String(note || '').length > 500) errors.note = 'La nota no debe superar 500 caracteres.';
	return errors;
};

export const validatePayrollSlipForm = ({ selectedEmployeeId, periodLabel, workDays, slips = [] } = {}) => {
	const errors = {};
	const cleanPeriod = String(periodLabel || '').trim();
	if (!selectedEmployeeId) errors.selectedEmployeeId = 'Seleccione un empleado.';
	if (!employeeSlipValidators.periodLabel.isValid(cleanPeriod)) errors.periodLabel = employeeSlipValidators.periodLabel.errorMessage;
	if (!employeeSlipValidators.workDays.isValid(workDays)) errors.workDays = employeeSlipValidators.workDays.errorMessage;
	if (slips.some((slip) =>
		(slip.employee?.id === selectedEmployeeId || slip.employeeId === selectedEmployeeId)
		&& String(slip.periodLabel || '').trim().toLowerCase() === cleanPeriod.toLowerCase()
	)) {
		errors.periodLabel = 'Ya existe una boleta para este empleado y periodo.';
	}
	return errors;
};

export const liveFieldValidators = {
	customerName: commonValidators.name.isValid,
	address: commonValidators.address.isValid,
	email: commonValidators.email.isValid,
	phone: commonValidators.phone.isValid,
	contact: commonValidators.contact.isValid,
	dni: commonValidators.dni.isValid,
	ruc: commonValidators.ruc.isValid,
	docByType: (value, docType = 'DNI') => (
		docType === 'RUC' ? commonValidators.ruc.isValid(value) : commonValidators.dni.isValid(value)
	),
	initials: registerEmployeeValidators.initials.isValid,
	employeeName: registerEmployeeValidators.name.isValid,
	role: registerEmployeeValidators.role.isValid,
	payPerDay: registerEmployeeValidators.payPerDay.isValid,
	technicalText: (value) => regexPatterns.technicalText.test(String(value || '').trim()),
	sku: (value) => regexPatterns.sku.test(String(value || '').trim()),
	price: (value) => regexPatterns.decimal.test(String(value || '').trim()) && Number(value) > 0,
	stock: (value) => Number.isInteger(Number(value)) && Number(value) >= 0,
};
