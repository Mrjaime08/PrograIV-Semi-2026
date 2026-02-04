document.addEventListener("DOMContentLoaded", () => {
    const frm = document.querySelector("#frmAlumnos");
    frm.addEventListener("submit", (e) => {
        e.preventDefault();
        guardarAlumno();
    });
    mostrarAlumnos();
});

function guardarAlumno() {
    const alumno = {
        codigo: document.querySelector("#txtCodigoAlumno").value,
        nombre: document.querySelector("#txtnombreAlumno").value,
        direccion: document.querySelector("#txtDireccionAlumno").value,
        municipio: document.querySelector("#txtMunicipioAlumno").value,
        departamento: document.querySelector("#txtDeptoAlumno").value,
        fechaNac: document.querySelector("#txtFechaAlumno").value,
        sexo: document.querySelector("#txtSexoAlumno").value,
        email: document.querySelector("#txtEmailAlumno").value,
        telefono: document.querySelector("#txtTelefonoAlumno").value
    };

    localStorage.setItem(alumno.codigo, JSON.stringify(alumno));
    alert("Registro actualizado correctamente.");
    document.querySelector("#frmAlumnos").reset();
    mostrarAlumnos();
}

function mostrarAlumnos() {
    const $tbody = document.querySelector("#tblAlumnos tbody");
    let filas = "";

    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        const data = JSON.parse(localStorage.getItem(clave));

        if (data && data.codigo) {
            filas += `
                <tr onclick='modificarAlumno(${JSON.stringify(data)})'>
                    <td class="fw-bold text-primary">${data.codigo}</td>
                    <td>${data.nombre}</td>
                    <td class="col-direccion" title="${data.direccion}">${data.direccion}</td>
                    <td><small>${data.municipio}, ${data.departamento}</small></td>
                    <td>${data.sexo}</td>
                    <td>
                        <div class="small">${data.email}</div>
                        <div class="fw-bold small">${data.telefono}</div>
                    </td>
                    <td class="text-center">
                        <button class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); eliminarAlumno('${data.codigo}')">
                            Eliminar
                        </button>
                    </td>
                </tr>
            `;
        }
    }
    $tbody.innerHTML = filas;
}

function modificarAlumno(alumno) {
    document.querySelector("#txtCodigoAlumno").value = alumno.codigo;
    document.querySelector("#txtnombreAlumno").value = alumno.nombre;
    document.querySelector("#txtDireccionAlumno").value = alumno.direccion;
    document.querySelector("#txtMunicipioAlumno").value = alumno.municipio;
    document.querySelector("#txtDeptoAlumno").value = alumno.departamento;
    document.querySelector("#txtFechaAlumno").value = alumno.fechaNac;
    document.querySelector("#txtSexoAlumno").value = alumno.sexo;
    document.querySelector("#txtEmailAlumno").value = alumno.email;
    document.querySelector("#txtTelefonoAlumno").value = alumno.telefono;
    document.querySelector("#txtnombreAlumno").focus();
}

function eliminarAlumno(id) {
    if (confirm("¿Seguro que desea borrar este alumno?")) {
        localStorage.removeItem(id);
        mostrarAlumnos();
    }
}document.addEventListener("DOMContentLoaded", () => {
    // 1. Evento para guardar el formulario
    const frm = document.querySelector("#frmAlumnos");
    frm.addEventListener("submit", (e) => {
        e.preventDefault();
        guardarAlumno();
    });

    // 2. NUEVO: Evento para la barra de búsqueda (filtro en tiempo real)
    const inputBusqueda = document.querySelector("#txtBusqueda");
    inputBusqueda.addEventListener("input", (e) => {
        // Obtenemos lo que escribe el usuario, quitamos espacios y convertimos a minúsculas
        const textoBusqueda = e.target.value.trim().toLowerCase();
        mostrarAlumnos(textoBusqueda);
    });

    // 3. Cargar la lista completa al inicio
    mostrarAlumnos();
});

