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

  // ===============================
  // LOGS E ALERTAS
  // ===============================
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

  // ===============================
  // FLUXO DO PACIENTE
  // ===============================
  admitirPaciente(paciente) {
    this.pacientes.push(paciente)

    paciente.atualizarEstado(Paciente.ESTADOS.RECEPCAO)

    this.registrarEvento('paciente_admitido', {
      pacienteId: paciente.id
    })
  }

  // define gravidade e envia para fila de consulta
  finalizarRecepcao(paciente, gravidade) {
    paciente.definirGravidade(gravidade)
    paciente.atualizarEstado(Paciente.ESTADOS.CONSULTA)

    this.filaEspera.push(paciente)
    this.organizarFila()

    this.registrarEvento('paciente_em_espera_consulta', {
      pacienteId: paciente.id,
      gravidade
    })
  }

  // ===============================
  // FILA
  // ===============================
  organizarFila() {
    const prioridade = {
      vermelho: 1,
      amarelo: 2,
      verde: 3
    }

    this.filaEspera.sort((a, b) => {
      if (prioridade[a.gravidade] !== prioridade[b.gravidade]) {
        return prioridade[a.gravidade] - prioridade[b.gravidade]
      }
      return a.tempoChegada - b.tempoChegada
    })
  }

  // ===============================
  // ATENDIMENTO MÉDICO
  // ===============================
  alocarAtendimentos() {
    this.medicos.forEach(medico => {
      if (!medico.ocupado && this.filaEspera.length > 0) {
        const paciente = this.filaEspera.shift()

        medico.ocupado = true
        medico.pacienteId = paciente.id

        paciente.atualizarEstado(Paciente.ESTADOS.CONSULTA)

        this.registrarEvento('consulta_iniciada', {
          medicoId: medico.id,
          pacienteId: paciente.id
        })
      }
    })
  }

  finalizarConsulta(medicoId) {
    const medico = this.medicos.find(m => m.id === medicoId)
    if (!medico || !medico.ocupado) return

    const paciente = this.pacientes.find(p => p.id === medico.pacienteId)
    if (!paciente) return

    paciente.atualizarEstado(Paciente.ESTADOS.PAGAMENTO)

    medico.ocupado = false
    medico.pacienteId = null

    this.registrarEvento('consulta_finalizada', {
      medicoId,
      pacienteId: paciente.id
    })

    // automaticamente tenta puxar outro paciente
    this.alocarAtendimentos()
  }

  // ===============================
  // SAÍDA DO SISTEMA
  // ===============================
  finalizarPagamento(paciente) {
    paciente.atualizarEstado(Paciente.ESTADOS.ALTA)

    this.registrarEvento('paciente_em_alta', {
      pacienteId: paciente.id
    })
  }

  // ===============================
  // MONITORAMENTO
  // ===============================
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
}
