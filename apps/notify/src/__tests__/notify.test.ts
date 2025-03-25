import { expect, test, describe } from "@jest/globals";
import Crypto from "crypto";
import { faker } from "@faker-js/faker";
import { buildRequest } from "./test-tool";
import { generatePrivateKey } from "@repo/server/wallet";
describe("Auth Test", () => {
  const oneKey = generatePrivateKey();
  test("signup", async () => {
    const rep = await buildRequest("/auth/signup", oneKey, {});
    expect(rep.status).toBe(200);
  });
  test("signup exist", async () => {
    const rep = await buildRequest("/auth/signup", oneKey, {});
    expect(rep.status).toBe(409);
  });
  test("update nickName", async () => {
    const rep = await buildRequest("/auth/update/nickName", oneKey, {
      nickName: faker.string.nanoid(10),
    });
    expect(rep.status).toBe(200);
  });
  
  test("update userName", async () => {
    const userName = faker.string.alpha(10);
    const rep = await buildRequest("/auth/update/userName", oneKey, {
      userName: userName,
    });
    expect(rep.status).toBe(200);
  });
  test("update gender", async () => {
    const rep = await buildRequest("/auth/update/gender", oneKey, {
      gender: 1,
    });
    expect(rep.status).toBe(200);
  });
  test("update sign", async () => {
    const rep = await buildRequest("/auth/update/sign", oneKey, {
      sign: "123456",
    });
    expect(rep.status).toBe(200);
  });
  test("update avatar", async () => {
    const avatar = "https://api.dicebear.com/8.x/fun-emoji/svg?seed=" + Crypto.randomUUID()
    const rep = await buildRequest("/auth/update/avatar", oneKey, {avatar});
    expect(rep.status).toBe(200);
  });
  test("get info", async () => {
    const rep = await buildRequest("/auth/info", oneKey, {});
    expect(rep.status).toBe(200);
  });
  test('get batch', async () => {
    const rep = await buildRequest('/users/getBatchInfo', oneKey, {
      ids: [1, 2]
    })
    expect(rep.status).toBe(200);
  });
  test('find by username', async () => {
    const rep = await buildRequest('/users/findByUserName', oneKey, {
      userName: "demoxx"
    })
    expect(rep.status).toBe(200);
  });
  test("destory user", async () => {
    const rep = await buildRequest("/auth/destroy", oneKey, {});
    expect(rep.status).toBe(200);
  });
});
