"use strict";

function initValidation(container) {
        const form = container.querySelector('#registration-form');
    
        const inputs = [
            { id: 'usuario', errorId: 'usuario-error', validator: validateUser },
            { id: 'edad', errorId: 'edad-error', validator: validateAge },
            { id: 'correo', errorId: 'correo-error', validator: validateMail },
            { id: 'contrasena', errorId: 'contrasena-error', validator: validatePassword },
            { id: 'repetir-contrasena', errorId: 'repetir-contrasena-error', validator: validateRepeatPassword }
        ];
    
        function showError(element, message) {
            if(element){
                element.textContent = message;
                element.style.display = 'block';
                element.previousElementSibling.classList.add('has-error');
            }
        }
    
        function hideError(element) {
            if(element){
                element.textContent = '';
                element.style.display = 'none';
                element.previousElementSibling.classList.remove('has-error');
            }
        }
    
        // Funciones de validación individuales
        function validateUser() {
            const usuarioInput = container.querySelector('#usuario');
            const usuarioError = container.querySelector('#usuario-error');
            if (usuarioInput.value.length < 4) {
                showError(usuarioError, 'El nombre de usuario debe tener al menos 4 caracteres.');
                return false;
            } else {
                hideError(usuarioError);
                return true;
            }
        }
    
        function validateAge() {
            const edadInput = container.querySelector('#edad');
            const edadError = container.querySelector('#edad-error');
            const edad = parseInt(edadInput.value);
            if (isNaN(edad) || edad < 13) {
                showError(edadError, 'Debes tener 13 años o más.');
                return false;
            } else {
                hideError(edadError);
                return true;
            }
        }
    
        function validateMail() {
            const correoInput = container.querySelector('#correo');
            const correoError = container.querySelector('#correo-error');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correoInput.value)) {
                showError(correoError, 'Por favor, ingresa un correo electrónico válido.');
                return false;
            } else {
                hideError(correoError);
                return true;
            }
        }
    
        function validatePassword() {
            const contrasenaInput = container.querySelector('#contrasena');
            const contrasenaError = container.querySelector('#contrasena-error');
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<,>.?/~`]).{8,}$/;
            if (!passwordRegex.test(contrasenaInput.value)) {
                showError(contrasenaError, 'La contraseña debe tener 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.');
                return false;
            } else {
                hideError(contrasenaError);
                return true;
            }
        }
    
    function validateRepeatPassword() {
        const repetirContrasenaInput = container.querySelector('#repetir-contrasena');
        const repetirContrasenaError = container.querySelector('#repetir-contrasena-error');
        const contrasenaInput = container.querySelector('#contrasena');
        
        // Si los valores no coinciden, muestra el error
        if (repetirContrasenaInput.value !== contrasenaInput.value) {
            showError(repetirContrasenaError, 'Las contraseñas no coinciden.');
            return false;
        } else {
            // Si los valores sí coinciden, oculta el error
            hideError(repetirContrasenaError);
            return true;
        }
    }
    
        // Validar en tiempo real (al salir de un campo)
        inputs.forEach(inputInfo => {
            const inputElement = container.querySelector('#'+inputInfo.id);
            if (inputElement) {
                inputElement.addEventListener('blur', () => {
                    inputInfo.validator();
                });
            }
        });
    
        if(form){
            // Escuchar el evento de envío del formulario
            form.addEventListener('submit', function(event) {
                event.preventDefault(); // Siempre prevenir el envío por defecto para la validación
        
                let formIsValid = true;
                inputs.forEach(inputInfo => {
                    if (!inputInfo.validator()) {
                        formIsValid = false;
                    }
                });
        
            });
        }

}