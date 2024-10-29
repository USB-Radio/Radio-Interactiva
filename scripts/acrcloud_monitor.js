// Importaciones necesarias
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import FormData from 'form-data';
import crypto from 'crypto';
import axios from 'axios';
import { PassThrough } from 'stream';

ffmpeg.setFfmpegPath(ffmpegPath);

// Configuración de ACRCloud
const acrCloudConfig = {
    host: 'identify-us-west-2.acrcloud.com',
    endpoint: '/v1/identify',
    signature_version: '1',
    data_type: 'audio',
    access_key: 'a08bafa8b27560228ba16cda96a3c44f', 
    access_secret: 'vcJ011PdMUlndOIr0Ba4th03HJCujIVInika9D9C', 
};
// URL del stream de audio
const streamUrl = 'https://a6.asurahosting.com:7340/radio.mp3';

// Ruta al archivo de credenciales de Google Cloud
const googleCredentialsPath = 'secrets/key.json'; 

// Inicializar el cliente de Google Cloud Speech
const client = new SpeechClient({ keyFilename: googleCredentialsPath });

// Variables para el archivo de subtítulos
let subtitleCounter = 1;
let subtitleStream;

const speechPassThrough = new PassThrough();
const acrPassThrough = new PassThrough();

const sendBufferToAcrCloud = async (buffer) => {
    console.log('Preparando el buffer para enviar a ACRCloud...');
    const timestamp = Math.floor(Date.now() / 1000);

    const stringToSign = [
        'POST',
        acrCloudConfig.endpoint,
        acrCloudConfig.access_key,
        acrCloudConfig.data_type,
        acrCloudConfig.signature_version,
        timestamp
    ].join('\n');

    const signature = crypto.createHmac('sha1', acrCloudConfig.access_secret)
        .update(Buffer.from(stringToSign, 'utf-8'))
        .digest('base64');

    const form = new FormData();
    form.append('sample', buffer, {
        filename: 'audio.mp3',
        contentType: 'audio/mpeg',
    });
    form.append('sample_bytes', buffer.length);
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

const startGoogleSpeechStream = () => {
    console.log('Iniciando transcripción en tiempo real con Google Speech-to-Text...');

    subtitleStream = fs.createWriteStream('subtitles.srt');
    subtitleCounter = 1; // Reiniciar el contador de subtítulos

    const request = {
        config: {
            encoding: 'MP3',
            sampleRateHertz: 44100,
            languageCode: 'es-ES',
            enableWordTimeOffsets: true,
            enableAutomaticPunctuation: true,
            enableSpeakerDiarization: true,
            diarizationSpeakerCount: 2,
            model: 'default',
        },
        interimResults: true, // Obtener resultados intermedios
    };

    let speakerTextMap = {};
    let lastWriteTime = Date.now();

    // Función para crear y manejar el recognizeStream
    const createRecognizeStream = () => {
        const recognizeStream = client
            .streamingRecognize(request)
            .on('error', (error) => {
                console.error('Error en el streaming de Google Speech-to-Text:', error);
                if (error.code === 11) {
                    console.log('Reiniciando el stream de reconocimiento...');
                    restartStream();
                }
            })
            .on('data', (data) => {
                if (data.results[0]) {
                    const result = data.results[0];
                    const isFinal = result.isFinal;
                    const alternative = result.alternatives[0];

                    const wordsInfo = alternative.words;
                    wordsInfo.forEach((wordInfo) => {
                        const speakerTag = wordInfo.speakerTag || 1; 
                        const word = wordInfo.word;

                        if (!speakerTextMap[speakerTag]) {
                            speakerTextMap[speakerTag] = {
                                startTime: wordInfo.startTime,
                                endTime: wordInfo.endTime,
                                words: [],
                            };
                        }

                        speakerTextMap[speakerTag].words.push(word);
                        speakerTextMap[speakerTag].endTime = wordInfo.endTime;
                    });

                    const currentTime = Date.now();
                    if (isFinal || currentTime - lastWriteTime >= 5000) {
                        Object.keys(speakerTextMap).forEach((speakerTag) => {
                            const speakerData = speakerTextMap[speakerTag];

                            const formatTime = (time) => {
                                const seconds = parseInt(time.seconds || 0, 10) + parseFloat(time.nanos || 0) / 1e9;
                                const date = new Date(seconds * 1000);
                                const hours = String(date.getUTCHours()).padStart(2, '0');
                                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                                const secs = String(date.getUTCSeconds()).padStart(2, '0');
                                const millis = String(Math.floor(date.getUTCMilliseconds())).padStart(3, '0');
                                return `${hours}:${minutes}:${secs},${millis}`;
                            };

                            const srtSegment = `${subtitleCounter}\n${formatTime(speakerData.startTime)} --> ${formatTime(speakerData.endTime)}\n[Hablante ${speakerTag}]: ${speakerData.words.join(' ')}\n\n`;

                            subtitleStream.write(srtSegment);
                            subtitleCounter++;

                            console.log(`[Hablante ${speakerTag}]: ${speakerData.words.join(' ')}`);

                            delete speakerTextMap[speakerTag];
                        });
                        lastWriteTime = currentTime;
                    }
                }
            })
            .on('end', () => {
                console.log('Stream de reconocimiento finalizado.');
                restartStream();
            });

        return recognizeStream;
    };

    let recognizeStream = createRecognizeStream();

    // Función para reiniciar el stream
    const restartStream = () => {
        if (recognizeStream) {
            recognizeStream.removeAllListeners();
            recognizeStream = null;
        }
        recognizeStream = createRecognizeStream();
        speechPassThrough.unpipe();
        speechPassThrough.pipe(recognizeStream);
    };

    return recognizeStream;
};

const startMonitoring = async () => {
    let currentMode = 'song'; // Inicialmente asumimos que está en modo canción
    let checkInterval = 60; // Intervalo de verificación en segundos
    let lastCheckTime = Date.now();

    // Iniciar la transcripción en tiempo real
    const recognizeStream = startGoogleSpeechStream();

    // Capturar el audio y enviarlo al stream de Google y ACRCloud
    const ffmpegProcess = ffmpeg(streamUrl)
        .format('mp3')
        .on('error', (error) => {
            console.error('Error al capturar audio:', error);
        });

    const ffmpegStream = ffmpegProcess.pipe();

    // Duplicar el flujo de ffmpeg
    ffmpegStream.pipe(speechPassThrough);
    ffmpegStream.pipe(acrPassThrough);

    // Enviar el flujo a Google Speech-to-Text
    speechPassThrough.pipe(recognizeStream);

    // Buffer para almacenar el audio para ACRCloud
    let acrBuffer = Buffer.alloc(0);

    // Manejar el flujo para ACRCloud
    acrPassThrough.on('data', (chunk) => {
        acrBuffer = Buffer.concat([acrBuffer, chunk]);

        // Limitar el tamaño del buffer a 10 segundos (aproximadamente)
        const maxBufferSize = 10 * 44100 * 2 * 2; // 10 segundos de audio en bytes (suponiendo 44.1kHz, 16 bits, estéreo)
        if (acrBuffer.length > maxBufferSize) {
            acrBuffer = acrBuffer.slice(acrBuffer.length - maxBufferSize);
        }
    });

    while (true) {
        try {
            const currentTime = Date.now();
            if (currentTime - lastCheckTime >= checkInterval * 1000) {
                lastCheckTime = currentTime;
                console.log('Verificando si hay una canción en reproducción...');

                // Tomar un fragmento de audio de los últimos 10 segundos
                const fragment = acrBuffer;

                // Enviar el fragmento a ACRCloud
                const acrData = await sendBufferToAcrCloud(fragment);

                if (acrData.status.code === 0 && acrData.status.msg === 'Success') {
                    const song = acrData.metadata.music[0];
                    console.log('Canción identificada:', song.title, 'por', song.artists.map(artist => artist.name).join(', '));

                    // Mostrar toda la metadata de la canción
                    console.log('Metadata completa de la canción:', JSON.stringify(song, null, 2));

                    // Cambiar el modo a canción
                    currentMode = 'song';

                    // Puedes manejar aquí lo que deseas hacer en modo canción
                    // Por ejemplo, pausar la transcripción o simplemente informar

                } else {
                    console.log('No se detectó canción, continuando en modo podcast...');

                    // Cambiar el modo a podcast
                    currentMode = 'podcast';

                    // Continuar la transcripción sin interrupciones
                }
            }

            // Esperar un segundo antes de la siguiente iteración
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error durante el proceso:', error);
            console.log('Esperando 10 segundos antes de la siguiente verificación...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
};

// Iniciar el monitoreo
startMonitoring();