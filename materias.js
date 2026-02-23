const materias = {
    props: ['forms'],
    data() {
        return {
            materia: { 
                idMateria: 0, 
                codigo: '', 
                nombre: '', 
                uv: 0,
                ciclo: 'Ciclo I', //  Nuevo campo
                modalidad: 'Presencial', // Nuevo campo
                estado: 'Activo' // Nuevo campo para borrado lógico
            },
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

            // Aseguramos que siempre tenga un estado por defecto si no lo traía
            if (!datos.estado) datos.estado = 'Activo';

            try {
                if (this.accion === 'nuevo') {
                    let n = await db.materias.where("codigo").equals(datos.codigo).count();
                    if (n > 0) {
                        return Swal.fire('Código duplicado', 'El código ya existe: ' + datos.codigo, 'warning');
                    }
                    await db.materias.put(datos);
                    Swal.fire({
                        title: '¡Registrada!',
                        text: 'Materia registrada con éxito.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    await db.materias.put(datos);
                    Swal.fire({
                        title: '¡Actualizada!',
                        text: 'Materia actualizada correctamente.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
                this.limpiarFormulario();
                this.buscarMateria(); 
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Hubo un problema: ' + error, 'error');
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idMateria = 0;
            this.materia = { 
                idMateria: 0, codigo: '', nombre: '', uv: 0, 
                ciclo: 'Ciclo I', modalidad: 'Presencial', estado: 'Activo' 
            };
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
                                
                                <div class="col-md-6">
                                    <label class="form-label-custom">CICLO:</label>
                                    <select v-model="materia.ciclo" class="form-select">
                                        <option>Ciclo I</option><option>Ciclo II</option><option>Ciclo III</option><option>Ciclo IV</option><option>Ciclo V</option>
                                        <option>Ciclo VI</option><option>Ciclo VII</option><option>Ciclo VIII</option><option>Ciclo IX</option><option>Ciclo X</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">MODALIDAD:</label>
                                    <select v-model="materia.modalidad" class="form-select">
                                        <option>Presencial</option><option>Virtual</option><option>Semipresencial</option>
                                    </select>
                                </div>
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