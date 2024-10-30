// GET
// ----- BALANCE OF -----
export interface IMarketinAuthRequestBody {
  message: string;
  signature: string;
}

// ----- SUCCESS & ERROR -----
export interface IResponseSuccessful {
  status: number;
  message: string;
}
export interface IResponseError {
  status: number;
  message: string;
}