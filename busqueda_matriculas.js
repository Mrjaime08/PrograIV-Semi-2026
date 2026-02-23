const busqueda_matriculas = {
    data() {
        return {
            buscar: '',
            listaMatriculas: [] 
        }
    },
    methods: {
        modificarMatricula(matricula) {
            this.$emit('modificar', matricula);
        },
        async obtenerMatriculas() {
            try {
                let resultados = [];
                if (this.buscar.trim() === "") {
                    resultados = await db.matriculas.toArray();
                } else {
                    let texto = this.buscar.toLowerCase();
                    resultados = await db.matriculas.filter(m => 
                        m.ciclo.toLowerCase().includes(texto)
                    ).toArray();
                }
                
                // JOIN manual para obtener nombres
                this.listaMatriculas = await Promise.all(resultados.map(async (m) => {
                    let alumno = await db.alumnos.get(m.idAlumno);
                    return {
                        ...m,
                        nombreAlumno: alumno ? alumno.nombre : '---',
                        codigoAlumno: alumno ? alumno.codigo : '---'
                    };
                }));
            } catch (error) {
                console.error("Error cargando matrículas: ", error);
            }
        },
        // Reemplazado eliminarMatricula por cambiarEstado para Anular/Activar
        async cambiarEstado(matricula, e) {
            if(e) e.stopPropagation();
            
            let estadoActual = matricula.estado || 'Activa';
            let nuevoEstado = estadoActual === 'Activa' ? 'Anulada' : 'Activa';
            let accionTexto = nuevoEstado === 'Anulada' ? 'anular' : 'reactivar';
            let colorBoton = nuevoEstado === 'Anulada' ? '#d33' : '#198754';

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a ${accionTexto} la matrícula de ${matricula.nombreAlumno}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: colorBoton,
                cancelButtonColor: '#6c757d',
                confirmButtonText: `Sí, ${accionTexto}`,
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    // Limpiamos los datos "extra" del JOIN antes de guardar en la BD original
                    let matriculaLimpia = {
                        idMatricula: matricula.idMatricula,
                        idAlumno: matricula.idAlumno,
                        fecha: matricula.fecha,
                        ciclo: matricula.ciclo,
                        turno: matricula.turno,
                        estado: nuevoEstado
                    };
                    
                    await db.matriculas.put(matriculaLimpia);
                    
                    Swal.fire({
                        title: '¡Actualizado!',
                        text: `La matrícula ahora está ${nuevoEstado}.`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    this.obtenerMatriculas();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo actualizar el estado de la matrícula.', 'error');
                }
            }
        }
    },
    mounted() {
        this.obtenerMatriculas();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom bg-info text-white d-flex justify-content-between align-items-center">
                        <span class="fw-bold"><i class="bi bi-journal-bookmark-fill me-2"></i> HISTORIAL DE MATRÍCULAS</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search text-info"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerMatriculas" class="form-control border-0 shadow-none" placeholder="Buscar por ciclo...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>FECHA</th>
                                        <th>CÓDIGO</th>
                                        <th class="text-start">ESTUDIANTE</th>
                                        <th>CICLO</th>
                                        <th>TURNO</th>
                                        <th>ESTADO</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in listaMatriculas" :key="item.idMatricula" @click="modificarMatricula(item)" style="cursor: pointer">
                                        <td>{{ item.fecha }}</td>
                                        <td class="fw-bold text-primary">{{ item.codigoAlumno }}</td>
                                        <td class="text-start">{{ item.nombreAlumno }}</td>
                                        <td><span class="badge bg-secondary">{{ item.ciclo }}</span></td>
                                        <td>{{ item.turno || '---' }}</td>
                                        <td>
                                            <span class="badge" :class="(!item.estado || item.estado === 'Activa') ? 'bg-success' : 'bg-danger'">
                                                {{ item.estado ? item.estado.toUpperCase() : 'ACTIVA' }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarMatricula(item)" title="Editar Matrícula">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            
                                            <button v-if="!item.estado || item.estado === 'Activa'" class="btn btn-outline-danger btn-sm border-0" @click.stop="cambiarEstado(item, $event)" title="Anular Matrícula">
                                                <i class="bi bi-x-circle-fill"></i>
                                            </button>
                                            
                                            <button v-else class="btn btn-outline-success btn-sm border-0" @click.stop="cambiarEstado(item, $event)" title="Reactivar Matrícula">
                                                <i class="bi bi-check-circle-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="listaMatriculas.length === 0">
                                        <td colspan="7" class="text-center text-muted p-4">No se encontraron matrículas registradas.</td>
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