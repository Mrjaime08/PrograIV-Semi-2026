const matriculas = {
    props: ['forms'],
    components: {
        'v-select': window['vue-select']
    },
    data() {
        return {
            matricula: {
                idMatricula: 0,
                idAlumno: '',
                fecha: new Date().toISOString().split('T')[0], 
                ciclo: '1-2026',
                turno: 'Mañana', //  Nuevo campo
                estado: 'Activa', // Nuevo campo para borrado lógico
                alumnoObj: null
            },
            listadoAlumnos: [],
            accion: 'nuevo',
            idMatricula: 0
        }
    },
    watch: {
        "forms.matriculas.mostrar"(nuevoValor) {
            if (nuevoValor) {
                this.cargarAlumnos();
            }
        }
    },
    methods: {
        buscarMatricula() {
            this.forms.busqueda_matriculas.mostrar = !this.forms.busqueda_matriculas.mostrar;
            this.$emit('buscar');
        },
        async cargarAlumnos() {
            // Solo cargamos alumnos activos para que no matriculen a alguien dado de baja
            let datos = await db.alumnos.filter(a => !a.estado || a.estado === 'Activo').toArray();
            this.listadoAlumnos = datos.map(alumno => ({
                label: `${alumno.codigo} - ${alumno.nombre}`,
                id: alumno.idAlumno
            }));
        },
        modificarMatricula(datos) {
            this.accion = 'modificar';
            this.idMatricula = datos.idMatricula;
            this.matricula = { ...datos };
            
            if(datos.idAlumno){
                db.alumnos.get(datos.idAlumno).then(alumno => {
                    if(alumno) {
                        this.matricula.alumnoObj = {
                            label: `${alumno.codigo} - ${alumno.nombre}`,
                            id: alumno.idAlumno
                        };
                    }
                });
            }
        },
        async guardarMatricula() {
            if (!this.matricula.alumnoObj || !this.matricula.alumnoObj.id) {
                return Swal.fire('Faltan Datos', 'Debe seleccionar un alumno para matricular.', 'warning');
            }

            let datos = {
                idMatricula: this.accion == 'modificar' ? this.idMatricula : new Date().getTime(),
                idAlumno: this.matricula.alumnoObj.id,
                fecha: this.matricula.fecha,
                ciclo: this.matricula.ciclo,
                turno: this.matricula.turno,
                estado: this.matricula.estado || 'Activa'
            };

            try {
                await db.matriculas.put(datos);
                
                Swal.fire({
                    title: this.accion === 'nuevo' ? '¡Matriculado!' : '¡Actualizado!',
                    text: this.accion === 'nuevo' ? 'El alumno ha sido matriculado con éxito.' : 'Datos de matrícula actualizados.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                this.limpiarFormulario();
                this.buscarMatricula();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Ocurrió un problema al guardar la matrícula.', 'error');
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idMatricula = 0;
            this.matricula = {
                idMatricula: 0, idAlumno: '', fecha: new Date().toISOString().split('T')[0], 
                ciclo: '1-2026', turno: 'Mañana', estado: 'Activa', alumnoObj: null
            };
        }
    },
    mounted() {
        this.cargarAlumnos();
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarMatricula" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center bg-info text-white">
                            <i class="bi bi-credit-card-2-front me-2"></i> {{ accion === 'nuevo' ? 'REGISTRO DE MATRÍCULA' : 'EDITAR MATRÍCULA' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label-custom">ALUMNO (BUSCADOR):</label>
                                    <v-select 
                                        v-model="matricula.alumnoObj" 
                                        :options="listadoAlumnos"
                                        placeholder="Buscar por nombre o código..."
                                    ></v-select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label-custom">CICLO:</label>
                                    <select required v-model="matricula.ciclo" class="form-select">
                                        <option value="1-2026">1-2026</option>
                                        <option value="2-2026">2-2026</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label-custom">TURNO:</label>
                                    <select required v-model="matricula.turno" class="form-select">
                                        <option value="Mañana">Mañana</option>
                                        <option value="Tarde">Tarde</option>
                                        <option value="Noche">Noche</option>
                                        <option value="Sábado">Sábado</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label-custom">FECHA:</label>
                                    <input required v-model="matricula.fecha" type="date" class="form-control">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom shadow-sm px-4">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom shadow-sm px-4">NUEVO</button>
                            <button type="button" @click="buscarMatricula" class="btn btn-success btn-custom shadow-sm px-4">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};