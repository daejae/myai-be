import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LambdaFunctions } from './lambda-functions.enum';

@Injectable()
export class LambdaService {
  private lambdaClient: LambdaClient;

  constructor(private readonly configService: ConfigService) {
    this.lambdaClient = new LambdaClient(configService.get('aws'));
  }

  async invokeFunction(functionName: LambdaFunctions) {
    const command = new InvokeCommand({
      FunctionName: functionName,
    });

    try {
      const response = await this.lambdaClient.send(command);
      const responsePayload = Buffer.from(response.Payload).toString();
      return JSON.parse(responsePayload);
    } catch (error) {
      throw new Error(`Error invoking Lambda function: ${error.message}`);
    }
  }
}
