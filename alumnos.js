const alumnos = {
    props: ['forms'],
    data() {
        return {
            alumno: {
                idAlumno: 0, codigo: '', nombre: '', direccion: '', municipio: '', 
                departamento: '', email: '', telefono: '', fechaNac: '', sexo: 'Masculino'
            },
            accion: 'nuevo',
            idAlumno: 0 
        }
    },
    methods: {
        buscarAlumno() {
            this.forms.busqueda_alumnos.mostrar = !this.forms.busqueda_alumnos.mostrar;
            this.$emit('buscar'); 
        },
        modificarAlumno(alumno) {
            this.accion = 'modificar';
            this.idAlumno = alumno.idAlumno;
            this.alumno = { ...alumno }; 
        },
        async guardarAlumno() {
            let datos = { ...this.alumno };
            // GENERAMOS ID MANUALMENTE
            datos.idAlumno = this.accion == 'modificar' ? this.idAlumno : new Date().getTime();

            try {
                if (this.accion === 'nuevo') {
                    // Validación simple
                    let n = await db.alumnos.where("codigo").equals(datos.codigo).count();
                    if (n > 0) { return alert("El código ya existe: " + datos.codigo); }
                    
                    await db.alumnos.put(datos);
                    alert("Alumno registrado.");
                } else {
                    await db.alumnos.put(datos);
                    alert("Alumno actualizado.");
                }
                this.limpiarFormulario();
                this.buscarAlumno(); 
            } catch (error) {
                console.error(error);
                alert("Error: " + error);
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idAlumno = 0;
            this.alumno = {
                idAlumno: 0, codigo: '', nombre: '', direccion: '', municipio: '', 
                departamento: '', email: '', telefono: '', fechaNac: '', sexo: 'Masculino'
            };
        }
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarAlumno" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center">REGISTRO DE ALUMNO</div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-md-6"><label class="form-label-custom">CÓDIGO:</label><input required v-model="alumno.codigo" type="text" class="form-control" :disabled="accion === 'modificar'"></div>
                                <div class="col-md-6"><label class="form-label-custom">NOMBRE:</label><input required v-model="alumno.nombre" type="text" class="form-control"></div>
                                <div class="col-12"><label class="form-label-custom">DIRECCIÓN:</label><input required v-model="alumno.direccion" type="text" class="form-control"></div>
                                <div class="col-md-6"><label class="form-label-custom">MUNICIPIO:</label><input required v-model="alumno.municipio" type="text" class="form-control"></div>
                                <div class="col-md-6"><label class="form-label-custom">DEPTO:</label><input required v-model="alumno.departamento" type="text" class="form-control"></div>
                                <div class="col-md-6"><label class="form-label-custom">EMAIL:</label><input required v-model="alumno.email" type="email" class="form-control"></div>
                                <div class="col-md-6"><label class="form-label-custom">TELÉFONO:</label><input required v-model="alumno.telefono" type="text" class="form-control"></div>
                                <div class="col-md-6"><label class="form-label-custom">FECHA NAC:</label><input required v-model="alumno.fechaNac" type="date" class="form-control"></div>
                                <div class="col-md-6"><label class="form-label-custom">SEXO:</label>
                                    <select v-model="alumno.sexo" class="form-select"><option>Masculino</option><option>Femenino</option></select>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom">NUEVO</button>
                            <button type="button" @click="buscarAlumno" class="btn btn-success btn-custom">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};