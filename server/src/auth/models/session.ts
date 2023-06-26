export interface InfraSessions {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  email: string;
  email_verified: boolean;
  realm_access: RealmAccess;
  resource_access: ResourceAccess;
  scope: string;
  sid: string;
  client_id: string;
  username: string;
  active: boolean;
  access_token: string;
}

export interface UserSession {
  access_token: string;
  username: string;
  realm_access: RealmAccess;
  resource_access: ResourceAccess;
  email: string;
}

export interface RealmAccess {
  roles: string[];
}

export interface ResourceAccess {
  account: Account;
}

export interface Account {
  roles: string[];
}
