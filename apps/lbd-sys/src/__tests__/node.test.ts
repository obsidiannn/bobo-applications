import { expect, describe,it } from "@jest/globals";
import { buildRequest } from "./test-tool";
describe("nodes", () => {
  it("get nodes",async () => {
    const rep = await buildRequest("/sys/nodes/getLists");
    expect(rep.status).toBe(200);
  })
});
