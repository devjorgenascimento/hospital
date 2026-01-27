 const areas = {
    recepcao: document.querySelector('#recepcao .lista-pacientes'),
    triagem: document.querySelector('#triagem .lista-pacientes'),
    espera: document.querySelector('#espera .lista-pacientes')
 }

 const medicosUi ={
    1: document.querySelector('#medico-1 .lista-pacientes'),
    2: document.querySelector('#medico-2 .lista-pacientes'),
 }
 
 const listaAlertas = document.getElementById('#alertas-lista');


const estadoAnterior = new Map();

function limparAreas() {
    Object.values(areas).forEach(area => {
        if (area) area.innerHTML = '';
    })
    Object.values(medicosUi).forEach(area => {
        if (area) area.innerHTML = '';
    })

}

function criarElementoPaciente(paciente, estadoAntes) {
    const div = document.createElement('div');
    div.classList.add('paciente');

    if (paciente.gravidade) {
        div.classList.add(paciente.gravidade);
    }

    div.dataset.id = paciente.id;
    div.textContent = paciente.nome;

    if (estadoAntes && estadoAntes !== paciente.estado) {
        div.classList.add('entrando')
        requestAnimationFrame(() => {
            div.classList.remove('entrando')
        })
    }
    return div;
}


function renderPacientes(hospital) {
    if (!hospital || !hospital.pacientes) return;

    limparAreas();

    hospital.pacientes.forEach(paciente => {
        const area = areas[paciente.estado];
        if (!area) return;

        const estadoAntes = estadoAnterior.get(paciente.id);
        const elemento = criarElementoPaciente(paciente, estadoAntes);
        area.appendChild(elemento);
    });


    hospital.medicos.forEach(medico => {
    if (!medico.ocupado) return;

    const paciente = hospital.pacientes.find(
        p => p.id === medico.pacienteId
    )
    if (!paciente) return;

    const areaMedico = medicosUi[medico.id];
    if (!areaMedico) return;

    const elemento = criarElementoPaciente(paciente);
    areaMedico.appendChild(elemento);
})

  atualizarEstadoAnterior(hospital) 

}


function atualizarEstadoAnterior(hospital) {
    hospital.pacientes.forEach(p => {
        estadoAnterior.set(p.id, p.estado);
    })
}

function renderAlertas(hospital) {
    if (!listaAlertas) return;

    listaAlertas.innerHTML = '';

    hospital.alertas.slice(-5).forEach(alerta => {
        const li = document.createElement('li');
        li.textContent = alerta.mensagem;
        listaAlertas.appendChild(li);
    })
}

