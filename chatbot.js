// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const client = new Client();
// serviço de leitura do qr code
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
// apos isso ele diz que foi tudo certo
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});
// E inicializa tudo 
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// Funil

client.on('message', async msg => {

    if (msg.body.match(/(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)/i) && msg.from.endsWith('@c.us')) {

        const chat = await msg.getChat();

        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        const contact = await msg.getContact(); //Pegando o contato
        const name = contact.pushname; //Pegando o nome do contato
        await client.sendMessage(msg.from,'Olá! '+ name.split(" ")[0] + ' Como posso ajudá-lo hoje? Por favor, digite uma das opções abaixo:\n\n1 - Como funciona\n2 - Valores dos planos\n3 - Benefícios\n4 - Como aderir\n5 - Já sou cliente'); //Primeira mensagem de texto
        
        
    }




    if (msg.body !== null && msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Nosso IPTV funciona de maneira simples e sem complicação!. 📺✨\n\nVocê não precisa de aparelhos extras nem de cabos, basta ter acesso à internet.\n\nCom apenas R$ 19,99 por mês, você pode assistir a centenas de canais, filmes e séries diretamente na sua Smart TV, celular, computador ou TV Box. É só conectar, acessar e aproveitar!.');

        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'COMO FUNCIONA?\nÉ muito simples.\n\n1º Passo\nFaça a solicitação do seu teste gratuito.\nFaça seu cadastro e escolha o plano que desejar.\n\n2º Passo\nApós efetuar o pagamento do plano escolhido, você já terá acesso a todos oc canais, series e filmes📺 \n\n3º Passo\nAproveite todos os conteudos🎬🚀');

        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Quer testar gratuitamente e ver a qualidade por si mesmo? Mande uma mensagem e garanta seu acesso!');

        await delay(3000); // delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Deseja voltar ao menu principal? Digite "Menu" para retornar. Ou digite "Teste" para que possamos lhe atender.');
    
    
    
    
    
    }

    if (msg.body !== null && msg.body === '2' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, '*Plano 1 mês: R$19,99 por mês.\n\n*Plano 3 mêses: R$55,00 por mês\n\n*Plano Anual: R$180,00 por mês');

        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Quer testar gratuitamente e ver a qualidade por si mesmo? Mande uma mensagem e garanta seu acesso!');
    
        await delay(3000); // delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Deseja voltar ao menu principal? Digite "Menu" para retornar. Ou digite "Teste" para que possamos lhe atender.');
    
    }

    if (msg.body !== null && msg.body === '3' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();


        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Pague menos e aproveite mais! Com o nosso por apenas R$ 19,99/mês, você tem acesso a centenas de canais, filmes e séries oferecendo o serviços como Netflix, HBO Max e Disney.\nSem cabos, sem aparelhos extras! Basta ter internet para assistir diretamente na sua Smart TV, celular, computador ou TV Box.\nAtendimento  ilimitado 24h por dia.\n\nLiberdade e praticidade! Sem contratos longos ou burocracia, você pode assistir quando e onde quiser, com qualidade Full HD e 4K.');
        
        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Quer testar gratuitamente e ver a qualidade por si mesmo? Mande uma mensagem e garanta seu acesso!');

        await delay(3000); // delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Deseja voltar ao menu principal? Digite "Menu" para retornar. Ou digite "Teste" para que possamos lhe atender.');
    
    
    
    }

    if (msg.body !== null && msg.body === '4' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Você pode aderir aos nossos planos diretamente pelo nosso site ou pelo WhatsApp.\n\nApós a adesão, você terá acesso imediato');


        await delay(3000); //delay de 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Quer testar gratuitamente e ver a qualidade por si mesmo? Mande uma mensagem e garanta seu acesso!');


        await delay(3000); // delay de 3 segundos
        await chat.sendStateTyping(); // Simulando digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Deseja voltar ao menu principal? Digite "Menu" para retornar. Ou digite "Teste" para que possamos lhe atender.');
    
    
    }

    if (msg.body !== null && msg.body === '5' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();

        await delay(3000); //Delay de 3000 milisegundos mais conhecido como 3 segundos
        await chat.sendStateTyping(); // Simulando Digitação
        await delay(3000);
        await client.sendMessage(msg.from, 'Olá, como podemos lhe ajudar ? Um dos atendentes ira lhe atender.');


    
        
    }








});