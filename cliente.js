const net = require('net');
const readline = require('readline');

// Configura o leitor do teclado
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const cliente = new net.Socket();
let registrado = false; // Controle para evitar chat antes do registro

// Conecta no servidor local na porta 666
cliente.connect(666, '127.0.0.1', () => {
    console.log('=========================================');
    console.log('🗡️  Conectado a Taverna Dungeons&Sockets!');
    console.log('=========================================');
    console.log('Para entrar, digite: /registrar SeuNick SuaClasse (Clerigo, Bruxo ou Ladino)');
    console.log('Clérigos são mais parrudos mas dão menos dano, bruxo é mais equilibrado, ladino é focado em dano bruto mas não resiste a tantos golpes');
});

// Fica escutando tudo que o Servidor mandar e imprime na tela
cliente.on('data', (data) => {
    console.log(`\n${data.toString().trim()}`);
});

// Escuta o seu teclado. Só dispara quando você aperta ENTER
rl.on('line', (input) => {
    const texto = input.trim();
    if (texto === '') return;

    // Se o texto começar com "/", tratamos como COMANDO de jogo
    if (texto.startsWith('/')) {
        const partes = texto.substring(1).split(' '); // Tira a barra e separa por espaços
        const comando = partes[0].toUpperCase();

        if (comando === 'REGISTRAR' && partes.length === 3) {
            registrado = true;
            cliente.write(`REGISTRAR|${partes[1]}|${partes[2]}\n`);
        } 
        else if (comando === 'LISTAR') {
            cliente.write('LISTAR\n');
        }
        else if (comando === 'DESAFIAR' && partes.length === 2) {
            cliente.write(`DESAFIAR|${partes[1]}\n`);
        }
        else if (comando === 'ACEITAR' && partes.length === 2) {
            cliente.write(`ACEITAR|${partes[1]}\n`);
        }
        else if (comando === 'ATACAR') {
            cliente.write(`ACAO|ATACAR\n`);
        }
        else if (comando === 'ESPECIAL') {
            cliente.write(`ACAO|ESPECIAL\n`);
        }
        else {
            console.log('Comando inválido. Tente: /registrar, /listar, /desafiar [nick], /aceitar [nick], /atacar, /especial');
        }
    } 
    // Se não começar com "/", é CHAT.
    else {
        if (!registrado) {
            console.log('Você precisa se registrar primeiro! Ex: /registrar SeuNick Bruxo');
        } else {
            // O servidor vai rotear isso para o Lobby ou para a Arena, dependendo do seu status
            cliente.write(`CHAT|${texto}\n`);
        }
    }
});

// Tratamento de encerramento e erros
cliente.on('close', () => {
    console.log('A conexão com a Taverna foi perdida.');
    process.exit();
});

cliente.on('error', (err) => {
    console.log(`Erro de conexão: ${err.message}`);
});