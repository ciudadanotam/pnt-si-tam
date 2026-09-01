let documentos = [];

const DOCUMENTOS_POR_PAGINA = 50;

let paginaActual = 1;
let documentosFiltrados = [];


async function cargarDocumentos() {

    try {

        const respuesta = await fetch("documentos.json");

        documentos = await respuesta.json();

        cargarMunicipios();

        documentosFiltrados = documentos;

        paginaActual = 1;

        mostrarDocumentos();

    } catch (error) {

        console.error(error);

        document.getElementById("contador").textContent =
            "Error al cargar los documentos.";

    }

}


function cargarMunicipios() {

    const select = document.getElementById("municipio");

    const municipios = [
        ...new Set(
            documentos.map(documento => documento.municipio)
        )
    ];

    municipios.sort();

    municipios.forEach(municipio => {

        const option = document.createElement("option");

        option.value = municipio;

        option.textContent = municipio;

        select.appendChild(option);

    });

}


function mostrarDocumentos() {

    const resultados =
        document.getElementById("resultados");

    resultados.innerHTML = "";


    const total = documentosFiltrados.length;

    const totalPaginas =
        Math.ceil(total / DOCUMENTOS_POR_PAGINA);


    // --------------------------------------------------------
    // Ajustar página si fuera necesario
    // --------------------------------------------------------

    if (paginaActual > totalPaginas && totalPaginas > 0) {
        paginaActual = totalPaginas;
    }


    // --------------------------------------------------------
    // Contador
    // --------------------------------------------------------

    if (total === 0) {

        document.getElementById("contador").textContent =
            "0 documentos encontrados";

        resultados.innerHTML = `
            <p>No se encontraron documentos.</p>
        `;

        return;

    }


    const inicio =
        (paginaActual - 1) * DOCUMENTOS_POR_PAGINA;

    const fin =
        Math.min(
            inicio + DOCUMENTOS_POR_PAGINA,
            total
        );


    document.getElementById("contador").textContent =
        `Mostrando ${inicio + 1}–${fin} de ${total} documento(s) encontrado(s)`;


    // --------------------------------------------------------
    // Documentos de la página actual
    // --------------------------------------------------------

    const documentosPagina =
        documentosFiltrados.slice(inicio, fin);


    documentosPagina.forEach(documento => {

        const div = document.createElement("div");

        div.className = "documento";


        div.innerHTML = `

            <div>

                <h3>
                    📄 ${documento.folio}
                </h3>

                <p>
                    🏛️ ${documento.municipio}
                </p>

            </div>


            <a
                class="boton"
                href="${documento.archivo}"
                target="_blank"
            >

                Ver PDF

            </a>

        `;


        resultados.appendChild(div);

    });


    // --------------------------------------------------------
    // Paginación
    // --------------------------------------------------------

    if (totalPaginas > 1) {

        crearPaginacion(totalPaginas);

    }

}


function crearPaginacion(totalPaginas) {

    const contenedor =
        document.createElement("div");

    contenedor.className = "paginacion";


    // --------------------------------------------------------
    // Botón anterior
    // --------------------------------------------------------

    const anterior =
        document.createElement("button");

    anterior.textContent = "← Anterior";

    anterior.disabled = paginaActual === 1;

    anterior.addEventListener("click", () => {

        if (paginaActual > 1) {

            paginaActual--;

            mostrarDocumentos();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    });

    contenedor.appendChild(anterior);


    // --------------------------------------------------------
    // Números de página
    // --------------------------------------------------------

    for (
        let pagina = 1;
        pagina <= totalPaginas;
        pagina++
    ) {

        const boton =
            document.createElement("button");

        boton.textContent = pagina;


        if (pagina === paginaActual) {

            boton.className = "pagina-activa";

        }


        boton.addEventListener("click", () => {

            paginaActual = pagina;

            mostrarDocumentos();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });


        contenedor.appendChild(boton);

    }


    // --------------------------------------------------------
    // Botón siguiente
    // --------------------------------------------------------

    const siguiente =
        document.createElement("button");

    siguiente.textContent = "Siguiente →";

    siguiente.disabled =
        paginaActual === totalPaginas;


    siguiente.addEventListener("click", () => {

        if (paginaActual < totalPaginas) {

            paginaActual++;

            mostrarDocumentos();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    });


    contenedor.appendChild(siguiente);


    document
        .getElementById("resultados")
        .appendChild(contenedor);

}


function filtrar() {

    const texto =
        document
            .getElementById("busqueda")
            .value
            .toLowerCase()
            .trim();


    const municipio =
        document
            .getElementById("municipio")
            .value;


    documentosFiltrados =
        documentos.filter(documento => {

            const folio =
                documento.folio
                    ? documento.folio.toLowerCase()
                    : "";


            const coincideTexto =
                folio.includes(texto);


            const coincideMunicipio =
                municipio === ""
                ||
                documento.municipio === municipio;


            return coincideTexto
                &&
                coincideMunicipio;

        });


    // Siempre regresar a la primera página
    paginaActual = 1;

    mostrarDocumentos();

}


document
    .getElementById("busqueda")
    .addEventListener("input", filtrar);


document
    .getElementById("municipio")
    .addEventListener("change", filtrar);


cargarDocumentos();