# Dungeons-Sockets
Durante o curso de Redes de Computadores na UFOP o nosso professor pediu para criarmos um sistema simples utilizando sockets e o modelo cliente/servidor  para aplicarmos tudo que aprendemos em sala! Gosto muito de jogos de turno e pensei: Porque não criar um jogo inspirado em Dungeons&Dragons?

E cá estamos com Dungeons&Sockets (não sou bom com nomes kkkkkkk)

Projeto:
Linguagem escolhida: Node.js
Sistema P2P (peer-to-peer) para o chat e arquitetura híbrida de Cliente/Servidor para validação! Então precisamos dividir em duas fontes

1- O servidor 
    Escuta: Abre um Socket TCP e fica aguardando conexões em um loop infinito
    Concorrência: Para cada jogador que conecta, o servidor abre uma nova Thread para lidar só com ele.
    Estado Global: Mantém um dicionário na memória para rastrear quem está online

2- O Cliente
    Thread de Escuta: Fica travada no recv(), apenas esperando as mensagens do servidor (tipo TURNO|Icaro ou RESULTADO|Adversario tirou 8 de dano).Thread de Ação: Fica travada no input do terminal, esperando você digitar "/lutar Adversario" ou escolher seu ataque.

REGRAS ESPECÍFICAS

Chat

     Ao receber uma solicitação de comunicação, uma nova janela ou sessão de chat deverá ser
    aberta automaticamente;


     Um usuário pode manter múltiplas conversas simultâneas;


     Cada nova conversa deve corresponder a uma nova conexão de rede.

    
Jogo em Rede


     O servidor atuará como árbitro, controlando o estado do jogo;


     Quando a partida for iniciada, todos os participantes devem ser notificados;


     Deve existir:


    o um tempo de espera inicial antes do início da partida;


    o um timer máximo para evitar que jogadores fiquem inativos;


     Ao final, o resultado do jogo deve ser enviado a todos os participantes.


________________________________________________________________________________________________________________________________________________________________


Cheklist de implementação

O servidor deverá:

    1. Aceitar conexões simultâneas de múltiplos clientes;    

    2. Receber de cada cliente, no momento do registro: um apelido (nickname);     

    3. Manter uma lista atualizada de usuários conectados;        

    4. Disponibilizar essa lista aos clientes sempre que solicitada;        

    5. Detectar e tratar desconexões de clientes.                                                                       
                                                                                                                       
Funcionamento do cliente            

Ao iniciar a aplicação, o cliente deverá:       
                                                             
1. Conectar-se ao servidor central;         

2. Registrar seu apelido;  

3. Solicitar e exibir a lista de usuários disponíveis;        

4. Permitir ao usuário:       

     atualizar a lista de participantes;             

     selecionar outro usuário para iniciar comunicação.            


A comunicação entre dois clientes ocorre diretamente, após a obtenção das informações necessárias junto ao servidor.    


________________________________________________________________________________________________________________________________________________________________