const panel_admin = {
    data() {
        return {
            usuarios: []
        }
    },
    methods: {
        async cargarUsuarios() {
            // Traemos a todos los usuarios que NO sean superadmin
            this.usuarios = await db.usuarios.where("rol").equals("usuario").toArray();
        },
        async cambiarEstado(usuario, nuevoEstado) {
            // 1. CLONAMOS el usuario para quitarle el Proxy de Vue y evitar el DexieError
            let usuarioLimpio = { ...usuario }; 
            
            // 2. Le cambiamos el estado al clon
            usuarioLimpio.estado = nuevoEstado;
            
            try {
                // 3. Guardamos el clon limpio en Dexie
                await db.usuarios.put(usuarioLimpio);
                
                // ALERTA ELEGANTE SWEETALERT2 PARA EL CAMBIO DE ESTADO
                Swal.fire({
                    title: '¡Estado Actualizado!',
                    text: `El usuario ${usuarioLimpio.email} ahora está ${nuevoEstado.toUpperCase()}.`,
                    icon: 'success',
                    timer: 2500,
                    showConfirmButton: false
                });

                this.cargarUsuarios(); // Recargar la tabla
            } catch (error) {
                console.error("Error al guardar:", error);
                Swal.fire('Error', 'Hubo un error al actualizar el estado en la base de datos.', 'error');
            }
        },
        async eliminarUsuario(id, email) {
            // --- ALERTA DE CONFIRMACIÓN ELEGANTE SWEETALERT2 ---
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: `Vas a RECHAZAR y eliminar al usuario ${email}`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    await db.usuarios.delete(id);
                    this.cargarUsuarios();
                    Swal.fire('¡Eliminado!', 'El usuario ha sido borrado del sistema.', 'success');
                } catch (error) {
                    console.error("Error al eliminar:", error);
                    Swal.fire('Error', 'No se pudo eliminar al usuario.', 'error');
                }
            }
        }
    },
    mounted() {
        this.cargarUsuarios();
    },
    template: `
        <div class="row mt-4 justify-content-center">
            <div class="col-md-10">
                <div class="card card-custom shadow">
                    <div class="card-header-custom bg-danger text-center">
                        <i class="bi bi-shield-lock-fill me-2"></i> PANEL DE SÚPER ADMINISTRADOR
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover table-custom mb-0 text-center align-middle">
                                <thead>
                                    <tr>
                                        <th>CORREO (USUARIO)</th>
                                        <th>ESTADO ACTUAL</th>
                                        <th>ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="user in usuarios" :key="user.idUsuario">
                                        <td class="fw-bold">{{ user.email }}</td>
                                        <td>
                                            <span class="badge" :class="user.estado === 'activo' ? 'bg-success' : 'bg-warning text-dark'">
                                                {{ user.estado.toUpperCase() }}
                                            </span>
                                        </td>
                                        <td>
                                            <button v-if="user.estado === 'pendiente'" class="btn btn-success btn-sm me-2" @click="cambiarEstado(user, 'activo')" title="Aprobar Acceso">
                                                <i class="bi bi-check-circle-fill"></i> Aprobar
                                            </button>
                                            
                                            <button v-if="user.estado === 'activo'" class="btn btn-secondary btn-sm me-2" @click="cambiarEstado(user, 'pendiente')" title="Suspender Acceso">
                                                <i class="bi bi-pause-circle-fill"></i> Suspender
                                            </button>

                                            <button class="btn btn-danger btn-sm" @click="eliminarUsuario(user.idUsuario, user.email)" title="Eliminar definitivamente">
                                                <i class="bi bi-trash-fill"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr v-if="usuarios.length === 0">
                                        <td colspan="3" class="text-muted p-4">No hay usuarios registrados aún.</td>
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