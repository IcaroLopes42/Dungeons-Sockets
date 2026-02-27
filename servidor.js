const net = require('net');

const jogadores = {};

const timersArena = {}; // Guarda os timeouts de cada partida

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

                        if (jogadores[apelidoAtual]) {
                            socket.write('Servidor: Esse nome já está em uso na Taverna.\n');
                            break;
                        }
                        
                        const classeFormatada = classe.toUpperCase();

                        let hpBase = 20; // Ladino ou padrão
                        if (classeFormatada === 'CLERIGO') hpBase = 30;
                        if (classeFormatada === 'BRUXO') hpBase = 25;

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
                            socket.write(`Caso queira desafiar algum jogador digite: desafiar|Nickname`)
                        }
                        break;

                    case 'DESAFIAR':
                        if (!apelidoAtual) break;
                        const inimigo = partes[1];

                        if (!jogadores[inimigo] || jogadores[inimigo].status !== 'livre') {
                            socket.write('Servidor: Jogador indisponível ou inexistente.\n');
                            break;
                        }

                        // Coloca o desafio em espera
                        socket.write(`Servidor: Desafio enviado a ${inimigo}. A aguardar resposta...\n`);
                        jogadores[inimigo].socket.write(`[Sistema] ${apelidoAtual} desafiou-o para um combate! Digite: aceitar|${apelidoAtual}\n`);
                        break;

                    case 'ACEITAR':
                        if (!apelidoAtual) break;
                        const desafiante = partes[1];

                        if (!jogadores[desafiante] || jogadores[desafiante].status !== 'livre') {
                            socket.write('Servidor: O desafiante já não está disponível.\n');
                            break;
                        }

                        // Inicia o combate
                        jogadores[apelidoAtual].status = 'em_jogo';
                        jogadores[apelidoAtual].oponente = desafiante;
                        
                        jogadores[desafiante].status = 'em_jogo';
                        jogadores[desafiante].oponente = apelidoAtual;

                        // Define quem começa (o desafiante)
                        jogadores[desafiante].turno = true;
                        jogadores[apelidoAtual].turno = false;

                        const msgInicio = `\n⚔️ A ARENA FOI ABERTA! ${desafiante} VS ${apelidoAtual} ⚔️\n`;
                        jogadores[desafiante].socket.write(msgInicio + `É a sua vez, ${desafiante}! Tem 15 segundos para usar /atacar ou /especial.\n`);
                        socket.write(msgInicio + `Aguarde o turno de ${desafiante}.\n`);

                        // Inicia o temporizador de 15 segundos para o K.O.
                        iniciarTimeoutTurno(desafiante, apelidoAtual);
                        break;

                    case 'ACAO':
                        if (!apelidoAtual || jogadores[apelidoAtual].status !== 'em_jogo') break;
                        
                        const meuPersonagem = jogadores[apelidoAtual];
                        const oponentePersonagem = jogadores[meuPersonagem.oponente];

                        if (!meuPersonagem.turno) {
                            socket.write('Servidor: Não é o seu turno! Aguarde.\n');
                            break;
                        }

                        // Llimpa o temporizador de K.O.
                        clearTimeout(timersArena[apelidoAtual]);

                        const tipoAcao = partes[1].toUpperCase(); // ATACAR ou ESPECIAL
                        let dano = 0;
                        let msgAcao = "";

                        if (tipoAcao === 'ATACAR') {
                            if (meuPersonagem.classe === 'Ladino') {
                                dano = Math.floor(Math.random() * 10) + 1; // 1d10
                            } else if (meuPersonagem.classe === 'Bruxo') {
                                dano = Math.floor(Math.random() * 8) + 1; // 1d8
                            } else { // Clerigo
                                dano = Math.floor(Math.random() * 6) + 1; // 1d6
                            }
                            msgAcao = `[Arena] ${apelidoAtual} atacou e causou ${dano} de dano!`;
                        } else if (tipoAcao === 'ESPECIAL') {
                             if (meuPersonagem.classe === 'Ladino') {
                                dano = Math.floor(Math.random() * 12) + 1; // 1d12
                            } else if (meuPersonagem.classe === 'Bruxo') {
                                dano = Math.floor(Math.random() * 10) + 1; // 1d10
                            } else { // Clerigo
                                dano = Math.floor(Math.random() * 8) + 1; // 1d8
                            }
                            msgAcao = `[Arena] ${apelidoAtual} usou o especial e causou ${dano} de dano!`;
                        }

                        // Aplica o dano
                        oponentePersonagem.hp -= dano;

                        // Envia o resultado para os dois
                        const resumo = `${msgAcao}\nHP de ${meuPersonagem.oponente}: ${oponentePersonagem.hp}`;
                        socket.write(resumo + '\n');
                        oponentePersonagem.socket.write(resumo + '\n');

                        // Verifica Condição de Vitória
                        if (oponentePersonagem.hp <= 0) {
                            socket.write(`🏆 VITÓRIA! Derrotou ${meuPersonagem.oponente}!\n`);
                            oponentePersonagem.socket.write(`💀 FOI DERROTADO por ${apelidoAtual}!\n`);
                            
                            // Reseta os status e HP 
                            meuPersonagem.status = 'livre';
                            meuPersonagem.oponente = null;
                            meuPersonagem.hp = meuPersonagem.classe === 'Clerigo' ? 30 : (meuPersonagem.classe === 'Bruxo' ? 25 : 20);

                            oponentePersonagem.status = 'livre';
                            oponentePersonagem.oponente = null;
                            oponentePersonagem.hp = oponentePersonagem.classe === 'Clerigo' ? 30 : (oponentePersonagem.classe === 'Bruxo' ? 25 : 20);
                            
                            broadcastLobby(`[Lobby] O combate terminou! ${apelidoAtual} venceu a batalha na Arena.`);
                        } else {
                            // Troca o turno
                            meuPersonagem.turno = false;
                            oponentePersonagem.turno = true;

                            oponentePersonagem.socket.write(`\nÉ a sua vez, ${meuPersonagem.oponente}! Tem 15 segundos para usar /atacar ou /especial.\n`);
                            socket.write(`\nAguarde o turno de ${meuPersonagem.oponente}.\n`);

                            // Inicia o temporizador para o próximo jogador
                            iniciarTimeoutTurno(meuPersonagem.oponente, apelidoAtual);
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

// Função que controla o tempo limite de jogada
function iniciarTimeoutTurno(jogadorVez, jogadorEspera) {
    // Se já houver um timer a correr, limpa-o
    if (timersArena[jogadorVez]) {
        clearTimeout(timersArena[jogadorVez]);
    }

    timersArena[jogadorVez] = setTimeout(() => {
        const charVez = jogadores[jogadorVez];
        const charEspera = jogadores[jogadorEspera];

        if (charVez && charEspera && charVez.status === 'em_jogo') {
            // O tempo da rodada esgotou
            const msgKO = `⏳ TEMPO ESGOTADO! ${jogadorVez} ficou inativo e perdeu por K.O. Técnico!`;
            charVez.socket.write(msgKO + '\n');
            charEspera.socket.write(msgKO + '\n🏆 VITÓRIA!\n');

            // Limpa o estado da arena
            charVez.status = 'livre';
            charVez.oponente = null;
            charVez.turno = false;

            charEspera.status = 'livre';
            charEspera.oponente = null;
            charEspera.turno = false;
            
            // Restaura HPs
            charVez.hp = 20; 
            charEspera.hp = 20;
        }
    }, 15000); // 15 segundos
}

servidor.listen(666, () => {
    console.log('=========================================');
    console.log('🛡️ Dungeons&Sockets - Mestre da Mesa ON');
    console.log('Escutando conexões TCP na porta 666...');
    console.log('=========================================');
});