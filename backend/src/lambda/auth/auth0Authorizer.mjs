import Axios from 'axios';
import jsonwebtoken from 'jsonwebtoken';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');


export async function handler(event) {
  try {
    console.log('eeevent',event)
    console.log('authorization',event.authorizationToken)
    const jwtToken =  verifyToken(event.authorizationToken);
    console.log("jwtTOken",jwtToken)
    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader);

  console.log("token --------------->",token)
  // Convert the public key from JWKS to PEM format
  const publicKey = `-----BEGIN CERTIFICATE-----
  MIIDHTCCAgWgAwIBAgIJLhpeQCtLONNRMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
  BAMTIWRldi11Nm5pNWhtcnk2dTd0Z2RlLnVzLmF1dGgwLmNvbTAeFw0yNDA4MDEx
  MTIyMjFaFw0zODA0MTAxMTIyMjFaMCwxKjAoBgNVBAMTIWRldi11Nm5pNWhtcnk2
  dTd0Z2RlLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
  ggEBAJ9lYvDqX6eMAjD2I5pL0/zRen2CcRqz7yd0Z6QfO0ujROisjDpPSGzi7K7g
  vIVGK3LVo+LBhQs0FcS+DWE5gybn043hkqWAM8MJcnRUqAdeVfgmF6M2158Ngx3m
  xuFLvrWKhw8JtPIKjNRL6d6FYJrGOCbd7EfoUkssD2Vrd7canOziG/YELtuQqEvP
  ER4O6tVTEKRYU8yolS6fgYvabXGiJM0bBZjaihmezrzZuZXEVxwLEp1lYg2os6XL
  wDKbJtZMj9SSjKYrIR61tw12q52SZ8oZ5E1cIedX2O0FspCE82F9HUGYTcq8nNE8
  yUw7Oeyvpldu5BqxnimxAwqQ5RECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
  BgNVHQ4EFgQUJgXBOrXmVfdiECJycIp5KFTs0bkwDgYDVR0PAQH/BAQDAgKEMA0G
  CSqGSIb3DQEBCwUAA4IBAQBA50At/u8dODk0Dg/3HKn/en0mujGwRhsw7wmvl0eG
  3UotuBMSQrlpF+4Yf/Dk1oN1t91o78+9359cg4h5MtQyzz9/73UYIRwKa0tCQ1JQ
  Rk1R07h5C+MO2YwnKcYTnyzZAkiRajBY5pulFVGtciKhZoeWT1ssBVAsKZDweq6x
  ra5Hw1h9u1croAQj9CIRv+Ez3MguLHG6GNKtednT20lnk+noq4dgqdI5D+JVZEyW
  urmNv1RYirlUBNqZxjThswyWiOMzLxkXDNML3KZwJDd0JE0pRPo1pO9oDeEEiFw5
  eF2FppOgDq7TmOrBftZ9jyQN6wlSlRjhXTJ9qfRuO4Is
  -----END CERTIFICATE-----`;

  try {
    return jsonwebtoken.verify(token, publicKey, { algorithms: ['RS256'] })
  } catch (error) {
    logger.error('token', error);
    throw new Error('Token verification failed');
  }
}

function getToken(authHeader) {
  console.log('authHeader',authHeader)
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}
