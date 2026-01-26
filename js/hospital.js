class Hospital {
  constructor() {
    this.pacientes = []
    this.filaEspera = []
    this.medicos = [
      { id: 1, ocupado: false, pacienteId: null },
      { id: 2, ocupado: false, pacienteId: null }
    ]

    this.historico = []
    this.alertas = []
  }

  // registra eventos globais do hospital
  registrarEvento(evento, dados = {}) {
    this.historico.push({
      evento,
      dados,
      timestamp: Date.now()
    })
  }

  emitirAlerta(tipo, mensagem) {
    this.alertas.push({
      tipo,
      mensagem,
      timestamp: Date.now()
    })
  }

  // chegada de paciente
  admitirPaciente(paciente) {
    this.pacientes.push(paciente)
    paciente.atualizarEstado('recepcao')

    this.registrarEvento('paciente_admitido', {
      pacienteId: paciente.id
    })
  }

  // envia paciente para triagem
  enviarParaTriagem(paciente) {
    paciente.atualizarEstado('triagem')
    this.registrarEvento('triagem_iniciada', {
      pacienteId: paciente.id
    })
  }

  // finaliza triagem e envia para fila
  finalizarTriagem(paciente, gravidade) {
    paciente.definirGravidade(gravidade)
    paciente.atualizarEstado('espera')

    this.filaEspera.push(paciente)
    this.organizarFila()

    this.registrarEvento('triagem_finalizada', {
      pacienteId: paciente.id,
      gravidade
    })
  }

  // organiza fila por gravidade e tempo
  organizarFila() {
    const prioridade = { vermelho: 1, amarelo: 2, verde: 3 }

    this.filaEspera.sort((a, b) => {
      if (prioridade[a.gravidade] !== prioridade[b.gravidade]) {
        return prioridade[a.gravidade] - prioridade[b.gravidade]
      }
      return a.tempoChegada - b.tempoChegada
    })
  }

  // tenta alocar pacientes aos médicos livres
  alocarAtendimentos() {
    this.medicos.forEach(medico => {
      if (!medico.ocupado && this.filaEspera.length > 0) {
        const paciente = this.filaEspera.shift()

        medico.ocupado = true
        medico.pacienteId = paciente.id

        paciente.atualizarEstado('atendimento')

        this.registrarEvento('atendimento_iniciado', {
          medicoId: medico.id,
          pacienteId: paciente.id
        })
      }
    })
  }

  // verifica pacientes que passaram do tempo seguro
  verificarPacientesCriticos() {
    this.filaEspera.forEach(paciente => {
      if (paciente.tempoExcedido()) {
        this.emitirAlerta(
          'tempo_excedido',
          `Paciente ${paciente.nome} excedeu o tempo seguro`
        )
      }
    })
  }

  // simula fim de atendimento
  finalizarAtendimento(medicoId) {
    const medico = this.medicos.find(m => m.id === medicoId)
    if (!medico || !medico.ocupado) return

    const paciente = this.pacientes.find(p => p.id === medico.pacienteId)
    if (!paciente) return

    paciente.atualizarEstado('finalizado')

    medico.ocupado = false
    medico.pacienteId = null

    this.registrarEvento('atendimento_finalizado', {
      medicoId,
      pacienteId: paciente.id
    })
  }
}
