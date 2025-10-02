import * as fs from "node:fs";
import * as path from "node:path";
import { execSync } from "node:child_process";

const scriptPath = path.join(__dirname, "..", "strip-jsonc.ts");
const tempDir = path.join(__dirname, "temp");

beforeAll(() => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
});

afterAll(() => {
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe("strip-jsonc.ts", () => {
  it("한줄 주석 제거", () => {
    const input = `{
  "name": "test", // 한줄 주석
  "value": 123
}`;
    const expected = `{
  "name": "test",
  "value": 123
}`;
    
    const tempFile = path.join(tempDir, "test1.jsonc");
    fs.writeFileSync(tempFile, input);
    
    const result = execSync(`npx tsx ${scriptPath} ${tempFile}`, { encoding: "utf8" });
    expect(JSON.parse(result)).toEqual(JSON.parse(expected));
  });

  it("블록 주석 제거", () => {
    const input = `{
  /* 블록 주석 */
  "name": "test",
  "value": /* 인라인 블록 주석 */ 123
}`;
    const expected = `{
  "name": "test",
  "value": 123
}`;
    
    const tempFile = path.join(tempDir, "test2.jsonc");
    fs.writeFileSync(tempFile, input);
    
    const result = execSync(`npx tsx ${scriptPath} ${tempFile}`, { encoding: "utf8" });
    expect(JSON.parse(result)).toEqual(JSON.parse(expected));
  });

  it("잘못된 JSONC 실패 케이스", () => {
    const input = `{
  "name": "test",
  "value": 123,
  // 마지막 쉼표로 인한 오류
}`;
    
    const tempFile = path.join(tempDir, "invalid.jsonc");
    fs.writeFileSync(tempFile, input);
    
    expect(() => {
      execSync(`npx tsx ${scriptPath} ${tempFile}`, { encoding: "utf8" });
    }).toThrow();
  });

  it("파일이 존재하지 않을 때 오류", () => {
    expect(() => {
      execSync(`npx tsx ${scriptPath} nonexistent.jsonc`, { encoding: "utf8" });
    }).toThrow();
  });
});
