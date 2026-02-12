const materias = {
    props: ['forms'],
    data() {
        return {
            materia: { idMateria: 0, codigo: '', nombre: '', uv: 0 },
            accion: 'nuevo',
            idMateria: 0 
        }
    },
    methods: {
        buscarMateria() {
            this.forms.busqueda_materias.mostrar = !this.forms.busqueda_materias.mostrar;
            this.$emit('buscar'); 
        },
        modificarMateria(materia) {
            this.accion = 'modificar';
            this.idMateria = materia.idMateria;
            this.materia = { ...materia }; 
        },
        async guardarMateria() {
            let datos = { ...this.materia };
            datos.idMateria = this.accion == 'modificar' ? this.idMateria : new Date().getTime();

            try {
                if (this.accion === 'nuevo') {
                    let n = await db.materias.where("codigo").equals(datos.codigo).count();
                    if (n > 0) return alert("Código duplicado: " + datos.codigo);
                    await db.materias.put(datos);
                    alert("Materia registrada.");
                } else {
                    await db.materias.put(datos);
                    alert("Materia actualizada.");
                }
                this.limpiarFormulario();
                this.buscarMateria(); 
            } catch (error) {
                console.error(error);
                alert("Error: " + error);
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idMateria = 0;
            this.materia = { idMateria: 0, codigo: '', nombre: '', uv: 0 };
        }
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarMateria" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center">REGISTRO DE MATERIA</div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-md-4"><label class="form-label-custom">CÓDIGO:</label><input required v-model="materia.codigo" type="text" class="form-control" :disabled="accion === 'modificar'"></div>
                                <div class="col-md-6"><label class="form-label-custom">NOMBRE:</label><input required v-model="materia.nombre" type="text" class="form-control"></div>
                                <div class="col-md-2"><label class="form-label-custom">UV:</label><input required v-model="materia.uv" type="number" class="form-control"></div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom">NUEVO</button>
                            <button type="button" @click="buscarMateria" class="btn btn-success btn-custom">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};