function guardarAlumno() {
    // Captura segura de datos
    const alumno = {
        codigo: document.querySelector("#txtCodigoAlumno").value.trim(),
        nombre: document.querySelector("#txtnombreAlumno").value.trim(),
        direccion: document.querySelector("#txtDireccionAlumno").value.trim(),
        municipio: document.querySelector("#txtMunicipioAlumno").value.trim(),
        departamento: document.querySelector("#txtDeptoAlumno").value.trim(),
        fechaNac: document.querySelector("#txtFechaAlumno").value,
        sexo: document.querySelector("#txtSexoAlumno").value,
        email: document.querySelector("#txtEmailAlumno").value.trim(),
        telefono: document.querySelector("#txtTelefonoAlumno").value.trim()
    };

    // Validación básica
    if (!alumno.codigo) {
        alert("El código es obligatorio");
        return;
    }

    // Guardar en LocalStorage
    localStorage.setItem(alumno.codigo, JSON.stringify(alumno));
    
    alert("¡Registro guardado correctamente!");
    
    // Limpiar formulario y refrescar tabla
    document.querySelector("#frmAlumnos").reset();
    mostrarAlumnos();
}

/**
 * Función mostrarAlumnos MEJORADA con filtro de búsqueda
 * @param {string} filtro - Texto opcional para buscar
 */
function mostrarAlumnos(filtro = "") {
    const tbody = document.querySelector("#tblAlumnos tbody");
    let filas = "";
    let resultadosEncontrados = 0;

    // Si la base de datos está vacía
    if (localStorage.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted p-5"><i class="bi bi-inbox fs-1 d-block"></i>No hay registros aún.</td></tr>`;
        return;
    }

    // Recorrer LocalStorage
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        try {
            const data = JSON.parse(localStorage.getItem(clave));

            if (data && data.codigo) {
                // LÓGICA DE BÚSQUEDA:
                // Creamos un texto gigante con los datos importantes para buscar ahí
                const textoCompleto = `${data.codigo} ${data.nombre} ${data.telefono} ${data.email}`.toLowerCase();
                
                // Si el usuario escribió algo (filtro) y NO está en el textoCompleto, saltamos este registro
                if (filtro && !textoCompleto.includes(filtro)) {
                    continue; 
                }

                // Prevenir errores de visualización (undefined)
                const ubicacion = `${data.municipio || ''}, ${data.departamento || ''}`;
                const nombre = data.nombre || 'Sin Nombre';
                
                filas += `
                    <tr style="cursor: pointer;" onclick='modificarAlumno(${JSON.stringify(data)})'>
                        <td class="fw-bold text-primary">${data.codigo}</td>
                        <td>${nombre}</td>
                        <td class="text-truncate" style="max-width: 150px;" title="${data.direccion}">${data.direccion || '-'}</td>
                        <td><small>${ubicacion}</small></td>
                        <td>${data.sexo || '-'}</td>
                        <td>
                            <div class="small">${data.email || '-'}</div>
                            <div class="fw-bold small">${data.telefono || '-'}</div>
                        </td>
                        <td class="text-center">
                            <button class="btn btn-outline-danger btn-sm border-0" onclick="event.stopPropagation(); eliminarAlumno('${data.codigo}')" title="Eliminar registro">
                                <i class="bi bi-trash-fill"></i>
                            </button>
                        </td>
                    </tr>
                `;
                resultadosEncontrados++;
            }
        } catch (e) {
            console.error("Error dato corrupto:", e);
        }
    }

    // Mensaje si buscaste algo y no hubo coincidencias
    if (resultadosEncontrados === 0 && filtro !== "") {
        filas = `<tr><td colspan="7" class="text-center text-muted p-4">No se encontraron resultados para "<strong>${filtro}</strong>"</td></tr>`;
    }

    tbody.innerHTML = filas;
}

function modificarAlumno(alumno) {
    // Llenar el formulario
    document.querySelector("#txtCodigoAlumno").value = alumno.codigo || '';
    document.querySelector("#txtnombreAlumno").value = alumno.nombre || '';
    document.querySelector("#txtDireccionAlumno").value = alumno.direccion || '';
    document.querySelector("#txtMunicipioAlumno").value = alumno.municipio || '';
    document.querySelector("#txtDeptoAlumno").value = alumno.departamento || '';
    document.querySelector("#txtFechaAlumno").value = alumno.fechaNac || '';
    document.querySelector("#txtSexoAlumno").value = alumno.sexo || 'Masculino';
    document.querySelector("#txtEmailAlumno").value = alumno.email || '';
    document.querySelector("#txtTelefonoAlumno").value = alumno.telefono || '';
    
    // Efecto visual: Scroll arriba y foco
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector("#txtnombreAlumno").focus();
}

function eliminarAlumno(id) {
    if (confirm("¿Estás seguro de eliminar este registro permanentemente?")) {
        localStorage.removeItem(id);
        mostrarAlumnos();
    }
}