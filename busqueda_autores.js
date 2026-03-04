const busqueda_autores = {
    data() {
        return {
            buscar: '',
            autores: []
        }
    },
    methods: {
        modificarAutor(autor) {
            this.$emit('modificar', autor);
        },
        async obtenerAutores() {
            try {
                if (this.buscar.trim() === "") {
                    this.autores = await db.autores.toArray();
                } else {
                    let texto = this.buscar.toLowerCase();
                    // Filtramos por código, nombre o nacionalidad
                    this.autores = await db.autores.filter(autor => 
                        autor.codigo.toLowerCase().includes(texto) || 
                        autor.nombre.toLowerCase().includes(texto) ||
                        autor.nacionalidad.toLowerCase().includes(texto)
                    ).toArray();
                }
            } catch (error) {
                console.error("Error cargando autores: ", error);
            }
        },
        async eliminarAutor(idAutor, nombre, e) {
            // Evitamos que el clic en el botón active el clic de la fila (que abre editar)
            if(e) e.stopPropagation(); 

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a eliminar definitivamente al autor ${nombre}.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    await db.autores.delete(idAutor);
                    this.obtenerAutores();
                    
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El autor ha sido borrado del sistema.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo eliminar al autor.', 'error');
                }
            }
        }
    },
    mounted() {
        this.obtenerAutores();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom bg-primary d-flex justify-content-between align-items-center">
                        <span class="fw-bold"><i class="bi bi-person-lines-fill me-2"></i> LISTADO DE AUTORES</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search text-primary"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerAutores" class="form-control border-0 shadow-none" placeholder="Buscar autor...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th class="text-start">NOMBRE COMPLETO</th>
                                        <th>NACIONALIDAD</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="autor in autores" :key="autor.idAutor" @click="modificarAutor(autor)" style="cursor: pointer">
                                        <td class="fw-bold text-primary">{{ autor.codigo }}</td>
                                        <td class="text-start">{{ autor.nombre }}</td>
                                        <td><span class="badge bg-secondary">{{ autor.nacionalidad }}</span></td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarAutor(autor)" title="Editar Autor">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm border-0" @click.stop="eliminarAutor(autor.idAutor, autor.nombre, $event)" title="Eliminar Autor">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="autores.length === 0">
                                        <td colspan="4" class="text-center text-muted p-4">No se encontraron autores registrados.</td>
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