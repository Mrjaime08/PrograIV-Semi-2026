const login = {
    data() {
        return {
            modo: 'login', // Alterna entre 'login' y 'registro'
            email: '',
            password: ''
        }
    },
    methods: {
        async procesarFormulario() {
            if (!this.email || !this.password) {
                Swal.fire('Atención', 'Por favor, completa todos los campos.', 'warning');
                return;
            }

            // Hasheamos la contraseña ingresada usando la librería js-sha256
            let hashPassword = sha256(this.password);

            if (this.modo === 'registro') {
                // LÓGICA DE REGISTRO 
                try {
                    // Verificar si el correo ya existe en la base de datos
                    let existe = await db.usuarios.where("email").equals(this.email).count();
                    if (existe > 0) {
                        Swal.fire('Error', 'Este correo ya está registrado.', 'error');
                        return;
                    }

                    // Guardar el nuevo usuario en estado "pendiente"
                    await db.usuarios.put({
                        idUsuario: new Date().getTime(),
                        email: this.email,
                        password: hashPassword, // Guardamos el hash, no la contraseña real
                        rol: 'usuario',
                        estado: 'pendiente' // Requiere aprobación del Súper Administrador
                    });

                    // Alerta elegante de registro exitoso
                    Swal.fire({
                        title: '¡Registro exitoso!',
                        text: 'Tu cuenta está PENDIENTE. Un administrador debe aprobarla para que puedas entrar.',
                        icon: 'info',
                        confirmButtonText: 'Entendido',
                        confirmButtonColor: '#0d6efd'
                    });
                    
                    // Limpiar el formulario y regresar a la vista de login
                    this.modo = 'login';
                    this.password = '';
                } catch (error) {
                    console.error("Error al registrar:", error);
                    Swal.fire('Error', 'Ocurrió un error al registrar el usuario.', 'error');
                }
                
            } else {
                // --- LÓGICA DE LOGIN ---
                try {
                    // Buscar coincidencia exacta de correo y contraseña hasheada
                    let usuario = await db.usuarios.where({
                        email: this.email,
                        password: hashPassword
                    }).first();

                    if (!usuario) {
                        Swal.fire('Error', 'Correo o contraseña incorrectos.', 'error');
                        return;
                    }

                    // Validar si la cuenta ya fue aprobada
                    if (usuario.estado === 'pendiente') {
                        Swal.fire({
                            title: 'Acceso Denegado',
                            text: 'Tu cuenta aún está PENDIENTE de aprobación por el Súper Administrador.',
                            icon: 'warning',
                            confirmButtonColor: '#ffc107'
                        });
                        return;
                    }

                    // Si todo está bien, permitimos el acceso
                    this.$emit('login-exitoso', usuario);
                    
                } catch (error) {
                    console.error("Error al iniciar sesión:", error);
                    Swal.fire('Error', 'Ocurrió un error al verificar las credenciales.', 'error');
                }
            }
        },
        cambiarModo() {
            // Alternar la vista y limpiar la contraseña por seguridad
            this.modo = this.modo === 'login' ? 'registro' : 'login';
            this.password = ''; 
        }
    },
    template: `
        <div class="row justify-content-center mt-5">
            <div class="col-md-5 mt-5">
                <div class="card card-custom shadow-lg border-0">
                    <div class="card-header-custom text-center py-3">
                        <i class="bi bi-shield-lock-fill me-2" style="font-size: 1.5rem;"></i> 
                        <h4 class="d-inline align-middle m-0">{{ modo === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARSE' }}</h4>
                    </div>
                    <div class="card-body p-4 bg-white">
                        <form @submit.prevent="procesarFormulario">
                            <div class="mb-3">
                                <label class="form-label-custom">CORREO ELECTRÓNICO:</label>
                                <input required v-model="email" type="email" class="form-control form-control-lg" placeholder="ejemplo@correo.com">
                            </div>
                            <div class="mb-4">
                                <label class="form-label-custom">CONTRASEÑA:</label>
                                <input required v-model="password" type="password" class="form-control form-control-lg" placeholder="********">
                            </div>
                            <div class="d-grid gap-2 mt-4">
                                <button type="submit" class="btn btn-primary btn-custom btn-lg fw-bold shadow-sm">
                                    {{ modo === 'login' ? 'ENTRAR AL SISTEMA' : 'CREAR CUENTA' }}
                                </button>
                            </div>
                        </form>
                        <div class="mt-4 text-center">
                            <a href="#" @click.prevent="cambiarModo" class="text-decoration-none fw-bold text-primary">
                                {{ modo === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia Sesión' }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};