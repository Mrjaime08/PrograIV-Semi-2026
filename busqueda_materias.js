const busqueda_materias = {
    data() {
        return {
            buscar: '',
            materias: []
        }
    },
    methods: {
        modificarMateria(materia) {
            this.$emit('modificar', materia);
        },
        async obtenerMaterias() {
            try {
                if (this.buscar.trim() === "") {
                    this.materias = await db.materias.toArray();
                } else {
                    let texto = this.buscar.toLowerCase();
                    this.materias = await db.materias.filter(materia => 
                        materia.codigo.toLowerCase().includes(texto) || 
                        materia.nombre.toLowerCase().includes(texto)
                    ).toArray();
                }
            } catch (error) {
                console.error("Error cargando materias: ", error);
            }
        },
        // Reemplazamos la eliminación física por la alerta SweetAlert y el borrado lógico
        async cambiarEstado(materia, e) {
            if(e) e.stopPropagation(); 
            
            let estadoActual = materia.estado || 'Activo';
            let nuevoEstado = estadoActual === 'Activo' ? 'Inactiva' : 'Activo';
            let accionTexto = nuevoEstado === 'Inactiva' ? 'dar de baja' : 'reactivar';
            let colorBoton = nuevoEstado === 'Inactiva' ? '#d33' : '#198754';
            
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a ${accionTexto} la materia ${materia.nombre}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: colorBoton,
                cancelButtonColor: '#6c757d',
                confirmButtonText: `Sí, ${accionTexto}`,
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    let materiaLimpia = { ...materia };
                    materiaLimpia.estado = nuevoEstado;
                    
                    await db.materias.put(materiaLimpia);
                    
                    Swal.fire({
                        title: '¡Actualizado!',
                        text: `La materia ahora está ${nuevoEstado}.`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    this.obtenerMaterias();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo cambiar el estado de la materia.', 'error');
                }
            }
        }
    },
    mounted() {
        this.obtenerMaterias();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <span>LISTADO DE MATERIAS</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerMaterias" class="form-control border-0 shadow-none" placeholder="Buscar materia...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>NOMBRE</th>
                                        <th>UV</th>
                                        <th>CICLO</th>
                                        <th>MODALIDAD</th>
                                        <th>ESTADO</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="materia in materias" :key="materia.idMateria" @click="modificarMateria(materia)" style="cursor: pointer">
                                        <td class="fw-bold text-primary">{{ materia.codigo }}</td>
                                        <td>{{ materia.nombre }}</td>
                                        <td>{{ materia.uv }}</td>
                                        <td>{{ materia.ciclo || 'N/A' }}</td>
                                        <td>{{ materia.modalidad || 'N/A' }}</td>
                                        <td>
                                            <span class="badge" :class="(!materia.estado || materia.estado === 'Activo') ? 'bg-success' : 'bg-danger'">
                                                {{ materia.estado ? materia.estado.toUpperCase() : 'ACTIVO' }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarMateria(materia)">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            
                                            <button v-if="!materia.estado || materia.estado === 'Activo'" class="btn btn-outline-danger btn-sm border-0" @click.stop="cambiarEstado(materia, $event)">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
                                            
                                            <button v-else class="btn btn-outline-success btn-sm border-0" @click.stop="cambiarEstado(materia, $event)">
                                                <i class="bi bi-check-circle-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="materias.length === 0">
                                        <td colspan="7" class="text-center text-muted p-4">No se encontraron registros.</td>
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