import * as Jimp from 'jimp';
import * as path from 'path';
import { EnvironmentParser } from '@raducualexandrumircea/environment-parser';
import * as fs from 'fs';
import * as NodeClam from 'clamscan';
import { v4 as uuidv4 } from 'uuid';

const ExifTransformer = require('exif-be-gone');

const environmentParserObj: EnvironmentParser = new EnvironmentParser();

export async function checkImageClamav(imgTmpPath: string) {
    console.time('Clamav check');
    var clamScan: NodeClam = await new NodeClam().init({
        removeInfected: false,
        debugMode: false,
        scanRecursively: false,
        clamdscan: {
            host: '', //Can t implement clamav on arm64 image available only on amd64 CLAMAV_MCS_NAME,
            port: 3310,
            timeout: 60000,
            localFallback: false,
            multiscan: true,
            active: true,
            bypassTest: false,
        },
        preference: 'clamdscan',
    });
    var { isInfected, file, viruses } = await clamScan.isInfected(imgTmpPath);
    console.log(`File is ${isInfected} with ${viruses}`);
    console.timeEnd('Clamav check');
    return isInfected;
}

export async function deleteImgTmp(imgTmpPath: string): Promise<void> {
    await fs.promises.unlink(imgTmpPath);
}

export async function saveImgTmp(imgBuffer: Buffer): Promise<string> {
    var filePath: string = environmentParserObj.get('TMP_IMAGES_LOCATION', 'string', false) || '';
    var filename: string = uuidv4();
    var finalFilePath: string = path.join(filePath, 'tmp', filename);
    var jpgBuf: Buffer = await Jimp.read(imgBuffer).then((jimpImage) => {
        return jimpImage.getBufferAsync(Jimp.MIME_JPEG);
    });
    var stream = require('stream');
    var reader = new stream.PassThrough();
    reader.end(jpgBuf);
    var writer = fs.createWriteStream(finalFilePath);
    reader.pipe(new ExifTransformer()).pipe(writer);
    await new Promise<void>((res, rej) => {
        reader.on('end', function () {
            res();
        });
    });
    return finalFilePath;
}

/* export async function deleteImage(id: number | string, signup: boolean = false): Promise<void> {
    var filePath: string = environmentParserObj.get('USER_IMAGES_LOCATION', 'string', true);
    var filename: string = generatePictureName(id, signup);
    var finalFilePath: string = path.join(filePath, filename);
    await fs.promises.unlink(finalFilePath);
}

export function checkIfImageExists(id: number | string, signup: boolean = false): boolean {
    var filePath: string = environmentParserObj.get('USER_IMAGES_LOCATION', 'string', true);
    var filename: string = generatePictureName(id, signup);
    var finalFilePath: string = path.join(filePath, filename);
    return fs.existsSync(finalFilePath);
} */

export async function saveImage(imgBuffer: Buffer, filePath: string, filename: string): Promise<string> {
    var finalFilePath: string = path.join(filePath, filename);
    var pngBuf: Buffer = await Jimp.read(imgBuffer).then((jimpImage) => {
        return jimpImage.getBufferAsync(Jimp.MIME_PNG);
    });
    var stream = require('stream');
    var reader = new stream.PassThrough();
    reader.end(pngBuf);
    var writer = fs.createWriteStream(finalFilePath);
    reader.pipe(new ExifTransformer()).pipe(writer);
    await new Promise<void>((res, rej) => {
        reader.on('end', function () {
            res();
        });
    });
    return finalFilePath;
}

/* export async function moveSignupImage(userSignupId: number, longPictureId: string): Promise<void> {
    var filePath: string = environmentParserObj.get('USER_IMAGES_LOCATION', 'string', true);
    var signupFilename: string = generatePictureName(userSignupId, true);
    var signupFilePath: string = path.join(filePath, signupFilename);
    var finalFilename: string = generatePictureName(longPictureId, false);
    var finalFilePath: string = path.join(filePath, finalFilename);
    await new Promise<void>((res, rej) => {
        fs.unlink(finalFilePath, (err) => {
            if (err) {
                console.error(err);
            }
            fs.access(finalFilePath, fs.constants.F_OK, (err) => {
                if (err) {
                    return fs.rename(signupFilePath, finalFilePath, (err) => {
                        res();
                    });
                }
                rej(err);
            });
        });
    });
}

export function readImage(id: number | string, signup: boolean = false): string {
    var filePath: string = environmentParserObj.get('USER_IMAGES_LOCATION', 'string', true);
    var filename: string = generatePictureName(id, signup);
    var finalFilePath: string = path.join(filePath, filename);
    return finalFilePath;
}

function generatePictureName(id: number | string, signup: boolean = false): string {
    var filename: string;
    if (signup) {
        filename = path.join('signup', `${id}.jpg`);
    } else {
        filename = path.join('account', `${id}.jpg`);
    }
    return filename;
} */
