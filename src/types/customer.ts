import type { StoredAddress } from "./order";

export type CustomerProfile = {
  fullName: string;
  whatsapp: string;
  cpf: string;
};

export type CustomerAccount = {
  id: string;
  email: string;
  profile: CustomerProfile;
  address: StoredAddress;
  createdAt: string;
  updatedAt: string;
};

export type CustomerSession = {
  account: CustomerAccount;
  expiresAt: string;
};
