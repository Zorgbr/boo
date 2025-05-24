
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Cria cliente com autenticação local, assim você não precisa ficar lendo QR Code toda hora
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

// Gera QR code no terminal na primeira autenticação
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
});

// Inicializa o cliente
client.initialize();

// Evento para tratamento de mensagens
client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const nome = contact.pushname ? contact.pushname.split(" ")[0] : 'Amigo(a)';
    const userId = msg.from;

    if (!userStates[userId]) {
        userStates[userId] = 'inicio';
    }

    async function enviarMenuInicio() {
        userStates[userId] = 'inicio';
        await client.sendMessage(msg.from,
            ✨ Olá, ${nome}! Seja bem-vindo(a) ao Nobre Play 🇧🇷\n\n +
            Você já é nosso cliente?\n +
            Digite:\n +
            *1* — Sou cliente\n +
            *2* — Não sou cliente
        );
    }

    async function enviarMenuCliente() {
        userStates[userId] = 'menu_cliente';
        await client.sendMessage(msg.from,
            Perfeito, ${nome}! Que bom ter você conosco. 😊\n\n +
            Com qual setor você gostaria de falar?\n\n +
            *1* — Suporte Técnico\n +
            *2* — Faturamento e Pagamento\n +
            *3* — Outros assuntos\n\n +
            Digite *9* para voltar ou *Menu* para o início.
        );
    }

    async function enviarMenuNaoCliente() {
        userStates[userId] = 'menu_nao_cliente';
        await client.sendMessage(msg.from,
            Certo, ${nome}! Me diz o que você gostaria de saber:\n\n +
            *1* — Como funciona o serviço\n +
            *2* — Valores dos planos\n +
            *3* — Vantagens e Benefícios\n +
            *4* — Falar com um atendente humano\n +
            *5* — Abrir nosso Instagram\n +
            *6* — Contratar agora\n\n +
            Digite *9* para voltar ou *Menu* para o início.
        );
    }

    // Comandos universais
    if (msg.body.toLowerCase() === 'menu') {
        await enviarMenuInicio();
        return;
    }

    if (msg.body === '9') {
        if (['menu_cliente', 'menu_cliente_opcao'].includes(userStates[userId])) {
            await enviarMenuCliente();
            return;
        }
        if (['menu_nao_cliente', 'menu_nao_cliente_opcao'].includes(userStates[userId])) {
            await enviarMenuNaoCliente();
            return;
        }
        await enviarMenuInicio();
        return;
    }

    if (msg.body === '6' && userStates[userId].startsWith('menu_nao_cliente')) {
        await client.sendMessage(msg.from,
            📞 Obrigado pelo interesse! Meus atendentes irão entrar em contato com você em breve para finalizar a contratação.
        );
        return;
    }

    switch (userStates[userId]) {
        case 'inicio':
            if (msg.body.match(/^(menu|oi|olá|ola|bom dia|boa tarde|boa noite|opa|iae|salve)$/i)) {
                await chat.sendStateTyping();
                await delay(1200);
                await enviarMenuInicio();
                return;
            }
            if (msg.body === '1') {
                await enviarMenuCliente();
                return;
            }
            if (msg.body === '2') {
                await enviarMenuNaoCliente();
                return;
            }
            break;

        case 'menu_cliente':
            if (msg.body === '1') {
                userStates[userId] = 'menu_cliente_opcao';
                await client.sendMessage(msg.from,
                    🔧 Suporte Técnico!\n\n +
                    Descreva seu problema (ex.: tela preta, erro, não abre, canais, etc.).\n\n +
                    🚀 Um atendente irá te responder em breve.\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            if (msg.body === '2') {
                userStates[userId] = 'menu_cliente_opcao';
                await client.sendMessage(msg.from,
                    💰 Faturamento e Pagamento!\n\n +
                    Informe se deseja:\n +
                    - Realizar um pagamento\n +
                    - Saber informações de vencimento\n\n +
                    🚀 Um atendente irá te ajudar.\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            if (msg.body === '3') {
                userStates[userId] = 'menu_cliente_opcao';
                await client.sendMessage(msg.from,
                    👩‍💼 Ok! Um atendente irá te responder em breve.\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            break;

        case 'menu_nao_cliente':
            if (msg.body === '1') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    📺 Como funciona:\n\n +
                    100% online, sem antenas ou cabos.\n +
                    Assista na *Smart TV, celular, computador ou TV Box*.\n +
                    Conteúdos em *HD, Full HD e 4K*.\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            if (msg.body === '2') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    💸 Planos disponíveis:\n\n +
                    *Mensal:* R$19,90\n +
                    *Trimestral:* R$50,00\n +
                    *Anual:* R$160,00\n\n +
                    ✅ Acesso a canais, filmes e séries.\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            if (msg.body === '3') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    🌟 Vantagens:\n\n +
                    ✔️ Acesso instantâneo\n +
                    ✔️ Sem burocracia\n +
                    ✔️ Funciona em vários dispositivos\n +
                    ✔️ Filmes, séries, canais ao vivo\n +
                    ✔️ Suporte 24h\n +
                    ✔️ Qualidade HD, Full HD e 4K\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            if (msg.body === '4') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    👩‍💼 Um atendente irá te chamar em breve. Aguarde!\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            if (msg.body === '5') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    📲 Acesse nosso Instagram:\n\n +
                    👉 https://www.instagram.com/nobreplay/\n\n +
                    Digite *9* para voltar ou *Menu* para o início.
                );
                return;
            }
            break;
    }
});
