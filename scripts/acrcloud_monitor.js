import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import FormData from 'form-data';

ffmpeg.setFfmpegPath(ffmpegPath);

const acrCloudConfig = {
    host: 'identify-us-west-2.acrcloud.com',
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type: 'audio',
    access_key: 'a08bafa8b27560228ba16cda96a3c44f',
    access_secret: 'vcJ011PdMUlndOIr0Ba4th03HJCujIVInika9D9C',
};

const streamUrl = 'https://a6.asurahosting.com:7340/radio.mp3';

function buildStringToSign(method, uri, accessKey, dataType, signatureVersion, timestamp) {
    return [method, uri, accessKey, dataType, signatureVersion, timestamp].join('\n');
}

function sign(signString, accessSecret) {
    return crypto.createHmac('sha1', accessSecret)
        .update(Buffer.from(signString, 'utf-8'))
        .digest('base64');
}

const captureAudio = (streamUrl, duration = 10) => {
    const outputPath = 'output.mp3';
    console.log(`Iniciando la captura de audio desde ${streamUrl} por ${duration} segundos...`);
    return new Promise((resolve, reject) => {
        ffmpeg(streamUrl)
            .setStartTime(0)
            .duration(duration)
            .output(outputPath)
            .on('end', () => {
                console.log('Captura de audio completada.');
                resolve(outputPath);
            })
            .on('error', (error) => {
                console.error('Error al capturar audio:', error);
                reject(error);
            })
            .run();
    });
};

const sendToAcrCloud = async (filePath) => {
    console.log('Preparando el archivo para enviar a ACRCloud...');
    const fileBuffer = fs.readFileSync(filePath);
    const timestamp = Math.floor(Date.now() / 1000);

    const stringToSign = buildStringToSign(
        'POST',
        acrCloudConfig.endpoint,
        acrCloudConfig.access_key,
        acrCloudConfig.data_type,
        acrCloudConfig.signature_version,
        timestamp
    );

    const signature = sign(stringToSign, acrCloudConfig.access_secret);

    const form = new FormData();
    form.append('sample', fileBuffer, {
        filename: 'output.mp3',
        contentType: 'audio/mpeg',
    });
    form.append('sample_bytes', fileBuffer.length);
    form.append('access_key', acrCloudConfig.access_key);
    form.append('data_type', acrCloudConfig.data_type);
    form.append('signature_version', acrCloudConfig.signature_version);
    form.append('signature', signature);
    form.append('timestamp', timestamp);

    try {
        console.log('Enviando consulta a ACRCloud...');
        const response = await axios.post(
            `https://${acrCloudConfig.host}${acrCloudConfig.endpoint}`, 
            form,
            {
                headers: form.getHeaders(),
            }
        );
        console.log('Respuesta de ACRCloud recibida.');
        return response.data;
    } catch (error) {
        console.error('Error al enviar a ACRCloud:', error);
        throw error;
    }
};
const startMonitoring = async () => {
    while (true) {
        try {
            console.log('Capturando fragmento de audio...');
            const audioFilePath = await captureAudio(streamUrl, acrCloudConfig.sample_duration);
            if (!fs.existsSync(audioFilePath)) {
                throw new Error('No se pudo capturar el fragmento de audio');
            }

            console.log('Enviando fragmento de audio a ACRCloud...');
            const acrData = await sendToAcrCloud(audioFilePath);

            if (acrData.status.code !== 0) {
                throw new Error(`Error en la identificación: ${acrData.status.msg}`);
            }
            console.log('Respuesta de ACRCloud:', JSON.stringify(acrData, null, 2));

            if (acrData.status.msg === 'Success') {
                const song = acrData.metadata.music[0];
                console.log('Canción identificada:', song.title, 'por', song.artists.map(artist => artist.name).join(', '));

                const songDuration = parseFloat(song.duration_ms) / 1000; // Convertir la duración a segundos
                const currentPosition = parseFloat(song.play_offset_ms) / 1000; // Convertir la posición actual a segundos
                const timeRemaining = songDuration - currentPosition; // Calcular el tiempo restante de la canción

                if (!isNaN(timeRemaining) && timeRemaining > 0) {
                    console.log(`Tiempo restante de la canción: ${timeRemaining.toFixed(2)} segundos`);

                    // Esperar el tiempo restante de la canción antes de la próxima captura
                    console.log(`Esperando ${timeRemaining.toFixed(2)} segundos antes de la siguiente captura...`);
                    await new Promise(resolve => setTimeout(resolve, timeRemaining * 1000));
                } else {
                    console.log('Error en el cálculo del tiempo restante. Esperando 10 segundos por defecto.');
                    await new Promise(resolve => setTimeout(resolve, 10000));
                }
            } else {
                console.log('No se pudo identificar la canción');
                console.log('Esperando 10 segundos antes de la siguiente captura...');
                await new Promise(resolve => setTimeout(resolve, 10000));
            }

            fs.unlinkSync(audioFilePath);
            console.log('Archivo de audio temporal eliminado.');

        } catch (error) {
            console.error('Error durante el proceso:', error);
            console.log('Esperando 10 segundos antes de la siguiente captura...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
};

startMonitoring();
