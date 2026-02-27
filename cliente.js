const net = require('net');
const readline = require('readline');

// Configura o leitor do teclado
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Conecta no servidor local na porta 666
const cliente = new net.Socket();
cliente.connect(666, '127.0.0.1', () => {
    console.log('=========================================');
    console.log('🗡️  Conectado a Taverna Dungeons&Sockets!');
    console.log('=========================================');
    console.log('Para entrar, digite: REGISTRAR|SeuNick|SuaClasse (Clerigo, Bruxo ou Ladino)');
});

// Fica escutando tudo que o Servidor mandar e imprime na tela
cliente.on('data', (data) => {
    console.log(`\n${data.toString()}`);
});

// Escuta o seu teclado. Só dispara quando você aperta ENTER
rl.on('line', (input) => {
    if (input.trim() !== '') {
        // Envia a mensagem inteira de uma vez pelo túnel TCP
        cliente.write(input + '\n');
    }
});

cliente.on('close', () => {
    console.log('A conexão com a Taverna foi perdida.');
    process.exit();
});

cliente.on('error', (err) => {
    console.log(`Erro de conexão: ${err.message}`);
});