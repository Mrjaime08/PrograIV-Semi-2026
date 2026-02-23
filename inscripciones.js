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
                notaFinal: 0, //  Nuevo campo
                estadoMateria: 'Cursando', // Nuevo campo (Cursando, Aprobada, Reprobada)
                estado: 'Activa', // Nuevo campo para borrado lógico
                alumnoObj: null, 
                materiaObj: null 
            },
            listadoAlumnos: [],
            listadoMaterias: [],
            accion: 'nuevo',
            idInscripcion: 0
        }
    },
    watch: {
        "forms.inscripciones.mostrar"(nuevoValor) {
            if (nuevoValor) {
                this.cargarDatos(); 
            }
        }
    },
    methods: {
        buscarInscripcion() {
            this.forms.busqueda_inscripciones.mostrar = !this.forms.busqueda_inscripciones.mostrar;
            this.$emit('buscar');
        },
        async cargarDatos() {
            // Solo cargamos alumnos y materias ACTIVAS
            let rawAlumnos = await db.alumnos.filter(a => !a.estado || a.estado === 'Activo').toArray();
            this.listadoAlumnos = rawAlumnos.map(a => ({
                label: `${a.codigo} - ${a.nombre}`,
                id: a.idAlumno
            }));

            let rawMaterias = await db.materias.filter(m => !m.estado || m.estado === 'Activo').toArray();
            this.listadoMaterias = rawMaterias.map(m => ({
                label: `${m.codigo} - ${m.nombre}`,
                id: m.idMateria
            }));
        },
        modificarInscripcion(datos) {
            this.accion = 'modificar';
            this.idInscripcion = datos.idInscripcion;
            this.inscripcion = { ...datos };
            
            if(datos.idAlumno){
                db.alumnos.get(datos.idAlumno).then(alumno => {
                    if(alumno) this.inscripcion.alumnoObj = { label: `${alumno.codigo} - ${alumno.nombre}`, id: alumno.idAlumno };
                });
            }
            if(datos.idMateria){
                db.materias.get(datos.idMateria).then(materia => {
                    if(materia) this.inscripcion.materiaObj = { label: `${materia.codigo} - ${materia.nombre}`, id: materia.idMateria };
                });
            }
        },
        async guardarInscripcion() {
            if (!this.inscripcion.alumnoObj || !this.inscripcion.alumnoObj.id) {
                return Swal.fire('Faltan Datos', 'Seleccione un alumno.', 'warning');
            }
            if (!this.inscripcion.materiaObj || !this.inscripcion.materiaObj.id) {
                return Swal.fire('Faltan Datos', 'Seleccione una materia.', 'warning');
            }

            let alumnoId = this.inscripcion.alumnoObj.id;

            // VALIDACIÓN: ¿ESTÁ MATRICULADO? (Y que su matrícula esté activa)
            let estaMatriculado = await db.matriculas
                .where("idAlumno").equals(alumnoId)
                .filter(m => !m.estado || m.estado === 'Activa')
                .count();

            if (estaMatriculado === 0) {
                return Swal.fire('Acceso Denegado', 'Este alumno NO tiene una matrícula activa. No puede inscribir materias.', 'error');
            }

            let datos = {
                idInscripcion: this.accion == 'modificar' ? this.idInscripcion : new Date().getTime(),
                idAlumno: alumnoId,
                idMateria: this.inscripcion.materiaObj.id,
                fecha: this.inscripcion.fecha,
                notaFinal: this.inscripcion.notaFinal,
                estadoMateria: this.inscripcion.estadoMateria,
                estado: this.inscripcion.estado || 'Activa'
            };

            try {
                await db.inscripciones.put(datos);
                
                Swal.fire({
                    title: this.accion === 'nuevo' ? '¡Inscrito!' : '¡Actualizado!',
                    text: this.accion === 'nuevo' ? 'Materia inscrita correctamente.' : 'Datos de inscripción actualizados.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                this.limpiarFormulario();
                this.buscarInscripcion();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Hubo un problema al guardar la inscripción.', 'error');
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idInscripcion = 0;
            this.inscripcion = {
                idInscripcion: 0, idAlumno: '', idMateria: '', fecha: new Date().toISOString().split('T')[0], 
                notaFinal: 0, estadoMateria: 'Cursando', estado: 'Activa', alumnoObj: null, materiaObj: null
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
                        <div class="card-header-custom text-center bg-primary">
                            <i class="bi bi-journal-check me-2"></i> {{ accion === 'nuevo' ? 'INSCRIPCIÓN DE MATERIAS' : 'EDITAR INSCRIPCIÓN' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label-custom">ALUMNO:</label>
                                    <v-select v-model="inscripcion.alumnoObj" :options="listadoAlumnos" placeholder="Buscar alumno..."></v-select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label-custom">MATERIA:</label>
                                    <v-select v-model="inscripcion.materiaObj" :options="listadoMaterias" placeholder="Buscar materia..."></v-select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label-custom">FECHA:</label>
                                    <input required v-model="inscripcion.fecha" type="date" class="form-control">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label-custom">ESTADO MATERIA:</label>
                                    <select required v-model="inscripcion.estadoMateria" class="form-select">
                                        <option value="Cursando">Cursando</option>
                                        <option value="Aprobada">Aprobada</option>
                                        <option value="Reprobada">Reprobada</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label-custom">NOTA FINAL:</label>
                                    <input required v-model="inscripcion.notaFinal" type="number" step="0.1" min="0" max="10" class="form-control">
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