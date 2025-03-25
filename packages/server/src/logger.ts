import * as path from "path";
import pino from "pino";
import * as rfs from 'rotating-file-stream';


export default (filename: string) => {
    const stream = rfs.createStream(filename, {
        size: "10M",
        interval: "1d",
        compress: "gzip",
        path: path.resolve('logs/'),
    });
    return pino({
        level: 'debug',
    }, stream);
};