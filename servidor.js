const net = require('net');

const jogadores = {};

const servidor = net.createServer((socket) => {
    let apelidoAtual = null; // Guarda quem é o dono desta conexão TCP
    console.log(`[Nova Conexão FÍSICA]: ${socket.remoteAddress}`);

    socket.on('data', (data) => {
        // O toString().trim() limpa a sujeira invisível do final da string
        const mensagem = data.toString().trim();
        console.log(`[Recebido de ${socket.remoteAddress}]: ${mensagem}`);
        
        
        const partes = mensagem.split('|');
        const comando = partes[0].toUpperCase();

        switch (comando) {
            case 'REGISTRAR':
                // Exemplo de uso: REGISTRAR|Icaro|Bruxo
                apelidoAtual = partes[1];
                const classe = partes[2];
                
                // Define o HP base dependendo da classe escolhida
                let hpBase = 20; // Padrão Ladino
                if (classe === 'Clerigo') hpBase = 30;
                if (classe === 'Bruxo') hpBase = 25;

                // Salva o jogador na memória do servidor
                jogadores[apelidoAtual] = {
                    socket: socket, // Guardamos o túnel TCP
                    ip: socket.remoteAddress,
                    classe: classe,
                    hp: hpBase,
                    status: 'livre'
                };
                
                socket.write(`Servidor: Bem-vindo a Dungeons&Sockets, ${apelidoAtual} o ${classe}!\n`);
                break;

            case 'LISTAR':
                // Pega todos os nomes cadastrados
                const online = Object.keys(jogadores);
                if (online.length === 0) {
                    socket.write(`Servidor: A Taverna esta vazia.\n`);
                } else {
                    socket.write(`Servidor: Jogadores online -> ${online.join(', ')}\n`);
                }
                break;
            
            // Aqui vão entrar os próximos comandos: DESAFIAR, ACEITAR, ACAO...
            
            default:
                socket.write('Servidor: Comando desconhecido pelo Mestre da Mesa.\n');
        }
    });

    // Quando o cliente fechar o terminal ou a internet cair:
    socket.on('end', () => {
        if (apelidoAtual && jogadores[apelidoAtual]) {
            console.log(`[Desconectou]: ${apelidoAtual} saiu da Taverna.`);
            delete jogadores[apelidoAtual]; // Remove da memória
        }
    });
    
    // Evita que o servidor crashe se der algum erro
    socket.on('error', (err) => {
        console.log(`Erro na conexão com ${apelidoAtual}: ${err.message}`);
    });
});

// Coloca o servidor para rodar na porta 666
servidor.listen(666, () => {
    console.log('=========================================');
    console.log('🛡️ Dungeons&Sockets - Mestre da Mesa ON');
    console.log('Escutando conexões TCP na porta 666...');
    console.log('=========================================');
});