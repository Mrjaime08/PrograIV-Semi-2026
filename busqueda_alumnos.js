const busqueda_alumnos = {
    data() {
        return {
            buscar: '',
            alumnos: []
        }
    },
    methods: {
        async obtenerAlumnos() {
            // "db" es la variable global de Dexie definida en main.js
            try {
                if (this.buscar.trim() === "") {
                    this.alumnos = await db.alumnos.toArray();
                } else {
                    let texto = this.buscar.toLowerCase();
                    this.alumnos = await db.alumnos.filter(alumno => 
                        alumno.codigo.toLowerCase().includes(texto) || 
                        alumno.nombre.toLowerCase().includes(texto)
                    ).toArray();
                }
            } catch (error) {
                console.error("Error al cargar alumnos:", error);
            }
        },
        async eliminarAlumno(idAlumno) {
            if (confirm("¿Estás seguro de eliminar este registro permanentemente?")) {
                try {
                    await db.alumnos.delete(idAlumno);
                    this.obtenerAlumnos(); 
                } catch (error) {
                    alert("Error al eliminar: " + error.message);
                }
            }
        },
        modificarAlumno(datos) {
            // ----------------------------------------------------------------
            // CORRECCIÓN CLAVE: COMUNICACIÓN ENTRE COMPONENTES
            // ----------------------------------------------------------------
            
            // 1. Buscamos el componente del formulario.
            // En tu index.html tienes: <alumnos ref="alumnos">, por eso buscamos $refs.alumnos
            const componenteFormulario = this.$root.$refs.alumnos;
            
            if (componenteFormulario) {
                // 2. Le pasamos los datos al otro archivo
                componenteFormulario.alumno = { ...datos };
                componenteFormulario.accion = 'modificar';
                
                // 3. Cambiamos la vista (Ocultamos búsqueda, mostramos formulario)
                this.$root.forms.busqueda_alumnos.mostrar = false;
                this.$root.forms.alumnos.mostrar = true;
            } else {
                console.error("Error: No se encontró el componente con ref='alumnos'");
            }
        }
    },
    mounted() {
        this.obtenerAlumnos();
    },
    template: `
        <div class="row mt-3">
            <div class="col-12">
                <div class="card card-custom">
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-list-ul me-2"></i> LISTADO DE ALUMNOS</span>
                        
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerAlumnos" class="form-control border-0 shadow-none" placeholder="Buscar..." style="background: rgba(255,255,255,0.2); color: white;" >
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0">
                                <thead>
                                    <tr>
                                        <th>CÓDIGO</th>
                                        <th>NOMBRE</th>
                                        <th>DIRECCIÓN</th>
                                        <th>EMAIL</th>
                                        <th>TELÉFONO</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="alumno in alumnos" :key="alumno.idAlumno" @click="modificarAlumno(alumno)" style="cursor: pointer" title="Clic para editar">
                                        <td class="fw-bold text-primary">{{ alumno.codigo }}</td>
                                        <td>{{ alumno.nombre }}</td>
                                        <td class="text-truncate" style="max-width: 150px;">{{ alumno.direccion }}</td>
                                        <td>{{ alumno.email }}</td>
                                        <td>{{ alumno.telefono }}</td>
                                        <td class="text-center">
                                            
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarAlumno(alumno)">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>

                                            <button class="btn btn-outline-danger btn-sm border-0" @click.stop="eliminarAlumno(alumno.idAlumno)">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="alumnos.length === 0">
                                        <td colspan="6" class="text-center p-4 text-muted">
                                            No se encontraron registros.
                                        </td>
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