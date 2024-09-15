// Importaciones necesarias
import { SpeechClient } from '@google-cloud/speech';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import FormData from 'form-data';
import crypto from 'crypto';
import axios from 'axios';
import stream from 'stream';

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
const googleCredentialsPath = 'secrets/key.json'; // Reemplaza con la ruta a tus credenciales

// Inicializar el cliente de Google Cloud Speech
const client = new SpeechClient({ keyFilename: googleCredentialsPath });

// Variables para el archivo de subtítulos
let subtitleCounter = 1;
let subtitleStream;

const captureAudio = (streamUrl, duration = 10, outputPath = 'output.mp3') => {
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

const startGoogleSpeechStream = () => {
    console.log('Iniciando transcripción en tiempo real con Google Speech-to-Text...');

    // Crear o sobreescribir el archivo de subtítulos
    subtitleStream = fs.createWriteStream('subtitles.srt');
    subtitleCounter = 1; // Reiniciar el contador de subtítulos

    const request = {
        config: {
            encoding: 'MP3',
            sampleRateHertz: 44100,
            languageCode: 'es-ES',
            enableWordTimeOffsets: true, // Habilitar tiempos de palabras
            enableAutomaticPunctuation: true, // Agregar puntuación automática
        },
        interimResults: false,
    };

    const recognizeStream = client
        .streamingRecognize(request)
        .on('error', (error) => {
            console.error('Error en el streaming de Google Speech-to-Text:', error);
        })
        .on('data', (data) => {
            if (data.results[0] && data.results[0].alternatives[0]) {
                const result = data.results[0];
                const alternative = result.alternatives[0];

                // Obtener tiempos de inicio y fin
                const words = alternative.words;
                const startTime = words[0].startTime;
                const endTime = words[words.length - 1].endTime;

                // Formatear tiempos en formato SRT
                const formatTime = (time) => {
                    const seconds = parseInt(time.seconds || 0, 10) + parseFloat(time.nanos || 0) / 1e9;
                    const date = new Date(seconds * 1000);
                    const hours = String(date.getUTCHours()).padStart(2, '0');
                    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                    const secs = String(date.getUTCSeconds()).padStart(2, '0');
                    const millis = String(Math.floor(date.getUTCMilliseconds())).padStart(3, '0');
                    return `${hours}:${minutes}:${secs},${millis}`;
                };

                const srtSegment = `${subtitleCounter}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${alternative.transcript.trim()}\n\n`;

                // Escribir en el archivo de subtítulos
                subtitleStream.write(srtSegment);
                subtitleCounter++;

                console.log(`Transcripción: ${alternative.transcript.trim()}`);
            }
        })
        .on('end', () => {
            subtitleStream.end();
            console.log('Transcripción completada. Archivo de subtítulos generado.');
        });

    return recognizeStream;
};

const startMonitoring = async () => {
    let currentMode = 'song'; 
    let checkInterval = 60; 
    let lastCheckTime = Date.now();

    while (true) {
        try {
            if (currentMode === 'song') {
                console.log('Capturando fragmento de audio para identificar la canción...');
                const audioFilePath = await captureAudio(streamUrl, 10);
                if (!fs.existsSync(audioFilePath)) {
                    throw new Error('No se pudo capturar el fragmento de audio');
                }

                console.log('Enviando fragmento de audio a ACRCloud...');
                const acrData = await sendToAcrCloud(audioFilePath);

                if (acrData.status.code === 0 && acrData.status.msg === 'Success') {
                    const song = acrData.metadata.music[0];
                    console.log('Canción identificada:', song.title, 'por', song.artists.map(artist => artist.name).join(', '));

                    const songDuration = parseFloat(song.duration_ms) / 1000;
                    const currentPosition = parseFloat(song.play_offset_ms) / 1000;
                    const timeRemaining = songDuration - currentPosition;

                    fs.unlinkSync(audioFilePath);
                    console.log('Archivo de audio temporal eliminado.');

                    if (!isNaN(timeRemaining) && timeRemaining > 0) {
                        console.log(`Tiempo restante de la canción: ${timeRemaining.toFixed(2)} segundos`);
                        await new Promise(resolve => setTimeout(resolve, timeRemaining * 1000));
                    } else {
                        console.log('Error en el cálculo del tiempo restante. Esperando 10 segundos por defecto.');
                        await new Promise(resolve => setTimeout(resolve, 10000));
                    }
                } else {
                    console.log('No se pudo identificar la canción, cambiando a modo podcast...');
                    // Iniciar la transcripción en tiempo real
                    const recognizeStream = startGoogleSpeechStream();

                    // Capturar el audio y enviarlo al stream de Google
                    const ffmpegProcess = ffmpeg(streamUrl)
                        .format('mp3')
                        .on('error', (error) => {
                            console.error('Error al capturar audio para Google Speech-to-Text:', error);
                        })
                        .pipe();

                    ffmpegProcess.on('data', (chunk) => {
                        recognizeStream.write(chunk);
                    });

                    ffmpegProcess.on('end', () => {
                        recognizeStream.end();
                        console.log('Captura de audio finalizada.');
                    });

                    // Guardar el proceso y el stream para poder cerrarlos después
                    currentMode = {
                        mode: 'podcast',
                        recognizeStream,
                        ffmpegProcess,
                    };
                }
            } else if (currentMode.mode === 'podcast') {
                // Comprobar si es momento de verificar con ACRCloud
                const currentTime = Date.now();
                if (currentTime - lastCheckTime >= checkInterval * 1000) {
                    lastCheckTime = currentTime;
                    console.log('Verificando si hay una canción en reproducción...');

                    // Capturar un fragmento de audio para enviar a ACRCloud
                    const tempFilePath = 'check_audio.mp3';
                    await captureAudio(streamUrl, 10, tempFilePath);

                    const acrData = await sendToAcrCloud(tempFilePath);
                    fs.unlinkSync(tempFilePath);
                    console.log('Archivo temporal de verificación eliminado.');

                    if (acrData.status.code === 0 && acrData.status.msg === 'Success') {
                        console.log('Se ha detectado una canción, cambiando a modo canción...');
                        // Detener la transcripción en tiempo real
                        currentMode.recognizeStream.end();
                        currentMode.ffmpegProcess.destroy();

                        // Cerrar el archivo de subtítulos
                        subtitleStream.end();
                        console.log('Archivo de subtítulos cerrado.');

                        // Cambiar el modo
                        currentMode = 'song';
                    } else {
                        console.log('Continúa el podcast, seguimos en modo podcast.');
                    }
                }

                // Esperar un breve periodo antes de la siguiente iteración
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            console.error('Error durante el proceso:', error);
            console.log('Esperando 10 segundos antes de la siguiente captura...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
};

startMonitoring();
