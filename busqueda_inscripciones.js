const busqueda_inscripciones = {
    data() {
        return {
            buscar: '',
            listaInscripciones: []
        }
    },
    methods: {
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
        async eliminarInscripcion(id, e) {
            if(e) e.stopPropagation();
            if (confirm("¿Eliminar inscripción?")) {
                await db.inscripciones.delete(id);
                this.obtenerInscripciones();
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
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <span>INSCRIPCIONES REALIZADAS</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerInscripciones" class="form-control border-0 shadow-none" placeholder="Buscar alumno o materia...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0">
                                <thead>
                                    <tr>
                                        <th>FECHA</th>
                                        <th>ALUMNO</th>
                                        <th>MATERIA</th>
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in listaInscripciones" :key="item.idInscripcion">
                                        <td>{{ item.fecha }}</td>
                                        <td>
                                            <div class="fw-bold">{{ item.nombreAlumno }}</div>
                                            <small class="text-muted">{{ item.codigoAlumno }}</small>
                                        </td>
                                        <td>
                                            <div class="fw-bold">{{ item.nombreMateria }}</div>
                                            <small class="text-muted">{{ item.codigoMateria }}</small>
                                        </td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-danger btn-sm border-0" @click.stop="eliminarInscripcion(item.idInscripcion, $event)">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
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