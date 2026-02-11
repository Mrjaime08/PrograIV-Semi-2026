const { createApp } = Vue;

// =======================================================
// 1. CONFIGURACIÓN DE LA BASE DE DATOS (DEXIE)
// =======================================================
// "db_academica" es el nombre que tendrá la BD en el navegador
const db = new Dexie("db_academica");

// Definimos las tablas y los campos que vamos a indexar
// ++idAlumno significa que es una clave primaria automática (1, 2, 3...)
db.version(1).stores({
    alumnos: "++idAlumno, codigo, nombre, direccion, municipio, departamento, email, telefono, fechaNac, sexo"
});

// =======================================================
// 2. CONFIGURACIÓN DE VUE.JS
// =======================================================
createApp({
    // Registramos los componentes que creamos en los otros archivos
    components: {
        alumnos,           // Viene de alumnos.js
        busqueda_alumnos   // Viene de busqueda_alumnos.js
    },
    data() {
        return {
            // Este objeto controla qué ventana se ve
            forms: {
                alumnos: { mostrar: true },          // Inicia mostrando el formulario
                busqueda_alumnos: { mostrar: false } // La búsqueda inicia oculta
            }
        }
    },
    methods: {
        // Función para navegar entre pestañas
        abrirVentana(ventana) {
            // 1. Ocultamos todas las ventanas primero
            this.forms.alumnos.mostrar = false;
            this.forms.busqueda_alumnos.mostrar = false;
            
            // 2. Mostramos la que el usuario pidió
            this.forms[ventana].mostrar = true;

            // 3. TRUCO: Si el usuario abrió la búsqueda, forzamos que se actualice la tabla
            // Esto asegura que vea los datos más recientes
            if(ventana === 'busqueda_alumnos' && this.$refs.busqueda){
                this.$refs.busqueda.obtenerAlumnos();
            }
        }
    }
}).mount("#app");