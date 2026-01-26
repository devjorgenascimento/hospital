class Paciente {
    constructor(id, nome) {
        this.id = id;
        this.nome = nome; 
        
        this.estado = 'recepcao'; // estados: recepcao, consulta, pagamento, alta

        this.gravidade = null; // leve, moderado, grave
        
        this.tempoChegada = Date.now();
        this.tempoMaximoEspera = null; // em milissegundos

        this.historico = [
            {
                evento: 'chegada',
                estado: this.estado,
                timetamp: Date.now()
            }
        ];
    }   

    atualizarEstado(novoEstado) {
        this.estado = novoEstado;
        this.registrarEvento(`mudanca_estado: ${novoEstado}`);
    }

    definirGravidade(gravidade) {
        this.gravidade = gravidade

        if (gravidade === 'verde') this.tempoMaximoEspera = 30 * 60 * 1000; // 120 minutos
        if (gravidade === 'amarelo') this.tempoMaximoEspera = 15 * 60 * 1000; // 60 minutos
        if (gravidade === 'vermelho') this.tempoMaximoEspera = 5 * 60 * 1000; // 15 minutos
        
        this.registrarEvento(`gravidade: ${gravidade}`); 
    }

    registrarEvento(evento) {
        this.historico.push({
            evento, 
            estado: this.estado,
            timetamp: Date.now()
        });
    }

    tempoExcedido() {
        if (!this.tempoMaximoEspera) return false;
        return Date.now() - this.tempoChegada > this.tempoMaximoEspera;
}

}

