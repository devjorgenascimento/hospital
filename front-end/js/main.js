let contadorPacientes = 1
const hospital = new Hospital()

function gravidadeAleatoria() {
    const gravidades = ['verde', 'amarelo', 'vermelho']

    const sorteio = Math.random() * 100
    let acumulado = 0
    for ( let g of gravidades) {
        acumulado += 100 / gravidades.length
        if (sorteio <= acumulado) {
            return g
        }
    }
}

document    
  .getElementById('btn-novo-paciente')
  .addEventListener('click', () => {

  const paciente = new Paciente(    
    contadorPacientes, `paciente ${contadorPacientes}`
   )
    
   hospital.admitirPaciente(paciente)

   hospital.enviarParaTriagem(paciente)
   
   const gravidade = gravidadeAleatoria();
    hospital.finalizarTriagem(paciente, gravidade)
    hospital.alocarAtendimentos()

    console.log('Após triagem:', paciente)
    console.log('Fila:', hospital.filaEspera)
    console.log('Médicos:', hospital.medicos)
    contadorPacientes++
  })


 setInterval(() => {
  hospital.verificarPacientesCriticos()
  renderPacientes(hospital)
  renderAlertas(hospital)
    }, 1000) 

