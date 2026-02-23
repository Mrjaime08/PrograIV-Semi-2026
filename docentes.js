const docentes = {
    props: ['forms'],
    data() {
        return {
            docente: {
                idDocente: 0,
                codigo: "",
                nombre: "",
                direccion: "",
                municipio: "",    // Nuevo campo
                departamento: "", // Nuevo campo
                email: "",
                telefono: "",
                escalafon: "",
                contrato: "",
                estado: "Activo" 
            },
            accion: 'nuevo',
            idDocente: 0
        }
    },
    methods: {
        buscarDocente() {
            this.forms.busqueda_docentes.mostrar = !this.forms.busqueda_docentes.mostrar;
            this.$emit('buscar');
        },
        modificarDocente(docente) {
            this.accion = 'modificar';
            this.idDocente = docente.idDocente;
            this.docente = { ...docente };
        },
        async guardarDocente() {
            let datos = { ...this.docente };
            datos.idDocente = this.accion == 'modificar' ? this.idDocente : new Date().getTime();

            if (!datos.estado) datos.estado = 'Activo';

            try {
                if (this.accion === 'nuevo') {
                    let existente = await db.docentes.where("codigo").equals(datos.codigo).count();
                    if (existente > 0) {
                        return Swal.fire('Error', 'El código del docente ya existe: ' + datos.codigo, 'warning');
                    }
                    await db.docentes.put(datos);
                    
                    Swal.fire({
                        title: '¡Registrado!',
                        text: 'Docente registrado con éxito.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                } else {
                    await db.docentes.put(datos);
                    
                    Swal.fire({
                        title: '¡Actualizado!',
                        text: 'Docente actualizado con éxito.',
                        icon: 'success',
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
                this.limpiarFormulario();
                this.buscarDocente(); 
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Ocurrió un problema al guardar: ' + error, 'error');
            }
        },
        limpiarFormulario() {
            this.accion = 'nuevo';
            this.idDocente = 0;
            this.docente = {
                idDocente: 0, codigo: "", nombre: "", direccion: "", municipio: "", departamento: "", 
                email: "", telefono: "", escalafon: "", contrato: "", estado: "Activo"
            };
        }
    },
    template: `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <form @submit.prevent="guardarDocente" @reset.prevent="limpiarFormulario">
                    <div class="card card-custom">
                        <div class="card-header-custom text-center">
                            <i class="bi bi-person-badge-fill me-2"></i> {{ accion === 'nuevo' ? 'REGISTRO DE DOCENTE' : 'EDITAR DOCENTE' }}
                        </div>
                        <div class="card-body p-4">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label class="form-label-custom">CÓDIGO:</label>
                                    <input required v-model="docente.codigo" type="text" class="form-control" placeholder="Ej: DOC001" :disabled="accion === 'modificar'">
                                </div>
                                <div class="col-md-8">
                                    <label class="form-label-custom">NOMBRE COMPLETO:</label>
                                    <input required v-model="docente.nombre" type="text" class="form-control">
                                </div>
                                <div class="col-12">
                                    <label class="form-label-custom">DIRECCIÓN:</label>
                                    <input required v-model="docente.direccion" type="text" class="form-control">
                                </div>
                                
                                <div class="col-md-6">
                                    <label class="form-label-custom">MUNICIPIO:</label>
                                    <input required v-model="docente.municipio" type="text" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">DEPARTAMENTO:</label>
                                    <input required v-model="docente.departamento" type="text" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">EMAIL:</label>
                                    <input required v-model="docente.email" type="email" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">TELÉFONO:</label>
                                    <input required v-model="docente.telefono" type="text" class="form-control">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">ESCALAFÓN:</label>
                                    <select required v-model="docente.escalafon" class="form-select">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="tecnico">Técnico</option>
                                        <option value="profesor">Profesor</option>
                                        <option value="ingeniero">Licenciado/Ingeniero</option>
                                        <option value="maestria">Maestría</option>
                                        <option value="doctor">Doctor</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label-custom">TIPO DE CONTRATO:</label>
                                    <select required v-model="docente.contrato" class="form-select">
                                        <option value="" disabled>Seleccione...</option>
                                        <option value="Tiempo Completo">Tiempo Completo</option>
                                        <option value="Medio Tiempo">Medio Tiempo</option>
                                        <option value="Hora Clase">Hora Clase</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="card-footer text-center bg-white border-0 pb-3">
                            <button type="submit" class="btn btn-primary btn-custom shadow-sm px-4">GUARDAR</button>
                            <button type="reset" class="btn btn-warning btn-custom shadow-sm px-4">NUEVO</button>
                            <button type="button" @click="buscarDocente" class="btn btn-success btn-custom shadow-sm px-4">BUSCAR</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `
};