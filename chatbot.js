const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const client = new Client();

const delay = ms => new Promise(res => setTimeout(res, ms));

const userStates = {};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp conectado!');
});

client.initialize();

client.on('message', async msg => {
    const chat = await msg.getChat();
    const contact = await msg.getContact();
    const nome = contact.pushname ? contact.pushname.split(" ")[0] : 'Amigo(a)';
    const userId = msg.from;

    if (!userStates[userId]) {
        userStates[userId] = 'inicio';
    }

    // Função para enviar o menu inicial
    async function enviarMenuInicio() {
        userStates[userId] = 'inicio';
        await client.sendMessage(msg.from,
            `✨ Olá, ${nome}! Seja bem-vindo(a) ao Nobre Play 🇧🇷\n\n` +
            `Você já é nosso cliente?\n` +
            `Digite:\n` +
            `*1* — Sou cliente\n` +
            `*2* — Não sou cliente`
        );
    }

    // Função para enviar menu cliente (sem "Contrate agora")
    async function enviarMenuCliente() {
        userStates[userId] = 'menu_cliente';
        await client.sendMessage(msg.from,
            `Perfeito, ${nome}! Que bom ter você conosco. 😊\n\n` +
            `Com qual setor você gostaria de falar?\n\n` +
            `*1* — Suporte Técnico\n` +
            `*2* — Faturamento e Pagamento\n` +
            `*3* — Outros assuntos\n\n` +
            `Digite *9* para voltar ou *Menu* para o início.`
        );
    }

    // Função para enviar menu não cliente (com "Contrate agora")
    async function enviarMenuNaoCliente() {
        userStates[userId] = 'menu_nao_cliente';
        await client.sendMessage(msg.from,
            `Certo, ${nome}! Me diz o que você gostaria de saber:\n\n` +
            `*1* — Como funciona o serviço\n` +
            `*2* — Valores dos planos\n` +
            `*3* — Vantagens e Benefícios\n` +
            `*4* — Falar com um atendente humano\n` +
            `*5* — Abrir nosso Instagram\n` +
            `*6* — Contrate agora\n\n` +
            `Digite *9* para voltar ou *Menu* para o início.`
        );
    }

    // Comando universal para voltar pro menu principal
    if (msg.body.toLowerCase() === 'menu') {
        await enviarMenuInicio();
        return;
    }

    // Comando universal para voltar ao menu anterior com reenvio do menu
    if (msg.body === '9') {
        if (userStates[userId] === 'menu_cliente_opcao' || userStates[userId] === 'menu_cliente') {
            await enviarMenuCliente();
            return;
        } else if (userStates[userId] === 'menu_nao_cliente_opcao' || userStates[userId] === 'menu_nao_cliente') {
            await enviarMenuNaoCliente();
            return;
        } else {
            await enviarMenuInicio();
            return;
        }
    }

    // Tratar comando “Contrate agora” (6) só no menu não cliente
    if (msg.body === '6' && (userStates[userId] === 'menu_nao_cliente' || userStates[userId] === 'menu_nao_cliente_opcao')) {
        await client.sendMessage(msg.from,
            `📞 Obrigado pelo interesse! Meus atendentes irão entrar em contato com você em breve para finalizar a contratação.`
        );
        return;
    }

    switch (userStates[userId]) {
        case 'inicio':
            if (msg.body.match(/^(menu|oi|olá|ola|bom dia|boa tarde|boa noite|opa|iae|salve)$/i)) {
                await chat.sendStateTyping();
                await delay(1500);
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
                    `🔧 Suporte Técnico!\n\n` +
                    `Descreva seu problema: *Tela preta, erro, não abre, áudio, canais, etc.*\n\n` +
                    `🚀 Um atendente irá te responder em breve.\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }

            if (msg.body === '2') {
                userStates[userId] = 'menu_cliente_opcao';
                await client.sendMessage(msg.from,
                    `💰 Setor de Faturamento e Pagamento!\n\n` +
                    `Informe se precisa de:\n` +
                    `- Solicitar pagamento\n` +
                    `- Informações sobre vencimento\n\n` +
                    `🚀 Sua solicitação será encaminhada para um atendente.\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }

            if (msg.body === '3') {
                userStates[userId] = 'menu_cliente_opcao';
                await client.sendMessage(msg.from,
                    `👩‍💼 Ok! Um atendente irá te responder em breve para tratar desse assunto.\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }
            break;

        case 'menu_nao_cliente':
            if (msg.body === '1') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    `📺 Como funciona:\n\n` +
                    `Funciona 100% online, sem antenas ou cabos.\n` +
                    `Acesse em *Smart TV, celular, computador ou TV Box*.\n` +
                    `Conteúdos com qualidade *HD, Full HD e 4K*.\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }

            if (msg.body === '2') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    `💸 Nossos Planos:\n\n` +
                    `*Plano Mensal:* R$19,90\n` +
                    `*Plano Trimestral:* R$55,00\n` +
                    `*Plano Anual:* R$180,00\n\n` +
                    `✅ Acesso completo a canais, filmes e séries.\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }

            if (msg.body === '3') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    `🌟 Benefícios:\n\n` +
                    `✔️ Acesso instantâneo\n` +
                    `✔️ Sem burocracia\n` +
                    `✔️ Funciona em vários dispositivos\n` +
                    `✔️ Canais, filmes, séries, infantis e muito mais\n` +
                    `✔️ Suporte 24h\n` +
                    `✔️ Qualidade HD, Full HD e 4K\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }

            if (msg.body === '4') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    `👩‍💼 Um atendente irá te chamar em breve. Aguarde um instante!\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }

            if (msg.body === '5') {
                userStates[userId] = 'menu_nao_cliente_opcao';
                await client.sendMessage(msg.from,
                    `📲 Acesse nosso Instagram:\n\n` +
                    `👉 https://www.instagram.com/nobreplay/?utm_source=ig_web_button_share_sheet\n\n` +
                    `Digite *9* para voltar ou *Menu* para o início.`
                );
                return;
            }
            break;
    }
    // Não envia mensagem padrão quando não reconhece comando
});
