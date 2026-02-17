import crypto from "crypto";

export const hashIP = (ip) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};
