let solicitudes = [];

let solicitudesFiltradas = [];

let paginaActual = 1;

const POR_PAGINA = 20;


// ============================================================
// CARGAR JSON
// ============================================================

async function cargarSolicitudes() {

    try {

        const respuesta = await fetch(
            "solicitudes.json"
        );

        solicitudes = await respuesta.json();

        cargarMunicipios();

        cargarEstatus();

        aplicarFiltros();

    } catch (error) {

        console.error(error);

        document.getElementById(
            "contador"
        ).textContent =
            "Error al cargar las solicitudes.";

    }

}


// ============================================================
// MUNICIPIOS
// ============================================================

function cargarMunicipios() {

    const select =
        document.getElementById(
            "municipio"
        );

    const municipios = [
        ...new Set(
            solicitudes
                .map(s => s.municipio)
                .filter(Boolean)
        )
    ];

    municipios.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "es"
            )
    );

    municipios.forEach(
        municipio => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                municipio;

            option.textContent =
                municipio;

            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// ESTATUS
// ============================================================

function cargarEstatus() {

    const select =
        document.getElementById(
            "estatus"
        );

    const estados = [
        ...new Set(
            solicitudes
                .map(s => s.estatus)
                .filter(Boolean)
        )
    ];

    estados.sort(
        (a, b) =>
            a.localeCompare(
                b,
                "es"
            )
    );

    estados.forEach(
        estado => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                estado;

            option.textContent =
                estado;

            select.appendChild(
                option
            );

        }
    );

}


// ============================================================
// FILTRAR
// ============================================================

