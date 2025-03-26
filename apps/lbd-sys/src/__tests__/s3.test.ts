import { expect, it, describe } from '@jest/globals';
import { buildRequest } from './test-tool';
describe("s3", () => {
    it("s3 pre sign url", async () => {
        const rep = await buildRequest('/sys/s3/getUploadPreSignUrl')
        expect(rep.status).toBe(200)
    })
})