import axios from 'axios';
import { Payment, PaymentStatus } from '../database/models/Payment';
import { Subscription } from '../database/models/Subscription';

export interface MpesaSTKPushRequest {
  BusinessShortCode: string;
  Password: string;
  Timestamp: string;
  TransactionType: string;
  Amount: number;
  PartyA: string;
  PartyB: string;
  PhoneNumber: string;
  CallBackURL: string;
  AccountReference: string;
  TransactionDesc: string;
}

export interface MpesaSTKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface MpesaCallbackData {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{ Name: string; Value: unknown }>;
      };
    };
  };
}

class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private businessShortCode: string;
  private passkey: string;
  private baseUrl: string;
  private callbackUrl: string;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE || '';
    this.passkey = process.env.MPESA_PASSKEY || '';
    this.baseUrl =
      process.env.MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
    this.callbackUrl = process.env.MPESA_CALLBACK_URL || '';
  }

  isConfigured(): boolean {
    return !!(
      this.consumerKey &&
      this.consumerSecret &&
      this.businessShortCode &&
      this.passkey &&
      this.callbackUrl
    );
  }

  async getAccessToken(): Promise<string> {
    const url = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    const credentials = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
    const response = await axios.get(url, {
      headers: { Authorization: `Basic ${credentials}` },
    });
    return response.data.access_token;
  }

  private generateTimestamp(): string {
    const d = new Date();
    return (
      d.getFullYear().toString() +
      ('0' + (d.getMonth() + 1)).slice(-2) +
      ('0' + d.getDate()).slice(-2) +
      ('0' + d.getHours()).slice(-2) +
      ('0' + d.getMinutes()).slice(-2) +
      ('0' + d.getSeconds()).slice(-2)
    );
  }

  private generatePassword(timestamp: string): string {
    return Buffer.from(this.businessShortCode + this.passkey + timestamp).toString('base64');
  }

  private formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('254')) return cleaned;
    if (cleaned.startsWith('0')) return '254' + cleaned.substring(1);
    if (cleaned.length === 9) return '254' + cleaned;
    return cleaned;
  }

  async initiateSTKPush(
    phoneNumber: string,
    amount: number,
    options: { subscriptionId: string; accountReference?: string; description?: string }
  ): Promise<{ payment: Payment; mpesaResponse: MpesaSTKPushResponse }> {
    if (!this.isConfigured()) {
      throw new Error('M-Pesa is not configured. Set MPESA_* env variables.');
    }
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    const accountReference = options.accountReference || 'Coltium-Auto';
    const transactionDesc = options.description || `Subscription - ${accountReference}`;

    const requestBody: MpesaSTKPushRequest = {
      BusinessShortCode: this.businessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: this.businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: this.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc,
    };

    const response = await axios.post<MpesaSTKPushResponse>(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      requestBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const mpesaResponse = response.data;

    const subscription = await Subscription.findByPk(options.subscriptionId);
    if (!subscription) throw new Error('Subscription not found');
    const userId = subscription.userId;

    const payment = await Payment.create({
      userId,
      subscriptionId: options.subscriptionId,
      amount,
      method: 'mpesa',
      status: PaymentStatus.PENDING,
      mpesaCheckoutRequestId: mpesaResponse.CheckoutRequestID,
      metadata: {
        merchantRequestId: mpesaResponse.MerchantRequestID,
        phoneNumber: formattedPhone,
        accountReference,
      },
    });

    return { payment, mpesaResponse };
  }

  async handleCallback(callbackData: MpesaCallbackData): Promise<void> {
    const { stkCallback } = callbackData.Body;
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    const payment = await Payment.findOne({
      where: { mpesaCheckoutRequestId: CheckoutRequestID },
      include: [{ model: Subscription, as: 'subscription' }],
    });

    if (!payment) {
      console.error(`Payment not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return;
    }

    if (ResultCode === 0) {
      let transactionId = '';
      let amountPaid = 0;
      let phoneNumber = '';
      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          if (item.Name === 'MpesaReceiptNumber') transactionId = String(item.Value);
          if (item.Name === 'Amount') amountPaid = Number(item.Value);
          if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
        }
      }

      await payment.update({
        status: PaymentStatus.COMPLETED,
        mpesaTransactionId: transactionId,
        metadata: {
          ...(payment.metadata as object),
          amountPaid,
          phoneNumber,
          resultDesc: ResultDesc,
        },
      });

      const sub = await Subscription.findByPk(payment.subscriptionId);
      if (sub) {
        await sub.update({
          status: 'active',
          mpesaTransactionId: transactionId,
        });
        console.log(`Subscription ${sub.id} activated via M-Pesa`);
      }
    } else {
      await payment.update({
        status: PaymentStatus.FAILED,
        metadata: {
          ...(payment.metadata as object),
          resultCode: ResultCode,
          resultDesc: ResultDesc,
        },
      });
      const sub = await Subscription.findByPk(payment.subscriptionId);
      if (sub) await sub.update({ status: 'failed' });
    }
  }

  async queryTransactionStatus(checkoutRequestId: string): Promise<{
    ResultCode?: number;
    ResultDesc?: string;
    CheckoutRequestID?: string;
  }> {
    if (!this.isConfigured()) throw new Error('M-Pesa not configured');
    const accessToken = await this.getAccessToken();
    const timestamp = this.generateTimestamp();
    const password = this.generatePassword(timestamp);
    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
      {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  }
}

export default new MpesaService();
