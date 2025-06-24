import jwt from "jsonwebtoken";

export const generateAccessToken = (id: string) => {
  return jwt.sign({ id: id }, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: "15m",
  });
};
export const generateRefreshToken = (id: string) => {
  return jwt.sign({ id: id }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: "7d",
  });
};
