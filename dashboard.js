const dashboard = {
    props: ['usuario'], 
    emits: ['navegar'], // Declaramos la emisión
    data() {
        return {
            totalAlumnos: 0,
            totalDocentes: 0,
            totalMaterias: 0,
            totalMatriculas: 0
        }
    },
    methods: {
        async cargarEstadisticas(mostrarAlerta = false) {
            try {
                this.totalAlumnos = await db.alumnos.count();
                this.totalDocentes = await db.docentes.count();
                this.totalMaterias = await db.materias.count();
                this.totalMatriculas = await db.matriculas.count();

                if (mostrarAlerta === true) {
                    Swal.fire({
                        title: '¡Datos Actualizados!',
                        icon: 'success',
                        timer: 1000,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                }
            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
                if (mostrarAlerta === true) {
                    Swal.fire('Error', 'No se pudieron cargar los datos.', 'error');
                }
            }
        },
        //  FUNCIÓN PARA NAVEGAR AL DAR CLIC EN LAS TARJETAS 
        irA(ventana) {
            this.$emit('navegar', ventana);
        }
    },
    mounted() {
        this.cargarEstadisticas(false);
    },
    template: `
        <div class="row mt-3">
            <div class="col-12 mb-4">
                <div class="card card-custom shadow-sm text-white p-4" style="background: linear-gradient(135deg, #0d6efd, #0a58ca);">
                    <div class="d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                            <h2 class="fw-bold mb-2">¡Bienvenido al Sistema Académico Pro!</h2>
                            <p class="mb-0 fs-5">
                                Hola, <strong>{{ usuario ? usuario.email : 'Usuario' }}</strong>. 
                                <span class="ms-2 badge bg-warning text-dark border border-light">
                                    NIVEL: {{ usuario ? usuario.rol.toUpperCase() : 'DESCONOCIDO' }}
                                </span>
                            </p>
                        </div>
                        <i class="bi bi-person-circle d-none d-md-block" style="font-size: 4rem; opacity: 0.8;"></i>
                    </div>
                </div>
            </div>

            <div class="col-12 mb-3 text-end">
                <button class="btn btn-outline-primary btn-sm fw-bold" @click="cargarEstadisticas(true)">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar Datos
                </button>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card card-custom shadow-sm hover-elevate h-100 border-start border-primary border-4"
                     style="cursor: pointer;" @click="irA('alumnos')" title="Ir a Módulo de Alumnos">
                    <div class="card-body text-center">
                        <i class="bi bi-people-fill text-primary mb-3" style="font-size: 2.5rem;"></i>
                        <h6 class="form-label-custom text-muted">Total Alumnos</h6>
                        <h2 class="fw-bold text-dark mb-0">{{ totalAlumnos }}</h2>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card card-custom shadow-sm hover-elevate h-100 border-start border-success border-4"
                     style="cursor: pointer;" @click="irA('docentes')" title="Ir a Módulo de Docentes">
                    <div class="card-body text-center">
                        <i class="bi bi-person-vcard-fill text-success mb-3" style="font-size: 2.5rem;"></i>
                        <h6 class="form-label-custom text-muted">Docentes Registrados</h6>
                        <h2 class="fw-bold text-dark mb-0">{{ totalDocentes }}</h2>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card card-custom shadow-sm hover-elevate h-100 border-start border-warning border-4"
                     style="cursor: pointer;" @click="irA('materias')" title="Ir a Módulo de Materias">
                    <div class="card-body text-center">
                        <i class="bi bi-book-half text-warning mb-3" style="font-size: 2.5rem;"></i>
                        <h6 class="form-label-custom text-muted">Materias Activas</h6>
                        <h2 class="fw-bold text-dark mb-0">{{ totalMaterias }}</h2>
                    </div>
                </div>
            </div>

            <div class="col-md-3 mb-4">
                <div class="card card-custom shadow-sm hover-elevate h-100 border-start border-info border-4"
                     style="cursor: pointer;" @click="irA('matriculas')" title="Ir a Módulo de Matrículas">
                    <div class="card-body text-center">
                        <i class="bi bi-journal-check text-info mb-3" style="font-size: 2.5rem;"></i>
                        <h6 class="form-label-custom text-muted">Matrículas Realizadas</h6>
                        <h2 class="fw-bold text-dark mb-0">{{ totalMatriculas }}</h2>
                    </div>
                </div>
            </div>

        </div>
    `
};