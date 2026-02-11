const alumnos = {
    data() {
        return {
            alumno: {
                idAlumno: 0,
                codigo: '',
                nombre: '',
                direccion: '',
                municipio: '',
                departamento: '',
                email: '',
                telefono: '',
                fechaNac: '',
                sexo: 'Masculino'
            },
            accion: 'nuevo'
        }
    },
    methods: {
        async guardarAlumno() {
            // Creamos una copia de los datos para no tener problemas de referencias
            let datos = { ...this.alumno };
            
            // Borramos el idAlumno si es 0 para que Dexie se encargue del auto-incremento
            if (datos.idAlumno === 0) delete datos.idAlumno;

            try {
                if (this.accion === 'nuevo') {
                    // Validamos si el código ya existe antes de guardar
                    // "db" es la variable global que definiremos en main.js
                    let existente = await db.alumnos.where("codigo").equals(datos.codigo).count();
                    
                    if (existente > 0) {
                        alert("¡Error! Ya existe un alumno con el código " + datos.codigo);
                        return;
                    }

                    await db.alumnos.add(datos);
                    alert("Alumno registrado con éxito.");
                } else {
                    // Si es modificar, usamos 'put' para actualizar el registro existente
                    await db.alumnos.put(datos);
                    alert("Alumno actualizado con éxito.");
                }

                this.limpiarFormulario();
                
                // COMUNICACIÓN ENTRE COMPONENTES:
                // Le decimos al componente 'busqueda' (nuestro hermano) que actualice la tabla.
                // Accedemos a través del padre ($root) y las referencias ($refs).
                if(this.$root.$refs.busqueda){
                    this.$root.$refs.busqueda.obtenerAlumnos();
                }

            } catch (error) {
                console.error(error);
                alert("Ocurrió un error al guardar: " + error.message);
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.alumno = {
                idAlumno: 0, 
                codigo: '', 
                nombre: '', 
                direccion: '', 
                municipio: '', 
                departamento: '', 
                email: '', 
                telefono: '', 
                fechaNac: '', 
                sexo: 'Masculino'
            };
        }
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-8">
                <form @submit.prevent="guardarAlumno" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center">
                            <i class="bi bi-person-plus-fill me-2"></i> {{ accion === 'nuevo' ? 'REGISTRO DE ALUMNO' : 'EDITAR ALUMNO' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label-custom">CÓDIGO:</label>
                                    <input required v-model="alumno.codigo" type="text" class="form-control" placeholder="Ej: USSS1234" :disabled="accion === 'modificar'">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">NOMBRE COMPLETO:</label>
                                    <input required v-model="alumno.nombre" type="text" class="form-control" placeholder="Nombre y Apellidos">
                                </div>
                                <div class="col-12">
                                    <label class="form-label-custom">DIRECCIÓN:</label>
                                    <input required v-model="alumno.direccion" type="text" class="form-control" placeholder="Dirección de residencia">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">MUNICIPIO:</label>
                                    <input required v-model="alumno.municipio" type="text" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">DEPTO:</label>
                                    <input required v-model="alumno.departamento" type="text" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">TELÉFONO:</label>
                                    <input required v-model="alumno.telefono" type="text" class="form-control" placeholder="0000-0000">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">EMAIL:</label>
                                    <input required v-model="alumno.email" type="email" class="form-control" placeholder="correo@ejemplo.com">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">FECHA NAC:</label>
                                    <input required v-model="alumno.fechaNac" type="date" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">SEXO:</label>
                                    <select v-model="alumno.sexo" class="form-select">
                                        <option value="Masculino">Masculino</option>
                                        <option value="Femenino">Femenino</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom shadow-sm px-4">
                                <i class="bi bi-save me-1"></i> GUARDAR
                            </button>
                            <button type="reset" class="btn btn-warning btn-custom shadow-sm px-4">
                                <i class="bi bi-arrow-counterclockwise me-1"></i> NUEVO
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};