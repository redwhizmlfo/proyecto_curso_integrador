export const validators = {
	alphabet: {
		id: "alphabet",
		regex: /^[a-zA-Zá-úÁ-Ú\s]{3,50}$/,
		errorMsg: "Solo se permiten caracteres del alfabeto"
	},
	email: {
		id: "email",
		// https://saturncloud.io/blog/how-can-i-validate-an-email-address-using-a-regular-expression/
		// regex: /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
		regex: /^([a-zA-Z0-9._%-]+@mepsgroup.pe)$/,
		errorMsg: "Correo inválido"
	},
	username: {
		id: "username",
		// regex: /^[a-zA-Zá-úÁ-Ú\s]{3,80}$/,
		regex: /^[a-zA-Z0-9](?:[a-zA-Z0-9._-]{1,78}[a-zA-Z0-9])?$/,
		errorMsg: "Código de usuario inválido"
	},
	registerPassword: {
		id: "registerPassword",
		// https://ihateregex.io/expr/password/
		regex: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/, 
		errorMsg: "Contraseña inválida"
	},
	loginPassword: {
		id: "loginPassword",		
		errorMsg: "Ingrese su contraseña"
	}	
};
