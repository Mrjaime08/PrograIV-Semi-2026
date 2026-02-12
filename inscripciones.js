const inscripciones = {
    props: ['forms'],
    components: {
        'v-select': window['vue-select']
    },
    data() {
        return {
            inscripcion: {
                idInscripcion: 0,
                idAlumno: '',
                idMateria: '',
                fecha: new Date().toISOString().split('T')[0],
                alumnoObj: null, 
                materiaObj: null 
            },
            listadoAlumnos: [],
            listadoMaterias: [],
            accion: 'nuevo',
            idInscripcion: 0
        }
    },
    // --- NUEVO BLOQUE: OBSERVADOR ---
    watch: {
        "forms.inscripciones.mostrar"(nuevoValor) {
            if (nuevoValor) {
                this.cargarDatos(); // Recargar listas al abrir
            }
        }
    },
    // --------------------------------
    methods: {
        buscarInscripcion() {
            this.forms.busqueda_inscripciones.mostrar = !this.forms.busqueda_inscripciones.mostrar;
            this.$emit('buscar');
        },
        async cargarDatos() {
            // Cargar Alumnos
            let rawAlumnos = await db.alumnos.toArray();
            this.listadoAlumnos = rawAlumnos.map(a => ({
                label: `${a.codigo} - ${a.nombre}`,
                id: a.idAlumno
            }));

            // Cargar Materias
            let rawMaterias = await db.materias.toArray();
            this.listadoMaterias = rawMaterias.map(m => ({
                label: `${m.codigo} - ${m.nombre}`,
                id: m.idMateria
            }));
        },
        async guardarInscripcion() {
            if (!this.inscripcion.alumnoObj || !this.inscripcion.alumnoObj.id) {
                alert("Seleccione un alumno.");
                return;
            }
            if (!this.inscripcion.materiaObj || !this.inscripcion.materiaObj.id) {
                alert("Seleccione una materia.");
                return;
            }

            let alumnoId = this.inscripcion.alumnoObj.id;

            // VALIDACIÓN: ¿ESTÁ MATRICULADO?
            let estaMatriculado = await db.matriculas
                .where("idAlumno")
                .equals(alumnoId)
                .count();

            if (estaMatriculado === 0) {
                alert("⛔ ERROR: Este alumno NO está matriculado. No puede inscribir materias.");
                return; 
            }

            let datos = {
                idInscripcion: this.accion == 'modificar' ? this.idInscripcion : new Date().getTime(),
                idAlumno: alumnoId,
                idMateria: this.inscripcion.materiaObj.id,
                fecha: this.inscripcion.fecha
            };

            try {
                await db.inscripciones.put(datos);
                alert("Materia inscrita correctamente.");
                this.limpiarFormulario();
                this.buscarInscripcion();
            } catch (error) {
                console.error(error);
                alert("Error al guardar: " + error);
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idInscripcion = 0;
            this.inscripcion = {
                idInscripcion: 0, idAlumno: '', idMateria: '', fecha: new Date().toISOString().split('T')[0], alumnoObj: null, materiaObj: null
            };
        }
    },
    mounted() {
        this.cargarDatos();
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarInscripcion" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center">
                            <i class="bi bi-journal-check me-2"></i> {{ accion === 'nuevo' ? 'INSCRIPCIÓN DE MATERIAS' : 'EDITAR INSCRIPCIÓN' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label-custom">ALUMNO:</label>
                                    <v-select 
                                        v-model="inscripcion.alumnoObj" 
                                        :options="listadoAlumnos"
                                        placeholder="Buscar alumno..."
                                    ></v-select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label-custom">MATERIA:</label>
                                    <v-select 
                                        v-model="inscripcion.materiaObj" 
                                        :options="listadoMaterias"
                                        placeholder="Buscar materia..."
                                    ></v-select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">FECHA:</label>
                                    <input required v-model="inscripcion.fecha" type="date" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom shadow-sm px-4">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom shadow-sm px-4">NUEVO</button>
                            <button type="button" @click="buscarInscripcion" class="btn btn-success btn-custom shadow-sm px-4">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};