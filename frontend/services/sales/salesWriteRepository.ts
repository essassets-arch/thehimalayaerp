export interface WriteRequestOptions {
  idempotencyKey: string;
}

export interface SalesWriteRepository {
  createOrder(
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  convertQuotationToOrder(
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  attachCustomerPo(
    orderId: string,
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  runCreditCheck(
    orderId: string,
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  approveCreditException(
    orderId: string,
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  confirmOrder(
    orderId: string,
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  sendToPlantHead(
    orderId: string,
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  cancelOrder(
    orderId: string,
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  raiseCustomerComplaint(
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  requestReturn(
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;

  requestReplacement(
    input: any,
    options: WriteRequestOptions,
  ): Promise<any>;
}
