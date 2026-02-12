const { createApp } = Vue;

// CORRECCIÓN: Cambiamos el nombre de la BD para evitar el error de "UpgradeError"
const db = new Dexie("db_sistema_academico_v1");

// Definimos las tablas (Sin '++' en los IDs, porque los generamos manualmente)
db.version(1).stores({
    alumnos: "idAlumno, codigo, nombre, direccion, email, telefono",
    materias: "idMateria, codigo, nombre, uv",
    matriculas: "idMatricula, idAlumno, fecha, ciclo",
    inscripciones: "idInscripcion, idAlumno, idMateria, fecha"
});

createApp({
    components: {
        alumnos, busqueda_alumnos,
        materias, busqueda_materias,
        matriculas, busqueda_matriculas,
        inscripciones, busqueda_inscripciones
    },
    data() {
        return {
            forms: {
                alumnos: { mostrar: false },
                busqueda_alumnos: { mostrar: false },
                materias: { mostrar: false },
                busqueda_materias: { mostrar: false },
                matriculas: { mostrar: false },
                busqueda_matriculas: { mostrar: false },
                inscripciones: { mostrar: false },
                busqueda_inscripciones: { mostrar: false }
            }
        }
    },
    methods: {
        abrirVentana(ventana) {
            Object.keys(this.forms).forEach(key => {
                this.forms[key].mostrar = false;
            });
            this.forms[ventana].mostrar = true;
        },
        buscar(ventana, metodo) {
            if(this.$refs[ventana]){
                this.$refs[ventana][metodo]();
            }
        },
        modificar(ventana, metodo, data) {
            if(this.$refs[ventana]){
                this.$refs[ventana][metodo](data);
            }
        }
    }
}).mount("#app");