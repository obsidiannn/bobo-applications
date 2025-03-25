import { createInstance } from '../req';
const getUploadPreSignUrl = async (): Promise<{
    uploadUrl: string;
    key: string;
}> => await createInstance(true).post('/sys/s3/getUploadPreSignUrl')

export default {
    getUploadPreSignUrl,
}