const { createApp } = Vue;

// --- base de datos Dexie con codigo estudiantil---
const db = new Dexie("db_USSS018724");

// Definimos las tablas (agregando autores y libros)
db.version(1).stores({
    alumnos: "idAlumno, codigo, nombre, direccion, email, telefono, estado",
    materias: "idMateria, codigo, nombre, uv, estado",
    matriculas: "idMatricula, idAlumno, fecha, ciclo",
    inscripciones: "idInscripcion, idAlumno, idMateria, fecha",
    docentes: "idDocente, codigo, nombre, estado",
    usuarios: "idUsuario, email, password, rol, estado",
    autores: "idAutor, codigo, nombre, nacionalidad",
    libros: "idLibro, idAutor, titulo, isbn, genero"
});

// Crear el SÚPER ADMINISTRADOR por defecto
db.on('populate', async () => {
    await db.usuarios.add({
        idUsuario: 1,
        email: 'jaime@admin.com',
        password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        rol: 'superadmin',
        estado: 'activo'
    });
});

createApp({
    components: {
        dashboard, 
        alumnos, busqueda_alumnos,
        materias, busqueda_materias,
        matriculas, busqueda_matriculas,
        inscripciones, busqueda_inscripciones,
        docentes, busqueda_docentes,
        autores, busqueda_autores, // <-- NUEVOS
        libros, busqueda_libros,   // <-- NUEVOS
        login, panel_admin
    },
    data() {
        return {
            estaAutenticado: false, 
            usuarioActual: null,    
            forms: {
                dashboard: { mostrar: false }, 
                alumnos: { mostrar: false },
                busqueda_alumnos: { mostrar: false },
                materias: { mostrar: false },
                busqueda_materias: { mostrar: false },
                matriculas: { mostrar: false },
                busqueda_matriculas: { mostrar: false },
                inscripciones: { mostrar: false },
                busqueda_inscripciones: { mostrar: false },
                docentes: { mostrar: false },
                busqueda_docentes: { mostrar: false },
                autores: { mostrar: false },             // <-- NUEVOS
                busqueda_autores: { mostrar: false },    // <-- NUEVOS
                libros: { mostrar: false },              // <-- NUEVOS
                busqueda_libros: { mostrar: false },     // <-- NUEVOS
                panel_admin: { mostrar: false }
            }
        }
    },
    methods: {
        iniciarSesion(usuario) {
            this.estaAutenticado = true;
            this.usuarioActual = usuario;
            this.abrirVentana('dashboard');
        },
        async cerrarSesion() {
            const result = await Swal.fire({
                title: '¿Cerrar Sesión?',
                text: '¿Estás seguro de que deseas salir del sistema?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: '<i class="bi bi-box-arrow-right"></i> Sí, salir',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Sesión Cerrada',
                    text: 'Has salido del sistema de forma segura.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                this.estaAutenticado = false;
                this.usuarioActual = null;
                Object.keys(this.forms).forEach(key => {
                    this.forms[key].mostrar = false;
                });
            }
        },
        abrirVentana(ventana) {
            Object.keys(this.forms).forEach(key => {
                this.forms[key].mostrar = false;
            });
            this.forms[ventana].mostrar = true;
        },
        buscar(ventana, metodo) {
            if(this.$refs[ventana]){
                this.$refs[ventana][metodo]();
            }
        },
        modificar(ventana, metodo, data) {
            if(this.$refs[ventana]){
                this.$refs[ventana][metodo](data);
            }
        }
    }
}).mount("#app");