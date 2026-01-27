class Paciente {

  // Vocabulário oficial do sistema
  static ESTADOS = {
    RECEPCAO: 'recepcao',
    CONSULTA: 'consulta',
    PAGAMENTO: 'pagamento',
    ALTA: 'alta'
  }

  static GRAVIDADE = {
    VERDE: 'verde',
    AMARELO: 'amarelo',
    VERMELHO: 'vermelho'
  }

  constructor(id, nome) {
    this.id = id
    this.nome = nome

    this.estado = Paciente.ESTADOS.RECEPCAO
    this.gravidade = null

    this.tempoChegada = Date.now()
    this.tempoMaximoEspera = null

    this.historico = [
      {
        evento: 'chegada',
        estado: this.estado,
        timestamp: Date.now()
      }
    ]
  }

  // Controle de transições válidas
  podeMudarPara(novoEstado) {
    const transicoesValidas = {
      [Paciente.ESTADOS.RECEPCAO]: [Paciente.ESTADOS.CONSULTA],
      [Paciente.ESTADOS.CONSULTA]: [Paciente.ESTADOS.PAGAMENTO],
      [Paciente.ESTADOS.PAGAMENTO]: [Paciente.ESTADOS.ALTA],
      [Paciente.ESTADOS.ALTA]: []
    }

    return transicoesValidas[this.estado]?.includes(novoEstado)
  }

  atualizarEstado(novoEstado) {
    if (!this.podeMudarPara(novoEstado)) {
      this.registrarEvento(`transicao_invalida: ${this.estado} -> ${novoEstado}`)
      return false
    }

    this.estado = novoEstado
    this.registrarEvento(`mudanca_estado: ${novoEstado}`)
    return true
  }

  definirGravidade(gravidade) {
    this.gravidade = gravidade

    if (gravidade === Paciente.GRAVIDADE.VERDE)
      this.tempoMaximoEspera = 30 * 60 * 1000 // 30 min

    if (gravidade === Paciente.GRAVIDADE.AMARELO)
      this.tempoMaximoEspera = 15 * 60 * 1000 // 15 min

    if (gravidade === Paciente.GRAVIDADE.VERMELHO)
      this.tempoMaximoEspera = 5 * 60 * 1000 // 5 min

    this.registrarEvento(`gravidade_definida: ${gravidade}`)
  }

  registrarEvento(evento) {
    this.historico.push({
      evento,
      estado: this.estado,
      timestamp: Date.now()
    })
  }

  tempoExcedido() {
    if (!this.tempoMaximoEspera) return false
    return Date.now() - this.tempoChegada > this.tempoMaximoEspera
  }
}
