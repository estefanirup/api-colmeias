const amqp = require('amqplib');

// Nomes da infraestrutura (DEVEM ser iguais aos da API 1 - Produtor)
const EXCHANGE_NAME = 'sensors_exchange';
const QUEUE_NAME = 'sensors_alerts_queue';
const ROUTING_KEY = 'sensors.alerts.critical';

async function startConsumer() {
    // 1. Conectar ao RabbitMQ
    let connection;
    try {
        if (!process.env.RABBITMQ_URL) {
            throw new Error("A variável de ambiente RABBITMQ_URL não está definida!");
        }

        connection = await amqp.connect(process.env.RABBITMQ_URL);
        console.log("Conectado ao RabbitMQ com sucesso!");
    } catch (error) {
        console.log("Erro na conexão com o RabbitMQ!");
        console.log(error);
        process.exit(1); // Sai da aplicação se não conseguir conectar
    }

    // 2. Criar um canal
    const channel = await connection.createChannel();

    // 3. Declarar a Exchange (tipo 'topic', durável)
    // (Boa prática para garantir que existe, mesmo que a API 1 já tenha criado)
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // 4. Declarar a Fila (durável)
    // (O 'q' é um objeto que contém o nome da fila, que já sabemos)
    const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 5. Ligar (Bind) a Fila à Exchange usando a Routing Key
    await channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY);

    console.log(`[Consumidor] Aguardando por alertas na fila: ${q.queue}`);

    // 6. Começar a consumir as mensagens
    channel.consume(q.queue, (msg) => {
        if (msg.content) {
            try {
                // O conteúdo (msg.content) vem como Buffer, convertemos para String (JSON)
                const messageContent = msg.content.toString();
                // Convertemos o JSON para um objeto JavaScript
                const alertDTO = JSON.parse(messageContent);

                // --- AQUI É O PROCESSAMENTO ---
                // (Simulando o envio de e-mail/SMS com um log)
                console.log("------ALERTA RECEBIDO------");
                console.log("  Tipo de Alerta:", alertDTO.tipoAlerta);
                console.log("  Sensor ID:", alertDTO.sensorId);
                console.log("  Valor Registrado:", alertDTO.valorRegistrado);
                console.log("  Limite:", alertDTO.limite);
                console.log("  Timestamp:", alertDTO.timestamp);
                console.log("-------------------------------------------------");
                
                // 7. Acusar o recebimento (ACK) - IMPORTANTE!
                // Isso diz ao RabbitMQ que a mensagem foi processada e pode ser removida da fila.
                channel.ack(msg);

            } catch (parseError) {
                console.error("Erro ao processar mensagem JSON:", parseError.message);
                // Rejeita a mensagem sem colocar de volta na fila
                channel.nack(msg, false, false); 
            }
        }
    }, {
        // noAck: false -> Significa que vamos acusar o recebimento (ack) manualmente
        noAck: false 
    });
}

// Exportamos a função para ser chamada pelo app.js
module.exports = { startConsumer };