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
        async eliminarMatricula(id, e) {
            if(e) e.stopPropagation();
            if (confirm("¿Eliminar matrícula?")) {
                await db.matriculas.delete(id);
                this.obtenerMatriculas();
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
                    <div class="card-header-custom d-flex justify-content-between align-items-center">
                        <span>HISTORIAL DE MATRÍCULAS</span>
                        <div class="input-group" style="max-width: 300px;">
                            <span class="input-group-text bg-white border-0"><i class="bi bi-search"></i></span>
                            <input type="search" v-model="buscar" @keyup="obtenerMatriculas" class="form-control border-0 shadow-none" placeholder="Buscar por ciclo...">
                        </div>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0">
                                <thead>
                                    <tr>
                                        <th>FECHA</th>
                                        <th>CÓDIGO</th>
                                        <th>ESTUDIANTE</th>
                                        <th>CICLO</th>
                                        <th class="text-center">ACCIÓN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in listaMatriculas" :key="item.idMatricula" @click="modificarMatricula(item)" style="cursor: pointer">
                                        <td>{{ item.fecha }}</td>
                                        <td class="fw-bold text-primary">{{ item.codigoAlumno }}</td>
                                        <td>{{ item.nombreAlumno }}</td>
                                        <td><span class="badge bg-success">{{ item.ciclo }}</span></td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarMatricula(item)">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm border-0" @click.stop="eliminarMatricula(item.idMatricula, $event)">
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