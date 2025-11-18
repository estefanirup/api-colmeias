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
        process.exit(1);
    }

    // 2. Criar um canal
    const channel = await connection.createChannel();

    // 3. Declarar a Exchange (tipo 'topic', durável)
    await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });

    // 4. Declarar a Fila (durável)
    const q = await channel.assertQueue(QUEUE_NAME, { durable: true });

    // 5. Bind da fila para a exchange usando a routing key
    await channel.bindQueue(q.queue, EXCHANGE_NAME, ROUTING_KEY);

    console.log(`[Consumidor] Aguardando por alertas na fila: ${q.queue}`);

    // 6. Começar a consumir as mensagens
    channel.consume(
        q.queue,
        (msg) => {
            if (msg?.content) {
                try {
                    // Converte buffer → string e remove possíveis caracteres BOM
                    let messageContent = msg.content
                        .toString('utf8')
                        .replace(/^\uFEFF/, '');

                    // Converte para JSON
                    const alertDTO = JSON.parse(messageContent);

                    // --- PROCESSAMENTO ---
                    console.log("ALERTA");
                    console.log("  Tipo de Alerta:", alertDTO.tipoAlerta);
                    console.log("  Sensor ID:", alertDTO.sensorId);
                    console.log("  Valor Registrado:", alertDTO.valorRegistrado);
                    console.log("  Limite:", alertDTO.limite);
                    console.log("  Timestamp:", alertDTO.timestamp);

                    // Confirma processamento
                    channel.ack(msg);

                } catch (err) {
                    console.error("Erro ao processar mensagem JSON:", err.message);

                    // Rejeita e descarta
                    channel.nack(msg, false, false);
                }
            } else {
                console.warn("Mensagem recebida sem conteúdo.");
                channel.ack(msg);
            }
        },
        {
            noAck: false // Reconhecimento manual
        }
    );
}

// Exportamos para uso no app.js
module.exports = { startConsumer };
