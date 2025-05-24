const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Cria cliente com autenticação local
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Função delay para simular digitação
const delay = ms => new Promise(res => setTimeout(res, ms));

// Guarda o estado do usuário
const userStates = {};

// Estados possíveis
const STATES = {
    INICIO: 'inicio',
    MENU_CLIENTE: 'menu_cliente',
    MENU_NAO_CLIENTE: 'menu_nao_cliente',
    CLIENTE_OPCAO: 'menu_cliente_opcao',
    NAO_CLIENTE_OPCAO: 'menu_nao_cliente_opcao'
};

// Gera QR code no terminal na primeira autenticação
client.on('qr', qr => {
    console.log('📱 Escaneie o QR Code abaixo com seu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('✅ WhatsApp Bot conectado e funcionando!');
    console.log('🤖 Bot Nobre Play está online');
});

// Tratamento de erros
client.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
});

client.on('auth_failure', msg => {
    console.error('❌ Falha na autenticação:', msg);
});

// Inicializa o cliente
client.initialize();

// Função para normalizar texto
function normalizeText(text) {
    return text.toLowerCase().trim();
}

// Função para verificar se é saudação
function isSaudacao(text) {
    const saudacoes = ['menu', 'oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'iae', 'salve', 'alo', 'alô'];
    return saudacoes.includes(normalizeText(text));
}

// Evento para tratamento de mensagens
client.on('message', async msg => {
    try {
        // Ignora mensagens de status e grupos
        if (msg.isStatus || msg.from.includes('@g.us')) {
            return;
        }

        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const nome = contact.pushname ? contact.pushname.split(" ")[0] : 'Amigo(a)';
        const userId = msg.from;
        const userMessage = msg.body.trim();

        // Inicializa estado do usuário se não existir
        if (!userStates[userId]) {
            userStates[userId] = STATES.INICIO;
        }

        console.log(`📨 Mensagem de ${nome} (${userId}): ${userMessage}`);
        console.log(`🔄 Estado atual: ${userStates[userId]}`);

        // Funções para enviar menus
        async function enviarMenuInicio() {
            userStates[userId] = STATES.INICIO;
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from,
                `✨ Olá, ${nome}! Seja bem-vindo(a) ao *Nobre Play* 🇧🇷\n\n` +
                `Você já é nosso cliente?\n\n` +
                `Digite:\n` +
                `*1* — Sou cliente\n` +
                `*2* — Não sou cliente`
            );
        }

        async function enviarMenuCliente() {
            userStates[userId] = STATES.MENU_CLIENTE;
            await chat.sendStateTyping();
            await delay(800);
            await client.sendMessage(msg.from,
                `Perfeito, ${nome}! Que bom ter você conosco. 😊\n\n` +
                `Com qual setor você gostaria de falar?\n\n` +
                `*1* — Suporte Técnico 🔧\n` +
                `*2* — Faturamento e Pagamento 💰\n` +
                `*3* — Outros assuntos 💬\n\n` +
                `Digite *9* para voltar ou *menu* para o início.`
            );
        }

        async function enviarMenuNaoCliente() {
            userStates[userId] = STATES.MENU_NAO_CLIENTE;
            await chat.sendStateTyping();
            await delay(800);
            await client.sendMessage(msg.from,
                `Certo, ${nome}! Me diz o que você gostaria de saber:\n\n` +
                `*1* — Como funciona o serviço 📺\n` +
                `*2* — Valores dos planos 💸\n` +
                `*3* — Vantagens e Benefícios 🌟\n` +
                `*4* — Falar com um atendente humano 👩‍💼\n` +
                `*5* — Abrir nosso Instagram 📲\n` +
                `*6* — Contratar agora 🚀\n\n` +
                `Digite *9* para voltar ou *menu* para o início.`
            );
        }

        // Comandos universais
        if (normalizeText(userMessage) === 'menu' || isSaudacao(userMessage)) {
            await enviarMenuInicio();
            return;
        }

        if (userMessage === '9') {
            if ([STATES.MENU_CLIENTE, STATES.CLIENTE_OPCAO].includes(userStates[userId])) {
                await enviarMenuCliente();
                return;
            }
            if ([STATES.MENU_NAO_CLIENTE, STATES.NAO_CLIENTE_OPCAO].includes(userStates[userId])) {
                await enviarMenuNaoCliente();
                return;
            }
            await enviarMenuInicio();
            return;
        }

        // Contratar agora (disponível em qualquer estado de não cliente)
        if (userMessage === '6' && userStates[userId].includes('nao_cliente')) {
            await chat.sendStateTyping();
            await delay(1000);
            await client.sendMessage(msg.from,
                `🚀 *Obrigado pelo interesse!*\n\n` +
                `📞 Nossos atendentes irão entrar em contato com você em breve para finalizar a contratação.\n\n` +
                `⏰ Tempo estimado: até 30 minutos\n\n` +
                `Digite *menu* para voltar ao início.`
            );
            return;
        }

        // Lógica principal baseada no estado
        switch (userStates[userId]) {
            case STATES.INICIO:
                if (userMessage === '1') {
                    await enviarMenuCliente();
                } else if (userMessage === '2') {
                    await enviarMenuNaoCliente();
                } else {
                    await client.sendMessage(msg.from,
                        `❓ Opção inválida, ${nome}!\n\n` +
                        `Por favor, digite:\n` +
                        `*1* para cliente\n` +
                        `*2* para não cliente\n` +
                        `ou *menu* para começar novamente.`
                    );
                }
                break;

            case STATES.MENU_CLIENTE:
                if (userMessage === '1') {
                    userStates[userId] = STATES.CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(800);
                    await client.sendMessage(msg.from,
                        `🔧 *Suporte Técnico*\n\n` +
                        `Descreva seu problema detalhadamente:\n` +
                        `• Tela preta ou travando\n` +
                        `• Aplicativo não abre\n` +
                        `• Problemas nos canais\n` +
                        `• Outros erros técnicos\n\n` +
                        `🚀 Um técnico especializado irá te responder em breve!\n\n` +
                        `Digite *9* para voltar ou *menu* para o início.`
                    );
                } else if (userMessage === '2') {
                    userStates[userId] = STATES.CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(800);
                    await client.sendMessage(msg.from,
                        `💰 *Faturamento e Pagamento*\n\n` +
                        `Informe o que você precisa:\n` +
                        `• Realizar um pagamento\n` +
                        `• Consultar vencimento\n` +
                        `• Alterar forma de pagamento\n` +
                        `• Solicitar segunda via\n\n` +
                        `💳 Nossa equipe financeira irá te ajudar!\n\n` +
                        `Digite *9* para voltar ou *menu* para o início.`
                    );
                } else if (userMessage === '3') {
                    userStates[userId] = STATES.CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(600);
                    await client.sendMessage(msg.from,
                        `💬 *Outros Assuntos*\n\n` +
                        `Descreva sua solicitação e um atendente especializado irá te responder em breve.\n\n` +
                        `⏰ Tempo estimado de resposta: até 15 minutos\n\n` +
                        `Digite *9* para voltar ou *menu* para o início.`
                    );
                } else {
                    await client.sendMessage(msg.from,
                        `❓ Opção inválida!\n\n` +
                        `Digite:\n*1* para Suporte\n*2* para Financeiro\n*3* para Outros\n*9* para voltar`
                    );
                }
                break;

            case STATES.MENU_NAO_CLIENTE:
                if (userMessage === '1') {
                    userStates[userId] = STATES.NAO_CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(1200);
                    await client.sendMessage(msg.from,
                        `📺 *Como funciona o Nobre Play:*\n\n` +
                        `🌐 *100% online* - sem antenas ou cabos!\n\n` +
                        `📱 *Dispositivos compatíveis:*\n` +
                        `• Smart TV (Samsung, LG, etc.)\n` +
                        `• Celular (Android/iPhone)\n` +
                        `• Computador/Notebook\n` +
                        `• TV Box\n` +
                        `• Tablet\n\n` +
                        `🎬 *Conteúdo em qualidade:*\n` +
                        `• HD, Full HD e 4K\n` +
                        `• Canais ao vivo\n` +
                        `• Filmes e séries\n\n` +
                        `Digite *9* para voltar ou *menu* para o início.`
                    );
                } else if (userMessage === '2') {
                    userStates[userId] = STATES.NAO_CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(1000);
                    await client.sendMessage(msg.from,
                        `💸 *Nossos Planos:*\n\n` +
                        `🗓️ *Mensal:* R$ 19,90\n` +
                        `📅 *Trimestral:* R$ 50,00 _(economia de R$ 9,70!)_\n` +
                        `🎯 *Anual:* R$ 160,00 _(economia de R$ 78,80!)_\n\n` +
                        `✅ *Todos os planos incluem:*\n` +
                        `• Acesso completo aos canais\n` +
                        `• Filmes e séries ilimitados\n` +
                        `• Suporte técnico 24h\n` +
                        `• Qualidade 4K\n` +
                        `• Sem fidelidade\n\n` +
                        `💡 *Recomendado:* Plano Anual (melhor custo-benefício)\n\n` +
                        `Digite *6* para contratar ou *9* para voltar.`
                    );
                } else if (userMessage === '3') {
                    userStates[userId] = STATES.NAO_CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(1000);
                    await client.sendMessage(msg.from,
                        `🌟 *Principais Vantagens:*\n\n` +
                        `⚡ Acesso instantâneo após pagamento\n` +
                        `📋 Sem burocracia ou instalação\n` +
                        `📱 Funciona em múltiplos dispositivos\n` +
                        `🎬 +50.000 filmes e séries\n` +
                        `📺 +200 canais ao vivo\n` +
                        `🆘 Suporte técnico 24/7\n` +
                        `🎯 Qualidade HD, Full HD e 4K\n` +
                        `💰 Preço justo e acessível\n` +
                        `🔄 Atualizações automáticas\n` +
                        `🌎 Acesso de qualquer lugar\n\n` +
                        `Digite *6* para contratar ou *9* para voltar.`
                    );
                } else if (userMessage === '4') {
                    userStates[userId] = STATES.NAO_CLIENTE_OPCAO;
                    await chat.sendStateTyping();
                    await delay(800);
                    await client.sendMessage(msg.from,
                        `👩‍💼 *Atendimento Humano Solicitado!*\n\n` +
                        `Um de nossos consultores especializados irá te chamar em breve para esclarecer todas suas dúvidas.\n\n` +
                        `⏰ *Tempo estimado:* até 20 minutos\n` +
                        `📞 *Horário de atendimento:* 8h às 22h\n\n` +
                        `Aguarde nossa ligação! 📲\n\n` +
                        `Digite *9* para voltar ou *menu* para o início.`
                    );
                } else if (userMessage === '5') {
                    userStates[userId] = STATES.NAO_CLIENTE_OPCAO;
                    await client.sendMessage(msg.from,
                        `📲 *Siga nosso Instagram:*\n\n` +
                        `👉 https://www.instagram.com/nobreplay/\n\n` +
                        `📸 Lá você encontra:\n` +
                        `• Novidades e lançamentos\n` +
                        `• Dicas de uso\n` +
                        `• Promoções exclusivas\n` +
                        `• Depoimentos de clientes\n\n` +
                        `Digite *9* para voltar ou *menu* para o início.`
                    );
                } else {
                    await client.sendMessage(msg.from,
                        `❓ Opção inválida!\n\n` +
                        `Digite um número de *1* a *6*, *9* para voltar ou *menu* para o início.`
                    );
                }
                break;

            default:
                // Estado desconhecido, volta ao início
                await enviarMenuInicio();
                break;
        }

    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        
        // Tenta enviar mensagem de erro para o usuário
        try {
            await client.sendMessage(msg.from, 
                `⚠️ Ops! Ocorreu um erro temporário.\n\n` +
                `Digite *menu* para começar novamente.`
            );
        } catch (sendError) {
            console.error('❌ Erro ao enviar mensagem de erro:', sendError);
        }
    }
});

// Log de inicialização
console.log('🤖 Iniciando WhatsApp Bot - Nobre Play...');
console.log('⏳ Aguardando conexão...');
