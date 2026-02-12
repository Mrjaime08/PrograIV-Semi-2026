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
        async eliminarMateria(idMateria, e) {
            if(e) e.stopPropagation(); 
            if (confirm("¿Está seguro de eliminar esta materia?")) {
                await db.materias.delete(idMateria);
                this.obtenerMaterias();
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
                                        <th class="text-center">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="materia in materias" :key="materia.idMateria" @click="modificarMateria(materia)" style="cursor: pointer">
                                        <td class="fw-bold text-primary">{{ materia.codigo }}</td>
                                        <td>{{ materia.nombre }}</td>
                                        <td>{{ materia.uv }}</td>
                                        <td class="text-center">
                                            <button class="btn btn-outline-warning btn-sm border-0 me-2" @click.stop="modificarMateria(materia)">
                                                <i class="bi bi-pencil-square"></i>
                                            </button>
                                            <button class="btn btn-outline-danger btn-sm border-0" @click.stop="eliminarMateria(materia.idMateria, $event)">
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