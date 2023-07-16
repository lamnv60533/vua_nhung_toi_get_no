import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamodbService } from 'src/dynamodb/dynamodb.service';
import axios from 'axios';
const qs = require('qs');
import { v4 as uuidv4 } from 'uuid';
import { InfraSessions, UserSession } from './models/session';
import UserAuth from './models/user';
import { JwtService } from '@nestjs/jwt';
const dynamo_table = 'guide-infra-management-sessions';
import { Response } from 'express';

export interface IFailedResponse {
  success: boolean;
  error: Object;
}

export interface ISucceedResponse {
  success: boolean;
  data: Object;
}

@Injectable()
export class AuthService {
  KEYCLOAK_BASE_URL = '';
  KEYCLOAK_REALM = '';
  KEYCLOAK_CLIENT_ID = '';
  KEYCLOAK_CALLBACK_URL = '';
  KEYCLOAK_BASIC_AUTH = '';
  constructor(
    private configService: ConfigService,
    private dynamoDBService: DynamodbService,
    private jwtService: JwtService,
  ) {
    this.KEYCLOAK_BASE_URL = this.configService.get('KEYCLOAK_BASE_URL');
    this.KEYCLOAK_REALM = this.configService.get('KEYCLOAK_REALM');
    this.KEYCLOAK_CLIENT_ID = this.configService.get('KEYCLOAK_CLIENT_ID');
    this.KEYCLOAK_CALLBACK_URL = this.configService.get(
      'KEYCLOAK_CALLBACK_URL',
    );
    this.KEYCLOAK_BASIC_AUTH = this.configService.get('KEYCLOAK_BASIC_AUTH');
  }

  async doLogin(response) {
    // create temp session and save to dynamoDB
    const code = uuidv4();

    const sessionCommand = new PutCommand({
      TableName: dynamo_table,
      Item: {
        code: code,
      },
    });
    await this.dynamoDBService.addItem(sessionCommand);
    // call to keycloak
    const KEYCLOAK_URL = `${this.KEYCLOAK_BASE_URL}/${this.KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${this.KEYCLOAK_CLIENT_ID}&redirect_uri=${this.KEYCLOAK_CALLBACK_URL}&response_type=code&scope=openid&state=${code}`;
    return response.redirect(KEYCLOAK_URL);
  }

  async verifyToken({ token }): Promise<ISucceedResponse | IFailedResponse> {
    console.log('===== ???', token);
    if (token) {
      const command = new GetCommand({
        Key: {
          code: token,
        },
        TableName: dynamo_table,
      });
      const response = (await this.dynamoDBService.get(command)) as any;
      if (response?.Item) {
        const ttl = response.exp;
        const currentTime = +new Date().getTime();
        if (ttl > currentTime) {
          return {
            success: false,
            error: {
              message: 'Token had expired.',
            },
          };
        }
        const item = response?.Item;
        const userSession: UserSession = {
          access_token: item.user_token,
          username: item.username,
          realm_access: item.realm_access,
          resource_access: item.resource_access,
          email: item.email,
        };
        return {
          success: true,
          data: userSession,
        };
      }

      return response;
    }
    return {
      success: false,
      error: {
        message: 'Token had expired.',
      },
    };
  }

  async handleLoginCallback(state: string, code: string, res: Response) {
    const getTempSessionCommnand = new GetCommand({
      Key: {
        code: state,
      },
      TableName: dynamo_table,
    });
    const tempSession = await this.dynamoDBService.get(getTempSessionCommnand);
    if (tempSession) {
      // console.log(tempSession);
    }
    let data = qs.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.KEYCLOAK_CALLBACK_URL,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${this.KEYCLOAK_BASE_URL}/${this.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${this.KEYCLOAK_BASIC_AUTH}`,
        Cookie: 'newsite=1',
      },
      data: data,
    };

    axios
      .request(config)
      .then(async (response) => {
        const accessToken = response.data.access_token;
        // console.log(accessToken);

        await this.#instropectToken(accessToken, state);
        return res.redirect('http://localhost:5555/splash?state=' + state);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async handleLoginTypePassword(user: UserAuth) {
    let data = qs.stringify({
      grant_type: 'password',
      username: user.username,
      password: user.password,
      client_id: this.KEYCLOAK_CLIENT_ID,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${this.KEYCLOAK_BASE_URL}/${this.KEYCLOAK_REALM}/protocol/openid-connect/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${this.KEYCLOAK_BASIC_AUTH}`,
        Cookie: 'newsite=1',
      },
      data: data,
    };

    const resutl = await axios.request(config).catch((error) => {
      console.log(error);
    });
    const { session_state, access_token } = (resutl as any)?.data;
    if (access_token) {
      return this.#instropectToken(access_token, session_state);
    } else {
      return {
        code: 400,
        message: 'Access token is required',
      };
    }
  }

  async #instropectToken(accessToken: string, state) {
    let data = qs.stringify({
      token: accessToken,
    });

    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${this.KEYCLOAK_BASE_URL}/${this.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${this.KEYCLOAK_BASIC_AUTH}`,
      },
      data: data,
    };

    const result = await axios
      .request(config)

      .catch((error) => {
        console.log(error);
      });
    const sessionData = (result as any).data as InfraSessions;

    const userToken = await this.#generateJwtSession({
      id: sessionData.email,
    });

    const sessionCommand = new PutCommand({
      TableName: dynamo_table,
      Item: {
        code: state,
        ...sessionData,
        access_token: accessToken,
        user_token: userToken,
      },
    });

    const userSession: UserSession = {
      access_token: accessToken,
      username: sessionData.username,
      realm_access: sessionData.realm_access,
      resource_access: sessionData.resource_access,
      email: sessionData.email,
    };
    await this.dynamoDBService.addItem(sessionCommand);

    return userSession;
  }

  async #generateJwtSession(payload) {
    return await this.jwtService.signAsync(payload, { expiresIn: '3d' });
  }
}
