const autores = {
    props: ['forms'],
    data() {
        return {
            autor: {
                idAutor: 0,
                codigo: "",
                nombre: "",
                nacionalidad: "",
                estado: "Activo" // <-- Para mantener el borrado lógico si lo necesitas a futuro
            },
            accion: 'nuevo',
            idAutor: 0
        }
    },
    methods: {
        buscarAutor() {
            this.forms.busqueda_autores.mostrar = !this.forms.busqueda_autores.mostrar;
            this.$emit('buscar');
        },
        modificarAutor(autor) {
            this.accion = 'modificar';
            this.idAutor = autor.idAutor;
            this.autor = { ...autor };
        },
        async guardarAutor() {
            let datos = { ...this.autor };
            datos.idAutor = this.accion == 'modificar' ? this.idAutor : new Date().getTime();
            
            if (!datos.estado) datos.estado = 'Activo';

            try {
                // Validación para no repetir el código del autor
                if (this.accion === 'nuevo') {
                    let existente = await db.autores.where("codigo").equals(datos.codigo).count();
                    if (existente > 0) {
                        return Swal.fire('Error', 'El código del autor ya existe: ' + datos.codigo, 'warning');
                    }
                }

                await db.autores.put(datos);
                
                Swal.fire({
                    title: this.accion === 'nuevo' ? '¡Registrado!' : '¡Actualizado!',
                    text: this.accion === 'nuevo' ? 'Autor registrado con éxito.' : 'Datos del autor actualizados.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });

                this.limpiarFormulario();
                this.buscarAutor(); 
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Ocurrió un problema al guardar el autor.', 'error');
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idAutor = 0;
            this.autor = {
                idAutor: 0, codigo: "", nombre: "", nacionalidad: "", estado: "Activo"
            };
        }
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarAutor" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom shadow-sm">
                        <div class="card-header-custom text-center bg-primary">
                            <i class="bi bi-person-lines-fill me-2"></i> {{ accion === 'nuevo' ? 'REGISTRO DE AUTOR' : 'EDITAR AUTOR' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label class="form-label-custom">CÓDIGO:</label>
                                    <input required v-model="autor.codigo" type="text" class="form-control" placeholder="Ej: AUT-001" :disabled="accion === 'modificar'">
                                </div>
                                <div class="col-md-8">
                                    <label class="form-label-custom">NOMBRE COMPLETO:</label>
                                    <input required v-model="autor.nombre" type="text" class="form-control" placeholder="Nombre del autor">
                                </div>
                                <div class="col-12">
                                    <label class="form-label-custom">NACIONALIDAD:</label>
                                    <input required v-model="autor.nacionalidad" type="text" class="form-control" placeholder="Ej: Salvadoreño, Mexicano, Español...">
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom shadow-sm px-4">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom shadow-sm px-4">NUEVO</button>
                            <button type="button" @click="buscarAutor" class="btn btn-success btn-custom shadow-sm px-4">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};