function aplicarFiltros() {

    const texto =
        document.getElementById(
            "busqueda"
        ).value
        .toLowerCase()
        .trim();

    const municipio =
        document.getElementById(
            "municipio"
        ).value;

    const estatus =
        document.getElementById(
            "estatus"
        ).value;

    const filtroPdf =
        document.getElementById(
            "pdf"
        ).value;


    solicitudesFiltradas =
        solicitudes.filter(
            solicitud => {

                // --------------------------------------------
                // TEXTO
                // --------------------------------------------

                const contenido = [

                    solicitud.folio,

                    solicitud.municipio,

                    solicitud.institucion,

                    solicitud.descripcion,

                    solicitud.respuesta

                ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


                const coincideTexto =
                    !texto ||
                    contenido.includes(
                        texto
                    );


                // --------------------------------------------
                // MUNICIPIO
                // --------------------------------------------

                const coincideMunicipio =
                    !municipio ||
                    solicitud.municipio ===
                        municipio;


                // --------------------------------------------
                // ESTATUS
                // --------------------------------------------

                const coincideEstatus =
                    !estatus ||
                    solicitud.estatus ===
                        estatus;


                // --------------------------------------------
                // PDF
                // --------------------------------------------

                let coincidePdf = true;


                if (
                    filtroPdf ===
                    "con_pdf"
                ) {

                    coincidePdf =
                        Boolean(
                            solicitud.pdf
                        );

                }


                if (
                    filtroPdf ===
                    "sin_pdf"
                ) {

                    coincidePdf =
                        !solicitud.pdf;

                }


                return (
                    coincideTexto &&
                    coincideMunicipio &&
                    coincideEstatus &&
                    coincidePdf
                );

            }
        );


    paginaActual = 1;

    mostrarResultados();

}


// ============================================================
// MOSTRAR RESULTADOS
// ============================================================

function mostrarResultados() {

    const contenedor =
        document.getElementById(
            "resultados"
        );

    contenedor.innerHTML = "";


    document.getElementById(
        "contador"
    ).textContent =
        `${solicitudesFiltradas.length.toLocaleString(
            "es-MX"
        )} solicitud(es) encontrada(s)`;


    if (
        solicitudesFiltradas.length === 0
    ) {

        contenedor.innerHTML = `
            <div class="sin-resultados">

                <h2>
                    No se encontraron solicitudes
                </h2>

                <p>
                    Prueba con otros términos
                    o elimina alguno de los filtros.
                </p>

            </div>
        `;

        mostrarPaginacion();

        return;

    }


    const inicio =
        (paginaActual - 1) *
        POR_PAGINA;

    const fin =
        inicio +
        POR_PAGINA;


    const pagina =
        solicitudesFiltradas.slice(
            inicio,
            fin
        );


    pagina.forEach(
        solicitud => {

            contenedor.appendChild(
                crearTarjeta(
                    solicitud
                )
            );

        }
    );


    mostrarPaginacion();

}


// ============================================================
// CREAR TARJETA
// ============================================================

function crearTarjeta(
    solicitud
) {

    const tarjeta =
        document.createElement(
            "article"
        );

    tarjeta.className =
        "solicitud";


    // --------------------------------------------------------
    // ESTADO PDF
    // --------------------------------------------------------

    let estadoPdf =
        "";


    if (
        solicitud.pdf
    ) {

        if (
            solicitud.pdf_estado ===
            "correccion_manual"
        ) {

            estadoPdf =
                `<span class="etiqueta pdf-manual">
                    PDF disponible
                </span>`;

        } else {

            estadoPdf =
                `<span class="etiqueta pdf-ok">
                    PDF disponible
                </span>`;

        }

    } else {

        estadoPdf =
            `<span class="etiqueta pdf-faltante">
                PDF no disponible
            </span>`;

    }


    // --------------------------------------------------------
    // DESCRIPCIÓN RECORTADA
    // --------------------------------------------------------

    const descripcion =
        solicitud.descripcion ||
        "Sin descripción disponible.";


    const descripcionCorta =
        descripcion.length > 280
            ? descripcion.substring(
                0,
                280
            ) + "..."
            : descripcion;


    // --------------------------------------------------------
    // TARJETA
    // --------------------------------------------------------

    tarjeta.innerHTML = `

        <div class="solicitud-cabecera">

            <div>

                <span class="folio">
                    ${escapeHtml(
                        solicitud.folio
                    )}
                </span>

                <span class="municipio">
                    ${escapeHtml(
                        solicitud.municipio
                    )}
                </span>

            </div>

            <div class="etiquetas">

                ${estadoPdf}

                ${
                    solicitud.estatus
                    ? `
                    <span class="etiqueta estatus">
                        ${escapeHtml(
                            solicitud.estatus
                        )}
                    </span>
                    `
                    : ""
                }

            </div>

        </div>


        <div class="datos-fecha">

            <span>
                <strong>
                    Recepción:
                </strong>

                ${escapeHtml(
                    solicitud.fecha_recepcion ||
                    "—"
                )}

            </span>


            <span>
                <strong>
                    Límite:
                </strong>

                ${escapeHtml(
                    solicitud.fecha_limite ||
                    "—"
                )}

            </span>

        </div>


        <div class="descripcion">

            <strong>
                Solicitud:
            </strong>

            <p>
                ${escapeHtml(
                    descripcionCorta
                )}
            </p>

        </div>
        <div class="acciones">

            <a
                class="boton-detalle"
                href="solicitudes/${encodeURIComponent(
                    solicitud.folio
                )}.html"
            >
                Ver solicitud completa
            </a>

        </div>

    `;

    return tarjeta;

}


// ============================================================
// DETALLE
// ============================================================

function mostrarDetalle(
    folio
) {

    const solicitud =
        solicitudes.find(
            s => s.folio === folio
        );


    if (!solicitud) {
        return;
    }


    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "modal";


    let botonPdf = "";


    if (
        solicitud.pdf
    ) {

        if (
            Array.isArray(
                solicitud.pdf
            )
        ) {

            botonPdf =
                solicitud.pdf
                    .map(
                        (pdf, index) => `
                            <a
                                href="${encodeURI(pdf)}"
                                target="_blank"
                                class="boton"
                            >
                                Ver PDF ${index + 1}
                            </a>
                        `
                    )
                    .join("");

        } else {

            botonPdf = `
                <a
                    href="${encodeURI(
                        solicitud.pdf
                    )}"
                    target="_blank"
                    class="boton"
                >
                    Ver PDF
                </a>
            `;

        }

    }


    let botonesPnt = "";


    if (
        solicitud.url_adjuntos &&
        solicitud.url_adjuntos.length
    ) {

        botonesPnt =
            solicitud.url_adjuntos
                .map(
                    url => `
                        <a
                            href="${escapeAttribute(
                                url
                            )}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="boton boton-pnt"
                        >
                            Ver archivo en PNT
                        </a>
                    `
                )
                .join("");

    }


    modal.innerHTML = `

        <div class="modal-fondo">

            <div class="modal-contenido">

                <button
                    class="cerrar"
                    aria-label="Cerrar"
                >
                    ×
                </button>


                <div class="modal-cabecera">

                    <span class="folio-grande">
                        ${escapeHtml(
                            solicitud.folio
                        )}
                    </span>

                    <h2>
                        ${escapeHtml(
                            solicitud.municipio
                        )}
                    </h2>

                </div>


                <section class="detalle-seccion">

                    <h3>
                        Información de la solicitud
                    </h3>

                    <dl>

                        <dt>
                            Institución
                        </dt>

                        <dd>
                            ${escapeHtml(
                                solicitud.institucion ||
                                "—"
                            )}
                        </dd>


                        <dt>
                            Tipo de solicitud
                        </dt>

                        <dd>
                            ${escapeHtml(
                                solicitud.tipo_solicitud ||
                                "—"
                            )}
                        </dd>


                        <dt>
                            Fecha de recepción
                        </dt>

                        <dd>
                            ${escapeHtml(
                                solicitud.fecha_recepcion ||
                                "—"
                            )}
                        </dd>


                        <dt>
                            Fecha límite
                        </dt>

                        <dd>
                            ${escapeHtml(
                                solicitud.fecha_limite ||
                                "—"
                            )}
                        </dd>


                        <dt>
                            Estatus
                        </dt>

                        <dd>
                            ${escapeHtml(
                                solicitud.estatus ||
                                "—"
                            )}
                        </dd>

                    </dl>

                </section>


                <section class="detalle-seccion">

                    <h3>
                        ¿Qué se solicitó?
                    </h3>

                    <div class="texto-largo">

                        ${escapeHtml(
                            solicitud.descripcion ||
                            "No disponible."
                        )}

                    </div>

                </section>


                <section class="detalle-seccion">

                    <h3>
                        Respuesta
                    </h3>

                    <div class="texto-largo">

                        ${escapeHtml(
                            solicitud.respuesta ||
                            "No se registró una respuesta."
                        )}

                    </div>

                </section>


                <section class="detalle-seccion acciones-finales">

                    ${botonPdf}

                    ${botonesPnt}

                </section>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    modal
        .querySelector(".cerrar")
        .addEventListener(
            "click",
            () => modal.remove()
        );


    modal
        .querySelector(".modal-fondo")
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.classList.contains(
                        "modal-fondo"
                    )
                ) {

                    modal.remove();

                }

            }
        );

}


// ============================================================
// PAGINACIÓN
// ============================================================

function mostrarPaginacion() {

    const contenedor =
        document.getElementById(
            "paginacion"
        );

    contenedor.innerHTML = "";


    const totalPaginas =
        Math.ceil(
            solicitudesFiltradas.length /
            POR_PAGINA
        );


    if (
        totalPaginas <= 1
    ) {

        return;

    }


    const crearBoton =
        (
            texto,
            pagina,
            deshabilitado = false
        ) => {

            const boton =
                document.createElement(
                    "button"
                );

            boton.textContent =
                texto;

            boton.disabled =
                deshabilitado;

            boton.className =
                pagina === paginaActual
                    ? "pagina activa"
                    : "pagina";


            boton.addEventListener(
                "click",
                () => {

                    paginaActual =
                        pagina;

                    mostrarResultados();

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );


            return boton;

        };


    contenedor.appendChild(
        crearBoton(
            "‹",
            paginaActual - 1,
            paginaActual === 1
        )
    );


    let inicio =
        Math.max(
            1,
            paginaActual - 2
        );

    let fin =
        Math.min(
            totalPaginas,
            paginaActual + 2
        );


    for (
        let pagina = inicio;
        pagina <= fin;
        pagina++
    ) {

        contenedor.appendChild(
            crearBoton(
                pagina,
                pagina
            )
        );

    }


    contenedor.appendChild(
        crearBoton(
            "›",
            paginaActual + 1,
            paginaActual === totalPaginas
        )
    );

}


// ============================================================
// ESCAPAR HTML
// ============================================================

function escapeHtml(
    texto
) {

    return String(texto)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


function escapeAttribute(
    texto
) {

    return String(texto)
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// EVENTOS
// ============================================================

document
    .getElementById(
        "busqueda"
    )
    .addEventListener(
        "input",
        aplicarFiltros
    );


document
    .getElementById(
        "municipio"
    )
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById(
        "estatus"
    )
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById(
        "pdf"
    )
    .addEventListener(
        "change",
        aplicarFiltros
    );


document
    .getElementById(
        "limpiar"
    )
    .addEventListener(
        "click",
        () => {

            document.getElementById(
                "busqueda"
            ).value = "";

            document.getElementById(
                "municipio"
            ).value = "";

            document.getElementById(
                "estatus"
            ).value = "";

            document.getElementById(
                "pdf"
            ).value = "";

            aplicarFiltros();

        }
    );


// ============================================================
// INICIAR
// ============================================================

cargarSolicitudes();