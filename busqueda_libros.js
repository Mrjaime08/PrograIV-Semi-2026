const busqueda_libros = {
    data() {
        return {
            buscar: '',
            listaLibros: []
        }
    },
    methods: {
        modificarLibro(libro) {
            this.$emit('modificar', libro);
        },
        async obtenerLibros() {
            try {
                let resultados = await db.libros.toArray();

                // JOIN manual para obtener los datos del Autor relacionado
                let listadoCompleto = await Promise.all(resultados.map(async (libro) => {
                    let autor = await db.autores.get(libro.idAutor);
                    return {
                        ...libro,
                        nombreAutor: autor ? autor.nombre : 'Desconocido',
                        codigoAutor: autor ? autor.codigo : '---'
                    };
                }));

                // Filtro dinámico en memoria
                if (this.buscar.trim() !== "") {
                    let texto = this.buscar.toLowerCase();
                    this.listaLibros = listadoCompleto.filter(item => 
                        item.titulo.toLowerCase().includes(texto) || 
                        item.nombreAutor.toLowerCase().includes(texto) ||
                        item.isbn.toLowerCase().includes(texto) ||
                        item.genero.toLowerCase().includes(texto)
                    );
                } else {
                    this.listaLibros = listadoCompleto;
                }
            } catch (error) {
                console.error("Error cargando libros: ", error);
            }
        },
        async eliminarLibro(idLibro, titulo, e) {
            if(e) e.stopPropagation();

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a eliminar definitivamente el libro "${titulo}".`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    await db.libros.delete(idLibro);
                    this.obtenerLibros();
                    
                    Swal.fire({
                        title: '¡Eliminado!',
                        text: 'El libro ha sido borrado del inventario.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    console.error(error);
                    Swal.fire('Error', 'No se pudo eliminar el libro.', 'error');
                }
            }
        }
    },
    mounted() {
        this.obtenerLibros();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom bg-info text-white d-flex justify-content-between align-items-center">
                        <span class="fw-bold"><i class="bi bi-book-half me-2"></i> INVENTARIO DE LIBROS</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search text-info"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerLibros" class="form-control border-0 shadow-none" placeholder="Buscar libro, autor o ISBN...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th class="text-start">TÍTULO</th>
                                        <th>AUTOR (RELACIÓN)</th>
                                        <th>ISBN</th>
                                        <th>GÉNERO</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="libro in listaLibros" :key="libro.idLibro" @click="modificarLibro(libro)" style="cursor: pointer">
                                        <td class="fw-bold text-start text-primary">{{ libro.titulo }}</td>
                                        <td>
                                            <div class="fw-bold">{{ libro.nombreAutor }}</div>
                                            <small class="text-muted">{{ libro.codigoAutor }}</small>
                                        </td>
                                        <td>{{ libro.isbn }}</td>
                                        <td><span class="badge bg-secondary">{{ libro.genero }}</span></td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarLibro(libro)" title="Editar Libro">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm border-0" @click.stop="eliminarLibro(libro.idLibro, libro.titulo, $event)" title="Eliminar Libro">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="listaLibros.length === 0">
                                        <td colspan="5" class="text-center text-muted p-4">No se encontraron libros en el inventario.</td>
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