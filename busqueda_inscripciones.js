const busqueda_inscripciones = {
    data() {
        return {
            buscar: '',
            listaInscripciones: []
        }
    },
    methods: {
        modificarInscripcion(inscripcion) {
            this.$emit('modificar', inscripcion);
        },
        async obtenerInscripciones() {
            try {
                let resultados = await db.inscripciones.toArray();

                // Triple JOIN manual
                let listadoCompleto = await Promise.all(resultados.map(async (ins) => {
                    let alumno = await db.alumnos.get(ins.idAlumno);
                    let materia = await db.materias.get(ins.idMateria);
                    return {
                        ...ins,
                        nombreAlumno: alumno ? alumno.nombre : '---',
                        codigoAlumno: alumno ? alumno.codigo : '---',
                        nombreMateria: materia ? materia.nombre : '---',
                        codigoMateria: materia ? materia.codigo : '---'
                    };
                }));

                // Filtro en memoria
                if (this.buscar.trim() !== "") {
                    let texto = this.buscar.toLowerCase();
                    this.listaInscripciones = listadoCompleto.filter(item => 
                        item.nombreAlumno.toLowerCase().includes(texto) || 
                        item.nombreMateria.toLowerCase().includes(texto)
                    );
                } else {
                    this.listaInscripciones = listadoCompleto;
                }
            } catch (error) {
                console.error("Error cargando inscripciones: ", error);
            }
        },
        async cambiarEstado(inscripcion, e) {
            if(e) e.stopPropagation();
            
            let estadoActual = inscripcion.estado || 'Activa';
            let nuevoEstado = estadoActual === 'Activa' ? 'Anulada' : 'Activa';
            let accionTexto = nuevoEstado === 'Anulada' ? 'anular' : 'reactivar';
            let colorBoton = nuevoEstado === 'Anulada' ? '#d33' : '#198754';

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a ${accionTexto} esta materia para el alumno ${inscripcion.nombreAlumno}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: colorBoton,
                cancelButtonColor: '#6c757d',
                confirmButtonText: `Sí, ${accionTexto}`,
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    // Limpiamos los datos del JOIN para no saturar la BD
                    let inscripcionLimpia = {
                        idInscripcion: inscripcion.idInscripcion,
                        idAlumno: inscripcion.idAlumno,
                        idMateria: inscripcion.idMateria,
                        fecha: inscripcion.fecha,
                        notaFinal: inscripcion.notaFinal,
                        estadoMateria: inscripcion.estadoMateria,
                        estado: nuevoEstado
                    };
                    
                    await db.inscripciones.put(inscripcionLimpia);
                    
                    Swal.fire({
                        title: '¡Actualizado!',
                        text: `La inscripción ahora está ${nuevoEstado}.`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    this.obtenerInscripciones();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
                }
            }
        }
    },
    mounted() {
        this.obtenerInscripciones();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom bg-primary d-flex justify-content-between align-items-center">
                        <span>INSCRIPCIONES REALIZADAS</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerInscripciones" class="form-control border-0 shadow-none" placeholder="Buscar alumno o materia...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>FECHA</th>
                                        <th>ALUMNO</th>
                                        <th>MATERIA</th>
                                        <th class="text-center">NOTA</th>
                                        <th class="text-center">ESTADO</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in listaInscripciones" :key="item.idInscripcion" @click="modificarInscripcion(item)" style="cursor: pointer">
                                        <td>{{ item.fecha }}</td>
                                        <td>
                                            <div class="fw-bold">{{ item.nombreAlumno }}</div>
                                            <small class="text-muted">{{ item.codigoAlumno }}</small>
                                        </td>
                                        <td>
                                            <div class="fw-bold">{{ item.nombreMateria }}</div>
                                            <small class="text-muted">{{ item.codigoMateria }}</small>
                                        </td>
                                        <td class="text-center fw-bold text-primary">
                                            {{ item.notaFinal }}
                                        </td>
                                        <td class="text-center">
                                            <span class="badge me-1" :class="item.estadoMateria === 'Aprobada' ? 'bg-success' : (item.estadoMateria === 'Reprobada' ? 'bg-danger' : 'bg-warning text-dark')">
                                                {{ item.estadoMateria || 'Cursando' }}
                                            </span>
                                            
                                            <span v-if="item.estado === 'Anulada'" class="badge bg-secondary">ANULADA</span>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarInscripcion(item)" title="Editar">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>

                                            <button v-if="!item.estado || item.estado === 'Activa'" class="btn btn-outline-danger btn-sm border-0" @click.stop="cambiarEstado(item, $event)" title="Anular Inscripción">
                                                <i class="bi bi-x-circle-fill"></i>
                                            </button>
                                            
                                            <button v-else class="btn btn-outline-success btn-sm border-0" @click.stop="cambiarEstado(item, $event)" title="Reactivar">
                                                <i class="bi bi-check-circle-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="listaInscripciones.length === 0">
                                        <td colspan="6" class="text-center text-muted p-4">No se encontraron inscripciones registradas.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};