const net = require('net');

const jogadores = {};

const servidor = net.createServer((socket) => {
    let apelidoAtual = null;
    
    let buffer = ''; 

    console.log(`[Nova Conexão FÍSICA]: ${socket.remoteAddress}`);

    socket.on('data', (data) => {
        buffer += data.toString(); 

        if (buffer.includes('\n')) {
            
            let mensagens = buffer.split('\n');
            
            buffer = mensagens.pop(); 

            for (let msg of mensagens) {
                const mensagemLimpa = msg.trim(); // Tira espaços e sujeiras
                
                if (mensagemLimpa === '') continue; // Ignora se o cara só apertou ENTER 

                console.log(`[Recebido Inteiro de ${socket.remoteAddress}]: ${mensagemLimpa}`);
                
                const partes = mensagemLimpa.split('|');
                const comando = partes[0].toUpperCase();

                switch (comando) {
                    case 'REGISTRAR':
                        apelidoAtual = partes[1];
                        const classe = partes[2];
                        
                        let hpBase = 20; 
                        if (classe === 'Clerigo') hpBase = 30;
                        if (classe === 'Bruxo') hpBase = 25;

                        jogadores[apelidoAtual] = {
                            socket: socket,
                            ip: socket.remoteAddress,
                            classe: classe,
                            hp: hpBase,
                            status: 'livre'
                        };
                        
                        socket.write(`Servidor: Bem-vindo a Dungeons&Sockets, ${apelidoAtual} o ${classe}!\n`);
                        break;

                    case 'LISTAR':
                        const online = Object.keys(jogadores);
                        if (online.length === 0) {
                            socket.write(`Servidor: A Taverna esta vazia.\n`);
                        } else {
                            socket.write(`Servidor: Jogadores online -> ${online.join(', ')}\n`);
                        }
                        break;
                    
                    default:
                        socket.write('Servidor: Comando desconhecido pelo Mestre da Mesa.\n');
                }
            }
        }
    });

    socket.on('end', () => {
        if (apelidoAtual && jogadores[apelidoAtual]) {
            console.log(`[Desconectou]: ${apelidoAtual} saiu da Taverna.`);
            delete jogadores[apelidoAtual]; 
        }
    });
    
    socket.on('error', (err) => {
        console.log(`Erro na conexão com ${apelidoAtual}: ${err.message}`);
    });
});

servidor.listen(666, () => {
    console.log('=========================================');
    console.log('🛡️ Dungeons&Sockets - Mestre da Mesa ON');
    console.log('Escutando conexões TCP na porta 666...');
    console.log('=========================================');
});