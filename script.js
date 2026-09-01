let documentos = [];


async function cargarDocumentos() {

    try {

        const respuesta = await fetch("documentos.json");

        documentos = await respuesta.json();

        cargarMunicipios();

        mostrarDocumentos(documentos);

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


function mostrarDocumentos(lista) {

    const resultados =
        document.getElementById("resultados");

    resultados.innerHTML = "";


    document.getElementById("contador").textContent =
        `${lista.length} documento(s) encontrado(s)`;


    if (lista.length === 0) {

        resultados.innerHTML = `
            <p>No se encontraron documentos.</p>
        `;

        return;

    }


    lista.forEach(documento => {

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

}


function filtrar() {

    const texto =
        document
            .getElementById("busqueda")
            .value
            .toLowerCase();


    const municipio =
        document
            .getElementById("municipio")
            .value;


    const filtrados =
        documentos.filter(documento => {

            const coincideTexto =
                documento.folio
                    .toLowerCase()
                    .includes(texto);


            const coincideMunicipio =
                municipio === ""
                ||
                documento.municipio === municipio;


            return coincideTexto
                &&
                coincideMunicipio;

        });


    mostrarDocumentos(filtrados);

}


document
    .getElementById("busqueda")
    .addEventListener("input", filtrar);


document
    .getElementById("municipio")
    .addEventListener("change", filtrar);


cargarDocumentos();