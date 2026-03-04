const libros = {
    props: ['forms'],
    components: {
        'v-select': window['vue-select']
    },
    data() {
        return {
            libro: {
                idLibro: 0,
                idAutor: '',
                titulo: "",
                isbn: "",
                genero: "",
                estado: "Activo", 
                autorObj: null 
            },
            listadoAutores: [],
            accion: 'nuevo',
            idLibro: 0
        }
    },
    watch: {
        "forms.libros.mostrar"(nuevoValor) {
            // Recargamos los autores cada vez que se abre la ventana
            if (nuevoValor) {
                this.cargarAutores();
            }
        }
    },
    methods: {
        buscarLibro() {
            this.forms.busqueda_libros.mostrar = !this.forms.busqueda_libros.mostrar;
            this.$emit('buscar');
        },
        async cargarAutores() {
            // Solo cargamos autores activos (por si implementaste borrado lógico en autores también)
            let datos = await db.autores.filter(a => !a.estado || a.estado === 'Activo').toArray();
            this.listadoAutores = datos.map(a => ({
                label: `${a.codigo} - ${a.nombre}`,
                id: a.idAutor
            }));
        },
        modificarLibro(datos) {
            this.accion = 'modificar';
            this.idLibro = datos.idLibro;
            this.libro = { ...datos };
            
            // Cargar el objeto del combobox para que se vea el nombre al editar
            if(datos.idAutor){
                db.autores.get(datos.idAutor).then(autor => {
                    if(autor) {
                        this.libro.autorObj = {
                            label: `${autor.codigo} - ${autor.nombre}`,
                            id: autor.idAutor
                        };
                    }
                });
            }
        },
        async guardarLibro() {
            // Validación de campo relacional
            if (!this.libro.autorObj || !this.libro.autorObj.id) {
                return Swal.fire('Faltan Datos', 'Debe seleccionar un autor para este libro.', 'warning');
            }

            let datos = {
                idLibro: this.accion == 'modificar' ? this.idLibro : new Date().getTime(),
                idAutor: this.libro.autorObj.id,
                titulo: this.libro.titulo,
                isbn: this.libro.isbn,
                genero: this.libro.genero,
                estado: this.libro.estado || 'Activo'
            };

            try {
                // Validación para que no se repita el ISBN si es un libro nuevo
                if (this.accion === 'nuevo') {
                    let existente = await db.libros.where("isbn").equals(datos.isbn).count();
                    if (existente > 0) {
                        return Swal.fire('Error', 'Ya existe un libro registrado con el ISBN: ' + datos.isbn, 'warning');
                    }
                }

                await db.libros.put(datos);
                
                Swal.fire({
                    title: this.accion === 'nuevo' ? '¡Registrado!' : '¡Actualizado!',
                    text: this.accion === 'nuevo' ? 'Libro registrado con éxito en el inventario.' : 'Datos del libro actualizados.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                this.limpiarFormulario();
                this.buscarLibro();
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Ocurrió un problema al guardar el libro.', 'error');
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idLibro = 0;
            this.libro = {
                idLibro: 0, idAutor: '', titulo: "", isbn: "", genero: "", estado: "Activo", autorObj: null
            };
        }
    },
    mounted() {
        this.cargarAutores();
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarLibro" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center">
                            <i class="bi bi-book-half me-2"></i> {{ accion === 'nuevo' ? 'REGISTRO DE LIBRO' : 'EDITAR LIBRO' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label-custom">AUTOR DEL LIBRO (BUSCADOR):</label>
                                    <v-select 
                                        v-model="libro.autorObj" 
                                        :options="listadoAutores"
                                        placeholder="Buscar por nombre o código del autor..."
                                    ></v-select>
                                </div>
                                <div class="col-12">
                                    <label class="form-label-custom">TÍTULO DEL LIBRO:</label>
                                    <input required v-model="libro.titulo" type="text" class="form-control" placeholder="Ej: Cien años de soledad">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">ISBN:</label>
                                    <input required v-model="libro.isbn" type="text" class="form-control" placeholder="Ej: 978-3-16-148410-0">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">GÉNERO:</label>
                                    <input required v-model="libro.genero" type="text" class="form-control" placeholder="Ej: Novela, Ciencia Ficción, Historia...">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom shadow-sm px-4">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom shadow-sm px-4">NUEVO</button>
                            <button type="button" @click="buscarLibro" class="btn btn-success btn-custom shadow-sm px-4">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};