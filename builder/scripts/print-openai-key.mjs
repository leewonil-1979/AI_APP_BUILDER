// builder/scripts/print-openai-key.mjs
const v = process.env.OPENAI_API_KEY || "missing";
console.log(v.slice(0, 10) + "...");
