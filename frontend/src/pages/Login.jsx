import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import warehouseBg from '../assets/warehouse_bg.png';
import { validators } from './service/validators';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
	const [usernameError, setUsernameError] = useState('');
	const [usernameIsValid, setUsernameIsValid] = useState(false);
	
	const [passwordError, setPasswordError] = useState('');
	const [passwordIsValid, setPasswordIsValid] = useState(false);
	
	const [canLogin, setCanLogin] = useState(false);
  
  
	const validateUsername = (text) => {
		setUsername(text);
		if(!validators.username.regex.test(text)) {
			setUsernameError(validators.username.errorMsg);
			setUsernameIsValid(false);
		} else {
			setUsernameError('');
			setUsernameIsValid(true);
		}		
	};
	
	const validatePassword = (text) => {
		setPassword(text);
		if(text.trim() === "") {
			setPasswordError(validators.password.errorMsg);
			setPasswordIsValid(false);
		} else {
			setPasswordError('');
			setPasswordIsValid(true);
		}
	};
  
  
	useEffect(() => {
		setCanLogin(usernameIsValid && passwordIsValid);
	}, [usernameIsValid, passwordIsValid]);
	

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Por favor ingrese su usuario y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { username, password });
      if (response && response.token) {
        onLoginSuccess(response.token);
      } else {
        setError('Error al recibir el token de autenticación.');
      }
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err);
      // Extraer mensaje descriptivo
      const errorMsg = err.message || 'Credenciales inválidas o error de conexión con el servidor.';
      if (errorMsg.includes('401') || errorMsg.toLowerCase().includes('unauthorized') || errorMsg.toLowerCase().includes('bad credentials')) {
        setError('Usuario o contraseña incorrectos. Por favor, intente de nuevo.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-container">
      {/* Dynamic Style Tags for encapsulated animations and layout */}
      <style>{`
        .login-screen-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background: #ffffff;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .login-left-panel {
          position: relative;
          flex: 1.2;
          background: url(${warehouseBg}) center/cover no-repeat;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 5rem 4rem;
          color: #ffffff;
        }

        .login-left-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(0, 52, 113, 0.82) 0%, rgba(0, 30, 68, 0.94) 100%);
          z-index: 1;
        }

        .login-left-content {
          position: relative;
          z-index: 2;
          max-width: 580px;
          animation: slideUpFade 0.8s ease-out;
        }

        .login-eyebrow {
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 1rem;
        }

        .login-left-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 1.5rem;
          letter-spacing: -0.5px;
        }

        .login-left-subtitle {
          font-size: 1.15rem;
          font-weight: 300;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
        }

        .login-right-panel {
          flex: 0.8;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem 4rem;
          background: #ffffff;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.02);
          position: relative;
          z-index: 3;
        }

        .login-form-container {
          margin: auto 0;
          max-width: 440px;
          width: 100%;
          align-self: center;
          animation: fadeInOnly 0.8s ease-out;
        }

        .login-header-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #0c1829;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .login-header-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 2.5rem;
        }

        .login-form-group {
          margin-bottom: 1.5rem;
          position: relative;
        }

        .login-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 800;
          color: #1f2937;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }

        .login-input-wrapper {
          display: flex;
          align-items: center;
          background: #f4f6f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 0 1rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .login-input-wrapper:focus-within {
          border-color: #003471;
          box-shadow: 0 0 0 3px rgba(0, 52, 113, 0.12);
          background: #ffffff;
        }

        .login-input-icon {
          color: #6b7280;
          margin-right: 0.8rem;
          flex-shrink: 0;
          transition: color 0.2s;
        }

        .login-input-wrapper:focus-within .login-input-icon {
          color: #003471;
        }

        .login-input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          height: 48px;
          font-size: 1rem;
          color: #1f2937;
          font-weight: 400;
        }

        .login-input::placeholder {
          color: #94a3b8;
          font-weight: 300;
        }

        .login-eye-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .login-eye-toggle:hover {
          color: #003471;
        }

        .login-forgot-link {
          display: inline-block;
          font-size: 0.9rem;
          color: #5c6b73;
          text-decoration: none;
          font-weight: 500;
          margin-top: 0.5rem;
          margin-bottom: 2rem;
          transition: color 0.2s;
          cursor: pointer;
        }

        .login-forgot-link:hover {
          color: #003471;
        }

        .login-btn-submit {
          width: 100%;
          height: 52px;
          background: #003471;
          color: #ffffff;
          border: none;
          border-radius: 4px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease-out;
          box-shadow: 0 4px 12px rgba(0, 52, 113, 0.15);
        }

        .login-btn-submit:hover:not(:disabled) {
          background: #002856;
          box-shadow: 0 6px 16px rgba(0, 52, 113, 0.25);
          transform: translateY(-1px);
        }

        .login-btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-error-container {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(232, 65, 24, 0.08);
          border: 1px solid rgba(232, 65, 24, 0.2);
          color: #d63031;
          padding: 0.8rem 1rem;
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          animation: shake 0.4s ease-in-out;
        }

        .login-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.7rem;
          color: #9ca3af;
          letter-spacing: 0.5px;
          text-align: center;
          margin-top: 2rem;
        }

        .login-footer-links {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          font-weight: 600;
        }

        .login-footer-separator {
          width: 4px;
          height: 4px;
          background: #d1d5db;
          border-radius: 50%;
        }

        /* Animations */
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInOnly {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .login-left-panel {
            display: none;
          }
          .login-right-panel {
            flex: 1;
            padding: 3rem 2rem;
          }
          .login-form-container {
            max-width: 400px;
          }
        }
      `}</style>

      {/* Left Column: Warehouse Banner */}
      <div className="login-left-panel">
        <div className="login-left-content">
          <div className="login-eyebrow">Sistema de Gestión Industrial</div>
          <h1 className="login-left-title">Potencia tu eficiencia logística.</h1>
          <p className="login-left-subtitle">
            Accede al panel central de MEPS GROUP PERÚ para gestionar inventario, ventas y operaciones en tiempo real.
          </p>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="login-right-panel">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="login-form-container">
            <h2 className="login-header-title">Bienvenido</h2>
            <p className="login-header-subtitle">Ingrese sus credenciales para continuar al sistema.</p>

            {error && (
              <div className="login-error-container">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* User Field */}
              <div className="login-form-group">
                <label className="login-label">Usuario:</label>
                <div className="login-input-wrapper">
                  <User className="login-input-icon" size={18} />
                  <input
                    type="text"
                    className="login-input"
                    placeholder="usuario@mepsgroup.pe"
                    value={username}
					{/* onChange={(e) => setUsername(e.target.value)}*/}
					onChange={(e) => validateUsername(e.target.value)}
                    autoFocus
                    disabled={loading}
                    autoComplete="username"
                  />
				  
				  {usernameError ? <p>{validators.username.errorMsg}</p> : null}
				  
                </div>
              </div>

              {/* Password Field */}
              <div className="login-form-group">
                <label className="login-label">Contraseña:</label>
                <div className="login-input-wrapper">
                  <Lock className="login-input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="login-input"
                    placeholder="••••••••"
                    value={password}
					{/*onChange={(e) => setPassword(e.target.value)}*/}
					onChange={(e) => validatePassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
				  
				  {passwordError ? <p>{validators.password.errorMsg}</p> : null}
				  
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <span className="login-forgot-link">¿Olvidaste tu contraseña?</span>
              </div>


			  
              {/* Submit Button */}
			  {canLogin ?
				  <button type="submit" className="login-btn-submit" disabled={loading}>
					{loading ? (
					  <>
						<Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
						<span>Iniciando sesión...</span>
					  </>
					) : (
					  <span>Ingresar</span>
					)}
				  </button>
			  :
				<button type="disabled" className="login-btn-submit-disabled" disabled={true}>
					<span>Ingresar</span>										
				  </button>
			  }
			  
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <div style={{ fontWeight: 500 }}>MEPS GROUP PERÚ © 2026</div>
          <div className="login-footer-links">
            <span>Políticas de Seguridad</span>
            <div className="login-footer-separator" />
            <span>Ayuda</span>
          </div>
        </div>
      </div>
    </div>
  );
}
