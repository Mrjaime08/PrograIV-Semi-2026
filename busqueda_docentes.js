const busqueda_docentes = {
    data() {
        return {
            buscar: '',
            docentes: []
        }
    },
    methods: {
        modificarDocente(docente) {
            this.$emit('modificar', docente);
        },
        async obtenerDocentes() {
            try {
                if (this.buscar.trim() === "") {
                    this.docentes = await db.docentes.toArray();
                } else {
                    let texto = this.buscar.toLowerCase();
                    this.docentes = await db.docentes.filter(docente => 
                        docente.codigo.toLowerCase().includes(texto) || 
                        docente.nombre.toLowerCase().includes(texto)
                    ).toArray();
                }
            } catch (error) {
                console.error("Error cargando docentes: ", error);
            }
        },
        async cambiarEstado(docente, e) {
            if(e) e.stopPropagation(); 
            
            let estadoActual = docente.estado || 'Activo';
            let nuevoEstado = estadoActual === 'Activo' ? 'Inactivo' : 'Activo';
            let accionTexto = nuevoEstado === 'Inactivo' ? 'dar de baja' : 'reactivar';
            let colorBoton = nuevoEstado === 'Inactivo' ? '#d33' : '#198754';
            
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a ${accionTexto} al docente ${docente.nombre}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: colorBoton,
                cancelButtonColor: '#6c757d',
                confirmButtonText: `Sí, ${accionTexto}`,
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    let docenteLimpio = { ...docente };
                    docenteLimpio.estado = nuevoEstado;
                    
                    await db.docentes.put(docenteLimpio);
                    
                    Swal.fire({
                        title: '¡Actualizado!',
                        text: `El docente ahora está ${nuevoEstado}.`,
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                    
                    this.obtenerDocentes();
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo actualizar el estado.', 'error');
                }
            }
        }
    },
    mounted() {
        this.obtenerDocentes();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <span>LISTADO DE DOCENTES</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerDocentes" class="form-control border-0 shadow-none" placeholder="Buscar docente...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>NOMBRE</th>
                                        <th>DIRECCIÓN</th>
                                        <th>EMAIL</th>
                                        <th>CONTRATO</th>
                                        <th>ESTADO</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="docente in docentes" :key="docente.idDocente" @click="modificarDocente(docente)" style="cursor: pointer">
                                        <td class="fw-bold text-primary">{{ docente.codigo }}</td>
                                        <td class="text-start">{{ docente.nombre }}</td>
                                        <td>{{ docente.direccion }}</td>
                                        <td>{{ docente.email }}</td>
                                        <td>
                                            <span class="badge bg-secondary">{{ docente.contrato || 'N/A' }}</span>
                                        </td>
                                        <td>
                                            <span class="badge" :class="(!docente.estado || docente.estado === 'Activo') ? 'bg-success' : 'bg-danger'">
                                                {{ docente.estado ? docente.estado.toUpperCase() : 'ACTIVO' }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarDocente(docente)" title="Editar Docente">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>

                                            <button v-if="!docente.estado || docente.estado === 'Activo'" class="btn btn-outline-danger btn-sm border-0" @click.stop="cambiarEstado(docente, $event)" title="Dar de baja">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
                                            
                                            <button v-else class="btn btn-outline-success btn-sm border-0" @click.stop="cambiarEstado(docente, $event)" title="Reactivar">
                                                <i class="bi bi-check-circle-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="docentes.length === 0">
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